-- =====================================================
-- INSERT SIMPLE CORREGIDO - HISTORIAL DE COMPRAS
-- =====================================================

-- 1. Primero verificar qué existe
SELECT '=== VERIFICACIÓN INICIAL ===' as info;

SELECT 'Lugares disponibles:' as info, lugar_id, nombre FROM lugar LIMIT 5;
SELECT 'Miembros ACAUCAB disponibles:' as info, miembro_id, razon_social FROM miembro_acaucab LIMIT 5;

-- 2. Crear cliente jurídico con datos reales
INSERT INTO CLIENTE_JURIDICO (RIF, direccion, denominacion_comercial, razon_social, capital, pagina_web, direccion_fiscal, fk_lugar, total_puntos, fk_lugar_juridico) VALUES
('J-98765432-1', 'Av. Principal, Caracas', 'Test Empresa C.A.', 'Test Empresa, C.A.', 10000000, 'www.test.com', 'Av. Principal, Caracas', 983, 100, 983)
ON CONFLICT DO NOTHING;

-- 3. Obtener el ID del cliente jurídico que acabamos de crear
SELECT 'Cliente jurídico creado:' as info, cliente_id, razon_social FROM cliente_juridico WHERE rif = 'J-98765432-1';

-- 4. Crear usuario usando el ID correcto del cliente jurídico
-- Primero obtenemos el ID del cliente jurídico
DO $$
DECLARE
    cliente_id_val INTEGER;
BEGIN
    SELECT cliente_id INTO cliente_id_val FROM cliente_juridico WHERE rif = 'J-98765432-1';
    
    IF cliente_id_val IS NOT NULL THEN
        INSERT INTO USUARIO (fecha_creacion, nombre_usuario, hash_contrasena, fk_cliente_juridico) VALUES
        ('2023-01-01', 'test_user_2', 'hash123', cliente_id_val)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Usuario creado con fk_cliente_juridico = %', cliente_id_val;
    ELSE
        RAISE NOTICE 'No se encontró el cliente jurídico';
    END IF;
END $$;

-- 5. Obtener el ID del usuario que acabamos de crear
SELECT 'Usuario creado:' as info, usuario_id, nombre_usuario, fk_cliente_juridico 
FROM usuario WHERE nombre_usuario = 'test_user_2';

-- 6. Crear venta online usando el ID correcto del usuario
DO $$
DECLARE
    usuario_id_val INTEGER;
BEGIN
    SELECT usuario_id INTO usuario_id_val FROM usuario WHERE nombre_usuario = 'test_user_2';
    
    IF usuario_id_val IS NOT NULL THEN
        INSERT INTO VENTA_ONLINE (direccion, fecha_emision, fecha_estimada, fecha_entrega, total, fk_lugar, fk_usuario) VALUES
        ('Av. Principal, Caracas', '2024-01-15', '2024-01-20', '2024-01-18', 100000, 983, usuario_id_val)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Venta online creada con fk_usuario = %', usuario_id_val;
    ELSE
        RAISE NOTICE 'No se encontró el usuario';
    END IF;
END $$;

-- 7. Verificar que todo se creó correctamente
SELECT '=== VERIFICACIÓN FINAL ===' as info;

SELECT 'Cliente jurídico:' as info, cliente_id, razon_social, rif FROM cliente_juridico WHERE rif = 'J-98765432-1';
SELECT 'Usuario:' as info, usuario_id, nombre_usuario, fk_cliente_juridico FROM usuario WHERE nombre_usuario = 'test_user_2';
SELECT 'Venta online:' as info, venta_online_id, total, fk_usuario FROM venta_online WHERE total = 100000;

-- 8. Consulta de prueba final
SELECT '=== CONSULTA DE PRUEBA FINAL ===' as info;

SELECT 
  cj.razon_social,
  vo.venta_online_id,
  vo.fecha_emision,
  vo.total
FROM cliente_juridico cj
INNER JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
INNER JOIN venta_online vo ON u.usuario_id = vo.fk_usuario
WHERE cj.rif = 'J-98765432-1'; 