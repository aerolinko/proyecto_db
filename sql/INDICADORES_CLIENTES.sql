-- ===== STORED PROCEDURES PARA INDICADORES DE CLIENTES =====

-- Función para obtener clientes nuevos vs recurrentes en un período
CREATE OR REPLACE FUNCTION get_clientes_nuevos_vs_recurrentes(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    total_clientes_periodo BIGINT,
    clientes_nuevos BIGINT,
    clientes_recurrentes BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
        -- Con fechas específicas
        RETURN QUERY
        WITH clientes_periodo AS (
            SELECT DISTINCT 
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN cn.cliente_id
                    WHEN cj.cliente_id IS NOT NULL THEN cj.cliente_id
                END as cliente_id,
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN 'natural'
                    WHEN cj.cliente_id IS NOT NULL THEN 'juridico'
                END as tipo_cliente,
                u.fecha_creacion
            FROM cliente_natural cn
            FULL OUTER JOIN cliente_juridico cj ON cn.cliente_id = cj.cliente_id
            LEFT JOIN usuario u ON (u.fk_cliente_natural = cn.cliente_id OR u.fk_cliente_juridico = cj.cliente_id)
            WHERE u.fecha_creacion BETWEEN p_fecha_inicio AND p_fecha_fin
        ),
        ventas_anteriores AS (
            SELECT DISTINCT 
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
                END as cliente_id,
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN 'natural'
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN 'juridico'
                END as tipo_cliente
            FROM venta_tienda vt
            WHERE vt.fecha < p_fecha_inicio
        )
        SELECT 
            COUNT(DISTINCT cp.cliente_id) as total_clientes_periodo,
            COUNT(DISTINCT CASE WHEN va.cliente_id IS NULL THEN cp.cliente_id END) as clientes_nuevos,
            COUNT(DISTINCT CASE WHEN va.cliente_id IS NOT NULL THEN cp.cliente_id END) as clientes_recurrentes
        FROM clientes_periodo cp
        LEFT JOIN ventas_anteriores va ON cp.cliente_id = va.cliente_id AND cp.tipo_cliente = va.tipo_cliente;
    ELSE
        -- Sin fechas específicas, usar todos los clientes
        RETURN QUERY
        WITH ventas_anteriores AS (
            SELECT DISTINCT 
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
                END as cliente_id,
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN 'natural'
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN 'juridico'
                END as tipo_cliente
            FROM venta_tienda vt
        ),
        todos_clientes AS (
            SELECT DISTINCT 
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN cn.cliente_id
                    WHEN cj.cliente_id IS NOT NULL THEN cj.cliente_id
                END as cliente_id,
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN 'natural'
                    WHEN cj.cliente_id IS NOT NULL THEN 'juridico'
                END as tipo_cliente
            FROM cliente_natural cn
            FULL OUTER JOIN cliente_juridico cj ON cn.cliente_id = cj.cliente_id
        )
        SELECT 
            COUNT(DISTINCT tc.cliente_id) as total_clientes_periodo,
            COUNT(DISTINCT CASE WHEN va.cliente_id IS NULL THEN tc.cliente_id END) as clientes_nuevos,
            COUNT(DISTINCT CASE WHEN va.cliente_id IS NOT NULL THEN tc.cliente_id END) as clientes_recurrentes
        FROM todos_clientes tc
        LEFT JOIN ventas_anteriores va ON tc.cliente_id = va.cliente_id AND tc.tipo_cliente = va.tipo_cliente;
    END IF;
END;
$$;

-- Función para obtener tasa de retención de clientes
CREATE OR REPLACE FUNCTION get_tasa_retencion_clientes(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    clientes_periodo_anterior BIGINT,
    clientes_periodo_actual BIGINT,
    clientes_retornados BIGINT,
    tasa_retencion DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_fecha_inicio_periodo_anterior DATE;
    v_fecha_fin_periodo_anterior DATE;
    v_fecha_inicio_periodo_actual DATE;
    v_fecha_fin_periodo_actual DATE;
BEGIN
    IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
        -- Con fechas específicas
        v_fecha_inicio_periodo_anterior := p_fecha_inicio - INTERVAL '30 days';
        v_fecha_fin_periodo_anterior := p_fecha_inicio - INTERVAL '1 day';
        v_fecha_inicio_periodo_actual := p_fecha_inicio;
        v_fecha_fin_periodo_actual := p_fecha_fin;
    ELSE
        -- Sin fechas específicas, usar los últimos 30 días vs los 30 días anteriores
        v_fecha_inicio_periodo_anterior := CURRENT_DATE - INTERVAL '60 days';
        v_fecha_fin_periodo_anterior := CURRENT_DATE - INTERVAL '30 days';
        v_fecha_inicio_periodo_actual := CURRENT_DATE - INTERVAL '30 days';
        v_fecha_fin_periodo_actual := CURRENT_DATE;
    END IF;

    RETURN QUERY
    WITH clientes_periodo_anterior AS (
        SELECT DISTINCT 
            CASE 
                WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
            END as cliente_id,
            CASE 
                WHEN vt.fk_cliente_natual IS NOT NULL THEN 'natural'
                WHEN vt.fk_cliente_juridico IS NOT NULL THEN 'juridico'
            END as tipo_cliente
        FROM venta_tienda vt
        WHERE vt.fecha BETWEEN v_fecha_inicio_periodo_anterior AND v_fecha_fin_periodo_anterior
    ),
    clientes_periodo_actual AS (
        SELECT DISTINCT 
            CASE 
                WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
            END as cliente_id,
            CASE 
                WHEN vt.fk_cliente_natual IS NOT NULL THEN 'natural'
                WHEN vt.fk_cliente_juridico IS NOT NULL THEN 'juridico'
            END as tipo_cliente
        FROM venta_tienda vt
        WHERE vt.fecha BETWEEN v_fecha_inicio_periodo_actual AND v_fecha_fin_periodo_actual
    )
    SELECT 
        COUNT(DISTINCT cpa.cliente_id) as clientes_periodo_anterior,
        COUNT(DISTINCT cpc.cliente_id) as clientes_periodo_actual,
        COUNT(DISTINCT CASE WHEN cpc.cliente_id IS NOT NULL THEN cpa.cliente_id END) as clientes_retornados,
        CASE 
            WHEN COUNT(DISTINCT cpa.cliente_id) > 0 
            THEN ROUND((COUNT(DISTINCT CASE WHEN cpc.cliente_id IS NOT NULL THEN cpa.cliente_id END)::decimal / COUNT(DISTINCT cpa.cliente_id)::decimal) * 100, 2)
            ELSE 0 
        END as tasa_retencion
    FROM clientes_periodo_anterior cpa
    LEFT JOIN clientes_periodo_actual cpc ON cpa.cliente_id = cpc.cliente_id AND cpa.tipo_cliente = cpc.tipo_cliente;
END;
$$;

-- Función para obtener todos los indicadores de clientes
CREATE OR REPLACE FUNCTION get_indicadores_clientes(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    total_clientes_periodo BIGINT,
    clientes_nuevos BIGINT,
    clientes_recurrentes BIGINT,
    clientes_periodo_anterior BIGINT,
    clientes_periodo_actual BIGINT,
    clientes_retornados BIGINT,
    tasa_retencion DECIMAL(5,2),
    periodo_inicio DATE,
    periodo_fin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cnr.total_clientes_periodo,
        cnr.clientes_nuevos,
        cnr.clientes_recurrentes,
        trc.clientes_periodo_anterior,
        trc.clientes_periodo_actual,
        trc.clientes_retornados,
        trc.tasa_retencion,
        COALESCE(p_fecha_inicio, CURRENT_DATE - INTERVAL '30 days') as periodo_inicio,
        COALESCE(p_fecha_fin, CURRENT_DATE) as periodo_fin
    FROM get_clientes_nuevos_vs_recurrentes(p_fecha_inicio, p_fecha_fin) cnr
    CROSS JOIN get_tasa_retencion_clientes(p_fecha_inicio, p_fecha_fin) trc;
END;
$$;

-- Función para obtener estadísticas detalladas de clientes por tipo
CREATE OR REPLACE FUNCTION get_estadisticas_clientes_detalladas(
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL
)
RETURNS TABLE(
    tipo_cliente VARCHAR(10),
    total_clientes BIGINT,
    clientes_nuevos BIGINT,
    clientes_recurrentes BIGINT,
    porcentaje_nuevos DECIMAL(5,2),
    porcentaje_recurrentes DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
        RETURN QUERY
        WITH clientes_periodo AS (
            SELECT 
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN 'Natural'
                    WHEN cj.cliente_id IS NOT NULL THEN 'Jurídico'
                END as tipo_cliente,
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN cn.cliente_id
                    WHEN cj.cliente_id IS NOT NULL THEN cj.cliente_id
                END as cliente_id,
                u.fecha_creacion
            FROM cliente_natural cn
            FULL OUTER JOIN cliente_juridico cj ON cn.cliente_id = cj.cliente_id
            LEFT JOIN usuario u ON (u.fk_cliente_natural = cn.cliente_id OR u.fk_cliente_juridico = cj.cliente_id)
            WHERE u.fecha_creacion BETWEEN p_fecha_inicio AND p_fecha_fin
        ),
        ventas_anteriores AS (
            SELECT DISTINCT 
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
                END as cliente_id
            FROM venta_tienda vt
            WHERE vt.fecha < p_fecha_inicio
        ),
        estadisticas AS (
            SELECT 
                cp.tipo_cliente,
                COUNT(DISTINCT cp.cliente_id) as total_clientes,
                COUNT(DISTINCT CASE WHEN va.cliente_id IS NULL THEN cp.cliente_id END) as clientes_nuevos,
                COUNT(DISTINCT CASE WHEN va.cliente_id IS NOT NULL THEN cp.cliente_id END) as clientes_recurrentes
            FROM clientes_periodo cp
            LEFT JOIN ventas_anteriores va ON cp.cliente_id = va.cliente_id
            GROUP BY cp.tipo_cliente
        )
        SELECT 
            s.tipo_cliente,
            s.total_clientes,
            s.clientes_nuevos,
            s.clientes_recurrentes,
            CASE 
                WHEN s.total_clientes > 0 
                THEN ROUND((s.clientes_nuevos::decimal / s.total_clientes::decimal) * 100, 2)
                ELSE 0 
            END as porcentaje_nuevos,
            CASE 
                WHEN s.total_clientes > 0 
                THEN ROUND((s.clientes_recurrentes::decimal / s.total_clientes::decimal) * 100, 2)
                ELSE 0 
            END as porcentaje_recurrentes
        FROM estadisticas s;
    ELSE
        -- Sin fechas específicas
        RETURN QUERY
        WITH ventas_anteriores AS (
            SELECT DISTINCT 
                CASE 
                    WHEN vt.fk_cliente_natual IS NOT NULL THEN vt.fk_cliente_natual
                    WHEN vt.fk_cliente_juridico IS NOT NULL THEN vt.fk_cliente_juridico
                END as cliente_id
            FROM venta_tienda vt
        ),
        todos_clientes AS (
            SELECT 
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN 'Natural'
                    WHEN cj.cliente_id IS NOT NULL THEN 'Jurídico'
                END as tipo_cliente,
                CASE 
                    WHEN cn.cliente_id IS NOT NULL THEN cn.cliente_id
                    WHEN cj.cliente_id IS NOT NULL THEN cj.cliente_id
                END as cliente_id
            FROM cliente_natural cn
            FULL OUTER JOIN cliente_juridico cj ON cn.cliente_id = cj.cliente_id
        ),
        estadisticas AS (
            SELECT 
                tc.tipo_cliente,
                COUNT(DISTINCT tc.cliente_id) as total_clientes,
                COUNT(DISTINCT CASE WHEN va.cliente_id IS NULL THEN tc.cliente_id END) as clientes_nuevos,
                COUNT(DISTINCT CASE WHEN va.cliente_id IS NOT NULL THEN tc.cliente_id END) as clientes_recurrentes
            FROM todos_clientes tc
            LEFT JOIN ventas_anteriores va ON tc.cliente_id = va.cliente_id
            GROUP BY tc.tipo_cliente
        )
        SELECT 
            s.tipo_cliente,
            s.total_clientes,
            s.clientes_nuevos,
            s.clientes_recurrentes,
            CASE 
                WHEN s.total_clientes > 0 
                THEN ROUND((s.clientes_nuevos::decimal / s.total_clientes::decimal) * 100, 2)
                ELSE 0 
            END as porcentaje_nuevos,
            CASE 
                WHEN s.total_clientes > 0 
                THEN ROUND((s.clientes_recurrentes::decimal / s.total_clientes::decimal) * 100, 2)
                ELSE 0 
            END as porcentaje_recurrentes
        FROM estadisticas s;
    END IF;
END;
$$;

-- Comentarios sobre las funciones
COMMENT ON FUNCTION get_clientes_nuevos_vs_recurrentes(DATE, DATE) IS 
'Calcula el número de clientes nuevos vs recurrentes en un período específico. 
Un cliente es nuevo si no ha realizado compras antes del período, y recurrente si ya había comprado anteriormente.';

COMMENT ON FUNCTION get_tasa_retencion_clientes(DATE, DATE) IS 
'Calcula la tasa de retención de clientes comparando dos períodos consecutivos de 30 días.
La tasa de retención es el porcentaje de clientes que compraron en el período anterior y también compraron en el período actual.';

COMMENT ON FUNCTION get_indicadores_clientes(DATE, DATE) IS 
'Función principal que combina todos los indicadores de clientes en una sola consulta.
Retorna métricas completas de clientes nuevos vs recurrentes y tasa de retención.';

COMMENT ON FUNCTION get_estadisticas_clientes_detalladas(DATE, DATE) IS 
'Proporciona estadísticas detalladas de clientes separadas por tipo (Natural y Jurídico).
Incluye totales, nuevos, recurrentes y porcentajes para cada tipo de cliente.'; 