# Automated-Context — Reglas de Operación del Agente

> Este archivo es la fuente única de reglas para cualquier agente (Copilot, Claude) que interactúe
> con la carpeta `Automated-Testing/`. Leer COMPLETO antes de realizar cualquier tarea de automatización.
>
> **Regla de mantenimiento:** Cada rework, fix o cambio arquitectónico DEBE generar una entrada
> en la sección "Lecciones Aprendidas". Un rework no documentado = contexto que se pierde.

---

## PASO 0 — Antes de cualquier tarea de automatización

1. Leer este archivo completo.
2. Leer `README.md` (arquitectura actual, comandos, estructura).
3. Leer `context/CONTEXT.md` § "Automatización E2E" (reglas SSO, componentes custom, datos de test).
4. Para specs de una pantalla específica: leer el `.tsx` del componente en el repo del proyecto
   ANTES de escribir selectores. Repo: `C:\Users\Jhon Martinez\Documents\Motorambar\Project\Motorambar`
5. Si la pantalla está en `context/UI-UX.md` → usar sus selectores como punto de partida.

---

## REGLA 1 — Gate de entrega obligatorio (FIX #8)

⛔ **PROHIBIDO** declarar un spec como "listo" o "✅" sin haber ejecutado el test y mostrado output real.

```powershell
# OBLIGATORIO antes de declarar un spec como listo:
npx playwright test tests/<carpeta>/<spec>.spec.ts --headed
```

La ÚNICA fuente de verdad es el output mostrando `X passed, 0 failed`.
Si el test no se pudo correr → declarar explícitamente: "Código creado y compila. **Pendiente ejecutar.**"

---

## REGLA 2 — Leer el componente antes de escribir interacciones (FIX #10)

Para cualquier componente React/SPA custom, leer su `.tsx` ANTES de escribir selectores:

1. **Repo primero** → leer el `.tsx` del componente:
   ```
   frontend/src/components/ui/<NombreComponente>.tsx
   frontend/src/app/<feature>/components/<NombreComponente>.tsx
   ```
2. Buscar en el código:
   - Overlays `fixed inset-0 z-N` que bloquean clicks externos
   - Primera opción con `value=""` (opción de reset en selects)
   - Orden de interacción obligatorio (¿qué se debe clickear antes de abrir el dropdown?)
3. **MCP Browser solo para confirmar IDs/atributos en el DOM real** — no para descubrir estructura.

---

## REGLA 3 — Opciones de reset en selects (FIX #11)

Muchos componentes tienen la primera opción como "reset" (`value=""`):

```typescript
// ❌ Siempre selecciona la opción reset (ej: "Todas las Localidades")
portal.locator('li button[title]').first()

// ✅ Excluir el reset antes de seleccionar
portal.locator('li button[title]').filter({ hasNotText: 'Todas las Localidades' }).first()
```

Detectar en el código del componente: si la primera opción tiene `value: ""` → siempre filtrar.

---

## REGLA 4 — `waitFor` de elementos opcionales siempre con `.catch()` (FIX #12)

```typescript
// ❌ Falla si el elemento no aparece (modal opcional, dropdown vacío)
await page.locator('#optional').waitFor({ state: 'visible', timeout: 4_000 });

// ✅ Timeout silencioso
await page.locator('#optional').waitFor({ state: 'visible', timeout: 4_000 }).catch(() => {});
const count = await portal.locator('...').count();
if (count > 0) { /* hay opciones */ }
```

---

## REGLA 5 — Modales post-navegación: esperar DOM antes del timeout (FIX #13)

```typescript
// ❌ Frágil — el modal puede no haber rendereado aún
await page.locator('#modal').waitFor({ state: 'visible', timeout: 4_000 });

// ✅ Robusto — DOM listo PRIMERO
await page.waitForLoadState('domcontentloaded', { timeout: 30_000 });
await page.locator('#modal').waitFor({ state: 'visible', timeout: 4_000 }).catch(() => {});
```

---

## REGLA 6 — SSO Portal: afterEach obligatorio en TODO spec

Todo spec que abra el Portal Distribuidor DEBE incluir:

