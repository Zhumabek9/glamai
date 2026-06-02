'use strict';
const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_YSqa2IfVxR6E@ep-muddy-wave-afiaaeyd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const tables = ['users', 'generations'];
    for (const t of tables) {
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [t]);
      console.log(`Columns for table ${t}:`);
      console.log(res.rows);
    }
  } catch (err) {
    console.error("Failed to query columns:", err);
  } finally {
    await pool.end();
  }
}

main();
