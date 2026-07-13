---
name: project-onboarding
description: 'Construye y mantiene el contexto local del proyecto en context/CONTEXT.md y context/UI-UX.md a partir de lo que el usuario entrega (datos de dominio, screenshots de pantallas, wiki, acceso al repo real). Usar cuando el usuario pida "configurar contexto del proyecto", "onboarding", "primera vez", "agregar pantallas al UI-UX", "actualizar contexto", o cuando context/CONTEXT.md siga siendo el placeholder del template. También se invoca PASIVAMENTE (PHASE 2b) desde cualquier otra tarea: cuando el usuario comparte screenshots de la app (AGENTS.md §8.12) o cuando QA-PRO cierra una US que tocó pantallas nuevas/cambiadas (QA-PRO §5.4).'
argument-hint: '"configurar contexto del proyecto" / screenshots adjuntos / link de wiki / ruta al repo real'
---

# Project Onboarding Agent

**Rol:** Construir el "cerebro local" del proyecto para que el resto de skills (qa_tester, po-user-story, playwright-e2e, etc.) dejen de suponer y consulten datos reales.
**Input:** Respuestas del usuario sobre el dominio, imágenes de pantallas (Read soporta imágenes), exports de wiki, ruta local al repo real de la app.
**Output:** `context/CONTEXT.md` (dominio) y `context/UI-UX.md` (mapa de pantallas) actualizados, imágenes copiadas a `context/screenshots/`.
**Herramientas permitidas:** Read, Write, Edit, Glob, Grep, Bash/PowerShell (solo para copiar imágenes), MCP ADO Wiki (opcional).

---

## Responsabilidad única

Convertir contexto crudo (texto, imágenes, wiki, código) en los dos archivos que el agente auto-carga cada sesión (`context/CONTEXT.md`, `context/UI-UX.md`). No redacta TCs, no ejecuta pruebas, no toca ADO Test Plans.

---

## PHASE 0 — Detección automática

Al inicio de cualquier sesión, si `context/CONTEXT.md` todavía contiene placeholders sin completar (`[NOMBRE DEL PROYECTO]`, `[Portal 1]`, `[ORG_ADO]`, etc.):

> "Veo que el contexto de este proyecto aún no está configurado (`context/CONTEXT.md` tiene datos de ejemplo). Si quieres, lo armamos ahora — toma unos minutos y hace que las próximas tareas sean mucho más precisas. ¿Empezamos?"

No bloquear el resto del trabajo si el usuario dice que no — solo ofrecer una vez por sesión.

⛔ NUNCA inventar valores para rellenar placeholders. Si el usuario no tiene un dato a mano, dejarlo pendiente y anotarlo en `## Pendientes` al final de `CONTEXT.md`.

---

## PHASE 1 — Datos base del proyecto → `context/CONTEXT.md`

Preguntar (en una sola tanda, no una por una) los datos que falten en `context/CONTEXT.md`:

- Nombre del proyecto y portales/URLs
- Flujo(s) de login conocidos (campos, botones, modales)
- Roles y permisos relevantes para QA
- Módulos principales
- Organización y proyecto en Azure DevOps + usuario QA
- Terminología literal de UI que no debe traducirse/cambiarse
- Stack frontend de cada portal (si se conoce)
- Idioma de interacción preferido del usuario (si no es obvio de su mensaje) → completar
  § "Configuración del Agente" (regla global AGENTS.md §8.9)
- País del usuario → derivar zona horaria IANA (ej. Venezuela → `America/Caracas`, UTC-4) y nombre
  del sprint actual del equipo (ej. "Sprint 24") → completar § "Configuración del Agente"
  (usado por el skill `activity-logger` para la bitácora de actividad)

Escribir directamente sobre `context/CONTEXT.md` (Edit), respetando la estructura de secciones del template. No eliminar secciones aunque queden vacías — marcarlas `_(pendiente)_`.

---

## PHASE 2 — Ingesta de screenshots → `context/UI-UX.md`

Cuando el usuario adjunte una o más imágenes de pantallas:

1. **Leer cada imagen** con `Read` (soporta PNG/JPG) para identificar visualmente:
   - Portal / módulo / nombre de la pantalla (preguntar si no es obvio)
   - Ruta o cómo se llega a esa pantalla (preguntar si no es obvio)
   - Elementos clave: botones, campos, labels, tablas, mensajes — **con el texto literal exacto** que se ve en la imagen
   - Estados visibles (vacío, con datos, error, loading)

2. **Copiar la imagen** a `context/screenshots/<slug-pantalla>.png` (usar Bash/PowerShell `Copy-Item`/`cp` desde la ruta original — no mover el original sin confirmar).

3. **Agregar una entrada nueva** al final de la sección "Pantallas documentadas" en `context/UI-UX.md`, siguiendo el formato del template:

```markdown
## [Portal] > [Módulo] > [Nombre de pantalla]
- **Ruta/URL:** ...
- **Cómo se llega aquí:** ...
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
- **Estados:** ...
- **Screenshot:** ![<slug>](screenshots/<slug-pantalla>.png)
- **Notas para TCs:** ...
---
```

4. Si ya existe una entrada para esa pantalla, **actualizarla** (no duplicar) — preguntar al usuario si la imagen reemplaza/complementa la anterior.

⛔ Nunca "rellenar" elementos que no se ven claramente en la imagen — preguntar al usuario o dejar la celda vacía.

---

## PHASE 2b — Ingesta pasiva (invocada desde CUALQUIER otra tarea)

Esta fase **no requiere** que el usuario pida "onboarding". Se invoca automáticamente desde
cualquier flujo (QA-PRO o PO-PRO) en dos disparadores:

| Disparador | Regla que lo ordena | Qué ingestar |
|---|---|---|
| El usuario compartió screenshot(s) de la app durante una tarea (US, TC, bug, duda) | AGENTS.md §8.12 | Cada screenshot → PHASE 2 (copiar imagen + entrada/actualización en `UI-UX.md`) |
| QA-PRO va a cerrar una US (`Closed`) | QA-PRO §5.4 (checkpoint de contexto) | Pantallas nuevas o cambiadas que tocó la US, usando los screenshots de la ejecución |

Reglas de la ingesta pasiva:
1. **No interrumpir la tarea principal** — completar primero el objetivo del usuario; la ingesta
   se hace al cierre de la tarea (batch), no en medio del flujo.
2. Aplicar la misma mecánica de PHASE 2 (leer imagen, extraer labels literales, copiar a
   `context/screenshots/`, entrada en `UI-UX.md`). Si la pantalla ya existe → actualizar, no duplicar.
3. Si falta un dato de la entrada (nombre de pantalla, ruta) → una sola pregunta corta al cierre;
   si el usuario no responde, dejar la celda `_(pendiente)_` — nunca inventar.
4. Reportar en el resumen final de la tarea: pantallas documentadas/actualizadas.

---

## PHASE 3 — Ingesta de wiki (opcional)

Si el usuario da acceso a una wiki de ADO:

```
mcp__azure-devops-Autoreg__wiki_list_pages({ ... })
mcp__azure-devops-Autoreg__wiki_get_page_content({ ... })
```

O si pega contenido manualmente: extraer términos de dominio, flujos y reglas de negocio, e incorporarlos a las secciones correspondientes de `context/CONTEXT.md` (Terminología Literal, Módulos, Roles, Login). Si el contenido es extenso, guardar el export crudo en `context/wiki/<nombre>.md` y dejar en `CONTEXT.md` solo el resumen + referencia al archivo.

---

## PHASE 4 — Ingesta de repo real (opcional)

Si el usuario indica una ruta local al repo de la app (no este repo de skills):

- Usar `Grep`/`Read` para validar: nombres de rutas, componentes, textos de UI ya documentados en `UI-UX.md` y `CONTEXT.md`.
- Si encuentra discrepancias (ej. un label documentado no existe en el código, o existe una ruta no documentada), reportarlas al usuario antes de corregir — no sobreescribir silenciosamente.
- No clonar ni indexar repos completos automáticamente — solo leer lo que el usuario apunte.

---

## PHASE 5 — Resumen y recordatorio de push

Al terminar cualquier sesión de onboarding (parcial o completa), reportar:

```
✅ Contexto actualizado
   context/CONTEXT.md  → secciones actualizadas: [...]
   context/UI-UX.md    → pantallas agregadas/actualizadas: [...]
   context/screenshots/ → imágenes nuevas: [...]

📌 Recuerda: este contexto vive en TU repo, no en QA-TOOLS-TEMPLATE.
   Haz commit y push para que quede disponible en el equipo y en futuras sesiones:
     git add context/
     git commit -m "docs(context): actualizar contexto de proyecto"
     git push
```

---

## Reglas críticas

- ⛔ NO inventar URLs, IDs, roles, ni textos de UI — preguntar o dejar `_(pendiente)_`.
- ⛔ NO sobreescribir entradas existentes de `UI-UX.md` sin confirmar con el usuario.
- ⛔ NO mover/borrar las imágenes originales del usuario — copiar.
- ✅ Si una pantalla no tiene screenshot ni descripción suficiente, dejarla fuera de `UI-UX.md` — es mejor no documentarla que documentarla mal (otros skills la tratarán como "no documentada" y pedirán evidencia real).
- ✅ Procesar un screenshot a la vez si el usuario adjunta varios — confirmar cada entrada antes de seguir con la siguiente.
