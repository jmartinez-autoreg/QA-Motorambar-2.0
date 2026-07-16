/**
 * Import Fixture — Vehículos Importados
 *
 * Lee el Excel `data/Vehicle-To-Import.xlsx` y clasifica cada registro
 * en grupos de test según validez de VIN y completitud de campos CO.
 *
 * GRUPOS DE TEST:
 *   vinInvalid      → VINs que el portal debe rechazar (char inválido o longitud incorrecta)
 *   coComplete      → VINs válidos + todos los campos CO presentes → CO debe auto-generarse
 *   coIncomplete    → VINs válidos + al menos 1 campo CO faltante → CO NO debe auto-generarse
 *   coEditCandidate → Subconjunto de coIncomplete con exactamente 1-2 campos CO faltantes
 *                     (para el TC: editar campo faltante → CO se regenera)
 *   allValid        → Todos los registros con VIN válido (independientemente del CO)
 *
 * REGLA DE NEGOCIO (context/Automated-Context.md):
 *   VIN válido = exactamente 17 chars, solo [A-Z0-9], sin espacios ni caracteres especiales
 *   Campos CO requeridos (badge CO en UI): Maker, Year, Pistons, Horsepower,
 *     Unloaded Weight, Load Capacity, Series Or Model, Body Type, Title Date, Invoice, Dealer
 *
 * ⚠️  POOL: vehicles-e2e (write) — estos datos son exclusivos del flujo E2E.
 *     NO usar estos VINs en el pool vehicles (filters) ni otros pools read.
 */

import * as XLSX from 'xlsx';
import * as path from 'path';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface VehicleRow {
  row: number;
  vin: string;
  maker: string;
  model: string;
  year: number | string;
  autoColor: string;
  horsepower: number | string;
  titleDate: number | string;
  countryOriginCode: string;
  msrp: number | string;
  saleTax: number | string;
  taxPaymentDate: number | string;
  doors: number | string;
  pistons: number | string;
  unloadedWeight: string;
  loadCapacity: string;
  propulsionTypeId: string;
  invoice: number | string;
  invoiceSequence: string;
  dealer: string;
  contributorId: string;
  clientId: number | string;
  salesOrderNumber: number | string;
  creditLetterNumber: number | string;
  bankName: string;
  seriesOrModel: string;
  bodyType: string;
  dealerLicense: string;
  einTaxId: number | string;
  dnp: number | string;
}

export interface InvalidVinRecord {
  row: number;
  vin: string;
  reason: string;
}

export interface IncompleteCoRecord extends VehicleRow {
  missingCoFields: string[];
}

// ─── Campos requeridos para CO ────────────────────────────────────────────────

/**
 * Campos del Excel que corresponden a los campos CO requeridos.
 * Mapeados desde VehicleImportHeaders.cs y confirmados con badge CO en UI.
 *
 * Sección DETAILS:     Maker, Year (VIN no aplica aquí, se valida aparte)
 * Sección TECHNICAL:   Pistons (Cylinders), Horsepower, Unloaded Weight, Load Capacity, Series Or Model
 * Sección REGULATORY:  Body Type, Title Date
 * Sección FINANCIAL:   Invoice, Dealer
 */
const CO_REQUIRED_EXCEL_FIELDS: (keyof typeof EXCEL_TO_FIELD)[] = [
  'Maker', 'Year', 'Pistons', 'Horsepower', 'Unloaded Weight',
  'Load Capacity', 'Series Or Model', 'Body Type', 'Title Date',
  'Invoice', 'Dealer',
];

const EXCEL_TO_FIELD: Record<string, string> = {
  'Maker':          'maker',
  'Year':           'year',
  'Pistons':        'pistons (Cylinders)',
  'Horsepower':     'horsepower',
  'Unloaded Weight': 'unloadedWeight',
  'Load Capacity':  'loadCapacity',
  'Series Or Model': 'seriesOrModel',
  'Body Type':      'bodyType',
  'Title Date':     'titleDate',
  'Invoice':        'invoice',
  'Dealer':         'dealer',
};

const VIN_REGEX = /^[A-Z0-9]{17}$/i;

// ─── Loader ───────────────────────────────────────────────────────────────────

