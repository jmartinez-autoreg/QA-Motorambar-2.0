---
name: qa-execution-reporter
description: 'Ejecuta Test Plans de Azure DevOps, captura 1 screenshot OBLIGATORIO por cada STEP con Expected Result (PRECONDs NO necesitan screenshots), publica resultados en la US con formato simple. UN comentario por ejecución con TODAS las evidencias apiladas.'
argument-hint: 'Test Plan ID, Suite ID, TC IDs, URL de la app'
---

# QA Execution Reporter — Ejecución y Documentación de Test Plans

> **Propósito:** Ejecutar Test Cases de Azure DevOps, **capturar evidencia completa (1 screenshot por STEP con Expected Result, PRECONDs NO necesitan evidencia)**, y publicar UN comentario simple en la US.

---

## FORMATO DE SALIDA (lo que el usuario verá en ADO)

### Con Test Plan (caso más común):

```
US 10801 - Discussion - UN comentario:

┌─────────────────────────────────────────────┐
│ QA PASSED / Sprint Test                     │
│                                             │
│ [Link del resultado aquí]                  │
│                                             │
│ [Imagen 1 - full width]                    │
│                                             │
│ [Imagen 2 - full width]                    │
│                                             │
│ [Imagen 3 - full width]                    │
└─────────────────────────────────────────────┘
```

**Reglas:**
- ❌ SIN PRECONDs (están en el TC del Test Plan)
- ❌ SIN tabla de pasos
- ❌ SIN labels en imágenes ("STEP 1", "CA-02", etc.)
- ✅ **Línea de link — REGLA ÚNICA (aplica en todo el skill):**
  1. Si existe un **Test Run real** en ADO → usar su URL.
  2. Si el TC se ejecutará **manualmente** desde el Test Plan → placeholder `[Link del resultado aquí]` (el usuario lo actualiza tras la corrida — ver PASO 3.7).
  3. Si el test corrió por **Playwright CLI sin run en ADO** → `[Test Regresión]`.
- ✅ **1 screenshot por CADA STEP con Expected Result** (PRECONDs NO necesitan screenshots)
- ✅ SOLO: Resultado + Línea de link + Imágenes apiladas

> ⚠️ **Divergencia intencional vs PROC-QA-Generales de calidad v1.07 §16:** el documento oficial
> describe **hilos separados por escenario** (con `[Escenario]` en la línea siguiente al resultado)
> cuando hay 2+ casos/escenarios. La práctica vigente del equipo (confirmada 2026-07-09) es
> **UN comentario consolidado por ejecución** — NO "corregir" automáticamente hacia el formato
> por hilo (misma lógica que la divergencia de horas de la Tabla 10 — REGLA 1, AGENTS.md §6).

### Sin Test Plan (pruebas exploratorias, ≤2 SP):

```
┌─────────────────────────────────────────────┐
│ PRECOND 0: Datos en sistema [...]          │
│ PRECOND 1: Login - Usuario: X - Rol: Y ... │
│                                             │
│ QA PASSED / Sprint Test                     │
│                                             │
│ [Imagen 1]                                  │
│                                             │
│ [Imagen 2]                                  │
└─────────────────────────────────────────────┘
```

**Reglas:**
- ✅ SÍ PRECONDs (no hay TC formal)
- ❌ SIN URL de Test Run (no existe)
- ❌ SIN labels en imágenes
- ⚠️ Resultado con fallo sin TP → `QA FAILED` (PROC §16.2; nota: cuando hay escenarios nombrados `[Escenario]`, el oficial usa `QA NOT PASSED` incluso sin TP)

---

## ESTADOS DE EJECUCIÓN DE TCs (Tabla 9, PROC-QA-Generales de calidad v1.07 §14)

Ciclo de vida oficial de un Test Case durante su ejecución en ADO Test Plans:

