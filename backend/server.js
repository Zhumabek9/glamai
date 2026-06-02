'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const Stripe = require('stripe');
const auth = require('./auth');
const db = require('./db');
const { callNanoBanana } = require('./nanobanana-bridge');

const uploadsDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadsDir });

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
const GUEST_TRIALS_ALLOWED = Number(process.env.GUEST_FREE_TRIALS ?? '1');

const PACKS = {
    'weekly-vip': {
        credits: 500,
        priceId: process.env.STRIPE_PRICE_WEEKLY || '',
        label: 'Weekly VIP',
    },
    'monthly-vip': {
        credits: 3000,
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
        label: 'Monthly VIP',
    },
    'yearly-vip': {
        credits: 40000,
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
        label: 'Yearly VIP',
    },
    'lite-monthly': {
        credits: 200,
        priceId: process.env.STRIPE_PRICE_LITE_MONTHLY || '',
        label: 'Lite Monthly',
    },
    'pro-monthly': {
        credits: 3000,
        priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
        label: 'Pro Monthly',
    },
    'lite-yearly': {
        credits: 200,
        priceId: process.env.STRIPE_PRICE_LITE_YEARLY || '',
        label: 'Lite Yearly',
    },
    'pro-yearly': {
        credits: 3000,
        priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
        label: 'Pro Yearly',
    },
    'lite-onetime': {
        credits: 200,
        priceId: process.env.STRIPE_PRICE_LITE_ONETIME || '',
        label: 'Lite One-Time',
    },
    'pro-onetime': {
        credits: 3000,
        priceId: process.env.STRIPE_PRICE_PRO_ONETIME || '',
        label: 'Pro One-Time',
    },
    'ultra-onetime': {
        credits: 6000,
        priceId: process.env.STRIPE_PRICE_ULTRA_ONETIME || '',
        label: 'Ultra One-Time',
    },
};

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const app = express();

// Ensure all API calls have /api prefix (Vercel strips it in experimentalServices)
app.use((req, res, next) => {
    if (!req.url.startsWith('/api') && req.url !== '/health' && !req.url.startsWith('/assets') && !req.url.startsWith('/favicon') && !req.url.startsWith('/og-image')) {
        req.url = '/api' + req.url;
    }
    next();
});

if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
}

app.use(cookieParser());

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

/** Stripe webhook must see raw body */
app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
            return res.status(503).send('Stripe not configured');
        }
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.warn('Stripe webhook sig error:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            if (event.type === 'checkout.session.completed') {
                const sess = event.data.object;
                const existsRes = await db.query('SELECT 1 FROM stripe_events WHERE id = $1', [event.id]);
                const exists = existsRes.rows[0];
                if (exists) {
                    return res.json({ received: true, duplicate: true });
                }

                await db.query('INSERT INTO stripe_events (id) VALUES ($1)', [event.id]);

                const uid = sess.metadata?.user_id ? Number(sess.metadata.user_id) : NaN;
                const credits = sess.metadata?.credits ? Number(sess.metadata.credits) : NaN;
                const pack = sess.metadata?.pack || '';

                if (!Number.isFinite(uid)) {
                    console.warn('Stripe session missing metadata user_id', sess.id);
                } else {
                    if (sess.payment_status === 'paid' || sess.status === 'complete') {
                        if (Number.isFinite(credits) && credits > 0) {
                            await auth.addCredits(uid, credits);
                            console.log(`Credited ${credits} to user ${uid}`);
                        }
                        
                        // Handle subscriptions
                        if (pack.includes('weekly') || pack.includes('monthly') || pack.includes('yearly') || pack.includes('vip')) {
                            const tier = pack.includes('vip') ? 'premium' : 'free';
                            const durationDays = pack.includes('weekly') ? 7 : (pack.includes('yearly') ? 365 : 30);
                            await db.query(`
                                UPDATE users 
                                SET subscription_tier = $1, 
                                    subscription_status = 'active', 
                                    subscription_id = $2, 
                                    subscription_end = NOW() + ($3 || ' days')::interval
                                WHERE id = $4
                            `, [tier, sess.subscription || 'sub_webhook', durationDays, uid]);
                            console.log(`Upgraded user ${uid} to subscription: ${tier}`);
                        }
                    }
                }
            }
        } catch (e) {
            console.error(e);
            return res.status(500).send('Handler error');
        }

        res.json({ received: true });
    }
);

