# 🤖 QA Agent Template — Guía de Operación

> **¿Primera vez aquí?** Empieza por la sección de Instalación.
> No necesitas saber programar para usar este agente.

---

## ¿Qué hace este agente?

Es un asistente de IA para equipos de QA que trabaja directamente en VS Code con GitHub Copilot.
Puedes pedirle cosas en lenguaje natural, por ejemplo:

- *"Analiza la US 9884 y prepara el test plan"*
- *"Ejecuta el Test Plan 10716, Suite 10717"*
- *"Registra 2 horas en Zoho para la US 9884, actividad Preparar TP"*

El agente entiende tu intención y ejecuta las acciones por ti en Azure DevOps, Zoho Projects
y la aplicación bajo prueba — todo sin que tengas que escribir código.

---

## ¿Qué puede hacer?

| Lo que le pides | Lo que hace |
|----------------|-------------|
| "Analiza esta US y crea los TCs" | Lee los criterios de aceptación, redacta Test Cases profesionales y los crea en Azure DevOps |
| "Ejecuta el Test Plan X" | Navega la app, ejecuta cada paso, toma screenshots y sube la evidencia a ADO |
| "Automatiza estos TCs con Playwright" | Genera código TypeScript reutilizable (archivos `.spec.ts`) para regresión |
| "Registra mis horas de hoy en Zoho" | Crea los time logs con el formato oficial aprobado en Zoho Projects |
| "Prepara el reporte del daily" | Genera el resumen de Logros + Trabajo del día listo para el standup |

---

## ✅ Requisitos previos

Antes de instalar, verifica que tienes todo esto:

