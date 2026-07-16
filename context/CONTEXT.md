# Contexto del Proyecto

> ⚠️ Este archivo se auto-carga al inicio de cada sesión (vía `@context/CONTEXT.md` en `CLAUDE.md`).
> Completa cada sección con los datos reales del proyecto — el agente lo usa como **fuente de verdad** para TCs, USs y ejecución.
> NUNCA inventar datos de esta sección: si falta información, preguntar al usuario o usar el skill `project-onboarding`.

---

## Configuración del Agente

> Usado por el skill `activity-logger` (fecha/hora local + carpetas de bitácora), por la regla de
> idioma de interacción (AGENTS.md §8.9) y por el comando "actualiza el template" (AGENTS.md §6.1).
> Se completa una vez con `project-onboarding`, o se pregunta cuando se necesita por primera vez.

| Campo | Valor |
|-------|-------|
| Idioma de interacción | `Español` |
| Zona horaria | `America/Santo_Domingo (UTC-4)` |
| Sprint actual | `Entregable 5` |
| Ruta local de QA-TOOLS-TEMPLATE | `C:\Users\Jhon Martinez\Documents\IA\QA-TOOLS-TEMPLATE` |
| Ruta local de estándares oficiales | `C:\Users\Jhon Martinez\Documents\IA\QA Informaciones\Estándares y Procesos` |

> Actualiza "Sprint actual" al iniciar cada sprint nuevo — define el nombre de carpeta de la bitácora.
> "Ruta local de estándares oficiales" apunta a la carpeta con los documentos de la empresa
> (PROC-QA-*, GUÍA-QA-*, ceremoniales) — usada por AGENTS.md §8.13 para verificar convenciones
> antes de asumir que no existen. Si hay subcarpeta `markdown_output/`, preferirla (búsqueda por
> texto); ante extracción incompleta, ir al PDF original.

---

## Portales y URLs

| Portal | URL (Test) | URL (Pre-Prod) | Descripción |
|--------|-----|-----|-------------|
| **Autoreg** | `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx` | `https://pdvpreprod.portaldevehiculos.com/Forms/Account/LoginNew.aspx` | Login centralizado para acceso a todos los portales |
| **Portal Distribuidor** | `https://motorambartest.portaldevehiculos.com` | _(pendiente)_ | Portal principal de distribución de vehículos — Dashboard, Importación de Vehículos, Importación de CPA, Historial, Reportes |

---

## Login — Flujos Conocidos

### Login via Autoreg (unificado para todos los roles)
- **URL:** `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx`
- **Campos:** Email, Contraseña, checkbox "Recuérdame"
- **Botón:** "Iniciar Sesión"
- **Tras login exitoso:** redirige a página de Autoreg con menú lateral que muestra las apps disponibles según el rol del usuario
- **Acceso a Portal Distribuidor:** desde el menú de Autoreg, clic en botón "Portal de Distribución de Vehículos" o ícono correspondiente → abre `https://motorambartest.portaldevehiculos.com`
- **Pantalla bloqueada:** si el token de sesión es revocado o caduca, se muestra "Acceso Bloqueado" con mensaje de contactar al administrador

---

## Roles y Permisos

| Rol | Permisos / Pantallas disponibles |
|-----|-----------------------------------|
| **Distribuidor** | Dashboard, Vehículos Importados, Importar Vehículos, Importar CPA, Historial de Importaciones, Historial de CPA, Editar/Ver Vehículos, Reportes, Notificaciones |
| **Cliente (Dealer)** | ⚠️ **PENDIENTE** — documentar qué pantallas/acciones tienen acceso |
| **Cliente (Banco)** | ⚠️ **PENDIENTE** — documentar qué pantallas/acciones tienen acceso |
| **SysAdmin** | Todas las pantallas + sección de Administración (Usuarios, Plantillas de Importación, Plantilla CO, Reglas de Completitud, Firma Digital, Favoritos, Notificaciones Diarias) |

> **Nota:** Los 4 roles están definidos en el repo del proyecto. Para documentar los roles Cliente, navegar la app con esos usuarios o consultar el código en `C:\Users\Jhon Martinez\Documents\Motorambar\Project\Motorambar`.

---

## Pantallas Principales

