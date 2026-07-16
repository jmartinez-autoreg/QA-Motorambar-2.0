import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de ambiente desde .env.playwright
dotenv.config({ path: '.env.playwright' });

// ─── Pool Config ────────────────────────────────────────────────────────────
//
// ARQUITECTURA DE POOLS — Configuración centralizada
//
// Cada carpeta bajo tests/ = un pool independiente.
// Los pools corren en PARALELO entre sí (un worker por pool).
// Los tests dentro de cada pool corren en SECUENCIA.
//
// Regla: si la carpeta no tiene specs, el pool no se registra
// (evita workers vacíos que consumen recursos).
//
// Para agregar un nuevo pool: crear tests/<nueva-pantalla>/ y poner specs.
// NO hace falta modificar este archivo — se detecta automáticamente.
//
// Pools actuales:
//   Pool 1 → tests/login/       (SSO-sensitivo, corre primero)
//   Pool 2 → tests/dashboard/   (sesión independiente)
//   Pool 3 → tests/vehicles/    (sesión independiente)
//
// ─────────────────────────────────────────────────────────────────────────────

const TESTS_DIR = path.join(__dirname, 'tests');
const POOL_ORDER = ['login', 'dashboard', 'vehicles'];  // pools prioritarios primero; el resto se agrega al final

/** Detecta carpetas con specs bajo tests/ y genera los proyectos de Playwright */
function buildPools() {
  if (!fs.existsSync(TESTS_DIR)) return [];

  // Carpetas que tienen al menos un .spec.ts
  const activeFolders = fs.readdirSync(TESTS_DIR)
    .filter(name => {
      const dir = path.join(TESTS_DIR, name);
      if (!fs.statSync(dir).isDirectory()) return false;
      return fs.readdirSync(dir).some(f => f.endsWith('.spec.ts'));
    });

  // Ordenar: primero los de POOL_ORDER, luego el resto alfabéticamente
  const ordered = [
    ...POOL_ORDER.filter(p => activeFolders.includes(p)),
    ...activeFolders.filter(p => !POOL_ORDER.includes(p)).sort(),
  ];

  return ordered.map((folder, i) => ({
    name: `Pool ${i + 1} | ${folder}`,
    testMatch: `**/tests/${folder}/**/*.spec.ts`,
    use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
  }));
}

const pools = buildPools();

/**
 * Configuración de Playwright para pruebas E2E de Motorambar
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Tiempo máximo para cada test */
  timeout: 120_000,
  
  /* Tiempo máximo para cada expect */
  expect: { timeout: 10_000 },

  /* Tests dentro de cada pool: secuenciales */
  fullyParallel: false,

  /* Workers = número de pools activos (cada pool corre en su propio worker) */
  workers: pools.length || 1,

  /* Sin reintentos por defecto */
  retries: 0,

  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  /* Configuración compartida para todos los pools */
  use: {
    baseURL: process.env.BASE_URL || 'https://testwaf.portaldevehiculos.com',
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'on',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    headless: process.env.HEADLESS === 'true',
    launchOptions: { slowMo: parseInt(process.env.SLOW_MO || '0') },
  },

  /* Proyectos = Pools (auto-generados desde las carpetas de tests/) */
  projects: pools,
});
