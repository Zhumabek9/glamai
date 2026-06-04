'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-in-production-secret';
const COOKIE_NAME = 'hairstyle_auth';
const FREE_CREDITS_SIGNUP = parseInt(process.env.FREE_CREDITS_SIGNUP ?? '20', 10);

function hashPassword(password) {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(password, salt);
}

function verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
}

async function userByEmail(email) {
    const res = await db.query(
        'SELECT id, email, password_hash AS "passwordHash", credits, subscription_tier, subscription_status, subscription_end, referral_code, role FROM users WHERE lower(email)=lower($1)',
        [email]
    );
    return res.rows[0] || null;
}

async function userById(id) {
    const res = await db.query(
        'SELECT id, email, credits, subscription_tier, subscription_status, subscription_end, referral_code, role FROM users WHERE id=$1',
        [id]
    );
    return res.rows[0] || null;
}

async function createUser(email, password, referredByCode = null) {
    const passwordHash = hashPassword(password);
    const credits = FREE_CREDITS_SIGNUP;
    const referralCode = `GLAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Resolve referred_by
    let referredByUserId = null;
    if (referredByCode) {
        const referrerRes = await db.query('SELECT id FROM users WHERE referral_code = $1', [referredByCode]);
        if (referrerRes.rows[0]) {
            referredByUserId = referrerRes.rows[0].id;
        }
    }

    const insertRes = await db.query(
        'INSERT INTO users (email, password_hash, credits, referral_code, referred_by) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [email, passwordHash, credits, referralCode, referredByUserId]
    );
        
    const newUserId = insertRes.rows[0].id;
    
    // If referred, award +50 tokens to both referrer and new user!
    if (referredByUserId) {
        await addCredits(referredByUserId, 50);
        await addCredits(newUserId, 50);
    }
    
    return { id: newUserId, email, credits: referredByUserId ? credits + 50 : credits, referralCode, role: 'user' };
}

async function addCredits(userId, amount) {
    await db.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, userId]);
}

async function decrementCredit(userId, amount = 10) {
    const uRes = await db.query('SELECT credits FROM users WHERE id = $1', [userId]);
    const u = uRes.rows[0];
    if (!u || u.credits < amount) return false;
    const r = await db.query(
        'UPDATE users SET credits = credits - $1 WHERE id = $2 AND credits >= $3',
        [amount, userId, amount]
    );
    return r.rowCount === 1;
}

async function refundCredit(userId, amount = 10) {
    await db.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [amount, userId]);
}

function signToken(userRow) {
    return jwt.sign(
        {
            sub: String(userRow.id),
            email: userRow.email,
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );
}

async function parseAuthCookie(cookieHeader) {
    if (!cookieHeader) return null;
    try {
        const parsed = cookie.parse(cookieHeader);
        const token = parsed[COOKIE_NAME];
        if (!token) return null;
        const payload = jwt.verify(token, JWT_SECRET);
        const uid = Number(payload.sub);
        if (!Number.isFinite(uid)) return null;
        const user = await userById(uid);
        return user || null;
    } catch {
        return null;
    }
}

function setAuthCookie(res, token) {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        cookie.serialize(COOKIE_NAME, token, {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: Boolean(isProd),
            maxAge: 60 * 60 * 24 * 30,
        })
    );
}

function clearAuthCookie(res) {
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        cookie.serialize(COOKIE_NAME, '', {
            httpOnly: true,
            path: '/',
            sameSite: 'lax',
            secure: Boolean(isProd),
            maxAge: 0,
        })
    );
}

async function guestTrialState(ip) {
    const res = await db.query('SELECT trials_used FROM guest_trials WHERE ip = $1', [ip]);
    const row = res.rows[0];
    return row?.trials_used ?? 0;
}

async function markGuestTrialUsed(ip) {
    await db.query(`
    INSERT INTO guest_trials (ip, trials_used) VALUES ($1, 1)
    ON CONFLICT(ip) DO UPDATE SET trials_used = guest_trials.trials_used + 1,
      updated_at = CURRENT_TIMESTAMP
  `, [ip]);
}

async function logGeneration({ userId, ip, style, color, gender, ok, taskType = 'hairstyle', makeup = null, beard = null, nails = null, retouch = null, resultUrl = null }) {
    await db.query(`
    INSERT INTO generations (user_id, ip, style, color, gender, ok, task_type, makeup, beard, nails, retouch, result_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
  `, [
      userId ?? null,
      ip ?? null,
      style ?? null,
      color ?? null,
      gender ?? null,
      ok ? 1 : 0,
      taskType,
      makeup,
      beard,
      nails,
      retouch,
      resultUrl
  ]);
}

module.exports = {
    COOKIE_NAME,
    FREE_CREDITS_SIGNUP,
    JWT_SECRET,
    hashPassword,
    verifyPassword,
    userByEmail,
    userById,
    createUser,
    signToken,
    parseAuthCookie,
    setAuthCookie,
    clearAuthCookie,
    addCredits,
    decrementCredit,
    refundCredit,
    guestTrialState,
    markGuestTrialUsed,
    logGeneration,
};
