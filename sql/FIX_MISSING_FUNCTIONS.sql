-- ===== ARCHIVO PARA AGREGAR FUNCIONES FALTANTES =====

-- Función para obtener todos los usuarios con información completa
CREATE OR REPLACE FUNCTION get_all_usuarios_complete()
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  empleado_id TEXT,
  fk_cliente_natural INTEGER,
  fk_cliente_juridico INTEGER,
  fk_miembro_acaucab INTEGER,
  -- Información del empleado
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  cedula INTEGER,
  empleado_nombre VARCHAR,
  -- Información del cliente natural
  cliente_natural_nombre VARCHAR,
  cliente_natural_apellido VARCHAR,
  cliente_natural_cedula INTEGER,
  cliente_natural_nombre_completo VARCHAR,
  -- Información del cliente jurídico
  cliente_juridico_nombre VARCHAR,
  cliente_juridico_rif VARCHAR,
  -- Información del miembro ACAUCAB
  miembro_acaucab_nombre VARCHAR,
  miembro_acaucab_rif VARCHAR,
  -- Campo combinado para mostrar la entidad asociada
  entidad_asociada VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_empleado::TEXT as empleado_id,
    u.fk_cliente_natural, 
    u.fk_cliente_juridico, 
    u.fk_miembro_acaucab,
    -- Información del empleado
    e.primer_nombre,
    e.primer_apellido,
    e.cedula,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as empleado_nombre,
    -- Información del cliente natural
    cn.primer_nombre as cliente_natural_nombre,
    cn.primer_apellido as cliente_natural_apellido,
    cn.cedula as cliente_natural_cedula,
    CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)::VARCHAR as cliente_natural_nombre_completo,
    -- Información del cliente jurídico
    cj.razon_social as cliente_juridico_nombre,
    cj.rif as cliente_juridico_rif,
    -- Información del miembro ACAUCAB
    ma.razon_social as miembro_acaucab_nombre,
    ma.rif as miembro_acaucab_rif,
    -- Campo combinado para mostrar la entidad asociada
    CASE 
      WHEN u.fk_empleado IS NOT NULL THEN CONCAT('Empleado: ', e.primer_nombre, ' ', e.primer_apellido, ' (Cédula: ', e.cedula, ')')
      WHEN u.fk_cliente_natural IS NOT NULL THEN CONCAT('Cliente Natural: ', cn.primer_nombre, ' ', cn.primer_apellido, ' (Cédula: ', cn.cedula, ')')
      WHEN u.fk_cliente_juridico IS NOT NULL THEN CONCAT('Cliente Jurídico: ', cj.razon_social, ' (RIF: ', cj.rif, ')')
      WHEN u.fk_miembro_acaucab IS NOT NULL THEN CONCAT('Miembro ACAUCAB: ', ma.razon_social, ' (RIF: ', ma.rif, ')')
      ELSE 'Sin entidad asociada'
    END::VARCHAR as entidad_asociada
  FROM usuario u
  LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
  LEFT JOIN cliente_natural cn ON u.fk_cliente_natural = cn.cliente_id
  LEFT JOIN cliente_juridico cj ON u.fk_cliente_juridico = cj.cliente_id
  LEFT JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
  ORDER BY u.usuario_id;
END;
$$;

-- Función unificada para actualizar usuarios (no permite cambiar la entidad)
CREATE OR REPLACE FUNCTION update_usuario_with_entidad(
  p_id INTEGER,
  p_email VARCHAR,
  p_password VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  empleado_id TEXT,
  fk_cliente_natural INTEGER,
  fk_cliente_juridico INTEGER,
  fk_miembro_acaucab INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  cedula INTEGER,
  empleado_nombre VARCHAR,
  entidad_asociada VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_fk_empleado INTEGER;
  v_fk_cliente_natural INTEGER;
  v_fk_cliente_juridico INTEGER;
  v_fk_miembro_acaucab INTEGER;
BEGIN
  -- Verificar si el usuario existe y obtener su tipo de entidad
  SELECT fk_empleado, fk_cliente_natural, fk_cliente_juridico, fk_miembro_acaucab
  INTO v_fk_empleado, v_fk_cliente_natural, v_fk_cliente_juridico, v_fk_miembro_acaucab
  FROM usuario WHERE usuario_id = p_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  -- Actualizar solo email y password (no cambiar la entidad)
  IF p_password IS NOT NULL THEN
    UPDATE usuario SET 
      nombre_usuario = p_email, 
      hash_contrasena = p_password
    WHERE usuario_id = p_id;
  ELSE
    UPDATE usuario SET nombre_usuario = p_email WHERE usuario_id = p_id;
  END IF;

  -- Retornar información completa basada en el tipo de entidad
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_empleado::TEXT as empleado_id,
    u.fk_cliente_natural, 
    u.fk_cliente_juridico, 
    u.fk_miembro_acaucab,
    e.primer_nombre,
    e.primer_apellido,
    e.cedula,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as empleado_nombre,
    CASE 
      WHEN u.fk_empleado IS NOT NULL THEN CONCAT('Empleado: ', e.primer_nombre, ' ', e.primer_apellido, ' (Cédula: ', e.cedula, ')')
      WHEN u.fk_cliente_natural IS NOT NULL THEN CONCAT('Cliente Natural: ', cn.primer_nombre, ' ', cn.primer_apellido, ' (Cédula: ', cn.cedula, ')')
      WHEN u.fk_cliente_juridico IS NOT NULL THEN CONCAT('Cliente Jurídico: ', cj.razon_social, ' (RIF: ', cj.rif, ')')
      WHEN u.fk_miembro_acaucab IS NOT NULL THEN CONCAT('Miembro ACAUCAB: ', ma.razon_social, ' (RIF: ', ma.rif, ')')
      ELSE 'Sin entidad asociada'
    END::VARCHAR as entidad_asociada
  FROM usuario u
  LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
  LEFT JOIN cliente_natural cn ON u.fk_cliente_natural = cn.cliente_id
  LEFT JOIN cliente_juridico cj ON u.fk_cliente_juridico = cj.cliente_id
  LEFT JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
  WHERE u.usuario_id = p_id;
END;
$$; 