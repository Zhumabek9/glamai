'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const Stripe = require('stripe');

const {
  verifyToken,
  findOrCreateUser,
  getUserByUid,
  addCredits,
  decrementCredits,
  refundCredits,
  getCredits,
  logGeneration,
  getGuestTrials,
  markGuestTrialUsed,
  stripeEventExists,
  recordStripeEvent,
  FREE_CREDITS_SIGNUP,
} = require('./firebase-admin');

// nanobanana-bridge — copied from backend/
const { callNanoBanana } = require('./nanobanana-bridge');

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for Functions

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://glamai-353ae.web.app').replace(/\/+$/, '');
const GUEST_TRIALS_ALLOWED = Number(process.env.GUEST_FREE_TRIALS ?? '1');

const PACKS = {
  'lite-monthly':  { credits: 200,  priceId: process.env.STRIPE_PRICE_LITE_MONTHLY  || '', label: 'Lite Monthly' },
  'pro-monthly':   { credits: 3000, priceId: process.env.STRIPE_PRICE_PRO_MONTHLY   || '', label: 'Pro Monthly' },
  'lite-yearly':   { credits: 200,  priceId: process.env.STRIPE_PRICE_LITE_YEARLY   || '', label: 'Lite Yearly' },
  'pro-yearly':    { credits: 3000, priceId: process.env.STRIPE_PRICE_PRO_YEARLY    || '', label: 'Pro Yearly' },
  'lite-onetime':  { credits: 200,  priceId: process.env.STRIPE_PRICE_LITE_ONETIME  || '', label: 'Lite One-Time' },
  'pro-onetime':   { credits: 3000, priceId: process.env.STRIPE_PRICE_PRO_ONETIME   || '', label: 'Pro One-Time' },
  'ultra-onetime': { credits: 6000, priceId: process.env.STRIPE_PRICE_ULTRA_ONETIME || '', label: 'Ultra One-Time' },
};

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const app = express();

app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

// ── Stripe webhook (raw body needed) ─────────────────────────────────────────
app.post('/api/stripe/webhook',
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
        const exists = await stripeEventExists(event.id);
        if (exists) return res.json({ received: true, duplicate: true });

        const uid    = sess.metadata?.user_id;
        const credits = Number(sess.metadata?.credits || 0);

        if (uid && credits > 0) {
          await addCredits(uid, credits);
          console.log(`Added ${credits} credits to uid=${uid}`);
        }

        await recordStripeEvent(event.id, {
          type: event.type,
          uid,
          credits,
          pack: sess.metadata?.pack,
        });
      }
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.use(express.json());

// ── Firebase token middleware — attach uid to req ─────────────────────────────
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = await verifyToken(token);
      req.firebaseUid = decoded.uid;
      req.firebaseEmail = decoded.email;
    } catch {
      req.firebaseUid = null;
    }
  } else {
    req.firebaseUid = null;
  }
  next();
});

// ── Public config ─────────────────────────────────────────────────────────────
app.get('/api/config', (_, res) => {
  res.json({
    publicUrl: PUBLIC_BASE_URL,
    freeCreditsSignup: FREE_CREDITS_SIGNUP,
    guestTrialsAllowed: GUEST_TRIALS_ALLOWED,
    packs: Object.entries(PACKS).map(([id, v]) => ({
      id, label: v.label, credits: v.credits, priceConfigured: Boolean(v.priceId),
    })),
    stripeEnabled: Boolean(stripe && process.env.STRIPE_WEBHOOK_SECRET),
    authBackend: true,
  });
});

app.get('/health', (_, res) => res.json({ ok: true, backend: 'firebase-functions' }));

// ── Firebase Auth sync ────────────────────────────────────────────────────────
app.post('/api/auth/firebase', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'MISSING_TOKEN' });

  try {
    const decoded = await verifyToken(idToken);
    const user = await findOrCreateUser(decoded.uid, decoded.email, decoded.name);
    res.json({ ok: true, user: { id: user.uid, email: user.email, credits: user.credits } });
  } catch (err) {
    console.error('/api/auth/firebase error:', err.message);
    res.status(401).json({ error: 'INVALID_TOKEN' });
  }
});