- **Dashboard** — Pantalla inicial con resumen de vehículos importados, estadísticas y acceso rápido a generación de reportes
- **Vehículos Importados** — Grid con todos los vehículos importados, filtros avanzados (por fechas, VIN, estado), acciones batch e individuales (Editar, Ver, Reportar), expansión de VIN
- **Importar Vehículos** — Flujo de carga masiva de vehículos (archivo Excel/CSV) con validación y progreso
- **Importar CPA** — Flujo multi-step (selección de archivo → progreso → resumen) para importar Certificados de Pre-Autorización
- **Historial de Importaciones** — Registro histórico de todas las importaciones de vehículos realizadas
- **Historial de CPA** — Registro histórico de todas las importaciones de CPA con filas de detalle
- **Editar/Ver Vehículo** — Pantalla de detalle de un vehículo, con modo Vista (solo lectura) y modo Edición (campos editables según rol)
- **Reportes** — Generación de reportes desde Dashboard o Vehículos Importados
- **Administración** (solo SysAdmin) — Gestión de tenants, usuarios, plantillas, reglas de completitud, firma digital, favoritos, notificaciones diarias

---

## Módulos del Sistema

- **Dashboard** — Pantalla inicial con resumen y accesos rápidos
- **Vehículos** — Gestión completa: importar, listar, editar, historial
- **CPA** — Importación y historial de Certificados de Pre-Autorización
- **Administración** — Gestión de configuración del sistema (solo SysAdmin)
- **Reportes** — Generación de reportes desde diferentes contextos

---

## Organización ADO

- **Organización:** `AutoregPR`
- **Proyecto:** `Motorambar`
- **URL:** `https://dev.azure.com/AutoregPR/Motorambar`
- **Usuario QA:** `jhon.martinez@autoregpr.com`

---

## Automatización E2E — Reglas Obligatorias (Portal SSO)

> ⛔ Estas reglas aplican a TODOS los specs que abran el Portal Distribuidor.
> El agente debe aplicarlas automáticamente al crear cualquier nuevo spec — sin que el usuario tenga que recordarlo.

### Comportamiento SSO del Portal

- El Portal Distribuidor (`motorambartest.portaldevehiculos.com`) usa **SSO federado** desde Autoreg.
- Flujo de apertura: Autoreg (`/Default.aspx`) → click "Portal Distribuidor" → **popup** con `sso-login#token=JWT` → redirige a `/`
- El token SSO del portal expira en **~60 segundos** — el test debe completarse antes de que expire.
- Si hay una sesión activa del mismo usuario, el nuevo token es **revocado** → el portal vuelve a `sso-login`.

### Regla OBLIGATORIA: afterEach con logout en TODO spec

Cada spec que abra el portal popup **DEBE** incluir este `afterEach`:

```typescript
test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});
```

Sin esto → el siguiente test recibe "token revocado" o "El token ha sido revocado o es inválido".

### Usuarios de prueba (ambiente Test)

| Rol | Usuario | Contraseña | Archivo |
|-----|---------|------------|---------|
| Distribuidor | `test.distribuidor` | `123456` | `.env.playwright` |
| Cliente | `test.cliente.toyota` | `123456` | `.env.playwright` |
| SysAdmin | `test.admin` | `123456` | `.env.playwright` |

### Helpers disponibles (`Automated-Testing/helpers/auth-helpers.ts`)

| Helper | Descripción |
|--------|-------------|
| `logoutPortal(portalPage)` | Navega al home → click perfil → "Cerrar sesión". Cierra modal si quedó abierto. |
| `closePortalTabs(page)` | Cierra todas las pestañas del portal que no sean la de Autoreg. |

### Términos y Condiciones (modal condicional — primera sesión)

- Aparece en Autoreg **solo en la primera sesión** de un usuario nuevo o después de actualización de T&C.
- Si en 4 segundos post-login no aparece → ignorar (no volverá en esa sesión).
- **Selectores confirmados con Playwright Codegen (2026-07-16):**

```typescript
// Contenedor del modal
'#divTermConditions'

// 4 checkboxes obligatorios (marcar todos antes de habilitar el botón)
'#ucTermsConditions_gvTermConditionsBullets_chkChecked_0'
'#ucTermsConditions_gvTermConditionsBullets_chkChecked_1'
'#ucTermsConditions_gvTermConditionsBullets_chkChecked_2'
'#ucTermsConditions_gvTermConditionsBullets_chkChecked_3'

// Botón Continuar (solo habilitado cuando todos los checks están marcados)
'#ucTermsConditions_btnSubmit'
```

- **Helper disponible:** `handleTermsAndConditions(page)` en `helpers/auth-helpers.ts`
- **Llamar SIEMPRE después de `#btnTriggerLogin`** y antes de esperar "Portal Distribuidor"
- Patrón try/catch: timeout = sin modal = continue; no lanza error

### Espera post-SSO (patrón confirmado)

