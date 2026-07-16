/**
 * Entidades de base de datos — Tabla: Vehicles
 *
 * Mapeo confirmado desde:
 *   - DistributionCar.Domain.Vehicles.Vehicle.cs
 *   - DistributionCar.Infrastructure.Persistence.Configurations.VehicleConfiguration.cs
 *
 * Tabla PostgreSQL: "Vehicles"
 * Columnas usan PascalCase (EF Core por convención en .NET)
 */

/** Status CO */
export const StatusCO = {
  Pendiente:  1,
  Completado: 2,
  Subido:     3,
  Emitida:    4,
} as const;

/** Status CPA */
export const StatusCPA = {
  Pendiente:  1,
  Completado: 2,
  Subido:     3,
  Emitida:    4,
} as const;

/** Status Factura */
export const StatusInvoice = {
  Pendiente:  1,
  Completado: 2,
  Subido:     3,
  Emitida:    4,
} as const;

/** Release Status */
export const ReleaseStatus = {
  PendingDocuments:    1,
  PendingCreditLetter: 2,
  Complete:            3,
} as const;

/** Entidad Vehicle — mapea la tabla "Vehicles" */
export interface VehicleEntity {
  // ── Identificación ──────────────────────────────────────────────────────────
  Id:               string;   // UUID
  TenantId:         string;   // UUID — multi-tenancy
  Vin:              string;   // 17 chars alfanuméricos

  // ── Sección DETAILS (UI) ────────────────────────────────────────────────────
  MakerId:          string | null;   // FK → Makers
  MakerModelId:     string | null;   // FK → MakerModels
  Year:             number | null;
  AutoColorCode:    string | null;   // Color del vehículo

  // ── Sección TECHNICAL SPECIFICATIONS (UI) ──────────────────────────────────
  Doors:            number | null;
  Pistons:          number | null;   // Cylinders en UI
  HorsePower:       number | null;
  VehiclePropulsionTypeId: number | null;
  UnloadedWeight:   string | null;   // Vehicle Weight en UI
  LoadCapacity:     string | null;
  Unit:             string | null;   // Vehicle Unit en UI
  SeriesOrModel:    string | null;   // [CO]

  // ── Sección REGULATORY AND ORIGIN (UI) ─────────────────────────────────────
  CountryOriginCode: string | null;
  BodyType:         string | null;   // [CO]
  TitleNumber:      string | null;
  TitleDate:        Date | null;     // [CO]

  // ── Sección FINANCIAL (UI) ──────────────────────────────────────────────────
  SalePrice:        number | null;   // DNP en Excel / Contribution Price en UI
  SaleTax:          number | null;
  TaxablePrice:     number | null;   // MSRP en Excel / Sale Price en UI
  TaxPaymentDate:   Date | null;
  ArbDeclaration:   string | null;   // Tax Declaration No en UI
  CpaNumber:        string | null;
  Invoice:          string | null;   // Invoice No en UI — [CO]
  InvoiceSequence:  string | null;
  ContributorId:    string | null;
  ClientId:         string | null;
  SalesOrderNumber: string | null;
  Bank:             string | null;   // Bank Name en UI
  DealerId:         string | null;   // FK → ParentClients — [CO]
  ParentDealerId:   string | null;   // FK → ParentDealers
  DealerLicence:    string | null;   // License No en UI
  EinTaxId:         string | null;
  FinantialInstitutionId: string | null; // FK → ParentClients
  ClientAssignedId: string | null;   // FK → ParentClients — Assigned Client en UI

  // ── Statuses ────────────────────────────────────────────────────────────────
  StatusCOId:       number;   // 1=Pendiente, ver StatusCO enum
  StatusCPAId:      number;
  StatusInvoiceId:  number;
  ReleaseStatusId:  number;   // 1=PendingDocuments, 2=PendingCreditLetter, 3=Complete

  // ── Metadata ────────────────────────────────────────────────────────────────
  ImportedFromFileId: string | null; // FK → VehicleImportLogs
  InvoiceId:        string | null;   // FK → Invoices

  // ── Auditoría (AggregateRoot) ────────────────────────────────────────────────
  CreatedBy:        string;
  CreatedDate:      Date;
  UpdatedBy:        string | null;
  UpdatedDate:      Date | null;
  DeletedDate:      Date | null;
}
