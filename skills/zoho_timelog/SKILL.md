---
name: zoho_timelog
description: |
  Registro estandarizado de horas QA en Zoho Projects.
  Un log por sub-tarea ADO con nota oficial aprobada por la empresa.
  Usar cuando se necesite:
  - Registrar horas diarias recibiendo US IDs, sub-tarea ADO y horas
  - Buscar el Zoho Task ID de una US por su número de ADO
  - Crear time logs con el formato oficial de notas
  - Generar reporte diario listo para presentar en el Daily del día siguiente
  - Actualizar notas de time logs existentes
  - Auditar registros de horas por fecha
  - Resolver bloqueos por límite diario de horas
  - Registrar ceremoniales (Planning, Daily, Refinamiento, Tasking, Review)
disable-model-invocation: false
user-invocable: true
---

# Zoho Time Log — Registro de Horas QA

> ⚙️ **CONFIGURACIÓN REQUERIDA — Leer antes de usar**
>
> Este skill tiene datos pre-configurados para un proyecto específico.
> Antes de usar en un proyecto nuevo, actualiza la sección **"Contexto del Proyecto"**
> con los valores de tu instancia de Zoho Projects.
>
> Para encontrar tu Portal ID y Project ID:
> - Portal ID: URL de Zoho → `https://projects.zoho.com/portal/{PORTAL_NAME}` → copiar el ID numérico
> - Project ID: Abre el proyecto → la URL contiene `projectId={ID}`
> - Owner ZPUID: Tu perfil de Zoho → `https://projects.zoho.com/portal/{PORTAL}/myprofile`

---

## PRINCIPIO FUNDAMENTAL — NUNCA ASUMIR

```
⛔ PROHIBIDO asumir cualquier dato que el usuario puede suministrar.
⛔ Si falta información: DETENER y PREGUNTAR antes de continuar.
⛔ NUNCA inventar task IDs, horas, fechas, actividades ni estados de US.

Datos que SIEMPRE deben confirmarse si no se reciben explícitamente:
  - ¿Cuál es la fecha del registro? (no asumir "hoy")
  - ¿Cuántas horas por cada US / actividad?
  - ¿Qué actividades se realizaron en cada US?
  - ¿Cuál fue el estado final de cada US? (Closed / Resolved / On Hold / Active)
  - Si la US no está en la tabla de mapeo → preguntar antes de buscar
```

---

## Contexto del Proyecto

> ⚙️ Reemplaza estos valores con los de tu proyecto de Zoho.

| Campo | Valor | Cómo obtenerlo |
|-------|-------|----------------|
| Portal ID | `{{ZOHO_PORTAL_ID}}` | URL: `https://projects.zoho.com/portal/{{nombre}}/` |
| Project ID | `{{ZOHO_PROJECT_ID}}` | URL del proyecto → parámetro `projectId` |
| Proyecto | `{{NOMBRE_PROYECTO}}` | Nombre legible del proyecto |
| Owner ZPUID | `{{ZOHO_OWNER_ID}}` | Tu perfil de Zoho → campo "User ID" |
| Límite diario API | **15 horas** | Hard limit de Zoho (no configurable) |

---

## Modelo de Registro

Un log por sub-tarea ADO. Cada actividad QA (Preparar TP, Ejecutar TP, QA Demo, etc.) genera su propio log con el ID de la sub-tarea en la nota.

| Actividad | Genera 1 log separado? |
|-----------|----------------------|
| Preparar Test Plan | ✅ Sí |
| Ejecutar Test Plan | ✅ Sí |
| QA Demo | ✅ Sí |
| QA Apoyo / Soporte | ✅ Sí |
| Ceremoniales (Daily, Planning) | ✅ Sí |

> ⚠️ **NOTA TÉCNICA (bulk endpoint):** `add_bulk_time_logs` requiere log_object URI-encoded y puede
> fallar con JSON_PARSE_ERROR. Si falla en el primer intento, usar `add_time_log` individualmente
> para cada log. NO reintentar el bulk más de 1 vez.

