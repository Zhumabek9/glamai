'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { db } = require('./db');

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

function userByEmail(email) {
    return db.prepare('SELECT id, email, password_hash AS passwordHash, credits FROM users WHERE lower(email)=lower(?)').get(
        email
    );
}

function userById(id) {
    return db.prepare('SELECT id, email, credits FROM users WHERE id=?').get(id);
}

function createUser(email, password) {
    const passwordHash = hashPassword(password);
    const credits = FREE_CREDITS_SIGNUP;
    const info = db
        .prepare('INSERT INTO users (email, password_hash, credits) VALUES (?,?,?)')
        .run(email, passwordHash, credits);
    return { id: info.lastInsertRowid, email, credits };
}

function addCredits(userId, amount) {
    db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, userId);
}

function decrementCredit(userId, amount = 10) {
    const u = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId);
    if (!u || u.credits < amount) return false;
    const r = db
        .prepare('UPDATE users SET credits = credits - ? WHERE id = ? AND credits >= ?')
        .run(amount, userId, amount);
    return r.changes === 1;
}

function refundCredit(userId, amount = 10) {
    db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(amount, userId);
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

function parseAuthCookie(cookieHeader) {
    if (!cookieHeader) return null;
    try {
        const parsed = cookie.parse(cookieHeader);
        const token = parsed[COOKIE_NAME];
        if (!token) return null;
        const payload = jwt.verify(token, JWT_SECRET);
        const uid = Number(payload.sub);
        if (!Number.isFinite(uid)) return null;
        const user = userById(uid);
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

function guestTrialState(ip) {
    const row = db.prepare('SELECT trials_used FROM guest_trials WHERE ip = ?').get(ip);
    return row?.trials_used ?? 0;
}

function markGuestTrialUsed(ip) {
    db.prepare(`
    INSERT INTO guest_trials (ip, trials_used) VALUES (?, 1)
    ON CONFLICT(ip) DO UPDATE SET trials_used = guest_trials.trials_used + 1,
      updated_at = datetime('now')
  `).run(ip);
}

function logGeneration({ userId, ip, style, color, gender, ok }) {
    db.prepare(`
    INSERT INTO generations (user_id, ip, style, color, gender, ok)
    VALUES (?,?,?,?,?,?)
  `).run(userId ?? null, ip ?? null, style, color, gender, ok ? 1 : 0);
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
