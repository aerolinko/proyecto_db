-- =====================================================
-- INSERT DETALLE VENTA ONLINE CON PRODUCTOS REALES
-- =====================================================

-- 1. Verificar qué ventas online existen
SELECT '=== VENTAS ONLINE EXISTENTES ===' as info;
SELECT venta_online_id, total, fk_usuario FROM venta_online;

-- 2. Verificar qué productos existen en almacén
SELECT '=== PRODUCTOS EN ALMACÉN ===' as info;
SELECT 
  ac.almacen_cerveza_id,
  c.nombre as cerveza,
  tc.nombre as tipo_cerveza,
  ec.nombre as estilo_cerveza,
  p.material as presentacion,
  p.cap_volumen as capacidad_ml,
  ac.precio_venta
FROM almacen_cerveza ac
INNER JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
INNER JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
INNER JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
LIMIT 10;

-- 3. Si no hay productos en almacén, crear algunos básicos
DO $$
DECLARE
    cerveza_id_val INTEGER;
    presentacion_id_val INTEGER;
    cp_id_val INTEGER;
    almacen_id_val INTEGER;
BEGIN
    -- Verificar si ya existen productos
    IF NOT EXISTS (SELECT 1 FROM almacen_cerveza LIMIT 1) THEN
        RAISE NOTICE 'No hay productos en almacén, creando algunos básicos...';
        
        -- Crear una cerveza básica si no existe
        INSERT INTO cerveza (nombre, fk_tipo_cerveza, fk_estilo_cerveza) VALUES
        ('Pilsner Test', 1, 1)
        ON CONFLICT DO NOTHING
        RETURNING cerveza_id INTO cerveza_id_val;
        
        -- Si no se insertó, obtener una existente
        IF cerveza_id_val IS NULL THEN
            SELECT cerveza_id INTO cerveza_id_val FROM cerveza LIMIT 1;
        END IF;
        
        -- Crear una presentación básica si no existe
        INSERT INTO presentacion (material, cap_volumen) VALUES
        ('Botella', 330)
        ON CONFLICT DO NOTHING
        RETURNING presentacion_id INTO presentacion_id_val;
        
        -- Si no se insertó, obtener una existente
        IF presentacion_id_val IS NULL THEN
            SELECT presentacion_id INTO presentacion_id_val FROM presentacion LIMIT 1;
        END IF;
        
        -- Crear cerveza_presentacion
        INSERT INTO cerveza_presentacion (fk_cerveza, fk_presentacion) VALUES
        (cerveza_id_val, presentacion_id_val)
        ON CONFLICT DO NOTHING
        RETURNING cerveza_presentacion_id INTO cp_id_val;
        
        -- Si no se insertó, obtener una existente
        IF cp_id_val IS NULL THEN
            SELECT cerveza_presentacion_id INTO cp_id_val FROM cerveza_presentacion 
            WHERE fk_cerveza = cerveza_id_val AND fk_presentacion = presentacion_id_val;
        END IF;
        
        -- Crear almacen_cerveza
        INSERT INTO almacen_cerveza (fk_cerveza_presentacion, cantidad_stock, precio_venta) VALUES
        (cp_id_val, 100, 50000)
        ON CONFLICT DO NOTHING
        RETURNING almacen_cerveza_id INTO almacen_id_val;
        
        RAISE NOTICE 'Productos básicos creados: cerveza_id=%, presentacion_id=%, cp_id=%, almacen_id=%', 
                    cerveza_id_val, presentacion_id_val, cp_id_val, almacen_id_val;
    ELSE
        RAISE NOTICE 'Ya existen productos en almacén';
    END IF;
END $$;

-- 4. Verificar productos después de la creación
SELECT '=== PRODUCTOS DESPUÉS DE CREACIÓN ===' as info;
SELECT 
  ac.almacen_cerveza_id,
  c.nombre as cerveza,
  tc.nombre as tipo_cerveza,
  ec.nombre as estilo_cerveza,
  p.material as presentacion,
  p.cap_volumen as capacidad_ml,
  ac.precio_venta
FROM almacen_cerveza ac
INNER JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
INNER JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
INNER JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
LIMIT 5;

-- 5. Crear detalles de venta online
DO $$
DECLARE
    venta_id_val INTEGER;
    almacen_id_val INTEGER;
    precio_val DECIMAL;
BEGIN
    -- Obtener la venta online
    SELECT venta_online_id INTO venta_id_val FROM venta_online WHERE total = 100000 LIMIT 1;
    
    -- Obtener un producto del almacén
    SELECT almacen_cerveza_id, precio_venta INTO almacen_id_val, precio_val 
    FROM almacen_cerveza LIMIT 1;
    
    IF venta_id_val IS NOT NULL AND almacen_id_val IS NOT NULL THEN
        -- Crear detalle de venta online
        INSERT INTO detalle_venta_online (fk_venta_online, fk_almacen_cerveza, precio_unitario, cantidad) VALUES
        (venta_id_val, almacen_id_val, precio_val, 2)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Detalle de venta creado: venta_id=%, almacen_id=%, precio=%, cantidad=2', 
                    venta_id_val, almacen_id_val, precio_val;
    ELSE
        RAISE NOTICE 'No se pudo crear detalle: venta_id=%, almacen_id=%', venta_id_val, almacen_id_val;
    END IF;
END $$;

-- 6. Verificar el detalle creado
SELECT '=== DETALLE CREADO ===' as info;
SELECT 
  dvo.detalle_venta_online_id,
  dvo.fk_venta_online,
  dvo.precio_unitario,
  dvo.cantidad,
  c.nombre as cerveza,
  tc.nombre as tipo_cerveza,
  ec.nombre as estilo_cerveza,
  p.material as presentacion,
  p.cap_volumen as capacidad_ml
FROM detalle_venta_online dvo
INNER JOIN almacen_cerveza ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
INNER JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
INNER JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
INNER JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id;

-- 7. Consulta de prueba final con datos completos
SELECT '=== CONSULTA FINAL CON DATOS COMPLETOS ===' as info;

SELECT 
  cj.razon_social,
  vo.venta_online_id,
  vo.fecha_emision,
  vo.total,
  c.nombre as cerveza,
  tc.nombre as tipo_cerveza,
  ec.nombre as estilo_cerveza,
  p.material as presentacion,
  p.cap_volumen as capacidad_ml,
  dvo.precio_unitario,
  dvo.cantidad
FROM cliente_juridico cj
INNER JOIN usuario u ON cj.cliente_id = u.fk_cliente_juridico
INNER JOIN venta_online vo ON u.usuario_id = vo.fk_usuario
INNER JOIN detalle_venta_online dvo ON vo.venta_online_id = dvo.fk_venta_online
INNER JOIN almacen_cerveza ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
INNER JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
INNER JOIN tipo_cerveza tc ON c.fk_tipo_cerveza = tc.tipo_cerveza_id
INNER JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
WHERE cj.rif = 'J-98765432-1'; 