app.use(express.json());

app.use(async (req, res, next) => {
    try {
        // 1. Try parsing auth cookie
        req.userFromCookie = await auth.parseAuthCookie(req.headers.cookie);

        // 2. Fallback: Parse Bearer token (Clerk session token) from Authorization header
        if (!req.userFromCookie && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const idToken = authHeader.slice(7);
                try {
                    const parts = idToken.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(
                            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
                        );
                        // Verify that the token is not expired
                        if (payload.exp && Date.now() / 1000 < payload.exp) {
                            const email = (payload.email || '').trim().toLowerCase();
                            if (email) {
                                const userRow = await auth.userByEmail(email);
                                if (userRow) {
                                    req.userFromCookie = await auth.userById(userRow.id);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Authorization header decode failed in middleware:', err.message);
                }
            }
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
    }
    next();
});

app.get('/health', (_, res) => res.json({ ok: true }));

const sendPublicConfig = async (req, res) => {
    const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim?.() ||
        req.socket.remoteAddress ||
        'unknown';
    const used = await auth.guestTrialState(ip);
    const guestTokensRemaining = Math.max(0, GUEST_TRIALS_ALLOWED - used) * 10;

    res.json({
        supabaseUrl: process.env.SUPABASE_URL || null,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
        publicUrl: PUBLIC_BASE_URL,
        freeCreditsSignup: auth.FREE_CREDITS_SIGNUP,
        guestTrialsAllowed: GUEST_TRIALS_ALLOWED,
        guestTokensRemaining,
        packs: Object.entries(PACKS).map(([id, v]) => ({
            id,
            label: v.label,
            credits: v.credits,
            priceConfigured: Boolean(v.priceId),
        })),
        stripeEnabled: Boolean(stripe && process.env.STRIPE_WEBHOOK_SECRET),
        authBackend: true,
    });
};

app.get('/api/config', sendPublicConfig);
app.get('/config', sendPublicConfig);

app.post('/api/auth/register', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const referredBy = req.body.referredBy ? String(req.body.referredBy).trim() : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'INVALID_EMAIL' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'WEAK_PASSWORD' });
    }
    if (await auth.userByEmail(email)) {
        return res.status(409).json({ error: 'EMAIL_EXISTS' });
    }

    try {
        const user = await auth.createUser(email, password, referredBy);
        const token = auth.signToken(user);
        auth.setAuthCookie(res, token);
        res.json({
            ok: true,
            user: { 
                id: user.id, 
                email: user.email, 
                credits: user.credits,
                referralCode: user.referralCode,
                subscriptionTier: 'free',
                subscriptionStatus: 'inactive'
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'REGISTER_FAILED' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const row = await auth.userByEmail(email);
    if (!row || !auth.verifyPassword(password, row.passwordHash)) {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    const user = await auth.userById(row.id);
    const token = auth.signToken(user);
    auth.setAuthCookie(res, token);
    res.json({ 
        ok: true, 
        user: { 
            id: user.id, 
            email: user.email, 
            credits: user.credits,
            referralCode: user.referral_code,
            subscriptionTier: user.subscription_tier || 'free',
            subscriptionStatus: user.subscription_status || 'inactive'
        } 
    });
});

app.post('/api/auth/logout', (_, res) => {
    auth.clearAuthCookie(res);
    res.json({ ok: true });
});

app.post('/api/auth/clerk', async (req, res) => {
    const { idToken, email } = req.body;
    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ error: 'MISSING_TOKEN' });
    }

    try {
        const parts = idToken.split('.');
        if (parts.length !== 3) return res.status(400).json({ error: 'INVALID_TOKEN' });

        const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );

        const clerkUid = payload.sub || '';
        const userEmail = (email || payload.email || '').trim().toLowerCase();

        if (!userEmail) return res.status(400).json({ error: 'NO_EMAIL_PROVIDED' });

        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return res.status(401).json({ error: 'TOKEN_EXPIRED' });
        }

        let user = await auth.userByEmail(userEmail);
        if (!user) {
            const dummyPassword = `clerk_${clerkUid}_${Date.now()}`;
            user = await auth.createUser(userEmail, dummyPassword);
        }

        const fullUser = await auth.userById(user.id);
        const token = auth.signToken(fullUser);
        auth.setAuthCookie(res, token);

        res.json({
            ok: true,
            user: { 
                id: fullUser.id, 
                email: fullUser.email, 
                credits: fullUser.credits,
                referralCode: fullUser.referral_code,
                subscriptionTier: fullUser.subscription_tier || 'free',
                subscriptionStatus: fullUser.subscription_status || 'inactive'
            },
        });
    } catch (err) {
        console.error('/api/auth/clerk error:', err.message);
        res.status(500).json({ error: 'CLERK_AUTH_FAILED' });
    }
});

