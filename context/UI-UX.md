# UI/UX — Mapa de Pantallas

> ⚠️ Este archivo se auto-carga al inicio de cada sesión (vía `@context/UI-UX.md` en `CLAUDE.md`).
> Contiene el mapa de pantallas reales de la aplicación para que el agente redacte Test Cases sin suponer labels, rutas ni comportamientos.

**Cómo se llena:** usa el skill `project-onboarding` — adjunta screenshots de las pantallas y el agente generará una entrada por cada una, guardando la imagen en `context/screenshots/`.

**Regla para el agente:** antes de redactar steps de un TC sobre una pantalla, busca su entrada aquí. Si no existe, NO supongas el diseño — pide un screenshot al usuario o inspecciona la app real vía MCP Browser antes de redactar el TC.

---

## Formato de cada entrada

Copia este bloque por cada pantalla nueva:

```markdown
## [Portal] > [Módulo] > [Nombre de pantalla]
- **Ruta/URL:** ...
- **Cómo se llega aquí:** [pantalla origen + acción/botón exacto]
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | ... | botón | "Guardar" | abre modal de confirmación |
- **Estados:** vacío / con datos / error / loading
- **Screenshot:** ![nombre](screenshots/nombre-pantalla.png)
- **Notas para TCs:** [detalles relevantes]
---
```

---

## Pantallas documentadas

## Autoreg > Login
- **Ruta/URL:** `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx`
- **Cómo se llega aquí:** URL directa — pantalla de entrada al sistema
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Campo Email | input text | placeholder "Email" | entrada de email |
  | Campo Contraseña | input password | placeholder "Contraseña" | entrada de contraseña |
  | Checkbox | checkbox | "Recuérdame" | mantener sesión |
  | Botón Principal | botón | "Iniciar Sesión" | envía credenciales |
  | Link | enlace | "¿Olvidaste tu contraseña?" | recuperación |
- **Estados:** sin datos / con datos / error de validación / autenticando
- **Screenshot:** ![login-autoreg](screenshots/Distribuidor/Login%20desde%20autoreg%20(funciona%20para%20cliente%20o%20distribuidor).png)
- **Notas para TCs:** Tras login exitoso, redirige a menú de Autoreg con apps disponibles según rol
---

## Autoreg > Inicio Post-Login
- **Ruta/URL:** Autoreg (post-login) — Inicio: Bienvenido
- **Cómo se llega aquí:** Tras hacer login exitoso en Autoreg
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Barra Superior | header | Usuario, Rol, Fecha, Balance, "Perfil de Seguridad", "Salida" | info de sesión y acciones globales |
  | Logo | imagen | "portaldevehiculos.com" | branding central |
  | Título Inicio | heading | "Inicio: Bienvenido" | — |
  | Secciones | cards/tarjetas | organizadas por permisos del rol (ej. "Datos y Documentos", "Consultas", "Registros") | agrupan funcionalidades |
  | Botón Portal Distribuidor | botón | "Portal Distribuidor" (dentro de sección "Datos y Documentos") | redirige a Portal Motorambar |
  | Otras opciones | botones | nativas de Autoreg PDV (ej. "Consulta Vehículo", "Registro de Autos Lote", etc.) | funcionalidades de Autoreg |
- **Estados:** según rol del usuario — Distribuidor/Consulta Distribuidor solo ven sección "Datos y Documentos" con botón "Portal Distribuidor"
- **Screenshot:** ![autoreg-post-login](screenshots/Distribuidor/Menu%20en%20autoreg%20post%20login%20+%20boton%20que%20redirige%20a%20Portal%20Distribuidor.png)
- **Notas para TCs:** Las opciones visibles dependen del rol. Solo el botón "Portal Distribuidor" redirige al portal de Motorambar — las demás son funcionalidades nativas de Autoreg PDV.
---

