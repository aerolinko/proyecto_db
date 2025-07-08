-- =====================================================
-- VERIFICAR DATOS EN TABLA PREMIACION
-- =====================================================

-- 1. Verificar estructura de la tabla PREMIACION
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'premiacion' 
ORDER BY ordinal_position;

-- 2. Verificar cuántos registros hay en PREMIACION
SELECT COUNT(*) as total_premiaciones FROM premiacion;

-- 3. Verificar todos los tipos de premiación que existen
SELECT tipo, COUNT(*) as cantidad
FROM premiacion 
GROUP BY tipo
ORDER BY cantidad DESC;

-- 4. Verificar si hay premiaciones con tipo 'actividad'
SELECT * FROM premiacion WHERE tipo = 'actividad';

-- 5. Verificar todas las premiaciones con información del evento
SELECT 
    p.premiacion_id,
    p.nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    p.tipo,
    e.evento_id,
    e.nombre as evento_nombre,
    l.nombre as lugar_nombre
FROM premiacion p
LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
LEFT JOIN evento e ON pe.fk_evento = e.evento_id
LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
ORDER BY p.fecha DESC, p.hora_inicio;

-- 6. Verificar estructura de PREMIACION_EVENTO
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'premiacion_evento' 
ORDER BY ordinal_position;

-- 7. Verificar datos en PREMIACION_EVENTO
SELECT COUNT(*) as total_relaciones FROM premiacion_evento;

-- 8. Verificar relación entre premiaciones y eventos
SELECT 
    pe.premiacion_evento_id,
    p.premiacion_id,
    p.nombre as premiacion_nombre,
    p.tipo,
    e.evento_id,
    e.nombre as evento_nombre
FROM premiacion_evento pe
JOIN premiacion p ON pe.fk_premiacion = p.premiacion_id
JOIN evento e ON pe.fk_evento = e.evento_id
ORDER BY p.fecha DESC; 