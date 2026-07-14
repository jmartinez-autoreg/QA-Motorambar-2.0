# Contexto del Proyecto

> ⚠️ Este archivo se auto-carga al inicio de cada sesión (vía `@context/CONTEXT.md` en `CLAUDE.md`).
> Completa cada sección con los datos reales del proyecto — el agente lo usa como **fuente de verdad** para TCs, USs y ejecución.
> NUNCA inventar datos de esta sección: si falta información, preguntar al usuario o usar el skill `project-onboarding`.

---

## Configuración del Agente

> Usado por el skill `activity-logger` (fecha/hora local + carpetas de bitácora), por la regla de
> idioma de interacción (AGENTS.md §8.9) y por el comando "actualiza el template" (AGENTS.md §6.1).
> Se completa una vez con `project-onboarding`, o se pregunta cuando se necesita por primera vez.

| Campo | Valor |
|-------|-------|
| Idioma de interacción | `Español` |
| Zona horaria | `America/Santo_Domingo (UTC-4)` |
| Sprint actual | `Entregable 5` |
| Ruta local de QA-TOOLS-TEMPLATE | `C:\Users\Jhon Martinez\Documents\IA\QA-TOOLS-TEMPLATE` |
| Ruta local de estándares oficiales | `C:\Users\Jhon Martinez\Documents\IA\QA Informaciones\Estándares y Procesos` |

> Actualiza "Sprint actual" al iniciar cada sprint nuevo — define el nombre de carpeta de la bitácora.
> "Ruta local de estándares oficiales" apunta a la carpeta con los documentos de la empresa
> (PROC-QA-*, GUÍA-QA-*, ceremoniales) — usada por AGENTS.md §8.13 para verificar convenciones
> antes de asumir que no existen. Si hay subcarpeta `markdown_output/`, preferirla (búsqueda por
> texto); ante extracción incompleta, ir al PDF original.

---

## Portales y URLs

| Portal | URL (Test) | URL (Pre-Prod) | Descripción |
|--------|-----|-----|-------------|
| **Autoreg** | `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx` | `https://pdvpreprod.portaldevehiculos.com/Forms/Account/LoginNew.aspx` | Login centralizado para acceso a todos los portales |
| **Portal Distribuidor** | `https://motorambartest.portaldevehiculos.com` | _(pendiente)_ | Portal principal de distribución de vehículos — Dashboard, Importación de Vehículos, Importación de CPA, Historial, Reportes |

---

## Login — Flujos Conocidos

### Login via Autoreg (unificado para todos los roles)
- **URL:** `https://testwaf.portaldevehiculos.com/Forms/Account/LoginNew.aspx`
- **Campos:** Email, Contraseña, checkbox "Recuérdame"
- **Botón:** "Iniciar Sesión"
- **Tras login exitoso:** redirige a página de Autoreg con menú lateral que muestra las apps disponibles según el rol del usuario
- **Acceso a Portal Distribuidor:** desde el menú de Autoreg, clic en botón "Portal de Distribución de Vehículos" o ícono correspondiente → abre `https://motorambartest.portaldevehiculos.com`
- **Pantalla bloqueada:** si el token de sesión es revocado o caduca, se muestra "Acceso Bloqueado" con mensaje de contactar al administrador

---

## Roles y Permisos

| Rol | Permisos / Pantallas disponibles |
|-----|-----------------------------------|
| **Distribuidor** | Dashboard, Vehículos Importados, Importar Vehículos, Importar CPA, Historial de Importaciones, Historial de CPA, Editar/Ver Vehículos, Reportes, Notificaciones |
| **Cliente (Dealer)** | ⚠️ **PENDIENTE** — documentar qué pantallas/acciones tienen acceso |
| **Cliente (Banco)** | ⚠️ **PENDIENTE** — documentar qué pantallas/acciones tienen acceso |
| **SysAdmin** | Todas las pantallas + sección de Administración (Usuarios, Plantillas de Importación, Plantilla CO, Reglas de Completitud, Firma Digital, Favoritos, Notificaciones Diarias) |

> **Nota:** Los 4 roles están definidos en el repo del proyecto. Para documentar los roles Cliente, navegar la app con esos usuarios o consultar el código en `C:\Users\Jhon Martinez\Documents\Motorambar\Project\Motorambar`.

---

## Pantallas Principales

- **Dashboard** — Pantalla inicial con resumen de vehículos importados, estadísticas y acceso rápido a generación de reportes
- **Vehículos Importados** — Grid con todos los vehículos importados, filtros avanzados (por fechas, VIN, estado), acciones batch e individuales (Editar, Ver, Reportar), expansión de VIN
- **Importar Vehículos** — Flujo de carga masiva de vehículos (archivo Excel/CSV) con validación y progreso
- **Importar CPA** — Flujo multi-step (selección de archivo → progreso → resumen) para importar Certificados de Pre-Autorización
- **Historial de Importaciones** — Registro histórico de todas las importaciones de vehículos realizadas
- **Historial de CPA** — Registro histórico de todas las importaciones de CPA con filas de detalle
- **Editar/Ver Vehículo** — Pantalla de detalle de un vehículo, con modo Vista (solo lectura) y modo Edición (campos editables según rol)
- **Reportes** — Generación de reportes desde Dashboard o Vehículos Importados
- **Administración** (solo SysAdmin) — Gestión de tenants, usuarios, plantillas, reglas de completitud, firma digital, favoritos, notificaciones diarias

---

## Módulos del Sistema

- **Dashboard** — Pantalla inicial con resumen y accesos rápidos
- **Vehículos** — Gestión completa: importar, listar, editar, historial
- **CPA** — Importación y historial de Certificados de Pre-Autorización
- **Administración** — Gestión de configuración del sistema (solo SysAdmin)
- **Reportes** — Generación de reportes desde diferentes contextos

---

## Organización ADO

- **Organización:** `AutoregPR`
- **Proyecto:** `Motorambar`
- **URL:** `https://dev.azure.com/AutoregPR/Motorambar`
- **Usuario QA:** `jhon.martinez@autoregpr.com`

---

## Terminología Literal (NO cambiar nombres)

| Término en sistema | Descripción |
|--------------------|-------------|
| `CPA` | Certificado de Pre-Autorización |
| `CO` | Certificado de Origen |
| `VIN` | Vehicle Identification Number (Número de Identificación del Vehículo) |
| `Vehículos Importados` | Listado principal de vehículos en el sistema |
| `Importar Vehículos` | Módulo de carga masiva de vehículos |
| `Importar CPA` | Módulo de carga de Certificados de Pre-Autorización |
| `Historial de Importaciones` | Registro histórico de cargas de vehículos |
| `Historial de CPA` | Registro histórico de cargas de CPA |
| `Dashboard` | Pantalla inicial con resumen y accesos rápidos |
| `Distribuidor` | Rol principal de usuario (distribuidora de vehículos) |
| `Cliente (Dealer)` | Rol de cliente tipo concesionario |
| `Cliente (Banco)` | Rol de cliente tipo institución bancaria |
| `SysAdmin` | Rol de administrador del sistema |
| `Reglas de Completitud` | Configuración de validaciones de datos de vehículos |
| `Plantilla de Importación` | Template para carga de vehículos |
| `Plantilla CO` | Template para Certificado de Origen |

---

## Tecnología

- **Frontend Portal Distribuidor:** React + Next.js
- **Backend:** .NET
- **Base de Datos:** PostgreSQL
- **Infraestructura:** Azure (completo)
- **Repo local:** `C:\Users\Jhon Martinez\Documents\Motorambar\Project\Motorambar`