## Portal Distribuidor > Dashboard
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com`
- **Cómo se llega aquí:** Clic en "Portal de Distribución de Vehículos" desde Autoreg
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Dashboard" | — |
  | Tarjetas Resumen | widgets | estadísticas de vehículos | resumen numérico |
  | Botón Reportes | botón | "Generar Reportes" | abre modal/diálogo de reportes |
  | Menú Lateral | sidebar | "Dashboard", "Vehículos", "CPA", "Administración" | navegación principal |
  | Notificación | ícono campana | badge con número | abre panel de notificaciones |
  | Profile | ícono usuario | nombre + rol | menú desplegable de perfil |
- **Estados:** con datos / vacío
- **Screenshot:** ![dashboard-principal](screenshots/Distribuidor/Dashboard%20portal%20distribuidor%20(primera%20pantalla).png)
- **Notas para TCs:** Pantalla inicial del portal, muestra resumen de actividad
---

## Portal Distribuidor > Vehículos Importados
- **Ruta/URL:** `/vehicles` (inferida)
- **Cómo se llega aquí:** Desde menú lateral > Vehículos > Vehículos Importados
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Vehículos Importados" | — |
  | Filtro Fechas | componente filtro | selector de rango de fechas | filtra grid por fecha |
  | Botón "Más Filtros" | botón | "Más Filtros" | expande panel de filtros avanzados |
  | Grid Vehículos | tabla | columnas: VIN, Marca, Modelo, Año, Estado, etc. | listado de vehículos |
  | Expandir VIN | botón + | aparece en cada fila | expande detalle del VIN |
  | Acciones Batch | checkboxes + botón | checkbox por fila + "Acciones" | operaciones masivas |
  | Acciones Individuales | menú 3 puntos | "Ver", "Editar", "Reportar" | por vehículo |
  | Botón "Generar Reportes" | botón | "Generar Reportes" | modal de reportes |
- **Estados:** con datos / vacío / filtrado / con selección batch
- **Screenshot:** ![vehiculos-importados](screenshots/Distribuidor/Pantalla%20Vehiculos%20Importados.png)
- **Notas para TCs:** Pantalla principal de gestión de vehículos. Ver también screenshots de Grid con VIN expandido, Opciones batch, Opciones individuales, Más Filtros expandido
---

## Portal Distribuidor > Vehículos Importados — Grid VIN Expandido
- **Ruta/URL:** `/vehicles` (misma pantalla, estado expandido)
- **Cómo se llega aquí:** Desde Vehículos Importados, clic en botón + de una fila
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Detalle VIN | panel expandido | muestra info adicional del vehículo | se inserta debajo de la fila |
  | Botón Colapsar | botón - | — | colapsa el detalle |
- **Estados:** expandido / colapsado
- **Screenshot:** ![grid-vin-expandido](screenshots/Distribuidor/Grid%20de%20Vehiculos%20Importados%20con%20VIN%20expandido.png)
- **Notas para TCs:** Detalle en línea sin salir del grid
---

## Portal Distribuidor > Vehículos Importados — Más Filtros Expandido
- **Ruta/URL:** `/vehicles` (misma pantalla, panel de filtros expandido)
- **Cómo se llega aquí:** Desde Vehículos Importados, clic en "Más Filtros"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Panel Filtros | panel lateral/superior | campos adicionales de filtro | permite filtrado avanzado |
  | Botón Aplicar | botón | "Aplicar" | aplica filtros al grid |
  | Botón Limpiar | botón | "Limpiar" | resetea filtros |
- **Estados:** expandido / colapsado
- **Screenshot:** ![mas-filtros-expandido](screenshots/Distribuidor/vEHICULOS%20IMPORTADOS%20-%20MAS%20FILTROS%20EXPANDIDO.png)
- **Notas para TCs:** Permite búsquedas complejas
---

## Portal Distribuidor > Ver Vehículo (Detalle)
- **Ruta/URL:** `/vehicles/{id}/view` (inferida)
- **Cómo se llega aquí:** Desde Vehículos Importados, menú 3 puntos > "Ver"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Detalle del Vehículo" o similar | — |
  | Campos de Detalle | inputs read-only | VIN, Marca, Modelo, Año, Color, Cliente, Dealer, etc. | solo lectura |
  | Botón Volver | botón | "Volver" | regresa a grid |
- **Estados:** solo lectura
- **Screenshot:** ![view-vehiculo-1](screenshots/Distribuidor/Pantalla%20view%20es%20para%20ver%20los%20detalles%20de%20un%20vehiculos%20sin%20edicion%20habilitada%20.png), [part-2](screenshots/Distribuidor/Pantalla%20view%20es%20para%20ver%20los%20detalles%20de%20un%20vehiculos%20sin%20edicion%20habilitada%20part%202.png), [part-3](screenshots/Distribuidor/Pantalla%20view%20es%20para%20ver%20los%20detalles%20de%20un%20vehiculos%20sin%20edicion%20habilitada%20part%203.png)
- **Notas para TCs:** Pantalla de solo lectura, sin permisos de edición
---

## Portal Distribuidor > Editar Vehículo
- **Ruta/URL:** `/vehicles/{id}/edit` (inferida)
- **Cómo se llega aquí:** Desde Vehículos Importados, menú 3 puntos > "Editar"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Editar Vehículo" o similar | — |
  | Campos Editables | inputs | mismos campos que View, pero editables según rol | entrada de datos |
  | Botón Guardar | botón | "Guardar" | guarda cambios |
  | Botón Cancelar | botón | "Cancelar" | descarta cambios |
- **Estados:** editando / guardando / error de validación
- **Screenshot:** ![editar-vehiculo](screenshots/Distribuidor/Pantalla%20Editar%20Vehiculos.%20(%20mismas%20opciones%20que%20view%20pero%20aqui%20algunas%20son%20editables%20confirmas%20con%20el%20repo%20cuales%20si%20y%20cuales%20no).png)
- **Notas para TCs:** Confirmar con el repo cuáles campos son editables según rol
---

## Portal Distribuidor > Importar Vehículos
- **Ruta/URL:** `/vehicles/import` (inferida)
- **Cómo se llega aquí:** Desde menú lateral > Vehículos > Importar Vehículos
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Importar Vehículos" | — |
  | Selector Archivo | file input | "Seleccionar archivo" o "Arrastra aquí" | carga archivo Excel/CSV |
  | Botón Importar | botón | "Importar" | inicia proceso de importación |
  | Progreso | barra de progreso | — | muestra % de avance |
- **Estados:** sin archivo / archivo seleccionado / importando / completado / error
- **Screenshot:** ![importar-vehiculos](screenshots/Distribuidor/Pantalla%20Importar%20Vehiculos.png)
- **Notas para TCs:** Validación de formato y datos del archivo
---

## Portal Distribuidor > Historial de Importaciones
- **Ruta/URL:** `/vehicles/history` (inferida)
- **Cómo se llega aquí:** Desde menú lateral > Vehículos > Historial de Importaciones
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Historial de Importaciones" | — |
  | Grid Historial | tabla | columnas: Fecha, Usuario, Archivo, Estado, Registros, etc. | listado de importaciones |
  | Filtros | componente filtro | por fecha, usuario, estado | filtra grid |
- **Estados:** con datos / vacío
- **Screenshot:** ![historial-importaciones](screenshots/Distribuidor/Pantalla%20Historial%20de%20Importaciones%20(se%20refiere%20a%20vehiculos).png)
- **Notas para TCs:** Auditoría de cargas de vehículos
---

## Portal Distribuidor > Importar CPA (Step 1)
- **Ruta/URL:** `/cpa/import` (inferida)
- **Cómo se llega aquí:** Desde menú lateral > CPA > Importar CPA
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Importar CPA" | — |
  | Selector Archivo | file input | "Seleccionar archivo" o "Subir archivo" | carga archivo PDF/Excel |
  | Botón Siguiente | botón | "Siguiente" o "Continuar" | avanza a Step 2 |
  | Stepper | componente | Step 1 activo | indicador de progreso del flujo |
- **Estados:** sin archivo / archivo seleccionado
- **Screenshot:** ![importar-cpa-step1](screenshots/Distribuidor/Pantalla%20Importar%20CPA.png)
- **Notas para TCs:** Primer paso del flujo multi-step
---

## Portal Distribuidor > Importar CPA (Step 2 — Validación)
- **Ruta/URL:** `/cpa/import` (step 2)
- **Cómo se llega aquí:** Desde Importar CPA Step 1, clic en "Siguiente"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Subir archivo" o "Procesando VINs" | — |
  | Stepper | componente | Step 2 activo | indicador de progreso |
  | Mensaje Validación | texto | "Validando datos..." | retroalimentación |
  | Botón Cancelar | botón | "Cancelar Proceso" | aborta importación |
- **Estados:** validando / sin progreso visible
- **Screenshot:** ![importar-cpa-step2](screenshots/Distribuidor/Pantalla%20Importar%20Cpa%20step%202%20.png)
- **Notas para TCs:** Pantalla de transición/validación
---

## Portal Distribuidor > Importar CPA (Step 2 — Con Progreso)
- **Ruta/URL:** `/cpa/import` (step 2 con progreso)
- **Cómo se llega aquí:** Tras validación inicial en Step 2
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Procesando VINs" o "Vinculando VINs" | — |
  | Stepper | componente | Step 2 "PROCESANDO VINS" activo | indicador de progreso |
  | Barra de Progreso | progress bar | muestra % (ej. "33%") | avance del proceso |
  | Mensaje | texto | "1 de 3 páginas" / "Esto puede tomar unos minutos." | retroalimentación |
  | Tarjetas Resumen | cards | "1 COMPLETADOS", "2 PENDIENTES", "0 ERRORES" | contador por estado |
  | Grid Detalle | tabla | columnas: ESTADO, NRO. VIN, NRO. CPA, NRO. CONTRIBUYENTE, CERTIFICACIÓN | detalle de VINs procesados |
  | Botón Cancelar | botón | "Cancelar Proceso" | aborta importación |
- **Estados:** procesando / pausado / completado
- **Screenshot:** ![importar-cpa-step2-progreso](screenshots/Distribuidor/Pantalla%20Importar%20CPA%20STEP%202%20CON%20PROGRESO.png)
- **Notas para TCs:** Muestra progreso en tiempo real con detalle por VIN
---

## Portal Distribuidor > Importar CPA (Step 3 — Resumen)
- **Ruta/URL:** `/cpa/import` (step 3)
- **Cómo se llega aquí:** Tras completar procesamiento en Step 2
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Resumen" | — |
  | Stepper | componente | Step 3 "RESUMEN" activo | indicador de progreso |
  | Mensaje Resultado | alerta/banner | "Proceso completado con advertencias" (amarillo) | retroalimentación final |
  | Tarjetas Resumen | cards | "3 VINS DETECTADOS", "1 VINCULADOS", "0 ERRORES", "2 NO VINCULADOS" | resultados agregados |
  | Grid Detalle | tabla | columnas: ESTADO, NRO. VIN, NRO. CPA, NRO. CONTRIBUYENTE, CERTIFICACIÓN | detalle de cada VIN procesado |
  | Botón "Importar otro" | botón | "Importar otro" | reinicia flujo |
  | Botón "Finalizar" | botón | "Finalizar" | cierra flujo y regresa |
- **Estados:** con advertencias / completado exitosamente / con errores
- **Screenshot:** ![importar-cpa-step3-resumen](screenshots/Distribuidor/Pantalla%20Importar%20CPA%20STEP%203%20rESUMEN.png)
- **Notas para TCs:** Pantalla final del flujo, muestra resultados detallados por VIN
---

## Portal Distribuidor > Historial de CPA
- **Ruta/URL:** `/cpa/history` (inferida)
- **Cómo se llega aquí:** Desde menú lateral > CPA > Historial de CPA
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Historial de CPA" | — |
  | Grid Historial | tabla | columnas: Fecha, Usuario, Archivo, Estado, etc. | listado de importaciones de CPA |
  | Expandir Fila | botón + | — | muestra detalle de la importación |
  | Filtros | componente filtro | por fecha, usuario, estado | filtra grid |
- **Estados:** con datos / vacío / con fila expandida
- **Screenshot:** ![historial-cpa](screenshots/Distribuidor/Pantalla%20Historial%20de%20CPA.png), [con-filas](screenshots/Distribuidor/pANTALLA%20HISTORIAL%20CPA%20CON%20FILAS.png)
- **Notas para TCs:** Auditoría de cargas de CPA
---

## Portal Distribuidor > Reportes (desde Dashboard)
- **Ruta/URL:** modal/diálogo sobre Dashboard
- **Cómo se llega aquí:** Desde Dashboard, clic en "Generar Reportes"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título Modal | heading | "Generar Reportes" | — |
  | Selector Tipo Reporte | dropdown | tipos de reporte disponibles | selección |
  | Filtros | inputs | fecha desde/hasta, estado, etc. | parámetros del reporte |
  | Botón Generar | botón | "Generar" | crea el reporte |
  | Botón Cancelar | botón | "Cancelar" | cierra modal |
- **Estados:** seleccionando / generando / descargando
- **Screenshot:** ![generar-reportes-dashboard](screenshots/Distribuidor/gENERAR%20REPORTES%20DESDE%20DASHBOARD.png)
- **Notas para TCs:** Generación de reportes desde contexto Dashboard
---

## Portal Distribuidor > Reportes (desde Vehículos Importados)
- **Ruta/URL:** modal/diálogo sobre Vehículos Importados
- **Cómo se llega aquí:** Desde Vehículos Importados, clic en "Generar Reportes"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título Modal | heading | "Generar Reportes" | — |
  | Selector Tipo Reporte | dropdown | tipos de reporte disponibles | selección |
  | Filtros | inputs | fecha desde/hasta, estado, etc. | parámetros del reporte |
  | Botón Generar | botón | "Generar" | crea el reporte |
  | Botón Cancelar | botón | "Cancelar" | cierra modal |
- **Estados:** seleccionando / generando / descargando
- **Screenshot:** ![generar-reportes-vehiculos](screenshots/Distribuidor/Generar%20reportes%20desde%20Vehiculos%20Importados.png)
- **Notas para TCs:** Generación de reportes desde contexto Vehículos
---

## Componentes Globales > Menú Lateral (Expandido)
- **Ruta/URL:** presente en todas las pantallas del portal
- **Cómo se llega aquí:** clic en ícono de menú o hamburguesa
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Logo | imagen | "portaldevehículos" | branding |
  | Texto "PORTAL DISTRIBUIDOR" | label | "PORTAL DISTRIBUIDOR" | identificador de app |
  | Sección "ADMIN" | grupo | "ADMIN" | agrupación de opciones admin |
  | Item "Dashboard" | link | "Dashboard" | navega a dashboard |
  | Grupo "Vehículos" | grupo expandible | "Vehículos" + ícono chevron | expande/colapsa |
  | Subitem "Vehículos Importados" | link | "Vehículos Importados" | navega |
  | Subitem "Importar Vehículos" | link | "Importar Vehículos" | navega |
  | Subitem "Historial de Importaciones" | link | "Historial de Importaciones" | navega |
  | Grupo "CPA" | grupo expandible | "CPA" + ícono chevron | expande/colapsa |
  | Subitem "Importar CPA" | link | "Importar CPA" | navega |
  | Subitem "Historial de CPA" | link | "Historial de CPA" | navega |
  | Item "Administración" | link | "Administración" (solo SysAdmin) | navega |
  | Botón Colapsar | botón | ícono chevron izquierda | colapsa menú |
- **Estados:** expandido / colapsado / opción seleccionada / hover
- **Screenshot:** ![menu-expandido](screenshots/Distribuidor/Menu%20izquierdo%20con%20opciones%20expandidas.png), [opciones-colapsadas](screenshots/Distribuidor/Menu%20izquierdo%20con%20opciones%20colapsadas.png)
- **Notas para TCs:** Navegación principal del portal
---

## Componentes Globales > Menú Lateral (Colapsado)
- **Ruta/URL:** presente en todas las pantallas del portal
- **Cómo se llega aquí:** clic en botón colapsar del menú expandido
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Logo Mini | ícono | ícono portaldevehículos | branding reducido |
  | Íconos | íconos | solo íconos sin texto | navegación |
  | Hover | tooltip | muestra nombre al pasar mouse | retroalimentación |
  | Botón Expandir | botón | ícono chevron derecha | expande menú |
- **Estados:** colapsado / opción seleccionada / hover
- **Screenshot:** ![menu-colapsado](screenshots/Distribuidor/Menu%20izquiedo%20colapsado.png), [opcion-seleccionada](screenshots/Distribuidor/Menu%20colapsado%20opcion%20seleccionada.png), [hover](screenshots/Distribuidor/hover%20en%20opcion%20de%20menu%20colapsado%20muestra%20opciones%20sin%20expandir%20menu.png)
- **Notas para TCs:** Menú reducido para maximizar espacio de trabajo
---

## Componentes Globales > Notificaciones
- **Ruta/URL:** panel flotante sobre cualquier pantalla
- **Cómo se llega aquí:** clic en ícono campana en header
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "NOTIFICACIONES" | — |
  | Badge Contador | badge | número (ej. "132") | cantidad no leídas |
  | Lista Notificaciones | lista | título + descripción + fecha por notificación | scroll de notificaciones |
  | Ejemplo Notificación | item | "Documentos enviados a PDV" + "Se enviaron X documentos a PDV al 13/07/2026" + "12:27" | notificación individual |
  | Botón "Marcar leída" | ícono check | — | marca como leída |
  | Link "Marcar todas" | link | "Marcar todas" (en footer) | marca todas como leídas |
- **Estados:** con notificaciones no leídas / todas leídas / vacío
- **Screenshot:** ![componente-notificaciones](screenshots/Distribuidor/Componente%20de%20notificaciones.png)
- **Notas para TCs:** Panel desplegable desde header
---

## Componentes Globales > Profile
- **Ruta/URL:** menú desplegable sobre cualquier pantalla
- **Cómo se llega aquí:** clic en ícono de usuario en header
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Nombre Usuario | texto | ej. "Case Plus Admin" | identificación |
  | Rol | badge | ej. "ADMINISTRADOR DEL SISTEMA" | rol activo |
  | Opción Perfil | link | "Mi Perfil" | navega a perfil |
  | Opción Configuración | link | "Configuración" | navega a configuración |
  | Opción Cerrar Sesión | link | "Cerrar Sesión" | logout |
- **Estados:** menú abierto / cerrado
- **Screenshot:** ![profile-abierto](screenshots/Distribuidor/Al%20abrir%20el%20profile.png)
- **Notas para TCs:** Menú de usuario en header
---

## Componentes Globales > Filtro por Fechas
- **Ruta/URL:** componente usado en varias pantallas (Vehículos, Historial, etc.)
- **Cómo se llega aquí:** presente en header de grids con datos temporales
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Campo Desde | date picker | "Desde" | selección fecha inicio |
  | Campo Hasta | date picker | "Hasta" | selección fecha fin |
  | Calendario | componente | calendario visual con selección de rango | selector de fechas |
  | Botón Aplicar | botón | "Aplicar" | filtra datos por rango |
- **Estados:** sin selección / con rango seleccionado / selección activa
- **Screenshot:** ![componente-filtro-fechas](screenshots/Distribuidor/Conmponente%20filtro%20por%20fechas.png), [con-seleccion](screenshots/Distribuidor/Componente%20fecha%20con%20seleccion%20activa.png)
- **Notas para TCs:** Componente reutilizable de filtrado temporal
---

## Portal Distribuidor > Administración > Tenants (Gestión)
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Tenants")
- **Cómo se llega aquí:** Desde menú lateral > Administración (solo SysAdmin), tab "Tenants"
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Tenants" | cambia entre secciones admin |
  | Botón "+ NUEVO TENANT" | botón | "+ NUEVO TENANT" | abre modal/formulario de creación |
  | Grid Tenants | tabla | columnas: NOMBRE, UBICACIÓN, FECHA CREACIÓN, ACCIONES | listado de tenants |
  | Ejemplo Fila | row | "Mitsubishi" / — / "29/4/2026" / íconos editar/eliminar | tenant individual |
  | Acciones | íconos | lápiz (editar) / papelera (eliminar) | por tenant |
- **Estados:** con datos / vacío / creando / editando
- **Screenshot:** ![admin-tenants](screenshots/Distribuidor/Pantalla%20de%20administración%20.png)
- **Notas para TCs:** Gestión de tenants/organizaciones del sistema
---

## Portal Distribuidor > Administración > Usuarios
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Usuarios")
- **Cómo se llega aquí:** Desde Administración, dropdown > Usuarios
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Usuarios" | seleccionado |
  | Grid Usuarios | tabla | columnas: USUARIO, NOMBRE COMPLETO, ROL, SESIÓN, ACCIONES | listado de usuarios |
  | Ejemplo Fila | row | "a.distribuidor" / "Adrian Distribuidor" / "roles.distributor" / "Activa" (verde) / ícono acción | usuario individual |
  | Estado Sesión | badge | "Activa" (verde) / "Sin sesión" (gris) | estado de login |
  | Acciones | ícono | ícono círculo con acción | por usuario |
- **Estados:** con datos / vacío / filtrando
- **Screenshot:** ![admin-usuarios](screenshots/Distribuidor/Pantalla%20Usuarios.png)
- **Notas para TCs:** Gestión de usuarios y roles del sistema
---

## Portal Distribuidor > Administración > Favoritos
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/sso-login` (tab "Favoritos")
- **Cómo se llega aquí:** Desde Administración, dropdown > Favoritos
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Favoritos" | seleccionado |
  | Botón "+ NUEVO FAVORITO" | botón | "+ NUEVO FAVORITO" | agrega favorito |
  | Sección "CLIENTE PADRE" | label | "CLIENTE PADRE" | agrupación |
  | Lista Favoritos | lista | ej. "TOYOTA CREDIT", "ADRIEL KA", "HENRY MOTORS INCORPORATED" | items favoritos |
  | Columna "ACCIONES" | columna | íconos eliminar por item | eliminar favorito |
