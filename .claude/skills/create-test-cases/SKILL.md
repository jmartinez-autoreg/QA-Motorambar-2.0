---
name: create-test-cases
description: 'Crea Test Cases profesionales en Azure DevOps siguiendo estándares QA empresariales. Usar cuando el usuario pida crear, redactar, generar, dividir o corregir TCs, casos de prueba o test cases en cualquier organización/proyecto de ADO. Aplica nomenclatura Portal-Módulo-Pantalla-Funcionalidad [Escenario], estructura PRECOND secuencial 0..N (Login siempre el último), y resultados esperados observables.'
argument-hint: 'Describe la funcionalidad a testear, pega pasos de un TC existente, o indica org/proyecto/plan/suite'
---

# Crear Test Cases Profesionales en Azure DevOps

Skill genérica para crear TCs de alta calidad en cualquier organización y proyecto de Azure DevOps, siguiendo estándares QA empresariales.

---

## 1. Recolectar contexto — SIEMPRE preguntar primero

Antes de crear cualquier TC, necesitas estos datos. **Pregunta todo lo que falte:**

| Dato | Ejemplo | Obligatorio |
|------|---------|-------------|
| **Organización ADO** | `MiOrg` | No — viene de `context/CONTEXT.md` § "Organización ADO" (AGENTS.md §2). Preguntar solo si falta o el usuario indica otra. |
| **Proyecto ADO** | `MiProyecto` | No — viene de `context/CONTEXT.md` § "Organización ADO" (AGENTS.md §2). Preguntar solo si falta o el usuario indica otro. |
| **Test Plan ID** | `9361` | No — si falta, resolver con la convención oficial: plan del **Equipo-Sprint** actual (ver `qa_tester` § "Estructura del Test Plan en ADO"). Preguntar solo si no se puede resolver. |
| **Test Suite ID** | `9363` | No — si falta, buscar/crear la suite de la US (`{US_ID}: {Título}`) dentro del plan del sprint. Preguntar solo si no hay US vinculada. |
| **User Story / Work Item** | `US 9313` | Recomendado |
| **Portal / Aplicación** | `AutoReg`, `MiPortal` | Sí (para el título) |
| **Módulo** | `Preventas`, `Ventas` | Sí (para el título) |
| **Pantalla / Funcionalidad** | `Proc. Preventas Excel` | Sí (para el título) |
| **URL de la pantalla** | `https://app.empresa.com/Forms/Modulo.aspx` | Sí — incluir en pasos de navegación. Requerida para automatización futura. |
| **Usuario de prueba** | `graciagc` | Sí (para PRECOND Login) |
| **Rol del usuario** | `CASE CREATOR` | Sí (para PRECOND Login) |
| **Escenarios a cubrir** | Happy path, errores, cancelar... | Sí |

> Si el usuario ya proporcionó esta información en mensajes previos o en el contexto de la conversación, no vuelvas a preguntar.

---

## 2. Nomenclatura del título (estándar empresa)

**Formato obligatorio:**
```
{Portal}-{Módulo}-{Pantalla}-{Funcionalidad} [{Escenario}]
```

**Reglas:**
- **Portal**: nombre del portal o aplicación bajo prueba
- **Módulo**: sección del menú principal
- **Pantalla**: nombre exacto como aparece en la UI
- **Funcionalidad**: qué se prueba específicamente
- **Escenario**: entre corchetes `[]`, describe la variante

**Ejemplos:**
```
MiPortal-Ventas-Gestión de Pedidos-Creación de Pedido [Happy Path]
MiPortal-Ventas-Gestión de Pedidos-Creación de Pedido [Datos inválidos]
MiPortal-Ventas-Gestión de Pedidos-Creación de Pedido [Cancelar]
```

---

## 3. Estructura de pasos — Sistema PRECOND

Todo TC debe comenzar con precondiciones. Las PRECONDs se numeran **secuencialmente desde 0** — el número indica la posición, no la categoría. Incluir **solo** las categorías que el TC necesita, en este orden:

| Categoría | Contenido | Cuándo incluir |
|-----------|-----------|----------------|
| Dependencias de TCs | TCs que deben ejecutarse antes para dejar el sistema en un estado dado | Si el TC depende de otro TC previo |
| Datos del sistema | Archivos, usuarios creados, datos precargados, configuraciones específicas | Si el TC requiere datos específicos |
| Info de usuario | Tipo de rol, escenario de permisos, condiciones del usuario | Si el escenario requiere especificar condiciones de usuario adicionales |
| **Login** | `Login<br/>- Usuario: X<br/>- Rol: Y<br/>- Acceso portal: Z<br/>- Acceso módulo: W` (usar `<br/>` entre campos — nunca línea plana) | **Siempre — pero su número = su posición en la secuencia** |

