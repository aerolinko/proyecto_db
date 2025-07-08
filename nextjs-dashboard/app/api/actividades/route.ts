import { NextRequest, NextResponse } from 'next/server';
import { getAllActividades, createActividad } from '@/db';
import { sql } from '@/db';

// GET - Obtener todas las actividades
export async function GET(request: NextRequest) {
  try {
    console.log('=== OBTENIENDO ACTIVIDADES DESDE PREMIACION ===');
    
    // SELECT directo a la tabla PREMIACION
    const result = await sql`
      SELECT 
        p.premiacion_id,
        p.nombre,
        p.fecha,
        p.hora_inicio,
        p.hora_fin,
        p.tipo,
        e.evento_id,
        e.nombre as evento_nombre,
        l.nombre as lugar_nombre
      FROM premiacion p
      LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
      LEFT JOIN evento e ON pe.fk_evento = e.evento_id
      LEFT JOIN lugar l ON e.fk_lugar = l.lugar_id
      WHERE p.tipo = 'actividad'
      ORDER BY p.fecha DESC, p.hora_inicio
    `;
    
    console.log(`Actividades encontradas: ${result.length}`);
    console.log('Primera actividad:', result[0]);
    
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

// POST - Crear una nueva actividad
export async function POST(request: NextRequest) {
  try {
    const { nombre, fecha, hora_inicio, hora_fin, evento_id } = await request.json();

    // Validar datos requeridos
    if (!nombre || !fecha || !hora_inicio || !hora_fin || !evento_id) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const eventoResult = await sql`
      SELECT evento_id FROM evento WHERE evento_id = ${evento_id}
    `;

    if (eventoResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    // Crear la premiación (actividad) usando la función
    const premiacionResult = await sql`
      SELECT crear_actividad(${evento_id}, ${nombre}, ${fecha}, ${hora_inicio}, ${hora_fin})
    `;

    const premiacionId = premiacionResult[0].crear_actividad;

    // Obtener la actividad creada con información del evento
    const actividadResult = await sql`
      SELECT 
        p.premiacion_id,
        p.nombre,
        p.fecha,
        p.hora_inicio,
        p.hora_fin,
        p.tipo,
        e.evento_id,
        e.nombre as evento_nombre,
        l.nombre as lugar_nombre
      FROM premiacion p
      INNER JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
      INNER JOIN evento e ON pe.fk_evento = e.evento_id
      INNER JOIN lugar l ON e.fk_lugar = l.lugar_id
      WHERE p.premiacion_id = ${premiacionId}
    `;

    return NextResponse.json({
      success: true,
      data: actividadResult[0],
      message: 'Actividad creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 