---

## Reglas de Oro (OBLIGATORIAS)

```
□ REGLA 1: SIEMPRE registrar como tipo "task", NUNCA como "general"
□ REGLA 2: Cada log DEBE tener el Zoho Task ID de la US correspondiente
□ REGLA 3: Horas en intervalos de 0.25h (00:15, 00:30, 00:45, 01:00...)
□ REGLA 4: Notas con el formato OFICIAL aprobado (ver sección Tabla de Notas abajo)
□ REGLA 5: No superar 15h de logs por día (límite API de Zoho)
□ REGLA 6: La fecha debe estar en formato YYYY-MM-DD
□ REGLA 7: bill_status siempre "Billable" para actividades QA del sprint
□ REGLA 8: SIEMPRE obtener las horas del campo CompletedWork de ADO ANTES de pedir horas al usuario.
           Usar mcp_ado_wit_get_work_item con fields=["Microsoft.VSTS.Scheduling.CompletedWork"].
           Solo preguntar al usuario si CompletedWork = 0 o no existe.
□ REGLA 9: Portal ID y Project ID se resuelven UNA SOLA VEZ al inicio (via get_portals + get_projects_list)
           y se reutilizan para TODOS los logs de la sesión. NUNCA volver a preguntar por el proyecto.
```

---

## Mapeo de User Stories → Zoho Task IDs

> ⚙️ Actualiza esta tabla al inicio de cada sprint con los IDs de las US asignadas.
> El número de US de ADO NO es el ID de Zoho — son sistemas distintos.

| US (ADO) | Zoho Task ID | Nombre resumido |
|----------|--------------|-----------------|
| US {{ID_1}} | `{{ZOHO_TASK_ID_1}}` | {{Nombre de la US}} |
| US {{ID_2}} | `{{ZOHO_TASK_ID_2}}` | {{Nombre de la US}} |

### Tareas No-US (Ceremoniales / Infraestructura)

| Tarea | Zoho Task ID |
|-------|--------------|
| Planning Sprint | `{{ZOHO_TASK_ID_PLANNING}}` |
| Daily | `{{ZOHO_TASK_ID_DAILY}}` |
| Refinamiento | `{{ZOHO_TASK_ID_REFINAMIENTO}}` |
| Reuniones Técnicas | `{{ZOHO_TASK_ID_REUNIONES}}` |

> 💡 Para obtener los Zoho Task IDs del sprint actual:
> Llamar `mcp_zoho-mcp_ZohoProjects_get_tasks_by_project` con `per_page: 200`
> y buscar por nombre de US en el campo "name".

---

## FORMATO OFICIAL DE NOTAS

> Usar siempre el texto oficial aprobado por la empresa.
> Adaptar el texto entre corchetes según la actividad.

### Plantillas de nota por actividad

`[#####]` = ID de la **sub-tarea en ADO** (ej: `10713 Preparar Test Plan`).

| Actividad | Plantilla de nota |
|-----------|-------------------|
| **Preparar Test Plan** | `Sesión de trabajo realizando la documentación necesaria para cumplir con el requerimiento asignado, ejecutando la(s) tarea(s): [#####] Preparar Test Plan.` |
| **Ejecutar Test Plan** | `Sesión de trabajo realizando las pruebas necesarias para cumplir con el requerimiento asignado, ejecutando la(s) tarea(s): [#####] Ejecutar Test Plan.` |
| **Ejecutar Pruebas** | `Sesión de trabajo realizando las pruebas necesarias para cumplir con el requerimiento asignado, ejecutando la(s) tarea(s): [#####] Ejecutar Pruebas.` |
| **QA Demo** | `Sesión de trabajo realizando las demostraciones necesarias para cumplir con el requerimiento asignado, ejecutando la(s) tarea(s): [#####] QA Demo.` |
| **QA Apoyo** | `Sesión de trabajo realizando el apoyo necesario para cumplir con el requerimiento asignado ejecutando la(s) tarea(s): [#####] QA Apoyo.` |

