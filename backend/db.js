'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath =
    process.env.SQLITE_PATH ||
    path.join(__dirname, 'data', 'app.sqlite');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS guest_trials (
  ip TEXT PRIMARY KEY,
  trials_used INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  ip TEXT,
  style TEXT,
  color TEXT,
  gender TEXT,
  ok INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// Migrations helper to safely add columns if they do not exist
function ensureColumn(table, column, definition) {
  try {
    const info = db.pragma(`table_info(${table})`);
    const exists = info.some(col => col.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Migration: Added column '${column}' to table '${table}'`);
    }
  } catch (err) {
    console.error(`Migration error on table ${table}, column ${column}:`, err.message);
  }
}

// Migrate users table
ensureColumn('users', 'subscription_tier', "TEXT DEFAULT 'free'");
ensureColumn('users', 'subscription_status', "TEXT DEFAULT 'inactive'");
ensureColumn('users', 'subscription_id', "TEXT");
ensureColumn('users', 'subscription_end', "TEXT");
ensureColumn('users', 'referral_code', "TEXT");
ensureColumn('users', 'referred_by', "INTEGER");

// Migrate generations table
ensureColumn('generations', 'task_type', "TEXT DEFAULT 'hairstyle'");
ensureColumn('generations', 'makeup', "TEXT");
ensureColumn('generations', 'beard', "TEXT");
ensureColumn('generations', 'nails', "TEXT");
ensureColumn('generations', 'retouch', "TEXT");
ensureColumn('generations', 'result_url', "TEXT");

module.exports = { db };