```typescript
// ✅ Correcto — más rápido y preserva la sesión
await portal.waitForFunction(() => !window.location.href.includes('sso-login'), { timeout: 30_000 });
await portal.locator('h2:has-text("Dashboard")').waitFor({ state: 'visible', timeout: 30_000 });

// ❌ Incorrecto — waitForPageIdle es lento y puede agotar la sesión SSO
await waitForPageIdle(portal);
```

### Navegación directa dentro del portal

Después del SSO, usar `goto` directo en lugar de click en el menú lateral:
```typescript
await portal.goto('https://motorambartest.portaldevehiculos.com/import');    // Vehículos Importados
await portal.goto('https://motorambartest.portaldevehiculos.com/');          // Dashboard
```

---

## Automatización E2E — Componentes Custom del Portal

> ⛔ El portal usa componentes React personalizados con comportamiento diferente al HTML estándar.
> Leer esta sección ANTES de escribir interacciones con cualquier componente de filtros.

### DcMultiValueInput — Input de valores múltiples

**Componente:** `frontend/src/components/ui/DcMultiValueInput.tsx`
**Usado en:** Filtros VIN, Factura, Carta de Crédito, Orden de Venta, Concesionario, Institución Financiera

**Comportamiento confirmado (análisis de código fuente):**
- Al hacer **click** en el campo → se abre un **textarea** flotante
- El usuario escribe en el **textarea** (NO en el input directamente)
- Al hacer **click fuera** del textarea → se procesan y crean los chips

**Separadores por campo:**
| Campo | Separador para múltiples valores |
|---|---|
| VIN | espacio, coma, salto de línea (default) |
| N.º Factura | espacio, coma, salto de línea (default) |
| N.º Carta de Crédito | espacio, coma, salto de línea (default) |
| N.º Orden de Venta | espacio, coma, salto de línea (default) |
| Concesionario | solo salto de línea (`\n`) — un valor a la vez |
| Institución Financiera | solo salto de línea (`\n`) — un valor a la vez |

**Patrón CORRECTO en Playwright:**
```typescript
// Helper reutilizable — SIEMPRE usar este patrón para DcMultiValueInput
async function fillMultiValueInput(portal: Page, inputSelector: string, value: string): Promise<void> {
  await portal.locator(inputSelector).click();          // abre el textarea
  await portal.locator('textarea').last().fill(value);  // escribe en el textarea
  await portal.locator('h1').click();                   // click fuera → cierra y crea chips
}

// Para VIN (múltiples separados por espacio):
await fillMultiValueInput(portal, 'input[placeholder="Buscar por VIN"]', 'JN8BT3BA5TW332643 JN8BT3BA6TW332702');

// Para Concesionario (un solo valor, Enter es el separador):
await fillMultiValueInput(portal, 'input[placeholder="Buscar por nombre o licencia..."]', 'MEDINA NISSAN');
```

**⛔ PATRÓN INCORRECTO:**
```typescript
// NO hacer esto — fill() en el input no abre el textarea
await portal.locator('input[placeholder="Buscar por VIN"]').fill('JN8BT3BA5TW332643');
await portal.locator('input[placeholder="Buscar por VIN"]').press('Enter'); // no funciona
```

### DcMultiSelect — Dropdown de selección múltiple

**Componente:** `frontend/src/components/ui/DcMultiSelect.tsx`
**Usado en:** Estado CO, Estado CPA, Estado de Factura, Marca

**Comportamiento:**
- Click en el botón → abre un dropdown con `input[placeholder="Buscar..."]` + lista `ul li button`
- Hay un overlay `[aria-label="Close dropdown"]` que cierra el dropdown al hacer click fuera

**Opciones confirmadas en DOM (2026-07-15):**
| Filtro | Opciones disponibles |
|---|---|
| Estado CO | `Pendiente`, `Completado` |
| Estado CPA | `Pendiente`, `Completado` |
| Estado de Factura | `Pendiente`, `Completado` |
| Marca | `Infiniti`, `Kia`, `Nissan` |

**Patrón CORRECTO en Playwright:**
```typescript
await portal.locator('button:has-text("Estado CO")').click();
await portal.locator('input[placeholder="Buscar..."]').first().waitFor({ state: 'visible', timeout: 5_000 });
await portal.locator('ul li button:has-text("Pendiente")').first().click();
await portal.locator('[aria-label="Close dropdown"]').click();  // cerrar overlay
await waitForGridLoad(portal);
```

### LocationDropDown — Regla de interacción con overlay

**⛔ PATRÓN OBLIGATORIO:** El `DcDropdownMenu` interno renderiza un overlay `fixed inset-0 z-40` cuando el dropdown está abierto. Este overlay bloquea clicks en cualquier control que esté FUERA del dropdown (radio tabs, botón favoritos).