```typescript
test.afterEach(async ({ page }) => {
  const portalPage = page.context().pages().find(p =>
    !p.isClosed() && p.url().includes('motorambartest.portaldevehiculos.com')
  );
  if (portalPage) await logoutPortal(portalPage);
  await closePortalTabs(page);
});
```

Sin esto → el siguiente test recibe "token revocado o inválido".

---

## REGLA 7 — Overlay de DcDropdownMenu bloquea clicks externos

Cuando un dropdown (DcDropdownMenu) está abierto, renderiza `fixed inset-0 z-40` que bloquea
clicks en elementos externos (radio tabs, botones de toggle). **Orden obligatorio:**

```typescript
// ✅ Controls externos PRIMERO, luego abrir dropdown
await portal.locator('[role="radio"]...').click();    // tab (fuera)
await portal.locator('[role="switch"]...').click();   // toggle favoritos (fuera)
await portal.locator('button.trigger').click();       // AHORA abrir dropdown
await portal.locator('li button[title]').filter(...); // seleccionar opción (dentro = OK)

// ❌ Nunca clickear controls externos con el dropdown ya abierto
```

---

## REGLA 8 — DcMultiValueInput: siempre usar el helper `fillMultiValueInput`

```typescript
async function fillMultiValueInput(portal: Page, inputSelector: string, value: string): Promise<void> {
  await portal.locator(inputSelector).click();           // abre textarea
  await portal.locator('textarea').last().fill(value);   // escribe en textarea
  await portal.locator(SEL.heading).click();             // click fuera → crea chips
}
// NO usar .fill() ni .press() directamente en el input — no abre el textarea
```

---

## REGLA 9 — Agregar nuevos specs (checklist)

Al crear un nuevo spec para una pantalla:

- [ ] Leer el `.tsx` del componente en el repo (estructura, overlays, opciones reset)
- [ ] Leer `context/UI-UX.md` para esa pantalla (selectores confirmados)
- [ ] Crear carpeta `tests/<pantalla>/` y `fixtures/<pantalla>/`
- [ ] Registrar pool en `POOL_CONFIG` de `playwright.config.ts`
- [ ] Clasificar como `read` o `write` (¿muta datos?)
- [ ] Si `write` → declarar `dependsOn` apropiado
- [ ] Agregar `afterEach` con `logoutPortal` + `closePortalTabs`
- [ ] Llamar `handleTermsAndConditions(page)` después del login
- [ ] Ejecutar `npx playwright test tests/<pantalla>/` y verificar que pasa
- [ ] Actualizar `README.md` § "Historial de Cambios" y `context/CONTEXT.md` si hay selectores nuevos
- [ ] Actualizar esta sección si hay una regla nueva que aprender

---

## REGLA 10 — Aislamiento de datos entre pools

Cada pool tiene su set exclusivo de VINs/registros. NUNCA compartir un VIN entre pools `read` y `write`.

| Pool | Datos de test asignados |
|---|---|
| `vehicles` (filters) | VINs: `JN8BT3BA5TW332643`, `JN8BT3BA6TW332702`, `JN8BT3BAXTW332704`, `JN8BT3BA4TW332469`, `JN8BT3BA3TW332494` |
| Futuros pools write | VINs propios (no de la lista de arriba) |

---

## REGLA 11 — Precondición obligatoria en todo spec WRITE

Todo spec de tipo `write` (import, edit, delete) DEBE incluir:

```typescript
import { runPreconditionCleanup } from '../../db/helpers/precondition';
import { db } from '../../db/repositories';

test.beforeAll(async () => {
  await runPreconditionCleanup(); // limpia datos de prueba remanentes
});

test.afterAll(async () => {
  await db.close(); // cierra conexión DB
});
```

**Qué hace `runPreconditionCleanup()`:**
1. Verifica si existen datos de prueba en DB (Vehicles con test VINs, ImportLogs del archivo)
2. Si no existen → log "sistema limpio" y continúa
3. Si existen → los elimina en orden (FK: RowErrors → Vehicles → ImportLogs)
4. Si falla → **lanza error descriptivo y para** — no continúa con datos sucios

**Cuándo analizar si agregar precondición:**
> Al crear un nuevo spec WRITE → identificar qué tablas afecta (Vehicles, ImportLogs, etc.)
> → extender `precondition.ts` con la limpieza correspondiente.
> Si los datos encontrados son inesperados → loggear y lanzar error para que el usuario revise.

