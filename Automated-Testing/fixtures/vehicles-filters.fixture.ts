/**
 * Selectores y datos para Vehículos Importados — Filtros
 * Confirmados con MCP Browser discovery + análisis de código fuente (2026-07-15)
 *
 * URL real: https://motorambartest.portaldevehiculos.com/import
 * Componente: frontend/src/app/import/components/VehiclesGrid/index.tsx
 * Store de filtros: frontend/src/store/useImportedVehiclesFiltersStore.ts
 */

/** Selectores de la página Vehículos Importados */
export const SEL_VEHICLES = {
  // Página principal
  heading: 'h1:has-text("Vehículos Importados")',

  // ── Fila 1: Búsquedas multi-valor (inputs con placeholder) ──────────────
  // Sin IDs — React SPA sin data-testid → selectores por placeholder (únicos confirmados)
  vinInput:         'input[placeholder="Buscar por VIN"]',
  facturaInput:     'input[placeholder="Buscar por no. de factura..."]',
  cartaInput:       'input[placeholder="Buscar por no. de carta de crédito..."]',
  ordenVentaInput:  'input[placeholder="Buscar por no. de orden de venta..."]',

  // ── Fila 2: Multi-selects por texto del botón ────────────────────────────
  estadoCoBtn:      'button:has-text("Estado CO")',
  estadoCpaBtn:     'button:has-text("Estado CPA")',
  estadoFacturaBtn: 'button:has-text("Estado de Factura")',
  marcaBtn:         'button:has-text("Marca")',

  // ── Header: Localidad + Fecha ────────────────────────────────────────────
  localidadBtn:     'button:has-text("Todas las Localidades")',
  fechaBtn:         'button:has-text("Seleccionar fecha")',

  // ── Más Filtros (toggle y campos ocultos) ────────────────────────────────
  masFiltrosBtn:    'button:has-text("Más Filtros")',
  concesionarioInput: 'input[placeholder="Buscar por nombre o licencia..."]',
  instFinancieraInput: 'input[placeholder="Buscar por nombre de institución..."]',

  // ── Acciones ─────────────────────────────────────────────────────────────
  actualizarBtn:    'button:has-text("Actualizar")',
  limpiarFiltrosBtn: 'button:has-text("Limpiar filtros")',

  // ── Grid / resultados ────────────────────────────────────────────────────
  // Tabla con los vehículos
  gridTable:        'table',
  // Indicador de resultados vacíos
  emptyState:       'text=Sin vehículos',
  // Badge del contador de "Más Filtros" activos
  masFiltrosBadge:  'button:has-text("Más Filtros") span',
};

/** URLs del módulo de vehículos */
export const VEHICLES_URLS = {
  importados: 'https://motorambartest.portaldevehiculos.com/import',
};

/**
 * Opciones de status para los multi-selects.
 * Confirmadas en DOM real (2026-07-15) — Estado CO dropdown.
 */
export const STATUS_OPTIONS = {
  co:      ['Pendiente', 'Completado'],
  cpa:     ['Pendiente', 'Completado'],
  factura: ['Pendiente', 'Completado'],
};

/**
 * Opciones de Marca disponibles en el ambiente de test (confirmadas en DOM)
 */
export const MARCA_OPTIONS = ['Infiniti', 'Kia', 'Nissan'];

/**
 * Datos de test reales suministrados por el equipo + confirmados en DOM (2026-07-15)
 *
 * Comportamiento de los inputs (confirmado en código fuente DcMultiValueInput):
 *   - VIN / Factura / Carta Crédito / Orden Venta: separador ESPACIO (type + space → chip)
 *   - Concesionario / Institución Financiera: separatorChars={["\n"]} → usar Enter por valor
 */
export const TEST_VEHICLE_DATA = {
  // VINs reales — separados por espacio en el input
  vins: [
    'JN8BT3BA5TW332643',
    'JN8BT3BA6TW332702',
    'JN8BT3BAXTW332704',
    'JN8BT3BA4TW332469',
    'JN8BT3BA3TW332494',
  ],
  singleVin: 'JN8BT3BA5TW332643',

  // Números de factura — separados por espacio
  invoices: ['90625423', '90625418', '90625416', '90625415', '90625417'],
  singleInvoice: '90625423',

  // Números de Carta de Crédito — separados por espacio
  creditLetters: ['100503', '90631885'],
  singleCreditLetter: '100503',

  // Números de Orden de Venta — separados por espacio
  salesOrders: ['89012039', '89012083'],
  singleSalesOrder: '89012039',

  // Más Filtros — un valor por input (separadorChars=["\n"], usar Enter)
  dealer: 'MEDINA NISSAN',
  financialInstitution: 'POPULAR AUTO',

  // Marca confirmada en DOM
  marca: 'Nissan',

  // Estado para filtros — confirmado como opción válida en DOM
  estadoCoValue: 'Pendiente',
  estadoCpaValue: 'Pendiente',
  estadoFacturaValue: 'Pendiente',
};

/**
 * Selector del overlay que cierra los dropdowns multi-select
 * (aparece como div full-screen con aria-label="Close dropdown")
 */
export const DROPDOWN_CLOSE = '[aria-label="Close dropdown"]';
