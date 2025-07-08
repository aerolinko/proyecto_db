import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// GET - Obtener todas las actividades (premiaciones) de un evento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;

    const result = await sql`
      SELECT 
        p.premiacion_id,
        p.nombre,
        p.fecha,
        p.hora_inicio,
        p.hora_fin,
        p.tipo,
        pe.premiacion_evento_id
      FROM premiacion p
      LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
      WHERE (pe.fk_evento = ${eventoId} OR pe.fk_evento IS NULL)
      AND p.tipo = 'actividad'
      ORDER BY p.fecha DESC, p.hora_inicio
    `;

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching actividades:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva actividad (premiación) para un evento
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const { nombre, fecha, hora_inicio, hora_fin } = await request.json();

    // Validar datos requeridos
    if (!nombre || !fecha || !hora_inicio || !hora_fin) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const eventoResult = await sql`
      SELECT evento_id FROM evento WHERE evento_id = ${eventoId}
    `;

    if (eventoResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Crear la premiación (actividad) usando la función
    const premiacionResult = await sql`
      SELECT crear_actividad(${eventoId}, ${nombre}, ${fecha}, ${hora_inicio}, ${hora_fin})
    `;

    const premiacionId = premiacionResult[0].crear_actividad;

    // Obtener la actividad creada
    const actividadResult = await sql`
      SELECT 
        p.premiacion_id,
        p.nombre,
        p.fecha,
        p.hora_inicio,
        p.hora_fin,
        p.tipo,
        pe.premiacion_evento_id
      FROM premiacion p
      INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
      WHERE p.premiacion_id = ${premiacionId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Actividad creada exitosamente',
      data: actividadResult[0]
    });

  } catch (error) {
    console.error('Error creating actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 