> ⚠️ **El número NO es fijo por categoría.** Es la posición en la lista de precondiciones del TC:
> - Solo login → `PRECOND 0: Login<br/>- Usuario: X<br/>- Rol: Y<br/>...`
> - Datos + login → `PRECOND 0: Datos [...]`, `PRECOND 1: Login<br/>- ...`
> - TC deps + datos + login → `PRECOND 0: TC deps [...]`, `PRECOND 1: Datos [...]`, `PRECOND 2: Login<br/>- ...`
>
> ⚠️ **Login siempre usa `<br/>` entre campos** — nunca `Login - Usuario: X - Rol: Y` en línea plana.

Después de los PRECONDs, continúan los **pasos de ejecución** numerados secuencialmente.

**Ejemplo — solo Login (único PRECOND):**
```
1. PRECOND 0: Login<br/>- Usuario: usuario01<br/>- Rol: ADMIN<br/>- Acceso portal: MiPortal<br/>- Acceso módulo: Ventas / Gestión de Pedidos|
2. Clic en el botón 'Crear Pedido'|Se presenta el formulario de creación con los campos Nombre, Cantidad y Fecha habilitados
3. Ingresar 'Producto A' en el campo Nombre|El campo muestra el texto 'Producto A' sin errores de validación
4. Clic en el botón 'Guardar'|Se presenta mensaje de éxito 'Pedido creado correctamente' y se redirige a la lista de pedidos
```

**Ejemplo — TC deps + Datos + Login (tres PRECONDs):**
```
1. PRECOND 0: TC-A (ID XXXX) ejecutado hasta el paso 10; el sistema muestra la pantalla de resultados|
2. PRECOND 1: Archivo Excel con 3 registros válidos cargado en la sesión activa|
3. PRECOND 2: Login<br/>- Usuario: usuario01<br/>- Rol: ADMIN<br/>- Acceso portal: MiPortal<br/>- Acceso módulo: Ventas / Gestión de Pedidos|
4. Clic en el botón 'Crear Pedido'|Se presenta el formulario de creación con los campos Nombre, Cantidad y Fecha habilitados
```

### 3.1 Notación de letras, `PRECOND 0` "TC Ejecutado" y referencias inline

(Fuente: GUÍA-QA-Redacción de casos de pruebas v1.00, §3.3)

**Notación de letras:** cuando hay más de una PRECOND del mismo tipo en la misma posición de la
secuencia, agregar una letra mayúscula al número (`1A`, `1B`, `1C`...). Ejemplo real (TC 82981):
```
PRECOND 1A: Referido Admitido
PRECOND 1B: Referido Serv. Rel. Activo
PRECOND 2: Login<br/>- ...
```

**`PRECOND 0` para dependencias de TCs (formato "TC Ejecutado"):** cuando el TC depende de otro TC
ya ejecutado, usar este formato — una línea `- {ID}: {título del TC}` por dependencia, dentro del
mismo row vía Shift+Enter (ejemplo real, TC 83070):
```
PRECOND 0: TC Ejecutado
- 83057: Solicitud Horas Comp.: Validación Crear [Reg - Solicitud Ninguna / SI Crear]
```

**Referencias inline:** dentro del texto de un paso de ejecución, citar entre paréntesis la PRECOND
de la que provienen los datos usados en ese paso: `(PRECOND 2)`, `(PRECOND 1A)`, `(PRECOND 1 / 2)`.
Ejemplos reales:
- "Ingresar portal Finanzas (PRECOND 3)"
- "En búsqueda ingresar filtros (PRECOND 1A) y oprimir Buscar"

---

## 4. Reglas de calidad — OBLIGATORIO cumplir todas

### Hacer (obligatorio)

- **Flujo narrativo continuo por pantalla/funcionalidad** — todos los escenarios que ocurren en la misma pantalla/popup van en 1 solo TC secuencial, sin salir de ella
- **Dividir en TCs separados SOLO cuando** el flujo requiere cambiar de pantalla, de módulo, o cuando las precondiciones son incompatibles entre sí
- **Cada paso = 1 acción + 1 resultado esperado observable**
- **Resultados específicos**: qué texto aparece, qué elementos se habilitan/deshabilitan, qué cambia en pantalla
- **Español correcto** con tildes y ortografía impecable (á, é, í, ó, ú, ñ)
- **Nombrar elementos UI exactamente** como aparecen en pantalla (botones, campos, labels)

### NO hacer (prohibido)

