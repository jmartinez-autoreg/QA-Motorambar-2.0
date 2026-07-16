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
// Cada carpeta bajo tests/ es un pool independiente.
// Los pools se clasifican como READ o WRITE:
//
//   READ  → solo lectura / no mutan datos → pueden correr en paralelo con cualquiera
//   WRITE → crean/editan/eliminan datos   → deben declarar dependencias para evitar
//            condiciones de carrera sobre el mismo registro
//
// Regla de aislamiento de datos:
//   Cada pool opera sobre su propio set de VINs/registros exclusivos.
//   Un VIN usado en "filters" NUNCA se usa en "edit" ni "delete".
//
// Para agregar un nuevo pool:
//   1. Crear tests/<carpeta>/ con al menos un .spec.ts
//   2. Registrar la carpeta en POOL_CONFIG con type y order
//   3. Si es WRITE, declarar dependsOn (qué pool debe terminar antes)
//   4. El pool se detecta y registra automáticamente al correr
//
// ─────────────────────────────────────────────────────────────────────────────

type PoolType = 'read' | 'write';

interface PoolDefinition {
  type: PoolType;
  order: number;
  dependsOn?: string[];   // nombres de carpeta (no de pool) que deben terminar antes
}

/**
 * POOL_CONFIG — Fuente de verdad de todos los pools.
 * Actualizar aquí al agregar nuevas pantallas o specs de escritura.
 *
 * READ pools:  corren en paralelo entre sí (sin restricciones)
 * WRITE pools: corren después de sus dependencias (se serializa con ellas)
 */
const POOL_CONFIG: Record<string, PoolDefinition> = {
  // ── READ pools (paralelo total) ─────────────────────────────────────────
  'login':     { type: 'read',  order: 1 },
  'dashboard': { type: 'read',  order: 2 },
  'vehicles':  { type: 'read',  order: 3 },  // solo filtros = read-only

  // ── WRITE pools (agregar cuando existan specs de edición/eliminación) ───
  // 'vehicles-edit':   { type: 'write', order: 4, dependsOn: ['vehicles'] },
  // 'vehicles-import': { type: 'write', order: 5, dependsOn: ['vehicles-edit'] },
  // 'vehicles-delete': { type: 'write', order: 6, dependsOn: ['vehicles-edit'] },
};

const TESTS_DIR = path.join(__dirname, 'tests');

/** Construye los proyectos de Playwright desde POOL_CONFIG + carpetas activas */
function buildPools() {
  if (!fs.existsSync(TESTS_DIR)) return [];

  // Solo carpetas registradas en POOL_CONFIG que tengan al menos un .spec.ts
  const activePools = Object.entries(POOL_CONFIG)
    .filter(([folder]) => {
      const dir = path.join(TESTS_DIR, folder);
      return fs.existsSync(dir) &&
             fs.statSync(dir).isDirectory() &&
             fs.readdirSync(dir).some(f => f.endsWith('.spec.ts'));
    })
    .sort(([, a], [, b]) => a.order - b.order);

  // Map carpeta → nombre de proyecto (para dependsOn)
  const nameOf = (folder: string) =>
    `Pool ${POOL_CONFIG[folder]?.order} | ${folder}`;

  return activePools.map(([folder, def]) => ({
    name: nameOf(folder),
    testMatch: `**/tests/${folder}/**/*.spec.ts`,
    use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    // Inyectar dependencias si el pool es WRITE
    ...(def.dependsOn?.length
      ? { dependencies: def.dependsOn.map(nameOf) }
      : {}),
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
