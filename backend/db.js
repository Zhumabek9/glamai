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

module.exports = { db };
