# Dashboard de Indicadores de Ventas

## Descripción

Este dashboard proporciona métricas clave sobre el rendimiento de ventas de ACAUCAB, incluyendo análisis por canal de venta, crecimiento, ticket promedio y análisis por estilo de cerveza.

## 📊 Indicadores Implementados

### 1. Ventas Totales (por tienda)
- **Descripción**: Muestra el total de ingresos generados, desglosado por tienda física y tienda en línea
- **Métricas**: 
  - Total de ventas en dólares por canal
  - Cantidad de transacciones por canal
  - Comparación entre canales de venta
- **Interpretación**: Permite identificar qué canal de venta es más efectivo

### 2. Crecimiento de Ventas ($$ y %)
- **Descripción**: Compara las ventas de un período con el período anterior
- **Métricas**:
  - Crecimiento en dólares (diferencia absoluta)
  - Crecimiento porcentual
  - Comparación de períodos consecutivos
- **Interpretación**: Mide la evolución del negocio en el tiempo

### 3. Ticket Promedio (VMP)
- **Descripción**: Calcula el valor promedio de cada venta
- **Métricas**:
  - Ticket promedio por canal (tienda física vs online)
  - Ticket promedio general
  - Cantidad de ventas por canal
- **Interpretación**: Evalúa la efectividad de las estrategias de venta

### 4. Volumen de Unidades Vendidas
- **Descripción**: Muestra la cantidad total de cervezas vendidas
- **Métricas**:
  - Unidades vendidas por canal
  - Total de unidades vendidas
  - Distribución entre tienda física y online
- **Interpretación**: Analiza el volumen de productos vendidos

### 5. Ventas por Estilo de Cerveza
- **Descripción**: Analiza qué estilos de cerveza son los más vendidos
- **Métricas**:
  - Unidades vendidas por estilo
  - Total de ventas por estilo
  - Porcentaje de participación en el total
- **Interpretación**: Identifica las preferencias de los clientes

## 🗄️ Stored Procedures Creados

### Archivo: `sql/INDICADORES_VENTAS.sql`