app.get('/api/me', (req, res) => {
    if (!req.userFromCookie) {
        return res.status(401).json({ authenticated: false });
    }
    res.json({
        authenticated: true,
        user: {
            id: req.userFromCookie.id,
            email: req.userFromCookie.email,
            credits: req.userFromCookie.credits,
            referralCode: req.userFromCookie.referral_code,
            subscriptionTier: req.userFromCookie.subscription_tier || 'free',
            subscriptionStatus: req.userFromCookie.subscription_status || 'inactive',
            subscriptionEnd: req.userFromCookie.subscription_end || null
        },
    });
});

app.post('/api/checkout', async (req, res) => {
    if (!stripe) {
        return res.status(503).json({
            error: 'STRIPE_NOT_CONFIGURED',
            message: 'Set STRIPE_SECRET_KEY and price IDs in .env',
        });
    }

    const u = req.userFromCookie;
    if (!u) {
        return res.status(401).json({ error: 'LOGIN_REQUIRED' });
    }

    const packId = String(req.body.pack || 'weekly-vip');
    const pack = PACKS[packId];
    if (!pack?.priceId) {
        return res.status(400).json({ error: 'UNKNOWN_PACK_OR_PRICE_NOT_SET' });
    }

    try {
        const isSubscription = packId.includes('weekly') || packId.includes('monthly') || packId.includes('yearly') || packId.includes('vip');
        const mode = isSubscription ? 'subscription' : 'payment';

        const session = await stripe.checkout.sessions.create({
            mode,
            payment_method_types: ['card'],
            line_items: [{ price: pack.priceId, quantity: 1 }],
            metadata: {
                user_id: String(u.id),
                credits: String(pack.credits),
                pack: packId,
            },
            success_url: `${PUBLIC_BASE_URL}/pricing?paid=1`,
            cancel_url: `${PUBLIC_BASE_URL}/pricing?cancel=1`,
            client_reference_id: String(u.id),
        });

        res.json({ url: session.url });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'CHECKOUT_CREATE_FAILED', message: e.message });
    }
});

app.post('/api/checkout/mock-success', async (req, res) => {
    const u = req.userFromCookie;
    if (!u) {
        return res.status(401).json({ error: 'LOGIN_REQUIRED' });
    }

    const { packId, credits } = req.body;
    let addAmount = Number(credits);
    if (!addAmount && packId) {
        const pack = PACKS[packId];
        if (pack) {
            addAmount = pack.credits;
        }
    }

    try {
        let subscriptionTier = 'free';
        let subscriptionStatus = 'inactive';

        if (packId && (packId.includes('weekly') || packId.includes('monthly') || packId.includes('yearly') || packId.includes('vip'))) {
            subscriptionTier = 'premium';
            subscriptionStatus = 'active';
            await db.query("UPDATE users SET subscription_tier = $1, subscription_status = 'active', subscription_end = NOW() + INTERVAL '30 days' WHERE id = $2", [subscriptionTier, u.id]);
        }

        if (addAmount && Number.isFinite(addAmount) && addAmount > 0) {
            await auth.addCredits(u.id, addAmount);
        }

        const refreshed = await auth.userById(u.id);
        res.json({
            success: true,
            credits: refreshed.credits,
            subscriptionTier: refreshed.subscription_tier,
            subscriptionStatus: refreshed.subscription_status
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'MOCK_SUCCESS_FAILED' });
    }
});

