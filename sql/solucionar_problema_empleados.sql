-- Script completo para diagnosticar y solucionar el problema de empleados
-- Ejecutar este script en PostgreSQL

-- 1. Verificar si la tabla empleado existe y tiene datos
SELECT 
    'Tabla empleado' as tabla,
    COUNT(*) as total_registros
FROM empleado;

-- 2. Verificar si la función get_empleados() existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_empleados';

-- 3. Probar la función get_empleados() directamente
SELECT * FROM get_empleados() LIMIT 5;

-- 4. Corregir la función update_usuario_with_empleado (si existe el problema de ambigüedad)
DROP FUNCTION IF EXISTS update_usuario_with_empleado(INTEGER, VARCHAR, VARCHAR, INTEGER);

CREATE OR REPLACE FUNCTION update_usuario_with_empleado(p_id INTEGER, p_email VARCHAR, p_password VARCHAR DEFAULT NULL, p_empleado_id INTEGER DEFAULT NULL)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  empleado_id TEXT,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  empleado_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el usuario existe
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario_id = p_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  -- Si se proporciona empleadoId, verificar que existe
  IF p_empleado_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM empleado e WHERE e.empleado_id = p_empleado_id) THEN
    RAISE EXCEPTION 'El empleado seleccionado no existe';
  END IF;

  -- Actualizar usuario
  IF p_password IS NOT NULL AND p_empleado_id IS NOT NULL THEN
    UPDATE usuario SET nombre_usuario = p_email, hash_contrasena = p_password, fk_empleado = p_empleado_id WHERE usuario_id = p_id;
  ELSIF p_password IS NOT NULL THEN
    UPDATE usuario SET nombre_usuario = p_email, hash_contrasena = p_password WHERE usuario_id = p_id;
  ELSIF p_empleado_id IS NOT NULL THEN
    UPDATE usuario SET nombre_usuario = p_email, fk_empleado = p_empleado_id WHERE usuario_id = p_id;
  ELSE
    UPDATE usuario SET nombre_usuario = p_email WHERE usuario_id = p_id;
  END IF;

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_empleado::TEXT as empleado_id,
    e.primer_nombre,
    e.primer_apellido,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as empleado_nombre
  FROM usuario u
  LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
  WHERE u.usuario_id = p_id;
END;
$$;

-- 5. Insertar empleados de prueba si no existen
DO $$
DECLARE
    empleado_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO empleado_count FROM empleado;
    
    -- Solo insertar si no hay empleados
    IF empleado_count = 0 THEN
        -- Insertar empleados de prueba
        INSERT INTO empleado (cedula, primer_nombre, primer_apellido, segundo_nombre, segundo_apellido, direccion, fecha_contrato, fk_lugar) VALUES
        (12345678, 'Juan', 'Pérez', 'Carlos', 'González', 'Av. Principal 123, Caracas', '2023-01-15', 1),
        (23456789, 'María', 'García', 'Isabel', 'Rodríguez', 'Calle Comercial 456, Valencia', '2023-02-20', 1),
        (34567890, 'Carlos', 'López', 'Alberto', 'Martínez', 'Urbanización Los Rosales 789, Maracay', '2023-03-10', 1),
        (45678901, 'Ana', 'Hernández', 'María', 'Fernández', 'Plaza Bolívar 321, Barquisimeto', '2023-04-05', 1),
        (56789012, 'Luis', 'González', 'Miguel', 'Sánchez', 'Avenida Libertador 654, Mérida', '2023-05-12', 1);
        
        RAISE NOTICE 'Se insertaron 5 empleados de prueba';
    ELSE
        RAISE NOTICE 'Ya existen % empleados en la base de datos', empleado_count;
    END IF;
END $$;

-- 6. Mostrar empleados disponibles para seleccionar
SELECT 
    empleado_id,
    cedula,
    primer_nombre,
    primer_apellido,
    CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo,
    fecha_contrato
FROM empleado
ORDER BY primer_nombre, primer_apellido;

-- 7. Verificar empleados sin usuarios asignados (para mostrar en el dropdown)
SELECT 
    e.empleado_id,
    e.cedula,
    e.primer_nombre,
    e.primer_apellido,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido) as nombre_completo
FROM empleado e
LEFT JOIN usuario u ON e.empleado_id = u.fk_empleado
WHERE u.fk_empleado IS NULL
ORDER BY e.primer_nombre, e.primer_apellido; 