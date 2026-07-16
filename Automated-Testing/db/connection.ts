/**
 * DB Connection — Pool de conexiones PostgreSQL (singleton)
 *
 * Uso:
 *   import { db } from '../db/connection';
 *   const result = await db.query('SELECT * FROM "Vehicles" WHERE "Vin" = $1', [vin]);
 *   await db.close();  // llamar en afterAll si se usa en tests
 */

import { Pool, PoolClient } from 'pg';
import { DB_CONFIG } from './config';

class DbConnection {
  private pool: Pool | null = null;

  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool(
        DB_CONFIG.connectionString
          ? {
              connectionString: DB_CONFIG.connectionString,
              // Azure PostgreSQL requiere SSL — rejectUnauthorized: false acepta cert self-signed
              ssl: { rejectUnauthorized: false },
            }
          : {
              host:     DB_CONFIG.host,
              port:     DB_CONFIG.port,
              database: DB_CONFIG.database,
              user:     DB_CONFIG.user,
              password: DB_CONFIG.password,
              max:      DB_CONFIG.max,
              idleTimeoutMillis:    DB_CONFIG.idleTimeoutMs,
              connectionTimeoutMillis: DB_CONFIG.connectionTimeoutMs,
              ssl: { rejectUnauthorized: false },
            }
      );

      this.pool.on('error', (err) => {
        console.error('[DB] Error inesperado en cliente del pool:', err.message);
      });
    }
    return this.pool;
  }

  /** Ejecutar query con parámetros */
  async query<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<T[]> {
    const pool = this.getPool();
    const result = await pool.query(sql, params);
    return result.rows as T[];
  }

  /** Ejecutar query y obtener primera fila (o null) */
  async queryOne<T = Record<string, unknown>>(
    sql: string,
    params?: unknown[]
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /** Ejecutar múltiples queries en una transacción */
  async transaction<T>(
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = this.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /** Cerrar el pool — llamar en afterAll de specs que usen DB */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  /** Verificar conectividad con la base de datos */
  async ping(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

export const db = new DbConnection();
