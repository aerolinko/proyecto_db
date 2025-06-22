-- ===== FUNCIONES DE REPORTES PARA PROYECTO DB =====
-- Ejecutar este archivo en tu base de datos PostgreSQL para crear todas las funciones de reportes

-- 1. Función para Productos con Mayor Demanda en Tienda Online
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
    WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
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
    GROUP BY c.cerveza_id, c.nombre
    ORDER BY unidades_vendidas DESC, ingresos_totales DESC
    LIMIT 50;
  END IF;
END;
$$;

-- 2. Función para Reposición de Anaqueles
CREATE OR REPLACE FUNCTION get_report_reposicion_anaqueles(
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
  reposicion_id INTEGER,
  fecha_reposicion DATE,
  cantidad_solicitada INTEGER,
  estado VARCHAR,
  producto_nombre VARCHAR,
  stock_actual INTEGER,
  numero_pasillo INTEGER,
  zona VARCHAR,
  lugar_nombre VARCHAR,
  empleado_solicitante VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      ra.reposicion_anaquel_id as reposicion_id,
      ra.fecha as fecha_reposicion,
      dra.cantidad as cantidad_solicitada,
      es.nombre as estado,
      c.nombre as producto_nombre,
      ac.cantidad as stock_actual,
      a.anaquel_id as numero_pasillo,
      p.nombre as zona,
      l.nombre as lugar_nombre,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_solicitante
    FROM reposicion_anaquel ra
    LEFT JOIN detalle_reposicion_anaquel dra ON ra.reposicion_anaquel_id = dra.fk_reposicion_anaquel
    LEFT JOIN anaquel_cerveza ac ON dra.fk_anaquel_cerveza = ac.anaquel_cerveza_id
    LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
    LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
    LEFT JOIN anaquel a ON ac.fk_anaquel = a.anaquel_id
    LEFT JOIN pasillo p ON a.fk_pasillo = p.pasillo_id
    LEFT JOIN lugar l ON p.fk_acaucab = l.lugar_id
    LEFT JOIN estado_reposicion_anaquel era ON ra.reposicion_anaquel_id = era.fk_reposicion_anaquel
    LEFT JOIN estado es ON era.fk_estado = es.estado_id
    LEFT JOIN empleado e ON e.empleado_id = 1
    WHERE ra.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    AND ac.cantidad <= 20
    ORDER BY ra.fecha DESC, ac.cantidad ASC;
  ELSE
    RETURN QUERY
    SELECT 
      ra.reposicion_anaquel_id as reposicion_id,
      ra.fecha as fecha_reposicion,
      dra.cantidad as cantidad_solicitada,
      es.nombre as estado,
      c.nombre as producto_nombre,
      ac.cantidad as stock_actual,
      a.anaquel_id as numero_pasillo,
      p.nombre as zona,
      l.nombre as lugar_nombre,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_solicitante
    FROM reposicion_anaquel ra
    LEFT JOIN detalle_reposicion_anaquel dra ON ra.reposicion_anaquel_id = dra.fk_reposicion_anaquel
    LEFT JOIN anaquel_cerveza ac ON dra.fk_anaquel_cerveza = ac.anaquel_cerveza_id
    LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
    LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
    LEFT JOIN anaquel a ON ac.fk_anaquel = a.anaquel_id
    LEFT JOIN pasillo p ON a.fk_pasillo = p.pasillo_id
    LEFT JOIN lugar l ON p.fk_acaucab = l.lugar_id
    LEFT JOIN estado_reposicion_anaquel era ON ra.reposicion_anaquel_id = era.fk_reposicion_anaquel
    LEFT JOIN estado es ON era.fk_estado = es.estado_id
    LEFT JOIN empleado e ON e.empleado_id = 1
    WHERE ac.cantidad <= 20
    ORDER BY ra.fecha DESC, ac.cantidad ASC
    LIMIT 100;
  END IF;
END;
$$;

-- 3. Función para Cuotas de Afiliación Pendientes
CREATE OR REPLACE FUNCTION get_report_cuotas_afiliacion_pendientes()
RETURNS TABLE (
  cliente_juridico_id INTEGER,
  razon_social VARCHAR,
  rif VARCHAR,
  direccion VARCHAR,
  fecha_afiliacion DATE,
  cuota_mensual INTEGER,
  estado_afiliacion VARCHAR,
  ultimo_pago VARCHAR,
  meses_pendientes INTEGER,
  monto_pendiente INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.cliente_id as cliente_juridico_id,
    cj.razon_social,
    cj.rif,
    cj.direccion,
    cj.fecha_afiliacion,
    1000 as cuota_mensual,
    'activo' as estado_afiliacion,
    COALESCE(MAX(p.fecha)::VARCHAR, 'Nunca') as ultimo_pago,
    EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM cj.fecha_afiliacion) as meses_pendientes,
    1000 * (EXTRACT(MONTH FROM CURRENT_DATE) - EXTRACT(MONTH FROM cj.fecha_afiliacion)) as monto_pendiente
  FROM cliente_juridico cj
  LEFT JOIN pago p ON cj.cliente_id = p.fk_venta_tienda
  WHERE cj.cliente_id IS NOT NULL
  AND (p.fecha IS NULL OR p.fecha < DATE_TRUNC('month', CURRENT_DATE))
  GROUP BY cj.cliente_id, cj.razon_social, cj.rif, cj.direccion, 
           cj.fecha_afiliacion
  ORDER BY monto_pendiente DESC, cj.razon_social;
END;
$$;

-- 4. Función para Nómina por Departamento
CREATE OR REPLACE FUNCTION get_report_nomina_departamento(
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
  empleado_id INTEGER,
  nombre_completo VARCHAR,
  cedula VARCHAR,
  fecha_contrato DATE,
  salario_base INTEGER,
  nombre_cargo VARCHAR,
  nombre_departamento VARCHAR,
  lugar_trabajo VARCHAR,
  beneficios INTEGER,
  costo_total INTEGER,
  anos_servicio INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      e.empleado_id,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo,
      e.cedula,
      e.fecha_contrato,
      50000 as salario_base,
      c.nombre as nombre_cargo,
      'Departamento General' as nombre_departamento,
      l.nombre as lugar_trabajo,
      0 as beneficios,
      50000 as costo_total,
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_contrato)) as anos_servicio
    FROM empleado e
    LEFT JOIN cargo c ON e.empleado_id = c.cargo_id
    LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
    WHERE e.fecha_contrato BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY nombre_departamento, nombre_cargo, e.primer_nombre;
  ELSE
    RETURN QUERY
    SELECT 
      e.empleado_id,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo,
      e.cedula,
      e.fecha_contrato,
      50000 as salario_base,
      c.nombre as nombre_cargo,
      'Departamento General' as nombre_departamento,
      l.nombre as lugar_trabajo,
      0 as beneficios,
      50000 as costo_total,
      EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.fecha_contrato)) as anos_servicio
    FROM empleado e
    LEFT JOIN cargo c ON e.empleado_id = c.cargo_id
    LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
    ORDER BY nombre_departamento, nombre_cargo, e.primer_nombre;
  END IF;
