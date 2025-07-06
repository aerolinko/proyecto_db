# Indicadores de Ventas - Sistema de Análisis

## Descripción

Este sistema proporciona un análisis completo de las ventas de la empresa cervecera, incluyendo métricas detalladas por tienda física y tienda en línea.

## Funcionalidades Implementadas

### 1. Ventas Totales por Tienda
- **Descripción**: Muestra el total de ingresos generados, desglosado por tienda física y tienda en línea
- **Métricas incluidas**:
  - Total de ventas en moneda local
  - Cantidad de transacciones realizadas
  - Ticket promedio por tienda
  - Porcentaje de participación en el total

### 2. Crecimiento de Ventas
- **Descripción**: Compara las ventas de un período con el período anterior
- **Períodos disponibles**: Mes, Trimestre, Año
- **Métricas incluidas**:
  - Ventas del período actual vs anterior
  - Crecimiento absoluto en moneda
  - Crecimiento porcentual
  - Comparación por tipo de tienda

### 3. Ticket Promedio (VMP)
- **Descripción**: Calcula el valor promedio de cada venta
- **Métricas incluidas**:
  - Ticket promedio por tienda
  - Cantidad total de ventas
  - Venta mínima y máxima
  - Mediana de ventas
  - Filtros por tipo de tienda

### 4. Volumen de Unidades Vendidas
- **Descripción**: Muestra la cantidad total de cervezas vendidas
- **Métricas incluidas**:
  - Total de unidades vendidas
  - Ingresos totales generados
  - Precio promedio unitario
  - Cantidad de productos diferentes
  - Top 5 productos más vendidos

### 5. Ventas por Estilo de Cerveza
- **Descripción**: Analiza qué estilos de cerveza son los más vendidos
- **Métricas incluidas**:
  - Ranking de estilos por ventas
  - Unidades vendidas por estilo
  - Ingresos generados por estilo
  - Porcentaje de participación en el mercado
  - Precio promedio por estilo

### 6. Resumen General
- **Descripción**: Vista consolidada de todos los indicadores principales
- **Métricas incluidas**:
  - Ventas totales
  - Cantidad de ventas
  - Ticket promedio general
  - Venta mínima y máxima
  - Unidades vendidas totales

## Instalación y Configuración

### 1. Ejecutar las funciones SQL

Primero, ejecuta el archivo `sql/indicadores_ventas.sql` en tu base de datos PostgreSQL:

```bash
psql -d tu_base_de_datos -f sql/indicadores_ventas.sql
```

### 2. Verificar las funciones creadas

Puedes verificar que las funciones se crearon correctamente ejecutando:

```sql
-- Listar todas las funciones de indicadores
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE 'get_%' 
AND routine_schema = 'public';
```

### 3. Probar las funciones

Ejecuta algunos ejemplos para verificar que todo funciona:

```sql
-- Ventas totales por tienda
SELECT * FROM get_ventas_totales_por_tienda('2025-01-01', '2025-12-31');

-- Crecimiento de ventas (mes actual vs anterior)
SELECT * FROM get_crecimiento_ventas('mes');

-- Ticket promedio
SELECT * FROM get_ticket_promedio('2025-01-01', '2025-12-31');

-- Volumen de unidades vendidas
SELECT * FROM get_volumen_unidades_vendidas('2025-01-01', '2025-12-31');

-- Ventas por estilo de cerveza
SELECT * FROM get_ventas_por_estilo_cerveza('2025-01-01', '2025-12-31', 10);

-- Resumen general
SELECT * FROM get_resumen_indicadores_ventas('2025-01-01', '2025-12-31');
```

## Uso de la API

### Endpoints disponibles

La API está disponible en `/api/indicadores-ventas` con los siguientes parámetros:

#### 1. Ventas Totales por Tienda
```
GET /api/indicadores-ventas?tipo=ventas-totales&fechaInicio=2025-01-01&fechaFin=2025-12-31
```

#### 2. Crecimiento de Ventas
```
GET /api/indicadores-ventas?tipo=crecimiento&periodo=mes
```

#### 3. Ticket Promedio
```
GET /api/indicadores-ventas?tipo=ticket-promedio&fechaInicio=2025-01-01&fechaFin=2025-12-31&tipoTienda=fisica
```