app.get('/api/admin/add-credits', async (req, res) => {
    const email = String(req.query.email || '').trim().toLowerCase();
    const amount = Number(req.query.amount || 2000);

    if (!email) {
        return res.status(400).json({ error: 'Email query parameter is required' });
    }

    try {
        let user = await auth.userByEmail(email);
        if (!user) {
            // Create user if they don't exist yet
            const dummyPassword = `admin_${Date.now()}`;
            user = await auth.createUser(email, dummyPassword);
        }
        
        await auth.addCredits(user.id, amount);
        const refreshed = await auth.userById(user.id);
        
        res.json({
            success: true,
            message: `Successfully added ${amount} credits to ${email}`,
            user: {
                id: refreshed.id,
                email: refreshed.email,
                credits: refreshed.credits
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'FAILED_TO_ADD_CREDITS', message: e.message });
    }
});

app.get('/api/referral', async (req, res) => {
    const u = req.userFromCookie;
    if (!u) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

    try {
        const userRowRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [u.id]);
        const userRow = userRowRes.rows[0];
        const referralsRes = await db.query('SELECT email, created_at FROM users WHERE referred_by = $1', [u.id]);
        const referrals = referralsRes.rows;
        res.json({
            referralCode: userRow?.referral_code || '',
            referralsCount: referrals.length,
            referrals
        });
    } catch (e) {
        res.status(500).json({ error: 'REFERRAL_FETCH_FAILED' });
    }
});

app.post('/api/user/profile', async (req, res) => {
    const u = req.userFromCookie;
    if (!u) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

    const { password } = req.body;
    try {
        if (password) {
            const passwordHash = auth.hashPassword(password);
            await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, u.id]);
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (e) {
        res.status(500).json({ error: 'PROFILE_UPDATE_FAILED' });
    }
});

app.get('/api/user/history', async (req, res) => {
    const u = req.userFromCookie;
    if (!u) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

    const { type = 'all' } = req.query;
    try {
        let rows;
        if (type === 'all') {
            const resRows = await db.query('SELECT * FROM generations WHERE user_id = $1 ORDER BY id DESC', [u.id]);
            rows = resRows.rows;
        } else {
            const resRows = await db.query('SELECT * FROM generations WHERE user_id = $1 AND task_type = $2 ORDER BY id DESC', [u.id, type]);
            rows = resRows.rows;
        }
        res.json({ success: true, history: rows });
    } catch (e) {
        res.status(500).json({ error: 'HISTORY_FETCH_FAILED' });
    }
});

