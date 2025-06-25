-- Script de diagnóstico completo para el problema de empleados
-- Ejecutar este script en PostgreSQL para identificar el problema

-- ========================================
-- 1. VERIFICAR ESTRUCTURA DE LA BASE DE DATOS
-- ========================================

-- Verificar si la tabla empleado existe
SELECT 
    'Tabla empleado' as verificación,
    EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'empleado'
    ) as existe;

-- Verificar estructura de la tabla empleado
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'empleado'
ORDER BY ordinal_position;

-- ========================================
-- 2. VERIFICAR DATOS EN LA TABLA
-- ========================================

-- Contar empleados
SELECT 
    'Total empleados' as métrica,
    COUNT(*) as valor
FROM empleado;

-- Mostrar algunos empleados
SELECT 
    empleado_id,
    cedula,
    primer_nombre,
    primer_apellido,
    segundo_nombre,
    segundo_apellido,
    fecha_contrato
FROM empleado
ORDER BY primer_nombre, primer_apellido
LIMIT 10;

-- ========================================
-- 3. VERIFICAR FUNCIONES SQL
-- ========================================

-- Verificar si las funciones existen
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition IS NOT NULL as tiene_definicion
FROM information_schema.routines 
WHERE routine_name IN ('get_empleados', 'get_empleados_simple', 'get_empleados_disponibles')
ORDER BY routine_name;

-- ========================================
-- 4. PROBAR CONSULTAS DIRECTAS
-- ========================================

-- Consulta directa básica
SELECT 
    'Consulta directa básica' as prueba,
    COUNT(*) as registros
FROM empleado;

-- Consulta con formato esperado por la aplicación
SELECT 
    empleado_id::TEXT as id,
    cedula,
    primer_nombre,
    primer_apellido,
    CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo
FROM empleado
ORDER BY primer_nombre, primer_apellido
LIMIT 5;

-- ========================================
-- 5. PROBAR FUNCIONES (si existen)
-- ========================================

-- Probar get_empleados()
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_empleados') THEN
        RAISE NOTICE 'Probando función get_empleados()...';
        PERFORM COUNT(*) FROM get_empleados();
        RAISE NOTICE 'Función get_empleados() ejecutada exitosamente';
    ELSE
        RAISE NOTICE 'Función get_empleados() NO existe';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en get_empleados(): %', SQLERRM;
END $$;

-- Probar get_empleados_simple()
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_empleados_simple') THEN
        RAISE NOTICE 'Probando función get_empleados_simple()...';
        PERFORM COUNT(*) FROM get_empleados_simple();
        RAISE NOTICE 'Función get_empleados_simple() ejecutada exitosamente';
    ELSE
        RAISE NOTICE 'Función get_empleados_simple() NO existe';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error en get_empleados_simple(): %', SQLERRM;
END $$;

-- ========================================
-- 6. VERIFICAR EMPLEADOS DISPONIBLES
-- ========================================

-- Empleados sin usuarios asignados
SELECT 
    'Empleados sin usuarios' as tipo,
    COUNT(*) as cantidad
FROM empleado e
LEFT JOIN usuario u ON e.empleado_id = u.fk_empleado
WHERE u.fk_empleado IS NULL;

-- Lista de empleados disponibles
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

-- ========================================
-- 7. VERIFICAR SCHEMA Y PERMISOS
-- ========================================

-- Verificar schema actual
SELECT current_schema() as schema_actual;

-- Verificar search_path
SHOW search_path;

-- Verificar permisos del usuario actual
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'empleado' 
AND grantee = current_user;

-- ========================================
-- 8. RECOMENDACIONES
-- ========================================

-- Si no hay empleados, insertar algunos de prueba
DO $$
DECLARE
    empleado_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO empleado_count FROM empleado;
    
    IF empleado_count = 0 THEN
        RAISE NOTICE 'NO HAY EMPLEADOS EN LA TABLA. Insertando empleados de prueba...';
        
        INSERT INTO empleado (cedula, primer_nombre, primer_apellido, segundo_nombre, segundo_apellido, direccion, fecha_contrato, fk_lugar) VALUES
        (12345678, 'Juan', 'Pérez', 'Carlos', 'González', 'Av. Principal 123, Caracas', '2023-01-15', 1),
        (23456789, 'María', 'García', 'Isabel', 'Rodríguez', 'Calle Comercial 456, Valencia', '2023-02-20', 1),
        (34567890, 'Carlos', 'López', 'Alberto', 'Martínez', 'Urbanización Los Rosales 789, Maracay', '2023-03-10', 1),
        (45678901, 'Ana', 'Hernández', 'María', 'Fernández', 'Plaza Bolívar 321, Barquisimeto', '2023-04-05', 1),
        (56789012, 'Luis', 'González', 'Miguel', 'Sánchez', 'Avenida Libertador 654, Mérida', '2023-05-12', 1);
        
        RAISE NOTICE 'Se insertaron 5 empleados de prueba';
    ELSE
        RAISE NOTICE 'Hay % empleados en la tabla', empleado_count;
    END IF;
END $$; 