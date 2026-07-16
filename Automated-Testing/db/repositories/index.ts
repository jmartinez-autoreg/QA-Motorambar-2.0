/**
 * DB Repositories — Barrel export
 *
 * Uso en specs:
 *   import { vehicleRepo, importLogRepo, db } from '../../db/repositories';
 */

export { vehicleRepo } from './vehicle.repository';
export { importLogRepo } from './import-log.repository';
export { db } from '../connection';
export { DB_CONFIG } from '../config';

// Entidades
export type { VehicleEntity, } from '../entities/Vehicle.entity';
export { StatusCO, StatusCPA, StatusInvoice, ReleaseStatus } from '../entities/Vehicle.entity';
export type { VehicleImportLogEntity, VehicleImportRowErrorEntity } from '../entities/VehicleImportLog.entity';
export { ImportStatus, ImportStatusLabel } from '../entities/VehicleImportLog.entity';
