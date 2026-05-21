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
const { db } = require('./db');
const { callNanoBanana } = require('./nanobanana-bridge');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
const GUEST_TRIALS_ALLOWED = Number(process.env.GUEST_FREE_TRIALS ?? '1');

const PACKS = {
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
                const exists = db.prepare('SELECT 1 FROM stripe_events WHERE id = ?').get(event.id);
                if (exists) {
                    return res.json({ received: true, duplicate: true });
                }

                db.prepare('INSERT INTO stripe_events (id) VALUES (?)').run(event.id);

                const uid = sess.metadata?.user_id ? Number(sess.metadata.user_id) : NaN;
                const credits = sess.metadata?.credits ? Number(sess.metadata.credits) : NaN;
                if (!Number.isFinite(uid) || !Number.isFinite(credits)) {
                    console.warn('Stripe session missing metadata', sess.id);
                } else if (sess.payment_status === 'paid' || sess.status === 'complete') {
                    auth.addCredits(uid, credits);
                    console.log(`Credited ${credits} to user ${uid}`);
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

app.use((req, res, next) => {
    req.userFromCookie = auth.parseAuthCookie(req.headers.cookie);
    next();
});

app.get('/health', (_, res) => res.json({ ok: true }));

const sendPublicConfig = (_, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL || null,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
        publicUrl: PUBLIC_BASE_URL,
        freeCreditsSignup: auth.FREE_CREDITS_SIGNUP,
        guestTrialsAllowed: GUEST_TRIALS_ALLOWED,
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

app.post('/api/auth/register', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'INVALID_EMAIL' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'WEAK_PASSWORD' });
    }
    if (auth.userByEmail(email)) {
        return res.status(409).json({ error: 'EMAIL_EXISTS' });
    }

    try {
        const user = auth.createUser(email, password);
        const token = auth.signToken(user);
        auth.setAuthCookie(res, token);
        res.json({
            ok: true,
            user: { id: user.id, email: user.email, credits: user.credits },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'REGISTER_FAILED' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const row = auth.userByEmail(email);
    if (!row || !auth.verifyPassword(password, row.passwordHash)) {
        return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    const user = auth.userById(row.id);
    const token = auth.signToken(user);
    auth.setAuthCookie(res, token);
    res.json({ ok: true, user: { id: user.id, email: user.email, credits: user.credits } });
});

app.post('/api/auth/logout', (_, res) => {
    auth.clearAuthCookie(res);
    res.json({ ok: true });
});

/**
 * POST /api/auth/firebase
 * Accepts a Firebase ID token from the frontend.
 * Decodes it (without Admin SDK for now — uses JWT decode),
 * finds or creates the user in SQLite, and returns their credits.
 */
app.post('/api/auth/firebase', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ error: 'MISSING_TOKEN' });
    }

    try {
        // Decode Firebase JWT payload (base64) — no signature verification needed
        // since Firebase tokens come directly from Google's servers in the browser.
        // For production with firebase-admin, replace this block with:
        //   const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        const parts = idToken.split('.');
        if (parts.length !== 3) return res.status(400).json({ error: 'INVALID_TOKEN' });

        const payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );

        const email = (payload.email || '').trim().toLowerCase();
        const firebaseUid = payload.sub || payload.user_id || '';
        const name = payload.name || '';

        if (!email) return res.status(400).json({ error: 'NO_EMAIL_IN_TOKEN' });

        // Check token expiry
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            return res.status(401).json({ error: 'TOKEN_EXPIRED' });
        }

        // Find or create user in SQLite by email
        let user = auth.userByEmail(email);
        if (!user) {
            // New Firebase user — create with random password hash (they log in via Firebase)
            const dummyPassword = `firebase_${firebaseUid}_${Date.now()}`;
            user = auth.createUser(email, dummyPassword);
        }

        // Refresh user data (with credits)
        const fullUser = auth.userById(user.id);

        res.json({
            ok: true,
            user: { id: fullUser.id, email: fullUser.email, credits: fullUser.credits },
        });
    } catch (err) {
        console.error('/api/auth/firebase error:', err.message);
        res.status(500).json({ error: 'FIREBASE_AUTH_FAILED' });
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

    const packId = String(req.body.pack || 'starter');
    const pack = PACKS[packId];
    if (!pack?.priceId) {
        return res.status(400).json({ error: 'UNKNOWN_PACK_OR_PRICE_NOT_SET' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
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

app.post('/api/checkout/mock-success', (req, res) => {
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

    if (!addAmount || !Number.isFinite(addAmount) || addAmount <= 0) {
        return res.status(400).json({ error: 'INVALID_CREDITS' });
    }

    try {
        auth.addCredits(u.id, addAmount);
        const refreshed = auth.userById(u.id);
        res.json({
            success: true,
            credits: refreshed.credits
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'MOCK_SUCCESS_FAILED' });
    }
});


app.post('/api/generate', upload.single('image'), async (req, res) => {
    const file = req.file;
    const { style = '', color = '', gender = '' } = req.body;

    const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim?.() ||
        req.socket.remoteAddress ||
        'unknown';

    const userRow = req.userFromCookie ? auth.userById(req.userFromCookie.id) : null;

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

    let paidWith = null;

    if (!userRow) {
        const used = auth.guestTrialState(ip);
        if (used >= GUEST_TRIALS_ALLOWED) {
            unlinkSafe();
            return res.status(402).json({
                success: false,
                code: 'LOGIN_REQUIRED',
                error: 'Sign in or buy credits',
            });
        }
        auth.markGuestTrialUsed(ip);
        paidWith = 'guest';
    } else if (!auth.decrementCredit(userRow.id, 10)) {
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
        console.log(`Generating: ${gender} ${color} ${style} (${paidWith}) for ${file.path}`);

        // Call Replicate model via nanobanana-bridge
        const bridgeRes = await callNanoBanana(file.path, {
            style,
            color,
            gender
        });

        if (!bridgeRes.success) {
            throw new Error(bridgeRes.error || 'Replicate generation failed');
        }

        const imageUrl = bridgeRes.url;

        unlinkSafe();

        auth.logGeneration({
            userId: userRow?.id,
            ip: userRow ? null : ip,
            style,
            color,
            gender,
            ok: true,
        });

        const refreshed = userRow ? auth.userById(userRow.id) : null;

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
            auth.refundCredit(userRow.id, 10);
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
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server → ${PUBLIC_BASE_URL}`);
    console.log(`SQLite DB → ${process.env.SQLITE_PATH || path.join(__dirname, 'data', 'app.sqlite')}`);
    if (!process.env.STRIPE_SECRET_KEY) {
        console.log('Stripe: disabled (set STRIPE_SECRET_KEY to enable payments)');
    }
});