---

## Mapa Excel → DB → UI (Pantalla Ver/Editar Vehículo)

> [CO] = Campo requerido para generar/regenerar CO (Certificado de Origen).
> Los campos marcados [CO] son los que determinan si un vehículo tiene CO completo.

### Sección: DETAILS

| Campo UI | Label UI | Columna Excel | Campo DB | [CO] |
|---|---|---|---|---|
| VIN | VIN | `vin` | `Vehicle.Vin` | ✅ |
| Make | MAKE | `Maker` | `Vehicle.MakerId → Maker.Name` | ✅ |
| Model | MODEL | `Model` | `Vehicle.MakerModelId → MakerModel.Name` | — |
| Year | YEAR | `Year` | `Vehicle.Year` | ✅ |
| Assigned Client | ASSIGNED CLIENT | `Client Id` | `Vehicle.ClientAssignedId → ParentClient.Name` | — |

### Sección: TECHNICAL SPECIFICATIONS

| Campo UI | Label UI | Columna Excel | Campo DB | [CO] |
|---|---|---|---|---|
| Vehicle Color | VEHICLE COLOR | `Auto Color` | `Vehicle.AutoColorCode` | — |
| Doors | DOORS | `Doors` | `Vehicle.Doors` | — |
| Cylinders | CYLINDERS | `Pistons` | `Vehicle.Pistons` | ✅ |
| Horsepower | HORSEPOWER | `Horsepower` | `Vehicle.HorsePower` | ✅ |
| Propulsion Type | PROPULSION TYPE | `Propulsion Type Id` | `Vehicle.VehiclePropulsionTypeId` | — |
| Vehicle Weight | VEHICLE WEIGHT | `Unloaded Weight` | `Vehicle.UnloadedWeight` | ✅ |
| Load Capacity | LOAD CAPACITY | `Load Capacity` | `Vehicle.LoadCapacity` | ✅ |
| Vehicle Unit | VEHICLE UNIT | — | `Vehicle.Unit` | — |
| Series Or Model | SERIES OR MODEL | `Series Or Model` | `Vehicle.SeriesOrModel` | ✅ |

### Sección: REGULATORY AND ORIGIN

| Campo UI | Label UI | Columna Excel | Campo DB | [CO] |
|---|---|---|---|---|
| Origin Code | ORIGIN CODE | `Country Origin Code` | `Vehicle.CountryOriginCode` | — |
| Body Type | BODY TYPE | `Body Type` | `Vehicle.BodyType` | ✅ |
| Title No. | TITLE NO. | — | `Vehicle.TitleNumber` | — |
| Title Date | TITLE DATE | `Title Date` | `Vehicle.TitleDate` | ✅ |

### Sección: FINANCIAL

| Campo UI | Label UI | Columna Excel | Campo DB | [CO] |
|---|---|---|---|---|
| Contribution Price | CONTRIBUTION PRICE | `DNP` | `Vehicle.SalePrice` | — |
| Tax | TAX | `Sale Tax` | `Vehicle.SaleTax` | — |
| Tax Payment Date | TAX PAYMENT DATE | `Tax Payment Date` | `Vehicle.TaxPaymentDate` | — |
| Tax Declaration No. | TAX DECLARATION NO. | — | `Vehicle.ArbDeclaration` | — |
| CPA ID | CPA ID | — | `Vehicle.CpaNumber` | — |
| Contributor ID | CONTRIBUTOR ID | `Contributor Id` | `Vehicle.ContributorId` | — |
| Invoice No. | INVOICE NO. | `Invoice` | `Vehicle.Invoice` | ✅ |
| Dealer | DEALER | `Dealer` | `Vehicle.DealerId → ParentClient.Name` | ✅ |
| License No. | LICENSE NO. | `Dealer License` | `Vehicle.DealerLicence` | — |
| Client ID | CLIENT ID | `Client Id` | `Vehicle.ClientId` | — |
| Sales Order No. | SALES ORDER NO. | `Sales Order Number` | `Vehicle.SalesOrderNumber` | — |
| Letter of Credit No. | LETTER OF CREDIT NO. | `Credit Letter Number` | CreditLetterGroup | — |
| Financial Institution | FINANCIAL INSTITUTION | (via `Client Id`) | `Vehicle.FinantialInstitutionId` | — |
| Sale Price | SALE PRICE | `MSRP` | `Vehicle.TaxablePrice` | — |

