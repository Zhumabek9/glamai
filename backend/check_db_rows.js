'use strict';
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_YSqa2IfVxR6E@ep-muddy-wave-afiaaeyd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const res = await pool.query('SELECT * FROM generations ORDER BY id DESC LIMIT 10');
    console.log("Last 10 generations:");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Database query failed:", err);
  } finally {
    await pool.end();
  }
}

main();