app.post('/api/auth/logout', (_, res) => {
  // Firebase Auth session is managed client-side — nothing to do server-side
  res.json({ ok: true });
});

// ── User profile ──────────────────────────────────────────────────────────────
app.get('/api/me', async (req, res) => {
  if (!req.firebaseUid) return res.status(401).json({ authenticated: false });
  try {
    const user = await getUserByUid(req.firebaseUid);
    if (!user) return res.status(401).json({ authenticated: false });
    res.json({ authenticated: true, user: { id: user.uid, email: user.email, credits: user.credits } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stripe Checkout ───────────────────────────────────────────────────────────
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'STRIPE_NOT_CONFIGURED' });
  if (!req.firebaseUid) return res.status(401).json({ error: 'LOGIN_REQUIRED' });

  const packId = String(req.body.pack || 'starter');
  const pack = PACKS[packId];
  if (!pack?.priceId) return res.status(400).json({ error: 'UNKNOWN_PACK_OR_PRICE_NOT_SET' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: pack.priceId, quantity: 1 }],
      metadata: {
        user_id: req.firebaseUid,
        credits: String(pack.credits),
        pack: packId,
      },
      success_url: `${PUBLIC_BASE_URL}/?paid=1`,
      cancel_url: `${PUBLIC_BASE_URL}/?cancel=1`,
      client_reference_id: req.firebaseUid,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'CHECKOUT_CREATE_FAILED', message: e.message });
  }
});

app.post('/api/checkout/mock-success', async (req, res) => {
  if (!req.firebaseUid) return res.status(401).json({ error: 'LOGIN_REQUIRED' });
  const { packId, credits } = req.body;
  let amount = Number(credits);
  if (!amount && packId) amount = PACKS[packId]?.credits || 0;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'INVALID_CREDITS' });

  try {
    await addCredits(req.firebaseUid, amount);
    const newBalance = await getCredits(req.firebaseUid);
    res.json({ success: true, credits: newBalance });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI Generation ─────────────────────────────────────────────────────────────
app.post('/api/generate', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { style = '', styleId = '', color = '', gender = '' } = req.body;

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

  if (!file) return res.status(400).json({ success: false, error: 'No image uploaded' });

  let paidWith = null;
  let uid = req.firebaseUid || null;

  if (!uid) {
    // Guest trial check
    const used = await getGuestTrials(ip);
    if (used >= GUEST_TRIALS_ALLOWED) {
      return res.status(402).json({ success: false, code: 'LOGIN_REQUIRED', error: 'Sign in or buy credits' });
    }
    await markGuestTrialUsed(ip);
    paidWith = 'guest';
  } else {
    // Deduct credits atomically
    const ok = await decrementCredits(uid);
    if (!ok) {
      return res.status(402).json({ success: false, code: 'NEED_CREDITS', error: 'Not enough credits' });
    }
    paidWith = 'credit';
  }

  try {
    console.log(`Generating: ${gender} ${color} ${style} (ID: ${styleId}) (${paidWith})`);

    // Write buffer to temp file for nanobanana-bridge
    const tmpPath = `/tmp/upload_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    fs.writeFileSync(tmpPath, file.buffer);

    const bridgeRes = await callNanoBanana(tmpPath, { style, styleId, color, gender });

    try { fs.unlinkSync(tmpPath); } catch (_) {}

    if (!bridgeRes.success) throw new Error(bridgeRes.error || 'Replicate generation failed');

    const imageUrl = bridgeRes.url;

    await logGeneration({ uid, ip: uid ? null : ip, style, color, gender, ok: true, imageUrl });

    const creditsRemaining = uid ? await getCredits(uid) : undefined;

    res.json({
      success: true,
      imageUrl,
      creditsRemaining,
      trialNote: paidWith === 'guest' ? 'guest_trial_used' : undefined,
    });
  } catch (error) {
    console.error('Generation error:', error);
    if (paidWith === 'credit' && uid) await refundCredits(uid);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
