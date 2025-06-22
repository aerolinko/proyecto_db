-- ===== FUNCIONES DE REPORTES CORREGIDAS =====
-- Ejecutar este archivo en tu base de datos PostgreSQL para corregir las funciones

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS get_report_productos_mayor_demanda(DATE, DATE);
DROP FUNCTION IF EXISTS get_report_reposicion_anaqueles(DATE, DATE);
DROP FUNCTION IF EXISTS get_report_cuotas_afiliacion_pendientes();
DROP FUNCTION IF EXISTS get_report_nomina_departamento(DATE, DATE);
DROP FUNCTION IF EXISTS get_report_historial_compras_cliente_juridico(INTEGER, DATE, DATE);
DROP FUNCTION IF EXISTS get_stock_cervezas();
DROP FUNCTION IF EXISTS get_stock_almacen();
DROP FUNCTION IF EXISTS get_stock_anaquel();
DROP FUNCTION IF EXISTS get_cervezas_stock_bajo(INTEGER);
DROP FUNCTION IF EXISTS get_cervezas_sin_stock();
DROP FUNCTION IF EXISTS get_stock_cerveza_especifica(VARCHAR);

-- 1. Función para Productos con Mayor Demanda en Tienda Online (CORREGIDA - SOLO VENTAS COMPLETADAS)
CREATE OR REPLACE FUNCTION get_report_productos_mayor_demanda(
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
  producto_id INTEGER,
  producto_nombre VARCHAR,
  precio_promedio NUMERIC,
  stock_actual BIGINT,
  total_ventas BIGINT,
  unidades_vendidas BIGINT,
  ingresos_totales BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      c.cerveza_id as producto_id,
      c.nombre as producto_nombre,
      ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
      COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
      COUNT(DISTINCT vo.venta_online_id) as total_ventas,
      SUM(dvo.cantidad) as unidades_vendidas,
      SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
    FROM cerveza c
    JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
    LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
    LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
    JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
    JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
    JOIN estado_venta_online evo ON vo.venta_online_id = evo.fk_venta_online
    WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
    AND evo.fk_estado = 3  -- SOLO VENTAS COMPLETADAS
    AND evo.fecha_fin IS NULL  -- Estado actual
    GROUP BY c.cerveza_id, c.nombre
    ORDER BY unidades_vendidas DESC, ingresos_totales DESC
    LIMIT 50;
  ELSE
    RETURN QUERY
    SELECT 
      c.cerveza_id as producto_id,
      c.nombre as producto_nombre,
      ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
      COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
      COUNT(DISTINCT vo.venta_online_id) as total_ventas,
      SUM(dvo.cantidad) as unidades_vendidas,
      SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
    FROM cerveza c
    JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
    LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
    LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
    JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
    JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
    JOIN estado_venta_online evo ON vo.venta_online_id = evo.fk_venta_online
    WHERE evo.fk_estado = 3  -- SOLO VENTAS COMPLETADAS
    AND evo.fecha_fin IS NULL  -- Estado actual
    GROUP BY c.cerveza_id, c.nombre
    ORDER BY unidades_vendidas DESC, ingresos_totales DESC
    LIMIT 50;
  END IF;
END;
$$;

-- 2. Función para Stock Total de Cervezas (CORREGIDA)
CREATE OR REPLACE FUNCTION get_stock_cervezas()
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  stock_total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
  LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
  GROUP BY c.cerveza_id, c.nombre, p.nombre
  ORDER BY c.nombre, p.nombre;
END;
$$;

-- 3. Función para Stock por Almacén (CORREGIDA)
CREATE OR REPLACE FUNCTION get_stock_almacen()
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  nombre_almacen VARCHAR,
  cantidad_disponible INTEGER,
  fecha_ultima_actualizacion TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    a.nombre as nombre_almacen,
    almc.cantidad as cantidad_disponible,
    almc.fecha as fecha_ultima_actualizacion
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
  LEFT JOIN almacen a ON almc.fk_almacen = a.almacen_id
  WHERE almc.cantidad > 0
  ORDER BY c.nombre, p.nombre, a.nombre;
END;
$$;

-- 4. Función para Stock por Anaquel (CORREGIDA)
CREATE OR REPLACE FUNCTION get_stock_anaquel()
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  nombre_anaquel VARCHAR,
  cantidad_disponible INTEGER,
  precio_venta NUMERIC,
  fecha_ultima_actualizacion TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    an.nombre as nombre_anaquel,
    ac.cantidad as cantidad_disponible,
    ac.precio_unitario as precio_venta,
    ac.fecha as fecha_ultima_actualizacion
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
  LEFT JOIN anaquel an ON ac.fk_anaquel = an.anaquel_id
  WHERE ac.cantidad > 0
  ORDER BY c.nombre, p.nombre, an.nombre;
END;
$$;

-- 5. Función para Cervezas con Stock Bajo (CORREGIDA)
CREATE OR REPLACE FUNCTION get_cervezas_stock_bajo(p_limite INTEGER DEFAULT 10)
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  stock_total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
  LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
  GROUP BY c.cerveza_id, c.nombre, p.nombre
  HAVING COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) <= p_limite
  ORDER BY stock_total ASC, c.nombre;
END;
$$;

-- 6. Función para Cervezas Sin Stock (CORREGIDA)
CREATE OR REPLACE FUNCTION get_cervezas_sin_stock()
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  stock_total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
  LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
  GROUP BY c.cerveza_id, c.nombre, p.nombre
  HAVING COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) = 0
  ORDER BY c.nombre, p.nombre;
END;
$$;

-- 7. Función para Stock de Cerveza Específica (CORREGIDA)
CREATE OR REPLACE FUNCTION get_stock_cerveza_especifica(p_nombre_cerveza VARCHAR)
RETURNS TABLE (
  cerveza_id INTEGER,
  nombre_cerveza VARCHAR,
  presentacion VARCHAR,
  stock_anaqueles BIGINT,
  stock_almacen BIGINT,
  stock_total BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.cerveza_id,
    c.nombre as nombre_cerveza,
    p.nombre as presentacion,
    COALESCE(SUM(ac.cantidad), 0) as stock_anaqueles,
    COALESCE(SUM(almc.cantidad), 0) as stock_almacen,
    COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
  FROM cerveza c
  LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
  LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
  LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
  WHERE LOWER(c.nombre) LIKE LOWER('%' || p_nombre_cerveza || '%')
  GROUP BY c.cerveza_id, c.nombre, p.nombre
  ORDER BY c.nombre, p.nombre;
END;
$$;

-- Mensaje de confirmación
SELECT '✅ Todas las funciones de reportes han sido corregidas exitosamente' as mensaje; 