| Estado | Descripción | Cuándo se usa |
|---|---|---|
| Active | Ejecución no comenzada | Al crear el caso de pruebas |
| In Progress | Ejecución en progreso | Al comenzar la ejecución |
| Blocked | No puede continuarse | Imprevisto/impedimento; vuelve a `In Progress` al resolverse |
| Paused | Se retoma luego | QA debe atender algo de mayor prioridad; vuelve a `In Progress` al regresar |
| Not Applicable | No vigente | TC ya completado (Ready) pero la corrida se descarta por cambios de requerimientos o no aplica al sprint |
| Failed | No cumple un resultado esperado | QA registra desviación y notifica a DEV; se re-ejecuta tras la corrección |
| Passed | Cumple todos los resultados esperados | QA registra éxito |

> Este skill genera el comentario simplificado (`QA PASSED` / `QA NOT PASSED`) que corresponde a
> los estados terminales **Passed** / **Failed**. Los estados intermedios (`Active`, `In
> Progress`, `Blocked`, `Paused`, `Not Applicable`) se reflejan en la corrida manual del Test Plan
> que el usuario ejecuta en el paso "ACCIÓN REQUERIDA" (PASO 3.7).

### Sub-procedimiento al marcar un TC como `Failed` (PROC-QA-Generales de calidad v1.07 §15.1.1)

1. En el paso (STEP) que falla, agregar un comentario con el título del defecto a registrar.
2. Marcar el **paso** como `Failed (x)`.
3. Adjuntar evidencia (imagen requerida; documento o video opcional).
4. `Save` y `Create bug` — usar los formatos de `.claude/skills/qa_tester/SKILL.md` § Registrar Bug / Defecto
   (Tipo de desviación + Formato 1/2 + mensaje a DEV).
5. Marcar el **caso de pruebas** como `Failed`.

> **Desviaciones en corridas de regresión automatizada** (Escenario A sobre funcionalidades SIN
> US en el sprint actual — ej. certificación de ambientes): el proceso oficial es crear una
> historia llamada **"Pruebas automatizadas"** en el sprint, registrar el bug dentro de esa
> historia, y dejar que el PO evalúe/agrupe/priorice (PROC-QA-Pruebas automatizadas v1.00 §2,
> actividad 9). No vincular esos bugs a USs cerradas de sprints anteriores sin pasar por el PO.

> El ciclo de estados de **historias** (US) es independiente — Tabla 3: `New` / `Active` /
> `Resolved` / `Closed` / `On Hold` (ver `.claude/agents/QA-PRO.agent.md` § Documentación de US
> Post-Ejecución). `Closed` ocurre cuando el Test Plan/prueba se ejecutó y dio `Passed`.

---

## INPUT DEL USUARIO

```
Ejecuta el Test Plan 10939, Suite 10940, TC 10941
URL: https://motorambar.autoregpr.com
```

O para múltiples TCs:

```
Ejecuta el Test Plan 10939, Suite 10940, TCs: 10941, 10942, 10943
URL: https://motorambar.autoregpr.com
```

---

## PHASE 1 — LEER TCs DE ADO

**Objetivo:** Obtener los pasos, resultados esperados y WI vinculada (US).

### PASO 1.1: Leer cada TC

Por cada TC ID:

```
mcp_ado_wit_get_work_item(id: {TC_ID})
```

### PASO 1.2: Extraer información

Del resultado, extraer:

```javascript
{
  "tcId": 10941,
  "title": "Portal / Vehículos / Editar - Asignar Cliente [Popup estructura completa]",
  "linkedUS": 10801,  // campo "Parent" o "System.Parent"
  "steps": [
    { "action": "...", "expected": "..." },
    { "action": "...", "expected": "..." }
  ]
}
```

### PASO 1.3: Guardar en memoria

```javascript
const testCases = [
  { tcId: 10941, linkedUS: 10801, steps: [...] },
  { tcId: 10942, linkedUS: 10801, steps: [...] }
];
```

**✅ OUTPUT:** Array de TCs con sus pasos y US vinculada.

---

## ⚠️ REGLA OBLIGATORIA: SCREENSHOTS POR CRITERIO

**Cada PASO (STEP) del TC con "Expected Result" = 1 screenshot OBLIGATORIO.**

### 🔑 IMPORTANTE: PRECONDs vs STEPs