**Orden correcto:**
```typescript
// 1. Radio tab y/o favoritos PRIMERO (sin dropdown abierto)
await portal.locator('[role="radio"][aria-label="Concesionario"]').click();
await portal.locator('button[role="switch"][title="Solo Favoritos"]').click();

// 2. LUEGO abrir el dropdown
await portal.locator('button:has-text("Todas las Localidades")').click();

// 3. Seleccionar opción REAL (excluir "Todas las Localidades" = primera opción de reset)
await portal.locator('li button[title]').filter({ hasNotText: 'Todas las Localidades' }).first().click();
```

**waitFor de opciones opcionales:** siempre con `.catch(() => {})` — si no hay opciones disponibles no debe fallar el test:
```typescript
await options.first().waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
const count = await options.count();
if (count > 0) { /* seleccionar */ }
```

### DcDatePicker — Selector de fecha

**Componente:** `frontend/src/components/ui/DcDatePicker.tsx`
**Usado en:** Filtro de rango de fechas (header de Vehículos Importados)
**Selector:** `button:has-text("Seleccionar fecha")` o `button:has-text("2026")` cuando tiene fecha

**Pendiente documentar:** patrón de interacción para selección de rango de fechas.

### LocationDropDown — Dropdown de localidades

**Componente:** `frontend/src/app/common/LocationDropDown.tsx`
**Usado en:** Filtro de localidad (header de Vehículos Importados)
**Selector:** `button:has-text("Todas las Localidades")`

**Pendiente documentar:** opciones disponibles y patrón de selección.

---

## Automatización E2E — URLs del Portal (confirmadas)

| Pantalla | URL real (confirmada en DOM) |
|---|---|
| Dashboard | `https://motorambartest.portaldevehiculos.com/` |
| Vehículos Importados | `https://motorambartest.portaldevehiculos.com/import` |
| Importar Vehículos | `https://motorambartest.portaldevehiculos.com/import/upload` |
| Historial de Importaciones | `https://motorambartest.portaldevehiculos.com/import/history` |

> ⛔ La URL `/vehicles` NO existe — produce 404. Siempre usar `/import`.

---

## Automatización E2E — Datos de Test (ambiente Test)

### Vehículos Importados — Datos reales

| Tipo | Valores confirmados |
|---|---|
| VINs | `JN8BT3BA5TW332643`, `JN8BT3BA6TW332702`, `JN8BT3BAXTW332704`, `JN8BT3BA4TW332469`, `JN8BT3BA3TW332494` |
| Facturas | `90625423`, `90625418`, `90625416`, `90625415`, `90625417` |
| Cartas de Crédito | `100503`, `90631885` |
| Órdenes de Venta | `89012039`, `89012083` |
| Concesionarios (Dealer) | `MEDINA NISSAN`, `CABRERA GRUPO AUTOMOTRIZ, LLC` |
| Instituciones Financieras | `POPULAR AUTO`, `FIRSTBANK` |
| Marcas disponibles | `Infiniti`, `Kia`, `Nissan` |

---

## Terminología Literal (NO cambiar nombres)

| Término en sistema | Descripción |
|--------------------|-------------|
| `CPA` | Certificado de Pre-Autorización |
| `CO` | Certificado de Origen |
| `VIN` | Vehicle Identification Number (Número de Identificación del Vehículo) |
| `Vehículos Importados` | Listado principal de vehículos en el sistema |
| `Importar Vehículos` | Módulo de carga masiva de vehículos |
| `Importar CPA` | Módulo de carga de Certificados de Pre-Autorización |
| `Historial de Importaciones` | Registro histórico de cargas de vehículos |
| `Historial de CPA` | Registro histórico de cargas de CPA |
| `Dashboard` | Pantalla inicial con resumen y accesos rápidos |
| `Distribuidor` | Rol principal de usuario (distribuidora de vehículos) |
| `Cliente (Dealer)` | Rol de cliente tipo concesionario |
| `Cliente (Banco)` | Rol de cliente tipo institución bancaria |
| `SysAdmin` | Rol de administrador del sistema |
| `Reglas de Completitud` | Configuración de validaciones de datos de vehículos |
| `Plantilla de Importación` | Template para carga de vehículos |
| `Plantilla CO` | Template para Certificado de Origen |

---

## Tecnología

- **Frontend Portal Distribuidor:** React + Next.js
- **Backend:** .NET
- **Base de Datos:** PostgreSQL
- **Infraestructura:** Azure (completo)
- **Repo local:** `C:\Users\Jhon Martinez\Documents\Motorambar\Project\Motorambar`
