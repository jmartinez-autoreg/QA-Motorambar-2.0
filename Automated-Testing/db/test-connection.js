require('dotenv').config({ path: '.env.playwright' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT current_database() as db')
  .then(r => pool.query('SELECT COUNT(*) as vehicles FROM "Vehicles"').then(r2 => {
    console.log('✅ Conectado! DB=' + r.rows[0].db + ' | Vehicles=' + r2.rows[0].vehicles);
    pool.end();
  }))
  .catch(e => {
    console.error('❌ Error: ' + e.message);
    pool.end();
  });
