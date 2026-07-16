/**
 * Precondition Helper — Limpieza de datos de prueba en DB
 *
 * REGLA OBLIGATORIA (Automated-Context.md):
 *   Todo spec WRITE que importe, cree o elimine datos DEBE llamar
 *   a `runPreconditionCleanup()` en `beforeAll`. Sin esta limpieza,
 *   el test puede fallar por datos remanentes de ejecuciones anteriores.
 *
 * Qué limpia:
 *   1. Vehicles — elimina por VINs del Excel de prueba
 *   2. VehicleImportRowErrors — elimina por nombre del archivo de prueba
 *   3. VehicleImportLogs — elimina por nombre del archivo de prueba
 *
 * Orden de eliminación (FK constraints PostgreSQL):
 *   VehicleImportRowErrors → VehicleImportLogs → Vehicles
 *   (Vehicles.ImportedFromFileId es nullable → se puede borrar en cualquier orden)
 *
 * Si la limpieza falla → lanza error descriptivo y para el test.
 * NO continuar silenciosamente con datos sucios = resultados falsos.
 */

import { db } from '../connection';
import { DB_CONFIG } from '../config';
import { IMPORT_DATA } from '../../fixtures/vehicles/import.fixture';

const TEST_EXCEL_FILENAME = 'Vehicle-To-Import';
const TENANT_ID = DB_CONFIG.tenantId;

export interface PreconditionReport {
  vehiclesFound:    number;
  vehiclesDeleted:  number;
  importLogsFound:  number;
  importLogsDeleted: number;
  rowErrorsDeleted: number;
  tenantId:         string;
}

/**
 * Verifica qué datos de prueba existen en DB sin eliminarlos.
 * Útil para loggear antes de la limpieza.
 */
export async function checkTestDataExists(): Promise<{
  vehicles: number;
  importLogs: number;
  rowErrors: number;
}> {
  if (!TENANT_ID) {
    console.warn('[PRECONDITION] TEST_TENANT_ID no configurado — skip DB check');
    return { vehicles: 0, importLogs: 0, rowErrors: 0 };
  }

  const testVins = IMPORT_DATA.allValid.map(v => v.vin);

  const [vehiclesResult, logsResult] = await Promise.all([
    db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Vehicles"
       WHERE "Vin" = ANY($1) AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [testVins, TENANT_ID]
    ),
    db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "VehicleImportLogs"
       WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2`,
      [`%${TEST_EXCEL_FILENAME}%`, TENANT_ID]
    ),
  ]);

  const vehicleCount = parseInt(vehiclesResult?.count ?? '0');
  const logCount = parseInt(logsResult?.count ?? '0');

  // Row errors = los que pertenecen a los import logs de este archivo
  let rowErrorCount = 0;
  if (logCount > 0) {
    const rowErrorResult = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "VehicleImportRowErrors"
       WHERE "ImportLogId" IN (
         SELECT "Id" FROM "VehicleImportLogs"
         WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2
       )`,
      [`%${TEST_EXCEL_FILENAME}%`, TENANT_ID]
    );
    rowErrorCount = parseInt(rowErrorResult?.count ?? '0');
  }

  return { vehicles: vehicleCount, importLogs: logCount, rowErrors: rowErrorCount };
}

/**
 * Ejecuta la limpieza completa de datos de prueba.
 *
 * @throws Error si TEST_TENANT_ID no está configurado (evita borrar datos del tenant incorrecto)
 * @throws Error si la limpieza de DB falla (no continuar con datos sucios)
 */
export async function runPreconditionCleanup(): Promise<PreconditionReport> {
  if (!TENANT_ID) {
    throw new Error(
      '[PRECONDITION] TEST_TENANT_ID no está configurado en .env.playwright.\n' +
      'Configura el GUID del tenant Motorambar Test antes de ejecutar specs WRITE.\n' +
      'Ejemplo: TEST_TENANT_ID=1d635f14-6fca-40f8-b446-f0dc892966d6'
    );
  }

  const testVins = IMPORT_DATA.allValid.map(v => v.vin);
  const report: PreconditionReport = {
    vehiclesFound:    0,
    vehiclesDeleted:  0,
    importLogsFound:  0,
    importLogsDeleted: 0,
    rowErrorsDeleted: 0,
    tenantId:         TENANT_ID,
  };

  try {
    // 1. Verificar qué existe
    const existing = await checkTestDataExists();
    report.vehiclesFound   = existing.vehicles;
    report.importLogsFound = existing.importLogs;

    console.log(`[PRECONDITION] Estado antes de limpieza:`);
    console.log(`  Vehicles con test VINs: ${existing.vehicles}`);
    console.log(`  Import logs (${TEST_EXCEL_FILENAME}): ${existing.importLogs}`);
    console.log(`  Row errors: ${existing.rowErrors}`);

    if (existing.vehicles === 0 && existing.importLogs === 0) {
      console.log(`[PRECONDITION] ✅ Sistema limpio — no hay datos de prueba previos`);
      return report;
    }

    // 2. Eliminar en orden correcto (respetando FK constraints)
    await db.transaction(async (client) => {
      // 2a. Eliminar VehicleImportRowErrors (FK → VehicleImportLogs)
      const rowErrorResult = await client.query(
        `DELETE FROM "VehicleImportRowErrors"
         WHERE "ImportLogId" IN (
           SELECT "Id" FROM "VehicleImportLogs"
           WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2
         )`,
        [`%${TEST_EXCEL_FILENAME}%`, TENANT_ID]
      );
      report.rowErrorsDeleted = rowErrorResult.rowCount ?? 0;

      // 2b. Eliminar Vehicles (ImportedFromFileId es nullable — sin FK violation)
      const vehicleResult = await client.query(
        `DELETE FROM "Vehicles"
         WHERE "Vin" = ANY($1) AND "TenantId" = $2`,
        [testVins, TENANT_ID]
      );
      report.vehiclesDeleted = vehicleResult.rowCount ?? 0;

      // 2c. Eliminar VehicleImportLogs
      const logResult = await client.query(
        `DELETE FROM "VehicleImportLogs"
         WHERE "OriginalFileName" ILIKE $1 AND "TenantId" = $2`,
        [`%${TEST_EXCEL_FILENAME}%`, TENANT_ID]
      );
      report.importLogsDeleted = logResult.rowCount ?? 0;
    });

    console.log(`[PRECONDITION] ✅ Limpieza completada:`);
    console.log(`  Vehicles eliminados: ${report.vehiclesDeleted}`);
    console.log(`  Import logs eliminados: ${report.importLogsDeleted}`);
    console.log(`  Row errors eliminados: ${report.rowErrorsDeleted}`);

    return report;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[PRECONDITION] ❌ La limpieza de datos de prueba falló.\n` +
      `Causa: ${msg}\n\n` +
      `⛔ El test NO puede continuar con datos sucios — los resultados serían inválidos.\n` +
      `Acción requerida: Verificar la DB manualmente o corregir el error antes de reintentar.\n` +
      `Datos afectados: ${JSON.stringify({ testVins, testFile: TEST_EXCEL_FILENAME, tenantId: TENANT_ID })}`
    );
  }
}
