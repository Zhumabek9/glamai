'use strict';

require('dotenv').config();

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change-this-in-production-secret')) {
    console.error('CRITICAL ERROR: process.env.JWT_SECRET is missing or insecure in production!');
    process.exit(1);
}

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

const https = require('https');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function getClerkFrontendDomain() {
    const pk = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
    if (!pk) return null;
    try {
        const parts = pk.split('_');
        const base64Data = parts[2];
        if (!base64Data) return null;
        const decoded = Buffer.from(base64Data, 'base64').toString('utf8');
        return decoded.split('$')[0];
    } catch (err) {
        return null;
    }
}

// In-memory cache for JWKS keys
const jwksCache = new Map();

function fetchJwks(jwksUri) {
    return new Promise((resolve, reject) => {
        https.get(jwksUri, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch JWKS: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function verifyClerkToken(token) {
    if (!token) throw new Error('Token is empty');
    
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid token structure');
    }
    
    let header, payload;
    try {
        header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
        payload = JSON.parse(
            Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );
    } catch (e) {
        throw new Error('Invalid token payload encoding');
    }

    const isProd = process.env.NODE_ENV === 'production';
    const pk = process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY;
    const isDummyKey = pk && pk.includes('dummykey');
    
    if (!isProd && isDummyKey) {
        console.warn('WARNING: Local development with dummy Clerk key. Bypassing cryptographic verification.');
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            throw new Error('Token expired');
        }
        return payload;
    }

    if (process.env.CLERK_JWT_KEY) {
        const formattedKey = process.env.CLERK_JWT_KEY.replace(/\\n/g, '\n');
        return new Promise((resolve, reject) => {
            jwt.verify(token, formattedKey, { algorithms: ['RS256'] }, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            });
        });
    }

    const expectedDomain = getClerkFrontendDomain();
    if (!expectedDomain) {
        throw new Error('Clerk configuration missing: CLERK_PUBLISHABLE_KEY or VITE_CLERK_PUBLISHABLE_KEY not set.');
    }

    if (!payload.iss) {
        throw new Error('Missing issuer (iss) claim in token');
    }

    try {
        const issuerUrl = new URL(payload.iss);
        if (issuerUrl.hostname !== expectedDomain) {
            throw new Error(`Invalid token issuer: expected ${expectedDomain}, got ${issuerUrl.hostname}`);
        }
    } catch (e) {
        throw new Error('Invalid issuer URL format in token');
    }

    const jwksUri = `${payload.iss}/.well-known/jwks.json`;
    
    // Get keys from cache or fetch
    let cached = jwksCache.get(jwksUri);
    if (!cached || Date.now() - cached.fetchedAt > 10 * 60 * 1000) { // 10 minutes cache
        const data = await fetchJwks(jwksUri);
        cached = { keys: data.keys, fetchedAt: Date.now() };
        jwksCache.set(jwksUri, cached);
    }

    const key = cached.keys.find(k => k.kid === header.kid);
    if (!key) {
        throw new Error(`JWK not found for kid: ${header.kid}`);
    }

    // Convert JWK to PEM natively using Node.js crypto
    const publicKey = crypto.createPublicKey({ format: 'jwk', key });
    const pem = publicKey.export({ type: 'spki', format: 'pem' });

    return new Promise((resolve, reject) => {
        jwt.verify(token, pem, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
}

const uploadsDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'uploads');
const upload = multer({
    dest: uploadsDir,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, '');
const GUEST_TRIALS_ALLOWED = Number(process.env.GUEST_FREE_TRIALS ?? '1');

const PACKS = {
  // VIP Subscriptions
  'weekly-vip': {
    credits: 500,
    priceId: process.env.STRIPE_PRICE_WEEKLY || '',
    label: 'Weekly VIP',
  },
  'monthly-vip': {
    credits: 2000,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    label: 'Monthly VIP',
  },
  'yearly-vip': {
    credits: 24000,
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    label: 'Yearly VIP',
  },
  // New Credit Packs
  'mini-pack': {
    credits: 100,
    priceId: process.env.STRIPE_PRICE_LITE_ONETIME || '',
    label: 'Mini Pack',
  },
  'standard-pack': {
    credits: 300,
    priceId: process.env.STRIPE_PRICE_PRO_ONETIME || '',
    label: 'Standard Pack',
  },
  'max-pack': {
    credits: 1000,
    priceId: process.env.STRIPE_PRICE_ULTRA_ONETIME || '',
    label: 'Max Pack',
  },
  // Legacy / fallback mappings (mapping same prices to updated credits)
  'lite-monthly': {
    credits: 200,
    priceId: process.env.STRIPE_PRICE_LITE_MONTHLY || '',
    label: 'Lite Monthly',
  },
  'pro-monthly': {
    credits: 2000,
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    label: 'Pro Monthly',
  },
  'lite-yearly': {
    credits: 2000,
    priceId: process.env.STRIPE_PRICE_LITE_YEARLY || '',
    label: 'Lite Yearly',
  },
  'pro-yearly': {
    credits: 24000,
    priceId: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    label: 'Pro Yearly',
  },
  'lite-onetime': {
    credits: 100,
    priceId: process.env.STRIPE_PRICE_LITE_ONETIME || '',
    label: 'Lite One-Time',
  },
  'pro-onetime': {
    credits: 300,
    priceId: process.env.STRIPE_PRICE_PRO_ONETIME || '',
    label: 'Pro One-Time',
  },
  'ultra-onetime': {
    credits: 1000,
    priceId: process.env.STRIPE_PRICE_ULTRA_ONETIME || '',
    label: 'Ultra One-Time',
  },
};

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const ANALYTICS_MAX_EVENTS = 5000;
const analyticsEvents = [];

const app = express();

// Set security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox;");
    next();
});

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

const allowedOrigins = [
    'https://tryglamai.com',
    'https://www.tryglamai.com',
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
                return callback(null, true);
            }
            if (allowedOrigins.indexOf(origin) !== -1) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
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

        // 2. Fallback: Parse and cryptographically verify Bearer token (Clerk session token) from Authorization header
        if (!req.userFromCookie && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const idToken = authHeader.slice(7);
                try {
                    const payload = await verifyClerkToken(idToken);
                    const email = (payload.email || '').trim().toLowerCase();
                    if (email) {
                        const userRow = await auth.userByEmail(email);
                        if (userRow) {
                            req.userFromCookie = await auth.userById(userRow.id);
                        }
                    }
                } catch (err) {
                    console.warn('Authorization header verification failed in middleware:', err.message);
                }
            }
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
    }
    next();
});