#### 1. `obtener_ventas_totales_por_tienda(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene las ventas totales desglosadas por tipo de tienda
SELECT * FROM obtener_ventas_totales_por_tienda('2024-01-01', '2024-01-31');
```

#### 2. `obtener_crecimiento_ventas(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene el crecimiento de ventas comparado con el período anterior
SELECT * FROM obtener_crecimiento_ventas('2024-01-01', '2024-01-31');
```

#### 3. `obtener_ticket_promedio(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene el ticket promedio por canal de venta
SELECT * FROM obtener_ticket_promedio('2024-01-01', '2024-01-31');
```

#### 4. `obtener_volumen_unidades_vendidas(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene el volumen total de unidades vendidas
SELECT * FROM obtener_volumen_unidades_vendidas('2024-01-01', '2024-01-31');
```

#### 5. `obtener_ventas_por_estilo_cerveza(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene las ventas desglosadas por estilo de cerveza
SELECT * FROM obtener_ventas_por_estilo_cerveza('2024-01-01', '2024-01-31');
```

#### 6. `obtener_indicadores_ventas(p_fecha_inicio, p_fecha_fin)`
```sql
-- Obtiene todos los indicadores en formato JSON
SELECT * FROM obtener_indicadores_ventas('2024-01-01', '2024-01-31');
```

## 🚀 Instrucciones de Ejecución

### Paso 1: Ejecutar los Stored Procedures
1. Abre tu cliente de PostgreSQL (pgAdmin, DBeaver, etc.)
2. Conéctate a tu base de datos
3. Ejecuta el archivo `sql/INDICADORES_VENTAS.sql`

### Paso 2: Verificar la Instalación
```sql
-- Verificar que las funciones se crearon correctamente
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE 'obtener_%_ventas%';

-- Probar las funciones
SELECT * FROM obtener_indicadores_ventas();
```

### Paso 3: Ejemplos de Uso

#### Obtener todos los indicadores para el último mes:
```sql
SELECT * FROM obtener_indicadores_ventas();
```

#### Obtener indicadores para un período específico:
```sql
SELECT * FROM obtener_indicadores_ventas('2024-01-01', '2024-01-31');
```

#### Obtener solo ventas por tienda:
```sql
SELECT * FROM obtener_ventas_totales_por_tienda('2024-01-01', '2024-01-31');
```

#### Obtener solo crecimiento de ventas:
```sql
SELECT * FROM obtener_crecimiento_ventas('2024-01-01', '2024-01-31');
```

#### Obtener solo ticket promedio:
```sql
SELECT * FROM obtener_ticket_promedio('2024-01-01', '2024-01-31');
```

#### Obtener solo volumen de unidades:
```sql
SELECT * FROM obtener_volumen_unidades_vendidas('2024-01-01', '2024-01-31');
```

#### Obtener solo ventas por estilo de cerveza:
```sql
SELECT * FROM obtener_ventas_por_estilo_cerveza('2024-01-01', '2024-01-31');
```

## 🌐 API Endpoints

### GET `/api/reportes/indicadores-ventas`
- **Descripción**: Obtiene todos los indicadores de ventas
- **Parámetros de query**:
  - `fechaInicio` (opcional): Fecha de inicio en formato YYYY-MM-DD
  - `fechaFin` (opcional): Fecha de fin en formato YYYY-MM-DD
- **Respuesta**: JSON con todos los indicadores

#### Ejemplo de uso:
```bash
# Sin filtros (último mes)
curl "http://localhost:3000/api/reportes/indicadores-ventas"

# Con filtros de fecha
curl "http://localhost:3000/api/reportes/indicadores-ventas?fechaInicio=2024-01-01&fechaFin=2024-01-31"
```

## 📊 Dashboard Frontend

### Ruta: `/1/Reportes/IndicadoresVentas`
- **Descripción**: Dashboard interactivo con todos los indicadores de ventas
- **Características**:
  - Filtros de fecha
  - Tarjetas de métricas principales
  - Gráficos de ventas por tienda
  - Tabla de ventas por estilo de cerveza
  - Exportación a CSV
  - Diseño responsivo

### Acceso desde la aplicación:
1. Navega a `/1/Reportes`
2. Haz clic en "Indicadores de Ventas" (con icono 💰)
3. Usa los filtros para ajustar el período de análisis

## 📈 Interpretación de Resultados

### Ventas Totales por Tienda
- **Tienda Física**: Ventas realizadas en puntos de venta físicos
- **Tienda Online**: Ventas realizadas a través del e-commerce
- **Comparación**: Identificar qué canal es más efectivo

### Crecimiento de Ventas
- **Positivo**: Indica crecimiento del negocio
- **Negativo**: Indica disminución que requiere atención
- **Porcentual**: Permite comparar diferentes períodos

### Ticket Promedio
- **Tienda Física**: Generalmente más alto por compras presenciales
- **Tienda Online**: Puede ser más bajo por compras individuales
- **General**: Promedio ponderado de ambos canales

### Volumen de Unidades
- **Unidades por canal**: Distribución de ventas físicas vs online
- **Total**: Volumen general de productos vendidos
- **Tendencias**: Identificar patrones de consumo

### Ventas por Estilo de Cerveza
- **Estilos populares**: Los que tienen mayor porcentaje de ventas
- **Oportunidades**: Estilos con menor participación
- **Estrategias**: Orientar inventario hacia estilos más demandados

## 🔧 Mantenimiento

### Actualizar las funciones:
```sql
-- Para actualizar una función específica, ejecuta nuevamente su definición
-- desde el archivo sql/INDICADORES_VENTAS.sql
```

### Verificar el rendimiento:
```sql
-- Analizar el tiempo de ejecución de las funciones
EXPLAIN ANALYZE SELECT * FROM obtener_indicadores_ventas();
```

## 📝 Notas Importantes

1. **Datos requeridos**: Las funciones requieren datos en las tablas:
   - `VENTA_TIENDA` y `DETALLE_VENTA_TIENDA`
   - `VENTA_ONLINE` y `DETALLE_VENTA_ONLINE`
   - `CERVEZA` y `ESTILO_CERVEZA`
   - `CERVEZA_PRESENTACION`
   - `ALMACEN_CERVEZA` y `ANAQUEL_CERVEZA`

2. **Fechas por defecto**: Si no se proporcionan fechas, las funciones usan el último mes como período por defecto.

3. **Manejo de errores**: Las funciones incluyen validaciones para evitar divisiones por cero y manejar casos donde no hay datos.

4. **Moneda**: Todos los valores monetarios se manejan en centavos en la base de datos y se convierten a dólares en el frontend.

5. **Estilos de cerveza**: El análisis incluye todos los estilos disponibles en la base de datos, ordenados por volumen de ventas.

## 🎯 Beneficios del Dashboard

- **Visibilidad completa**: Análisis integral del rendimiento de ventas
- **Toma de decisiones**: Datos para estrategias comerciales
- **Optimización**: Identificación de oportunidades de mejora
- **Comparación**: Análisis de tendencias y crecimiento
- **Segmentación**: Análisis por canal y estilo de producto 