---
name: po-user-story
description: Redactar User Stories profesionales para el dominio del proyecto activo (context/CONTEXT.md; los ejemplos usan un dominio de referencia de distribución de vehículos). Usa este skill SIEMPRE que el usuario pida redactar, crear, escribir o estructurar User Stories, USs, historias de usuario, criterios de aceptación, requerimientos funcionales, items de backlog o tareas para Azure DevOps — incluso si no menciona explícitamente "user story". También usa este skill cuando convierta requerimientos en USs, refine el backlog, prepare sprints, divida features en USs más pequeñas, redacte criterios de aceptación, o cuando pida "esto sería una US" o "agregar al sprint". El skill produce USs listas para pegar en Azure DevOps con HTML en descripción y criterios de aceptación.
---

# Redacción de User Stories profesionales

Este skill produce User Stories **profesionales y específicas** para el dominio del proyecto
activo. El dominio real (módulos, roles, terminología, estados) se lee de `context/CONTEXT.md` —
⚠️ los ejemplos de este skill usan un **dominio de referencia** (distribución de vehículos:
VIN, inventario, órdenes) que ilustra el nivel de especificidad esperado, **no** vocabulario a
copiar literalmente en otros proyectos. Las USs van a Azure DevOps y se renderizan con HTML, así
que tanto descripción como criterios de aceptación se redactan con tags HTML.

## Por qué este skill existe

Las User Stories genéricas ("Como usuario quiero ver una pantalla") no aportan valor al equipo. El valor está en la **especificidad** de las validaciones, los **mensajes UI exactos**, la mención sistemática de **auditoría**, **estados** y **reglas de negocio** del dominio de distribución de vehículos.

## Estructura obligatoria de una US

### 1. Título — formato parametrizable

```
[Módulo]: [Tema o acción] [Variante opcional entre corchetes]
```

**Módulo** es el dominio principal (Vehículo, Inventario, Orden, Cliente, Logística, Usuario, Reporte, Dashboard).

**Tema** es el sub-elemento dentro del módulo (VIN, estado, reserva, tracking, asignación, etc.).

**Variante** entre corchetes para distinguir flujos del mismo tema (Crear, Editar, Ver, Solo lectura, Cambiar estado, etc.).

Ejemplos (dominio de referencia — distribución de vehículos):
- `Vehículo: Registro de nuevo vehículo en inventario`
- `Vehículo: Cambio de estado [Available → Reserved]`
- `Orden: Asignación de vehículo a cliente`
- `Logística: Tracking de vehículo en tránsito`
- `Inventario: Bandeja de vehículos disponibles`
- `Cliente: Perfil de distribuidor [Ver]`

**Notas de estilo en títulos:**
- Mantener español como idioma principal (salvo acrónimos como VIN)
- Variantes en corchetes van en español (`[Crear]`, `[Solo lectura]`)
- No uses puntos finales en el título

### 2. Descripción — patrón "Como/quiero/para"

Formato HTML literal para Azure DevOps:

```html
<div>Como [rol] quiero [acción concreta] para [beneficio o resultado de negocio].<br> </div>
```

**Rol**: usar el rol funcional, no "usuario" genérico cuando hay rol específico.
- ✅ `Como Gerente de Inventario quiero…`
- ✅ `Como Vendedor quiero…`
- ✅ `Como Cliente/Distribuidor quiero…`
- ✅ `Como Transportista quiero…`
- ✅ `Como Administrador del Sistema quiero…`
- ❌ `Como usuario quiero…` (solo cuando aplica a todos los roles)

**Acción**: verbo en infinitivo + objeto concreto. Evita verbos vagos ("gestionar", "manejar"). Prefiere "registrar", "asignar", "reservar", "cambiar estado", "validar", "rastrear", "actualizar".

**Beneficio**: razón de negocio breve y específica, no genérica.
- ✅ `…para mantener el inventario actualizado y evitar doble asignación.`
- ✅ `…para que el cliente pueda conocer la ubicación de su vehículo en tiempo real.`
- ✅ `…para asegurar la trazabilidad de cada vehículo en el sistema.`
- ❌ `…para mejorar la experiencia.`

### 3. Criterios de aceptación — formato Gherkin en HTML

