-- ===== DROP DE TODAS LAS FUNCIONES ANTES DE RECREARLAS =====

-- Eliminar funciones de creación
DROP FUNCTION IF EXISTS create_usuario_with_empleado(VARCHAR, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS create_usuario_with_cliente_natural(VARCHAR, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS create_usuario_with_cliente_juridico(VARCHAR, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS create_usuario_with_miembro_acaucab(VARCHAR, VARCHAR, INTEGER);

-- Eliminar funciones de actualización
DROP FUNCTION IF EXISTS update_usuario_with_empleado(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS update_usuario_with_cliente_natural(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS update_usuario_with_cliente_juridico(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS update_usuario_with_miembro_acaucab(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS update_usuario_with_entidad(INTEGER, VARCHAR, VARCHAR);

-- Eliminar funciones de obtención
DROP FUNCTION IF EXISTS get_empleados();
DROP FUNCTION IF EXISTS get_clientes_naturales_sin_usuario();
DROP FUNCTION IF EXISTS get_clientes_juridicos_sin_usuario();
DROP FUNCTION IF EXISTS get_miembros_acaucab_sin_usuario();

-- Eliminar funciones de debugging
DROP FUNCTION IF EXISTS get_all_clientes_naturales();
DROP FUNCTION IF EXISTS get_all_clientes_juridicos();
DROP FUNCTION IF EXISTS get_all_miembros_acaucab();

-- Eliminar función de obtención completa
DROP FUNCTION IF EXISTS get_all_usuarios_complete();

-- ===== ACTUALIZACIONES PARA PERMITIR MÚLTIPLES USUARIOS POR EMPLEADO =====
-- Y EVITAR CAMBIOS DE ENTIDAD AL ACTUALIZAR

-- 1. Actualizar función de creación de usuario con empleado (permitir múltiples usuarios)
CREATE OR REPLACE FUNCTION create_usuario_with_empleado(
  p_email VARCHAR,
  p_password VARCHAR,
  p_empleado_id INTEGER
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  empleado_id TEXT,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  cedula INTEGER,
  empleado_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar que el empleado existe
  IF NOT EXISTS (SELECT 1 FROM empleado WHERE empleado_id = p_empleado_id) THEN
    RAISE EXCEPTION 'El empleado seleccionado no existe';
  END IF;

  -- Verificar que el email no esté registrado
  IF EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = p_email) THEN
    RAISE EXCEPTION 'El email ya está registrado';
  END IF;

  -- Insertar usuario (permitir múltiples usuarios por empleado)
  INSERT INTO usuario (nombre_usuario, hash_contrasena, fk_empleado, fecha_creacion)
  VALUES (p_email, p_password, p_empleado_id, CURRENT_DATE);

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_empleado::TEXT as empleado_id,
    e.primer_nombre,
    e.primer_apellido,
    e.cedula,
    CONCAT(e.primer_nombre, ' ', e.primer_apellido)::VARCHAR as empleado_nombre
  FROM usuario u
  LEFT JOIN empleado e ON u.fk_empleado = e.empleado_id
  WHERE u.nombre_usuario = p_email;
END;
$$;

-- 2. Actualizar función de actualización de usuario con empleado (no cambiar entidad)
CREATE OR REPLACE FUNCTION update_usuario_with_empleado(
  p_id INTEGER,
  p_email VARCHAR,
  p_password VARCHAR DEFAULT NULL
)
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

  -- Actualizar solo email y password (no cambiar la entidad)
  IF p_password IS NOT NULL THEN
    UPDATE usuario SET 
      nombre_usuario = p_email, 
      hash_contrasena = p_password
    WHERE usuario_id = p_id;
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

-- 3. Actualizar función de actualización de usuario con cliente natural (no cambiar entidad)
CREATE OR REPLACE FUNCTION update_usuario_with_cliente_natural(
  p_id INTEGER,
  p_email VARCHAR,
  p_password VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  cliente_natural_id TEXT,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  cedula INTEGER,
  cliente_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el usuario existe
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario_id = p_id) THEN
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

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_cliente_natural::TEXT as cliente_natural_id,
    cn.primer_nombre,
    cn.primer_apellido,
    cn.cedula,
    CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)::VARCHAR as cliente_nombre
  FROM usuario u
  LEFT JOIN cliente_natural cn ON u.fk_cliente_natural = cn.cliente_id
  WHERE u.usuario_id = p_id;
END;
$$;

-- 4. Actualizar función de actualización de usuario con cliente jurídico (no cambiar entidad)
CREATE OR REPLACE FUNCTION update_usuario_with_cliente_juridico(
  p_id INTEGER,
  p_email VARCHAR,
  p_password VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  cliente_juridico_id TEXT,
  razon_social VARCHAR,
  rif VARCHAR,
  cliente_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el usuario existe
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario_id = p_id) THEN
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

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_cliente_juridico::TEXT as cliente_juridico_id,
    cj.razon_social,
    cj.rif,
    cj.razon_social as cliente_nombre
  FROM usuario u
  LEFT JOIN cliente_juridico cj ON u.fk_cliente_juridico = cj.cliente_id
  WHERE u.usuario_id = p_id;
END;
$$;

-- 5. Actualizar función de actualización de usuario con miembro ACAUCAB (no cambiar entidad)
CREATE OR REPLACE FUNCTION update_usuario_with_miembro_acaucab(
  p_id INTEGER,
  p_email VARCHAR,
  p_password VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  miembro_acaucab_id TEXT,
  razon_social VARCHAR,
  rif VARCHAR,
  miembro_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el usuario existe
  IF NOT EXISTS (SELECT 1 FROM usuario WHERE usuario_id = p_id) THEN
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

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_miembro_acaucab::TEXT as miembro_acaucab_id,
    ma.razon_social,
    ma.rif,
    ma.razon_social as miembro_nombre
  FROM usuario u
  LEFT JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
  WHERE u.usuario_id = p_id;
END;
$$;

-- 6. Crear función unificada para actualizar usuarios (no permite cambiar la entidad)
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

-- 7. Crear función para obtener todos los usuarios con información completa
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

-- ===== CORRECCIONES PARA FUNCIONES DE DEBUGGING =====

-- Obtener TODOS los clientes naturales (para debugging)
CREATE OR REPLACE FUNCTION get_all_clientes_naturales()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  segundo_nombre VARCHAR,
  segundo_apellido VARCHAR,
  direccion VARCHAR,
  rif VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cn.cliente_id::TEXT as id,
    cn.cedula,
    cn.primer_nombre,
    cn.primer_apellido,
    cn.segundo_nombre,
    cn.segundo_apellido,
    cn.direccion,
    cn.rif,
    cn.total_puntos,
    CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)::VARCHAR as nombre_completo,
    CONCAT(cn.primer_nombre, ' ', COALESCE(cn.segundo_nombre, ''), ' ', cn.primer_apellido, ' ', COALESCE(cn.segundo_apellido, ''))::VARCHAR as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_natural cn
  LEFT JOIN usuario u ON cn.cliente_id = u.fk_cliente_natural
  ORDER BY cn.primer_nombre, cn.primer_apellido;
END;
$$;

-- Obtener TODOS los clientes jurídicos (para debugging)
CREATE OR REPLACE FUNCTION get_all_clientes_juridicos()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  capital NUMERIC,
  direccion VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.cliente_id::TEXT as id,
    cj.rif,
    cj.razon_social,
    cj.denominacion_comercial,
    cj.capital,
    cj.direccion,
    cj.total_puntos,
    cj.razon_social as nombre_completo,
    cj.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_juridico cj
  LEFT JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
  ORDER BY cj.razon_social;
END;
$$;

-- Obtener TODOS los miembros ACAUCAB (para debugging)
CREATE OR REPLACE FUNCTION get_all_miembros_acaucab()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  direccion VARCHAR,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.miembro_id::TEXT as id,
    ma.rif,
    ma.razon_social,
    ma.denominacion_comercial,
    ma.direccion,
    ma.razon_social as nombre_completo,
    ma.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM miembro_acaucab ma
  LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
  ORDER BY ma.razon_social;
END;
$$;

-- Obtener clientes naturales sin usuarios asignados
CREATE OR REPLACE FUNCTION get_clientes_naturales_sin_usuario()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  segundo_nombre VARCHAR,
  segundo_apellido VARCHAR,
  direccion VARCHAR,
  rif VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cn.cliente_id::TEXT as id,
    cn.cedula,
    cn.primer_nombre,
    cn.primer_apellido,
    cn.segundo_nombre,
    cn.segundo_apellido,
    cn.direccion,
    cn.rif,
    cn.total_puntos,
    CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)::VARCHAR as nombre_completo,
    CONCAT(cn.primer_nombre, ' ', COALESCE(cn.segundo_nombre, ''), ' ', cn.primer_apellido, ' ', COALESCE(cn.segundo_apellido, ''))::VARCHAR as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_natural cn
  LEFT JOIN usuario u ON cn.cliente_id = u.fk_cliente_natural
  WHERE u.usuario_id IS NULL
  ORDER BY cn.primer_nombre, cn.primer_apellido;
END;
$$;

-- Obtener clientes jurídicos sin usuarios asignados
CREATE OR REPLACE FUNCTION get_clientes_juridicos_sin_usuario()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  capital NUMERIC,
  direccion VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.cliente_id::TEXT as id,
    cj.rif,
    cj.razon_social,
    cj.denominacion_comercial,
    cj.capital,
    cj.direccion,
    cj.total_puntos,
    cj.razon_social as nombre_completo,
    cj.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_juridico cj
  LEFT JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
  WHERE u.usuario_id IS NULL
  ORDER BY cj.razon_social;
END;
$$;

-- Obtener miembros ACAUCAB sin usuarios asignados
CREATE OR REPLACE FUNCTION get_miembros_acaucab_sin_usuario()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  direccion VARCHAR,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.miembro_id::TEXT as id,
    ma.rif,
    ma.razon_social,
    ma.denominacion_comercial,
    ma.direccion,
    ma.razon_social as nombre_completo,
    ma.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM miembro_acaucab ma
  LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
  WHERE u.usuario_id IS NULL
  ORDER BY ma.razon_social;
END;
$$;

-- ===== CORRECCIONES PARA PERMITIR MÚLTIPLES USUARIOS POR MIEMBROS ACAUCAB =====
-- Y MOSTRAR TODAS LAS ENTIDADES DISPONIBLES

-- 1. Actualizar función de creación de usuario con miembro ACAUCAB (permitir múltiples usuarios)
CREATE OR REPLACE FUNCTION create_usuario_with_miembro_acaucab(
  p_email VARCHAR,
  p_password VARCHAR,
  p_miembro_acaucab_id INTEGER
)
RETURNS TABLE (
  id TEXT,
  email VARCHAR,
  fecha_creacion DATE,
  miembro_acaucab_id TEXT,
  razon_social VARCHAR,
  rif VARCHAR,
  miembro_nombre VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar que el miembro ACAUCAB existe
  IF NOT EXISTS (SELECT 1 FROM miembro_acaucab WHERE miembro_id = p_miembro_acaucab_id) THEN
    RAISE EXCEPTION 'El miembro ACAUCAB seleccionado no existe';
  END IF;

  -- Verificar que el email no esté registrado
  IF EXISTS (SELECT 1 FROM usuario WHERE nombre_usuario = p_email) THEN
    RAISE EXCEPTION 'El email ya está registrado';
  END IF;

  -- Insertar usuario (permitir múltiples usuarios por miembro ACAUCAB)
  INSERT INTO usuario (nombre_usuario, hash_contrasena, fk_miembro_acaucab, fecha_creacion)
  VALUES (p_email, p_password, p_miembro_acaucab_id, CURRENT_DATE);

  -- Retornar información completa
  RETURN QUERY
  SELECT 
    u.usuario_id::TEXT as id, 
    u.nombre_usuario as email, 
    u.fecha_creacion,
    u.fk_miembro_acaucab::TEXT as miembro_acaucab_id,
    ma.razon_social,
    ma.rif,
    ma.razon_social as miembro_nombre
  FROM usuario u
  LEFT JOIN miembro_acaucab ma ON u.fk_miembro_acaucab = ma.miembro_id
  WHERE u.nombre_usuario = p_email;
END;
$$;

-- 2. Actualizar función para obtener TODOS los empleados (mostrar todas las entidades)
CREATE OR REPLACE FUNCTION get_empleados()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  segundo_nombre VARCHAR,
  segundo_apellido VARCHAR,
  direccion VARCHAR,
  fecha_contrato DATE,
  fk_lugar INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    empleado_id::TEXT as id,
    cedula,
    primer_nombre,
    primer_apellido,
    segundo_nombre,
    segundo_apellido,
    direccion,
    fecha_contrato,
    fk_lugar,
    CONCAT(primer_nombre, ' ', primer_apellido)::VARCHAR as nombre_completo,
    CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, ''))::VARCHAR as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM empleado e
  LEFT JOIN usuario u ON e.empleado_id = u.fk_empleado
  ORDER BY primer_nombre, primer_apellido;
END;
$$;

-- 3. Actualizar función para obtener TODOS los clientes naturales (mostrar todas las entidades)
CREATE OR REPLACE FUNCTION get_clientes_naturales_sin_usuario()
RETURNS TABLE (
  id TEXT,
  cedula INTEGER,
  primer_nombre VARCHAR,
  primer_apellido VARCHAR,
  segundo_nombre VARCHAR,
  segundo_apellido VARCHAR,
  direccion VARCHAR,
  rif VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cn.cliente_id::TEXT as id,
    cn.cedula,
    cn.primer_nombre,
    cn.primer_apellido,
    cn.segundo_nombre,
    cn.segundo_apellido,
    cn.direccion,
    cn.rif,
    cn.total_puntos,
    CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)::VARCHAR as nombre_completo,
    CONCAT(cn.primer_nombre, ' ', COALESCE(cn.segundo_nombre, ''), ' ', cn.primer_apellido, ' ', COALESCE(cn.segundo_apellido, ''))::VARCHAR as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_natural cn
  LEFT JOIN usuario u ON cn.cliente_id = u.fk_cliente_natural
  ORDER BY cn.primer_nombre, cn.primer_apellido;
END;
$$;

-- 4. Actualizar función para obtener TODOS los clientes jurídicos (mostrar todas las entidades)
CREATE OR REPLACE FUNCTION get_clientes_juridicos_sin_usuario()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  capital NUMERIC,
  direccion VARCHAR,
  total_puntos INTEGER,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.cliente_id::TEXT as id,
    cj.rif,
    cj.razon_social,
    cj.denominacion_comercial,
    cj.capital,
    cj.direccion,
    cj.total_puntos,
    cj.razon_social as nombre_completo,
    cj.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM cliente_juridico cj
  LEFT JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
  ORDER BY cj.razon_social;
END;
$$;

-- 5. Actualizar función para obtener TODOS los miembros ACAUCAB (mostrar todas las entidades)
CREATE OR REPLACE FUNCTION get_miembros_acaucab_sin_usuario()
RETURNS TABLE (
  id TEXT,
  rif VARCHAR,
  razon_social VARCHAR,
  denominacion_comercial VARCHAR,
  direccion VARCHAR,
  nombre_completo VARCHAR,
  nombre_completo_full VARCHAR,
  tiene_usuario BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ma.miembro_id::TEXT as id,
    ma.rif,
    ma.razon_social,
    ma.denominacion_comercial,
    ma.direccion,
    ma.razon_social as nombre_completo,
    ma.razon_social as nombre_completo_full,
    CASE WHEN u.usuario_id IS NOT NULL THEN TRUE ELSE FALSE END as tiene_usuario
  FROM miembro_acaucab ma
  LEFT JOIN usuario u ON ma.miembro_id = u.fk_miembro_acaucab
  ORDER BY ma.razon_social;
END;
$$; 