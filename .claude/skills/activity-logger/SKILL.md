---
name: activity-logger
description: |
  Bitácora automática de actividad (QA y PO). Registra en segundo plano qué hizo el agente y cuándo,
  usando la zona horaria y el sprint configurados en context/CONTEXT.md § "Configuración del Agente".
  Alimenta a zoho_timelog para que el registro diario de horas no dependa de que el usuario recuerde
  el detalle de lo que se hizo.
  Usar cuando:
  - Cualquier subagente (QA-PRO o PO-PRO) completa una actividad con valor para Zoho
  - El usuario pide "qué hice hoy", "mi bitácora", "pendientes del sprint", "ver bitácora de hoy"
  - zoho_timelog necesita el detalle de actividades del día (su PASO 0) antes de preguntar al usuario
disable-model-invocation: false
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Activity Logger — Bitácora de Actividad

> 🔇 **Append silencioso.** Anexar una entrada NO interrumpe el flujo de la tarea principal, no pide
> confirmación ni genera mensajes al usuario. Solo se informa si falla la escritura del archivo.

---

## PRINCIPIO FUNDAMENTAL

```
✅ Aplica a CUALQUIER subagente (QA-PRO o PO-PRO) y CUALQUIER actividad con valor para Zoho.
✅ Append-only: nunca reescribir ni borrar entradas previas del día.
✅ Si el archivo/carpeta del día no existe, crearlo con el encabezado estándar.
⛔ NUNCA inventar Zoho Task ID, horas ni texto de nota oficial aquí — eso lo resuelve `zoho_timelog`.
   activity-logger solo registra QUÉ se hizo y CUÁNDO, y deja clasificado qué falta para Zoho.
```

---

## ESTRUCTURA DE ARCHIVOS

```
.workspace/
  bitacora/
    tareas-realizadas/
      <Sprint-actual>/
        <YYYY-MM-DD>.md      ← una entrada por actividad, append-only
    tareas-pendientes/
      <Sprint-actual>.md     ← follow-ups / bloqueos, cruza días (no es para Zoho)
```

> `.workspace/` ya está en `.gitignore` — la bitácora es local al usuario, nunca se sube al repo del proyecto.

---

## PASO 0 — Preparación de sesión (una sola vez)

1. Leer `context/CONTEXT.md` § **"Configuración del Agente"**:
   - **Zona horaria** → para calcular fecha/hora local (NUNCA UTC ni hora del servidor).
   - **Sprint actual** → nombre de carpeta. Slug: espacios → `-` (ej. "Sprint 24" → `Sprint-24`).

2. Leer (una sola vez, cachear para el resto de la sesión) de `zoho_timelog/SKILL.md`:
   - Tabla **"Mapeo de User Stories → Zoho Task IDs"** (+ "Tareas No-US")
   - Tabla **"FORMATO OFICIAL DE NOTAS"**

3. Si § "Configuración del Agente" no existe o tiene placeholders (`[Ej: ...]`):
   > "No tengo configurada tu zona horaria/sprint actual (`context/CONTEXT.md` § Configuración del
   > Agente). ¿Me confirmas tu país (para la zona horaria) y el nombre del sprint actual? Se guarda
   > una sola vez — también puedo correr `project-onboarding` para completarlo."

   Si el usuario no responde o pide continuar sin esto: usar `UTC` y `Sprint-sin-nombre`, avisando
   **una sola vez por sesión** que la bitácora quedará sin zona horaria/sprint configurados.

---

## PASO 1 — Clasificar la actividad (al completarla)

Evaluar la actividad recién completada contra las tablas cacheadas de `zoho_timelog`:

| Pregunta | Si NO → |
|---|---|
| ¿La US/tarea está en la "Tabla de mapeo US → Zoho Task ID" (o "Tareas No-US")? | Falta: **Sin Zoho Task ID** |
| ¿La actividad coincide con una fila de "FORMATO OFICIAL DE NOTAS"? | Falta: **Sin nota oficial** |
| ¿Existe una sub-tarea ADO asociada (de la que extraer `CompletedWork`)? | Falta: **Sin horas claras** |

- **Las 3 en SÍ** → fila en sección **"✅ Listas para registrar en Zoho"**
- **Cualquier NO** → fila en sección **"⚠️ Pendientes de clasificar"**, listando la(s) falta(s)
  (si hay varias, separarlas con `<br>`)

---

## PASO 2 — Anexar la entrada

### Archivo del día — crear si no existe

Ruta: `.workspace/bitacora/tareas-realizadas/<Sprint-actual>/<YYYY-MM-DD>.md`

