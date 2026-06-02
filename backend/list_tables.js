'use strict';
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_YSqa2IfVxR6E@ep-muddy-wave-afiaaeyd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in database:");
    console.log(res.rows);
  } catch (err) {
    console.error("Failed to list tables:", err);
  } finally {
    await pool.end();
  }
}

main();
