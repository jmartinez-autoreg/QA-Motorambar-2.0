# Automated Testing — Portal Distribuidor Motorambar

Pruebas E2E automatizadas con Playwright para el Portal de Distribución de Vehículos.

---

## Estructura del Proyecto

```
Automated-Testing/
├── playwright.config.ts         ← Config centralizada de pools y ejecución
├── .env.playwright              ← Credenciales de test (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
│
├── tests/                       ← Specs organizados por pantalla (Screaming Architecture)
│   ├── login/
│   │   └── login.spec.ts        ← Pool 1: Login SSO (3 roles)
│   ├── dashboard/
│   │   └── export-report.spec.ts  ← Pool 2: Descarga de reportes
│   └── vehicles/
│       └── filters.spec.ts      ← Pool 3: Filtros de Vehículos Importados
│
├── fixtures/                    ← Page Objects / selectores por pantalla
│   ├── login/
│   │   └── login.fixture.ts
│   ├── dashboard/
│   │   └── export-report.fixture.ts
│   └── vehicles/
│       └── filters.fixture.ts
│
├── helpers/                     ← Helpers compartidos (no por pantalla)
│   ├── auth-helpers.ts          ← logoutPortal, closePortalTabs, handleTermsAndConditions
│   └── wait-helpers.ts          ← waitForPageIdle, waitForLoadersGone
│
├── TEMP/
│   └── Downloads/               ← Archivos descargados por los tests (gitignored)
│
├── README.md                    ← Este archivo
└── Automated-Context.md         ← Reglas de operación del agente de automatización
```

---

## Arquitectura de Pools

Los pools permiten ejecutar grupos de tests en paralelo entre sí, con aislamiento por pantalla.

### Definición (en `playwright.config.ts`)

```typescript
const POOL_CONFIG: Record<string, PoolDefinition> = {
  'login':     { type: 'read',  order: 1 },
  'dashboard': { type: 'read',  order: 2 },
  'vehicles':  { type: 'read',  order: 3 },

  // Pools WRITE (cuando existan — declarar dependsOn para evitar race conditions)
  // 'vehicles-edit':   { type: 'write', order: 4, dependsOn: ['vehicles'] },
};
```

### Tipos de Pool

| Tipo | Descripción | Comportamiento |
|---|---|---|
| `read` | Solo lectura — no muta datos | Corre en paralelo con cualquier otro pool |
| `write` | Crea/edita/elimina registros | Corre DESPUÉS de sus `dependsOn` (serializado) |

### Ejecución paralela actual

```
Worker 1: Pool 1 | login     → TC-001 → TC-002 → TC-003
Worker 2: Pool 2 | dashboard → TC-001 → TC-002
Worker 3: Pool 3 | vehicles  → TC-001 → ... → TC-011
```

### Agregar un nuevo Pool

1. Crear `tests/<carpeta>/` con al menos un `.spec.ts`
2. Registrar en `POOL_CONFIG` en `playwright.config.ts`
3. Crear `fixtures/<carpeta>/<fixture>.fixture.ts`
4. El pool se activa automáticamente

---

## Reglas de Aislamiento de Datos

> ⛔ Un VIN/registro de un pool `read` NUNCA debe ser modificado por un pool `write`.

| Pool | Datos exclusivos |
|---|---|
| `vehicles` (filters) | VINs: `JN8BT3BA5TW332643`, `JN8BT3BA6TW332702`, ... |
| `vehicles-edit` (futuro) | VINs propios — nunca los de filters |

---

## Comandos de Ejecución

```powershell
# Todos los pools en paralelo
npx playwright test

# Pool específico
npx playwright test tests/login/
npx playwright test tests/dashboard/
npx playwright test tests/vehicles/

# Por proyecto
npx playwright test --project="Pool 1 | login"

# Con slow motion (debugging visual)
$env:SLOW_MO=800; npx playwright test tests/login/ --headed

# TC específico
npx playwright test tests/login/ --headed --grep "TC-LOGIN-001"

# Ver todos los tests listados
npx playwright test --list

# Ver reporte HTML
npx playwright show-report
```

---

## Flujo SSO del Portal

```
Login Autoreg → #btnTriggerLogin
  ↓ handleTermsAndConditions()  ← modal T&C opcional (espera 4s post-domcontentloaded)
  ↓ waitForEvent('popup', 30s) ANTES del click en "Portal Distribuidor"
  ↓ sso-login#token=JWT → waitForFunction(!sso-login) → /
  ↓ Portal Distribuidor listo
```

**Regla SSO:** Todo spec que abra el portal DEBE tener `afterEach` con `logoutPortal()` + `closePortalTabs()`.

---

## Historial de Cambios Arquitectónicos

