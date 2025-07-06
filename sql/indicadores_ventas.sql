-- =====================================================
-- INDICADORES DE VENTAS - FUNCIONES SQL
-- =====================================================

-- 1. VENTAS TOTALES POR TIENDA
-- Muestra el total de ingresos generados, desglosado por tienda física y tienda en línea
CREATE OR REPLACE FUNCTION get_ventas_totales_por_tienda(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    tipo_tienda VARCHAR,
    total_ventas NUMERIC,
    cantidad_ventas BIGINT,
    ticket_promedio NUMERIC,
    porcentaje_total NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ventas_consolidadas AS (
        -- Ventas de tienda física
        SELECT 
            'Tienda Física'::VARCHAR as tipo_tienda,
            SUM(vt.total) as total_ventas,
            COUNT(vt.venta_tienda_id) as cantidad_ventas
        FROM venta_tienda vt
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
        
        UNION ALL
        
        -- Ventas online
        SELECT 
            'Tienda Online'::VARCHAR as tipo_tienda,
            SUM(vo.total) as total_ventas,
            COUNT(vo.venta_online_id) as cantidad_ventas
        FROM venta_online vo
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
    ),
    totales AS (
        SELECT SUM(total_ventas) as total_general
        FROM ventas_consolidadas
    )
    SELECT 
        vc.tipo_tienda,
        vc.total_ventas,
        vc.cantidad_ventas,
        CASE 
            WHEN vc.cantidad_ventas > 0 THEN ROUND(vc.total_ventas / vc.cantidad_ventas, 2)
            ELSE 0 
        END as ticket_promedio,
        CASE 
            WHEN t.total_general > 0 THEN ROUND((vc.total_ventas / t.total_general) * 100, 2)
            ELSE 0 
        END as porcentaje_total
    FROM ventas_consolidadas vc, totales t
    ORDER BY vc.total_ventas DESC;
END;
$$;

-- 2. CRECIMIENTO DE VENTAS ($$ y %)
-- Compara las ventas de un período con el período anterior
CREATE OR REPLACE FUNCTION get_crecimiento_ventas(
    p_periodo VARCHAR DEFAULT 'mes' -- 'mes', 'trimestre', 'año'
)
RETURNS TABLE (
    periodo_actual VARCHAR,
    periodo_anterior VARCHAR,
    ventas_actuales NUMERIC,
    ventas_anteriores NUMERIC,
    crecimiento_absoluto NUMERIC,
    crecimiento_porcentual NUMERIC,
    tipo_tienda VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    fecha_inicio_actual DATE;
    fecha_fin_actual DATE;
    fecha_inicio_anterior DATE;
    fecha_fin_anterior DATE;
BEGIN
    -- Calcular fechas según el período
    IF p_periodo = 'mes' THEN
        fecha_inicio_actual := DATE_TRUNC('month', CURRENT_DATE);
        fecha_fin_actual := fecha_inicio_actual + INTERVAL '1 month' - INTERVAL '1 day';
        fecha_inicio_anterior := fecha_inicio_actual - INTERVAL '1 month';
        fecha_fin_anterior := fecha_inicio_actual - INTERVAL '1 day';
    ELSIF p_periodo = 'trimestre' THEN
        fecha_inicio_actual := DATE_TRUNC('quarter', CURRENT_DATE);
        fecha_fin_actual := fecha_inicio_actual + INTERVAL '3 months' - INTERVAL '1 day';
        fecha_inicio_anterior := fecha_inicio_actual - INTERVAL '3 months';
        fecha_fin_anterior := fecha_inicio_actual - INTERVAL '1 day';
    ELSIF p_periodo = 'año' THEN
        fecha_inicio_actual := DATE_TRUNC('year', CURRENT_DATE);
        fecha_fin_actual := fecha_inicio_actual + INTERVAL '1 year' - INTERVAL '1 day';
        fecha_inicio_anterior := fecha_inicio_actual - INTERVAL '1 year';
        fecha_fin_anterior := fecha_inicio_actual - INTERVAL '1 day';
    END IF;

    RETURN QUERY
    WITH ventas_periodos AS (
        -- Ventas tienda física - período actual
        SELECT 
            'Tienda Física'::VARCHAR as tipo_tienda,
            SUM(vt.total) as ventas_actuales,
            0 as ventas_anteriores
        FROM venta_tienda vt
        WHERE vt.fecha BETWEEN fecha_inicio_actual AND fecha_fin_actual
        
        UNION ALL
        
        -- Ventas tienda física - período anterior
        SELECT 
            'Tienda Física'::VARCHAR as tipo_tienda,
            0 as ventas_actuales,
            SUM(vt.total) as ventas_anteriores
        FROM venta_tienda vt
        WHERE vt.fecha BETWEEN fecha_inicio_anterior AND fecha_fin_anterior
        
        UNION ALL
        
        -- Ventas online - período actual
        SELECT 
            'Tienda Online'::VARCHAR as tipo_tienda,
            SUM(vo.total) as ventas_actuales,
            0 as ventas_anteriores
        FROM venta_online vo
        WHERE vo.fecha_emision BETWEEN fecha_inicio_actual AND fecha_fin_actual
        
        UNION ALL
        
        -- Ventas online - período anterior
        SELECT 
            'Tienda Online'::VARCHAR as tipo_tienda,
            0 as ventas_actuales,
            SUM(vo.total) as ventas_anteriores
        FROM venta_online vo
        WHERE vo.fecha_emision BETWEEN fecha_inicio_anterior AND fecha_fin_anterior
    ),
    ventas_agrupadas AS (
        SELECT 
            tipo_tienda,
            SUM(ventas_actuales) as ventas_actuales,
            SUM(ventas_anteriores) as ventas_anteriores
        FROM ventas_periodos
        GROUP BY tipo_tienda
    )
    SELECT 
        TO_CHAR(fecha_inicio_actual, 'DD/MM/YYYY') || ' - ' || TO_CHAR(fecha_fin_actual, 'DD/MM/YYYY') as periodo_actual,
        TO_CHAR(fecha_inicio_anterior, 'DD/MM/YYYY') || ' - ' || TO_CHAR(fecha_fin_anterior, 'DD/MM/YYYY') as periodo_anterior,
        va.ventas_actuales,
        va.ventas_anteriores,
        (va.ventas_actuales - va.ventas_anteriores) as crecimiento_absoluto,
        CASE 
            WHEN va.ventas_anteriores > 0 THEN ROUND(((va.ventas_actuales - va.ventas_anteriores) / va.ventas_anteriores) * 100, 2)
            ELSE 0 
        END as crecimiento_porcentual,
        va.tipo_tienda
    FROM ventas_agrupadas va
    ORDER BY va.tipo_tienda;
END;
$$;

-- 3. TICKET PROMEDIO (VMP)
-- Calcula el valor promedio de cada venta
CREATE OR REPLACE FUNCTION get_ticket_promedio(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_tipo_tienda VARCHAR DEFAULT NULL -- 'fisica', 'online', NULL para ambas
)
RETURNS TABLE (
    tipo_tienda VARCHAR,
    ticket_promedio NUMERIC,
    cantidad_ventas BIGINT,
    venta_minima NUMERIC,
    venta_maxima NUMERIC,
    mediana NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ventas_consolidadas AS (
        -- Ventas de tienda física
        SELECT 
            'Tienda Física'::VARCHAR as tipo_tienda,
            vt.total as monto_venta
        FROM venta_tienda vt
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
          AND (p_tipo_tienda IS NULL OR p_tipo_tienda = 'fisica')
        
        UNION ALL
        
        -- Ventas online
        SELECT 
            'Tienda Online'::VARCHAR as tipo_tienda,
            vo.total as monto_venta
        FROM venta_online vo
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
          AND (p_tipo_tienda IS NULL OR p_tipo_tienda = 'online')
    ),
    estadisticas AS (
        SELECT 
            tipo_tienda,
            COUNT(*) as cantidad_ventas,
            AVG(monto_venta) as ticket_promedio,
            MIN(monto_venta) as venta_minima,
            MAX(monto_venta) as venta_maxima,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY monto_venta) as mediana
        FROM ventas_consolidadas
        GROUP BY tipo_tienda
    )
    SELECT 
        s.tipo_tienda,
        ROUND(s.ticket_promedio, 2) as ticket_promedio,
        s.cantidad_ventas,
        s.venta_minima,
        s.venta_maxima,
        ROUND(s.mediana, 2) as mediana
    FROM estadisticas s
    ORDER BY s.ticket_promedio DESC;
END;
$$;

-- 4. VOLUMEN DE UNIDADES VENDIDAS
-- Muestra la cantidad total de cervezas vendidas
CREATE OR REPLACE FUNCTION get_volumen_unidades_vendidas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_tipo_tienda VARCHAR DEFAULT NULL -- 'fisica', 'online', NULL para ambas
)
RETURNS TABLE (
    tipo_tienda VARCHAR,
    total_unidades BIGINT,
    total_ingresos NUMERIC,
    precio_promedio_unitario NUMERIC,
    cantidad_productos_diferentes BIGINT,
    top_productos JSON
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ventas_detalladas AS (
        -- Detalles de venta tienda física
        SELECT 
            'Tienda Física'::VARCHAR as tipo_tienda,
            dvt.cantidad,
            dvt.precio_unitario,
            c.nombre as nombre_cerveza,
            p.cap_volumen,
            p.material
        FROM detalle_venta_tienda dvt
        JOIN venta_tienda vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        JOIN anaquel_cerveza ac ON dvt.fk_anaquel_cerveza = ac.anaquel_cerveza_id
        JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
        JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
          AND (p_tipo_tienda IS NULL OR p_tipo_tienda = 'fisica')
        
        UNION ALL
        
        -- Detalles de venta online
        SELECT 
            'Tienda Online'::VARCHAR as tipo_tienda,
            dvo.cantidad,
            dvo.precio_unitario,
            c.nombre as nombre_cerveza,
            p.cap_volumen,
            p.material
        FROM detalle_venta_online dvo
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN almacen_cerveza ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
        JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
        JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
          AND (p_tipo_tienda IS NULL OR p_tipo_tienda = 'online')
    ),
    resumen_por_tienda AS (
        SELECT 
            tipo_tienda,
            SUM(cantidad) as total_unidades,
            SUM(cantidad * precio_unitario) as total_ingresos,
            CASE 
                WHEN SUM(cantidad) > 0 THEN SUM(cantidad * precio_unitario) / SUM(cantidad)
                ELSE 0 
            END as precio_promedio_unitario,
            COUNT(DISTINCT nombre_cerveza || ' ' || cap_volumen || 'ml ' || material) as cantidad_productos_diferentes
        FROM ventas_detalladas
        GROUP BY tipo_tienda
    ),
    top_productos_por_tienda AS (
        SELECT 
            tipo_tienda,
            json_agg(
                json_build_object(
                    'producto', nombre_cerveza || ' ' || cap_volumen || 'ml ' || material,
                    'unidades_vendidas', total_unidades,
                    'ingresos', total_ingresos
                ) ORDER BY total_unidades DESC
            ) as top_productos
        FROM (
            SELECT 
                tipo_tienda,
                nombre_cerveza || ' ' || cap_volumen || 'ml ' || material as producto,
                SUM(cantidad) as total_unidades,
                SUM(cantidad * precio_unitario) as total_ingresos
            FROM ventas_detalladas
            GROUP BY tipo_tienda, nombre_cerveza, cap_volumen, material
            ORDER BY total_unidades DESC
            LIMIT 5
        ) sub
        GROUP BY tipo_tienda
    )
    SELECT 
        r.tipo_tienda,
        r.total_unidades,
        r.total_ingresos,
        ROUND(r.precio_promedio_unitario, 2) as precio_promedio_unitario,
        r.cantidad_productos_diferentes,
        COALESCE(tp.top_productos, '[]'::json) as top_productos
    FROM resumen_por_tienda r
    LEFT JOIN top_productos_por_tienda tp ON r.tipo_tienda = tp.tipo_tienda
    ORDER BY r.total_unidades DESC;
END;
$$;

-- 5. VENTAS POR ESTILO DE CERVEZA
-- Analiza qué estilos de cerveza son los más vendidos
CREATE OR REPLACE FUNCTION get_ventas_por_estilo_cerveza(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_limite INTEGER DEFAULT 10
)
RETURNS TABLE (
    estilo_cerveza_id INTEGER,
    nombre_estilo VARCHAR,
    total_unidades_vendidas BIGINT,
    total_ingresos NUMERIC,
    precio_promedio_unitario NUMERIC,
    cantidad_ventas BIGINT,
    porcentaje_participacion NUMERIC,
    ranking INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ventas_por_estilo AS (
        -- Ventas de tienda física por estilo
        SELECT 
            ec.estilo_cerveza_id,
            ec.nombre as nombre_estilo,
            SUM(dvt.cantidad) as total_unidades,
            SUM(dvt.cantidad * dvt.precio_unitario) as total_ingresos,
            COUNT(DISTINCT vt.venta_tienda_id) as cantidad_ventas
        FROM detalle_venta_tienda dvt
        JOIN venta_tienda vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        JOIN anaquel_cerveza ac ON dvt.fk_anaquel_cerveza = ac.anaquel_cerveza_id
        JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
        JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
        GROUP BY ec.estilo_cerveza_id, ec.nombre
        
        UNION ALL
        
        -- Ventas online por estilo
        SELECT 
            ec.estilo_cerveza_id,
            ec.nombre as nombre_estilo,
            SUM(dvo.cantidad) as total_unidades,
            SUM(dvo.cantidad * dvo.precio_unitario) as total_ingresos,
            COUNT(DISTINCT vo.venta_online_id) as cantidad_ventas
        FROM detalle_venta_online dvo
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN almacen_cerveza ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
        JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
        JOIN estilo_cerveza ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
        GROUP BY ec.estilo_cerveza_id, ec.nombre
    ),
    resumen_estilos AS (
        SELECT 
            estilo_cerveza_id,
            nombre_estilo,
            SUM(total_unidades) as total_unidades_vendidas,
            SUM(total_ingresos) as total_ingresos,
            CASE 
                WHEN SUM(total_unidades) > 0 THEN SUM(total_ingresos) / SUM(total_unidades)
                ELSE 0 
            END as precio_promedio_unitario,
            SUM(cantidad_ventas) as cantidad_ventas
        FROM ventas_por_estilo
        GROUP BY estilo_cerveza_id, nombre_estilo
    ),
    totales AS (
        SELECT 
            SUM(total_unidades_vendidas) as total_general_unidades,
            SUM(total_ingresos) as total_general_ingresos
        FROM resumen_estilos
    )
    SELECT 
        re.estilo_cerveza_id,
        re.nombre_estilo,
        re.total_unidades_vendidas,
        re.total_ingresos,
        ROUND(re.precio_promedio_unitario, 2) as precio_promedio_unitario,
        re.cantidad_ventas,
        CASE 
            WHEN t.total_general_unidades > 0 THEN ROUND((re.total_unidades_vendidas / t.total_general_unidades) * 100, 2)
            ELSE 0 
        END as porcentaje_participacion,
        ROW_NUMBER() OVER (ORDER BY re.total_unidades_vendidas DESC) as ranking
    FROM resumen_estilos re, totales t
    ORDER BY re.total_unidades_vendidas DESC
    LIMIT p_limite;
END;
$$;

-- 6. FUNCIÓN RESUMEN GENERAL DE INDICADORES DE VENTAS
-- Proporciona un resumen completo de todos los indicadores
CREATE OR REPLACE FUNCTION get_resumen_indicadores_ventas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    indicador VARCHAR,
    valor NUMERIC,
    descripcion TEXT,
    unidad VARCHAR
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH ventas_consolidadas AS (
        -- Ventas tienda física
        SELECT 
            'fisica' as tipo,
            vt.total,
            vt.fecha,
            1 as cantidad_ventas
        FROM venta_tienda vt
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
        
        UNION ALL
        
        -- Ventas online
        SELECT 
            'online' as tipo,
            vo.total,
            vo.fecha_emision as fecha,
            1 as cantidad_ventas
        FROM venta_online vo
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
    ),
    resumen_general AS (
        SELECT 
            SUM(total) as ventas_totales,
            COUNT(*) as cantidad_ventas,
            AVG(total) as ticket_promedio,
            MIN(total) as venta_minima,
            MAX(total) as venta_maxima
        FROM ventas_consolidadas
    ),
    unidades_vendidas AS (
        SELECT 
            SUM(dvt.cantidad) as unidades_fisica
        FROM detalle_venta_tienda dvt
        JOIN venta_tienda vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        WHERE (p_fecha_inicio IS NULL OR vt.fecha >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vt.fecha <= p_fecha_fin)
    ),
    unidades_online AS (
        SELECT 
            SUM(dvo.cantidad) as unidades_online
        FROM detalle_venta_online dvo
        JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
        WHERE (p_fecha_inicio IS NULL OR vo.fecha_emision >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR vo.fecha_emision <= p_fecha_fin)
    )
    SELECT 
        'Ventas Totales'::VARCHAR as indicador,
        rg.ventas_totales as valor,
        'Total de ingresos generados en el período'::TEXT as descripcion,
        'Bs.'::VARCHAR as unidad
    FROM resumen_general rg
    
    UNION ALL
    
    SELECT 
        'Cantidad de Ventas'::VARCHAR as indicador,
        rg.cantidad_ventas::NUMERIC as valor,
        'Número total de transacciones realizadas'::TEXT as descripcion,
        'ventas'::VARCHAR as unidad
    FROM resumen_general rg
    
    UNION ALL
    
    SELECT 
        'Ticket Promedio'::VARCHAR as indicador,
        ROUND(rg.ticket_promedio, 2) as valor,
        'Valor promedio por transacción'::TEXT as descripcion,
        'Bs.'::VARCHAR as unidad
    FROM resumen_general rg
    
    UNION ALL
    
    SELECT 
        'Venta Mínima'::VARCHAR as indicador,
        rg.venta_minima as valor,
        'Transacción con menor valor'::TEXT as descripcion,
        'Bs.'::VARCHAR as unidad
    FROM resumen_general rg
    
    UNION ALL
    
    SELECT 
        'Venta Máxima'::VARCHAR as indicador,
        rg.venta_maxima as valor,
        'Transacción con mayor valor'::TEXT as descripcion,
        'Bs.'::VARCHAR as unidad
    FROM resumen_general rg
    
    UNION ALL
    
    SELECT 
        'Unidades Vendidas'::VARCHAR as indicador,
        COALESCE(uf.unidades_fisica, 0) + COALESCE(uo.unidades_online, 0) as valor,
        'Cantidad total de productos vendidos'::TEXT as descripcion,
        'unidades'::VARCHAR as unidad
    FROM unidades_vendidas uf, unidades_online uo;
END;
$$;

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

/*
-- 1. Obtener ventas totales por tienda
SELECT * FROM get_ventas_totales_por_tienda('2025-01-01', '2025-12-31');

-- 2. Obtener crecimiento de ventas (mes actual vs mes anterior)
SELECT * FROM get_crecimiento_ventas('mes');

-- 3. Obtener ticket promedio
SELECT * FROM get_ticket_promedio('2025-01-01', '2025-12-31');

-- 4. Obtener volumen de unidades vendidas
SELECT * FROM get_volumen_unidades_vendidas('2025-01-01', '2025-12-31');

-- 5. Obtener ventas por estilo de cerveza
SELECT * FROM get_ventas_por_estilo_cerveza('2025-01-01', '2025-12-31', 10);

-- 6. Obtener resumen general de indicadores
SELECT * FROM get_resumen_indicadores_ventas('2025-01-01', '2025-12-31');
*/ 