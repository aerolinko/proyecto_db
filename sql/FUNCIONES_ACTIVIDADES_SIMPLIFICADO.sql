-- =====================================================
-- FUNCIONES SIMPLIFICADAS PARA ACTIVIDADES (PREMIACIONES)
-- =====================================================

-- Función para obtener todas las actividades (premiaciones con tipo 'actividad')
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

-- Función para obtener actividades de un evento específico
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

-- Función para crear una nueva actividad (premiación)
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

-- Función para actualizar una actividad (premiación)
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

-- Función para eliminar una actividad (premiación)
CREATE OR REPLACE FUNCTION eliminar_actividad(premiacion_id_param INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM premiacion 
    WHERE premiacion_id = premiacion_id_param
    AND tipo = 'actividad';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Verificar que las funciones se crearon
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%actividad%'
ORDER BY routine_name; 