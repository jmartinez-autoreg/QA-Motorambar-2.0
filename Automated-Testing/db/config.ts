/**
 * DB Config — PostgreSQL connection para tests E2E
 *
 * Agrega en .env.playwright:
 *   DB_CONNECTION_STRING=postgresql://user:password@host:5432/dbname
 *
 * O variables individuales:
 *   DB_HOST=localhost
 *   DB_PORT=5432
 *   DB_NAME=DistributionCar
 *   DB_USER=postgres
 *   DB_PASSWORD=your_password
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.playwright' });

export const DB_CONFIG = {
  connectionString: process.env.DB_CONNECTION_STRING || undefined,
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'DistributionCar',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',

  // Tenant ID del ambiente de test (Motorambar Test)
  // Usar para filtrar queries por tenant
  tenantId: process.env.TEST_TENANT_ID || '',

  // Opciones de pool
  max:            5,
  idleTimeoutMs:  10_000,
  connectionTimeoutMs: 5_000,
};