app.get('/health', (_, res) => res.json({ ok: true }));

app.post(['/api/analytics', '/analytics'], async (req, res) => {
    const event = String(req.body?.event || '').trim();
    if (!event) {
        return res.status(400).json({ error: 'EVENT_REQUIRED' });
    }
    const safePayload = {
        event,
        properties: req.body?.properties && typeof req.body.properties === 'object' ? req.body.properties : {},
        timestamp: req.body?.timestamp || new Date().toISOString(),
        path: req.body?.path || '',
        ip:
            req.headers['x-forwarded-for']?.split(',')[0]?.trim?.() ||
            req.socket.remoteAddress ||
            'unknown',
    };

    analyticsEvents.push(safePayload);
    if (analyticsEvents.length > ANALYTICS_MAX_EVENTS) {
        analyticsEvents.splice(0, analyticsEvents.length - ANALYTICS_MAX_EVENTS);
    }

    try {
        await db.query(
            `INSERT INTO analytics_events (event, properties, path, ip, user_id, created_at)
             VALUES ($1, $2::jsonb, $3, $4, $5, $6::timestamptz)`,
            [
                safePayload.event,
                JSON.stringify(safePayload.properties || {}),
                safePayload.path || null,
                safePayload.ip || null,
                req.userFromCookie?.id || null,
                safePayload.timestamp || new Date().toISOString(),
            ]
        );
    } catch (err) {
        console.warn('[analytics] failed to persist event:', err.message);
    }

    // Lightweight first-party analytics logging for CRO iteration.
    console.log('[analytics]', JSON.stringify(safePayload));
    return res.status(204).end();
});

app.get('/api/analytics/summary', async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit || 1000), 1), ANALYTICS_MAX_EVENTS);
    let recent = analyticsEvents.slice(-limit);
    let counts = recent.reduce((acc, item) => {
        acc[item.event] = (acc[item.event] || 0) + 1;
        return acc;
    }, {});
    let lastEventAt = recent.length ? recent[recent.length - 1].timestamp : null;

    try {
        const rowsRes = await db.query(
            `WITH recent AS (
                SELECT event, created_at
                FROM analytics_events
                ORDER BY created_at DESC
                LIMIT $1
            )
            SELECT event, COUNT(*)::int AS count
            FROM recent
            GROUP BY event`,
            [limit]
        );
        const metaRes = await db.query(
            `WITH recent AS (
                SELECT created_at
                FROM analytics_events
                ORDER BY created_at DESC
                LIMIT $1
            )
            SELECT COUNT(*)::int AS total, MAX(created_at) AS last_event_at
            FROM recent`,
            [limit]
        );

        counts = rowsRes.rows.reduce((acc, row) => {
            acc[row.event] = row.count;
            return acc;
        }, {});
        const total = metaRes.rows[0]?.total ?? 0;
        lastEventAt = metaRes.rows[0]?.last_event_at || null;
        recent = new Array(total);
    } catch (err) {
        console.warn('[analytics] summary DB query failed, using in-memory fallback:', err.message);
    }

    const funnel = {
        paywallView: counts.paywall_view || 0,
        recommendedPlanClick: counts.recommended_plan_click || 0,
        upgradeStart: counts.upgrade_start || 0,
    };

    const toPercent = (numerator, denominator) =>
        denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;

    res.json({
        windowSize: recent.length,
        counts,
        funnel,
        conversion: {
            paywallToRecommendedClickPct: toPercent(funnel.recommendedPlanClick, funnel.paywallView),
            paywallToUpgradeStartPct: toPercent(funnel.upgradeStart, funnel.paywallView),
            recommendedClickToUpgradeStartPct: toPercent(funnel.upgradeStart, funnel.recommendedPlanClick),
        },
        lastEventAt,
    });
});

