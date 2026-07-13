# Entrada para GitHub Copilot

> ⚠️ **Copilot lee este archivo automáticamente.** Las reglas del agente **no viven aquí** — viven en
> `AGENTS.md` (el cerebro, fuente única). Aquí solo está el puntero al cerebro y cómo Copilot accede a las tools.

**Antes de actuar, lee con `read_file` en este orden:**
1. **`AGENTS.md`** — reglas globales, routing, prohibiciones, PASO 0 (A/B).
2. **`context/CONTEXT.md`** — dominio del proyecto (portales, login, roles, terminología).
3. **`context/UI-UX.md`** — mapa de pantallas reales; obligatorio antes de redactar steps de un TC.

Si `context/CONTEXT.md` sigue con placeholders o `context/UI-UX.md` no tiene pantallas documentadas,
ofrecer ejecutar el skill `project-onboarding` (`skills/project-onboarding/SKILL.md`).

---

## Subagentes (Copilot)

| Mención | Rol | Archivo |
|---|---|---|
| `@QA-PRO` | Testing: TCs, ejecución, evidencia, Zoho, daily | `.github/agents/QA-PRO.agent.md` |
| `@PO-PRO` | Product Owner: redactar US, criterios, refinar backlog | `.github/agents/PO-PRO.agent.md` |

Copilot carga estos agentes nativamente al @-mencionarlos. Las reglas de **rol** viven en ellos;
las reglas **globales**, en `AGENTS.md`. Si hay ambigüedad PO vs QA, preguntar cuál usar.

---

## Cómo Copilot accede a las tools

`AGENTS.md` y los subagentes usan **verbos genéricos**. En Copilot se resuelven así:

| Verbo genérico | En Copilot |
|---|---|
| leer skill / subagente / contexto | `read_file("<ruta>")` |
| obtener/crear/actualizar/comentar work item, WIQL, test plans | MCP de Azure DevOps configurado (los `SKILL.md` definen los endpoints REST exactos cuando aplica) |
| subir attachment / publicar comentario con evidencia | REST de ADO según el skill `qa-execution-reporter` |
| registrar/consultar time logs | MCP de Zoho Projects configurado |
| PAT de ADO | extraer de `%APPDATA%\Code\User\mcp.json` (o `.vscode/mcp.json`) — **nunca** pedirlo al usuario |

---

## Ejecución no-bloqueante (anti-bloqueo)

Copilot Chat no tiene un equivalente al despacho en background con notificación automática de
Claude Code para subagentes custom (`.github/agents/`). Cuando AGENTS.md §3.1 proponga despacho en
paralelo, ofrecer en su lugar:
- Abrir una segunda sesión/pestaña de Copilot Chat y despachar ahí (`@QA-PRO ...` / `@PO-PRO ...`) —
  cada sesión corre independiente, sin bloquear la otra.
- O encolar las tareas y avisar el orden de ejecución ("primero termino X, luego Y").

---

> Cambiar de plataforma solo toca esta tabla — ninguna regla de `AGENTS.md` ni de los subagentes.
> **No escribas reglas de comportamiento aquí.** Si una regla no está en `AGENTS.md`, en un subagente o en un skill, no existe.