- **Estados:** con datos / vacío
- **Screenshot:** ![admin-favoritos](screenshots/Distribuidor/Pantalla%20Favoritos.png)
- **Notas para TCs:** Gestión de clientes/entidades favoritas
---

## Portal Distribuidor > Administración > Firma Digital
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Firma Digital")
- **Cómo se llega aquí:** Desde Administración, dropdown > Firma Digital
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Firma Digital" | seleccionado |
  | Selector Tenant | dropdown | "Seleccionar... Tenant" con opción "Motorambar" | filtra por tenant |
  | Sección "Firma Digital Activa" | card | muestra firma activa con preview | firma vigente |
  | Archivo Activo | file info | "sign.png" + "sign-png" + "905.84 KB" + fecha + firma | detalles del archivo |
  | Botón "VISTA PREVIA" | botón | "VISTA PREVIA" | abre imagen |
  | Botón "DESCARGAR" | botón | "DESCARGAR" | descarga archivo |
  | Botón "+ CARGAR NUEVA FIRMA" | botón | "+ CARGAR NUEVA FIRMA" | sube nueva firma |
  | Sección "Historial de Firmas" | tabla | columnas: ARCHIVO, FIRMANTE, TAMAÑO, ESTADO, FECHA, CREADO POR, ACCIONES | historial |
  | Ejemplo Fila Historial | row | "sign.png" / firma / "905.84 KB" / "ACTIVA" (verde) / fecha / "Case Plus Admin" / íconos vista/descarga | firma histórica |
  | Paginación | paginador | "MOSTRANDO 1-5 DE 7 REGISTROS" + controles | navegación de páginas |
