import { test, expect, Page } from '@playwright/test';
import { SEL, URLS, TEST_DATA } from '../fixtures/login.fixture';
import { waitForPageIdle } from '../helpers/wait-helpers';

/**
 * Flujo confirmado con Playwright Codegen:
 * 1. Login en Autoreg (#LoginUser_UserName / #LoginUser_Password / "INICIAR SESIÓN")
 * 2. Click en "Portal Distribuidor" → abre en POPUP (nueva pestaña)
 * 3. Verifica Dashboard del Portal Motorambar en la nueva pestaña
 *
 * ⚠️ Login es un sistema federado — solo se prueba el happy path por rol.
 */

/** Helper: login + navega al popup del Portal Distribuidor (Distribuidor / Cliente) */
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
  await page.getByText('INICIAR SESIÓN', { exact: true }).click();

  // Esperar el botón "Portal Distribuidor" — confirma que el login fue exitoso
  const portalBtn = page.getByRole(SEL.autoregHome.portalDistribuidorButton.role, {
    name: SEL.autoregHome.portalDistribuidorButton.name,
  });
  await portalBtn.waitFor({ state: 'visible', timeout: 30_000 });

  // Portal Distribuidor abre en popup (nueva pestaña)
  const popupPromise = page.waitForEvent('popup');
  await portalBtn.click();
  const portal = await popupPromise;

  await portal.waitForURL(/motorambartest\.portaldevehiculos\.com/i, { timeout: 30_000 });
  await waitForPageIdle(portal);
  return portal;
}

/** Helper: login SysAdmin + navega al popup del Portal Distribuidores (flujo admin) */
async function loginSysAdminAndOpenPortal(
  page: Page,
  credentials: { email: string; password: string }
): Promise<Page> {
  await page.goto(URLS.autoregLogin);
  await waitForPageIdle(page);

  await page.locator(SEL.login.emailInput).click();
  await page.locator(SEL.login.emailInput).fill(credentials.email);
  await page.locator(SEL.login.passwordInput).click();
  await page.locator(SEL.login.passwordInput).fill(credentials.password);
  await page.getByText('INICIAR SESIÓN', { exact: true }).click();

  // SysAdmin aterriza en página de administración
  await page.goto('https://testwaf.portaldevehiculos.com/Forms/Admin/AdministerUsers.aspx');
  await waitForPageIdle(page);

  // Abrir menú de navegación lateral
  await page.locator('#PageFunctionsContent_Nav_imgNavOptions').click();

  // Click en "Portal Distribuidores" → abre popup
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Portal Distribuidores' }).click();
  const portal = await popupPromise;

  await portal.waitForURL(/motorambartest\.portaldevehiculos\.com/i, { timeout: 30_000 });
  await waitForPageIdle(portal);
  return portal;
}

// ---------------------------------------------------------------------------

test('TC-LOGIN-001: Login exitoso — Rol Distribuidor', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.distribuidor);

  await expect(portal.locator(SEL.dashboard.title)).toBeVisible({ timeout: 15_000 });

  await portal.screenshot({
    path: 'test-results/TC-LOGIN-001-distribuidor-dashboard.png',
    fullPage: true,
  });
});

test('TC-LOGIN-002: Login exitoso — Rol Cliente', async ({ page }) => {
  const portal = await loginAndOpenPortal(page, TEST_DATA.cliente);

  await expect(portal.locator(SEL.dashboard.title)).toBeVisible({ timeout: 15_000 });

  await portal.screenshot({
    path: 'test-results/TC-LOGIN-002-cliente-dashboard.png',
    fullPage: true,
  });
});

test('TC-LOGIN-003: Login exitoso — Rol SysAdmin', async ({ page }) => {
  const portal = await loginSysAdminAndOpenPortal(page, TEST_DATA.sysadmin);

  // SysAdmin aterriza en pantalla Administración > Tenants (no en Dashboard)
  await expect(portal.locator(SEL.adminPage.title)).toBeVisible({ timeout: 15_000 });

  await portal.screenshot({
    path: 'test-results/TC-LOGIN-003-sysadmin-admin.png',
    fullPage: true,
  });
});


