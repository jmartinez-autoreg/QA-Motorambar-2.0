import { test, expect, Page } from '@playwright/test';
import { SEL, URLS, TEST_DATA } from '../../fixtures/login/login.fixture';
import { SEL_DASHBOARD, DASHBOARD_TEST_DATA } from '../../fixtures/dashboard/export-report.fixture';
import { waitForPageIdle } from '../../helpers/wait-helpers';
import { logoutPortal, closePortalTabs, handleTermsAndConditions } from '../../helpers/auth-helpers';

/**
 * Suite: Dashboard — Descarga de Reportes
 *
 * afterEach: logout del Portal Distribuidor para limpiar sesión SSO.
 * Sin esto, el siguiente test recibe "token revocado" al abrir nueva sesión.
 */

// Logout del portal + cierre del popup después de cada test
test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});

/** Helper reutilizable: login + popup SSO + retorna la Page del portal */
async function loginAndOpenPortal(
  page: Page,
  credentials: { email: string; password: string }
): Promise<Page> {
  await page.goto(URLS.autoregLogin);
  await waitForPageIdle(page);

  // Login en Autoreg
  await page.locator(SEL.login.emailInput).click();
  await page.locator(SEL.login.emailInput).fill(credentials.email);
  await page.locator(SEL.login.passwordInput).click();
  await page.locator(SEL.login.passwordInput).fill(credentials.password);
  await page.locator(SEL.login.loginButton).click();

  // Términos y Condiciones: solo aparece en primera sesión, espera 4s máx
  await handleTermsAndConditions(page);

  // Esperar botón "Portal Distribuidor" — confirma login exitoso
  const portalBtn = page.getByRole(SEL.autoregHome.portalDistribuidorButton.role, {
    name: SEL.autoregHome.portalDistribuidorButton.name,
  });
  await portalBtn.waitFor({ state: 'visible', timeout: 30_000 });

  // Registrar popup ANTES del click — evita race condition
  const popupPromise = page.waitForEvent('popup', { timeout: 30_000 });
  await portalBtn.click();
  const portal = await popupPromise;

  // Esperar a que SSO complete: sso-login#token=... → sso-login → /
  await portal.waitForFunction(
    () => !window.location.href.includes('sso-login'),
    { timeout: 30_000 }
  );
  // Esperar Dashboard visible — más rápido que waitForPageIdle y preserva la sesión SSO
  await portal.locator('h2:has-text("Dashboard")').waitFor({ state: 'visible', timeout: 30_000 });
  return portal;
}

// ---------------------------------------------------------------------------

test('TC-DASHBOARD-001: Descarga de reporte — Rol Distribuidor', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  // RESULTADO ESPERADO 1: Dashboard cargado
  await expect(portal.locator(SEL_DASHBOARD.heading)).toBeVisible({ timeout: 15_000 });

  // RESULTADO ESPERADO 2: Botón "Exportar Datos" visible
  await expect(portal.locator(SEL_DASHBOARD.exportarDatosBtn)).toBeVisible();

  // PASO: Abrir modal de reportes
  await portal.locator(SEL_DASHBOARD.exportarDatosBtn).click();

  // RESULTADO ESPERADO 3: Modal "Generador de Reportes" visible
  await expect(portal.locator(SEL_DASHBOARD.modal.container)).toBeVisible({ timeout: 5_000 });
  await expect(portal.locator(SEL_DASHBOARD.modal.heading)).toBeVisible();

  // RESULTADO ESPERADO 4: Tipo de reporte por defecto visible
  await expect(portal.locator(SEL_DASHBOARD.modal.tipoReporte)).toBeVisible();

  // PASO: Generar reporte — waitForEvent ANTES del click, timeout extendido para generación server-side
  const downloadPromise = portal.waitForEvent('download', { timeout: 60_000 });
  await portal.locator(SEL_DASHBOARD.modal.generarReporteBtn).click();
  const download = await downloadPromise;

  // RESULTADO ESPERADO 5: Archivo descargado con nombre correcto (.xlsx)
  expect(download.suggestedFilename()).toMatch(DASHBOARD_TEST_DATA.downloadFilePattern);

  // Guardar archivo en TEMP/Downloads para evidencia
  await download.saveAs(`TEMP/Downloads/${download.suggestedFilename()}`);

  // Screenshot del estado final
  await portal.screenshot({
    path: 'test-results/TC-DASHBOARD-001-distribuidor-descarga.png',
    fullPage: false,
  });
});

test('TC-DASHBOARD-002: Descarga de reporte — Rol Cliente', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.cliente);

  // RESULTADO ESPERADO 1: Dashboard cargado
  await expect(portal.locator(SEL_DASHBOARD.heading)).toBeVisible({ timeout: 15_000 });

  // RESULTADO ESPERADO 2: Botón "Exportar Datos" visible
  await expect(portal.locator(SEL_DASHBOARD.exportarDatosBtn)).toBeVisible();

  // PASO: Abrir modal de reportes
  await portal.locator(SEL_DASHBOARD.exportarDatosBtn).click();

  // RESULTADO ESPERADO 3: Modal "Generador de Reportes" visible
  await expect(portal.locator(SEL_DASHBOARD.modal.container)).toBeVisible({ timeout: 5_000 });
  await expect(portal.locator(SEL_DASHBOARD.modal.heading)).toBeVisible();

  // RESULTADO ESPERADO 4: Tipo de reporte por defecto visible
  await expect(portal.locator(SEL_DASHBOARD.modal.tipoReporte)).toBeVisible();

  // PASO: Generar reporte — waitForEvent ANTES del click, timeout extendido para generación server-side
  const downloadPromise = portal.waitForEvent('download', { timeout: 60_000 });
  await portal.locator(SEL_DASHBOARD.modal.generarReporteBtn).click();
  const download = await downloadPromise;

  // RESULTADO ESPERADO 5: Archivo descargado con nombre correcto (.xlsx)
  expect(download.suggestedFilename()).toMatch(DASHBOARD_TEST_DATA.downloadFilePattern);

  // Guardar archivo en TEMP/Downloads para evidencia
  await download.saveAs(`TEMP/Downloads/${download.suggestedFilename()}`);

  // Screenshot del estado final
  await portal.screenshot({
    path: 'test-results/TC-DASHBOARD-002-cliente-descarga.png',
    fullPage: false,
  });
});
