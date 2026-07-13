# Entrada para Claude Code

> ⚠️ **Este archivo se lee automáticamente en cada sesión.**
> Las reglas del agente **no viven aquí** — viven en `AGENTS.md` (el cerebro, fuente única).
> Aquí solo está: el puntero al cerebro, el contexto del proyecto, y el mapeo de tools MCP de Claude Code.

---

## Cerebro y contexto (auto-cargados)

@AGENTS.md
@context/CONTEXT.md
@context/UI-UX.md

Si `context/CONTEXT.md` sigue con placeholders o `context/UI-UX.md` no tiene pantallas documentadas,
ofrecer ejecutar el skill `project-onboarding` (`.claude/skills/project-onboarding/SKILL.md`) antes de
redactar TCs o USs que dependan de esa información.

---

## Específico de Claude Code

- **Subagentes:** se despachan desde `.claude/agents/` — `QA-PRO.agent.md` (QA) y `PO-PRO.agent.md` (PO).
  `QA-PRO.agent.md` es además la capa de autoridad: si un skill contradice una regla de rol, gana el subagente.
- **Skills:** se leen con la herramienta `Read` desde `.claude/skills/<skill>/SKILL.md`.
- **Reglas globales, routing y prohibiciones:** todas en `AGENTS.md`. No repetirlas aquí.

---

## Mapeo de tools MCP (Claude Code)

`AGENTS.md` y los subagentes usan **verbos genéricos**. En Claude Code se traducen así:

### Azure DevOps

| Verbo genérico | Tool MCP (Claude Code) |
|---|---|
| obtener work item | `mcp__azure-devops-Autoreg__wit_get_work_item` |
| actualizar work item | `mcp__azure-devops-Autoreg__wit_update_work_item` |
| crear work item | `mcp__azure-devops-Autoreg__wit_create_work_item` |
| comentar work item | `mcp__azure-devops-Autoreg__wit_add_work_item_comment` |
| consultar WIQL | `mcp__azure-devops-Autoreg__wit_query_by_wiql` |
| batch work items por IDs | `mcp__azure-devops-Autoreg__wit_get_work_items_batch_by_ids` |
| historial de revisiones | `mcp__azure-devops-Autoreg__wit_list_work_item_revisions` |
| adjunto de work item | `mcp__azure-devops-Autoreg__wit_get_work_item_attachment` |
| listar test plans / suites / cases | `mcp__azure-devops-Autoreg__testplan_list_test_plans` / `_test_suites` / `_test_cases` |
| crear test plan / suite / case | `mcp__azure-devops-Autoreg__testplan_create_test_plan` / `_suite` / `_case` |
| actualizar pasos de TC | `mcp__azure-devops-Autoreg__testplan_update_test_case_steps` |
| agregar TCs a suite | `mcp__azure-devops-Autoreg__testplan_add_test_cases_to_suite` |

### Zoho Projects

| Verbo genérico | Tool MCP (Claude Code) |
|---|---|
| registrar time log | `mcp__claude_ai_Zhoho__ZohoProjects_add_time_log` |
| registrar time logs en lote | `mcp__claude_ai_Zhoho__ZohoProjects_add_bulk_time_logs` |
| time logs por proyecto / portal | `mcp__claude_ai_Zhoho__ZohoProjects_get_time_logs_by_project` / `_by_portal` |
| tareas por proyecto | `mcp__claude_ai_Zhoho__ZohoProjects_get_tasks_by_project` |
| actualizar time log | `mcp__claude_ai_Zhoho__ZohoProjects_update_single_time_log` |
| portales / proyectos / usuario | `mcp__claude_ai_Zhoho__ZohoProjects_get_portals` / `_get_projects_list` / `_get_current_user_details` |

### Ejecución no-bloqueante (anti-bloqueo)

| Verbo genérico | Mecanismo (Claude Code) |
|---|---|
| despachar subagente en background | Tool `Agent` con `subagent_type: "QA-PRO"` / `"PO-PRO"` y `run_in_background: true`. Claude Code notifica automáticamente al completarse — mostrar entonces el resumen de resultados (AGENTS.md §8.9). |
| lanzar el mismo subagente varias veces en paralelo | Varias llamadas a `Agent` (una por tarea independiente), cada una con `run_in_background: true`, en el mismo turno |

> Claude Code soporta esto de forma nativa. AGENTS.md §3.1 decide cuándo proponerlo.

> Cambiar de plataforma solo toca esta tabla — ninguna regla de `AGENTS.md` ni de los subagentes.