- **Estados:** con firma activa / sin firma / cargando / historial
- **Screenshot:** ![admin-firma-digital](screenshots/Distribuidor/Pantalla%20Firma%20Digital.png)
- **Notas para TCs:** Gestión de firmas digitales por tenant
---

## Portal Distribuidor > Administración > Notificaciones Diarias
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Notificaciones Diarias")
- **Cómo se llega aquí:** Desde Administración, dropdown > Notificaciones Diarias
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Notificaciones Diarias" | seleccionado |
  | Label Tenant | label | "Tenant" | — |
  | Selector Tenant | dropdown | "Motorambar" | selecciona tenant |
  | Sección Configuración | card | "Configuración de reporte diario" | config de email |
  | Campo "HORA DE ENVÍO" | time picker | "12:59" (HORA LOCAL) | hora de envío |
  | Explicación | texto | "El reporte se enviará automáticamente a esta hora según tu zona horaria local." | ayuda |
  | Campo "IDIOMA DEL TEMPLATE" | dropdown | "Español" | idioma del email |
  | Explicación Idioma | texto | "Determina el idioma del template sembrado al crear la configuración." | ayuda |
  | Campo "DESTINATARIOS (TO)" | textarea | "jmartinez@portaldevehiculos.com" | emails destinatarios |
  | Explicación Destinatarios | texto | "Separar múltiples emails con comas." | ayuda |
  | Campo "COPIA (CC)" | textarea | "copia@empresa.com" (placeholder) | emails en copia |
  | Toggle "Activo" | switch | "Activo" | habilita/deshabilita envío |
  | Explicación Template | texto | "El template HTML se gestiona desde 'Plantillas Email. Key: daily-activity-report...'" | referencia |
  | Botón "Guardar" | botón | "Guardar" | guarda configuración |
  | Botón "Enviar prueba" | botón | "Enviar prueba" | envía email de test |
  | Info Último Envío | texto | "Último envío: 13/7/2026, 12:59:46" | historial |
