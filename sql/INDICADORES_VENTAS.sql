-- =====================================================
-- STORED PROCEDURES PARA INDICADORES DE VENTAS
-- =====================================================

-- 1. VENTAS TOTALES POR TIENDA
-- Muestra el total de ingresos generados, desglosado por tienda física y tienda en línea

CREATE OR REPLACE FUNCTION obtener_ventas_totales_por_tienda(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    tipo_tienda VARCHAR(20),
    total_ventas NUMERIC(15,2),
    cantidad_ventas INTEGER,
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
        'Tienda Física'::VARCHAR(20) as tipo_tienda,
        COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC(15,2) as total_ventas,
        COALESCE(COUNT(DISTINCT vt.venta_tienda_id), 0)::INTEGER as cantidad_ventas,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM VENTA_TIENDA vt
    JOIN DETALLE_VENTA_TIENDA dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
    WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    
    UNION ALL
    
    SELECT 
        'Tienda Online'::VARCHAR(20) as tipo_tienda,
        COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC(15,2) as total_ventas,
        COALESCE(COUNT(DISTINCT vo.venta_online_id), 0)::INTEGER as cantidad_ventas,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM VENTA_ONLINE vo
    JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
    WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin;
END;
$$ LANGUAGE plpgsql;

-- 2. CRECIMIENTO DE VENTAS ($$ y %)
-- Compara las ventas de un período con el período anterior

CREATE OR REPLACE FUNCTION obtener_crecimiento_ventas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    periodo_actual_total NUMERIC(15,2),
    periodo_anterior_total NUMERIC(15,2),
    crecimiento_dolares NUMERIC(15,2),
    crecimiento_porcentual NUMERIC(15,2),
    periodo_actual_inicio DATE,
    periodo_actual_fin DATE,
    periodo_anterior_inicio DATE,
    periodo_anterior_fin DATE
) AS $$
DECLARE
    v_duracion_periodo INTEGER;
    v_periodo_anterior_inicio DATE;
    v_periodo_anterior_fin DATE;
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    -- Calcular duración del período
    v_duracion_periodo := p_fecha_fin - p_fecha_inicio;
    
    -- Calcular período anterior
    v_periodo_anterior_fin := p_fecha_inicio - INTERVAL '1 day';
    v_periodo_anterior_inicio := v_periodo_anterior_fin - (v_duracion_periodo * INTERVAL '1 day');

    RETURN QUERY
    WITH ventas_periodo_actual AS (
        -- Ventas de tienda en período actual
        SELECT COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC as total_tienda
        FROM VENTA_TIENDA vt
        JOIN DETALLE_VENTA_TIENDA dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        
        UNION ALL
        
        -- Ventas online en período actual
        SELECT COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC as total_online
        FROM VENTA_ONLINE vo
        JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    ventas_periodo_anterior AS (
        -- Ventas de tienda en período anterior
        SELECT COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC as total_tienda
        FROM VENTA_TIENDA vt
        JOIN DETALLE_VENTA_TIENDA dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
        WHERE vt.fecha BETWEEN v_periodo_anterior_inicio AND v_periodo_anterior_fin
        
        UNION ALL
        
        -- Ventas online en período anterior
        SELECT COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC as total_online
        FROM VENTA_ONLINE vo
        JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
        WHERE vo.fecha_emision BETWEEN v_periodo_anterior_inicio AND v_periodo_anterior_fin
    )
    SELECT 
        COALESCE(SUM(vpa.total_tienda), 0)::NUMERIC(15,2) as periodo_actual_total,
        COALESCE(SUM(vpan.total_tienda), 0)::NUMERIC(15,2) as periodo_anterior_total,
        (COALESCE(SUM(vpa.total_tienda), 0) - COALESCE(SUM(vpan.total_tienda), 0))::NUMERIC(15,2) as crecimiento_dolares,
        CASE 
            WHEN COALESCE(SUM(vpan.total_tienda), 0) = 0 THEN 
                CASE WHEN COALESCE(SUM(vpa.total_tienda), 0) > 0 THEN 100.00 ELSE 0.00 END
            ELSE 
                ROUND(((COALESCE(SUM(vpa.total_tienda), 0) - COALESCE(SUM(vpan.total_tienda), 0)) / COALESCE(SUM(vpan.total_tienda), 1)) * 100, 2)
        END::NUMERIC(15,2) as crecimiento_porcentual,
        p_fecha_inicio as periodo_actual_inicio,
        p_fecha_fin as periodo_actual_fin,
        v_periodo_anterior_inicio as periodo_anterior_inicio,
        v_periodo_anterior_fin as periodo_anterior_fin
    FROM ventas_periodo_actual vpa
    CROSS JOIN ventas_periodo_anterior vpan;
END;
$$ LANGUAGE plpgsql;

-- 3. TICKET PROMEDIO (VMP)
-- Calcula el valor promedio de cada venta

CREATE OR REPLACE FUNCTION obtener_ticket_promedio(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    ticket_promedio_tienda NUMERIC(10,2),
    ticket_promedio_online NUMERIC(10,2),
    ticket_promedio_general NUMERIC(10,2),
    total_ventas_tienda INTEGER,
    total_ventas_online INTEGER,
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
    WITH ventas_tienda AS (
        SELECT 
            COALESCE(AVG(total_venta), 0)::NUMERIC(10,2) as ticket_promedio,
            COALESCE(COUNT(venta_tienda_id), 0)::INTEGER as cantidad_ventas
        FROM (
            SELECT 
                vt.venta_tienda_id,
                SUM(dvt.precio_unitario * dvt.cantidad) as total_venta
            FROM VENTA_TIENDA vt
            JOIN DETALLE_VENTA_TIENDA dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
            WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
            GROUP BY vt.venta_tienda_id
        ) ventas_agrupadas
    ),
    ventas_online AS (
        SELECT 
            COALESCE(AVG(total_venta), 0)::NUMERIC(10,2) as ticket_promedio,
            COALESCE(COUNT(venta_online_id), 0)::INTEGER as cantidad_ventas
        FROM (
            SELECT 
                vo.venta_online_id,
                SUM(dvo.precio_unitario * dvo.cantidad) as total_venta
            FROM VENTA_ONLINE vo
            JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
            WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
            GROUP BY vo.venta_online_id
        ) ventas_agrupadas
    ),
    ventas_general AS (
        SELECT 
            COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC as total_tienda,
            COALESCE(COUNT(DISTINCT vt.venta_tienda_id), 0)::INTEGER as cantidad_tienda
        FROM VENTA_TIENDA vt
        JOIN DETALLE_VENTA_TIENDA dvt ON vt.venta_tienda_id = dvt.fk_venta_tienda
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        
        UNION ALL
        
        SELECT 
            COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC as total_online,
            COALESCE(COUNT(DISTINCT vo.venta_online_id), 0)::INTEGER as cantidad_online
        FROM VENTA_ONLINE vo
        JOIN DETALLE_VENTA_ONLINE dvo ON vo.venta_online_id = dvo.fk_venta_online
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
    )
    SELECT 
        vt.ticket_promedio as ticket_promedio_tienda,
        vo.ticket_promedio as ticket_promedio_online,
        CASE 
            WHEN (vt.cantidad_ventas + vo.cantidad_ventas) = 0 THEN 0::NUMERIC(10,2)
            ELSE ROUND((SUM(vg.total_tienda) / SUM(vg.cantidad_tienda))::NUMERIC(10,2), 2)
        END as ticket_promedio_general,
        vt.cantidad_ventas as total_ventas_tienda,
        vo.cantidad_ventas as total_ventas_online,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM ventas_tienda vt
    CROSS JOIN ventas_online vo
    CROSS JOIN ventas_general vg
    GROUP BY vt.ticket_promedio, vo.ticket_promedio, vt.cantidad_ventas, vo.cantidad_ventas;
END;
$$ LANGUAGE plpgsql;

-- 4. VOLUMEN DE UNIDADES VENDIDAS
-- Muestra la cantidad total de cervezas vendidas

CREATE OR REPLACE FUNCTION obtener_volumen_unidades_vendidas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    unidades_tienda INTEGER,
    unidades_online INTEGER,
    total_unidades INTEGER,
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
    WITH unidades_tienda AS (
        SELECT COALESCE(SUM(dvt.cantidad), 0)::INTEGER as total_unidades
        FROM DETALLE_VENTA_TIENDA dvt
        JOIN VENTA_TIENDA vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    ),
    unidades_online AS (
        SELECT COALESCE(SUM(dvo.cantidad), 0)::INTEGER as total_unidades
        FROM DETALLE_VENTA_ONLINE dvo
        JOIN VENTA_ONLINE vo ON dvo.fk_venta_online = vo.venta_online_id
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
    )
    SELECT 
        ut.total_unidades as unidades_tienda,
        uo.total_unidades as unidades_online,
        (ut.total_unidades + uo.total_unidades)::INTEGER as total_unidades,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM unidades_tienda ut
    CROSS JOIN unidades_online uo;
END;
$$ LANGUAGE plpgsql;

-- 5. VENTAS POR ESTILO DE CERVEZA
-- Analiza qué estilos de cerveza son los más vendidos

CREATE OR REPLACE FUNCTION obtener_ventas_por_estilo_cerveza(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE (
    estilo_cerveza_id INTEGER,
    nombre_estilo VARCHAR(50),
    unidades_vendidas INTEGER,
    total_ventas NUMERIC(15,2),
    porcentaje_ventas NUMERIC(15,2),
    periodo_inicio DATE,
    periodo_fin DATE
) AS $$
DECLARE
    total_ventas_var NUMERIC(15,2); -- variable interna, nombre cambiado
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    -- Calcular el total de ventas del período para el cálculo de porcentaje
    SELECT
        COALESCE(SUM(sub.total_ventas), 0)::NUMERIC(15,2)
    INTO total_ventas_var
    FROM (
        -- Ventas de tienda por estilo
        SELECT
            ec.estilo_cerveza_id,
            COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC(15,2) as total_ventas
        FROM DETALLE_VENTA_TIENDA dvt
        JOIN VENTA_TIENDA vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        JOIN ANAQUEL_CERVEZA anc ON dvt.fk_anaquel_cerveza = anc.anaquel_cerveza_id
        JOIN CERVEZA_PRESENTACION cp ON anc.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
        JOIN ESTILO_CERVEZA ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY ec.estilo_cerveza_id

        UNION ALL

        -- Ventas online por estilo
        SELECT
            ec.estilo_cerveza_id,
            COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC(15,2) as total_ventas
        FROM DETALLE_VENTA_ONLINE dvo
        JOIN VENTA_ONLINE vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
        JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
        JOIN ESTILO_CERVEZA ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY ec.estilo_cerveza_id
    ) sub;

    RETURN QUERY
    WITH ventas_por_estilo AS (
        -- Ventas de tienda por estilo
        SELECT
            ec.estilo_cerveza_id,
            ec.nombre as nombre_estilo,
            COALESCE(SUM(dvt.cantidad), 0)::INTEGER as unidades_vendidas,
            COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0)::NUMERIC(15,2) as total_ventas
        FROM DETALLE_VENTA_TIENDA dvt
        JOIN VENTA_TIENDA vt ON dvt.fk_venta_tienda = vt.venta_tienda_id
        JOIN ANAQUEL_CERVEZA anc ON dvt.fk_anaquel_cerveza = anc.anaquel_cerveza_id
        JOIN CERVEZA_PRESENTACION cp ON anc.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
        JOIN ESTILO_CERVEZA ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE vt.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY ec.estilo_cerveza_id, ec.nombre

        UNION ALL

        -- Ventas online por estilo
        SELECT
            ec.estilo_cerveza_id,
            ec.nombre as nombre_estilo,
            COALESCE(SUM(dvo.cantidad), 0)::INTEGER as unidades_vendidas,
            COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)::NUMERIC(15,2) as total_ventas
        FROM DETALLE_VENTA_ONLINE dvo
        JOIN VENTA_ONLINE vo ON dvo.fk_venta_online = vo.venta_online_id
        JOIN ALMACEN_CERVEZA ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
        JOIN CERVEZA_PRESENTACION cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
        JOIN CERVEZA c ON cp.fk_cerveza = c.cerveza_id
        JOIN ESTILO_CERVEZA ec ON c.fk_estilo_cerveza = ec.estilo_cerveza_id
        WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
        GROUP BY ec.estilo_cerveza_id, ec.nombre
    )
    SELECT
        vps.estilo_cerveza_id,
        vps.nombre_estilo,
        SUM(vps.unidades_vendidas)::INTEGER as unidades_vendidas,
        SUM(vps.total_ventas)::NUMERIC(15,2) as total_ventas,
        CASE
            WHEN total_ventas_var = 0 THEN 0::NUMERIC(15,2)
            ELSE ROUND((SUM(vps.total_ventas) / total_ventas_var) * 100, 2)
        END as porcentaje_ventas,
        p_fecha_inicio as periodo_inicio,
        p_fecha_fin as periodo_fin
    FROM ventas_por_estilo vps
    GROUP BY vps.estilo_cerveza_id, vps.nombre_estilo, total_ventas_var
    ORDER BY SUM(vps.total_ventas) DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCIÓN PRINCIPAL PARA OBTENER TODOS LOS INDICADORES DE VENTAS

CREATE OR REPLACE FUNCTION obtener_indicadores_ventas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
    ventas_por_tienda JSON;
    crecimiento_ventas RECORD;
    ticket_promedio RECORD;
    volumen_unidades RECORD;
    ventas_por_estilo JSON;
BEGIN
    -- Si no se proporcionan fechas, usar el último mes
    IF p_fecha_inicio IS NULL THEN
        p_fecha_inicio := CURRENT_DATE - INTERVAL '1 month';
    END IF;
    
    IF p_fecha_fin IS NULL THEN
        p_fecha_fin := CURRENT_DATE;
    END IF;

    -- Obtener ventas por tienda como JSON
    SELECT COALESCE(json_agg(ROW_TO_JSON(vpt)), '[]'::json) INTO ventas_por_tienda
    FROM obtener_ventas_totales_por_tienda(p_fecha_inicio, p_fecha_fin) vpt;

    -- Obtener crecimiento de ventas
    SELECT * INTO crecimiento_ventas 
    FROM obtener_crecimiento_ventas(p_fecha_inicio, p_fecha_fin);

    -- Obtener ticket promedio
    SELECT * INTO ticket_promedio 
    FROM obtener_ticket_promedio(p_fecha_inicio, p_fecha_fin);

    -- Obtener volumen de unidades
    SELECT * INTO volumen_unidades 
    FROM obtener_volumen_unidades_vendidas(p_fecha_inicio, p_fecha_fin);

    -- Obtener ventas por estilo como JSON
    SELECT COALESCE(json_agg(ROW_TO_JSON(vpe.*)), '[]'::json) INTO ventas_por_estilo
    FROM obtener_ventas_por_estilo_cerveza(p_fecha_inicio, p_fecha_fin) vpe;

    -- Construir resultado JSON
    resultado := json_build_object(
        'ventas_por_tienda', ventas_por_tienda,
        'crecimiento_ventas', json_build_object(
            'periodo_actual_total', COALESCE(crecimiento_ventas.periodo_actual_total, 0),
            'periodo_anterior_total', COALESCE(crecimiento_ventas.periodo_anterior_total, 0),
            'crecimiento_dolares', COALESCE(crecimiento_ventas.crecimiento_dolares, 0),
            'crecimiento_porcentual', COALESCE(crecimiento_ventas.crecimiento_porcentual, 0),
            'periodo_actual_inicio', crecimiento_ventas.periodo_actual_inicio,
            'periodo_actual_fin', crecimiento_ventas.periodo_actual_fin,
            'periodo_anterior_inicio', crecimiento_ventas.periodo_anterior_inicio,
            'periodo_anterior_fin', crecimiento_ventas.periodo_anterior_fin
        ),
        'ticket_promedio', json_build_object(
            'ticket_promedio_tienda', COALESCE(ticket_promedio.ticket_promedio_tienda, 0),
            'ticket_promedio_online', COALESCE(ticket_promedio.ticket_promedio_online, 0),
            'ticket_promedio_general', COALESCE(ticket_promedio.ticket_promedio_general, 0),
            'total_ventas_tienda', COALESCE(ticket_promedio.total_ventas_tienda, 0),
            'total_ventas_online', COALESCE(ticket_promedio.total_ventas_online, 0)
        ),
        'volumen_unidades', json_build_object(
            'unidades_tienda', COALESCE(volumen_unidades.unidades_tienda, 0),
            'unidades_online', COALESCE(volumen_unidades.unidades_online, 0),
            'total_unidades', COALESCE(volumen_unidades.total_unidades, 0)
        ),
        'ventas_por_estilo', ventas_por_estilo,
        'periodo', json_build_object(
            'fecha_inicio', p_fecha_inicio,
            'fecha_fin', p_fecha_fin
        )
    );

    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tendencia de ventas por día
CREATE OR REPLACE FUNCTION obtener_tendencia_ventas(
    p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS json AS $$
DECLARE
    resultado json;
BEGIN
    SELECT json_build_object(
        'tendencia_ventas', (
            SELECT json_agg(
                json_build_object(
                    'fecha', fecha_venta,
                    'ventas_tienda_fisica', COALESCE(ventas_tienda_fisica, 0),
                    'ventas_tienda_online', COALESCE(ventas_tienda_online, 0),
                    'total_ventas', COALESCE(ventas_tienda_fisica, 0) + COALESCE(ventas_tienda_online, 0)
                )
            )
            FROM (
                SELECT 
                    fecha_venta,
                    SUM(CASE WHEN tipo_tienda = 'Tienda Física' THEN total_venta ELSE 0 END) as ventas_tienda_fisica,
                    SUM(CASE WHEN tipo_tienda = 'Tienda Online' THEN total_venta ELSE 0 END) as ventas_tienda_online
                FROM (
                    -- Ventas de tienda física
                    SELECT 
                        DATE(vt.fecha) as fecha_venta,
                        'Tienda Física' as tipo_tienda,
                        SUM(dvt.precio_unitario * dvt.cantidad) as total_venta
                    FROM VENTA_TIENDA vt
                    JOIN DETALLE_VENTA_TIENDA dvt ON dvt.fk_venta_tienda = vt.venta_tienda_id
                    WHERE DATE(vt.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin
                    GROUP BY DATE(vt.fecha)
                    
                    UNION ALL
                    
                    -- Ventas online
                    SELECT 
                        DATE(vo.fecha_emision) as fecha_venta,
                        'Tienda Online' as tipo_tienda,
                        SUM(dvo.precio_unitario * dvo.cantidad) as total_venta
                    FROM VENTA_ONLINE vo
                    JOIN DETALLE_VENTA_ONLINE dvo ON dvo.fk_venta_online = vo.venta_online_id
                    WHERE DATE(vo.fecha_emision) BETWEEN p_fecha_inicio AND p_fecha_fin
                    GROUP BY DATE(vo.fecha_emision)
                ) ventas_por_dia
                GROUP BY fecha_venta
                ORDER BY fecha_venta
            ) tendencia
        ),
        'resumen_canales', (
            SELECT json_build_object(
                'tienda_fisica', json_build_object(
                    'total_ventas', COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0),
                    'cantidad_ventas', COALESCE(COUNT(DISTINCT vt.venta_tienda_id), 0),
                    'porcentaje', CASE 
                        WHEN (COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0) + COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)) > 0 THEN 
                            ROUND((COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0) / (COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0) + COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0))) * 100, 2)
                        ELSE 0 
                    END
                ),
                'tienda_online', json_build_object(
                    'total_ventas', COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0),
                    'cantidad_ventas', COALESCE(COUNT(DISTINCT vo.venta_online_id), 0),
                    'porcentaje', CASE 
                        WHEN (COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0) + COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0)) > 0 THEN 
                            ROUND((COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0) / (COALESCE(SUM(dvt.precio_unitario * dvt.cantidad), 0) + COALESCE(SUM(dvo.precio_unitario * dvo.cantidad), 0))) * 100, 2)
                        ELSE 0 
                    END
                )
            )
            FROM VENTA_TIENDA vt
            JOIN DETALLE_VENTA_TIENDA dvt ON dvt.fk_venta_tienda = vt.venta_tienda_id
            FULL OUTER JOIN VENTA_ONLINE vo ON DATE(vt.fecha) = DATE(vo.fecha_emision)
            FULL OUTER JOIN DETALLE_VENTA_ONLINE dvo ON dvo.fk_venta_online = vo.venta_online_id
            WHERE (vt.fecha IS NULL OR DATE(vt.fecha) BETWEEN p_fecha_inicio AND p_fecha_fin)
              AND (vo.fecha_emision IS NULL OR DATE(vo.fecha_emision) BETWEEN p_fecha_inicio AND p_fecha_fin)
        ),
        'periodo', json_build_object(
            'fecha_inicio', p_fecha_inicio,
            'fecha_fin', p_fecha_fin
        )
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Obtener todos los indicadores para el último mes
-- SELECT * FROM obtener_indicadores_ventas();

-- Ejemplo 2: Obtener indicadores para un período específico
-- SELECT * FROM obtener_indicadores_ventas('2024-01-01', '2024-01-31');

-- Ejemplo 3: Obtener solo ventas por tienda
-- SELECT * FROM obtener_ventas_totales_por_tienda('2024-01-01', '2024-01-31');

-- Ejemplo 4: Obtener solo crecimiento de ventas
-- SELECT * FROM obtener_crecimiento_ventas('2024-01-01', '2024-01-31');

-- Ejemplo 5: Obtener solo ticket promedio
-- SELECT * FROM obtener_ticket_promedio('2024-01-01', '2024-01-31');

-- Ejemplo 6: Obtener solo volumen de unidades
-- SELECT * FROM obtener_volumen_unidades_vendidas('2024-01-01', '2024-01-31');

-- Ejemplo 7: Obtener solo ventas por estilo de cerveza
-- SELECT * FROM obtener_ventas_por_estilo_cerveza('2024-01-01', '2024-01-31'); 