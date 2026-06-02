'use strict';

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('CRITICAL: DATABASE_URL environment variable is missing!');
}

const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

// Helper query function
const query = (text, params) => pool.query(text, params);

// Migrations helper to safely add columns if they do not exist
async function ensureColumn(table, column, definition) {
  try {
    // Table names in pg information_schema are lowercase by default
    const res = await pool.query(
      `SELECT 1 FROM information_schema.columns 
       WHERE table_name = $1 AND column_name = $2`,
      [table.toLowerCase(), column.toLowerCase()]
    );
    if (res.rowCount === 0) {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`Migration: Added column '${column}' to table '${table}'`);
    }
  } catch (err) {
    console.error(`Migration error on table ${table}, column ${column}:`, err.message);
  }
}

// Database tables initialization
async function initDb() {
  if (!connectionString) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        credits INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS guest_trials (
        ip TEXT PRIMARY KEY,
        trials_used INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS generations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        ip TEXT,
        style TEXT,
        color TEXT,
        gender TEXT,
        ok INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS stripe_events (
        id TEXT PRIMARY KEY,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrate users table
    await ensureColumn('users', 'subscription_tier', "TEXT DEFAULT 'free'");
    await ensureColumn('users', 'subscription_status', "TEXT DEFAULT 'inactive'");
    await ensureColumn('users', 'subscription_id', "TEXT");
    await ensureColumn('users', 'subscription_end', "TEXT");
    await ensureColumn('users', 'referral_code', "TEXT");
    await ensureColumn('users', 'referred_by', "INTEGER");

    // Migrate generations table
    await ensureColumn('generations', 'task_type', "TEXT DEFAULT 'hairstyle'");
    await ensureColumn('generations', 'makeup', "TEXT");
    await ensureColumn('generations', 'beard', "TEXT");
    await ensureColumn('generations', 'nails', "TEXT");
    await ensureColumn('generations', 'retouch', "TEXT");
    await ensureColumn('generations', 'result_url', "TEXT");

    console.log('Postgres Database initialized successfully.');
  } catch (err) {
    console.error('Postgres database tables creation failed:', err.message);
  }
}

// Automatically start database DDL initialization
initDb();

module.exports = {
  pool,
  query
};
