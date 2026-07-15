import { Page } from '@playwright/test';
import { waitForPageIdle } from './wait-helpers';

/**
 * Credenciales de test desde variables de ambiente
 */
export const TEST_USERS = {
  distribuidor: {
    email: process.env.TEST_USER_DISTRIBUIDOR || 'test.distribuidor',
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

  // #btnTriggerLogin: ID confirmado en DOM (PRIORITY 1) — reemplaza getByText('INICIAR SESIÓN')
  await page.locator('#LoginUser_UserName').click();
  await page.locator('#LoginUser_UserName').fill(credentials.email);
  await page.locator('#LoginUser_Password').click();
  await page.locator('#LoginUser_Password').fill(credentials.password);
  await page.locator('#btnTriggerLogin').click();

  // Post-login URL confirmada: /Default.aspx (no /Forms/Account/Default.aspx)
  await page.waitForURL(/\/Default\.aspx/i, { timeout: 30_000 });
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

/**
 * Logout desde el Portal Distribuidor — limpia la sesión SSO activa.
 *
 * Flujo confirmado con MCP Browser discovery (2026-07-15):
 *   1. Click en el área de perfil del header (contiene nombre + rol del usuario)
 *   2. Click en "Cerrar sesión" — único en el DOM cuando el dropdown está abierto
 *
 * ⛔ OBLIGATORIO en afterEach() de TODO spec que abra el portal popup.
 *    Sin logout, el servidor revoca el token SSO del siguiente test.
 */
export async function logoutPortal(portalPage: Page): Promise<void> {
  if (portalPage.isClosed()) return;

  try {
    const url = portalPage.url();
    if (!url.includes('motorambartest.portaldevehiculos.com')) return;
    // Si ya está en sso-login no hay sesión activa
    if (url.includes('sso-login')) return;

    // Abrir dropdown de perfil — selector robusto: área del header con el nombre/rol del usuario
    // Confirmado en DOM: generic[cursor-pointer] dentro del banner que contiene los párrafos de nombre y rol
    const profileArea = portalPage.locator('header [class*="cursor-pointer"]').last();
    await profileArea.click();

    // Click en "Cerrar sesión" — único en el dropdown (confirmado .length === 1)
    const cerrarSesionBtn = portalPage.getByRole('button', { name: 'Cerrar sesión' });
    await cerrarSesionBtn.waitFor({ state: 'visible', timeout: 5_000 });
    await cerrarSesionBtn.click();

    // Esperar redirección post-logout
    await portalPage.waitForURL(/sso-login|login/i, { timeout: 10_000 }).catch(() => {});
  } catch {
    // Si falla el logout limpio, cerrar la pestaña directamente
    await portalPage.close().catch(() => {});
  }
}

/**
 * Cierra todas las pestañas del portal (popups).
 * Llamar DESPUÉS de logoutPortal para limpiar el contexto completamente.
 */
export async function closePortalTabs(page: Page): Promise<void> {
  const context = page.context();
  const pages = context.pages();

  for (const p of pages) {
    if (p !== page && p.url().includes('motorambartest.portaldevehiculos.com')) {
      await p.close().catch(() => {});
    }
  }
}