| Requisito | Cómo verificarlo | Dónde instalarlo si falta |
|-----------|-----------------|--------------------------|
| **Node.js 18+** | Abre terminal → escribe `node -v` | [nodejs.org](https://nodejs.org) |
| **VS Code** | Abre VS Code | [code.visualstudio.com](https://code.visualstudio.com) |
| **GitHub Copilot** (extensión de VS Code) | `Ctrl+Shift+X` → busca "GitHub Copilot" | Marketplace de VS Code |
| **MCP Azure DevOps** configurado | El agente puede conectarse a ADO sin errores | Pide ayuda a tu equipo de IT |
| **MCP Playwright (Browser)** configurado | El agente puede abrir un navegador | Pide ayuda a tu equipo de IT |
| **MCP Zoho Projects** configurado | Solo si vas a registrar horas en Zoho | Pide ayuda a tu equipo de IT |

> **¿Qué es un MCP?** Es una conexión que permite al agente comunicarse con sistemas externos
> (Azure DevOps, Zoho, el navegador). Tu equipo de IT o el administrador de VS Code puede configurarlos.

---

## 🚀 Instalación en 2 minutos

### Paso 1 — Crea una carpeta para tu proyecto de QA

```
Windows:   C:\QA\mi-proyecto\
Mac/Linux: ~/QA/mi-proyecto/
```

### Paso 2 — Abre esa carpeta en la terminal y ejecuta

```bash
npx github:jmartinez-autoreg/QA-TOOLS-TEMPLATE
```

Esto descarga e instala automáticamente, **todo dentro de la carpeta de tu proyecto** (ya no en carpetas globales del sistema):
- Los archivos de configuración del agente (`CLAUDE.md`, `copilot-instructions.md`, reglas)
- Los skills (capacidades del agente) en `.claude/skills/`
- Los agentes en `.claude/agents/` (Claude Code) y `.github/agents/` (GitHub Copilot)
- La carpeta `context/` (`CONTEXT.md`, `UI-UX.md`, `screenshots/`) para el contexto de TU proyecto

> Como todo vive en tu repo, puedes versionarlo con `git` y afinarlo para cada proyecto de forma independiente.

### Paso 3 — Abre VS Code en esa carpeta

```bash
code .
```

O desde VS Code: `Archivo → Abrir Carpeta` → selecciona la carpeta que creaste.

### Paso 4 — Abre GitHub Copilot en modo Agent

- Presiona `Ctrl+Shift+I` (Windows/Linux) o `Cmd+Shift+I` (Mac)
- Asegúrate de que aparezca **"Agent"** en la parte superior del panel de chat

### Paso 5 — ¡Listo! Escríbele al agente

Ejemplos de lo que puedes escribirle:

```
Analiza la US 9884 y prepara el test plan
```

```
Ejecuta el Test Plan 10716, Suite 10717
URL: https://mi-aplicacion.com
```

```
Registra 2 horas para la US 9884, actividad: Preparar TP, fecha: hoy
```

### Paso 6 (recomendado) — Configura el contexto de tu proyecto

La primera vez, pídele al agente:

```
Configura el contexto del proyecto
```

Esto dispara el skill **`project-onboarding`**, que te hace unas preguntas y construye el "cerebro local"
del proyecto en `context/`:
- `context/CONTEXT.md` — portales, login, roles, módulos, terminología literal de tu dominio
- `context/UI-UX.md` — mapa de pantallas reales (puedes adjuntar **screenshots** y el agente los documenta)

> Con el contexto cargado, los Test Cases salen mucho más precisos: el agente deja de **suponer** labels
> y flujos, y usa los textos reales de tu app. Cuando termines, sube `context/`, `.claude/` y `.github/agents/`
> a **tu propio repositorio** para que quede disponible en el equipo.

---

## ⚙️ Configuración inicial (una sola vez por equipo)

### Si usas Zoho Projects para registrar horas

Abre el archivo: `.claude/skills/zoho_timelog/SKILL.md`

Busca la sección **"Contexto del Proyecto"** y reemplaza los valores entre `{{}}` con los de tu empresa:

```
{{ZOHO_PORTAL_ID}}   → Tu ID numérico de portal en Zoho
{{ZOHO_PROJECT_ID}}  → ID del proyecto en Zoho
{{NOMBRE_PROYECTO}}  → Nombre de tu proyecto
{{ZOHO_OWNER_ID}}    → Tu ID de usuario en Zoho
```

### Actualizar el mapeo de User Stories cada sprint

Al inicio de cada sprint, actualiza la tabla de mapeo en `zoho_timelog/SKILL.md`.
Esta tabla relaciona el número de US de ADO con el ID de tarea en Zoho
(son sistemas distintos — el número de ADO **no** sirve directamente en Zoho).

---

## 🗣️ Cómo hablarle al agente — ejemplos reales

### Para crear y preparar Test Cases

```
Analiza la US 9884 y dime cuántos TCs necesita
```

```
Prepara el test plan completo para la US 9884
```

```
Crea los TCs de la US 9884 en ADO con el Test Plan 10716
```

### Para ejecutar Tests (genera evidencia en ADO)

```
Ejecuta el Test Plan 10716, Suite 10717
URL: https://mi-app.com
```

```
Ejecuta los TCs 10712 y 10713
URL: https://mi-app.com
Usuario: admin / Contraseña: [la que uses]
```

### Para automatizar (genera código Playwright reutilizable)

```
Automatiza el TC 10712 del Plan 10716
URL: https://mi-app.com
```

### Para registrar horas en Zoho

```
Registra mis horas de hoy:
- US 9884: 1.5h Preparar TP, 1h Ejecutar TP
- US 9805: 0.5h QA Demo
Fecha: 2026-05-19
```

### Para el standup daily

```
Prepara el reporte del daily de hoy
US cerradas: 9884, 9805
US en progreso: 9876
Total horas: 4h
```

---

## ❓ Primera pregunta del agente (solo para ejecutar/automatizar TCs)

Cuando pides ejecutar o automatizar TCs, el agente pregunta:

```
¿Qué escenario necesitas?

  A — Proyecto Playwright completo
      Genera archivos .spec.ts reutilizables en TPlans/
      Los tests quedan como código para repetirlos después (regresión)

  B — Ejecución directa, sin archivos
      Navega la app, ejecuta los pasos y sube screenshots a ADO
      No genera código. Solo evidencia. Listo en minutos.
```

**¿Cuál elegir?**
- Elige **A** si quieres que los tests queden como código para repetirlos en cada release
- Elige **B** si solo necesitas la evidencia para hoy (la opción más usada día a día)

---

## 📂 Archivos que se crean en tu carpeta

```
mi-proyecto/
├── AGENTS.md                      ← El "cerebro" del agente (todas las reglas) — fuente única
├── CLAUDE.md                      ← Entrada de Claude Code → apunta a AGENTS.md — NO editar
├── .claude/
│   ├── skills/                    ← Capacidades del agente (qa_tester, zoho_timelog, ...)
│   └── agents/                    ← QA-PRO, PO-PRO (Claude Code)
├── .github/
│   ├── copilot-instructions.md    ← Entrada de Copilot → apunta a AGENTS.md — NO editar
│   └── agents/                    ← QA-PRO, PO-PRO (GitHub Copilot)
├── context/                       ← El contexto de TU proyecto (versionable)
│   ├── CONTEXT.md                 ← Dominio: portales, login, roles, terminología
│   ├── UI-UX.md                   ← Mapa de pantallas reales (labels, estados)
│   └── screenshots/               ← Imágenes referenciadas desde UI-UX.md
├── .agent-state/                  ← Estado interno del agente — NO editar
├── TPlans/                        ← Aquí van los tests generados (Escenario A)
├── playwright.config.ts           ← Configuración de velocidad, video, screenshots
├── playwright-guide.md            ← Referencia técnica para desarrolladores
├── execution-rules.md             ← Reglas para escribir tests
├── selector-strategy.md           ← Estrategia de selectores CSS/XPath
└── agent-architecture.md          ← Arquitectura del pipeline de agentes
```

> **Todas las reglas del agente viven en `AGENTS.md`** (una sola fuente). `CLAUDE.md` y
> `.github/copilot-instructions.md` solo apuntan a él y traducen los nombres de las tools de cada plataforma.

> **Sube `context/`, `.claude/` y `.github/agents/` a tu propio repositorio.** Ahí vive la configuración
> afinada de tu proyecto — así queda disponible para el equipo y en futuras sesiones.

---

## 🔠 Datos que necesitas tener a mano

```
Para TCs / Test Plans (Azure DevOps):
  Test Plan ID  →  Número del plan en ADO       (ej: 10716)  [OBLIGATORIO]
  Suite ID      →  Número de la suite en ADO    (ej: 10717)  [opcional]
  TC IDs        →  Números de TCs específicos   (ej: 10712)  [opcional]

Para la aplicación bajo prueba:
  URL           →  Dirección web de la app      (ej: https://mi-app.com)  [OBLIGATORIO]
  Usuario       →  Si la app tiene login
  Contraseña    →  Si la app tiene login  [nunca guardar esto en archivos del repo]

Para Zoho (registro de horas):
  US IDs        →  Números de US trabajadas     (ej: 9884)
  Horas         →  Horas por actividad          (ej: 1.5h Preparar TP)
  Fecha         →  Fecha del registro           (ej: 2026-05-19)
```

---

## 🧩 Skills disponibles

Los skills son las "capacidades" del agente. Se instalan automáticamente en `.claude/skills/` dentro de tu proyecto.

| Skill | ¿Para qué sirve? | El agente lo usa cuando dices... |
|-------|-----------------|----------------------------------|
| `project-onboarding` | Construir el contexto del proyecto (`context/`) a partir de datos y screenshots | "configurar contexto", "nuevo proyecto", "agregar pantallas" |
| `qa_tester` | Analizar US, crear TCs, documentar resultados, registrar bugs | "analizar US", "crear TC", "preparar test plan" |
| `po-user-story` | Redactar User Stories con criterios de aceptación densos | "redactar US", "crear historia", "criterios de aceptación" |
| `zoho_timelog` | Registrar horas en Zoho, generar reporte daily | "registrar horas", "zoho", "daily", "time log" |
| `playwright-e2e` | Automatizar TCs con código Playwright (Escenario A) | "automatizar", "crear tests E2E" |
| `qa-execution-reporter` | Ejecutar TCs y subir evidencia a ADO (Escenario B) | "ejecutar TC", "correr Suite" |
| `tc-reader` | Leer y analizar TCs desde ADO | "leer TCs", "mostrar pasos del TC" |
| `debugger` | Diagnosticar y corregir tests fallidos | "el test falla", "debug este test" |
| `create-test-cases` | Crear TCs básicos en ADO | "crear test case rápido en ADO" |
| `find-skills` | Descubrir capacidades disponibles | "¿qué puedes hacer?", "¿tienes skill para X?" |

---

## 🔄 Actualizar el template y skills

Si hay una nueva versión disponible:

```bash
npx github:jmartinez-autoreg/QA-TOOLS-TEMPLATE --force
```

Esto actualiza los archivos del workspace, los skills (`.claude/skills/`) y los agentes
(`.claude/agents/`, `.github/agents/`). Tu carpeta `context/` **nunca se sobreescribe** —
tu conocimiento del proyecto está a salvo aunque uses `--force`.

### ⬆️ Migración desde v2 (instalaciones globales)

La v3 cambia el modelo: skills y agentes ahora viven **dentro de tu repo**, no en carpetas globales del sistema.
Si vienes de la v2, borra manualmente las instalaciones globales viejas y reinstala:

```powershell
# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.agents\skills" -ErrorAction SilentlyContinue
Remove-Item -Force "$env:USERPROFILE\.claude\agents\QA-PRO*" -ErrorAction SilentlyContinue
Remove-Item -Force "$env:USERPROFILE\.copilot\agents\QA-PRO*" -ErrorAction SilentlyContinue
```

Luego, en la carpeta de tu proyecto: `npx github:jmartinez-autoreg/QA-TOOLS-TEMPLATE`.

---

## 🆘 Problemas comunes y soluciones

| Problema | Solución |
|----------|----------|
| El agente no encuentra los TCs | Verifica que tengas el Test Plan ID y Suite ID correctos en ADO |
| "MCP ADO no responde" | Verifica que el MCP de Azure DevOps esté configurado y con sesión activa en VS Code |
| "El browser no abre" | Verifica que el MCP de Playwright (Browser) esté activo |
| "Node.js no encontrado" | Instala Node.js 18+ desde [nodejs.org](https://nodejs.org) |
| Los skills no funcionan | Vuelve a ejecutar `npx github:jmartinez-autoreg/QA-TOOLS-TEMPLATE` |
| Error en PowerShell (Windows) | Ejecuta los comandos así: `cmd /c "npx ..."` en la terminal |
| El agente no registra en Zoho | Verifica que Portal ID y Project ID estén configurados en `zoho_timelog/SKILL.md` |
| "Límite de 15 horas en Zoho" | Es un límite de la API de Zoho. Distribuye el exceso al día siguiente |
| El agente no habla español | Escríbele en español — responde en el idioma que uses |

---

*Generado por [QA-TOOLS-TEMPLATE](https://github.com/jmartinez-autoreg/QA-TOOLS-TEMPLATE)*

