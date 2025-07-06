-- =====================================================
-- FUNCIONES SQL PARA CATÁLOGO DE EVENTOS (CORREGIDAS)
-- =====================================================

-- Función para obtener productos de un evento específico
CREATE OR REPLACE FUNCTION obtener_productos_evento(p_evento_id INTEGER)
RETURNS TABLE (
  evento_miembro_acaucab_id INTEGER,
  cerveza_nombre VARCHAR(50),
  presentacion_material VARCHAR(50),
  presentacion_capacidad INTEGER,
  proveedor_nombre VARCHAR(100),
  cantidad_disponible INTEGER,
  cerveza_id INTEGER,
  densidad_inicial NUMERIC(4,3),
  densidad_final NUMERIC(4,3),
  ibus NUMERIC(3),
  alcohol NUMERIC(5,2),
  tipo_cerveza_nombre VARCHAR(50),
  estilo_cerveza_nombre VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ema.evento_miembro_acaucab_id,
    c.nombre as cerveza_nombre,
    p.material as presentacion_material,
    p.cap_volumen as presentacion_capacidad,
    ma.razon_social as proveedor_nombre,
    ema.cantidad as cantidad_disponible,
    c.cerveza_id,
    c.densidad_inicial,
    c.densidad_final,
    c.ibus as ibus,
    c.nivel_alcohol as alcohol,
    tc.nombre as tipo_cerveza_nombre,
    ec.nombre as estilo_cerveza_nombre
  FROM evento_miembro_acaucab ema
  INNER JOIN cerveza_presentacion cp ON ema.fk_cerveza_presentacion = cp.cerveza_presentacion_id
  INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
  INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  INNER JOIN miembro_acaucab ma ON ema.fk_miembro_acaucab = ma.miembro_id
  LEFT JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
  LEFT JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
  WHERE ema.fk_evento = p_evento_id
  ORDER BY c.nombre, p.cap_volumen;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener catálogo completo de un evento
CREATE OR REPLACE FUNCTION obtener_catalogo_evento(p_evento_id INTEGER)
RETURNS TABLE (
  evento_miembro_acaucab_id INTEGER,
  evento_id INTEGER,
  evento_nombre VARCHAR(50),
  evento_fecha_inicio DATE,
  evento_fecha_fin DATE,
  evento_lugar VARCHAR(50),
  evento_tipo VARCHAR(50),
  cerveza_id INTEGER,
  cerveza_nombre VARCHAR(50),
  cerveza_densidad_inicial NUMERIC(4,3),
  cerveza_densidad_final NUMERIC(4,3),
  cerveza_ibus NUMERIC(3),
  cerveza_alcohol NUMERIC(5,2),
  presentacion_id INTEGER,
  presentacion_material VARCHAR(50),
  presentacion_capacidad INTEGER,
  proveedor_id INTEGER,
  proveedor_nombre VARCHAR(100),
  proveedor_razon_social VARCHAR(100),
  proveedor_direccion VARCHAR(255),
  proveedor_pagina_web VARCHAR(255),
  cantidad_disponible INTEGER,
  tipo_cerveza_nombre VARCHAR(50),
  estilo_cerveza_nombre VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ema.evento_miembro_acaucab_id,
    e.evento_id,
    e.nombre as evento_nombre,
    e.fecha_inicio as evento_fecha_inicio,
    e.fecha_fin as evento_fecha_fin,
    l.nombre as evento_lugar,
    te.nombre as evento_tipo,
    c.cerveza_id,
    c.nombre as cerveza_nombre,
    c.densidad_inicial as cerveza_densidad_inicial,
    c.densidad_final as cerveza_densidad_final,
    c.ibus as cerveza_ibus,
    c.nivel_alcohol as cerveza_alcohol,
    p.presentacion_id,
    p.material as presentacion_material,
    p.cap_volumen as presentacion_capacidad,
    ma.miembro_id as proveedor_id,
    ma.razon_social as proveedor_nombre,
    ma.razon_social as proveedor_razon_social,
    ma.direccion as proveedor_direccion,
    ma.pagina_web as proveedor_pagina_web,
    ema.cantidad as cantidad_disponible,
    tc.nombre as tipo_cerveza_nombre,
    ec.nombre as estilo_cerveza_nombre
  FROM evento_miembro_acaucab ema
  INNER JOIN evento e ON ema.fk_evento = e.evento_id
  INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
  INNER JOIN tipo_evento te ON e.fk_tipo_evento = te.tipo_evento_id
  INNER JOIN cerveza_presentacion cp ON ema.fk_cerveza_presentacion = cp.cerveza_presentacion_id
  INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
  INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  INNER JOIN miembro_acaucab ma ON ema.fk_miembro_acaucab = ma.miembro_id
  LEFT JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
  LEFT JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
  WHERE ema.fk_evento = p_evento_id
  ORDER BY c.nombre, p.cap_volumen;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener empleados de un evento
CREATE OR REPLACE FUNCTION obtener_empleados_evento(p_evento_id INTEGER)
RETURNS TABLE (
  empleado_id INTEGER,
  primer_nombre VARCHAR(50),
  primer_apellido VARCHAR(50),
  cedula INTEGER,
  direccion VARCHAR(255),
  fecha_contrato DATE,
  ubicacion VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    emp.empleado_id,
    emp.primer_nombre,
    emp.primer_apellido,
    emp.cedula,
    emp.direccion,
    emp.fecha_contrato,
    l.nombre as ubicacion
  FROM evento_empleado ee
  INNER JOIN empleado emp ON ee.fk_empleado = emp.empleado_id
  INNER JOIN lugar l ON emp.fk_lugar = l.lugar_id
  WHERE ee.fk_evento = p_evento_id
  ORDER BY emp.primer_nombre, emp.primer_apellido;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener proveedores de un evento
CREATE OR REPLACE FUNCTION obtener_proveedores_evento(p_evento_id INTEGER)
RETURNS TABLE (
  miembro_id INTEGER,
  razon_social VARCHAR(100),
  denominacion_comercial VARCHAR(100),
  direccion VARCHAR(255),
  pagina_web VARCHAR(255),
  ubicacion VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    ma.miembro_id,
    ma.razon_social,
    ma.denominacion_comercial,
    ma.direccion,
    ma.pagina_web,
    l.nombre as ubicacion
  FROM evento_miembro_acaucab ema
  INNER JOIN miembro_acaucab ma ON ema.fk_miembro_acaucab = ma.miembro_id
  INNER JOIN lugar l ON ma.fk_lugar = l.lugar_id
  WHERE ema.fk_evento = p_evento_id
  ORDER BY ma.razon_social;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resumen de productos por evento
CREATE OR REPLACE FUNCTION obtener_resumen_eventos()
RETURNS TABLE (
  evento_id INTEGER,
  evento VARCHAR(50),
  fecha_inicio DATE,
  fecha_fin DATE,
  total_productos BIGINT,
  total_proveedores BIGINT,
  stock_total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.evento_id,
    e.nombre as evento,
    e.fecha_inicio,
    e.fecha_fin,
    COUNT(DISTINCT ema.fk_cerveza_presentacion) as total_productos,
    COUNT(DISTINCT ema.fk_miembro_acaucab) as total_proveedores,
    SUM(ema.cantidad) as stock_total
  FROM evento e
  LEFT JOIN evento_miembro_acaucab ema ON e.evento_id = ema.fk_evento
  GROUP BY e.evento_id, e.nombre, e.fecha_inicio, e.fecha_fin
  ORDER BY e.fecha_inicio DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un evento tiene catálogo
CREATE OR REPLACE FUNCTION verificar_catalogo_evento(p_evento_id INTEGER)
RETURNS TABLE (
  estado_catalogo TEXT,
  total_productos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 'SÍ TIENE CATÁLOGO'
      ELSE 'NO TIENE CATÁLOGO'
    END as estado_catalogo,
    COUNT(*) as total_productos
  FROM evento_miembro_acaucab
  WHERE fk_evento = p_evento_id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del catálogo
CREATE OR REPLACE FUNCTION obtener_estadisticas_catalogo()
RETURNS TABLE (
  total_eventos BIGINT,
  total_productos_catalogo BIGINT,
  eventos_con_catalogo BIGINT,
  total_proveedores_activos BIGINT,
  total_productos_unicos BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM evento) as total_eventos,
    (SELECT COUNT(*) FROM evento_miembro_acaucab) as total_productos_catalogo,
    (SELECT COUNT(DISTINCT fk_evento) FROM evento_miembro_acaucab) as eventos_con_catalogo,
    (SELECT COUNT(DISTINCT fk_miembro_acaucab) FROM evento_miembro_acaucab) as total_proveedores_activos,
    (SELECT COUNT(DISTINCT fk_cerveza_presentacion) FROM evento_miembro_acaucab) as total_productos_unicos;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN SQL PARA CATÁLOGO DE EVENTO CON PROVEEDOR Y RIF SIEMPRE
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_catalogo_evento_v2(p_evento_id INTEGER)
RETURNS TABLE (
  evento_miembro_acaucab_id INTEGER,
  evento_id INTEGER,
  evento_nombre VARCHAR(50),
  evento_fecha_inicio DATE,
  evento_fecha_fin DATE,
  evento_lugar VARCHAR(50),
  evento_tipo VARCHAR(50),
  cerveza_id INTEGER,
  cerveza_nombre VARCHAR(50),
  cerveza_densidad_inicial NUMERIC(4,3),
  cerveza_densidad_final NUMERIC(4,3),
  cerveza_ibus NUMERIC(3),
  cerveza_alcohol NUMERIC(5,2),
  presentacion_id INTEGER,
  presentacion_material VARCHAR(50),
  presentacion_capacidad INTEGER,
  proveedor_id INTEGER,
  proveedor_nombre VARCHAR(100),
  proveedor_rif VARCHAR(12),
  proveedor_direccion VARCHAR(255),
  proveedor_pagina_web VARCHAR(255),
  cantidad_disponible INTEGER,
  tipo_cerveza_nombre VARCHAR(50),
  estilo_cerveza_nombre VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ema.evento_miembro_acaucab_id,
    e.evento_id,
    e.nombre as evento_nombre,
    e.fecha_inicio as evento_fecha_inicio,
    e.fecha_fin as evento_fecha_fin,
    l.nombre as evento_lugar,
    te.nombre as evento_tipo,
    c.cerveza_id,
    c.nombre as cerveza_nombre,
    c.densidad_inicial as cerveza_densidad_inicial,
    c.densidad_final as cerveza_densidad_final,
    c.ibus as cerveza_ibus,
    c.nivel_alcohol as cerveza_alcohol,
    p.presentacion_id,
    p.material as presentacion_material,
    p.cap_volumen as presentacion_capacidad,
    ma.miembro_id as proveedor_id,
    ma.razon_social as proveedor_nombre,
    ma.rif as proveedor_rif,
    ma.direccion as proveedor_direccion,
    ma.pagina_web as proveedor_pagina_web,
    ema.cantidad as cantidad_disponible,
    tc.nombre as tipo_cerveza_nombre,
    ec.nombre as estilo_cerveza_nombre
  FROM evento_miembro_acaucab ema
  INNER JOIN evento e ON ema.fk_evento = e.evento_id
  INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
  INNER JOIN tipo_evento te ON e.fk_tipo_evento = te.tipo_evento_id
  INNER JOIN cerveza_presentacion cp ON ema.fk_cerveza_presentacion = cp.cerveza_presentacion_id
  INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
  INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
  INNER JOIN miembro_acaucab ma ON ema.fk_miembro_acaucab = ma.miembro_id
  LEFT JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
  LEFT JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
  WHERE ema.fk_evento = p_evento_id
  ORDER BY c.nombre, p.cap_volumen;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EJEMPLOS DE USO DE LAS FUNCIONES
-- =====================================================

-- Obtener productos del evento con ID 1
-- SELECT * FROM obtener_productos_evento(1);

-- Obtener catálogo completo del evento con ID 1
-- SELECT * FROM obtener_catalogo_evento(1);

-- Obtener empleados del evento con ID 1
-- SELECT * FROM obtener_empleados_evento(1);

-- Obtener proveedores del evento con ID 1
-- SELECT * FROM obtener_proveedores_evento(1);

-- Obtener resumen de todos los eventos
-- SELECT * FROM obtener_resumen_eventos();

-- Verificar si el evento con ID 1 tiene catálogo
-- SELECT * FROM verificar_catalogo_evento(1);

-- Obtener estadísticas generales
-- SELECT * FROM obtener_estadisticas_catalogo(); 