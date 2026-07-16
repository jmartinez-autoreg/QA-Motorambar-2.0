/**
 * Spec: Importar Vehículos
 *
 * Pool 4 | vehicles-import (WRITE) — dependsOn: ['vehicles']
 *
 * Flujo confirmado con Playwright Codegen + discovery de código fuente (2026-07-16):
 *   1. Login → Portal Distribuidor (popup SSO)
 *   2. Menú lateral → "Importar Vehículos" (/import/upload)
 *   3. setInputFiles en input[type="file"] (oculto, className="hidden")
 *   4. Click botón "Importar"
 *   5. Toast: "Importación completada" → redirige a /import/history
 *
 * DATOS: IMPORT_DATA desde fixtures/vehicles/import.fixture.ts
 *   El fixture lee Vehicle-To-Import.xlsx y clasifica en:
 *   - vinInvalid (2)     → VINs inválidos que el portal rechazará durante el import
 *   - coComplete (7)     → VINs válidos con todos los campos CO → CO se auto-genera
 *   - coIncomplete (1)   → VIN válido con campo CO faltante (Pistons) → CO NO se genera
 *   - coEditCandidate(1) → Mismo registro, para TC de editar y regenerar CO
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import { SEL, URLS, TEST_DATA } from '../../fixtures/login/login.fixture';
import { IMPORT_DATA } from '../../fixtures/vehicles/import.fixture';
import { waitForPageIdle } from '../../helpers/wait-helpers';
import { logoutPortal, closePortalTabs, handleTermsAndConditions } from '../../helpers/auth-helpers';
import { runPreconditionCleanup } from '../../db/helpers/precondition';
import { db } from '../../db/repositories';

// ─── Selectores confirmados con Codegen + análisis de VehicleImportUpload.tsx ─

const SEL_IMPORT = {
  // Menú lateral — link de navegación
  menuImportarVehiculos: 'link[name="Importar Vehículos"], a:has-text("Importar Vehículos")',

  // Input de archivo — oculto (className="hidden"), usar setInputFiles directamente
  // NO usar .click() previo — no es necesario para inputs hidden con setInputFiles
  fileInput: 'input[type="file"]',

  // Botón de submit — label en i18n: "Importar"
  importBtn: 'button:has-text("Importar")',

  // Toast de éxito — i18n: successTitle = "Importación completada"
  toastSuccess: 'text=Importación completada',

  // Texto adicional del toast — confirma que es async (no sync)
  toastDesc: 'text=El archivo se subió correctamente',
};

// Ruta absoluta del Excel de test (resuelta desde el directorio del spec)
const EXCEL_PATH = path.resolve(__dirname, '../../data/Vehicle-To-Import.xlsx');

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

// ─── Precondition: limpiar datos de prueba antes de importar ─────────────────
// REGLA: todo spec WRITE debe ejecutar la limpieza en beforeAll.
// Si falla → el test lanza error descriptivo y para (no continúa con datos sucios).

test.beforeAll(async () => {
  await runPreconditionCleanup();
});

// ─── afterAll: cerrar conexión DB ─────────────────────────────────────────────
test.afterAll(async () => {
  await db.close();
});

// ─── afterEach: logout obligatorio (regla SSO) ────────────────────────────────

test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});

// ─── Tests ────────────────────────────────────────────────────────────────────

test('TC-IMPORT-001: Importar vehículos desde Excel — flujo completo', async ({ page }) => {
  console.log(`Excel: ${EXCEL_PATH}`);
  console.log(`Registros: ${IMPORT_DATA.allValid.length} válidos | ${IMPORT_DATA.vinInvalid.length} VINs inválidos`);
  console.log(`  coComplete=${IMPORT_DATA.coComplete.length} | coIncomplete=${IMPORT_DATA.coIncomplete.length}`);

  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  // PASO 1: Navegar a Importar Vehículos desde menú lateral
  await portal.getByRole('link', { name: 'Importar Vehículos' }).click();
  await portal.waitForURL(/\/import\/upload/i, { timeout: 15_000 });

  // RESULTADO ESPERADO 1: Página de importación cargada
  await expect(portal.locator('h2:has-text("Importar Vehículos")')).toBeVisible({ timeout: 10_000 });
  await portal.screenshot({ path: 'test-results/TC-IMPORT-001-01-pagina-import.png' });

  // PASO 2: Subir el Excel (input hidden — setInputFiles directo, sin .click() previo)
  await portal.locator(SEL_IMPORT.fileInput).setInputFiles(EXCEL_PATH);

  // RESULTADO ESPERADO 2: Archivo seleccionado — aparece el nombre del archivo
  await expect(portal.locator('text=Vehicle-To-Import')).toBeVisible({ timeout: 5_000 });
  await portal.screenshot({ path: 'test-results/TC-IMPORT-001-02-archivo-seleccionado.png' });

  // PASO 3: Click en "Importar"
  await portal.locator(SEL_IMPORT.importBtn).click();

  // RESULTADO ESPERADO 3: Toast de éxito visible
  await expect(portal.locator(SEL_IMPORT.toastSuccess)).toBeVisible({ timeout: 15_000 });
  await portal.screenshot({ path: 'test-results/TC-IMPORT-001-03-toast-exito.png' });

  // RESULTADO ESPERADO 4: Redirige a historial de importaciones
  await portal.waitForURL(/\/import\/history/i, { timeout: 15_000 });
  await portal.screenshot({ path: 'test-results/TC-IMPORT-001-04-historial.png', fullPage: false });
});