- **Estados:** activo / inactivo / guardando / enviando prueba
- **Screenshot:** ![admin-notificaciones-diarias](screenshots/Distribuidor/Pantalla%20Notificaciones%20diarias.png)
- **Notas para TCs:** Configuración de reportes diarios automáticos por email
---

## Portal Distribuidor > Administración > Plantilla CO (Certificado de Origen)
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Plantilla CO")
- **Cómo se llega aquí:** Desde Administración, dropdown > Plantilla CO
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Plantilla CO" | seleccionado |
  | Label Tenant | label | "Seleccionar... Tenant" | — |
  | Selector Tenant | dropdown | "Motorambar" | selecciona tenant |
  | Sección "Plantilla CO Activa" | card | muestra plantilla activa | plantilla vigente |
  | Archivo Activo | file info | "template-form.pdf" + "19.67 MB" + fecha + "Razón del cambio: nueva plantilla" | detalles |
  | Botón "VISTA PREVIA" | botón | "VISTA PREVIA" | abre PDF |
  | Botón "DESCARGAR" | botón | "DESCARGAR" | descarga archivo |
  | Botón "+ CARGAR NUEVA PLANTILLA" | botón | "+ CARGAR NUEVA PLANTILLA" | sube nueva plantilla |
  | Sección "Historial de Plantillas" | tabla | columnas: ARCHIVO, TAMAÑO, ESTADO, FECHA, CREADO POR, ACCIONES | historial |
  | Ejemplo Fila Historial | row | "template-form.pdf" / "19.67 MB" / "ACTIVA" (verde) / fecha / "Case Plus Admin" / íconos vista/descarga/refresh | plantilla histórica |
  | Paginación | paginador | "MOSTRANDO 1-3 DE 3 REGISTROS" + controles | navegación |