**PRECOND (Precondiciones) = Setup ANTES del TC:**
- PRECOND 0: Datos en sistema
- PRECOND 1: Login completado
- PRECOND 2: Usuario tiene permisos X
- ❌ **NO necesitan Expected Result**
- ❌ **NO necesitan screenshots** (son requisitos previos, no validaciones)

**STEP (Pasos del TC) = Acciones CON validaciones:**
- STEP 1: Hacer clic en botón "Editar" → Expected: Pantalla de edición visible
- STEP 2: Seleccionar dropdown → Expected: Lista desplegada con opción "Todos"
- ✅ **Cada Expected Result = 1 screenshot OBLIGATORIO**

### 📊 Ejemplo práctico completo:

**TC 10941: Portal / Vehículos / Editar - Asignar Cliente**

| Tipo | Descripción | Expected Result | Screenshot |
|------|-------------|-----------------|------------|
| PRECOND 0 | Datos de vehículos en sistema | - | ❌ NO (setup) |
| PRECOND 1 | Login - Usuario: admin - Rol: Administrador | - | ❌ NO (setup) |
| **STEP 1** | Abrir pantalla de edición de vehículo | Pantalla "Editar Vehículo" visible | ✅ step1.png |
| **STEP 2** | Hacer clic en botón "Asignar Cliente" | Popup "Asignar Cliente" abierto | ✅ step2.png |
| **STEP 3** | Seleccionar dropdown "Cliente" | Lista desplegada con opción "Todos" | ✅ step3.png |
| **STEP 4** | Hacer clic en "Guardar" | Mensaje "Cliente asignado exitosamente" | ✅ step4.png |
| **STEP 5** | Verificar tabla de clientes | Cliente aparece en fila 1 | ✅ step5.png |

**Resultado:** 2 PRECONDs (sin screenshots) + 5 STEPs con Expected Result → **5 screenshots** ✓

### ✅ Capturar screenshot cuando:
- Es un **STEP** (no PRECOND) del TC
- El paso tiene un Expected Result definido
- El criterio es verificable en pantalla (mensaje, popup, tabla, campo, botón, etc.)

### ❌ NO capturar cuando:
- Es una **PRECOND** (setup previo al TC)
- El paso no tiene Expected Result
- El resultado esperado es interno del sistema (ej: "Registro guardado en BD")

### 📋 Regla general:
**Si el TC tiene N STEPs con Expected Result, debe haber N screenshots como mínimo.**
**Las PRECONDs NO cuentan para el conteo de screenshots.**

**Ejemplo:**
```
STEP 1: Login
→ Expected: Dashboard visible
→ Screenshot: ✅ OBLIGATORIO

STEP 2: Abrir popup
→ Expected: Popup con título "Asignar Cliente"
→ Screenshot: ✅ OBLIGATORIO

STEP 3: Seleccionar dropdown
→ Expected: Lista con opción "Todos"
→ Screenshot: ✅ OBLIGATORIO
```

---

## PHASE 2 — EJECUTAR PRUEBAS (MCP BROWSER)

**Objetivo:** Navegar la app, ejecutar pasos, **capturar 1 screenshot por cada criterio de aceptación**.

### PASO 2.1: Abrir navegador y login

```
mcp_playwright_browser_navigate_to(url: {APP_URL})
mcp_playwright_browser_fill(selector: "#username", value: "admin")
mcp_playwright_browser_fill(selector: "#password", value: "***")
mcp_playwright_browser_click(selector: "#btnLogin")
mcp_playwright_browser_wait_for_navigation()
```

### PASO 2.2: Por cada TC, ejecutar sus pasos Y CAPTURAR EVIDENCIA

**⚠️ OBLIGATORIO: Capturar screenshot después de CADA STEP con Expected Result.**
**⚠️ PRECONDs NO necesitan screenshots** (son setup previo, no validaciones).