Formato HTML que va al campo `Microsoft.VSTS.Common.AcceptanceCriteria`. Los criterios se redactan en **Gherkin** (`Dado que / Cuando / Entonces / Y`), envueltos en `<ul><li>` con `<br/>` entre líneas. 

**Cada escenario debe tener:**
1. **Título descriptivo en negrita** (`<strong>Escenario X: [descripción]</strong>`)
2. **Doble salto de línea** después del título (`<br/><br/>`)
3. Líneas Gherkin con salto simple entre ellas (`<br/>`)
4. **Doble salto de línea** al final del escenario para separación visual (`<br/><br/>`)

```html
<ul>
  <li>
    <strong>Escenario 1: [Título descriptivo del caso de uso]</strong><br/><br/>
    Dado que [contexto o estado inicial]<br/>
    Cuando [acción del usuario o evento]<br/>
    Entonces [resultado esperado observable]<br/>
    Y [condición adicional — si aplica]<br/><br/>
  </li>
  <li>
    <strong>Escenario 2: [Otro título descriptivo]</strong><br/><br/>
    Dado que [otro contexto]<br/>
    Cuando [acción]<br/>
    Entonces [resultado]<br/><br/>
  </li>
</ul>
```

⛔ **Sin tecnicismos:** los criterios describen el **QUÉ** (comportamiento visible para el usuario), nunca el **CÓMO** (IDs técnicos, arquitectura, capas de código, nombres de tablas o métodos).

Patrones adicionales obligatorios dentro de los escenarios Gherkin:

#### Campos obligatorios marcados con `*`
```html
<li>Campo <strong>VIN</strong> * requerido (exactamente 17 caracteres alfanuméricos). </li>
<li>Campo <strong>Estado</strong> * requerido (selección de lista). </li>
```

#### Validaciones específicas (formato, longitud, rango)
```html
<li>VIN debe ser exactamente 17 caracteres alfanuméricos, único en el sistema. </li>
<li>Año del vehículo debe estar entre 2000 y año actual + 1. </li>
<li>Precio debe ser numérico positivo con 2 decimales (ej. 25000.00). </li>
<li>Validación de duplicados: no permitir registrar un VIN que ya existe. </li>
```

#### Mensajes UI literales en cursiva
```html
<li><em>"El vehículo ha sido registrado exitosamente con VIN: [VIN]"</em></li>
<li><em>"No es posible cambiar el estado. El vehículo ya está asignado a una orden activa."</em></li>
<li><em>"VIN inválido. Debe tener exactamente 17 caracteres."</em></li>
```

#### Estados con badges de color
```html
<li><strong>Available</strong> (verde) - Disponible para asignación. </li>
<li><strong>Reserved</strong> (amarillo) - Reservado por un cliente. </li>
<li><strong>Sold</strong> (azul) - Vendido y entregado. </li>
<li><strong>InTransit</strong> (naranja) - En tránsito hacia el cliente. </li>
<li><strong>Retired</strong> (rojo) - Dado de baja del inventario. </li>
```

#### Acciones por rol y estado (matriz)
```html
<li><p style="display:inline !important;">Opciones según rol y estado: </p></li>
<ul>
  <li><strong>Gerente de Inventario</strong>: Ver, Editar (Available/Reserved), Cambiar estado, Dar de baja. </li>
  <li><strong>Vendedor</strong>: Ver, Reservar (Available), Ver historial. </li>
  <li><strong>Transportista</strong>: Ver, Actualizar ubicación (InTransit). </li>
</ul>
```

#### Auditoría — casi siempre presente
```html
<li>Auditoría: usuario, fecha, acción realizada (registro, cambio de estado, baja). </li>
<li>Cambios de estado quedan en auditoría con usuario, fecha, estado anterior y estado nuevo. </li>
<li>Historial de ubicaciones se guarda con timestamp y usuario que actualizó. </li>
```

#### Notificaciones automáticas (si aplica)
```html
<li>Notificación al <strong>Cliente</strong> con asunto: <em>"Tu vehículo [VIN] ha sido despachado"</em>. </li>
<li>Notificación al <strong>Gerente de Inventario</strong> cuando un vehículo cambia a estado Sold. </li>
```

## Vocabulario y convenciones del dominio