- **Estados:** con plantilla activa / sin plantilla / cargando / historial
- **Screenshot:** ![admin-plantilla-co](screenshots/Distribuidor/Pantalla%20Plantilla%20CO%20(Certificado%20de%20Origen).png)
- **Notas para TCs:** Gestión de templates de Certificado de Origen por tenant
---

## Portal Distribuidor > Administración > Plantilla de Importación
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Plantilla de Importación")
- **Cómo se llega aquí:** Desde Administración, dropdown > Plantilla de Importación
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Plantilla de Importación" | seleccionado |
  | Label Tenant | label | "Seleccionar... Tenant" | — |
  | Selector Tenant | dropdown | "Motorambar" | selecciona tenant |
  | Sección "Configuración de Importación" | tabla | mapeo propiedad → columna Excel → valor por defecto | configuración de mapeo |
  | Explicación | texto | "Personaliza los nombres de las columnas del archivo Excel que usa tu empresa para importar vehículos." | ayuda |
  | Ejemplo Fila | row | "Address Line1" / "AddressLine1" / "AddressLine1" / ícono acción | mapeo individual |
  | Columnas Tabla | headers | "PROPIEDAD DEL VEHÍCULO", "COLUMNA EN EXCEL", "VALOR POR DEFECTO", "ACCIONES" | estructura |
  | Botón "Restaurar Todo" | botón | "Restaurar Todo" | resetea a valores por defecto |
  | Botón "Guardar Cambios" | botón | "Guardar Cambios" | guarda configuración |
