import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// GET - Obtener todos los eventos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const tipoEventoId = searchParams.get('tipo_evento_id');
    const limite = searchParams.get('limite') || '100';

    console.log('=== OBTENIENDO EVENTOS ===');

    // Construir la consulta con parámetros opcionales
    const result = await sql`
      SELECT 
        e.evento_id,
        e.nombre,
        e.capacidad,
        e.direccion,
        e.entrada_paga,
        e.fecha_inicio,
        e.fecha_fin,
        e.estacionamiento,
        e.numero_entradas,
        e.precio_entradas,
        te.nombre as tipo_evento_nombre,
        l.nombre as lugar_nombre,
        l.tipo as lugar_tipo,
        COALESCE(ema_count.total_productos, 0) as total_productos_catalogo,
        COALESCE(ee_count.total_empleados, 0) as total_empleados_asignados,
        COALESCE(ve_count.total_ventas, 0) as total_ventas_evento,
        CASE 
          WHEN e.fecha_inicio > CURRENT_DATE THEN 'PENDIENTE'
          WHEN e.fecha_fin < CURRENT_DATE THEN 'FINALIZADO'
          ELSE 'EN CURSO'
        END as estado_evento
      FROM EVENTO e
      INNER JOIN TIPO_EVENTO te ON e.fk_tipo_evento = te.tipo_evento_id
      INNER JOIN LUGAR l ON e.fk_lugar = l.lugar_id
      LEFT JOIN (
        SELECT fk_evento, COUNT(DISTINCT fk_cerveza_presentacion) as total_productos
        FROM EVENTO_MIEMBRO_ACAUCAB
        GROUP BY fk_evento
      ) ema_count ON e.evento_id = ema_count.fk_evento
      LEFT JOIN (
        SELECT fk_evento, COUNT(DISTINCT fk_empleado) as total_empleados
        FROM EVENTO_EMPLEADO
        GROUP BY fk_evento
      ) ee_count ON e.evento_id = ee_count.fk_evento
      LEFT JOIN (
        SELECT fk_evento, COUNT(DISTINCT venta_evento_id) as total_ventas
        FROM VENTA_EVENTO
        GROUP BY fk_evento
      ) ve_count ON e.evento_id = ve_count.fk_evento
      WHERE (${fechaInicio || null}::DATE IS NULL OR e.fecha_inicio >= ${fechaInicio || null}::DATE)
        AND (${fechaFin || null}::DATE IS NULL OR e.fecha_fin <= ${fechaFin || null}::DATE)
        AND (${tipoEventoId ? parseInt(tipoEventoId) : null}::INTEGER IS NULL OR e.fk_tipo_evento = ${tipoEventoId ? parseInt(tipoEventoId) : null}::INTEGER)
      ORDER BY e.fecha_inicio DESC
      LIMIT ${parseInt(limite)}
    `;

    console.log(`Eventos obtenidos: ${result.length} registros`);

    // Si no hay eventos, crear datos de prueba automáticamente
    if (result.length === 0) {
      console.log('No hay eventos, creando datos de prueba automáticamente...');
      
      try {
        // Crear eventos de prueba
        await sql`
          INSERT INTO evento (nombre, capacidad, direccion, entrada_paga, fecha_inicio, fecha_fin, estacionamiento, numero_entradas, precio_entradas, fk_tipo_evento, fk_lugar)
          VALUES 
            ('Festival de Cerveza Artesanal 2024', 500, 'Centro Comercial Plaza Mayor', true, '2024-12-15', '2024-12-17', true, 500, 25000, 1, 1),
            ('Expo Cerveza Caracas', 300, 'Hotel Caracas Palace', true, '2024-11-20', '2024-11-22', false, 300, 30000, 2, 2),
            ('Feria de Cerveza Artesanal Valencia', 400, 'Centro de Eventos Valencia', true, '2024-10-10', '2024-10-12', true, 400, 20000, 3, 3)
          ON CONFLICT DO NOTHING
        `;

        // Obtener los eventos recién creados
        const nuevosEventos = await sql`
          SELECT 
            e.evento_id,
            e.nombre,
            e.capacidad,
            e.direccion,
            e.entrada_paga,
            e.fecha_inicio,
            e.fecha_fin,
            e.estacionamiento,
            e.numero_entradas,
            e.precio_entradas,
            te.nombre as tipo_evento_nombre,
            l.nombre as lugar_nombre,
            l.tipo as lugar_tipo,
            0 as total_productos_catalogo,
            0 as total_empleados_asignados,
            0 as total_ventas_evento,
            CASE 
              WHEN e.fecha_inicio > CURRENT_DATE THEN 'PENDIENTE'
              WHEN e.fecha_fin < CURRENT_DATE THEN 'FINALIZADO'
              ELSE 'EN CURSO'
            END as estado_evento
          FROM EVENTO e
          INNER JOIN TIPO_EVENTO te ON e.fk_tipo_evento = te.tipo_evento_id
          INNER JOIN LUGAR l ON e.fk_lugar = l.lugar_id
          ORDER BY e.fecha_inicio DESC
          LIMIT 3
        `;

        console.log(`Eventos de prueba creados: ${nuevosEventos.length}`);
        return NextResponse.json({
          success: true,
          data: nuevosEventos,
          message: 'Datos de prueba creados automáticamente'
        });
      } catch (error) {
        console.error('Error creando datos de prueba:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST - Crear un nuevo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      capacidad,
      direccion,
      entrada_paga,
      fecha_inicio,
      fecha_fin,
      estacionamiento,
      numero_entradas,
      precio_entradas,
      fk_tipo_evento,
      fk_lugar
    } = body;

    // Llamar al procedimiento almacenado
    await sql`CALL crear_evento(
      ${nombre}, ${capacidad}, ${direccion}, ${entrada_paga}, 
      ${fecha_inicio}, ${fecha_fin}, ${estacionamiento}, 
      ${numero_entradas}, ${precio_entradas}, ${fk_tipo_evento}, ${fk_lugar}
    )`;

    return NextResponse.json({
      success: true,
      message: 'Evento creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 