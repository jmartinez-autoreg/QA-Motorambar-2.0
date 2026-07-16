require('dotenv').config({ path: '.env.playwright' });
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DB_CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
const VINS = ['5XYK00DF7TG427518','5XYK00DF7TG427519','5XYK00DF7TG427520','5XYK00DF7TG427521','5XYK00DF7TG427522','5XYK00DF7TG427523','5XYK00DF7TG427524','5XYK00DF7TG427525'];
const TENANT = '1d635f14-6fca-40f8-b446-f0dc892966d6';
Promise.all([
  p.query('SELECT COUNT(*) as c FROM "Vehicles" WHERE "Vin" = ANY($1) AND "TenantId" = $2', [VINS, TENANT]),
  p.query('SELECT COUNT(*) as c FROM "VehicleImportLogs" WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2', ['%Vehicle-To-Import%', TENANT])
]).then(([v, l]) => {
  console.log('Vehicles en DB con test VINs:', v.rows[0].c);
  console.log('Import logs en DB (Vehicle-To-Import):', l.rows[0].c);
  p.end();
}).catch(e => { console.error(e.message); p.end(); });