- ❌ `"Vuelve al paso X"` — no es observable, no sirve como resultado esperado
- ❌ Copiar/pegar criterios de aceptación como pasos del TC
- ❌ Pasos sin resultado esperado (excepto PRECONDs)
- ❌ Combinar varias acciones distintas en un solo paso cuando cada una tiene resultado esperado diferente
- ❌ Crear TCs separados para escenarios que ocurren en la misma pantalla/popup y comparten el mismo flujo de navegación
- ❌ Resultados vagos como "funciona correctamente" o "se actualiza la página"
- ❌ Usar comillas dobles `"` dentro del texto de pasos (causa problemas de escape XML/JSON) — preferir comillas simples o describir sin comillas

### Niveles de detalle de las acciones (Tabla 5, GUÍA-QA-Redacción de casos de pruebas v1.00 §4.3)

| Nivel | Acciones detalladas | Resultados detallados | Pasos | Ejemplo |
|---|---|---|---|---|
| **Resumido** | No | No | 1 | "Ingresar al portal Académico." |
| **Compuesto** | No | No | 1 (multi-acción) | "Ir al módulo PEI y tarjeta 'Crear/Modificar PEI'. En búsqueda rápida ingresar SIE (PRECOND 1), oprimir Buscar y luego Seleccionar." |
| **Separado** | Sí | Sí, una por cada acción | 1 acción = 1 paso | Pasos separados: "Ingresar nombre", "Ingresar apellido paterno"... cada uno con su propio resultado |

> Elegir el nivel según cuánto detalle pida el requerimiento/criterio de aceptación. Un mismo TC
> puede combinar pasos Resumidos/Compuestos para navegación y pasos Separados para el flujo
> crítico que el criterio detalla.

### Resultados esperados — 7 aspectos (Tabla 6, GUÍA-QA-Redacción de casos de pruebas v1.00 §5.1)

Al redactar el resultado esperado de un paso, considerar estos aspectos (no todos aplican siempre):

| Aspecto | Qué describe | Ejemplo |
|---|---|---|
| Validación de datos | Mensajes de validación por campo | "El campo 'Fecha' muestra el mensaje 'Campo requerido' en rojo" |
| Mensaje de éxito o error | Texto literal entre comillas | "Se presenta el mensaje 'Pedido creado correctamente'" |
| Cambios en la interfaz de usuario | Elementos que aparecen/cambian, incluyendo la notación `botón (seleccionado)` para el botón resaltado/con foco en una alerta | "Se presenta alerta con los botones 'Sí' y 'No (seleccionado)'" |
| Seguridad | Mensajes de error de credenciales/permisos | "Se presenta el mensaje 'Usuario o contraseña incorrectos'" |
| Estado del sistema | Redirecciones, datos guardados, valores reflejados | "Se redirige a la lista de pedidos y el nuevo pedido aparece en la primera fila" |
| Interacción con otros sistemas | Envío de correo, sincronización externa | "Se envía un correo de confirmación a la dirección registrada" |
| Rendimiento | Tiempos de respuesta esperados | "La búsqueda retorna resultados en menos de 2 segundos" |

### Nivel de detalle del resultado (Tabla 7, GUÍA-QA-Redacción de casos de pruebas v1.00 §5.2)

| Nivel | Descripción | Ejemplo |
|---|---|---|
| **Resumen** | Sin detalle del mensaje/alerta | "Presenta pantalla de inicio" |
| **Detallado** | Mensaje de validación + alerta con botón seleccionado, texto literal completo | "Presenta alerta 'Tiene cambios sin guardar. ¿Desea cancelar?' con botones 'Sí' y 'No (seleccionado)'" |

---

## 5. Procedimiento técnico en ADO (vía MCP)

### Paso A — Crear el TC (solo título)

```
mcp_ado_testplan_create_test_case(
  project = "<PROYECTO>",
  title   = "{Portal}-{Módulo}-{Pantalla}-{Funcionalidad} [{Escenario}]"
)
→ guardar el ID devuelto
```

> **IMPORTANTE:** NO pasar los steps en `create_test_case`. Si se pasan como array/string en la creación, se almacenan como JSON crudo en vez de XML válido de pasos de ADO. Los pasos SIEMPRE se cargan en un segundo llamado.

### Paso B — Cargar los pasos (separado, obligatorio)

```
mcp_ado_testplan_update_test_case_steps(
  id    = <ID del paso anterior>,
  steps = "1. acción|resultado esperado\n2. acción|resultado esperado\n..."
)
```

