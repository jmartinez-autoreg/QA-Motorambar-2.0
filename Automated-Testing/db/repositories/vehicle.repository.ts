/**
 * Vehicle Repository — Queries y operaciones sobre la tabla "Vehicles"
 *
 * Uso:
 *   import { vehicleRepo } from '../db/repositories';
 *   const vehicle = await vehicleRepo.findByVin('JN8BT3BA5TW332643', tenantId);
 *   await vehicleRepo.deleteTestVehicles(testVins, tenantId);
 */

import { db } from '../connection';
import { VehicleEntity, StatusCO } from '../entities/Vehicle.entity';

export const vehicleRepo = {

  /** Buscar un vehículo por VIN dentro de un tenant */
  async findByVin(vin: string, tenantId: string): Promise<VehicleEntity | null> {
    return db.queryOne<VehicleEntity>(
      `SELECT * FROM "Vehicles" WHERE "Vin" = $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vin, tenantId]
    );
  },

  /** Buscar múltiples vehículos por lista de VINs */
  async findByVins(vins: string[], tenantId: string): Promise<VehicleEntity[]> {
    if (vins.length === 0) return [];
    return db.query<VehicleEntity>(
      `SELECT * FROM "Vehicles" WHERE "Vin" = ANY($1) AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vins, tenantId]
    );
  },

  /** Verificar si un VIN existe en el sistema */
  async exists(vin: string, tenantId: string): Promise<boolean> {
    const result = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Vehicles" WHERE "Vin" = $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vin, tenantId]
    );
    return parseInt(result?.count ?? '0') > 0;
  },

  /** Obtener el StatusCO de un vehículo */
  async getStatusCO(vin: string, tenantId: string): Promise<number | null> {
    const vehicle = await db.queryOne<{ StatusCOId: number }>(
      `SELECT "StatusCOId" FROM "Vehicles" WHERE "Vin" = $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vin, tenantId]
    );
    return vehicle?.StatusCOId ?? null;
  },

  /** Verificar si el CO fue auto-generado (StatusCOId = Completado) */
  async hasCoGenerated(vin: string, tenantId: string): Promise<boolean> {
    const status = await this.getStatusCO(vin, tenantId);
    return status === StatusCO.Completado;
  },

  /**
   * PRECONDITION CLEANUP — Eliminar vehículos de prueba por VINs
   * Usar en el TC de precondición para dejar el sistema limpio antes del import.
   * ⚠️ Solo usar con VINs del Excel de prueba — nunca con VINs de producción.
   */
  async deleteTestVehicles(vins: string[], tenantId: string): Promise<number> {
    if (vins.length === 0) return 0;
    const result = await db.query<{ id: string }>(
      `DELETE FROM "Vehicles" WHERE "Vin" = ANY($1) AND "TenantId" = $2 RETURNING "Id"`,
      [vins, tenantId]
    );
    return result.length;
  },

  /**
   * Soft delete — marcar como eliminados sin borrar físicamente
   * Útil si el sistema usa soft delete
   */
  async softDeleteTestVehicles(vins: string[], tenantId: string): Promise<number> {
    if (vins.length === 0) return 0;
    const result = await db.query<{ id: string }>(
      `UPDATE "Vehicles" SET "DeletedDate" = NOW() WHERE "Vin" = ANY($1) AND "TenantId" = $2 AND "DeletedDate" IS NULL RETURNING "Id"`,
      [vins, tenantId]
    );
    return result.length;
  },

  /** Contar cuántos de los VINs de prueba existen en el sistema */
  async countExisting(vins: string[], tenantId: string): Promise<number> {
    if (vins.length === 0) return 0;
    const result = await db.queryOne<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "Vehicles" WHERE "Vin" = ANY($1) AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vins, tenantId]
    );
    return parseInt(result?.count ?? '0');
  },

  /** Obtener campos CO de un vehículo para verificar completitud */
  async getCoFields(vin: string, tenantId: string): Promise<Partial<VehicleEntity> | null> {
    return db.queryOne<Partial<VehicleEntity>>(
      `SELECT "Vin", "MakerId", "Year", "Pistons", "HorsePower", "UnloadedWeight",
              "LoadCapacity", "SeriesOrModel", "BodyType", "TitleDate", "Invoice",
              "DealerId", "StatusCOId"
       FROM "Vehicles" WHERE "Vin" = $1 AND "TenantId" = $2 AND "DeletedDate" IS NULL`,
      [vin, tenantId]
    );
  },

  /**
   * Polling: espera hasta que el CO sea generado o se alcanza el timeout
   * Usar después del import para verificar auto-generación de CO
   */
  async waitForCoGeneration(
    vin: string,
    tenantId: string,
    timeoutMs = 60_000,
    intervalMs = 3_000
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const generated = await this.hasCoGenerated(vin, tenantId);
      if (generated) return true;
      await new Promise(r => setTimeout(r, intervalMs));
    }
    return false;
  },
};
