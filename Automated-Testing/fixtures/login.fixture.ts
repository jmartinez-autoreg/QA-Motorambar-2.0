import { Page } from '@playwright/test';

/**
 * Selectores para el flujo de Login
 * Basados en context/UI-UX.md - Pantalla: Autoreg > Login
 */
export const SEL = {
  // Página de Login — IDs confirmados con Playwright Codegen
  login: {
    emailInput: '#LoginUser_UserName',
    passwordInput: '#LoginUser_Password',
    rememberCheckbox: '#LoginUser_RememberMe',    // pendiente confirmar en discovery
    loginButton: 'text=INICIAR SESIÓN',
    forgotPasswordLink: 'text=¿Olvidaste tu contraseña?',
  },
  
  // Página Post-Login (Autoreg - Inicio)
  autoregHome: {
    welcomeTitle: 'text=Inicio: Bienvenido',
    userInfo: '.user-info',
    // ⚠️ El botón abre el portal en POPUP (nueva pestaña) — usar waitForEvent('popup')
    portalDistribuidorButton: { role: 'button' as const, name: 'Portal Distribuidor' },
    logoutButton: 'text=Salida',
  },
  
  // Dashboard Portal Distribuidor (Rol Distribuidor / Cliente)
  dashboard: {
    // h2 "Dashboard Ejecutivo" — selector único confirmado en error-context
    title: 'h2:has-text("Dashboard")',
    menuLateral: '.sidebar, nav',
    notificationBell: '[aria-label*="notif"], .notification-icon',
    profileIcon: '.profile-icon, [aria-label*="perfil"]',
  },

  // Pantalla Administración (Rol SysAdmin) — aterriza aquí en vez de Dashboard
  adminPage: {
    // Heading de la sección Administración (confirmado en screenshot 2026-07-15)
    title: ':is(h1, h2, h3):has-text("Administración")',
    // Botón exclusivo de la vista Tenants
    newTenantBtn: 'button:has-text("NUEVO TENANT")',
  },
};

/**
 * URLs del sistema
 */
export const URLS = {
  autoregLogin: `${process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com'}/Forms/Account/LoginNew.aspx`,
  autoregHome: process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com',
  portalDistribuidor: process.env.PORTAL_DISTRIBUIDOR_URL || 'https://motorambartest.portaldevehiculos.com',
};

/**
 * Datos de test para login
 */
export const TEST_DATA = {
  distribuidor: {
    email: process.env.TEST_USER_DISTRIBUIDOR || 'j.distribuidor',
    password: process.env.TEST_PASS_DISTRIBUIDOR || '123456',
  },
  cliente: {
    email: process.env.TEST_USER_CLIENTE || 'jovidio',
    password: process.env.TEST_PASS_CLIENTE || '123456',
  },
  sysadmin: {
    email: process.env.TEST_USER_SYSADMIN || 'caseplusadmin',
    password: process.env.TEST_PASS_SYSADMIN || '123456',
  },
};

/**
 * Mensajes esperados del sistema
 */
export const MESSAGES = {
  loginSuccess: /bienvenido/i,
  loginError: /credenciales incorrectas|usuario o contraseña inválidos/i,
  requiredField: /campo requerido|campo obligatorio/i,
  blockedAccess: /acceso bloqueado/i,
};
