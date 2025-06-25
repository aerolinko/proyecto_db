-- Corregir la función update_usuario_with_empleado para resolver la ambigüedad de empleado_id
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