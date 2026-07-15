import { Page } from '@playwright/test';
import { waitForPageIdle } from './wait-helpers';

/**
 * Credenciales de test desde variables de ambiente
 */
export const TEST_USERS = {
  distribuidor: {
    email: process.env.TEST_USER_DISTRIBUIDOR || 'j.distribuidor',
    password: process.env.TEST_PASS_DISTRIBUIDOR || '123456',
  }
} as const;

/**
 * URLs del sistema
 */
export const URLS = {
  autoreg: process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com',
  autoregLogin: `${process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com'}/Forms/Account/LoginNew.aspx`,
  portalDistribuidor: process.env.PORTAL_DISTRIBUIDOR_URL || 'https://motorambartest.portaldevehiculos.com',
} as const;

/**
 * Realiza login en Autoreg y espera hasta llegar a la pantalla post-login
 * Selectores confirmados con Playwright Codegen
 */
export async function loginAutoreg(
  page: Page,
  credentials: { email: string; password: string }
): Promise<void> {
  await page.goto(URLS.autoregLogin);
  await waitForPageIdle(page);

  await page.locator('#LoginUser_UserName').fill(credentials.email);
  await page.locator('#LoginUser_Password').fill(credentials.password);

  // Botón confirmado: texto en mayúsculas "INICIAR SESIÓN"
  await page.getByText('INICIAR SESIÓN', { exact: true }).click();

  await page.waitForURL(/\/Forms\/Account\/Default\.aspx|\/$/i, { timeout: 30_000 });
  await waitForPageIdle(page);
}

/**
 * Navega al Portal Distribuidor desde la pantalla post-login de Autoreg.
 * ⚠️ El Portal abre en POPUP (nueva pestaña) — retorna la Page del popup.
 */
export async function navigateToPortalDistribuidor(page: Page): Promise<Page> {
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Portal Distribuidor' }).click();
  const portalPage = await popupPromise;

  await portalPage.waitForURL(/motorambartest\.portaldevehiculos\.com/i, { timeout: 30_000 });
  await waitForPageIdle(portalPage);
  return portalPage;
}

/**
 * Login completo: Autoreg → Portal Distribuidor
 * Retorna la Page del Portal (popup)
 */
export async function loginFullFlow(
  page: Page,
  role: 'distribuidor' = 'distribuidor'
): Promise<Page> {
  const credentials = TEST_USERS[role];

  if (!credentials.email || !credentials.password) {
    throw new Error(`Credenciales no configuradas para rol: ${role}`);
  }

  await loginAutoreg(page, credentials);
  return navigateToPortalDistribuidor(page);
}