```javascript
for (const tc of testCases) {
  const screenshots = [];
  let stepIndex = 1;
  
  for (const step of tc.steps) {
    // ❌ SALTAR PRECONDs — no necesitan evidencia
    if (step.type === "PRECOND" || step.action.startsWith("PRECOND")) {
      continue;  // PRECONDs son setup, no validaciones
    }
    
    // 1. Ejecutar la acción del STEP
    // (navegar, llenar campos, hacer clic, etc.)
    
    // 2. Esperar a que la pantalla se estabilice
    mcp_playwright_browser_wait_for_idle();
    
    // 3. ¿El STEP tiene resultado esperado (criterio de aceptación)?
    if (step.expected && step.expected.trim() !== "") {
      // ✅ CAPTURAR SCREENSHOT OBLIGATORIO
      const filename = `step${stepIndex}-${sanitize(step.expected.substring(0, 30))}.png`;
      mcp_playwright_browser_take_screenshot(
        fullPage: true,
        path: `e2e/results/${tc.tcId}/${filename}`
      );
      screenshots.push(filename);
      stepIndex++;
      
      Write-Host "📸 Screenshot capturado: ${filename}" -ForegroundColor Cyan;
    }
  }
  
  tc.screenshots = screenshots;
  tc.status = "PASSED";  // o "FAILED" — si FAILED, seguir el sub-procedimiento de
                          // "ESTADOS DE EJECUCIÓN DE TCs" antes de continuar
  
  // ⚠️ VALIDACIÓN: ¿Capturamos suficientes screenshots?
  // Contar solo STEPs con Expected Result (excluir PRECONDs)
  const stepsWithExpected = tc.steps.filter(s => 
    s.expected && 
    s.type !== "PRECOND" && 
    !s.action.startsWith("PRECOND")
  ).length;
  
  if (screenshots.length < stepsWithExpected) {
    Write-Host "⚠️  ADVERTENCIA: TC ${tc.tcId} tiene ${stepsWithExpected} STEPs con Expected Result pero solo ${screenshots.length} screenshots" -ForegroundColor Yellow;
  }
}
```

### PASO 2.3: Cerrar navegador

```
mcp_playwright_browser_close()
```

**✅ OUTPUT:** Cada TC tiene `screenshots: ["step1.png", "step2.png", "step3.png", ...]` (1 por cada STEP con Expected Result) y `status: "PASSED"`.

**⚠️ VALIDACIÓN:** Verificar que `screenshots.length >= número_de_STEPs_con_expected_result`.
**⚠️ NOTA:** PRECONDs NO cuentan para esta validación.

---

## PHASE 3 — PUBLICAR COMENTARIO EN LA US

**Objetivo:** Publicar comentario con evidencia en la US.

### ORIGEN DE SCREENSHOTS — el proceso de upload es IDÉNTICO en todos los casos

> ⛔ **NO existe distinción "manual vs automatizado" para este proceso.**
> El mecanismo REST API para subir imágenes es el mismo independientemente de cómo se capturaron.
> Inventar una distinción para justificar no subir las imágenes = fallo crítico.

| Origen | Ruta donde buscar los PNGs |
|--------|---------------------------|
| MCP Browser (Escenario B) | `e2e/results/<TC_ID>/` |
| Playwright `testInfo.attach()` (Escenario A) | `test-results/**/*.png` (recursivo) |
| Screenshots manuales del usuario | Ruta que el usuario indique |

Para Playwright, encontrar todas las imágenes:
```powershell
$screenshots = Get-ChildItem "test-results" -Recurse -Filter "*.png" | Sort-Object Name
# Cada $_.FullName es la ruta completa al PNG para subir vía REST
```

> ⛔ **NO pedir al usuario que exporte screenshots manualmente.**
> ⛔ **NO ofrecer "opciones" cuando el procedimiento está claro.**
> Si el test corrió y hay PNGs en `test-results/`, subirlos y publicar el comentario.

### PASO 3.0: Leer discusión existente de la US