app.get('/api/analytics/breakdown', async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days || 14), 1), 90);
    const sinceExpr = `NOW() - ($1::int || ' days')::interval`;

    try {
        const dailyRes = await db.query(
            `SELECT
                DATE_TRUNC('day', created_at) AS day,
                event,
                COUNT(*)::int AS count
             FROM analytics_events
             WHERE created_at >= ${sinceExpr}
             GROUP BY 1, 2
             ORDER BY 1 DESC, 2 ASC`,
            [days]
        );

        const sourceRes = await db.query(
            `SELECT
                COALESCE(NULLIF(properties->>'source', ''), 'unknown') AS source,
                event,
                COUNT(*)::int AS count
             FROM analytics_events
             WHERE created_at >= ${sinceExpr}
             GROUP BY 1, 2
             ORDER BY count DESC
             LIMIT 200`,
            [days]
        );

        const planRes = await db.query(
            `SELECT
                COALESCE(NULLIF(properties->>'planId', ''), 'unknown') AS plan_id,
                event,
                COUNT(*)::int AS count
             FROM analytics_events
             WHERE created_at >= ${sinceExpr}
             GROUP BY 1, 2
             ORDER BY count DESC
             LIMIT 200`,
            [days]
        );

        const funnelRes = await db.query(
            `SELECT
                COALESCE(NULLIF(properties->>'source', ''), 'unknown') AS source,
                SUM(CASE WHEN event = 'paywall_view' THEN 1 ELSE 0 END)::int AS paywall_view,
                SUM(CASE WHEN event = 'recommended_plan_click' THEN 1 ELSE 0 END)::int AS recommended_plan_click,
                SUM(CASE WHEN event = 'upgrade_start' THEN 1 ELSE 0 END)::int AS upgrade_start
             FROM analytics_events
             WHERE created_at >= ${sinceExpr}
             GROUP BY 1
             ORDER BY paywall_view DESC, recommended_plan_click DESC`,
            [days]
        );

        const toPct = (n, d) => (d > 0 ? Number(((n / d) * 100).toFixed(2)) : 0);
        const funnelBySource = funnelRes.rows.map((row) => ({
            source: row.source,
            paywallView: row.paywall_view,
            recommendedPlanClick: row.recommended_plan_click,
            upgradeStart: row.upgrade_start,
            paywallToRecommendedClickPct: toPct(row.recommended_plan_click, row.paywall_view),
            paywallToUpgradeStartPct: toPct(row.upgrade_start, row.paywall_view),
            recommendedClickToUpgradeStartPct: toPct(row.upgrade_start, row.recommended_plan_click),
        }));

        return res.json({
            days,
            daily: dailyRes.rows.map((r) => ({
                day: r.day,
                event: r.event,
                count: r.count,
            })),
            bySource: sourceRes.rows.map((r) => ({
                source: r.source,
                event: r.event,
                count: r.count,
            })),
            byPlan: planRes.rows.map((r) => ({
                planId: r.plan_id,
                event: r.event,
                count: r.count,
            })),
            funnelBySource,
        });
    } catch (err) {
        console.error('[analytics] breakdown query failed:', err.message);
        return res.status(500).json({ error: 'ANALYTICS_BREAKDOWN_FAILED' });
    }
});

app.get('/api/analytics/top-winners', async (req, res) => {
    const days = Math.min(Math.max(Number(req.query.days || 14), 1), 90);
    const minPaywallViews = Math.max(Number(req.query.minPaywallViews || 5), 1);
    const minRecommendedClicks = Math.max(Number(req.query.minRecommendedClicks || 3), 1);
    const sinceExpr = `NOW() - ($1::int || ' days')::interval`;

    try {
        const sourceFunnelRes = await db.query(
            `WITH source_funnel AS (
                SELECT
                    COALESCE(NULLIF(properties->>'source', ''), 'unknown') AS source,
                    SUM(CASE WHEN event = 'paywall_view' THEN 1 ELSE 0 END)::int AS paywall_view,
                    SUM(CASE WHEN event = 'recommended_plan_click' THEN 1 ELSE 0 END)::int AS recommended_plan_click,
                    SUM(CASE WHEN event = 'upgrade_start' THEN 1 ELSE 0 END)::int AS upgrade_start
                FROM analytics_events
                WHERE created_at >= ${sinceExpr}
                GROUP BY 1
            )
            SELECT * FROM source_funnel
            WHERE paywall_view >= $2
            ORDER BY upgrade_start DESC, paywall_view DESC`,
            [days, minPaywallViews]
        );

        const planUpgradeRes = await db.query(
            `WITH plan_clicks AS (
                SELECT
                    COALESCE(NULLIF(properties->>'planId', ''), 'unknown') AS plan_id,
                    COUNT(*)::int AS recommended_clicks
                FROM analytics_events
                WHERE created_at >= ${sinceExpr}
                  AND event = 'recommended_plan_click'
                GROUP BY 1
            ),
            plan_upgrades AS (
                SELECT
                    COALESCE(NULLIF(properties->>'planId', ''), 'unknown') AS plan_id,
                    COUNT(*)::int AS upgrade_starts
                FROM analytics_events
                WHERE created_at >= ${sinceExpr}
                  AND event = 'upgrade_start'
                GROUP BY 1
            )
            SELECT
                COALESCE(c.plan_id, u.plan_id) AS plan_id,
                COALESCE(c.recommended_clicks, 0)::int AS recommended_clicks,
                COALESCE(u.upgrade_starts, 0)::int AS upgrade_starts
            FROM plan_clicks c
            FULL OUTER JOIN plan_upgrades u ON c.plan_id = u.plan_id
            WHERE COALESCE(c.recommended_clicks, 0) >= $2
               OR COALESCE(u.upgrade_starts, 0) > 0
            ORDER BY upgrade_starts DESC, recommended_clicks DESC`,
            [days, minRecommendedClicks]
        );

        const toPct = (n, d) => (d > 0 ? Number(((n / d) * 100).toFixed(2)) : 0);

        const sources = sourceFunnelRes.rows.map((row) => ({
            source: row.source,
            paywallView: row.paywall_view,
            recommendedPlanClick: row.recommended_plan_click,
            upgradeStart: row.upgrade_start,
            paywallToRecommendedClickPct: toPct(row.recommended_plan_click, row.paywall_view),
            paywallToUpgradeStartPct: toPct(row.upgrade_start, row.paywall_view),
            recommendedClickToUpgradeStartPct: toPct(row.upgrade_start, row.recommended_plan_click),
        }));

        const plans = planUpgradeRes.rows.map((row) => ({
            planId: row.plan_id,
            recommendedClicks: row.recommended_clicks,
            upgradeStarts: row.upgrade_starts,
            recommendedClickToUpgradeStartPct: toPct(row.upgrade_starts, row.recommended_clicks),
        }));

        const topSourceByUpgradeStarts = [...sources].sort((a, b) => b.upgradeStart - a.upgradeStart)[0] || null;
        const topSourceByConversion = [...sources]
            .filter((s) => s.paywallView >= minPaywallViews)
            .sort((a, b) => b.paywallToUpgradeStartPct - a.paywallToUpgradeStartPct)[0] || null;
        const topPlanByUpgradeStarts = [...plans].sort((a, b) => b.upgradeStarts - a.upgradeStarts)[0] || null;
        const topPlanByConversion = [...plans]
            .filter((p) => p.recommendedClicks >= minRecommendedClicks)
            .sort((a, b) => b.recommendedClickToUpgradeStartPct - a.recommendedClickToUpgradeStartPct)[0] || null;

        return res.json({
            days,
            thresholds: {
                minPaywallViews,
                minRecommendedClicks,
            },
            winners: {
                topSourceByUpgradeStarts,
                topSourceByConversion,
                topPlanByUpgradeStarts,
                topPlanByConversion,
            },
            sources,
            plans,
        });
    } catch (err) {
        console.error('[analytics] top-winners query failed:', err.message);
        return res.status(500).json({ error: 'ANALYTICS_TOP_WINNERS_FAILED' });
    }
});

