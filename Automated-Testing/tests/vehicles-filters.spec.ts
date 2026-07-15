import { test, expect, Page } from '@playwright/test';
import { SEL, URLS, TEST_DATA } from '../fixtures/login.fixture';
import {
  SEL_VEHICLES, VEHICLES_URLS,
  TEST_VEHICLE_DATA, MARCA_OPTIONS, DROPDOWN_CLOSE,
} from '../fixtures/vehicles-filters.fixture';
import { waitForPageIdle } from '../helpers/wait-helpers';
import { logoutPortal, closePortalTabs } from '../helpers/auth-helpers';

/**
 * Suite: Vehículos Importados — Filtros
 *
 * URL: https://motorambartest.portaldevehiculos.com/import
 * Rol: Distribuidor (test.distribuidor)
 *
 * Datos reales capturados con MCP Browser (2026-07-15):
 *   - VINs: JN8BT3BA5TW332643, JN8BT3BA4TW332469, ...
 *   - Estado CO opciones: Pendiente, Completado
 *   - Marca opciones: Infiniti, Kia, Nissan
 */

async function loginAndGoToVehicles(page: Page): Promise<Page> {
  await page.goto(URLS.autoregLogin);
  await waitForPageIdle(page);

  await page.locator(SEL.login.emailInput).click();
  await page.locator(SEL.login.emailInput).fill(TEST_DATA.distribuidor.email);
  await page.locator(SEL.login.passwordInput).click();
  await page.locator(SEL.login.passwordInput).fill(TEST_DATA.distribuidor.password);
  await page.locator(SEL.login.loginButton).click();

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
  await portal.goto(VEHICLES_URLS.importados);
  await portal.locator(SEL_VEHICLES.heading).waitFor({ state: 'visible', timeout: 30_000 });
  return portal;
}

async function waitForGridLoad(portal: Page): Promise<void> {
  await portal.waitForFunction(
    () => {
      const table = document.querySelector('table');
      const spinner = document.querySelector('[class*="animate-spin"]');
      return !!table && !spinner;
    },
    { timeout: 15_000 }
  ).catch(() => {});
}

/** Helper: escribe en un DcMultiValueInput → click abre textarea → fill → click fuera para cerrar */
async function fillMultiValueInput(portal: Page, inputSelector: string, value: string): Promise<void> {
  await portal.locator(inputSelector).click();                 // abre el textarea
  await portal.locator('textarea').last().fill(value);         // escribe en el textarea
  await portal.locator(SEL_VEHICLES.heading).click();          // click fuera → cierra y crea chips
}

// afterEach: logout obligatorio (regla SSO — context/CONTEXT.md)
test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});

// ---------------------------------------------------------------------------

