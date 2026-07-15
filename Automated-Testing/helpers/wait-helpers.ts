import { Page } from '@playwright/test';

/**
 * Espera a que la página esté completamente idle - ASP.NET WebForms con UpdatePanel
 * Combina networkidle + verificación de PageRequestManager
 */
export async function waitForPageIdle(page: Page, timeout = 20_000): Promise<void> {
  // Esperar a que no haya requests de red pendientes
  await page.waitForLoadState('networkidle', { timeout });
  
  // Verificar que no hay postbacks AJAX en curso (ASP.NET WebForms)
  await page.waitForFunction(() => {
    const prm = (window as any).Sys?.WebForms?.PageRequestManager?.getInstance?.();
    return !prm || !prm.get_isInAsyncPostBack();
  }, { timeout }).catch(() => {
    // Si falla es porque no hay PageRequestManager (no es WebForms con UpdatePanel)
    // Continuar de todas formas
  });
}

/**
 * Espera a que desaparezcan los spinners/loaders comunes en SPAs
 */
export async function waitForLoadersGone(page: Page, timeout = 10_000): Promise<void> {
  await page.waitForFunction(() => {
    const spinners = document.querySelectorAll(
      '.spinner,.loading,[class*="skeleton"],[class*="loading"],[aria-busy="true"]'
    );
    return spinners.length === 0 ||
      Array.from(spinners).every(el => (el as HTMLElement).offsetParent === null);
  }, { timeout }).catch(() => {
    // Ignorar si no hay spinners - no es error
  });
}

/**
 * Espera genérica para ambientes mixtos (WebForms + SPA)
 */
export async function waitForReady(page: Page, timeout = 20_000): Promise<void> {
  await waitForPageIdle(page, timeout);
  await waitForLoadersGone(page, timeout);
}

/**
 * Espera a que un elemento esté visible y listo para interacción
 */
export async function waitForElementReady(
  page: Page, 
  selector: string, 
  timeout = 10_000
): Promise<void> {
  await page.waitForSelector(selector, { 
    state: 'visible', 
    timeout 
  });
  
  // Verificar que el elemento no esté disabled
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel) as HTMLElement;
      return el && !el.hasAttribute('disabled') && el.offsetParent !== null;
    },
    selector,
    { timeout }
  );
}
