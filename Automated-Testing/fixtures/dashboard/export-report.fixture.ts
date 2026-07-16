/**
 * Selectores y datos para el módulo Dashboard — Portal Distribuidor
 * Confirmados con MCP Browser discovery (2026-07-15)
 */

export const SEL_DASHBOARD = {
  // Dashboard principal
  // h2 único en la página — confirmado: document.querySelectorAll('h2').length === 1
  heading: 'h2:has-text("Dashboard Ejecutivo")',

  // Botón "Exportar Datos" — único en Dashboard, sin ID (CSS class only)
  // Confirmado: document.querySelectorAll('button').filter(text==='Exportar Datos').length === 1
  exportarDatosBtn: 'button:has-text("Exportar Datos")',

  // Modal "Generador de Reportes"
  modal: {
    // Confirmado: [role="dialog"] aparece al click en Exportar Datos
    container: '[role="dialog"]',

    // Heading del modal — confirmado en discovery
    heading: '[role="dialog"] :is(h1,h2,h3,h4):has-text("Generador de Reportes")',

    // Selector de tipo de reporte (pre-seleccionado: "Inventario Detallado")
    tipoReporte: '[role="dialog"] button:has-text("Inventario Detallado")',

    // Rango de fechas (muestra fechas actuales por defecto)
    rangoFechas: '[role="dialog"] button:has-text("2026")',

    // Botón principal — genera y descarga el reporte
    // Confirmado: único en dialog, DOM text "Generar Reporte" (CSS transforma a uppercase visualmente)
    generarReporteBtn: '[role="dialog"] button:has-text("Generar Reporte")',

    // Botón de descarga de reporte reciente (sección "Reportes Recientes")
    descargarBtn: '[role="dialog"] button:has-text("Descargar")',

    // Botón cerrar modal
    closeBtn: '[role="dialog"] button[aria-label], [role="dialog"] button:first-child',
  },
};

/**
 * Datos de test para Dashboard — roles con acceso a reportes
 */
export const DASHBOARD_TEST_DATA = {
  // Tipo de reporte por defecto en el modal
  defaultReportType: 'Inventario Detallado',

  // Patrón de nombre de archivo real confirmado en ejecución (2026-07-15):
  // "reporte-{n}-{YYYY-MM-DD}-{YYYY-MM-DD}.xlsx"
  downloadFilePattern: /reporte-\d+-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.xlsx/i,
};