- **Estados:** editando / guardando / por defecto
- **Screenshot:** ![admin-plantilla-importacion](screenshots/Distribuidor/Pantalla%20Plantilla%20de%20Importacion.png)
- **Notas para TCs:** Configuración de mapeo de columnas Excel para importación de vehículos
---

## Portal Distribuidor > Administración > Reglas de Completitud
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/admin` (tab "Reglas de Completitud")
- **Cómo se llega aquí:** Desde Administración, dropdown > Reglas de Completitud
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Título | heading | "Administración" | — |
  | Dropdown Tab | selector | "Reglas de Completitud" | seleccionado |
  | Explicación | texto | "Define qué documentos deben estar asociados a un vehículo para que se considere completo, por tenant." | ayuda |
  | Botón "+ NUEVA REGLA" | botón | "+ NUEVA REGLA" | crea regla |
  | Grid Reglas | tabla | columnas: TENANT, ESTADO, CO, CPA, FACTURA, AGRUPAR CL#, FECHA, ACCIONES | listado de reglas |
  | Ejemplo Fila | row | "Motorambar" / "Activo" (verde) / check verde "CO" / check verde "CPA" / vacío "Factura" / check azul "Agrupar CL#" / "11/7/2026" / íconos editar/eliminar | regla individual |
  | Checks Documentos | checks | checks verdes o azules por documento requerido | requerimientos |
  | Estado | badge | "Activo" | habilitada/deshabilitada |
- **Estados:** con reglas / vacío / creando / editando
- **Screenshot:** ![admin-reglas-completitud](screenshots/Distribuidor/Pantalla%20Reglas%20de%20Completitud.png)
- **Notas para TCs:** Configuración de validaciones de documentos por tenant
---

## Portal Distribuidor > Acceso Bloqueado (Token Revocado)
- **Ruta/URL:** `https://motorambartest.portaldevehiculos.com/sso-login`
- **Cómo se llega aquí:** Al intentar acceder al portal con token revocado o sesión inválida
- **Elementos clave:**
  | Elemento | Tipo | Texto/label literal | Comportamiento |
  |---|---|---|---|
  | Logo | imagen | "portaldevehículos .com" | branding |
  | Ícono | imagen | candado rojo | indicador de bloqueo |
  | Título | heading | "Acceso bloqueado" | mensaje principal |
  | Mensaje | texto | "Para acceder a esta aplicación debes autenticarte correctamente a través de Autoreg." | explicación |
  | Alerta Error | banner rojo | "El token ha sido revocado o es inválido" | causa técnica |
  | Alerta Advertencia | banner amarillo | "No puedes navegar en la aplicación sin una sesión válida de Autoreg." | restricción |
  | Botón | botón | "Ir a Portal de Vehículos" | redirige a Autoreg |
  | Selector Idioma | selector | "English" | cambio de idioma |
  | Footer | texto | "AUTOREG LLC. © 2026" | copyright |
- **Estados:** bloqueado por token / bloqueado por sesión
- **Screenshot:** ![acceso-bloqueado-token](screenshots/Distribuidor/Pantalla%20acceso%20bloqueado%20(por%20token%20revocado).png), [acceso-bloqueado-general](screenshots/Distribuidor/Pantalla%20de%20acceso%20bloqueado.png)
- **Notas para TCs:** Pantalla de seguridad cuando la sesión no es válida
---
