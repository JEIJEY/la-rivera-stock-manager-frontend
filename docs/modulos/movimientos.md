# Módulo: Movimientos de Inventario

## Lenguaje ubicuo del módulo

Este módulo usa los siguientes términos del negocio (lenguaje ubicuo):

| Término técnico    | Lenguaje del negocio |
|--------------------|---------------------|
| `movimiento`       | Cualquier cambio registrado en el stock de un producto |
| `entrada`          | Mercancía que llega al inventario: compra a proveedor, devolución de cliente, ajuste positivo |
| `salida`           | Producto que sale del inventario: venta al mostrador, traslado, consumo interno |
| `baja`             | Pérdida de producto no recuperable: caducidad, daño/rotura, robo. Queda en historial de auditoría |
| `stock anterior`   | Cantidad en inventario ANTES de registrar el movimiento |
| `stock nuevo`      | Cantidad en inventario DESPUÉS de registrar el movimiento |
| `trazabilidad`     | Capacidad de ver quién registró cada movimiento, cuándo y por qué |
| `motivo`           | Razón específica de una baja (caducidad, daño, robo, otro) |
| `observación`      | Nota libre que el empleado agrega para mayor contexto |
| `id_empleado`      | Identificador del empleado en el sistema de negocio (MySQL), distinto del auth_id de MongoDB |
| `rol`              | Función del empleado en la tienda. Define qué operaciones puede hacer |
| `bodeguero`        | Empleado que gestiona el inventario físico. Puede registrar entradas y bajas |
| `vendedor`         | Empleado en mostrador. Puede registrar salidas/ventas |
| `propietario`      | Dueño de la tienda. Acceso total a reportes y configuración |
| `pendiente`        | Empleado recién registrado, sin rol asignado. No puede operar hasta que admin le asigne rol |

## Tipos de movimiento

### Entrada
Incrementa el stock de un producto. Se usa para:
- Compras a proveedores (con número de factura en la observación)
- Devoluciones de clientes
- Ajustes de inventario positivos

**Quién puede registrarla:** bodeguero, propietario, admin

### Salida
Reduce el stock de un producto. Se usa para:
- Ventas al mostrador
- Traslados a otra bodega
- Consumo interno

**Quién puede registrarla:** vendedor, bodeguero, propietario, admin

### Baja
Registra pérdida permanente. El producto no se recupera. Se usa para:
- Caducidad (producto vencido)
- Daño o rotura
- Robo o extravío

**Requiere:** motivo obligatorio + observación mínimo 5 caracteres
**Quién puede registrarla:** bodeguero, propietario, admin

## Reglas de negocio

1. Todo movimiento queda registrado con el `id_empleado` de quien lo realizó (trazabilidad).
2. El stock no puede quedar en negativo (validación en backend).
3. Las bajas son irreversibles — solo se pueden documentar, no deshacer.
4. El historial muestra el stock anterior y el stock nuevo para cada movimiento (delta de stock).

## Arquitectura CSS

```
atoms/    _db-indicador.css       → tarjetas KPI
          _db-etiqueta.css        → badges de tipo (entrada/salida/baja)
          _db-campo.css           → campos de formulario en tarjeta clara
          _db-control-cantidad.css → stepper numérico ±

molecules/ _db-barra-filtros.css  → filtros del historial
           _db-tabla-datos.css    → tabla de historial
           _db-delta-stock.css    → visualizador antes→después

organisms/ _db-tarjeta-vista.css  → card principal de la vista

views/    _movimientos-view.css   → composición específica:
            .mov-fila-indicadores
            .mov-tabs / .mov-tab
            .mov-resumen-tipo
            .mov-tarjeta-registro
            .mov-selector-producto
            .mov-cuadricula-campos
            .mov-vista-previa
            .mov-leyenda
```

## IDs relevantes para JS

| ID                        | Elemento                              |
|---------------------------|---------------------------------------|
| `formEntrada`             | Formulario de registro de entrada     |
| `formSalida`              | Formulario de registro de salida      |
| `formBaja`                | Formulario de registro de baja        |
| `tablaMovimientos`        | `<tbody>` del historial               |
| `estadoCargaMovimientos`  | Texto de estado/conteo del historial  |
| `filtroTipoMovimiento`    | Select de tipo en historial           |
| `filtroProductoMovimiento`| Select de producto en historial       |
| `filtroEmpleadoMovimiento`| Select de empleado en historial       |
| `filtroFechaDesde`        | Input fecha desde                     |
| `filtroFechaHasta`        | Input fecha hasta                     |
| `btnAplicarFiltros`       | Botón aplicar filtros                 |
| `btnLimpiarFiltros`       | Botón limpiar filtros                 |
| `btnRecargarMovimientos`  | Botón recargar historial              |
| `kpiEntradas`             | Valor KPI entradas del día            |
| `kpiSalidas`              | Valor KPI salidas del día             |
| `kpiBajas`                | Valor KPI bajas del día               |
| `kpiStockTotal`           | Valor KPI stock total                 |