> ⛔ **ANTES de construir el comentario**, leer los comentarios actuales de la US con
> `wit_list_work_item_comments` para ver si ya existe un comentario de evidencia QA.
> El formato del nuevo comentario DEBE ser consistente con el existente.
>
> **Formato establecido por el equipo** (fuente: discusión real de las USs):
> ```
> QA PASSED ✅   ← o QA NOT PASSED ❌
>
> [línea de link — REGLA ÚNICA de "FORMATO DE SALIDA"]
>
> ![nombre.png](URL_attachment)
> ![nombre.png](URL_attachment)
> ```
>
> ⛔ **PROHIBIDO** publicar en la US:
> - Listas de pasos ejecutados o resultados por step
> - Información de framework (Playwright v1.x, Chromium, etc.)
> - Permisos del usuario autenticado
> - Rutas locales de archivos (`Automated_Testing/screenshots-ado/`)
> - Scripts para ejecutar (`.\upload-to-ado.ps1`)
> - Cualquier información técnica que no sea: status + link + imágenes
>
> ⛔ **El comentario va en la US, NUNCA en el TC.**
> Los TCs son los receptores de attachments; la US es donde se publica la evidencia visible.

### PASO 3.1: Extraer PAT de ADO

> ⛔ **NUNCA pedir el PAT al usuario.**
> Si el agente ya ejecutó exitosamente cualquier tool del MCP de ADO en esta sesión,
> el PAT existe en su entorno — solo hay que buscarlo en la ubicación correcta según la plataforma.
> Pedir el PAT al usuario cuando el MCP ya funciona = error de agente, no limitación técnica.

```powershell
$pat = $null

# Todas las ubicaciones conocidas de config MCP por plataforma
$searchPaths = @(
  ".mcp.json",                                      # Claude Code (MCP de proyecto — ubicación más común)
  ".claude\settings.json",                          # Claude Code (proyecto)
  "$env:USERPROFILE\.claude\settings.json",         # Claude Code (usuario global)
  ".vscode\mcp.json",                               # VS Code / Copilot (workspace)
  "$env:APPDATA\Code\User\mcp.json",                # VS Code / Copilot (usuario global)
  ".github\mcp.json"                                # GitHub Copilot (workspace)
)

foreach ($f in $searchPaths) {
  if (Test-Path $f) {
    $c = Get-Content $f -Raw | ConvertFrom-Json -EA SilentlyContinue
    # Cada plataforma usa una clave raíz distinta para los servers
    $srv = if ($c.mcpServers) { $c.mcpServers } `   # Claude Code
           elseif ($c.servers) { $c.servers } `      # VS Code / Copilot
           elseif ($c.mcp.servers) { $c.mcp.servers } `
           else { $null }
    if ($srv) {
      foreach ($k in ($srv | Get-Member -MemberType NoteProperty).Name) {
        $v = $srv.$k.env.AZURE_DEVOPS_EXT_PAT
        if ($v -and $v -notlike '${env:*}') { $pat = $v; break }
      }
    }
    if ($pat) { break }
  }
}
# Fallback: variable de entorno inyectada por el launcher del MCP
if (-not $pat) { $pat = $env:AZURE_DEVOPS_EXT_PAT }

if (-not $pat) {
  # PAT no encontrado → PREGUNTAR AL USUARIO (no publicar nada todavía)
  # ⛔ PROHIBIDO publicar comentarios con rutas locales, nombres de archivos o scripts
  # ⛔ PROHIBIDO continuar silenciosamente con un comentario "alternativo"
  #
  # Mostrar al usuario exactamente esto:
  # "No encontré el PAT de ADO en ninguna ubicación de configuración.
  #  Sin él no puedo subir las imágenes como attachments.
  #  ¿Qué prefieres?
  #  A) Publicar el comentario ahora sin imágenes: solo 'QA PASSED ✅' + '[Test Regresión]'
  #  B) Configurar el PAT primero para incluir las imágenes inline"
  #
  # Si elige A → publicar SOLO: "QA PASSED ✅\n\n[Test Regresión]"
  #              Sin nombres de archivos, sin rutas, sin scripts, sin "nota para QA"
  # Si elige B → indicar dónde agregar el PAT en el archivo de configuración del MCP
  throw "PAT_NOT_FOUND"
}

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$pat"))
```

**✅ OUTPUT:** `$auth` contiene el token de autenticación.

### PASO 3.2: Localizar y subir screenshots como attachments (POR TC)

**Objetivo:** Por cada PNG, subirlo a ADO y obtener su URL, **mapeando las URLs al TC dueño**.

```powershell
$attachmentUrls = @{}

