/**
 * Import Log Repository — Queries sobre "VehicleImportLogs" y "VehicleImportRowErrors"
 */

import { db } from '../connection';
import {
  VehicleImportLogEntity,
  VehicleImportRowErrorEntity,
  ImportStatusValue,
} from '../entities/VehicleImportLog.entity';

export const importLogRepo = {

  /** Obtener el último import log de un tenant (ordenado por StartedAt DESC) */
  async getLatest(tenantId: string): Promise<VehicleImportLogEntity | null> {
    return db.queryOne<VehicleImportLogEntity>(
      `SELECT * FROM "VehicleImportLogs"
       WHERE "TenantId" = $1 AND "DeletedDate" IS NULL
       ORDER BY "StartedAt" DESC LIMIT 1`,
      [tenantId]
    );
  },

  /** Obtener el último import log de un archivo específico */
  async getLatestByFileName(
    fileName: string,
    tenantId: string
  ): Promise<VehicleImportLogEntity | null> {
    return db.queryOne<VehicleImportLogEntity>(
      `SELECT * FROM "VehicleImportLogs"
       WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL
       ORDER BY "StartedAt" DESC LIMIT 1`,
      [`%${fileName}%`, tenantId]
    );
  },

  /** Obtener logs por status */
  async getByStatus(
    status: ImportStatusValue,
    tenantId: string
  ): Promise<VehicleImportLogEntity[]> {
    return db.query<VehicleImportLogEntity>(
      `SELECT * FROM "VehicleImportLogs"
       WHERE "Status" = $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL
       ORDER BY "StartedAt" DESC`,
      [status, tenantId]
    );
  },

  /** Obtener los errores de una importación específica */
  async getRowErrors(
    importLogId: string
  ): Promise<VehicleImportRowErrorEntity[]> {
    return db.query<VehicleImportRowErrorEntity>(
      `SELECT * FROM "VehicleImportRowErrors"
       WHERE "ImportLogId" = $1
       ORDER BY "RowNumber" ASC`,
      [importLogId]
    );
  },

  /**
   * Polling: esperar hasta que el import termine (sale de Pending)
   * Usar después de hacer click en "Importar" para esperar el procesamiento
   */
  async waitForCompletion(
    importLogId: string,
    timeoutMs = 120_000,
    intervalMs = 3_000
  ): Promise<VehicleImportLogEntity | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const log = await db.queryOne<VehicleImportLogEntity>(
        `SELECT * FROM "VehicleImportLogs" WHERE "Id" = $1`,
        [importLogId]
      );
      if (log && log.Status !== 'Pending') return log;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return null;
  },

  /**
   * PRECONDITION CLEANUP — Eliminar logs de importación de prueba
   * Limpia los logs del Excel Vehicle-To-Import para repetir la prueba
   * ⚠️ Solo usar con el archivo de test
   */
  async deleteTestImportLogs(fileName: string, tenantId: string): Promise<number> {
    // Primero eliminar los row errors asociados
    await db.query(
      `DELETE FROM "VehicleImportRowErrors"
       WHERE "ImportLogId" IN (
         SELECT "Id" FROM "VehicleImportLogs"
         WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2
       )`,
      [`%${fileName}%`, tenantId]
    );

    // Luego eliminar los logs
    const result = await db.query<{ id: string }>(
      `DELETE FROM "VehicleImportLogs"
       WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2 RETURNING "Id"`,
      [`%${fileName}%`, tenantId]
    );
    return result.length;
  },
};
