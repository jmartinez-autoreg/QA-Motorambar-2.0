/**
 * Entidades de base de datos — Import Logs
 *
 * Tablas:
 *   "VehicleImportLogs"      → VehicleImportLogEntity
 *   "VehicleImportRowErrors" → VehicleImportRowErrorEntity
 *
 * Mapeo desde:
 *   - DistributionCar.Domain.VehicleImportLogs.VehicleImportLog.cs
 *   - DistributionCar.Domain.VehicleImportLogs.VehicleImportStatus.cs
 *   - VehicleImportLogConfiguration.cs / VehicleImportRowErrorConfiguration.cs
 */

/** Statuses del historial — VehicleImportStatus enum */
export const ImportStatus = {
  Pending:             'Pending',
  Completed:           'Completed',
  Failed:              'Failed',
  CompletedWithErrors: 'CompletedWithErrors',
  Canceled:            'Canceled',
} as const;

export type ImportStatusValue = (typeof ImportStatus)[keyof typeof ImportStatus];

/** Labels en español para UI */
export const ImportStatusLabel: Record<ImportStatusValue, string> = {
  Pending:             'Pendiente',
  Completed:           'Completado',
  Failed:              'Error',
  CompletedWithErrors: 'Completado con errores',
  Canceled:            'Cancelada',
};

/** Entidad VehicleImportLog — tabla "VehicleImportLogs" */
export interface VehicleImportLogEntity {
  Id:               string;             // UUID
  TenantId:         string;             // UUID
  OriginalFileName: string;             // Nombre del archivo Excel subido
  BlobPath:         string;             // Ruta del blob en storage
  AttemptNumber:    number;             // 1 = primer intento, 2+ = retry
  TotalRows:        number;             // Total de filas en el archivo
  ProcessedRows:    number;             // Filas procesadas (incluyendo errores)
  InsertedRows:     number;             // Vehículos insertados/actualizados OK
  ErrorRows:        number;             // Filas que fallaron
  SkippedRows:      number;             // Filas ignoradas (duplicados, etc.)
  StartedAt:        Date;
  CompletedAt:      Date | null;
  Status:           ImportStatusValue;  // Pending | Completed | Failed | CompletedWithErrors | Canceled
  ErrorCode:        string | null;
  ParentImportLogId: string | null;     // UUID — apunta al log original si es retry

  // Auditoría
  CreatedBy:        string;
  CreatedDate:      Date;
  UpdatedBy:        string | null;
  UpdatedDate:      Date | null;
  DeletedDate:      Date | null;
}

/** Entidad VehicleImportRowError — tabla "VehicleImportRowErrors" */
export interface VehicleImportRowErrorEntity {
  Id:               string;  // UUID
  TenantId:         string;  // UUID
  ImportLogId:      string;  // FK → VehicleImportLogs.Id
  RowNumber:        number;  // Número de fila en el Excel (1-based)
  RowDataJson:      string;  // JSON con los datos de la fila que falló
  ExceptionMessage: string;  // Mensaje de error del backend
  ExceptionType:    string;  // Tipo de excepción (.NET)

  // Auditoría
  CreatedBy:        string;
  CreatedDate:      Date;
}
