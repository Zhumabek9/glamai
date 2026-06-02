'use strict';
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_YSqa2IfVxR6E@ep-muddy-wave-afiaaeyd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const queries = [
      'ALTER TABLE generations ADD COLUMN IF NOT EXISTS makeup TEXT',
      'ALTER TABLE generations ADD COLUMN IF NOT EXISTS beard TEXT',
      'ALTER TABLE generations ADD COLUMN IF NOT EXISTS nails TEXT',
      'ALTER TABLE generations ADD COLUMN IF NOT EXISTS retouch TEXT',
      'ALTER TABLE generations ADD COLUMN IF NOT EXISTS result_url TEXT'
    ];
    
    for (const q of queries) {
      await pool.query(q);
      console.log(`Executed: ${q}`);
    }
    console.log("All columns added successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

main();