> ⚠️ Notas con bullets de actividades: usar `<br>` HTML, NUNCA `\n`.
> Ejemplo: `...tarea(s): 10713 Preparar Test Plan.<br>• Análisis de criterios<br>• Redacción de casos`

> 💡 **Extensión de esta tabla:** si la bitácora (`activity-logger`) marca repetidamente la misma
> actividad como "Sin nota oficial" (QA o PO), proponer agregar una fila nueva aquí vía REGLA 1
> (Auto-Aprendizaje, AGENTS.md §6).

---

## PROCEDIMIENTO DE REGISTRO DIARIO

### PASO 0 — Recopilar información (OBLIGATORIO antes de cualquier acción)

> ⚡ **EFICIENCIA PRIMERO:** Resolver automáticamente todo lo que se pueda desde ADO, Zoho y la
> bitácora de actividad ANTES de hacer preguntas al usuario. Solo preguntar lo que NO se puede
> obtener automáticamente.

**PASO 0.0 — Leer la bitácora del día** (skill `activity-logger`):

```
→ .workspace/bitacora/tareas-realizadas/<Sprint-actual>/<fecha>.md
  - Sección "✅ Listas para registrar en Zoho" → ya trae US, sub-tarea ADO y "Detalle"
    (usar el Detalle como bullets de la nota: <br>•...). Solo falta resolver Zoho Task ID
    (PASO 1) y horas (CompletedWork, este PASO 0).
  - Sección "⚠️ Pendientes de clasificar" → preguntar SOLO la "Falta" indicada por fila
    (Sin Zoho Task ID / Sin nota oficial / Sin horas claras) — NO preguntar genéricamente
    "¿qué hiciste hoy?".
Si el archivo no existe → continuar con el flujo normal de preguntas (sin bitácora disponible).
```

Verificar que el usuario proporcionó todos los datos. Si falta alguno, **PREGUNTAR**:

```
DATOS GENERALES:
  □ Fecha del registro (YYYY-MM-DD) — única pregunta obligatoria si no se menciona
  □ Portal ID + Project ID → resolver automáticamente via get_portals + get_projects_list
    UNA SOLA VEZ y reusar. NUNCA preguntar al usuario por portal/proyecto.

POR CADA US TRABAJADA:
  □ Número de US en ADO (ej: 9505)
  □ Horas → OBTENER AUTOMÁTICAMENTE de ADO:
      1. Buscar tareas hijas asignadas al usuario (WIQL con [System.Parent] IN (IDs) AND [System.AssignedTo])
      2. Para cada tarea: mcp_ado_wit_get_work_item fields=["Microsoft.VSTS.Scheduling.CompletedWork"]
      3. Solo preguntar horas al usuario si CompletedWork = 0 o campo vacío.
      Ejemplo SÍ preguntar: "La tarea 10813 tiene 0h registradas en ADO. ¿Cuánto tiempo le dedicaste?"
      Ejemplo NO preguntar: CompletedWork = 0.5 → usar 0.5h directamente.
  □ Estado final de la US al terminar el día:
      → Closed    (las pruebas pasaron, historia cerrada)
      → Resolved  (dev completó, QA pendiente o en progreso)
      → On Hold   (con razón: dependencia, bloqueante, ambiente, etc.)
      → Active    (en progreso, sin cambio de estado)
  □ Si On Hold: ¿cuál es la razón?

PARA EL REPORTE DAILY (si no se recibe, PREGUNTAR):
  □ ¿Cuántas US pasaron a Resolved hoy? ¿Cuáles?
  □ ¿Alguna US puesta en On Hold? ¿Cuál y por qué?
```

### PASO 1 — Resolver el Zoho Task ID