| Término | Uso |
|---|---|
| **VIN** | Vehicle Identification Number (17 caracteres alfanuméricos) |
| **Inventario** | Stock de vehículos disponibles |
| **Orden** | Pedido/asignación de vehículo a cliente |
| **Reserva** | Vehículo apartado para un cliente |
| **Asignación** | Vehículo vinculado a una orden específica |
| **Tracking** | Seguimiento de ubicación durante tránsito |
| **Lote** | Grupo de vehículos ingresados juntos |
| **Distribuidor** | Cliente que compra vehículos para reventa |
| **Dealer** | Sinónimo de distribuidor |
| **Stock** | Cantidad de vehículos disponibles |
| **Ubicación** | Localización física del vehículo (almacén, en ruta, entregado) |
| **Dar de baja** | Marcar vehículo como Retired (no disponible) |

## Roles del sistema

- **Administrador del Sistema**: Gestión de usuarios, roles, configuración global
- **Gerente de Inventario**: Alta, baja, modificación de vehículos; control de stock
- **Vendedor/Distribuidor**: Consulta de inventario, reservas, órdenes de compra
- **Transportista/Logistics**: Actualización de tracking, cambio de ubicación
- **Cliente/Dealer**: Consulta de órdenes, tracking de vehículos asignados
- **Auditor**: Solo lectura, acceso a reportes y logs de auditoría

## Plantillas por tipo de US

### Plantilla A — US de CRUD/Formulario

```html
<!-- Descripción -->
<div>Como [rol] quiero [crear/editar/eliminar/visualizar] [entidad] para [beneficio].<br> </div>

<!-- Criterios -->
<ul>
  <li>
    <strong>Escenario 1: [Acción] exitosa con datos válidos</strong><br/><br/>
    Dado que estoy en [pantalla/sección]<br/>
    Cuando completo los campos obligatorios y presiono <strong>[Botón Acción]</strong><br/>
    Entonces se guarda/actualiza el registro<br/>
    Y se muestra mensaje <em>"[Mensaje UI exitoso]"</em><br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Validación de campos obligatorios</strong><br/><br/>
    Dado que estoy en [pantalla/sección]<br/>
    Cuando intento [acción] sin completar los campos marcados con *<br/>
    Entonces se bloquea la acción<br/>
    Y se resaltan los campos faltantes con mensaje de error<br/><br/>
  </li>
  <li>
    <p style="display:inline !important;">Campos obligatorios marcados con *: </p>
  </li>
  <ul>
    <li><strong>VIN</strong> * (17 caracteres alfanuméricos, único). </li>
    <li><strong>Estado</strong> * (selección: Available, Reserved, Sold, InTransit, Retired). </li>
    <li><strong>[Otro campo]</strong> * (validación específica). </li>
  </ul>
  <li>Auditoría: usuario, fecha, campos modificados. </li>
</ul>
```

### Plantilla B — US de Validación

```html
<!-- Descripción -->
<div>Como [rol] quiero que el sistema valide [regla] para [evitar problema o asegurar política].<br> </div>

<!-- Criterios -->
<ul>
  <li>
    <strong>Escenario 1: Validación exitosa</strong><br/><br/>
    Dado que [contexto donde aplica la regla]<br/>
    Cuando intento [acción] con datos que cumplen [regla específica]<br/>
    Entonces la acción se completa exitosamente<br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Validación fallida</strong><br/><br/>
    Dado que [contexto donde aplica la regla]<br/>
    Cuando intento [acción] con datos que NO cumplen [regla específica]<br/>
    Entonces se bloquea la acción<br/>
    Y se muestra mensaje <em>"[Mensaje literal UI explicando el error]"</em><br/><br/>
  </li>
  <li>Registrar intento fallido en auditoría con usuario, fecha, motivo. </li>
</ul>
```

### Plantilla C — US de Workflow/Cambio de Estado

