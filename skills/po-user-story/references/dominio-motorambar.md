# Dominio Motorambar — Sistema de Distribución de Vehículos

Referencia de contexto cuando se redactan USs para el sistema de distribución de vehículos Motorambar (DistributionCar).

## Visión general

Sistema web para gestionar el inventario, ventas y logística de distribución de vehículos. Permite registrar vehículos, asignarlos a clientes/distribuidores, rastrear su ubicación durante el tránsito y mantener trazabilidad completa de todo el ciclo de vida del vehículo desde su ingreso al inventario hasta su venta y entrega final.

## Estados de Vehículo (workflow completo)

```
Available → Reserved → InTransit → Sold
                ↓
            Retired (baja del inventario)
```

**Definición de cada estado:**
- **Available** — Vehículo disponible en inventario para asignación
- **Reserved** — Reservado por un cliente, pendiente de despacho
- **InTransit** — En tránsito hacia el cliente (tracking activo)
- **Sold** — Vendido y entregado al cliente final
- **Retired** — Dado de baja del inventario (daño, devolución, etc.)

**Colores de badge (consistentes en toda la app):**
- Available — verde
- Reserved — amarillo
- InTransit — naranja
- Sold — azul
- Retired — rojo

## Roles del sistema

| Rol | Funciones principales |
|---|---|
| Administrador del Sistema | Gestión de usuarios, roles, permisos, configuración global |
| Gerente de Inventario | Alta, baja y modificación de vehículos; supervisión de stock; reportes |
| Vendedor/Distribuidor | Consulta de inventario, creación de reservas, órdenes de compra |
| Transportista/Logistics | Actualización de tracking, cambio de ubicación, gestión de rutas |
| Cliente/Dealer | Consulta de órdenes asignadas, tracking de vehículos, historial de compras |
| Auditor | Solo lectura en todo el sistema, acceso a logs y reportes de auditoría |

## Reglas de negocio clave

1. **VIN único**: Cada vehículo tiene un VIN de 17 caracteres alfanuméricos que debe ser único en el sistema.
2. **Trazabilidad obligatoria**: Todo cambio de estado, ubicación o asignación queda en auditoría con usuario y fecha.
3. **Validación de estado**: No se puede cambiar estado si hay dependencias activas (ej. no se puede marcar Retired si está en una orden activa).
4. **Tracking en tránsito**: Solo vehículos en estado InTransit pueden tener actualizaciones de ubicación.
5. **Restricción por rol**: Vendedores solo ven vehículos Available y Reserved; Transportistas solo ven InTransit.
6. **Auditoría**: Toda acción crítica queda registrada (CreatedBy, CreatedDate, UpdatedBy, UpdatedDate, IsDeleted).

## Entidades principales

### Vehicle (Vehículo)
- **VIN** (string, 17 chars, unique): Vehicle Identification Number
- **Estado** (enum): Available, Reserved, InTransit, Sold, Retired
- **Marca/Modelo** (opcional, futuro): Make/Model
- **Año** (int, opcional): Año del vehículo
- **Precio** (decimal, opcional): Precio de venta
- **Ubicación actual** (string, opcional): Localización física
- **Auditoría**: CreatedBy, CreatedDate, UpdatedBy, UpdatedDate, IsDeleted

### Orden (futuro)
- ID de orden
- Cliente/Distribuidor asignado
- Vehículo(s) asignados (VIN)
- Estado de la orden
- Fecha de creación, fecha de entrega estimada

### Cliente/Distribuidor (futuro)
- Nombre/Razón social
- Tipo (Dealer, Distribuidor, Cliente final)
- Contacto, email, teléfono
- Historial de órdenes

### Tracking (futuro)
- VehicleId (VIN)
- Ubicación
- Timestamp
- Usuario que registró
- Observaciones

## Vocabulario UI común

- **Bandeja** = listado / inbox / grid
- **Inventario** = stock de vehículos
- **Reservar** = cambiar estado a Reserved
- **Asignar** = vincular vehículo a una orden
- **Despachar** = cambiar a InTransit
- **Entregar** = cambiar a Sold
- **Dar de baja** = cambiar a Retired (soft delete)
- **VIN** = Vehicle Identification Number (17 caracteres)
- **Tracking** = seguimiento de ubicación
- **Estado** = status del vehículo
- **Acciones** = menú de operaciones disponibles (Ver, Editar, Cambiar estado, etc.)

## Stack técnico

- **Backend**: .NET 8 Web API con arquitectura limpia (DDD)
- **Frontend**: Next.js + TypeScript + shadcn/ui
- **BD**: SQL Server + Entity Framework Core
- **Patrón**: CQRS con MediatR
- **Auth**: JWT (futuro) + roles
- **Idioma**: Español (UI) + inglés técnico (código, VIN, estados)

## Mensajes UI más comunes (literales)

### Mensajes de éxito
- `"El vehículo ha sido registrado exitosamente con VIN: [VIN]"`
- `"El estado del vehículo ha sido actualizado a [Estado]"`
- `"Ubicación actualizada correctamente"`
- `"El vehículo ha sido dado de baja exitosamente"`

### Mensajes de error
- `"El VIN [VIN] ya está registrado en el sistema"`
- `"VIN inválido. Debe tener exactamente 17 caracteres alfanuméricos"`
- `"No es posible cambiar el estado. El vehículo ya está asignado a una orden activa"`
- `"No se puede dar de baja un vehículo en estado Sold"`
- `"No tienes permisos para realizar esta acción"`

### Mensajes de validación
- `"Campo VIN es obligatorio"`
- `"El estado seleccionado no es válido"`
- `"Año del vehículo debe estar entre 2000 y 2027"`
- `"Precio debe ser un valor numérico positivo"`

## Notificaciones (asuntos estándar, futuro)

- `"Nuevo vehículo registrado: [VIN]"`
- `"Vehículo reservado: [VIN]"`
- `"Tu vehículo [VIN] ha sido despachado"`
- `"Vehículo [VIN] entregado exitosamente"`
- `"Actualización de ubicación: [VIN] - [Ubicación]"`

## Integraciones futuras (opcional)

- **Geolocalización**: Google Maps / Mapbox para tracking
- **Notificaciones**: SendGrid / AWS SES para emails
- **Reportes**: Power BI / Excel exports
- **Documentos**: PDF generation para facturas, órdenes

## Módulos del sistema (roadmap)

1. ✅ **Vehículos** (actual): CRUD básico, cambio de estado
2. 🚧 **Inventario**: Gestión de stock, alertas de bajo inventario
3. 🚧 **Órdenes**: Creación, asignación, seguimiento de órdenes de compra
4. 🚧 **Clientes**: Registro de distribuidores/dealers, historial
5. 🚧 **Logística**: Tracking en tiempo real, rutas, actualizaciones de ubicación
6. 🚧 **Reportes**: Ventas, inventario disponible, performance por vendedor
7. 🚧 **Usuarios**: Gestión de roles, permisos, autenticación

## Convenciones de código (para contexto técnico)

- **Aggregate Root**: `Vehicle` es un aggregate root con lógica de dominio encapsulada
- **Value Objects**: VIN podría ser un value object (futuro)
- **Eventos de dominio**: Cambios de estado podrían disparar eventos (futuro)
- **Repository pattern**: `IVehicleRepository` para persistencia
- **CQRS**: Queries separadas de Commands (GetAllVehicles, CreateVehicle, etc.)