### Campos [CO] — resumen para TCs de completitud

```
DETAILS:    VIN · Make · Year
TECHNICAL:  Cylinders · Horsepower · Vehicle Weight · Load Capacity · Series Or Model
REGULATORY: Body Type · Title Date
FINANCIAL:  Invoice No. · Dealer
```

### Regla de negocio: Auto-generación de CO

- Al importar → `StatusCOId = Pendiente` siempre (independientemente de si los campos están completos).
- El sistema tiene un **Worker en background** que detecta vehículos con todos los campos CO completos
  y auto-genera el CO → cambia `StatusCOId` a `Completado`.
- Este proceso es **asíncrono** — puede tardar segundos o minutos según la carga del Worker.

**Impacto en el flujo E2E:**
```
TC-IMPORT-001:  Import Excel (con campos CO completos) → CO = Pendiente ✓
TC-IMPORT-002:  Verificar vehículos en grid             → CO = Pendiente ✓
...
[tiempo para que el Worker procese]
...
TC-CO-001:      Verificar CO auto-generado              → CO = Completado ✓ (ÚLTIMO)
TC-CO-002:      Verificar reglas de completitud         → (ÚLTIMO)
```

- **Los TCs de CO deben ser los ÚLTIMOS en ejecutarse** dentro del pool, para dar tiempo al Worker.
- Si el CO no cambió a `Completado` → el test puede esperar en polling hasta un timeout configurable.
- Los TCs de reglas de completitud también van al final por la misma razón.

### Columnas visibles en el Grid (`/import`)

| Columna | Fuente |
|---|---|
| VIN | `Vehicle.Vin` |
| Vehículo | Maker + Model + Year |
| Factura | `Vehicle.Invoice` |
| Nro. Carta de Crédito | CreditLetterGroup |
| Asignado a | `ClientAssigned.Name` |
| Estado CO / CPA / Factura | `StatusCOId/CPAId/InvoiceId` (Pendiente al importar) |
| PDV-Datos / PDV-Documentos | `false` al importar |

---

## Selectores Confirmados en DOM

### Autoreg Login (`/Forms/Account/LoginNew.aspx`)

| Elemento | Selector |
|---|---|
| Username input | `#LoginUser_UserName` |
| Password input | `#LoginUser_Password` |
| Botón login | `#btnTriggerLogin` |
| Botón logout | `#ibtLogout` |
| Modal T&C container | `#divTermConditions` |
| T&C checkbox 0..3 | `#ucTermsConditions_gvTermConditionsBullets_chkChecked_0` .. `_3` |
| T&C botón Continuar | `#ucTermsConditions_btnSubmit` |
| Portal Distribuidor btn | `getByRole('button', { name: 'Portal Distribuidor' })` |

### Portal Distribuidor — Dashboard (`/`)

| Elemento | Selector |
|---|---|
| Heading | `h2:has-text("Dashboard")` |
| Botón Exportar Datos | `button:has-text("Exportar Datos")` — único en dashboard |
| Modal Generador | `[role="dialog"]` |
| Generar Reporte | `[role="dialog"] button:has-text("Generar Reporte")` |
| Cerrar Sesión (perfil) | `button:has-text("Cerrar sesión")` — abrir perfil primero |
| Botón perfil | `header [class*="cursor-pointer"]` — último en header |

### Portal Distribuidor — Vehículos Importados (`/import`)