function loadAndClassify() {
  const filePath = path.join(__dirname, '../../data/Vehicle-To-Import.xlsx');
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

  const vinInvalid: InvalidVinRecord[] = [];
  const coComplete: VehicleRow[] = [];
  const coIncomplete: IncompleteCoRecord[] = [];

  rawRows.forEach((raw, index) => {
    const rowNum = index + 1;
    const vin = String(raw['VIN'] ?? '').trim();

    // ── Validar VIN ──────────────────────────────────────────────────────────
    if (!VIN_REGEX.test(vin)) {
      let reason: string;
      if (vin.length !== 17) {
        const spaces = vin.split('').filter(c => c === ' ').length;
        reason = `Longitud inválida: ${vin.length} chars${spaces > 0 ? ` (contiene ${spaces} espacio(s))` : ''}`;
      } else {
        const invalidChars = vin.split('').filter(c => !/[A-Z0-9]/i.test(c));
        reason = `Caracteres inválidos: [${[...new Set(invalidChars)].join(', ')}]`;
      }
      vinInvalid.push({ row: rowNum, vin, reason });
      return; // No clasificar en otros grupos
    }

    // ── Mapear campos ────────────────────────────────────────────────────────
    const vehicle: VehicleRow = {
      row:              rowNum,
      vin,
      maker:            String(raw['Maker'] ?? ''),
      model:            String(raw['Model'] ?? ''),
      year:             raw['Year'] as number,
      autoColor:        String(raw['Auto Color'] ?? ''),
      horsepower:       raw['Horsepower'] as number,
      titleDate:        raw['Title Date'] as number,
      countryOriginCode: String(raw['Country Origin Code'] ?? ''),
      msrp:             raw['MSRP'] as number,
      saleTax:          raw['Sale Tax'] as number,
      taxPaymentDate:   raw['Tax Payment Date'] as number,
      doors:            raw['Doors'] as number,
      pistons:          raw['Pistons'] as number,
      unloadedWeight:   String(raw['Unloaded Weight'] ?? ''),
      loadCapacity:     String(raw['Load Capacity'] ?? ''),
      propulsionTypeId: String(raw['Propulsion Type Id'] ?? ''),
      invoice:          raw['Invoice'] as number,
      invoiceSequence:  String(raw['Invoice Sequence'] ?? ''),
      dealer:           String(raw['Dealer'] ?? ''),
      contributorId:    String(raw['Contributor Id'] ?? ''),
      clientId:         raw['Client Id'] as number,
      salesOrderNumber: raw['Sales Order Number'] as number,
      creditLetterNumber: raw['Credit Letter Number'] as number,
      bankName:         String(raw['Bank Name'] ?? ''),
      seriesOrModel:    String(raw['Series Or Model'] ?? ''),
      bodyType:         String(raw['Body Type'] ?? ''),
      dealerLicense:    String(raw['Dealer License'] ?? ''),
      einTaxId:         raw['EIN (Tax Id)'] as number,
      dnp:              raw['DNP'] as number,
    };

    // ── Verificar campos CO ──────────────────────────────────────────────────
    const missingCoFields = CO_REQUIRED_EXCEL_FIELDS.filter(field => {
      const val = raw[field];
      return val === '' || val === null || val === undefined;
    }).map(f => EXCEL_TO_FIELD[f] ?? f);

    if (missingCoFields.length === 0) {
      coComplete.push(vehicle);
    } else {
      coIncomplete.push({ ...vehicle, missingCoFields });
    }
  });

  // coEditCandidate: registros con 1 o 2 campos CO faltantes (fácil de completar via edit)
  const coEditCandidate = coIncomplete.filter(r => r.missingCoFields.length <= 2);

  return {
    vinInvalid,
    coComplete,
    coIncomplete,
    coEditCandidate,
    allValid: [...coComplete, ...coIncomplete] as VehicleRow[],
  };
}

// ─── Export — cargado una vez al inicio ───────────────────────────────────────

export const IMPORT_DATA = loadAndClassify();

/**
 * Resumen de los grupos para usar en logs de test:
 *
 * IMPORT_DATA.vinInvalid.length        → cuántos VINs inválidos tiene el archivo
 * IMPORT_DATA.coComplete.length        → cuántos registros generarán CO
 * IMPORT_DATA.coIncomplete.length      → cuántos NO generarán CO (campos faltantes)
 * IMPORT_DATA.coEditCandidate.length   → cuántos se pueden corregir via edit
 *
 * Uso en specs:
 *   import { IMPORT_DATA } from '../../fixtures/vehicles/import.fixture';
 *
 *   // TC: portal rechaza VINs inválidos
 *   for (const { vin, reason } of IMPORT_DATA.vinInvalid) { ... }
 *
 *   // TC: import completo → CO auto-generado
 *   for (const vehicle of IMPORT_DATA.coComplete) { ... }
 *
 *   // TC: import con campo CO faltante → CO NO se genera
 *   const incompleteVehicle = IMPORT_DATA.coIncomplete[0];
 *   // incompleteVehicle.missingCoFields → ['pistons (Cylinders)']
 *
 *   // TC: editar campo faltante → CO se regenera
 *   const candidate = IMPORT_DATA.coEditCandidate[0];
 *   // candidate.missingCoFields → ['pistons (Cylinders)']
 *   // → editar en UI, completar el campo, guardar, esperar CO = Completado
 */
