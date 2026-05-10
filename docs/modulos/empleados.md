# Módulo: Empleados

## Lenguaje ubicuo del módulo

Este módulo usa los siguientes términos del negocio (lenguaje ubicuo):

| Término técnico    | Lenguaje del negocio |
|--------------------|---------------------|
| `empleado`         | Persona que trabaja en La Rivera y tiene acceso al sistema de gestión |
| `rol`              | Función del empleado en la tienda. Define exactamente qué operaciones puede realizar |
| `admin`            | Administrador del sistema. Puede gestionar empleados, roles y configuración general |
| `propietario`      | Dueño de la tienda. Acceso total: reportes, configuración, gestión de inventario y empleados |
| `bodeguero`        | Gestiona el inventario físico. Puede registrar entradas de mercancía y bajas |
| `vendedor`         | Opera en el mostrador. Puede registrar salidas/ventas al cliente |
| `pendiente`        | Empleado recién registrado que aún no tiene rol asignado. No puede operar el sistema |
| `estado activo`    | El empleado puede iniciar sesión y operar el sistema según su rol |
| `estado inactivo`  | El empleado no puede iniciar sesión. Útil para suspensiones temporales sin eliminar el registro |
| `auth_id`          | Identificador del empleado en MongoDB (sistema de autenticación) |
| `id_empleado`      | Identificador del empleado en MySQL (sistema de negocio). Se usa en trazabilidad de movimientos |
| `cédula`           | Documento de identidad del empleado. Identificador único en el mundo real |
| `asignación de rol`| Acto de darle una función a un empleado pendiente para que pueda operar |
| `acceso`           | Combinación de rol + estado activo que permite a un empleado usar el sistema |

## Roles del sistema

| Rol          | Prefijo CSS     | Puede hacer |
|--------------|-----------------|-------------|
| `admin`      | `--admin`       | Gestionar empleados, asignar roles, ver todos los módulos |
| `propietario`| `--propietario` | Todo lo del admin + configuración de la tienda + reportes financieros |
| `bodeguero`  | `--bodeguero`   | Registrar entradas y bajas de inventario, consultar stock |
| `vendedor`   | `--vendedor`    | Registrar salidas/ventas, consultar disponibilidad |
| `pendiente`  | `--pendiente`   | Sin acceso operativo hasta que admin asigne un rol |

## Estados del empleado

| Estado     | Valor DB | Descripción |
|------------|----------|-------------|
| `activo`   | `1`      | Puede iniciar sesión y operar según su rol |
| `inactivo` | `0`      | No puede iniciar sesión. Registro conservado para historial |

## Reglas de negocio

1. Un empleado nuevo llega siempre como `pendiente` — no puede registrar ningún movimiento.
2. Solo `admin` y `propietario` pueden cambiar el rol y estado de un empleado.
3. No se eliminan empleados del sistema — se desactivan (estado inactivo) para mantener la trazabilidad de movimientos históricos.
4. Un empleado puede tener un solo rol activo a la vez.
5. El `id_empleado` (MySQL) es el que se guarda en los movimientos de inventario para trazabilidad. El `auth_id` (MongoDB) solo se usa para autenticación.

## Flujo típico de alta de empleado

```
Empleado se registra → estado: pendiente
       ↓
Admin ve la fila destacada (.emp-fila--pendiente)
       ↓
Admin abre el modal → asigna rol → guarda
       ↓
Empleado puede operar según su rol
```

## Arquitectura CSS

```
atoms/    _db-etiqueta.css         → badges de rol (--admin, --propietario, --bodeguero, --vendedor, --pendiente)
                                     + estado (--activo, --inactivo)
          _db-avatar-empleado.css  → avatar circular coloreado por rol
          _db-campo.css            → campos del modal de edición

molecules/ _db-barra-filtros.css   → filtros de rol, estado y pendientes
           _db-tabla-datos.css     → tabla de empleados
           _db-celda-empleado.css  → celda avatar + nombre + email

organisms/ _db-tarjeta-vista.css   → card principal de la vista

views/    _usuarios-view.css       → composición específica:
            .emp-dialogo           → modal overlay
            .emp-dialogo__contenido, __encabezado, __titulo
            .emp-dialogo__cerrar, __cuerpo, __pie
            .emp-dialogo__perfil   → strip del empleado en modal
            .emp-fila--pendiente   → highlight de filas sin rol
```

## IDs relevantes para JS

| ID                          | Elemento                                  |
|-----------------------------|-------------------------------------------|
| `tablaEmpleados`            | `<tbody>` de la tabla de empleados        |
| `estadoCargaEmpleados`      | Texto de estado/conteo de la tabla        |
| `btnRecargarEmpleados`      | Botón recargar tabla                      |
| `btnAplicarFiltrosEmpleados`| Botón aplicar filtros                     |
| `btnLimpiarFiltrosEmpleados`| Botón limpiar filtros                     |
| `filtroRolEmpleado`         | Select de filtro por rol                  |
| `filtroEstadoEmpleado`      | Select de filtro por estado               |
| `filtroSoloPendientes`      | Checkbox "solo pendientes de asignación"  |
| `modalEmpleado`             | Contenedor del modal (display flex/none)  |
| `formEmpleado`              | Formulario del modal                      |
| `empId`                     | Input hidden con el id del empleado       |
| `empRol`                    | Select de rol en el modal                 |
| `empEstado`                 | Select de estado en el modal              |
| `empNombreLabel`            | Label con nombre del empleado en el modal |
| `empEmailLabel`             | Label con email del empleado en el modal  |
| `btnCancelarEmpleado`       | Botón cerrar modal                        |