**Caso A — La US está en la tabla de mapeo:**
Usar el Zoho Task ID directamente de la tabla.

**Caso B — La US NO está en la tabla:**
```
1. Llamar: mcp_zoho-mcp_ZohoProjects_get_tasks_by_project (per_page: 200)
2. Buscar por número de US o nombre en el campo "name".
3. Copiar el campo "id" → ese es el Zoho Task ID.
4. Confirmar con el usuario antes de crear el log.
```

**Si el MCP de Zoho no está configurado:**
```
Informar: "El MCP de Zoho no está activo. Necesito el Zoho Task ID manualmente.
Puedes encontrarlo en: Zoho Projects → [Nombre del proyecto] → Tasks."
```

### PASO 2 — Validar horas disponibles del día

```
→ mcp_zoho-mcp_ZohoProjects_get_time_logs_by_project
   start_date: YYYY-MM-DD, view_type: "day", module: {"type":"task"}
→ Sumar el campo "log_hour" de todos los registros
→ Si suma >= 14:30 → DETENER y avisar al usuario
→ Calcular horas disponibles: 15h - suma actual
```

### PASO 3 — Construir la nota

Un log por sub-tarea. Usar la plantilla de la Tabla de Notas con el ID de la sub-tarea ADO:
```
"Sesión de trabajo realizando las pruebas necesarias para cumplir con el
 requerimiento asignado, ejecutando la(s) tarea(s): 10713 Preparar Test Plan."
```

### PASO 4 — Crear los time logs

```json
{
  "body": {
    "date": "YYYY-MM-DD",
    "module": {
      "type": "task",
      "id": "<Zoho Task ID>"
    },
    "hours": "HH:MM",
    "bill_status": "Billable",
    "notes": "<nota construida según modelo>"
  },
  "path_variables": {
    "portal_id": "{{ZOHO_PORTAL_ID}}",
    "project_id": "{{ZOHO_PROJECT_ID}}"
  }
}
```

### PASO 5 — Verificar logs creados

```
→ mcp_zoho-mcp_ZohoProjects_get_time_logs_by_project (start_date, view_type:"day")
→ Confirmar: type="task", task ID correcto, horas correctas, nota con texto oficial
```

### PASO 6 — Generar Reporte Daily

Una vez confirmados los logs, generar automáticamente el reporte.

---

## REPORTE DIARIO — Informe para el Daily del día siguiente

> Generar SIEMPRE al finalizar el registro.
> Si falta algún estado de US, **PREGUNTAR** antes de generar el reporte.

### Formato del reporte

```
═══════════════════════════════════════════════════════
  REPORTE QA — [FECHA]
═══════════════════════════════════════════════════════

RESUMEN
───────────────────────────────────────────────────────
  ✅ Cerradas (Closed)   : [N]  → [lista de US IDs]
  🔄 Resueltas (Resolved): [N]  → [lista de US IDs]
  ⏸  En Hold             : [N]  → [US ID — razón]
  🔧 En progreso (Active): [N]  → [lista de US IDs]

  ⏱  Total horas registradas: [X.XX]h

DETALLE POR US
───────────────────────────────────────────────────────
  [US ID] — [Título de la US]                 [[X.XXh] | Estado: [estado]]
  ─────────────────────────────────────────────────────
  • [Actividad 1 realizada]
  • [Actividad 2 realizada]

CEREMONIALES / INFRAESTRUCTURA (si aplica)
───────────────────────────────────────────────────────
  • [Nombre del ceremonial o reunión] — [Xh]

═══════════════════════════════════════════════════════
```

### Reglas del reporte

1. Generar siempre después de confirmar los logs en Zoho.
2. Si el usuario no proporcionó el estado de alguna US → **PREGUNTAR** antes de generarlo.
3. Para US en **On Hold**: incluir siempre la razón específica.
4. El reporte refleja exactamente lo que se registró en Zoho.

