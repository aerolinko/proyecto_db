import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: '1602',
})

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 Iniciando recreación de funciones de base de datos...')

        // Seleccionar el esquema correcto antes de crear funciones
        await sql.unsafe('SET search_path TO schema_name;')

        // Eliminar funciones existentes
        const dropQueries = [
            'DROP FUNCTION IF EXISTS get_report_productos_mayor_demanda(DATE, DATE)',
            'DROP FUNCTION IF EXISTS get_report_reposicion_anaqueles(DATE, DATE)',
            'DROP FUNCTION IF EXISTS get_reposicion_anaqueles(DATE, DATE, INTEGER)',
            'DROP FUNCTION IF EXISTS get_report_cuotas_afiliacion_pendientes()',
            'DROP FUNCTION IF EXISTS get_report_nomina_departamento(DATE, DATE)',
            'DROP FUNCTION IF EXISTS get_report_historial_compras_cliente_juridico(INTEGER, DATE, DATE)',
            'DROP FUNCTION IF EXISTS get_stock_cervezas()',
            'DROP FUNCTION IF EXISTS get_stock_almacen()',
            'DROP FUNCTION IF EXISTS get_stock_anaquel()',
            'DROP FUNCTION IF EXISTS get_cervezas_stock_bajo(INTEGER)',
            'DROP FUNCTION IF EXISTS get_cervezas_sin_stock()',
            'DROP FUNCTION IF EXISTS get_stock_cerveza_especifica(VARCHAR)'
        ]

        for (const dropQuery of dropQueries) {
            await sql.unsafe(dropQuery)
            console.log(`✅ Eliminada función: ${dropQuery}`)
        }

        // Crear funciones corregidas
        const createQueries = [
            // 1. Función para Productos con Mayor Demanda en Tienda Online
            `CREATE OR REPLACE FUNCTION get_report_productos_mayor_demanda(
              p_fecha_inicio DATE DEFAULT NULL,
              p_fecha_fin DATE DEFAULT NULL
            )
            RETURNS TABLE (
              producto_id INTEGER,
              producto_nombre VARCHAR,
              precio_promedio NUMERIC,
              stock_actual BIGINT,
              total_ventas BIGINT,
              unidades_vendidas BIGINT,
              ingresos_totales BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
                RETURN QUERY
                SELECT 
                  c.cerveza_id as producto_id,
                  c.nombre as producto_nombre,
                  ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
                  COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
                  COUNT(DISTINCT vo.venta_online_id) as total_ventas,
                  SUM(dvo.cantidad) as unidades_vendidas,
                  SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
                FROM cerveza c
                JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
                LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
                LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
                JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
                JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
                WHERE vo.fecha_emision BETWEEN p_fecha_inicio AND p_fecha_fin
                GROUP BY c.cerveza_id, c.nombre
                ORDER BY unidades_vendidas DESC, ingresos_totales DESC
                LIMIT 50;
              ELSE
                RETURN QUERY
                SELECT 
                  c.cerveza_id as producto_id,
                  c.nombre as producto_nombre,
                  ROUND(AVG(dvo.precio_unitario), 2) as precio_promedio,
                  COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_actual,
                  COUNT(DISTINCT vo.venta_online_id) as total_ventas,
                  SUM(dvo.cantidad) as unidades_vendidas,
                  SUM(dvo.cantidad * dvo.precio_unitario) as ingresos_totales
                FROM cerveza c
                JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
                LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
                LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
                JOIN detalle_venta_online dvo ON almc.almacen_cerveza_id = dvo.fk_almacen_cerveza
                JOIN venta_online vo ON dvo.fk_venta_online = vo.venta_online_id
                GROUP BY c.cerveza_id, c.nombre
                ORDER BY unidades_vendidas DESC, ingresos_totales DESC
                LIMIT 50;
              END IF;
            END;
            $$;`,

            // 2. Función para Stock Total de Cervezas
            `CREATE OR REPLACE FUNCTION get_stock_cervezas()
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              stock_total BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
              LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
              GROUP BY c.cerveza_id, c.nombre, p.nombre
              ORDER BY c.nombre, p.nombre;
            END;
            $$;`,

            // 3. Función para Stock por Almacén
            `CREATE OR REPLACE FUNCTION get_stock_almacen()
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              nombre_almacen VARCHAR,
              cantidad_disponible INTEGER,
              fecha_ultima_actualizacion TIMESTAMP
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                a.nombre as nombre_almacen,
                almc.cantidad as cantidad_disponible,
                almc.fecha as fecha_ultima_actualizacion
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
              LEFT JOIN almacen a ON almc.fk_almacen = a.almacen_id
              WHERE almc.cantidad > 0
              ORDER BY c.nombre, p.nombre, a.nombre;
            END;
            $$;`,

            // 4. Función para Stock por Anaquel
            `CREATE OR REPLACE FUNCTION get_stock_anaquel()
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              nombre_anaquel VARCHAR,
              cantidad_disponible INTEGER,
              precio_venta NUMERIC,
              fecha_ultima_actualizacion TIMESTAMP
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                an.nombre as nombre_anaquel,
                ac.cantidad as cantidad_disponible,
                ac.precio_unitario as precio_venta,
                ac.fecha as fecha_ultima_actualizacion
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
              LEFT JOIN anaquel an ON ac.fk_anaquel = an.anaquel_id
              WHERE ac.cantidad > 0
              ORDER BY c.nombre, p.nombre, an.nombre;
            END;
            $$;`,

            // 5. Función para Cervezas con Stock Bajo
            `CREATE OR REPLACE FUNCTION get_cervezas_stock_bajo(p_limite INTEGER DEFAULT 10)
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              stock_total BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
              LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
              GROUP BY c.cerveza_id, c.nombre, p.nombre
              HAVING COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) <= p_limite
              ORDER BY stock_total ASC, c.nombre;
            END;
            $$;`,

            // 6. Función para Cervezas Sin Stock
            `CREATE OR REPLACE FUNCTION get_cervezas_sin_stock()
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              stock_total BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
              LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
              GROUP BY c.cerveza_id, c.nombre, p.nombre
              HAVING COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) = 0
              ORDER BY c.nombre, p.nombre;
            END;
            $$;`,

            // 7. Función para Stock de Cerveza Específica
            `CREATE OR REPLACE FUNCTION get_stock_cerveza_especifica(p_nombre_cerveza VARCHAR)
            RETURNS TABLE (
              cerveza_id INTEGER,
              nombre_cerveza VARCHAR,
              presentacion VARCHAR,
              stock_anaqueles BIGINT,
              stock_almacen BIGINT,
              stock_total BIGINT
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              RETURN QUERY
              SELECT 
                c.cerveza_id,
                c.nombre as nombre_cerveza,
                p.nombre as presentacion,
                COALESCE(SUM(ac.cantidad), 0) as stock_anaqueles,
                COALESCE(SUM(almc.cantidad), 0) as stock_almacen,
                COALESCE(SUM(ac.cantidad), 0) + COALESCE(SUM(almc.cantidad), 0) as stock_total
              FROM cerveza c
              LEFT JOIN cerveza_presentacion cp ON c.cerveza_id = cp.fk_cerveza
              LEFT JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
              LEFT JOIN anaquel_cerveza ac ON cp.cerveza_presentacion_id = ac.fk_cerveza_presentacion
              LEFT JOIN almacen_cerveza almc ON cp.cerveza_presentacion_id = almc.fk_cerveza_presentacion
              WHERE LOWER(c.nombre) LIKE LOWER('%' || p_nombre_cerveza || '%')
              GROUP BY c.cerveza_id, c.nombre, p.nombre
              ORDER BY c.nombre, p.nombre;
            END;
            $$;`,

            // 8. Función para Reposición de Anaqueles Generadas
            `CREATE OR REPLACE FUNCTION get_reposicion_anaqueles(
              p_fecha_inicio DATE DEFAULT NULL,
              p_fecha_fin DATE DEFAULT NULL,
              p_limite INTEGER DEFAULT 100
            )
            RETURNS TABLE (
              reposicion_anaquel_id INTEGER,
              fecha DATE,
              producto_nombre VARCHAR,
              presentacion TEXT,
              cantidad INTEGER,
              pasillo VARCHAR,
              anaquel TEXT,
              estado VARCHAR
            )
            LANGUAGE plpgsql
            AS $$
            BEGIN
              IF p_fecha_inicio IS NOT NULL AND p_fecha_fin IS NOT NULL THEN
                RETURN QUERY
                SELECT
                  ra.reposicion_anaquel_id,
                  ra.fecha,
                  c.nombre AS producto_nombre,
                  pr.material || ' ' || pr.cap_volumen || 'ml' AS presentacion,
                  dra.cantidad,
                  pas.nombre AS pasillo,
                  anq.anaquel_id::text AS anaquel,
                  e.nombre AS estado
                FROM reposicion_anaquel ra
                JOIN detalle_reposicion_anaquel dra ON dra.fk_reposicion_anaquel = ra.reposicion_anaquel_id
                JOIN anaquel_cerveza ac ON dra.fk_anaquel_cerveza = ac.anaquel_cerveza_id
                JOIN anaquel anq ON ac.fk_anaquel = anq.anaquel_id
                JOIN pasillo pas ON anq.fk_pasillo = pas.pasillo_id
                JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
                JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
                JOIN presentacion pr ON cp.fk_presentacion = pr.presentacion_id
                JOIN estado_reposicion_anaquel era ON era.fk_reposicion_anaquel = ra.reposicion_anaquel_id AND era.fecha_fin IS NULL
                JOIN estado e ON era.fk_estado = e.estado_id
                WHERE ra.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
                  AND dra.cantidad <= 20
                ORDER BY ra.fecha DESC
                LIMIT p_limite;
              ELSE
                RETURN QUERY
                SELECT
                  ra.reposicion_anaquel_id,
                  ra.fecha,
                  c.nombre AS producto_nombre,
                  pr.material || ' ' || pr.cap_volumen || 'ml' AS presentacion,
                  dra.cantidad,
                  pas.nombre AS pasillo,
                  anq.anaquel_id::text AS anaquel,
                  e.nombre AS estado
                FROM reposicion_anaquel ra
                JOIN detalle_reposicion_anaquel dra ON dra.fk_reposicion_anaquel = ra.reposicion_anaquel_id
                JOIN anaquel_cerveza ac ON dra.fk_anaquel_cerveza = ac.anaquel_cerveza_id
                JOIN anaquel anq ON ac.fk_anaquel = anq.anaquel_id
                JOIN pasillo pas ON anq.fk_pasillo = pas.pasillo_id
                JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
                JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
                JOIN presentacion pr ON cp.fk_presentacion = pr.presentacion_id
                JOIN estado_reposicion_anaquel era ON era.fk_reposicion_anaquel = ra.reposicion_anaquel_id AND era.fecha_fin IS NULL
                JOIN estado e ON era.fk_estado = e.estado_id
                WHERE dra.cantidad <= 20
                ORDER BY ra.fecha DESC
                LIMIT p_limite;
              END IF;
            END;
            $$;`
        ]

        for (const createQuery of createQueries) {
            await sql.unsafe(createQuery)
            console.log(`✅ Función creada exitosamente`)
        }

        console.log('🎉 Todas las funciones han sido recreadas correctamente')

        return NextResponse.json({
            success: true,
            message: 'Funciones recreadas exitosamente',
            functionsCreated: createQueries.length
        })
    } catch (error) {
        console.error('❌ Error recreando funciones:', error)
        return NextResponse.json({
            success: false,
            message: 'Error recreando funciones',
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 })
    }
}