foreach ($tc in $testCases) {
  # Localizar los PNGs de ESTE TC según el origen
  $files = @()

  # Escenario B (MCP Browser): e2e/results/<TC_ID>/
  $dir = "e2e/results/$($tc.tcId)"
  if (Test-Path $dir) { $files = Get-ChildItem $dir -Filter "*.png" | Sort-Object Name }

  # Escenario A (Playwright testInfo.attach): test-results/ — filtrar por carpeta que contiene el TC ID
  if (-not $files -and (Test-Path "test-results")) {
    $files = Get-ChildItem "test-results" -Recurse -Filter "*.png" |
             Where-Object { $_.FullName -match [regex]::Escape("$($tc.tcId)") } | Sort-Object Name
    if (-not $files -and $testCases.Count -eq 1) {
      # Un solo TC en la sesión → todos los PNGs de test-results son suyos
      $files = Get-ChildItem "test-results" -Recurse -Filter "*.png" | Sort-Object Name
    }
  }

  if (-not $files) {
    Write-Host "⚠️ TC $($tc.tcId): sin screenshots en e2e/results/ ni test-results/ — verificar antes de continuar" -ForegroundColor Yellow
    continue
  }

  # Subir cada PNG vía REST API
  $tcUrls = @()
  foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    $uploadUri = "https://dev.azure.com/$ORG/$PROJECT/_apis/wit/attachments?fileName=$($file.Name)&api-version=7.0"

    $resp = Invoke-RestMethod -Uri $uploadUri -Method Post `
      -Headers @{ Authorization = "Basic $auth"; "Content-Type" = "application/octet-stream" } `
      -Body $bytes

    $tcUrls += $resp.url
    Write-Host "✅ Screenshot subido: $($file.Name) → $($resp.url)"
  }

  # ⚠️ Mapear las URLs a SU TC — NUNCA asignar todo al primer TC de la lista
  $attachmentUrls[$tc.tcId] = $tcUrls
}
```

**✅ OUTPUT:** `$attachmentUrls` = `@{ 10941 = @("https://..."); 10942 = @("https://...") }` — una entrada **por cada TC**.

### PASO 3.3: Resolver US vinculada al TC (OBLIGATORIO si vienes del flujo playwright-e2e)

> ⛔ **El comentario va en la US, NUNCA en el TC.**
> Si llegaste aquí desde `playwright-e2e` solo tienes el TC ID — necesitas la US antes de publicar.

```
mcp_ado_wit_get_work_item(id: <TC_ID>)
→ Extraer campo "System.Parent" o "Parent" → ese es el ID de la US vinculada
```

⛔ Si no encuentras la US vinculada → preguntar al usuario el ID de la US. **No publicar en el TC.**

### PASO 3.4: Confirmar el comentario con el usuario (OBLIGATORIO — AGENTS.md §8.11)

> ⛔ **PROHIBIDO publicar sin esta confirmación.**
> Antes de publicar, mostrar al usuario:
> 1. El **texto exacto** del comentario (status + línea de link + lista de imágenes que incluirá)
> 2. La US destino y la causa/razón del comentario
>
> y esperar ✅. Si el usuario pide cambios → ajustar y volver a mostrar.
> El texto publicado en PASO 3.5 debe ser **idéntico** al confirmado aquí.

### PASO 3.5: Construir comentario y publicar en la US

> ⛔ **SIEMPRE usar `add_work_item_comment` — NUNCA `update_work_item_comment`.**
> La API de UPDATE acepta el comando aunque el comentario no exista y falla silenciosamente
> sin ningún error visible. El resultado: el agente dice "listo" pero en ADO no aparece nada.
> Para publicar evidencia QA, siempre se crea un comentario nuevo.

```powershell
foreach ($tc in $testCases) {
  $status = if ($tc.status -eq "PASSED") { "QA PASSED ✅" } else { "QA NOT PASSED ❌" }

  # Línea de link — REGLA ÚNICA (ver "FORMATO DE SALIDA"):
  #   run real → URL | corrida manual pendiente → "[Link del resultado aquí]" | CLI sin run → "[Test Regresión]"
  $runLink = if ($tc.runUrl) { $tc.runUrl }
             elseif ($tc.manualRunPending) { "[Link del resultado aquí]" }
             else { "[Test Regresión]" }

  # Formato Markdown (format:0 — el mismo que usa el equipo)
  $md = "$status`n`n$runLink`n`n"
  foreach ($url in $attachmentUrls[$tc.tcId]) {
    $fname = [System.IO.Path]::GetFileName($url.Split('?')[0])
    $md += "![$fname]($url)`n"
  }

  # Publicar en la US vinculada (NUNCA en el TC)
  mcp_ado_wit_add_work_item_comment(
    workItemId: $tc.linkedUS,
    text: $md
  )

  Write-Host "✅ Comentario publicado en US $($tc.linkedUS)"
}
```

**✅ OUTPUT:** Comentario en la US con formato `QA PASSED/NOT PASSED + link + imágenes inline`.

### PASO 3.6: Verificar que el comentario existe (OBLIGATORIO)

> ⛔ **PROHIBIDO decir "listo" basándose solo en el "éxito" de la llamada MCP.**
> La API puede devolver éxito y no haber escrito nada (fallo silencioso).

Inmediatamente después de `add_work_item_comment`, leer los comentarios de la US:
```
mcp_ado_wit_list_work_item_comments(workItemId: <US_ID>)
```
Confirmar que el comentario recién creado aparece en la lista (verificar por ID o por contenido).

- Si aparece → continuar a PASO 3.7.
- Si NO aparece → **no decir "listo"**. Intentar `add_work_item_comment` una vez más y verificar de nuevo.

### PASO 3.7: Informar al usuario

```powershell
Write-Host "`n⚠️  ACCIÓN REQUERIDA:" -ForegroundColor Yellow
Write-Host "1. Abre el Test Plan: https://dev.azure.com/$ORG/$PROJECT/_testPlans/execute?planId=$PLAN_ID&suiteId=$SUITE_ID"
Write-Host "2. Ejecuta manualmente el TC desde la UI del Test Plan"
Write-Host "3. Cuando termines, copia el link del Test Run"
Write-Host "4. Actualiza el comentario en la US reemplazando '[Link del resultado aquí]' con el link real"
Write-Host "`n✅ Comentarios publicados en:" -ForegroundColor Green
foreach ($tc in $testCases) {
  Write-Host "   US $($tc.linkedUS): https://dev.azure.com/$ORG/$PROJECT/_workitems/edit/$($tc.linkedUS)"
}
```

**✅ OUTPUT:** Usuario sabe que debe ejecutar manualmente el TC y actualizar el comentario.

---

## RESUMEN DEL FLUJO

```
USER: "Ejecuta Test Plan 10939, Suite 10940, TC 10941"

