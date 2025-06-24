-- =====================================================
-- VERIFICAR Y ARREGLAR PROBLEMA DE USUARIO
-- =====================================================

-- PASO 1: Verificar el cliente jurídico
SELECT '=== PASO 1: CLIENTE JURÍDICO ===' as info;
SELECT cliente_id, rif, razon_social FROM cliente_juridico WHERE rif = 'J-98765432-1';

-- PASO 2: Verificar el usuario actual
SELECT '=== PASO 2: USUARIO ACTUAL ===' as info;
SELECT usuario_id, nombre_usuario, fk_cliente_juridico FROM usuario WHERE nombre_usuario = 'test_user_2';

-- PASO 3: Verificar si hay algún usuario con fk_cliente_juridico NULL
SELECT '=== PASO 3: USUARIOS CON FK_CLIENTE_JURIDICO NULL ===' as info;
SELECT usuario_id, nombre_usuario, fk_cliente_juridico FROM usuario WHERE fk_cliente_juridico IS NULL;

-- PASO 4: Actualizar el usuario para vincularlo al cliente jurídico correcto
DO $$
DECLARE
    cliente_id_val INTEGER;
    usuario_id_val INTEGER;
BEGIN
    -- Obtener el ID del cliente jurídico
    SELECT cliente_id INTO cliente_id_val FROM cliente_juridico WHERE rif = 'J-98765432-1';
    
    -- Obtener el ID del usuario
    SELECT usuario_id INTO usuario_id_val FROM usuario WHERE nombre_usuario = 'test_user_2';
    
    IF cliente_id_val IS NOT NULL AND usuario_id_val IS NOT NULL THEN
        -- Actualizar el usuario para vincularlo al cliente jurídico
        UPDATE usuario 
        SET fk_cliente_juridico = cliente_id_val 
        WHERE usuario_id = usuario_id_val;
        
        RAISE NOTICE 'Usuario % actualizado con fk_cliente_juridico = %', usuario_id_val, cliente_id_val;
    ELSE
        RAISE NOTICE 'No se encontró cliente_id: % o usuario_id: %', cliente_id_val, usuario_id_val;
    END IF;
END $$;

-- PASO 5: Verificar que se actualizó correctamente
SELECT '=== PASO 5: USUARIO DESPUÉS DE ACTUALIZAR ===' as info;
SELECT usuario_id, nombre_usuario, fk_cliente_juridico FROM usuario WHERE nombre_usuario = 'test_user_2';

-- PASO 6: Verificar la relación cliente -> usuario
SELECT '=== PASO 6: RELACIÓN CLIENTE -> USUARIO ===' as info;
SELECT 
  cj.cliente_id,
  cj.razon_social,
  u.usuario_id,
  u.nombre_usuario
FROM cliente_juridico cj
INNER JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
WHERE cj.rif = 'J-98765432-1';

-- PASO 7: Verificar la relación usuario -> venta_online
SELECT '=== PASO 7: RELACIÓN USUARIO -> VENTA ONLINE ===' as info;
SELECT 
  u.usuario_id,
  u.nombre_usuario,
  vo.venta_online_id,
  vo.total
FROM usuario u
INNER JOIN venta_online vo ON u.usuario_id = vo.fk_usuario
WHERE u.nombre_usuario = 'test_user_2';

-- PASO 8: Consulta final de prueba
SELECT '=== PASO 8: CONSULTA FINAL DE PRUEBA ===' as info;

SELECT 
  cj.razon_social,
  vo.venta_online_id,
  vo.fecha_emision,
  vo.total
FROM cliente_juridico cj
INNER JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
INNER JOIN venta_online vo ON u.usuario_id = vo.fk_usuario
WHERE cj.rif = 'J-98765432-1'; 