| Elemento | Selector |
|---|---|
| URL real | `https://motorambartest.portaldevehiculos.com/import` |
| Heading | `h1:has-text("Vehículos Importados")` |
| VIN input | `input[placeholder="Buscar por VIN"]` |
| Factura input | `input[placeholder="Buscar por no. de factura..."]` |
| Carta Crédito input | `input[placeholder="Buscar por no. de carta de crédito..."]` |
| Orden Venta input | `input[placeholder="Buscar por no. de orden de venta..."]` |
| Estado CO btn | `button:has-text("Estado CO")` |
| Estado CPA btn | `button:has-text("Estado CPA")` |
| Estado Factura btn | `button:has-text("Estado de Factura")` |
| Marca btn | `button:has-text("Marca")` |
| Opciones en multi-select | `ul li button:has-text("Pendiente")` |
| Cerrar dropdown overlay | `[aria-label="Close dropdown"]` |
| Más Filtros toggle | `button:has-text("Más Filtros")` |
| Concesionario input | `input[placeholder="Buscar por nombre o licencia..."]` |
| Inst. Financiera input | `input[placeholder="Buscar por nombre de institución..."]` |
| Localidad btn | `button:has-text("Todas las Localidades")` |
| Tab Concesionario | `[role="radio"][aria-label="Concesionario"]` |
| Tab Banco | `[role="radio"][aria-label="Banco / Institución Financiera"]` |
| Tab Todos | `[role="radio"][aria-label="Todos"]` |
| Favoritos toggle | `button[role="switch"][title="Solo Favoritos"]` |
| Opciones localidad | `li button[title]` + `.filter({ hasNotText: 'Todas las Localidades' })` |
| Fecha btn | `button:has-text("Seleccionar fecha")` |
| Fecha OK | `button:has-text("OK")` |
| Fecha Cancelar | `button:has-text("Cancelar")` |
| Fecha modo Mes | `button:has-text("Mes")` |
| Actualizar btn | `button:has-text("Actualizar")` |
| Limpiar filtros btn | `button:has-text("Limpiar filtros")` |
| Grid tabla | `table` |
| Badge Más Filtros activos | `button:has-text("Más Filtros") span` |

---

## Reglas de Negocio del Sistema

### Flujo completo de vida de un vehículo

```
1. IMPORT EXCEL
   → CO = Pendiente | CPA = Pendiente | Invoice = Pendiente
   → ReleaseStatus = PendingDocuments(1)

2. CO AUTO-GENERADO (Worker background)
   → Si todos los campos CO están completos → CO = Completado
   → Worker: VehicleReleaseStatusJob (asíncrono, puede tardar segundos/minutos)

3. IMPORT CPA (archivo separado — Certificados de Pre-Autorización)
   → UploadCpaFile → Worker ProcessCpaPage → vincula CPA al vehículo por VIN
   → CPA = Completado

4. DOCUMENTOS DE FACTURA (upload manual)
   → Invoice = Completado

5. RELEASE STATUS RECALCULADO (Worker)
   → Según VehicleCompletenessRule del tenant:
     RequiresCo + RequiresCpa + RequiresInvoice → todos deben ser Completado
   → ReleaseStatus = Complete(3)

6. ENVÍO A PDV (Portal de Vehículos — integración externa)
   → Botones habilitados cuando Release = Complete
   → Dos tipos: PdvDataSent (metadata) y PdvDocumentsSent (documentos)
   → Se envían en batches vía Service Bus → Worker procesa
```

### Eliminación de vehículos

- Delete simple por ID (sin restricciones de estado CO/CPA/Invoice)
- Batch delete disponible (múltiples IDs)
- Accesible desde el grid (acción individual o batch)

### CPA — Certificados de Pre-Autorización

- Archivo separado del Excel de vehículos
- Flujo: Upload → Worker procesa páginas → vincula por VIN
- Si el VIN no coincide → puede corregirse manualmente (`CorrectCpaVin`)
- Si el vehículo cambia → puede re-vincularse (`RelinkCpa`)
- Impacta `StatusCPAId` del vehículo

### PDV — Portal de Vehículos (integración externa)

- Sistema externo (gobierno/CESCO)
- Columnas en grid: **PDV-Datos** (`PdvDataSent`) y **PDV-Documentos** (`PdvDocumentsSent`)
- Se envían en batches via Service Bus
- Requiere que el vehículo esté en estado listo (Release = Complete o con permiso `GridVehicles.SendToPdv`)

### Release Status (estado de liberación al cliente)

| ID | Estado | Significado |
|---|---|---|
| 1 | `PendingDocuments` | Faltan documentos requeridos |
| 2 | `PendingCreditLetter` | Falta carta de crédito |
| 3 | `Complete` | Listo para entrega al cliente |