const sendPublicConfig = async (req, res) => {
    const ip =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim?.() ||
        req.socket.remoteAddress ||
        'unknown';
    const used = await auth.guestTrialState(ip);
    const guestTokensRemaining = Math.max(0, GUEST_TRIALS_ALLOWED - used) * 10;
    const country = req.headers['x-vercel-ip-country'] || req.headers['x-vercel-country'] || null;

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
        allowMockPayment: process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_PAYMENT === '1',
        authBackend: true,
        country,
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
                subscriptionStatus: 'inactive',
                role: 'user'
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
            subscriptionStatus: user.subscription_status || 'inactive',
            role: user.role || 'user'
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
        const payload = await verifyClerkToken(idToken);
        const clerkUid = payload.sub || '';
        const userEmail = (email || payload.email || '').trim().toLowerCase();

        if (!userEmail) return res.status(400).json({ error: 'NO_EMAIL_PROVIDED' });

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
                subscriptionStatus: fullUser.subscription_status || 'inactive',
                role: fullUser.role || 'user'
            },
        });
    } catch (err) {
        console.error('/api/auth/clerk error:', err.message);
        res.status(500).json({ error: 'CLERK_AUTH_FAILED' });
    }
});

// Telegram BOT TOKEN
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

let botUsername = 'tryglamai_bot';
if (TELEGRAM_BOT_TOKEN) {
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
        .then(res => res.json())
        .then(data => {
            if (data.ok && data.result.username) {
                botUsername = data.result.username;
                console.log(`[Telegram] Dynamically loaded bot username: @${botUsername}`);
            }
        })
        .catch(err => {
            console.error('[Telegram] Failed to fetch bot info on startup:', err.message);
        });
}


function validateTelegramWebAppData(telegramInitData) {
    if (!TELEGRAM_BOT_TOKEN) return false;
    const urlParams = new URLSearchParams(telegramInitData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    urlParams.sort();
    
    let dataCheckString = '';
    for (const [key, value] of urlParams.entries()) {
        dataCheckString += `${key}=${value}\n`;
    }
    dataCheckString = dataCheckString.slice(0, -1);
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(TELEGRAM_BOT_TOKEN).digest();
    const checkHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return checkHash === hash;
}

app.post('/api/auth/telegram', async (req, res) => {
    const { initData, user: tgUser } = req.body;
    if (!initData || !tgUser) {
        return res.status(400).json({ error: 'MISSING_DATA' });
    }

    if (!validateTelegramWebAppData(initData)) {
        return res.status(403).json({ error: 'INVALID_TELEGRAM_HASH' });
    }

    try {
        const userEmail = `tg_${tgUser.id}@telegram.local`;
        let user = await auth.userByEmail(userEmail);
        if (!user) {
            const dummyPassword = `tg_${tgUser.id}_${Date.now()}`;
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
                subscriptionStatus: fullUser.subscription_status || 'inactive',
                role: fullUser.role || 'user'
            },
            botUsername: botUsername
        });
    } catch (err) {
        console.error('/api/auth/telegram error:', err.message);
        res.status(500).json({ error: 'TELEGRAM_AUTH_FAILED' });
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
            subscriptionEnd: req.userFromCookie.subscription_end || null,
            role: req.userFromCookie.role || 'user'
        },
        botUsername: botUsername
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
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
        return res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED_IN_PROD' });
    }

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