| Fecha | Cambio |
|---|---|
| 2026-07-15 | Estructura inicial: tests/, fixtures/, helpers/ |
| 2026-07-15 | Login (3 roles), Dashboard (reportes), Vehicles (11 filtros) |
| 2026-07-16 | Screaming Architecture: reorganización por carpetas de pantalla |
| 2026-07-16 | Pool Architecture: ejecución paralela por pantalla con POOL_CONFIG |
| 2026-07-16 | Clasificación READ/WRITE + dependencias para race conditions |
| 2026-07-16 | `handleTermsAndConditions()` — modal T&C primer login |

---

## Ver también

- [Automated-Context.md](Automated-Context.md) — Reglas del agente de automatización
- [context/CONTEXT.md](../context/CONTEXT.md) — Contexto general del proyecto

```
Automated-Testing/
├── tests/              # Test specs (.spec.ts)
├── fixtures/           # Page Objects y datos de test
│   └── files/          # Archivos de test (PDFs, Excel, etc.)
├── helpers/            # Funciones auxiliares
├── data/               # Datos de test (JSON, CSV)
├── playwright.config.ts
├── .env.playwright     # Variables de ambiente (NO subir a repo)
└── package.json
```

## 🚀 Instalación

```powershell
# 1. Instalar dependencias
npm install

# 2. Instalar navegadores de Playwright
npx playwright install chromium

# 3. Configurar variables de ambiente
# Crear .env.playwright con las credenciales de test
```

## ▶️ Ejecución de Tests

```powershell
# Ejecutar todos los tests (modo headed - visible)
npm test

# Ejecutar en modo lento (800ms entre acciones)
npm run test:slow

# Ejecutar en modo debug (con Playwright Inspector)
npm run test:debug

# Ejecutar en modo headless (sin UI)
npm run test:headless

# Ejecutar UI mode (interfaz interactiva)
npm run ui

# Ver reporte HTML de la última ejecución
npm run report
```

## 🧪 Tests Disponibles

### Login (login.spec.ts)
- ✅ TC-LOGIN-001: Login exitoso con credenciales válidas
- ✅ TC-LOGIN-002: Login fallido con credenciales inválidas
- ✅ TC-LOGIN-003: Validación de campos requeridos vacíos
- ✅ TC-LOGIN-004: Checkbox "Recuérdame" funcional
- ✅ TC-LOGIN-005: Link "¿Olvidaste tu contraseña?" funcional
- ✅ TC-LOGIN-006: Logout desde Autoreg post-login
- ✅ TC-LOGIN-SEC-001: Seguridad - Inyección SQL
- ✅ TC-LOGIN-SEC-002: Seguridad - XSS
- ✅ TC-LOGIN-EDGE-001: Edge case - Email con espacios

## 🔧 Configuración

### Variables de Ambiente (.env.playwright)

```env
BASE_URL=https://testwaf.portaldevehiculos.com
PORTAL_DISTRIBUIDOR_URL=https://motorambartest.portaldevehiculos.com
TEST_USER_DISTRIBUIDOR=j.motorambar
TEST_PASS_DISTRIBUIDOR=123456
SLOW_MO=0
HEADLESS=false
```

## 📝 Convenciones

### Nomenclatura de Tests
- **TC-[MODULO]-[NUM]**: Test cases funcionales
- **TC-[MODULO]-SEC-[NUM]**: Tests de seguridad
- **TC-[MODULO]-EDGE-[NUM]**: Tests de casos edge

### Estructura de un Test
```typescript
test('TC-XXX-001: Descripción del caso de prueba', async ({ page }) => {
  // PASO 1: Acción
  // RESULTADO ESPERADO 1: Verificación
  // PASO 2: Acción
  // RESULTADO ESPERADO 2: Verificación
  // ...
});
```

## 🎯 Próximos Tests a Implementar

- [ ] Vehículos Importados - Grid y Filtros
- [ ] Importar Vehículos - Flujo completo
- [ ] Importar CPA - Flujo completo
- [ ] Editar/Ver Vehículo
- [ ] Generación de Reportes
- [ ] Administración (solo SysAdmin)

## 🐛 Debug y Troubleshooting

### Ver trace de un test fallido
```powershell
npx playwright show-trace test-results/[nombre-test]/trace.zip
```

### Generar código con Codegen
```powershell
npx playwright codegen --viewport-size=1280,720 https://testwaf.portaldevehiculos.com
```

### Ejecutar un solo test
```powershell
npx playwright test login.spec.ts
```

### Ejecutar tests que coincidan con un patrón
```powershell
npx playwright test --grep "LOGIN-001"
```

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- Context: `../context/CONTEXT.md` y `../context/UI-UX.md`
- Skills: `../skills/playwright-e2e/SKILL.md`

---

**Mantenido por:** QA Team Motorambar  
**Última actualización:** 2026-07-15