- **Manual Release:** Puede forzarse a `Complete` si el vehículo está en `PendingDocuments` o `PendingCreditLetter`
- **Permiso requerido:** `Vehicles.ManualRelease`

### Reglas de Completitud (VehicleCompletenessRule)

- **Una regla por tenant** (restricción única)
- Configura qué es obligatorio para `ReleaseStatus = Complete`:

| Campo | Descripción |
|---|---|
| `RequiresCo` | CO debe estar Completado |
| `RequiresCpa` | CPA debe estar Completado |
| `RequiresInvoice` | Factura debe estar Completada |
| `GroupByCreditLetterNumber` | Agrupa vehículos por Carta de Crédito |

- Gestionado desde Administración (solo SysAdmin)

### Roles y acceso

| Rol | Accesos clave |
|---|---|
| **Distribuidor** | Dashboard, Vehículos Importados, Importar Vehículos, Importar CPA, Historial, Reportes, Notificaciones |
| **Cliente (Consulta Distribuidor)** | Vista de vehículos asignados — READ ONLY (sin permisos de reporte) |
| **SysAdmin** | Todo + Administración (Tenants, Usuarios, Plantillas, Completitud, Firma Digital, Favoritos) |

---

## Lecciones Aprendidas (historial de reworks)

| Fecha | Error | Causa raíz | Fix aplicado |
|---|---|---|---|
| 2026-07-15 | Declarar "✅ listo" sin ejecutar el test | No correr `npx playwright test` antes de entregar | FIX #8: Gate de entrega obligatorio |
| 2026-07-15 | `waitForURL(/Default\.aspx/)` timeout en T&C | URL del T&C puede ser diferente | FIX #13: `waitForLoadState('domcontentloaded')` en vez de `waitForURL` |
| 2026-07-15 | `text=Dashboard` → 4 elementos (strict mode) | No verificar unicidad del selector antes de usarlo | FIX #2: `document.querySelectorAll('SEL').length === 1` |
| 2026-07-15 | Código fantasma en spec (duplicados) | `oldString` en reemplazo no cubría todo el código viejo | FIX #3: leer el archivo completo antes de reemplazos masivos |
| 2026-07-15 | `.click()` omitido antes de `.fill()` | Ignorar el `.click()` del Codegen como "redundante" | FIX #4: preservar `.click()` + `.fill()` del Codegen siempre |
| 2026-07-15 | SysAdmin no aterriza en Dashboard | No verificar pantalla destino por rol antes de escribir assertion | FIX #5: discovery de pantalla por cada rol |
| 2026-07-15 | `tsconfig.json` con `moduleResolution: "node"` deprecated | Usar valor incorrecto en nueva versión de TS | FIX #6: siempre `"bundler"` en proyectos nuevos con TS 5.x |
| 2026-07-15 | `waitForURL` con negative lookahead no funcionó para SSO | Regex compleja no matcheaba el bounce de sso-login | FIX #1+#7: `waitForFunction(!url.includes('sso-login'))` |
| 2026-07-16 | `[aria-label="Concesionario"]` → 5 elementos (strict mode) | SVG icons dentro de opciones también tienen ese aria-label | Usar `[role="radio"][aria-label="Concesionario"]` para el tab |
| 2026-07-16 | Overlay `z-40` bloqueaba click en radio tabs y favoritos | No leer el componente `DcDropdownMenu` antes de escribir | FIX #10: leer `.tsx` del componente. Controls externos ANTES de abrir dropdown |
| 2026-07-16 | Selección siempre "Todas las Localidades" en LocationDropDown | Primera opción del select es siempre el reset (`value=""`) | FIX #11: `.filter({ hasNotText: 'reset label' })` |
| 2026-07-16 | `waitFor` sin `.catch()` fallaba el test cuando no había opciones | No aplicar patrón de flujo condicional | FIX #12: todo `waitFor` opcional lleva `.catch(() => {})` |
| 2026-07-16 | T&C timeout antes de que la página cargara | `waitForURL(/Default\.aspx/)` frágil contra cold start | FIX #13: `waitForLoadState('domcontentloaded')` antes del conteo |
</content>