**Formato del string `steps`:**
- Cada paso: `N. texto de la acción|texto del resultado esperado`
- Separador entre pasos: `\n` (salto de línea real)
- Separador acción/resultado: `|` (pipe)
- PRECONDs sin resultado: dejar vacío después del `|` (ADO agrega texto genérico automáticamente)
- NO usar comillas dobles dentro del contenido de los pasos

### Paso C — Agregar al Test Suite (opcional)

```
mcp_ado_testplan_add_test_cases_to_suite(
  project      = "<PROYECTO>",
  planId       = <PLAN_ID>,
  suiteId      = <SUITE_ID>,
  testCaseIds  = [id1, id2, ...]
)
```

> Si falla con error 401/403 (permisos insuficientes), indicar al usuario que los agregue manualmente:
> **Test Plans → [Plan] → [Suite] → Add test cases → buscar IDs**

---

## 6. Escenarios típicos a cubrir

Para cualquier funcionalidad, considerar al menos estos escenarios:

| Categoría | Escenario sugerido | Ejemplo de título |
|-----------|--------------------|-------------------|
| Éxito | Flujo completo exitoso | `[Happy Path]` |
| Validación | Datos inválidos o formato incorrecto | `[Datos inválidos]` |
| Cancelación | Cancelar en medio del proceso | `[Cancelar]` |
| Navegación | Volver atrás conservando datos | `[Volver al paso anterior]` |
| Eliminación | Quitar un ítem de una lista | `[Eliminar elemento]` |
| Incompleto | Proceso con datos parciales | `[Registros incompletos]` |
| Omisión | Finalizar sin completar opcional | `[Sin campo opcional]` |
| Reanudación | Retomar proceso interrumpido | `[Reanudación automática]` |
| Duplicado | Intentar crear registro existente | `[Registro duplicado]` |
| Vacío | Sin resultados o lista vacía | `[Sin resultados]` |
| Permisos | Usuario sin permisos suficientes | `[Sin permisos]` |
| Límites | Valores máximos/mínimos | `[Valor límite]` |

> No todos aplican siempre. Seleccionar los relevantes según la funcionalidad.

---

## 7. Flujo de trabajo completo

```
1. Recolectar contexto (sección 1)
   ↓
2. Identificar escenarios a cubrir (sección 6)
   ↓
3. Para cada escenario:
   a. Redactar título con nomenclatura (sección 2)
   b. Redactar pasos con PRECONDs (secciones 3-4)
   c. Verificar resultados observables
   ↓
4. Presentar resumen al usuario para aprobación
   ↓
5. Crear TCs en ADO (sección 5, pasos A→B→C)
   ↓
6. Reportar IDs creados y estado final
```

### Presentar resumen antes de crear

Antes de ejecutar llamadas a ADO, mostrar al usuario una tabla con:
- Letra/código del TC (TC-A, TC-B, etc.)
- Título completo
- Cantidad de pasos
- Escenarios cubiertos

Esperar confirmación ("dale", "sí", "ok") antes de crear en ADO.

---

## 8. Ejemplo completo de TC bien escrito

**Título:** `MiPortal-Ventas-Gestión Pedidos-Creación de Pedido [Cancelar a mitad del proceso]`

**Pasos:**
```
1. PRECOND 0: Login<br/>- Usuario: admin01<br/>- Rol: VENDEDOR<br/>- Acceso portal: MiPortal<br/>- Acceso módulo: Ventas / Gestión de Pedidos|
2. Clic en el botón 'Crear Pedido'|Se presenta el formulario de creación de pedido con:<br/>- Campos: Nombre, Cantidad, Fecha<br/>- Botones: 'Guardar' / 'Cancelar'
3. Ingresar 'Producto de Prueba' en el campo 'Nombre'|El campo muestra el texto ingresado sin errores de validación
4. Ingresar '5' en el campo 'Cantidad'|El campo muestra '5' y no presenta alertas
5. Clic en el botón 'Cancelar'|Se presenta diálogo de confirmación con:<br/>- Texto: 'Tiene cambios sin guardar. ¿Desea cancelar?'<br/>- Botones: 'Sí' / 'No'
6. Clic en el botón 'Sí'|Se presenta el estado final con:<br/>- Diálogo: cerrado<br/>- Pantalla: lista de pedidos<br/>- Pedido creado: NO aparece en la lista
```

---

## Notas técnicas

- Los TCs se crean con estado `Design` por defecto
- El campo `steps` en ADO usa formato XML interno (`<steps>` con `<step>` tags)
- La tool `update_test_case_steps` convierte el formato `N. acción|resultado` a XML automáticamente
- Si un PRECOND no tiene resultado esperado, ADO agrega "Verify step completes successfully" — esto es aceptable para precondiciones
