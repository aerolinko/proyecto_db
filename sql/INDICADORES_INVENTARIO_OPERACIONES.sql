-- =====================================================
-- STORED PROCEDURES PARA INDICADORES DE INVENTARIO Y OPERACIONES
-- =====================================================

-- 1. ROTACIÓN DE INVENTARIO
-- Mide la rapidez con la que se vende y reemplaza el inventario
-- Fórmula: Rotación de inventario = Costo de los productos vendidos / Valor promedio del inventario

CREATE OR REPLACE FUNCTION obtener_rotacion_inventario(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    rotacion_inventario NUMERIC(10,2),
    costo_productos_vendidos NUMERIC(15,2),
    valor_promedio_inventario NUMERIC(15,2),
    periodo_inicio DATE,
    periodo_fin DATE
) AS $$
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH ventas_periodo AS (
        -- Ventas de tienda
        SELECT 
            (dvt.precio_unitario * dvt.cantidad)::NUMERIC as costo_venta,
            vt.fecha
        FROM DETALLE_VENTA_TIENDA dvt
        JOIN VENTA_TIENDA vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        
        UNION ALL
        
        -- Ventas online
        SELECT 
            (dvo.precio_unitario * dvo.cantidad)::NUMERIC as costo_venta,
            vo.fecha_emision as fecha
        FROM DETALLE_VENTA_ONLINE dvo
        JOIN VENTA_ONLINE vo ON dvo.fk_venta_online = vo.venta_online_id
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    inventario_promedio AS (
        -- Inventario promedio en almacenes
        SELECT 
            AVG((ac.cantidad * ac.precio_unitario)::NUMERIC) as valor_inventario_almacen
        FROM ALMACEN_CERVEZA ac
        WHERE ac.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        
        UNION ALL
        
        -- Inventario promedio en anaqueles
        SELECT 
            AVG((anc.cantidad * anc.precio_unitario)::NUMERIC) as valor_inventario_anaquel
        FROM ANAQUEL_CERVEZA anc
        WHERE anc.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    )
    SELECT 
        CASE 
            WHEN COALESCE(SUM(vp.costo_venta), 0) = 0 OR COALESCE(AVG(inv.valor_inventario_almacen), 0) = 0 
            THEN 0::NUMERIC 
            ELSE ROUND((SUM(vp.costo_venta) / AVG(inv.valor_inventario_almacen))::NUMERIC, 2)
        END as rotacion_inventario,
        COALESCE(SUM(vp.costo_venta), 0)::NUMERIC as costo_productos_vendidos,
        COALESCE(AVG(inv.valor_inventario_almacen), 0)::NUMERIC as valor_promedio_inventario,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM ventas_periodo vp
    CROSS JOIN inventario_promedio inv;
END;
$$ LANGUAGE plpgsql;

-- 2. TASA DE RUPTURA DE STOCK (STOCKOUT RATE)
-- Mide la frecuencia con la que las tiendas se quedan sin productos

CREATE OR REPLACE FUNCTION obtener_tasa_ruptura_stock(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    tasa_ruptura_stock NUMERIC(5,2),
    productos_sin_stock INTEGER,
    total_productos INTEGER,
    periodo_inicio DATE,
    periodo_fin DATE
) AS $$
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH productos_anaquel AS (
        SELECT DISTINCT
            anc.fk_cerveza_presentacion,
            CASE WHEN anc.cantidad = 0 THEN 1 ELSE 0 END as sin_stock
        FROM ANAQUEL_CERVEZA anc
        WHERE anc.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    productos_almacen AS (
        SELECT DISTINCT
            ac.fk_cerveza_presentacion,
            CASE WHEN ac.cantidad = 0 THEN 1 ELSE 0 END as sin_stock
        FROM ALMACEN_CERVEZA ac
        WHERE ac.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    total_productos_union AS (
        SELECT fk_cerveza_presentacion, sin_stock FROM productos_anaquel
        UNION
        SELECT fk_cerveza_presentacion, sin_stock FROM productos_almacen
    )
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0::NUMERIC
            ELSE ROUND((SUM(sin_stock) * 100.0 / COUNT(*))::NUMERIC, 2)
        END as tasa_ruptura_stock,
        COALESCE(SUM(sin_stock), 0)::INTEGER as productos_sin_stock,
        COALESCE(COUNT(*), 0)::INTEGER as total_productos,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM total_productos_union;
END;
$$ LANGUAGE plpgsql;

-- 3. VENTAS POR EMPLEADO
-- Evalúa el rendimiento del personal de ventas en las tiendas físicas

CREATE OR REPLACE FUNCTION obtener_ventas_por_empleado(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    empleado_id INTEGER,
    nombre_completo VARCHAR(200),
    total_ventas INTEGER,
    cantidad_ventas INTEGER,
    promedio_venta NUMERIC(10,2),
    periodo_inicio DATE,
    periodo_fin DATE
) AS $$
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    RETURN QUERY
    SELECT 
        e.empleado_id,
        (CONCAT(e.primer_nombre, ' ', e.primer_apellido, 
               CASE WHEN e.segundo_nombre IS NOT NULL THEN ' ' || e.segundo_nombre ELSE '' END,
               CASE WHEN e.segundo_apellido IS NOT NULL THEN ' ' || e.segundo_apellido ELSE '' END
        ))::VARCHAR(200) as nombre_completo,
        COALESCE(SUM(vt.total), 0)::INTEGER as total_ventas,
        COALESCE(COUNT(vt.venta_tienda_id), 0)::INTEGER as cantidad_ventas,
        CASE 
            WHEN COUNT(vt.venta_tienda_id) = 0 THEN 0::NUMERIC
            ELSE ROUND((SUM(vt.total) / COUNT(vt.venta_tienda_id))::NUMERIC, 2)
        END as promedio_venta,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM EMPLEADO e
    LEFT JOIN USUARIO u ON e.empleado_id = u.fk_empleado
    LEFT JOIN VENTA_TIENDA vt ON (
        vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        -- Asumiendo que las ventas de tienda están asociadas a empleados
        -- Esta relación puede necesitar ajuste según la lógica de negocio
    )
    GROUP BY e.empleado_id, e.primer_nombre, e.primer_apellido, e.segundo_nombre, e.segundo_apellido
    ORDER BY total_ventas DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. FUNCIÓN PRINCIPAL PARA OBTENER TODOS LOS INDICADORES

CREATE OR REPLACE FUNCTION obtener_indicadores_inventario_operaciones(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    rotacion_inv RECORD;
    ruptura_stock RECORD;
    ventas_empleados JSON;
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    -- Obtener rotación de inventario
    SELECT * INTO rotacion_inv 
    FROM obtener_rotacion_inventario(p_fecha_inicio, p_fecha_fin);

    -- Obtener tasa de ruptura de stock
    SELECT * INTO ruptura_stock 
    FROM obtener_tasa_ruptura_stock(p_fecha_inicio, p_fecha_fin);

    -- Obtener ventas por empleado como JSON
    SELECT COALESCE(json_agg(ROW_TO_JSON(ve)), '[]'::json) INTO ventas_empleados
    FROM obtener_ventas_por_empleado(p_fecha_inicio, p_fecha_fin) ve;

    -- Construir resultado JSON
    resultado := json_build_object(
        'rotacion_inventario', json_build_object(
            'rotacion_inventario', COALESCE(rotacion_inv.rotacion_inventario, 0),
            'costo_productos_vendidos', COALESCE(rotacion_inv.costo_productos_vendidos, 0),
            'valor_promedio_inventario', COALESCE(rotacion_inv.valor_promedio_inventario, 0),
            'periodo_inicio', rotacion_inv.periodo_inicio,
            'periodo_fin', rotacion_inv.periodo_fin
        ),
        'tasa_ruptura_stock', json_build_object(
            'tasa_ruptura_stock', COALESCE(ruptura_stock.tasa_ruptura_stock, 0),
            'productos_sin_stock', COALESCE(ruptura_stock.productos_sin_stock, 0),
            'total_productos', COALESCE(ruptura_stock.total_productos, 0),
            'periodo_inicio', ruptura_stock.periodo_inicio,
            'periodo_fin', ruptura_stock.periodo_fin
        ),
        'ventas_por_empleado', ventas_empleados,
        'periodo', json_build_object(
            'fecha_inicio', p_fecha_inicio,
            'fecha_fin', p_fecha_fin
        )
    );

    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Obtener todos los indicadores para el último mes
-- SELECT * FROM obtener_indicadores_inventario_operaciones();

-- Ejemplo 2: Obtener indicadores para un período específico
-- SELECT * FROM obtener_indicadores_inventario_operaciones('2024-01-01', '2024-01-31');

-- Ejemplo 3: Obtener solo rotación de inventario
-- SELECT * FROM obtener_rotacion_inventario('2024-01-01', '2024-01-31');

-- Ejemplo 4: Obtener solo tasa de ruptura de stock
-- SELECT * FROM obtener_tasa_ruptura_stock('2024-01-01', '2024-01-31');

-- Ejemplo 5: Obtener solo ventas por empleado
-- SELECT * FROM obtener_ventas_por_empleado('2024-01-01', '2024-01-31'); 