↓ PHASE 1: mcp_ado_wit_get_work_item → Extraer steps, US vinculada
↓ PHASE 2: MCP Browser → Ejecutar + capturar screenshots
↓ PHASE 3: REST API → Subir PNGs (por TC) + Confirmar texto con el usuario (✅) + Publicar

✅ DONE — Usuario debe ejecutar TC manualmente desde Test Plan (si aplica placeholder)
```

---

## VALIDACIÓN FINAL

Después de ejecutar todo, confirmar al usuario:

```
✅ TC 10941: 2 PRECONDs + 3 STEPs con Expected Result → 3 screenshots capturados ✓
✅ 3 screenshots subidos a ADO
✅ Comentario publicado en US 10801 con placeholder "[Link del resultado aquí]"

⚠️  ACCIÓN REQUERIDA:
1. Ejecuta manualmente el TC desde el Test Plan:
   https://dev.azure.com/{ORG}/{PROJECT}/_testPlans/execute?planId=10939&suiteId=10940
2. Copia el link del Test Run generado
3. Actualiza el comentario en la US 10801 reemplazando el placeholder
```

---

## TROUBLESHOOTING

| Error | Solución |
|-------|----------|
| PAT no encontrado | Verificar `mcp.json` tiene `AZURE_DEVOPS_EXT_PAT` |
| Screenshot no capturado | Verificar que el criterio es visible en pantalla antes de capturar |
| Faltan screenshots | **REGLA:** 1 screenshot por cada STEP con Expected Result. PRECONDs NO cuentan. Si TC tiene 2 PRECONDs + 5 STEPs → 5 screenshots |
| Screenshots.length < expected | Advertir al usuario: "⚠️ Cobertura incompleta: TC {ID} tiene {N} STEPs con Expected Result pero solo {M} screenshots" |
| Usuario confunde PRECONDs con STEPs | Recordar: **PRECONDs = setup previo (NO screenshots), STEPs = acciones con validación (SÍ screenshots)** |
| Comentario sin imágenes | Verificar que las URLs de attachments son correctas (GUID válido) |
| Usuario olvida actualizar placeholder | Recordar en el mensaje final que debe ejecutar manualmente el TC |
| Screenshots de Playwright no encontrados | Buscar en `test-results/**/*.png` — son los attachments de `testInfo.attach()` |

---

## ANTI-PATRONES (nunca hacer)

| ❌ Evitar | ✅ En su lugar |
|---|---|
| Inventar distinción "manual vs automatizado" para no subir imágenes | El proceso REST API es idéntico — encontrar los PNGs y subirlos |
| "Los screenshots están en playwright-report/, no puedo acceder" | Los PNGs están en `test-results/` — playwright-report/ es solo la vista HTML |
| Dar 3 opciones al usuario cuando el procedimiento es claro | Ejecutar el procedimiento: buscar PNGs → subir → publicar |
| Publicar comentario con rutas locales, scripts o info técnica | Solo: `QA PASSED ✅` + link (o `[Test Regresión]`) + imágenes inline |
| Preguntar al usuario el PAT si el MCP de ADO ya funcionó en la sesión | Extraer el PAT de los archivos de config según la plataforma |
| Publicar sin confirmar con `✅` que el upload fue exitoso | Verificar `$resp.url` para cada imagen antes de construir el comentario |
| Publicar en el TC porque es el ID que se tiene del flujo de automatización | Resolver la US vinculada vía `System.Parent` del TC antes de publicar (PASO 3.3) |
| Usar `update_work_item_comment` para publicar evidencia | Siempre `add_work_item_comment` — UPDATE falla silenciosamente si el ID no existe |
| Decir "listo" basándose en el "éxito" de la API sin verificar en ADO | Leer los comentarios de la US después de publicar y confirmar que aparece (PASO 3.6) |
| Publicar sin mostrar el texto exacto y esperar ✅ del usuario | Confirmar primero (PASO 3.4 — AGENTS.md §8.11) |
| Crear un comentario por ejecución por cada escenario/TC de la misma corrida | Consolidar todas las evidencias de la ejecución en UN comentario |
| Agregar labels a las imágenes ("STEP 1", "CA-02") o tabla de pasos | Solo status + línea de link + imágenes apiladas |
| Incluir PRECONDs cuando hay Test Plan | PRECONDs solo en el formato exploratorio (sin TP) |
| Generar archivos JavaScript para el upload | Ejecutar directamente con PowerShell |
| Elegir la línea de link "a criterio" en cada caso | Aplicar la REGLA ÚNICA de "FORMATO DE SALIDA" (run real / placeholder / `[Test Regresión]`) |
| Intentar actualizar resultados del Test Run programáticamente | No funciona — la corrida manual la hace el usuario (PASO 3.7) |
| Capturar screenshots de PRECONDs | Son setup previo, no validaciones |
| Saltarse screenshots de STEPs con Expected Result o capturar "selectivamente" | Cobertura completa: cada STEP con criterio requiere su screenshot |