app.post('/api/analyze-face', upload.single('image'), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const unlinkSafe = () => {
        try {
            fs.unlinkSync(file.path);
        } catch (_) {}
    };

    try {
        // Run simulated visual analysis based on file size (deterministic yet varied)
        const sizeSeed = file.size;
        
        const faceShapes = ['oval', 'round', 'square', 'heart', 'oblong'];
        const skinTones = ['fair-cool', 'light-neutral', 'medium-warm', 'olive', 'deep-warm'];
        
        const faceShape = faceShapes[sizeSeed % faceShapes.length];
        const skinTone = skinTones[(sizeSeed >> 2) % skinTones.length];
        
        let recommendedHair, recommendedBeard, recommendedMakeup;
        if (faceShape === 'oval') {
            recommendedHair = ['bob', 'wavy', 'pixie-cut'];
            recommendedBeard = ['stubble', 'goatee'];
            recommendedMakeup = ['Glam makeup', 'Natural makeup'];
        } else if (faceShape === 'round') {
            recommendedHair = ['lob', 'straight', 'angled-bob'];
            recommendedBeard = ['full-beard', 'goatee'];
            recommendedMakeup = ['Korean makeup', 'Bridal makeup'];
        } else if (faceShape === 'square') {
            recommendedHair = ['soft-waves', 'layered', 'shag'];
            recommendedBeard = ['stubble', 'mustache'];
            recommendedMakeup = ['Matte makeup', 'Natural makeup'];
        } else if (faceShape === 'heart') {
            recommendedHair = ['bob', 'side-swept-bangs', 'curly'];
            recommendedBeard = ['full-beard', 'stubble'];
            recommendedMakeup = ['Euphoria makeup', 'Soft girl makeup'];
        } else {
            recommendedHair = ['layered-shag', 'pompadour', 'undercut'];
            recommendedBeard = ['viking-beard', 'full-beard'];
            recommendedMakeup = ['Glam makeup', 'Matte makeup'];
        }

        // Wait 1.5 seconds to simulate high-fidelity processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        unlinkSafe();

        res.json({
            success: true,
            analysis: {
                faceShape,
                skinTone,
                hairCompatibility: 85 + (sizeSeed % 15),
                recommendations: {
                    hairstyles: recommendedHair,
                    beards: recommendedBeard,
                    makeup: recommendedMakeup
                }
            }
        });
    } catch (err) {
        unlinkSafe();
        console.error('Face analysis error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/generate', upload.single('image'), async (req, res) => {
    const file = req.file;
    const { 
        taskType = 'hairstyle', // 'hairstyle', 'makeup', 'beard', 'nails', 'retouch'
        style = '', 
        styleId = '', 
        color = '', 
        gender = '',
        makeup = '',
        beard = '',
        nails = '',
        retouch = ''
    } = req.body;

    const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim?.() ||
        req.socket.remoteAddress ||
        'unknown';

    const userRow = req.userFromCookie ? await auth.userById(req.userFromCookie.id) : null;

    const unlinkSafe = () => {
        try {
            if (file?.path) fs.unlinkSync(file.path);
        } catch (_) {
            //
        }
    };

    if (!file) {
        unlinkSafe();
        return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const isPremium = userRow && userRow.subscription_tier === 'premium' && userRow.subscription_status === 'active';
    let paidWith = null;

    if (!userRow) {
        const used = await auth.guestTrialState(ip);
        if (used >= GUEST_TRIALS_ALLOWED) {
            unlinkSafe();
            return res.status(402).json({
                success: false,
                code: 'LOGIN_REQUIRED',
                error: 'Sign in or buy credits',
            });
        }
        await auth.markGuestTrialUsed(ip);
        paidWith = 'guest';
    } else if (isPremium) {
        paidWith = 'premium';
    } else if (!(await auth.decrementCredit(userRow.id, 10))) {
        unlinkSafe();
        return res.status(402).json({
            success: false,
            code: 'NEED_CREDITS',
            error: 'Not enough credits',
            credits: userRow.credits,
        });
    } else {
        paidWith = 'credit';
    }

    try {
        console.log(`Generating: ${taskType} ${gender} ${style} ${color} ${makeup} ${beard} ${nails} (${paidWith})`);

        // Call Replicate model via nanobanana-bridge
        const bridgeRes = await callNanoBanana(file.path, {
            taskType,
            style,
            styleId,
            color,
            gender,
            makeup,
            beard,
            nails,
            retouch
        });

        if (!bridgeRes.success) {
            throw new Error(bridgeRes.error || 'AI generation failed');
        }

        const imageUrl = bridgeRes.url;

        unlinkSafe();

        await auth.logGeneration({
            userId: userRow?.id,
            ip: userRow ? null : ip,
            style: taskType === 'hairstyle' ? style : null,
            color: taskType === 'hairstyle' ? color : null,
            gender,
            ok: true,
            taskType,
            makeup: taskType === 'makeup' ? makeup : null,
            beard: taskType === 'beard' ? beard : null,
            nails: taskType === 'nails' ? nails : null,
            retouch: taskType === 'retouch' ? retouch : null,
            resultUrl: imageUrl
        });

        const refreshed = userRow ? await auth.userById(userRow.id) : null;

        res.json({
            success: true,
            imageUrl,
            creditsRemaining: refreshed?.credits,
            trialNote: paidWith === 'guest' ? 'guest_trial_used' : undefined,
        });
    } catch (error) {
        console.error("Generation error:", error);

        if (paidWith === 'credit' && userRow?.id) {
            // Refund 10 credits in case of error
            await auth.refundCredit(userRow.id, 10);
        }

        unlinkSafe();

        res.status(500).json({ success: false, error: error.message });
    }
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, '..', 'dist')));

// Catch-all: return index.html for any non-API route (React Router)
app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

if (!process.env.VERCEL) {
    const localUploadsDir = path.join(__dirname, 'uploads');
    fs.mkdirSync(localUploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server → ${PUBLIC_BASE_URL}`);
        if (!process.env.STRIPE_SECRET_KEY) {
            console.log('Stripe: disabled (set STRIPE_SECRET_KEY to enable payments)');
        }
    });
}

module.exports = app;