```html
<!-- Descripción -->
<div>Como [rol] quiero [acción del workflow] para [siguiente paso del proceso].<br> </div>

<!-- Criterios -->
<ul>
  <li>
    <strong>Escenario 1: Cambio de estado exitoso</strong><br/><br/>
    Dado que el [entidad] está en estado <strong>[Estado Origen]</strong> y tengo rol <strong>[Rol permitido]</strong><br/>
    Cuando presiono <strong>[Verbo/Acción]</strong> y confirmo en el modal<br/>
    Entonces el estado cambia a <strong>[Estado Destino]</strong><br/>
    Y se muestra mensaje <em>"[Mensaje UI exitoso]"</em><br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Cambio de estado bloqueado por estado incorrecto</strong><br/><br/>
    Dado que el [entidad] está en estado <strong>[Estado No Permitido]</strong><br/>
    Cuando intento presionar <strong>[Verbo/Acción]</strong><br/>
    Entonces el botón NO está visible o está deshabilitado<br/><br/>
  </li>
  <li>
    <p style="display:inline !important;">Modal de confirmación con: </p>
  </li>
  <ul>
    <li>Título: <em>"[Título Modal]"</em>. </li>
    <li>Campo <strong>[Campo]</strong> * (requerido/opcional, X-Y caracteres). </li>
    <li>Botones <strong>Cancelar</strong> y <strong>[Acción]</strong>. </li>
  </ul>
  <li>Notificación a [destinatarios] con asunto: <em>"[Asunto Email]"</em>. </li>
  <li>Auditoría con usuario, fecha, estado origen, estado destino, motivo/observación. </li>
</ul>
```

### Plantilla D — US de Bandeja/Listado

```html
<!-- Descripción -->
<div>Como [rol] quiero visualizar [entidades] en una bandeja para [gestionar/dar seguimiento].<br> </div>

<!-- Criterios -->
<ul>
  <li>
    <strong>Escenario 1: Visualización de bandeja con datos</strong><br/><br/>
    Dado que tengo permisos para ver [entidades]<br/>
    Cuando accedo a [nombre de bandeja/pantalla]<br/>
    Entonces se muestra una tabla con columnas [listar columnas clave]<br/>
    Y cada fila muestra la información del [entidad] con sus acciones disponibles<br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Aplicación de filtros</strong><br/><br/>
    Dado que estoy en la bandeja de [entidades]<br/>
    Cuando selecciono criterios en los filtros disponibles (Estado, rango de fechas, etc.)<br/>
    Entonces la bandeja se actualiza mostrando solo los registros que cumplen los filtros<br/><br/>
  </li>
  <li>
    <p style="display:inline !important;">Columnas: </p>
  </li>
  <ul>
    <li>VIN. </li>
    <li>Estado (con badge de color). </li>
    <li>Marca/Modelo. </li>
    <li>Año. </li>
    <li>Fecha de registro. </li>
    <li>Acciones. </li>
  </ul>
  <li>Paginación: 10/25/50/100 filas por página + "Página X de Y". </li>
  <li>Selección múltiple con indicador <em>"X de Y vehículos seleccionados"</em>. </li>
  <li>Visibilidad respeta el ámbito del rol (ej. Vendedor solo ve vehículos Available y Reserved). </li>
  <li>Ordenamiento por columna (click en encabezado). </li>
</ul>
```

### Plantilla E — US de Tracking/Logística

```html
<!-- Descripción -->
<div>Como [rol] quiero [rastrear/actualizar ubicación] del vehículo para [trazabilidad/informar al cliente].<br> </div>

<!-- Criterios -->
<ul>
  <li>
    <strong>Escenario 1: Actualización de ubicación exitosa</strong><br/><br/>
    Dado que el vehículo está en estado <strong>InTransit</strong> y tengo rol <strong>[Transportista/Logística]</strong><br/>
    Cuando actualizo la ubicación ingresando <strong>Ubicación actual</strong> * y <strong>Observaciones</strong> (opcional)<br/>
    Entonces se guarda la nueva ubicación con timestamp automático<br/>
    Y se envía notificación al <strong>Cliente</strong> con la actualización<br/>
    Y el historial de ubicaciones se actualiza mostrando la más reciente primero<br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Consulta de historial de tracking</strong><br/><br/>
    Dado que soy [Cliente/Gerente] con permisos de consulta<br/>
    Cuando accedo al detalle del vehículo en estado <strong>InTransit</strong><br/>
    Entonces veo el historial completo de ubicaciones en orden cronológico (más reciente primero)<br/>
    Y cada entrada muestra ubicación, fecha/hora, observaciones, usuario<br/><br/>
  </li>
  <li>Auditoría con usuario, fecha, ubicación anterior y nueva. </li>
</ul>
```

## Cómo proceder cuando se invoca este skill

