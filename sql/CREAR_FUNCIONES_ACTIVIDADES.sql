-- =====================================================
-- SCRIPT PARA CREAR FUNCIONES DE ACTIVIDADES
-- Ejecutar este script en tu base de datos PostgreSQL
-- =====================================================

-- 1. CREAR FUNCIONES PARA CRUD
-- =====================================================

-- Función para obtener todas las actividades de un evento
CREATE OR REPLACE FUNCTION obtener_actividades_evento(evento_id_param INTEGER)
RETURNS TABLE (
    premiacion_id INTEGER,
    nombre VARCHAR(50),
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    tipo VARCHAR(50),
    premiacion_evento_id INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.premiacion_id,
        p.nombre,
        p.fecha,
        p.hora_inicio,
        p.hora_fin,
        p.tipo,
        pe.premiacion_evento_id
    FROM premiacion p
    INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
    WHERE pe.fk_evento = evento_id_param
    AND p.tipo = 'actividad'
    ORDER BY p.fecha, p.hora_inicio;
END;
$$ LANGUAGE plpgsql;

-- Función para crear una nueva actividad
CREATE OR REPLACE FUNCTION crear_actividad(
    evento_id_param INTEGER,
    nombre_param VARCHAR(50),
    fecha_param DATE,
    hora_inicio_param TIME,
    hora_fin_param TIME
)
RETURNS INTEGER AS $$
DECLARE
    nueva_premiacion_id INTEGER;
BEGIN
    -- Insertar la premiación (actividad)
    INSERT INTO premiacion (nombre, fecha, hora_inicio, hora_fin, tipo)
    VALUES (nombre_param, fecha_param, hora_inicio_param, hora_fin_param, 'actividad')
    RETURNING premiacion_id INTO nueva_premiacion_id;
    
    -- Relacionar con el evento
    INSERT INTO premiacion_evento (fk_evento, fk_premiacion)
    VALUES (evento_id_param, nueva_premiacion_id);
    
    RETURN nueva_premiacion_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar una actividad
CREATE OR REPLACE FUNCTION actualizar_actividad(
    premiacion_id_param INTEGER,
    nombre_param VARCHAR(50),
    fecha_param DATE,
    hora_inicio_param TIME,
    hora_fin_param TIME
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE premiacion 
    SET 
        nombre = nombre_param,
        fecha = fecha_param,
        hora_inicio = hora_inicio_param,
        hora_fin = hora_fin_param
    WHERE premiacion_id = premiacion_id_param
    AND tipo = 'actividad';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para eliminar una actividad
CREATE OR REPLACE FUNCTION eliminar_actividad(premiacion_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM premiacion 
    WHERE premiacion_id = premiacion_id_param
    AND tipo = 'actividad';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener todas las actividades (vista general)
CREATE OR REPLACE FUNCTION obtener_todas_actividades()
RETURNS TABLE (
    premiacion_id INTEGER,
    nombre VARCHAR(50),
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    tipo VARCHAR(50),
    evento_id INTEGER,
    evento_nombre VARCHAR(50),
    lugar_nombre VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
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
    INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
    INNER JOIN evento e ON pe.fk_evento = e.evento_id
    INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
    WHERE p.tipo = 'actividad'
    ORDER BY p.fecha, p.hora_inicio;
END;
$$ LANGUAGE plpgsql;

-- 2. CREAR VISTAS ÚTILES
-- =====================================================

-- Vista para actividades con información del evento
CREATE OR REPLACE VIEW vista_actividades_completas AS
SELECT 
    p.premiacion_id,
    p.nombre as actividad_nombre,
    p.fecha,
    p.hora_inicio,
    p.hora_fin,
    e.evento_id,
    e.nombre as evento_nombre,
    e.capacidad,
    l.nombre as lugar_nombre,
    te.nombre as tipo_evento
FROM premiacion p
INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
INNER JOIN evento e ON pe.fk_evento = e.evento_id
INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
INNER JOIN tipo_evento te ON e.fk_tipo_evento = te.tipo_evento_id
WHERE p.tipo = 'actividad'
ORDER BY p.fecha, p.hora_inicio;

-- Vista para actividades del día actual
CREATE OR REPLACE VIEW vista_actividades_hoy AS
SELECT 
    p.premiacion_id,
    p.nombre as actividad_nombre,
    p.hora_inicio,
    p.hora_fin,
    e.nombre as evento_nombre,
    l.nombre as lugar_nombre
FROM premiacion p
INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
INNER JOIN evento e ON pe.fk_evento = e.evento_id
INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
WHERE p.tipo = 'actividad'
AND p.fecha = CURRENT_DATE
ORDER BY p.hora_inicio;

-- 3. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_premiacion_fecha ON premiacion(fecha);

-- Índice para búsquedas por tipo
CREATE INDEX IF NOT EXISTS idx_premiacion_tipo ON premiacion(tipo);

-- Índice para búsquedas por evento
CREATE INDEX IF NOT EXISTS idx_premiacion_evento_fk_evento ON premiacion_evento(fk_evento);

-- Índice compuesto para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_premiacion_fecha_tipo ON premiacion(fecha, tipo);

-- 4. VERIFICAR QUE LAS FUNCIONES SE CREARON
-- =====================================================

-- Verificar que las funciones existen
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%actividad%'
ORDER BY routine_name;

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

-- 5. PROBAR FUNCIONES CON DATOS DE PRUEBA
-- =====================================================

-- Obtener todos los eventos disponibles
SELECT evento_id, nombre, fecha_inicio, fecha_fin 
FROM evento 
ORDER BY fecha_inicio;

-- Crear una actividad de prueba (descomentar y ajustar IDs)
-- SELECT crear_actividad(1, 'Degustación de cervezas', '2024-01-15', '14:00', '16:00');

-- Obtener actividades de un evento específico (descomentar y ajustar ID)
-- SELECT * FROM obtener_actividades_evento(1);

-- Obtener todas las actividades
-- SELECT * FROM obtener_todas_actividades();

-- Ver actividades de hoy
-- SELECT * FROM vista_actividades_hoy;

-- Ver todas las actividades con información completa
-- SELECT * FROM vista_actividades_completas; 