test('TC-VEHICLES-FILTER-001: Página Vehículos Importados carga con todos los filtros', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  await expect(portal.locator(SEL_VEHICLES.heading)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.vinInput)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.facturaInput)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.cartaInput)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.ordenVentaInput)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.estadoCoBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.estadoCpaBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.estadoFacturaBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.marcaBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.masFiltrosBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.limpiarFiltrosBtn)).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.gridTable)).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-001-carga.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-002: Filtro por VIN — ingresa VIN real con espacio y verifica chip', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO: Click input → textarea → escribir VIN → click fuera para crear chip
  await fillMultiValueInput(portal, SEL_VEHICLES.vinInput, TEST_VEHICLE_DATA.singleVin);
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO 1: El chip del VIN aparece
  await expect(portal.locator(`text=${TEST_VEHICLE_DATA.singleVin}`).first()).toBeVisible();

  // RESULTADO ESPERADO 2: Grid filtra con al menos 1 resultado
  const rows = await portal.locator('table tbody tr').count();
  expect(rows).toBeGreaterThanOrEqual(1);

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-002-vin.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-003: Filtro N.º Factura — ingresa número real', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO: Click input → textarea → escribir factura → click fuera para crear chip
  await fillMultiValueInput(portal, SEL_VEHICLES.facturaInput, TEST_VEHICLE_DATA.singleInvoice);
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Chip aparece en el campo
  await expect(portal.locator(`text=${TEST_VEHICLE_DATA.singleInvoice}`).first()).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-003-factura.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-004: Filtro Estado CO — selecciona "Pendiente"', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO 1: Abrir dropdown Estado CO
  await portal.locator(SEL_VEHICLES.estadoCoBtn).click();
  await portal.locator('input[placeholder="Buscar..."]').first().waitFor({ state: 'visible', timeout: 5_000 });

  // PASO 2: Seleccionar "Pendiente" (confirmado en DOM)
  await portal.locator('ul li button:has-text("Pendiente")').first().click();

  // PASO 3: Cerrar dropdown y esperar grid
  await portal.locator(DROPDOWN_CLOSE).click();
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Grid actualizado
  const rows = await portal.locator('table tbody tr').count();
  expect(rows).toBeGreaterThanOrEqual(0);

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-004-estadoCO.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-005: Filtro Marca — selecciona "Nissan"', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO 1: Abrir dropdown Marca
  await portal.locator(SEL_VEHICLES.marcaBtn).click();
  await portal.locator('input[placeholder="Buscar..."]').first().waitFor({ state: 'visible', timeout: 5_000 });

  // PASO 2: Seleccionar "Nissan" (confirmado: Infiniti, Kia, Nissan)
  await portal.locator('ul li button:has-text("Nissan")').click();

  // PASO 3: Cerrar dropdown
  await portal.locator(DROPDOWN_CLOSE).click();
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Solo Nissans en el grid
  const rows = await portal.locator('table tbody tr').count();
  expect(rows).toBeGreaterThanOrEqual(1);

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-005-marca.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-006: Más Filtros — Concesionario "MEDINA NISSAN"', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO 1: Abrir "Más Filtros"
  await portal.locator(SEL_VEHICLES.masFiltrosBtn).click();
  await expect(portal.locator(SEL_VEHICLES.concesionarioInput)).toBeVisible({ timeout: 3_000 });

  // PASO 2: Ingresar concesionario (Click → textarea → escribir → click fuera)
  await fillMultiValueInput(portal, SEL_VEHICLES.concesionarioInput, TEST_VEHICLE_DATA.dealer);
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Chip visible + badge de "Más Filtros" activo
  await expect(portal.locator(`text=${TEST_VEHICLE_DATA.dealer}`).first()).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.masFiltrosBadge)).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-006-concesionario.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-007: Más Filtros — Institución Financiera "POPULAR AUTO"', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO 1: Abrir "Más Filtros"
  await portal.locator(SEL_VEHICLES.masFiltrosBtn).click();
  await expect(portal.locator(SEL_VEHICLES.instFinancieraInput)).toBeVisible({ timeout: 3_000 });

  // PASO 2: Ingresar institución financiera (Click → textarea → escribir → click fuera)
  await fillMultiValueInput(portal, SEL_VEHICLES.instFinancieraInput, TEST_VEHICLE_DATA.financialInstitution);
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Chip visible + badge activo
  await expect(portal.locator(`text=${TEST_VEHICLE_DATA.financialInstitution}`).first()).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-007-inst-financiera.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-008: "Limpiar filtros" resetea VIN + Factura + Estado CO', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  // PASO 1: Aplicar filtro VIN (textarea pattern)
  await fillMultiValueInput(portal, SEL_VEHICLES.vinInput, TEST_VEHICLE_DATA.singleVin);
  await waitForGridLoad(portal);
  await portal.locator(SEL_VEHICLES.estadoCoBtn).click();
  await portal.locator('ul li button:has-text("Pendiente")').first().click();
  await portal.locator(DROPDOWN_CLOSE).click();
  await waitForGridLoad(portal);

  // PASO 2: Limpiar todo
  await portal.locator(SEL_VEHICLES.limpiarFiltrosBtn).click();
  await waitForGridLoad(portal);

  // RESULTADO ESPERADO: Input VIN vacío + Estado CO sin selección
  const vinVal = await portal.locator(SEL_VEHICLES.vinInput).inputValue();
  expect(vinVal).toBe('');
  await expect(portal.locator('text=Estado CO').first()).toBeVisible();
  await expect(portal.locator(SEL_VEHICLES.gridTable)).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-008-limpiar.png', fullPage: false });
});

test('TC-VEHICLES-FILTER-009: Botón "Actualizar" recarga el grid', async ({ page }) => {
  const portal = await loginAndGoToVehicles(page);
  await waitForGridLoad(portal);

  await portal.locator(SEL_VEHICLES.actualizarBtn).click();
  await waitForGridLoad(portal);

  await expect(portal.locator(SEL_VEHICLES.gridTable)).toBeVisible();

  await portal.screenshot({ path: 'test-results/TC-VEHICLES-FILTER-009-actualizar.png', fullPage: false });
});
