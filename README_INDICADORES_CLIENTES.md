# Dashboard de Indicadores de Clientes

## Descripción

Este dashboard proporciona métricas clave sobre el comportamiento de los clientes, incluyendo:

- **Número de Clientes Nuevos vs. Recurrentes**: Mide cuántos clientes nuevos se están adquiriendo y cuántos clientes existentes están volviendo a comprar.
- **Tasa de Retención de Clientes**: Porcentaje de clientes que repiten la compra en un período determinado.

## Características

### 📊 Métricas Principales

1. **Total de Clientes**: Número total de clientes en el período seleccionado
2. **Clientes Nuevos**: Clientes que no habían realizado compras antes del período
3. **Clientes Recurrentes**: Clientes que ya habían comprado anteriormente
4. **Tasa de Retención**: Porcentaje de clientes que volvieron a comprar

### 📅 Filtros de Período

- **Fecha de Inicio**: Permite seleccionar el inicio del período de análisis
- **Fecha de Fin**: Permite seleccionar el fin del período de análisis
- **Período por defecto**: Si no se especifican fechas, usa los últimos 30 días

### 📈 Visualizaciones

- **Tarjetas de métricas**: Muestran los valores principales con iconos y colores distintivos
- **Barras de progreso**: Visualizan la distribución de clientes nuevos vs recurrentes
- **Detalles de retención**: Tabla con información detallada sobre la retención
- **Resumen ejecutivo**: Análisis textual de los resultados

### 💾 Exportación

- **Exportar a CSV**: Permite descargar los datos en formato CSV
- **Formato**: Incluye todos los indicadores y métricas calculadas

## Cómo Acceder

1. Navega a la sección de **Reportes** en el dashboard
2. Busca la tarjeta **"Indicadores de Clientes"** (con icono 👥)
3. Haz clic en **"Ver Dashboard"**
4. Se abrirá la página dedicada a los indicadores de clientes

## Funcionalidades

### Filtros de Período
- Selecciona fechas específicas para analizar un período particular
- Usa el botón **"Aplicar"** para cargar los datos con los filtros seleccionados
- Usa el botón **"Limpiar"** para resetear los filtros y usar el período por defecto

### Interpretación de Métricas

#### Clientes Nuevos vs Recurrentes
- **Clientes Nuevos**: Son aquellos que se registraron en el período y no tenían historial de compras previo
- **Clientes Recurrentes**: Son aquellos que se registraron en el período pero ya habían comprado anteriormente
- **Porcentajes**: Se calculan sobre el total de clientes del período

#### Tasa de Retención
- **Cálculo**: (Clientes que volvieron a comprar / Clientes del período anterior) × 100
- **Período de comparación**: Por defecto compara los últimos 30 días con los 30 días anteriores
- **Interpretación**: Un porcentaje más alto indica mejor retención de clientes

## Stored Procedures Utilizados

### `get_clientes_nuevos_vs_recurrentes(fecha_inicio, fecha_fin)`
Calcula la distribución de clientes nuevos vs recurrentes en un período específico.

### `get_tasa_retencion_clientes(fecha_inicio, fecha_fin)`
Calcula la tasa de retención comparando dos períodos consecutivos.

### `get_indicadores_clientes(fecha_inicio, fecha_fin)`
Función principal que combina todos los indicadores en una sola consulta.

### `get_estadisticas_clientes_detalladas(fecha_inicio, fecha_fin)`
Proporciona estadísticas detalladas separadas por tipo de cliente (Natural y Jurídico).

## API Endpoints

### GET `/api/reportes/indicadores-clientes`
Obtiene todos los indicadores de clientes.

**Parámetros de consulta:**
- `fechaInicio` (opcional): Fecha de inicio en formato YYYY-MM-DD
- `fechaFin` (opcional): Fecha de fin en formato YYYY-MM-DD

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "clientes_nuevos_vs_recurrentes": {
      "total_clientes_periodo": 150,
      "clientes_nuevos": 45,
      "clientes_recurrentes": 105
    },
    "tasa_retencion": {
      "clientes_periodo_anterior": 120,
      "clientes_periodo_actual": 95,
      "clientes_retornados": 85,
      "tasa_retencion": 70.83
    },
    "periodo": {
      "fecha_inicio": "2024-01-01",
      "fecha_fin": "2024-01-31"
    }
  },
  "message": "Indicadores de clientes obtenidos exitosamente"
}
```

## Consideraciones Técnicas

### Base de Datos
- Utiliza las tablas `cliente_natural`, `cliente_juridico`, `venta_tienda` y `usuario`
- La fecha de registro se obtiene del campo `fecha_creacion` de la tabla `usuario`
- Considera tanto clientes naturales como jurídicos

### Rendimiento
- Los stored procedures están optimizados para consultas eficientes
- Se utilizan índices en las fechas para mejorar el rendimiento
- Las consultas se ejecutan en paralelo cuando es posible

### Validaciones
- Validación de formato de fechas (YYYY-MM-DD)
- Manejo de errores con mensajes descriptivos
- Valores por defecto cuando no se especifican fechas

## Mantenimiento

### Actualización de Stored Procedures
Los stored procedures se encuentran en el archivo `sql/INDICADORES_CLIENTES.sql` y deben ejecutarse en la base de datos PostgreSQL.

### Monitoreo
- Revisar regularmente los logs de la aplicación para detectar errores
- Monitorear el rendimiento de las consultas
- Verificar la precisión de los cálculos con datos de prueba

## Soporte

Para reportar problemas o solicitar mejoras:
1. Revisar los logs de la aplicación
2. Verificar la conectividad con la base de datos
3. Confirmar que los stored procedures están instalados correctamente
4. Validar que las fechas proporcionadas están en el formato correcto 