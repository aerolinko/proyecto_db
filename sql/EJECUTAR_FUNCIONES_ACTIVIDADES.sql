-- =====================================================
-- SCRIPT PARA EJECUTAR FUNCIONES DE ACTIVIDADES
-- Ejecutar este script en tu base de datos PostgreSQL
-- =====================================================

-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- =====================================================

-- Verificar que las tablas existen
SELECT 'PREMIACION' as tabla, COUNT(*) as registros FROM premiacion
UNION ALL
SELECT 'PREMIACION_EVENTO' as tabla, COUNT(*) as registros FROM premiacion_evento
UNION ALL
SELECT 'EVENTO' as tabla, COUNT(*) as registros FROM evento;

-- Verificar estructura de tabla PREMIACION
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'premiacion' 
ORDER BY ordinal_position;

-- Verificar estructura de tabla PREMIACION_EVENTO
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'premiacion_evento' 
ORDER BY ordinal_position;

-- 2. CREAR FUNCIONES (ejecutar desde ACTIVIDADES_SCRIPTS.sql)
-- =====================================================

-- Las funciones ya están definidas en ACTIVIDADES_SCRIPTS.sql
-- Ejecutar ese archivo primero

-- 3. PROBAR FUNCIONES
-- =====================================================

-- Verificar que las funciones existen
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%actividad%'
ORDER BY routine_name;

-- 4. EJEMPLOS DE USO
-- =====================================================

-- Obtener todos los eventos disponibles
SELECT evento_id, nombre, fecha_inicio, fecha_fin 
FROM evento 
ORDER BY fecha_inicio;

-- Crear una actividad de prueba (reemplazar con IDs reales)
-- SELECT crear_actividad(1, 'Degustación de cervezas', '2024-01-15', '14:00', '16:00');

-- Obtener actividades de un evento específico
-- SELECT * FROM obtener_actividades_evento(1);

-- Obtener todas las actividades
-- SELECT * FROM obtener_todas_actividades();

-- Ver actividades de hoy
-- SELECT * FROM vista_actividades_hoy;

-- Ver todas las actividades con información completa
-- SELECT * FROM vista_actividades_completas;

-- 5. VERIFICAR FUNCIONAMIENTO
-- =====================================================

-- Verificar que las vistas existen
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name LIKE '%actividad%'
ORDER BY table_name;

-- Verificar índices creados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('premiacion', 'premiacion_evento')
ORDER BY tablename, indexname;

-- 6. LIMPIAR DATOS DE PRUEBA (opcional)
-- =====================================================

-- Eliminar actividades de prueba (descomentar si es necesario)
-- DELETE FROM premiacion WHERE tipo = 'actividad' AND nombre LIKE '%prueba%';

-- 7. CONSULTAS ÚTILES PARA MONITOREO
-- =====================================================

-- Contar actividades por evento
SELECT 
    e.nombre as evento_nombre,
    COUNT(p.premiacion_id) as total_actividades
FROM evento e
LEFT JOIN premiacion_evento pe ON e.evento_id = pe.fk_evento
LEFT JOIN premiacion p ON pe.fk_premiacion = p.premiacion_id AND p.tipo = 'actividad'
GROUP BY e.evento_id, e.nombre
ORDER BY total_actividades DESC;

-- Actividades por fecha
SELECT 
    fecha,
    COUNT(*) as total_actividades
FROM premiacion 
WHERE tipo = 'actividad'
GROUP BY fecha
ORDER BY fecha;

-- Actividades próximas (próximos 7 días)
SELECT 
    p.nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    e.nombre as evento_nombre
FROM premiacion p
INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
INNER JOIN evento e ON pe.fk_evento = e.evento_id
WHERE p.tipo = 'actividad'
AND p.fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY p.fecha, p.hora_inicio; 