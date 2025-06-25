-- Corregir y mejorar la función get_empleados
-- Esta versión es más robusta y maneja mejor los errores

-- Primero eliminar la función existente
DROP FUNCTION IF EXISTS get_empleados();

-- Crear la función mejorada
CREATE OR REPLACE FUNCTION get_empleados()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  segundo_nombre VARCHAR,
  segundo_apellido VARCHAR,
  direccion VARCHAR,
  fecha_contrato DATE,
  fk_lugar INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
  empleado_count INTEGER;
BEGIN
  -- Verificar si la tabla empleado existe y tiene datos
  SELECT COUNT(*) INTO empleado_count FROM empleado;
  
  -- Log para debugging
  RAISE NOTICE 'Función get_empleados() ejecutada. Total empleados: %', empleado_count;
  
  -- Si no hay empleados, retornar tabla vacía
  IF empleado_count = 0 THEN
    RAISE NOTICE 'No hay empleados en la tabla empleado';
    RETURN;
  END IF;

  -- Retornar empleados
  RETURN QUERY
  SELECT 
    e.empleado_id::TEXT as id,
    e.cedula,
    e.primer_nombre,
    e.primer_apellido,
    COALESCE(e.segundo_nombre, '')::VARCHAR as segundo_nombre,
    COALESCE(e.segundo_apellido, '')::VARCHAR as segundo_apellido,
    e.direccion,
    e.fecha_contrato,
    e.fk_lugar,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as nombre_completo,
    TRIM(CONCAT(
      e.primer_nombre, ' ', 
      COALESCE(e.segundo_nombre, ''), ' ', 
      e.primer_apellido, ' ', 
      COALESCE(e.segundo_apellido, '')
    ))::VARCHAR as nombre_completo_full
  FROM empleado e
  ORDER BY e.primer_nombre, e.primer_apellido;
  
  RAISE NOTICE 'Función get_empleados() completada exitosamente';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error en get_empleados(): %', SQLERRM;
    RAISE;
END;
$$;

-- Función alternativa más simple para testing
CREATE OR REPLACE FUNCTION get_empleados_simple()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  nombre_completo VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.empleado_id::TEXT as id,
    e.cedula,
    e.primer_nombre,
    e.primer_apellido,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as nombre_completo
  FROM empleado e
  ORDER BY e.primer_nombre, e.primer_apellido;
END;
$$;

-- Función para obtener solo empleados sin usuarios asignados
CREATE OR REPLACE FUNCTION get_empleados_disponibles()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  nombre_completo VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.empleado_id::TEXT as id,
    e.cedula,
    e.primer_nombre,
    e.primer_apellido,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as nombre_completo
  FROM empleado e
  LEFT JOIN usuario u ON e.empleado_id = u.fk_empleado
  WHERE u.fk_empleado IS NULL
  ORDER BY e.primer_nombre, e.primer_apellido;
END;
$$; 