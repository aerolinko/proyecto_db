-- =====================================================
-- SCRIPT PARA ELIMINAR ACTIVIDADES CON DEPENDENCIAS
-- =====================================================

-- Función mejorada para eliminar una actividad con todas sus dependencias
CREATE OR REPLACE FUNCTION eliminar_actividad_completa(premiacion_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    premiacion_evento_id_val INTEGER;
BEGIN
    -- Obtener el premiacion_evento_id
    SELECT pe.premiacion_evento_id INTO premiacion_evento_id_val
    FROM premiacion_evento pe
    INNER JOIN premiacion p ON pe.fk_premiacion = p.premiacion_id
    WHERE p.premiacion_id = premiacion_id_param
    AND p.tipo = 'actividad';
    
    IF premiacion_evento_id_val IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- 1. Eliminar jueces asociados
    DELETE FROM juez 
    WHERE fk_premiacion_evento = premiacion_evento_id_val;
    
    -- 2. Eliminar premios asociados
    DELETE FROM premio 
    WHERE fk_premiacion_evento_miembro IN (
        SELECT premiacion_evento_miembro_id 
        FROM premiacion_evento_miembro 
        WHERE fk_premiacion_evento = premiacion_evento_id_val
    );
    
    -- 3. Eliminar miembros asociados
    DELETE FROM premiacion_evento_miembro 
    WHERE fk_premiacion_evento = premiacion_evento_id_val;
    
    -- 4. Eliminar la relación premiacion_evento
    DELETE FROM premiacion_evento 
    WHERE premiacion_evento_id = premiacion_evento_id_val;
    
    -- 5. Eliminar la premiación (actividad)
    DELETE FROM premiacion 
    WHERE premiacion_id = premiacion_id_param
    AND tipo = 'actividad';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Función para eliminar todas las actividades de un evento
CREATE OR REPLACE FUNCTION eliminar_actividades_evento(evento_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    actividad RECORD;
    eliminadas INTEGER := 0;
BEGIN
    FOR actividad IN 
        SELECT p.premiacion_id
        FROM premiacion p
        INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
        WHERE pe.fk_evento = evento_id_param
        AND p.tipo = 'actividad'
    LOOP
        IF eliminar_actividad_completa(actividad.premiacion_id) THEN
            eliminadas := eliminadas + 1;
        END IF;
    END LOOP;
    
    RETURN eliminadas;
END;
$$ LANGUAGE plpgsql;

-- Verificar las funciones creadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%eliminar%'
ORDER BY routine_name;

-- Ejemplo de uso:
-- SELECT eliminar_actividad_completa(10); -- Eliminar actividad con ID 10
-- SELECT eliminar_actividades_evento(6);  -- Eliminar todas las actividades del evento 6 