#### 4. Volumen de Unidades
```
GET /api/indicadores-ventas?tipo=volumen-unidades&fechaInicio=2025-01-01&fechaFin=2025-12-31&tipoTienda=online
```

#### 5. Estilos de Cerveza
```
GET /api/indicadores-ventas?tipo=estilos-cerveza&fechaInicio=2025-01-01&fechaFin=2025-12-31&limite=10
```

#### 6. Resumen General
```
GET /api/indicadores-ventas?tipo=resumen-general&fechaInicio=2025-01-01&fechaFin=2025-12-31
```

### Parámetros de la API

- `tipo`: Tipo de indicador a consultar
- `fechaInicio`: Fecha de inicio del período (formato: YYYY-MM-DD)
- `fechaFin`: Fecha de fin del período (formato: YYYY-MM-DD)
- `periodo`: Para crecimiento de ventas ('mes', 'trimestre', 'año')
- `tipoTienda`: Para filtrar por tipo de tienda ('fisica', 'online')
- `limite`: Para estilos de cerveza, número máximo de resultados

## Uso de la Interfaz Web

### Acceso a la página

La página de indicadores está disponible en:
```
/[usernameid]/dashboard/IndicadoresVentas
```

### Funcionalidades de la interfaz

1. **Selector de indicador**: Cambia entre los diferentes tipos de análisis
2. **Filtros de fecha**: Define el período de análisis
3. **Filtros adicionales**: Según el tipo de indicador (período, tipo de tienda, etc.)
4. **Vista responsiva**: Se adapta a diferentes tamaños de pantalla
5. **Formateo automático**: Moneda y números formateados según estándares venezolanos

## Estructura de Datos

### Tablas principales utilizadas

- `VENTA_TIENDA`: Ventas de tienda física
- `VENTA_ONLINE`: Ventas de tienda en línea
- `DETALLE_VENTA_TIENDA`: Detalles de ventas físicas
- `DETALLE_VENTA_ONLINE`: Detalles de ventas online
- `CERVEZA`: Información de productos
- `ESTILO_CERVEZA`: Estilos de cerveza
- `CERVEZA_PRESENTACION`: Presentaciones de productos
- `PRESENTACION`: Tipos de presentación

### Relaciones clave

- Las ventas se relacionan con clientes (naturales y jurídicos)
- Los detalles de venta se relacionan con inventario (anaquel y almacén)
- Los productos se relacionan con estilos y presentaciones

## Consideraciones Técnicas

### Rendimiento

- Las funciones utilizan CTEs (Common Table Expressions) para optimizar consultas
- Se implementan índices en las columnas de fecha para mejorar rendimiento
- Las consultas están optimizadas para grandes volúmenes de datos

### Mantenimiento

- Todas las funciones están documentadas con comentarios
- Se utilizan parámetros opcionales para flexibilidad
- Las funciones manejan casos edge (valores nulos, divisiones por cero)

### Escalabilidad

- Las funciones están diseñadas para manejar múltiples períodos
- Se pueden agregar fácilmente nuevos tipos de indicadores
- La estructura permite filtros adicionales sin modificar la lógica principal

## Troubleshooting

### Problemas comunes

1. **Error de función no encontrada**
   - Verificar que el archivo SQL se ejecutó correctamente
   - Verificar que estás conectado a la base de datos correcta

2. **Datos no aparecen**
   - Verificar que existen ventas en el período seleccionado
   - Verificar que las fechas están en el formato correcto

3. **Errores de rendimiento**
   - Verificar que existen índices en las columnas de fecha
   - Considerar limitar el rango de fechas para períodos muy largos

### Logs y debugging

Los errores se registran en la consola del servidor y en los logs de la aplicación. Para debugging:

1. Revisar los logs del servidor
2. Verificar las consultas SQL generadas
3. Probar las funciones directamente en la base de datos

## Próximas Mejoras

- [ ] Gráficos interactivos con Chart.js o D3.js
- [ ] Exportación de datos a Excel/PDF
- [ ] Alertas automáticas para métricas críticas
- [ ] Comparación con períodos históricos
- [ ] Análisis de tendencias temporales
- [ ] Dashboard ejecutivo con KPIs principales 