---

## PROCEDIMIENTO DE CORRECCIÓN (Logs Incorrectos)

### Caso A: Log creado como "general" en vez de "task"
La API **NO permite** cambiar el tipo de un log existente.
```
1. Usuario elimina manualmente el log "general" desde la UI de Zoho
2. Agente crea nuevo log de tipo "task" con los mismos datos
3. Verificar con get_time_logs_by_project
```

### Caso B: Notas con formato incorrecto
```
→ mcp_zoho-mcp_ZohoProjects_update_single_time_log
→ Campo "notes" con la nota corregida
→ Campo "module" OBLIGATORIO: {"type": "task", "id": "<mismo Zoho Task ID>"}
```

### Caso C: Log anclado a la US incorrecta
La API **NO permite** mover un log entre tareas.
```
1. Usuario elimina el log incorrecto desde la UI de Zoho
2. Agente crea nuevo log con el Zoho Task ID correcto
```

### Caso D: Bloqueo por límite de 15h
```
1. Verificar duplicados con get_time_logs_by_project
2. Usuario elimina duplicados desde la UI
3. Reintentar cuando el total < 15h
4. Si no hay duplicados: distribuir exceso al día siguiente (consultar con el usuario)
```

---

## Tabla de Horas QA Estándar (referencia)

| Actividad | Horas estimadas |
|-----------|----------------|
| Preparar Test Plan (US pequeña) | 00:30 – 01:00 |
| Preparar Test Plan (US mediana/grande) | 01:00 – 02:00 |
| Ejecutar Test Plan | 00:30 – 01:00 |
| QA Demo | 00:15 – 00:30 |
| QA Apoyo | 00:30 – 01:00 |
| Documentar bug / mejora | 00:15 |
| Ceremonial (Daily, Planning, etc.) | Tiempo real redondeado a 0.25h |

> Siempre usar las horas REALES del usuario, no las estimadas.

---

## Anti-Patrones (NUNCA hacer)

| ❌ Evitar | ✅ Hacer en su lugar |
|----------|---------------------|
| Registrar como `type: "general"` | Siempre `type: "task"` con Zoho Task ID |
| Usar número de US de ADO como ID en Zoho | Buscar el Zoho `id` real en la tabla o via API |
| Inventar actividades o estados de US | Preguntar al usuario |
| Asumir la fecha como "hoy" | Confirmar la fecha |
| Crear log sin verificar límite diario | Verificar total de horas antes de crear |
| Generar reporte sin confirmar estados | Preguntar estado de cada US |
| Intentar cambiar `general` a `task` via API | Eliminar + recrear |
| Usar horas en intervalos irregulares | Siempre múltiplos de 0.25h |

---

## Limitaciones API Zoho MCP

```
LIMITACIÓN 1 — Sin conversión de tipo: general → task requiere eliminar + recrear.
LIMITACIÓN 2 — Límite 15h/día: verificar total antes de crear logs.
LIMITACIÓN 3 — Sin mover log entre tareas: eliminar + recrear con task ID correcto.
LIMITACIÓN 4 — Saltos de línea: usar <br> en bullets, NUNCA \n.
LIMITACIÓN 5 — Sin eliminación via API: el usuario elimina manualmente desde la UI.
```

---

## Checklist de Cierre Diario

```
□ REGISTRO EN ZOHO:
  ├── Logs creados con type: "task", Zoho Task ID correcto, horas correctas
  ├── Notas con texto aprobado + bullets de actividades con <br>
  ├── Total horas del día verificado con get_time_logs_by_project
  └── Ningún log creado como "general"

□ REPORTE DAILY GENERADO:
  ├── Resumen con conteo de Closed / Resolved / On Hold / Active
  ├── On Hold con razón incluida
  ├── Detalle por US con actividades realizadas
  ├── Horas totales del día
  └── Ceremoniales incluidos si aplica
```
