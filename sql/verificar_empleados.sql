-- Script para verificar empleados en la base de datos
-- Ejecutar en PostgreSQL para diagnosticar el problema

-- 1. Verificar si la tabla empleado existe y tiene datos
SELECT 
    'Tabla empleado' as tabla,
    COUNT(*) as total_registros
FROM empleado;

-- 2. Verificar la estructura de la tabla empleado
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empleado'
ORDER BY ordinal_position;

-- 3. Verificar si la función get_empleados() existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'get_empleados';

-- 4. Probar la función get_empleados() directamente
SELECT * FROM get_empleados() LIMIT 5;

-- 5. Verificar si hay empleados sin usuarios asignados (para mostrar en el dropdown)
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