/**
 * Spec: Import History — Historial de Importaciones de Vehículos
 *
 * Pool: vehicles-import (WRITE, dependsOn: vehicles)
 * URL: https://motorambartest.portaldevehiculos.com/import/history
 *
 * Statuses confirmados (VehicleImportStatus + i18n importHistory.es.json):
 *   Pending             → "Pendiente"          (azul)   — procesando
 *   Completed           → "Completado"         (verde)  — todo OK
 *   CompletedWithErrors → "Completado con errores" (naranja) — parcial
 *   Failed              → "Error"              (rojo)   — falló
 *   Canceled            → "Cancelada"          (gris)   — cancelado por usuario
 *
 * Actions por status:
 *   Pending             → botón Cancelar (X rojo)
 *   CompletedWithErrors → botón Descargar errores
 *   Failed + Canceled   → botón Reintentar (refresh)
 *   Completed           → sin acciones
 *
 * Para nuestro Excel (10 registros, 2 VINs inválidos):
 *   Resultado esperado: CompletedWithErrors | Imported=8 | Errors=2
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import { SEL, URLS, TEST_DATA } from '../../fixtures/login/login.fixture';
import { IMPORT_DATA } from '../../fixtures/vehicles/import.fixture';
import { waitForPageIdle } from '../../helpers/wait-helpers';
import { logoutPortal, closePortalTabs, handleTermsAndConditions } from '../../helpers/auth-helpers';

// ─── Selectores del historial ─────────────────────────────────────────────────

const SEL_HISTORY = {
  // Heading de la página
  heading: 'text=Import History',

  // Búsqueda por archivo, usuario o VIN
  searchInput: 'input[placeholder*="archivo"]',

  // Status badges (por texto del i18n — únicos en cada fila)
  statusPending:             'text=Pendiente',
  statusCompleted:           'text=Completado',
  statusCompletedWithErrors: 'text=Completado con errores',
  statusFailed:              'text=Error',
  statusCanceled:            'text=Cancelada',

  // Nombre del archivo del Excel de test
  importFileName: 'text=Vehicle-To-Import',

  // Botón Nueva Importación
  newImportBtn: 'button:has-text("Nueva Importación")',
};

const EXCEL_FILENAME = 'Vehicle-To-Import.xlsx';

// ─── Helper: login → popup → portal ──────────────────────────────────────────

async function loginAndOpenPortal(
  page: Page,
  credentials: { email: string; password: string }
): Promise<Page> {
  await page.goto(URLS.autoregLogin);
  await waitForPageIdle(page);

  await page.locator(SEL.login.emailInput).click();
  await page.locator(SEL.login.emailInput).fill(credentials.email);
  await page.locator(SEL.login.passwordInput).click();
  await page.locator(SEL.login.passwordInput).fill(credentials.password);
  await page.locator(SEL.login.loginButton).click();

  await handleTermsAndConditions(page);

  const portalBtn = page.getByRole(SEL.autoregHome.portalDistribuidorButton.role, {
    name: SEL.autoregHome.portalDistribuidorButton.name,
  });
  await portalBtn.waitFor({ state: 'visible', timeout: 30_000 });

  const popupPromise = page.waitForEvent('popup', { timeout: 30_000 });
  await portalBtn.click();
  const portal = await popupPromise;

  await portal.waitForFunction(
    () => !window.location.href.includes('sso-login'),
    { timeout: 30_000 }
  );
  await portal.locator('h2:has-text("Dashboard")').waitFor({ state: 'visible', timeout: 30_000 });
  return portal;
}

// ─── afterEach: logout obligatorio ───────────────────────────────────────────

test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

test('TC-IMPORT-HISTORY-001: Verificar registro del import en historial', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  // Navegar al historial
  await portal.goto('https://motorambartest.portaldevehiculos.com/import/history');
  await portal.waitForURL(/\/import\/history/i, { timeout: 15_000 });

  // RESULTADO ESPERADO 1: Página cargada
  await expect(portal.locator(SEL_HISTORY.heading)).toBeVisible({ timeout: 10_000 });
  await portal.screenshot({ path: 'test-results/TC-IMPORT-HISTORY-001-01-pagina.png', fullPage: false });

  // RESULTADO ESPERADO 2: El archivo del último import aparece en el historial
  await expect(portal.locator(SEL_HISTORY.importFileName).first()).toBeVisible({ timeout: 15_000 });

  await portal.screenshot({ path: 'test-results/TC-IMPORT-HISTORY-001-02-registro-visible.png', fullPage: false });
});

test('TC-IMPORT-HISTORY-002: Verificar status CompletedWithErrors y conteo de errores', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  await portal.goto('https://motorambartest.portaldevehiculos.com/import/history');
  await portal.locator(SEL_HISTORY.importFileName).first().waitFor({ state: 'visible', timeout: 15_000 });

  // Buscar la fila del último import (Vehicle-To-Import.xlsx)
  // La fila más reciente estará primera (ordenado por fecha DESC)
  const firstRow = portal.locator('table tbody tr').first();

  // RESULTADO ESPERADO 1: Status "Completado con errores"
  // Nuestro Excel tiene 2 VINs inválidos → CompletedWithErrors
  const statusBadge = firstRow.locator(SEL_HISTORY.statusCompletedWithErrors);
  await expect(statusBadge).toBeVisible({ timeout: 10_000 });

  // RESULTADO ESPERADO 2: Columna Errors = 2 (los 2 VINs inválidos del Excel)
  const errorsCell = firstRow.locator('td').filter({ hasText: /^2$/ }).first();
  await expect(errorsCell).toBeVisible();

  // RESULTADO ESPERADO 3: Columna Imported = 8 (los 8 VINs válidos)
  const importedCell = firstRow.locator('td').filter({ hasText: /^8$/ }).first();
  await expect(importedCell).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-IMPORT-HISTORY-002-status-errors.png', fullPage: false });

  console.log(`vinInvalid (esperado en Errors): ${IMPORT_DATA.vinInvalid.length}`);
  console.log(`coComplete + coIncomplete (esperado en Imported): ${IMPORT_DATA.allValid.length}`);
});

test('TC-IMPORT-HISTORY-003: Buscar import por nombre de archivo', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  await portal.goto('https://motorambartest.portaldevehiculos.com/import/history');
  await portal.locator(SEL_HISTORY.importFileName).first().waitFor({ state: 'visible', timeout: 15_000 });

  // PASO: Buscar por nombre del archivo
  const searchInput = portal.locator(SEL_HISTORY.searchInput);
  await searchInput.click();
  await searchInput.fill('Vehicle-To-Import');
  await portal.waitForTimeout(600); // debounce 500ms

  // RESULTADO ESPERADO: Resultados filtrados muestran nuestro archivo
  await expect(portal.locator(SEL_HISTORY.importFileName).first()).toBeVisible({ timeout: 10_000 });

  await portal.screenshot({ path: 'test-results/TC-IMPORT-HISTORY-003-busqueda.png', fullPage: false });
});

test('TC-IMPORT-HISTORY-004: Filtrar por status CompletedWithErrors', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  await portal.goto('https://motorambartest.portaldevehiculos.com/import/history');
  await portal.locator(SEL_HISTORY.importFileName).first().waitFor({ state: 'visible', timeout: 15_000 });

  // PASO: Click en el filtro de status → seleccionar "Completado con errores"
  // DcFilterSelect — botón trigger con texto "Todos los estados"
  await portal.locator('button:has-text("Todos los estados")').click();
  await portal.locator('li button:has-text("Completado con errores")').first().click();
  await portal.waitForTimeout(500);

  // RESULTADO ESPERADO: Grid muestra solo registros CompletedWithErrors
  const rows = portal.locator('table tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThanOrEqual(1);

  // Todas las filas visibles deben tener el badge correcto
  await expect(portal.locator(SEL_HISTORY.statusCompletedWithErrors).first()).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-IMPORT-HISTORY-004-filtro-status.png', fullPage: false });
});