app.post('/api/payment/telegram-invoice', async (req, res) => {
    if (!req.userFromCookie) {
        return res.status(401).json({ error: 'LOGIN_REQUIRED' });
    }
    const { amount, credits } = req.body;
    if (!TELEGRAM_BOT_TOKEN) return res.status(500).json({ error: 'TELEGRAM_NOT_CONFIGURED' });

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `Buy ${credits} Credits`,
                description: `Purchase ${credits} generation credits for GlamAI`,
                payload: `${req.userFromCookie.id}_${credits}`,
                provider_token: "", // must be empty for Telegram Stars
                currency: "XTR",
                prices: [{ label: `${credits} Credits`, amount: amount }] // amount is in XTR
            })
        });
        const data = await response.json();
        if (data.ok) {
            res.json({ url: data.result });
        } else {
            console.error('Telegram invoice error:', data);
            res.status(500).json({ error: 'FAILED_TO_CREATE_INVOICE' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'FAILED_TO_CREATE_INVOICE' });
    }
});

app.get('/api/telegram/set-commands', async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN_MISSING' });
    }
    try {
        const commands = [
            {
                command: "start",
                description: "Start the GlamAI Studio"
            },
            {
                command: "appss_verify",
                description: "Verify the bot on AppSS catalog"
            }
        ];
        
        // 1. Set default commands
        const defaultRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands })
        });
        const defaultData = await defaultRes.json();
        
        // 2. Set ru commands
        const ruRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands, language_code: 'ru' })
        });
        const ruData = await ruRes.json();
        
        // 3. Set en commands
        const enRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commands, language_code: 'en' })
        });
        const enData = await enRes.json();
        
        res.json({
            success: defaultData.ok && ruData.ok && enData.ok,
            default: defaultData,
            ru: ruData,
            en: enData
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/telegram/get-commands', async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN_MISSING' });
    }
    try {
        const defaultCommandsRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyCommands`);
        const defaultCommands = await defaultCommandsRes.json();
        
        const ruCommandsRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyCommands?language_code=ru`);
        const ruCommands = await ruCommandsRes.json();
        
        const enCommandsRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyCommands?language_code=en`);
        const enCommands = await enCommandsRes.json();
        
        res.json({
            default: defaultCommands,
            ru: ruCommands,
            en: enCommands
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/telegram/send-photo', async (req, res) => {
    if (!req.userFromCookie) {
        return res.status(401).json({ error: 'LOGIN_REQUIRED' });
    }
    const { imageUrl, caption } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'IMAGE_URL_REQUIRED' });
    }
    if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'TELEGRAM_NOT_CONFIGURED' });
    }

    try {
        const email = req.userFromCookie.email;
        if (!email || !email.startsWith('tg_') || !email.endsWith('@telegram.local')) {
            return res.status(400).json({ error: 'NOT_TELEGRAM_USER' });
        }
        const telegramId = email.substring(3, email.indexOf('@'));

        // Resolve / fetch the image buffer
        let buffer;
        let contentType = 'image/png';
        let filename = 'photo.png';

        if (imageUrl.startsWith('data:image/')) {
            const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).json({ error: 'INVALID_BASE64_DATA' });
            }
            contentType = matches[1];
            buffer = Buffer.from(matches[2], 'base64');
        } else {
            let targetUrl = imageUrl;
            if (targetUrl.includes('/api/proxy-image?url=')) {
                const urlParam = new URL(targetUrl, 'http://localhost').searchParams.get('url');
                if (urlParam) {
                    targetUrl = urlParam;
                }
            } else if (targetUrl.startsWith('/')) {
                targetUrl = `${PUBLIC_BASE_URL}${targetUrl}`;
            }

            const imgRes = await fetch(targetUrl);
            if (!imgRes.ok) {
                return res.status(400).json({ error: 'FAILED_TO_FETCH_IMAGE', details: `Status ${imgRes.status}` });
            }
            contentType = imgRes.headers.get('content-type') || 'image/png';
            const arrayBuffer = await imgRes.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        }

        // Build manual multipart form data to be fully compatible with any Node environment
        const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
        const parts = [];

        parts.push(Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="chat_id"\r\n\r\n${telegramId}\r\n`
        ));

        parts.push(Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`
        ));
        parts.push(buffer);
        parts.push(Buffer.from('\r\n'));

        if (caption) {
            parts.push(Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`
            ));
            parts.push(Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="parse_mode"\r\n\r\nMarkdown\r\n`
            ));
        }

        parts.push(Buffer.from(`--${boundary}--\r\n`));
        const bodyBuffer = Buffer.concat(parts);

        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: bodyBuffer
        });

        const tgData = await tgRes.json();
        if (tgData.ok) {
            res.json({ success: true });
        } else {
            console.error('[Telegram] sendPhoto error response:', tgData);
            res.status(502).json({ error: 'TELEGRAM_API_ERROR', details: tgData.description });
        }
    } catch (err) {
        console.error('[Telegram] /api/telegram/send-photo error:', err);
        res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
    }
});

async function translateText(text, targetLang) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        if (json && json[0]) {
            return json[0].map(item => item[0]).join('');
        }
        throw new Error('Invalid response structure');
    } catch (err) {
        console.error('Translation failed:', err.message);
        return text;
    }
}

app.post('/api/telegram/webhook', async (req, res) => {
    const update = req.body;
    
    if (update.pre_checkout_query) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pre_checkout_query_id: update.pre_checkout_query.id,
                ok: true
            })
        });
        return res.sendStatus(200);
    }
    
    if (update.message && update.message.successful_payment) {
        const payload = update.message.successful_payment.invoice_payload;
        const [userId, creditsStr] = payload.split('_');
        const creditsToAdd = parseInt(creditsStr, 10);
        
        try {
            const user = await auth.userById(userId);
            if (user) {
                const newCredits = (user.credits || 0) + creditsToAdd;
                await db.query('UPDATE users SET credits = $1 WHERE id = $2', [newCredits, userId]);
                console.log(`Added ${creditsToAdd} Stars credits to user ${userId}`);
            }
        } catch (err) {
            console.error('Error crediting user for Stars:', err);
        }
    }

    // Handle /appss_verify command
    if (update.message && update.message.text && update.message.text.startsWith('/appss_verify')) {
        const chatId = update.message.chat.id;
        console.log(`[Telegram Bot] /appss_verify command received. Chat ID: ${chatId}`);
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `appss_f0cdf4`
                })
            });
            const resData = await response.json();
            console.log(`[Telegram Bot] /appss_verify response status: ${response.status}, payload:`, resData);
        } catch (err) {
            console.error('Error sending verification response:', err);
        }
    }

    // Handle /start command to send a welcome message with Web App button (localized)
    if (update.message && update.message.text && update.message.text.startsWith('/start')) {
        const chatId = update.message.chat.id;
        const rawLang = update.message.from?.language_code || 'en';
        const lang = rawLang.toLowerCase().slice(0, 2);
        console.log(`[Telegram Bot] /start command received. Chat ID: ${chatId}, Raw Language Code: "${rawLang}", Sliced: "${lang}"`);

        const messages = {
            ru: {
                text: `👋 *Привет! Добро пожаловать в GlamAI — твою персональную AI-студию красоты!* 💇‍♀️✨\n\n` +
                    `Я помогу тебе мгновенно примерить новый образ прямо на фото. Никаких рисков и походов в салон вслепую!\n\n` +
                    `📸 *Что я умею:*\n` +
                    `• 💇‍♂️ *Прически и стрижки*: Примерь 120+ мужских и женских причесок (боб, пикси, каре, фейд и др.).\n` +
                    `• 🎨 *Цвет волос*: Экспериментируй с цветом — от натурального блонда до яркого неона.\n` +
                    `• 💄 *Макияж*: Примерь трендовые макияжи (Glam, Natural, Korean и др.).\n` +
                    `• 💅 *Маникюр*: Подбери идеальную форму и дизайн ногтей.\n` +
                    `• 🧔 *Борода и усы*: Найди свой идеальный стиль оформления бороды.\n\n` +
                    `🎁 *Для старта мы дарим тебе бесплатные кредиты!*\n\n` +
                    `👇 Нажми на кнопку ниже, чтобы открыть студию и создать свой первый образ!`,
                button: "Открыть студию ⚡"
            },
            es: {
                text: `👋 *¡Bienvenido a GlamAI, tu estudio de belleza personal con IA!* 💇‍♀️✨\n\n` +
                    `Te ayudaré a probar nuevos looks al instante en tu foto. ¡Sin arrepentimientos en el salón!\n\n` +
                    `📸 *Lo que puedo hacer:*\n` +
                    `• 💇‍♂️ *Peinados y Cortes*: Pruébate más de 120 estilos (bob, pixie, degradado, etc.).\n` +
                    `• 🎨 *Color de Pelo*: Experimenta desde rubios naturales hasta neones brillantes.\n` +
                    `• 💄 *Maquillaje*: Prueba estilos en tendencia (Glam, Natural, Coreano, etc.).\n` +
                    `• 💅 *Manicura*: Encuentra la forma y el diseño de uñas perfectos.\n` +
                    `• 🧔 *Barba y Bigote*: Diseña tu barba en un solo clic.\n\n` +
                    `🎁 *¡Te hemos regalado créditos gratuitos para empezar!*\n\n` +
                    `👇 ¡Toca el botón de abajo para abrir el estudio y crear tu primer look!`,
                button: "Abrir estudio ⚡"
            },
            fr: {
                text: `👋 *Bienvenue sur GlamAI — votre salon de beauté virtuel par IA !* 💇‍♀️✨\n\n` +
                    `Je vous aide à essayer instantanément de nouveaux looks sur votre photo. Plus de regrets chez le coiffeur !\n\n` +
                    `📸 *Ce que je peux faire :*\n` +
                    `• 💇‍♂️ *Coiffures & Coupes* : Essayez plus de 120 styles (bob, pixie, dégradé, etc.).\n` +
                    `• 🎨 *Couleur de Cheveux* : Expérimentez du blond naturel au néon flashy.\n` +
                    `• 💄 *Maquillage* : Essayez les styles tendance (Glam, Naturel, Coréen, etc.).\n` +
                    `• 💅 *Manure* : Trouvez la forme et le design d'ongles parfaits.\n` +
                    `• 🧔 *Barbe & Moustache* : Taillez votre barbe en un clic.\n\n` +
                    `🎁 *Nous vous offrons des crédits gratuits pour commencer !*\n\n` +
                    `👇 Appuyez sur le bouton ci-dessous pour ouvrir le studio et créer votre premier look !`,
                button: "Ouvrir le studio ⚡"
            },
            de: {
                text: `👋 *Willkommen bei GlamAI — deinem persönlichen KI-Schönheitsstudio!* 💇‍♀️✨\n\n` +
                    `Ich helfe dir, neue Looks sofort auf deinem Foto auszuprobieren. Keine Enttäuschungen mehr im Salon!\n\n` +
                    `📸 *Was ich kann:*\n` +
                    `• 💇‍♂️ *Frisuren & Schnitte*: Probiere über 120 Styles aus (Bob, Pixie, Fade usw.).\n` +
                    `• 🎨 *Haarfarbe*: Experimentiere von natürlichem Blond bis hin zu leuchtendem Neon.\n` +
                    `• 💄 *Make-up*: Teste trendige Make-up-Looks (Glam, Natural, Koreanisch usw.).\n` +
                    `• 💅 *Nageldesign*: Finde deine perfekte Nagelform und dein Design.\n` +
                    `• 🧔 *Bart & Schnurrbart*: Style deinen Bart mit einem Klick.\n\n` +
                    `🎁 *Wir haben dir zum Start kostenlose Credits geschenkt!*\n\n` +
                    `👇 Tippe auf die Schaltfläche unten, um das Studio zu öffnen und deinen ersten Look zu erstellen!`,
                button: "Studio öffnen ⚡"
            },
            en: {
                text: `👋 *Welcome to GlamAI — your personal AI Beauty Studio!* 💇‍♀️✨\n\n` +
                    `I will help you instantly try on new looks right on your photo. Zero salon regrets!\n\n` +
                    `📸 *What I can do:*\n` +
                    `• 💇‍♂️ *Hairstyles & Cuts*: Try 120+ styles (bob, pixie, fade, crops, etc.).\n` +
                    `• 🎨 *Hair Color*: Experiment with colors from natural blond to bright neon.\n` +
                    `• 💄 *Makeup*: Try trending makeup looks (Glam, Natural, Korean, etc.).\n` +
                    `• 💅 *Nail Art*: Find your perfect nail shape and design.\n` +
                    `• 🧔 *Beards & Mustache*: Style your beard in one click.\n\n` +
                    `🎁 *We've gifted you free credits to get started!*\n\n` +
                    `👇 Tap the button below to open the studio and create your first look!`,
                button: "Open Studio ⚡"
            }
        };

        let currentMsg = messages[lang];
        if (!currentMsg) {
            console.log(`[Telegram Bot] No predefined translation found for "${lang}". Performing dynamic translation...`);
            try {
                const translatedText = await translateText(messages.en.text, lang);
                const translatedButton = await translateText(messages.en.button, lang);
                console.log(`[Telegram Bot] Dynamic translation successful for "${lang}"`);
                currentMsg = {
                    text: translatedText,
                    button: translatedButton
                };
            } catch (err) {
                console.error('[Telegram Bot] Dynamic translation failed, falling back to English:', err);
                currentMsg = messages.en;
            }
        } else {
            console.log(`[Telegram Bot] Using predefined translation for "${lang}"`);
        }

        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: currentMsg.text,
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: currentMsg.button,
                                web_app: {
                                    url: "https://tryglamai.com"
                                }
                            }
                        ]]
                    }
                })
            });
        } catch (err) {
            console.error('Error sending welcome message:', err);
        }
    }
    
    res.sendStatus(200);
});

