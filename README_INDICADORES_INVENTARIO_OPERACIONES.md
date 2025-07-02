# Indicadores de Inventario y Operaciones

Este documento contiene los stored procedures y funciones para calcular indicadores clave de inventario y operaciones en la base de datos de ACAUCAB.

## 📋 Indicadores Implementados

### 1. Rotación de Inventario
- **Descripción**: Mide la rapidez con la que se vende y reemplaza el inventario
- **Fórmula**: `Rotación de inventario = Costo de los productos vendidos / Valor promedio del inventario`
- **Interpretación**: Un valor más alto indica una gestión eficiente del inventario

### 2. Tasa de Ruptura de Stock (Stockout Rate)
- **Descripción**: Mide la frecuencia con la que las tiendas se quedan sin productos
- **Fórmula**: `(Productos sin stock / Total de productos) × 100`
- **Interpretación**: Un valor más bajo indica una mejor gestión de inventario

### 3. Ventas por Empleado
- **Descripción**: Evalúa el rendimiento del personal de ventas en las tiendas físicas
- **Métricas**: Total de ventas, cantidad de ventas, promedio por venta
- **Interpretación**: Permite identificar a los empleados más productivos

## 🗄️ Stored Procedures Creados

### Archivo: `sql/INDICADORES_INVENTARIO_OPERACIONES.sql`

#### 1. `obtener_rotacion_inventario(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene la rotación de inventario para un período específico
SELECT * FROM obtener_rotacion_inventario('2024-01-01', '2024-01-31');
```

#### 2. `obtener_tasa_ruptura_stock(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene la tasa de ruptura de stock para un período específico
SELECT * FROM obtener_tasa_ruptura_stock('2024-01-01', '2024-01-31');
```

#### 3. `obtener_ventas_por_empleado(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene las ventas por empleado para un período específico
SELECT * FROM obtener_ventas_por_empleado('2024-01-01', '2024-01-31');
```

#### 4. `obtener_indicadores_inventario_operaciones(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene todos los indicadores en formato JSON
SELECT * FROM obtener_indicadores_inventario_operaciones('2024-01-01', '2024-01-31');
```

## 🚀 Instrucciones de Ejecución

### Paso 1: Ejecutar los Stored Procedures
1. Abre tu cliente de PostgreSQL (pgAdmin, DBeaver, etc.)
2. Conéctate a tu base de datos
3. Ejecuta el archivo `sql/INDICADORES_INVENTARIO_OPERACIONES.sql`

### Paso 2: Verificar la Instalación
```sql
-- Verificar que las funciones se crearon correctamente
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE 'obtener_%';

-- Probar las funciones
SELECT * FROM obtener_indicadores_inventario_operaciones();
```

### Paso 3: Ejemplos de Uso

#### Obtener todos los indicadores para el último mes:
```sql
SELECT * FROM obtener_indicadores_inventario_operaciones();
```

#### Obtener indicadores para un período específico:
```sql
SELECT * FROM obtener_indicadores_inventario_operaciones('2024-01-01', '2024-01-31');
```

#### Obtener solo rotación de inventario:
```sql
SELECT * FROM obtener_rotacion_inventario('2024-01-01', '2024-01-31');
```

#### Obtener solo tasa de ruptura de stock:
```sql
SELECT * FROM obtener_tasa_ruptura_stock('2024-01-01', '2024-01-31');
```

#### Obtener solo ventas por empleado:
```sql
SELECT * FROM obtener_ventas_por_empleado('2024-01-01', '2024-01-31');
```

## 🌐 API Endpoints

### GET `/api/reportes/indicadores-inventario-operaciones`
- **Descripción**: Obtiene todos los indicadores de inventario y operaciones
- **Parámetros de query**:
  - `fechaInicio` (opcional): Fecha de inicio en formato YYYY-MM-DD
  - `fechaFin` (opcional): Fecha de fin en formato YYYY-MM-DD
- **Respuesta**: JSON con todos los indicadores

#### Ejemplo de uso:
```bash
# Sin filtros (último mes)
curl "http://localhost:3000/api/reportes/indicadores-inventario-operaciones"

# Con filtros de fecha
curl "http://localhost:3000/api/reportes/indicadores-inventario-operaciones?fechaInicio=2024-01-01&fechaFin=2024-01-31"
```

## 📊 Dashboard Frontend

### Ruta: `/1/Reportes/IndicadoresInventarioOperaciones`
- **Descripción**: Dashboard interactivo con todos los indicadores
- **Características**:
  - Filtros de fecha
  - Tarjetas de métricas principales
  - Tabla de ventas por empleado
  - Exportación a CSV
  - Diseño responsivo

### Acceso desde la aplicación:
1. Navega a `/1/Reportes`
2. Haz clic en "Indicadores de Inventario y Operaciones"
3. Usa los filtros para ajustar el período de análisis

## 📈 Interpretación de Resultados

### Rotación de Inventario
- **Excelente**: ≥ 8 veces por período
- **Bueno**: 4-7 veces por período
- **Mejorable**: < 4 veces por período

### Tasa de Ruptura de Stock
- **Excelente**: ≤ 5%
- **Bueno**: 5-15%
- **Mejorable**: > 15%

### Ventas por Empleado
- Analizar el total de ventas y promedio por venta
- Identificar empleados de alto rendimiento
- Detectar oportunidades de mejora

## 🔧 Mantenimiento

### Actualizar las funciones:
```sql
-- Para actualizar una función específica, ejecuta nuevamente su definición
-- desde el archivo sql/INDICADORES_INVENTARIO_OPERACIONES.sql
```

### Verificar el rendimiento:
```sql
-- Analizar el tiempo de ejecución de las funciones
EXPLAIN ANALYZE SELECT * FROM obtener_indicadores_inventario_operaciones();
```

## 📝 Notas Importantes

1. **Datos requeridos**: Las funciones requieren datos en las tablas:
   - `VENTA_TIENDA` y `DETALLE_VENTA_TIENDA`
   - `VENTA_ONLINE` y `DETALLE_VENTA_ONLINE`
   - `ALMACEN_CERVEZA`
   - `ANAQUEL_CERVEZA`
   - `EMPLEADO`

2. **Fechas por defecto**: Si no se proporcionan fechas, las funciones usan el último mes como período por defecto.

3. **Manejo de errores**: Las funciones incluyen validaciones para evitar divisiones por cero y manejar casos donde no hay datos.

4. **Rendimiento**: Para grandes volúmenes de datos, considera agregar índices en las columnas de fecha.

## 🐛 Solución de Problemas

### Error: "function does not exist"
- Verifica que el archivo SQL se ejecutó completamente
- Revisa que no haya errores de sintaxis

### Error: "division by zero"
- Verifica que existan datos en las tablas para el período especificado
- Las funciones incluyen validaciones, pero es importante tener datos de prueba

### Error: "permission denied"
- Asegúrate de tener permisos para crear funciones en la base de datos
- Ejecuta como usuario con privilegios de superusuario si es necesario 