```markdown
# Bitácora — <YYYY-MM-DD> (<Sprint actual>)

## ✅ Listas para registrar en Zoho
| Hora | Rol | US / Tarea | Sub-tarea ADO | Actividad (nota oficial) | Detalle |
|------|-----|-----------|---------------|---------------------------|---------|

## ⚠️ Pendientes de clasificar
| Hora | Rol | Tarea realizada | Falta |
|------|-----|-----------------|-------|
```

### Anexar fila a la tabla correspondiente

**✅ Lista** (ejemplo):
```markdown
| 09:15 | QA | US 9505 | 10713 | Preparar Test Plan | TCs 9433, 9434 creados en Suite 9418 |
```

**⚠️ Pendiente de clasificar** (ejemplo):
```markdown
| 10:40 | PO | Redacción de US 9521 (nueva) | Sin Zoho Task ID asignado |
| 13:00 | QA | Soporte ad-hoc a DEV (sin sub-tarea ADO) | Sin nota oficial<br>Sin horas claras |
```

- `Hora`: hora local (zona horaria de PASO 0), formato `HH:MM`.
- `Rol`: `QA` o `PO` — el subagente que ejecutó la actividad.
- `Detalle`: 1-3 bullets cortos de lo realizado — se usarán como bullets de la nota oficial en Zoho.

---

## TAREAS PENDIENTES (follow-ups / bloqueos — no es para Zoho)

Ruta: `.workspace/bitacora/tareas-pendientes/<Sprint-actual>.md`

Cuando una tarea queda bloqueada, con dependencia (DEP), o requiere seguimiento en otra sesión,
anexar como checklist:

```markdown
- [ ] US 9510 — bloqueada por dependencia con US 9480 (DEP). Retomar cuando 9480 pase a Resolved.
- [ ] Revisar con PO el criterio 3 de US 9520 (ambigüedad detectada al redactar TC).
```

Al resolverse, marcar `- [x]` — no borrar, sirve de historial del sprint.

---

## CONSULTAS DEL USUARIO

| El usuario pide | Acción |
|---|---|
| "Qué hice hoy" / "mi bitácora" | Leer y mostrar `tareas-realizadas/<Sprint-actual>/<fecha-hoy>.md` |
| "Mis pendientes" / "pendientes del sprint" | Leer y mostrar `tareas-pendientes/<Sprint-actual>.md` |
| "Registra mis horas" / "zoho" | Despachar a `zoho_timelog` (ver integración abajo) |

---

## INTEGRACIÓN CON `zoho_timelog`

En el PASO 0 de `zoho_timelog` (PASO 0.0), antes de preguntar al usuario:

1. Leer `tareas-realizadas/<Sprint-actual>/<fecha>.md`.
2. **Sección ✅ Listas** → ya trae US, sub-tarea ADO y "Detalle" (bullets de la nota). `zoho_timelog`
   solo resuelve Zoho Task ID (su tabla de mapeo) y horas (`CompletedWork` de ADO).
3. **Sección ⚠️ Pendientes de clasificar** → preguntar SOLO lo puntual por fila, agrupado por "Falta":
   - *Sin Zoho Task ID* → "Para '[Tarea]' no tengo Zoho Task ID — ¿cuál es?"
   - *Sin nota oficial* → "Para '[Tarea]' no hay plantilla de nota oficial — ¿qué texto registro?"
   - *Sin horas claras* → "¿Cuántas horas le dedicaste a '[Tarea]'?"
4. Si "Sin nota oficial" se repite para la misma actividad en sesiones distintas, activar REGLA 1
   (Auto-Aprendizaje, AGENTS.md §6) y proponer agregar esa plantilla a "FORMATO OFICIAL DE NOTAS"
   de `zoho_timelog`.

---

## ANTI-PATRONES

| ❌ Evitar | ✅ En su lugar |
|---|---|
| Preguntar al usuario antes de anexar una entrada | Append silencioso, sin confirmación |
| Reescribir o borrar entradas previas del día | Append-only |
| Resolver aquí Zoho Task ID, horas o nota oficial | Clasificar como "⚠️ Pendiente" — `zoho_timelog` resuelve |
| Usar hora UTC o del servidor | Usar la zona horaria de `context/CONTEXT.md` |
| Loguear navegación/exploración sin valor para Zoho | Solo actividades de las tablas de `zoho_timelog`, o claramente facturables |
| Re-leer `zoho_timelog/SKILL.md` completo en cada entrada | Cachear sus 2 tablas una vez por sesión (PASO 0) |
