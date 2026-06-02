'use strict';
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YSqa2IfVxR6E@ep-muddy-wave-afiaaeyd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

const db = require('./db.js');

async function main() {
  console.log("Starting database initialization...");
  // Allow 5 seconds for DDL queries to finish
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Now verify tables
  try {
    const res = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Verify tables in database:");
    console.log(res.rows);
  } catch (err) {
    console.error("Verification query failed:", err);
  } finally {
    await db.pool.end();
  }
}

main();