END;
$$;

-- 5. Función para Historial de Compras Cliente Jurídico
CREATE OR REPLACE FUNCTION get_report_historial_compras_cliente_juridico(
  p_cliente_id INTEGER DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
  venta_id INTEGER,
  fecha_venta DATE,
  monto_total NUMERIC,
  razon_social VARCHAR,
  rif VARCHAR,
  producto_nombre VARCHAR,
  cantidad INTEGER,
  precio_unitario NUMERIC,
  subtotal_producto NUMERIC,
  metodo_pago VARCHAR,
  empleado_atendio VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_cliente_id IS NOT NULL AND p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      vt.venta_tienda_id as venta_id,
      vt.fecha as fecha_venta,
      vt.total as monto_total,
      cj.razon_social,
      cj.rif,
      c.nombre as producto_nombre,
      dvt.cantidad,
      dvt.precio_unitario,
      dvt.cantidad * dvt.precio_unitario as subtotal_producto,
      'Efectivo' as metodo_pago,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_atendio
    FROM venta_tienda vt
    LEFT JOIN detalle_venta_tienda dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
    LEFT JOIN anaquel_cerveza ac ON dvt.fk_anaquel_cerveza = ac.anaquel_cerveza_id
    LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
    LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
    LEFT JOIN cliente_juridico cj ON vt.fk_cliente_juridico = cj.cliente_id
    LEFT JOIN empleado e ON e.empleado_id = 1
    WHERE vt.fk_cliente_juridico = p_cliente_id
    AND vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ORDER BY vt.fecha DESC, c.nombre;
  ELSIF p_cliente_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      vt.venta_tienda_id as venta_id,
      vt.fecha as fecha_venta,
      vt.total as monto_total,
      cj.razon_social,
      cj.rif,
      c.nombre as producto_nombre,
      dvt.cantidad,
      dvt.precio_unitario,
      dvt.cantidad * dvt.precio_unitario as subtotal_producto,
      'Efectivo' as metodo_pago,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_atendio
    FROM venta_tienda vt
    LEFT JOIN detalle_venta_tienda dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
    LEFT JOIN anaquel_cerveza ac ON dvt.fk_anaquel_cerveza = ac.anaquel_cerveza_id
    LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
    LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
    LEFT JOIN cliente_juridico cj ON vt.fk_cliente_juridico = cj.cliente_id
    LEFT JOIN empleado e ON e.empleado_id = 1
    WHERE vt.fk_cliente_juridico = p_cliente_id
    ORDER BY vt.fecha DESC, c.nombre;
  ELSE
    RETURN QUERY
    SELECT 
      vt.venta_tienda_id as venta_id,
      vt.fecha as fecha_venta,
      vt.total as monto_total,
      cj.razon_social,
      cj.rif,
      c.nombre as producto_nombre,
      dvt.cantidad,
      dvt.precio_unitario,
      dvt.cantidad * dvt.precio_unitario as subtotal_producto,
      'Efectivo' as metodo_pago,
      CONCAT(e.primer_nombre, ' ', e.primer_apellido) as empleado_atendio
    FROM venta_tienda vt
    LEFT JOIN detalle_venta_tienda dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
    LEFT JOIN anaquel_cerveza ac ON dvt.fk_anaquel_cerveza = ac.anaquel_cerveza_id
    LEFT JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
    LEFT JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
    LEFT JOIN cliente_juridico cj ON vt.fk_cliente_juridico = cj.cliente_id
    LEFT JOIN empleado e ON e.empleado_id = 1
    WHERE vt.fk_cliente_juridico IS NOT NULL
    ORDER BY vt.fecha DESC, c.nombre
    LIMIT 100;
  END IF;
END;
$$;

-- 6. Función para Stock Total de Cervezas
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

-- 7. Función para Stock por Almacén
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

-- 8. Función para Stock por Anaquel
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

-- 9. Función para Cervezas con Stock Bajo
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

-- 10. Función para Cervezas Sin Stock
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

-- 11. Función para Stock de Cerveza Específica
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
SELECT '✅ Todas las funciones de reportes han sido creadas exitosamente' as mensaje; 