1. **Identifica el módulo** (Vehículo, Inventario, Orden, Logística, etc.) y el **tipo de US** (CRUD, validación, workflow, bandeja, tracking).

2. **Pregunta lo mínimo necesario** si falta contexto crítico — específicamente:
   - ¿Qué rol(es) la ejecutan?
   - ¿En qué estado(s) del vehículo aplica?
   - ¿Hay validaciones específicas (VIN único, año válido, precio, etc.)?
   - ¿Qué notificaciones dispara?
   - ¿Requiere tracking o actualización de ubicación?

3. **Aplica la plantilla** correspondiente y rellena con detalles específicos del dominio de distribución de vehículos.

4. **Genera siempre**: título, descripción HTML, criterios HTML.

5. **Si vas a crear en Azure DevOps**, usa la Organización/Proyecto de `context/CONTEXT.md` § "Organización ADO" (AGENTS.md §2) y el `System.IterationPath` correspondiente. Los campos clave son:
   - `System.Title`
   - `System.IterationPath`
   - `System.Description` (formato Html)
   - `Microsoft.VSTS.Common.AcceptanceCriteria` (formato Html)
   - `Microsoft.VSTS.Common.Priority` (1-4)
   - Vincular a su Feature: `Related Work → Add link → Existing item → Parent`

   Ver tablas completas de Priority y Definition of Ready en `.claude/agents/PO-PRO.agent.md` §9.

6. **Estructura final entregada** al usuario debe ser fácil de leer en chat (Markdown) Y exportable a Azure DevOps (HTML). Si vas a crear directamente en Azure DevOps, no muestres el HTML crudo al usuario — muestra resumen en Markdown y crea con HTML.

## Ejemplo completo de salida — referencia "gold standard"

**Título**: `Vehículo: Validación de VIN único en registro`

**Descripción (HTML)**:
```html
<div>Como Gerente de Inventario quiero que el sistema valide que el VIN sea único para evitar registrar vehículos duplicados en el inventario.<br> </div>
```

**Criterios de aceptación (HTML)**:
```html
<ul>
  <li>
    <strong>Escenario 1: Registro exitoso con VIN único</strong><br/><br/>
    Dado que estoy registrando un nuevo vehículo<br/>
    Cuando ingreso un <strong>VIN</strong> que NO existe en el sistema (17 caracteres alfanuméricos válidos)<br/>
    Entonces el sistema permite continuar con el registro<br/>
    Y se guarda el vehículo exitosamente<br/><br/>
  </li>
  <li>
    <strong>Escenario 2: Registro bloqueado por VIN duplicado</strong><br/><br/>
    Dado que estoy registrando un nuevo vehículo<br/>
    Cuando ingreso un <strong>VIN</strong> que ya existe en el sistema<br/>
    Entonces se bloquea el guardado<br/>
    Y se muestra mensaje <em>"El VIN [VIN] ya está registrado en el sistema (ID: [ID_VEHICULO]). No se puede registrar un vehículo duplicado."</em><br/>
    Y el campo VIN se resalta en rojo con mensaje de error debajo<br/>
    Y el formulario permanece abierto con los datos ingresados<br/><br/>
  </li>
  <li>El intento fallido de registro se registra en auditoría con usuario, fecha, VIN duplicado. </li>
</ul>
```

## Cuándo NO usar este skill

- Cuando el usuario pide otro tipo de documento (especificación técnica detallada, arquitectura, propuesta comercial, presentación).
- Cuando el usuario quiere brainstorm libre sobre ideas de producto sin estructura aún.
- Cuando solo pide buscar o consultar USs existentes en Azure DevOps (es una tarea de consulta, no de redacción).
- Cuando pide crear **Test Cases** (ese es el skill `create-test-cases` o `qa_tester`).

## Referencias adicionales

- Dominio de Motorambar (vocabulario, estados de vehículo, roles): `references/dominio-motorambar.md`.
- Formatos por componente UI (fecha, archivo, tabla, campos de texto, ortografía/gramática): `references/criterios-funcionales-ui.md`.
- Glosario de componentes UI (ES/EN) para nombrar elementos en los criterios: `references/glosario-componentes-ui.md`.
- Checklist de Definition of Done (7 ítems) para el cierre de una US: `references/definition-of-done.md`.
