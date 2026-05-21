'use strict';

const admin = require('firebase-admin');

// When running inside Firebase Functions, Admin SDK initializes automatically
// using the project's default service account — no key file needed.
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const authAdmin = admin.auth();

// ── Firestore helpers ─────────────────────────────────────────────────────────

const FREE_CREDITS_SIGNUP = parseInt(process.env.FREE_CREDITS_SIGNUP ?? '20', 10);
const GENERATION_COST = 10;

/**
 * Verify a Firebase ID token and return the decoded payload.
 */
async function verifyToken(idToken) {
  return authAdmin.verifyIdToken(idToken);
}

/**
 * Get user document from Firestore by Firebase UID.
 */
async function getUserByUid(uid) {
  const snap = await db.collection('users').doc(uid).get();
  if (!snap.exists) return null;
  return { uid, ...snap.data() };
}

/**
 * Get user document from Firestore by email.
 */
async function getUserByEmail(email) {
  const snap = await db.collection('users')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() };
}

/**
 * Find or create user in Firestore after Firebase Auth login.
 * Returns the user document data.
 */
async function findOrCreateUser(uid, email, displayName) {
  const ref = db.collection('users').doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    return { uid, ...snap.data() };
  }

  // New user — create with free credits
  const userData = {
    email: email.toLowerCase(),
    displayName: displayName || '',
    credits: FREE_CREDITS_SIGNUP,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(userData);
  return { uid, ...userData, credits: FREE_CREDITS_SIGNUP };
}

/**
 * Add credits to a user.
 */
async function addCredits(uid, amount) {
  await db.collection('users').doc(uid).update({
    credits: admin.firestore.FieldValue.increment(amount),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Decrement credits atomically. Returns false if not enough credits.
 */
async function decrementCredits(uid, amount = GENERATION_COST) {
  const ref = db.collection('users').doc(uid);

  return db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) return false;
    const current = snap.data().credits || 0;
    if (current < amount) return false;
    t.update(ref, {
      credits: admin.firestore.FieldValue.increment(-amount),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  });
}

/**
 * Refund credits (on generation error).
 */
async function refundCredits(uid, amount = GENERATION_COST) {
  await addCredits(uid, amount);
}

/**
 * Get current credit balance.
 */
async function getCredits(uid) {
  const snap = await db.collection('users').doc(uid).get();
  return snap.exists ? (snap.data().credits || 0) : 0;
}

/**
 * Log a generation to Firestore for analytics.
 */
async function logGeneration({ uid, ip, style, color, gender, ok, imageUrl }) {
  await db.collection('generations').add({
    uid: uid || null,
    ip: ip || null,
    style,
    color,
    gender,
    ok,
    imageUrl: imageUrl || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Guest trial tracking via Firestore.
 */
async function getGuestTrials(ip) {
  const snap = await db.collection('guest_trials').doc(ip.replace(/\./g, '_')).get();
  return snap.exists ? (snap.data().trialsUsed || 0) : 0;
}

async function markGuestTrialUsed(ip) {
  const ref = db.collection('guest_trials').doc(ip.replace(/\./g, '_'));
  await ref.set({
    trialsUsed: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

/**
 * Log Stripe event ID (deduplication).
 */
async function stripeEventExists(eventId) {
  const snap = await db.collection('stripe_events').doc(eventId).get();
  return snap.exists;
}

async function recordStripeEvent(eventId, data) {
  await db.collection('stripe_events').doc(eventId).set({
    ...data,
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

module.exports = {
  admin,
  db,
  authAdmin,
  FREE_CREDITS_SIGNUP,
  GENERATION_COST,
  verifyToken,
  getUserByUid,
  getUserByEmail,
  findOrCreateUser,
  addCredits,
  decrementCredits,
  refundCredits,
  getCredits,
  logGeneration,
  getGuestTrials,
  markGuestTrialUsed,
  stripeEventExists,
  recordStripeEvent,
};