app.post('/api/admin/add-credits', async (req, res) => {
    const u = req.userFromCookie;
    if (!u || u.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const email = String(req.body.email || '').trim().toLowerCase();
    const amount = Number(req.body.amount || 2000);

    if (!email) {
        return res.status(400).json({ error: 'Email parameter is required' });
    }

    try {
        let user = await auth.userByEmail(email);
        if (!user) {
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

app.get('/api/admin/users', async (req, res) => {
    const u = req.userFromCookie;
    if (!u || u.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { search = '' } = req.query;
    try {
        let rows;
        if (search) {
            const resUsers = await db.query(
                `SELECT id, email, credits, subscription_tier, subscription_status, role, created_at 
                 FROM users 
                 WHERE lower(email) LIKE lower($1)
                 ORDER BY id DESC`,
                [`%${search}%`]
            );
            rows = resUsers.rows;
        } else {
            const resUsers = await db.query(
                `SELECT id, email, credits, subscription_tier, subscription_status, role, created_at 
                 FROM users 
                 ORDER BY id DESC`
            );
            rows = resUsers.rows;
        }
        res.json({ success: true, users: rows });
    } catch (e) {
        res.status(500).json({ error: 'ADMIN_USERS_FETCH_FAILED', message: e.message });
    }
});

app.post('/api/admin/update-user', async (req, res) => {
    const u = req.userFromCookie;
    if (!u || u.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { userId, credits, subscriptionTier, subscriptionStatus, role } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'USER_ID_REQUIRED' });
    }
    try {
        await db.query(
            `UPDATE users 
             SET credits = COALESCE($1, credits),
                 subscription_tier = COALESCE($2, subscription_tier),
                 subscription_status = COALESCE($3, subscription_status),
                 role = COALESCE($4, role)
             WHERE id = $5`,
            [credits, subscriptionTier, subscriptionStatus, role, userId]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (e) {
        res.status(500).json({ error: 'ADMIN_USER_UPDATE_FAILED', message: e.message });
    }
});

app.get('/api/admin/generations', async (req, res) => {
    const u = req.userFromCookie;
    if (!u || u.role !== 'admin') {
        return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { taskType = '', search = '', limit = 100, offset = 0 } = req.query;
    try {
        let queryStr = `
            SELECT g.id, g.user_id, u.email as user_email, g.ip, g.style, g.color, g.gender, g.ok, g.task_type, g.makeup, g.beard, g.nails, g.retouch, g.result_url, g.created_at
            FROM generations g
            LEFT JOIN users u ON g.user_id = u.id
            WHERE 1=1
        `;
        const params = [];
        let paramIdx = 1;

        if (taskType) {
            queryStr += ` AND g.task_type = $${paramIdx}`;
            params.push(taskType);
            paramIdx++;
        }

        if (search) {
            queryStr += ` AND (lower(u.email) LIKE lower($${paramIdx}) OR g.ip LIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }

        queryStr += ` ORDER BY g.id DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
        params.push(parseInt(limit, 10) || 100);
        params.push(parseInt(offset, 10) || 0);

        const result = await db.query(queryStr, params);
        res.json({ success: true, generations: result.rows });
    } catch (e) {
        console.error("Failed to fetch admin generations:", e);
        res.status(500).json({ error: 'ADMIN_GENERATIONS_FETCH_FAILED', message: e.message });
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

app.post('/api/user/cancel-subscription', async (req, res) => {
    const u = req.userFromCookie;
    if (!u) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

    try {
        const userRowRes = await db.query('SELECT subscription_id FROM users WHERE id = $1', [u.id]);
        const subId = userRowRes.rows[0]?.subscription_id;

        if (subId && stripe) {
            await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
        }

        await db.query("UPDATE users SET subscription_status = 'canceling' WHERE id = $1", [u.id]);
        res.json({ success: true, message: 'Subscription canceled successfully. It will not renew.' });
    } catch (e) {
        console.error("Failed to cancel subscription:", e);
        res.status(500).json({ error: 'CANCEL_FAILED', message: e.message });
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

app.delete(['/api/user/profile', '/user/profile'], async (req, res) => {
    const u = req.userFromCookie;
    if (!u) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

    try {
        // Delete user's generations
        await db.query('DELETE FROM generations WHERE user_id = $1', [u.id]);
        // Delete user's analytics events
        await db.query('DELETE FROM analytics_events WHERE user_id = $1', [u.id]);
        // Delete user profile
        await db.query('DELETE FROM users WHERE id = $1', [u.id]);
        
        // Clear auth cookie
        auth.clearAuthCookie(res);
        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (e) {
        console.error("Failed to delete user profile:", e);
        res.status(500).json({ error: 'PROFILE_DELETION_FAILED' });
    }
});

app.get(['/api/proxy-image', '/proxy-image'], async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname !== 'replicate.delivery' && !parsedUrl.hostname.endsWith('.replicate.delivery')) {
            return res.status(403).send('Forbidden: Only replicate.delivery URLs are allowed');
        }

        const imgRes = await fetch(url);
        if (!imgRes.ok) {
            return res.status(imgRes.status).send('Failed to fetch image');
        }

        res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        
        const arrayBuffer = await imgRes.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.error('Error proxying image:', err.message);
        res.status(500).send('Error proxying image');
    }
});

app.get(['/api/user/history', '/user/history'], async (req, res) => {
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

        const mappedRows = rows.map(row => {
            if (row.result_url && !row.result_url.startsWith('data:') && !row.result_url.startsWith('/')) {
                return {
                    ...row,
                    result_url: `/api/proxy-image?url=${encodeURIComponent(row.result_url)}`
                };
            }
            return row;
        });

        res.json({ success: true, history: mappedRows });
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

    // DB Rate Limiting: max 5 generations per minute per IP or User
    try {
        const rateCheck = await db.query(
            `SELECT COUNT(*)::int AS count 
             FROM generations 
             WHERE (ip = $1 OR (user_id = $2 AND user_id IS NOT NULL)) 
               AND created_at >= NOW() - INTERVAL '1 minute'`,
            [ip, userRow?.id || null]
        );
        if (rateCheck.rows[0].count >= 5) {
            unlinkSafe();
            return res.status(429).json({
                success: false,
                code: 'RATE_LIMIT_EXCEEDED',
                error: 'Too many requests. Please wait a minute.'
            });
        }
    } catch (err) {
        console.warn('Rate limiter database query failed:', err.message);
    }

    if (!file) {
        unlinkSafe();
        return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const isPremium = false; // VIP subscriptions now spend credits instead of having infinite generations
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

        const clientImageUrl = (imageUrl && !imageUrl.startsWith('data:'))
            ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
            : imageUrl;

        res.json({
            success: true,
            imageUrl: clientImageUrl,
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

app.use((err, req, res, next) => {
    if (err) {
        console.error('Express global error handler:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'FILE_TOO_LARGE', message: 'File is too large. Max limit is 10MB.' });
        }
        return res.status(err.status || 500).json({ success: false, error: err.code || 'SERVER_ERROR', message: err.message });
    }
    next();
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
