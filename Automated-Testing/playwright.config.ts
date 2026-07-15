import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Cargar variables de ambiente desde .env.playwright
dotenv.config({ path: '.env.playwright' });

/**
 * Configuración de Playwright para pruebas E2E de Motorambar
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Tiempo máximo para cada test */
  timeout: 120_000,
  
  /* Tiempo máximo para cada expect */
  expect: {
    timeout: 10_000
  },

  /* NO ejecutar tests en paralelo (evitar conflictos de sesión) */
  fullyParallel: false,
  workers: 1,

  /* Sin reintentos por defecto (habilitar solo para CI) */
  retries: 0,

  /* Reporter para resultados */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],

  /* Configuración compartida para todos los tests */
  use: {
    /* URL base de Autoreg (login centralizado) */
    baseURL: process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com',

    /* Capturar screenshots solo en fallos */
    screenshot: 'on',

    /* Capturar trace en primer reintento */
    trace: 'on-first-retry',

    /* Video solo en fallos */
    video: 'on',

    /* Viewport estándar */
    viewport: { width: 1280, height: 720 },

    /* Timeout para acciones individuales */
    actionTimeout: 15_000,

    /* Navegación con espera de networkidle */
    navigationTimeout: 30_000,

    /* Modo headless controlado por variable de ambiente */
    headless: process.env.HEADLESS === 'true',

    /* Slow motion para debugging (ms entre acciones) */
    launchOptions: {
      slowMo: parseInt(process.env.SLOW_MO || '0'),
    },
  },

  /* Configuración de proyectos (navegadores) */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    /* Descomentar para probar en otros navegadores
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],

  /* Servidor de desarrollo (si aplica) */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
