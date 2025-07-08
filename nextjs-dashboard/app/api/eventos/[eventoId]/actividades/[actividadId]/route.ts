import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// DELETE - Eliminar una actividad específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string; actividadId: string }> }
) {
  try {
    const { eventoId, actividadId } = await params;

    // Verificar que la actividad pertenece al evento
    const actividadResult = await sql`
      SELECT pe.premiacion_evento_id, p.premiacion_id
      FROM premiacion_evento pe
      INNER JOIN premiacion p ON pe.fk_premiacion = p.premiacion_id
      WHERE pe.fk_evento = ${eventoId}
      AND p.premiacion_id = ${actividadId}
      AND p.tipo = 'actividad'
    `;

    if (actividadResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada o no pertenece al evento' },
        { status: 404 }
      );
    }

    const { premiacion_evento_id, premiacion_id } = actividadResult[0];

    // Eliminar primero las referencias en la tabla juez
    await sql`
      DELETE FROM juez 
      WHERE fk_premiacion_evento = ${premiacion_evento_id}
    `;

    // Eliminar las referencias en la tabla premio
    await sql`
      DELETE FROM premio 
      WHERE fk_premiacion_evento_miembro IN (
        SELECT premiacion_evento_miembro_id 
        FROM premiacion_evento_miembro 
        WHERE fk_premiacion_evento = ${premiacion_evento_id}
      )
    `;

    // Eliminar las referencias en la tabla premiacion_evento_miembro
    await sql`
      DELETE FROM premiacion_evento_miembro 
      WHERE fk_premiacion_evento = ${premiacion_evento_id}
    `;

    // Eliminar la relación premiacion_evento
    await sql`
      DELETE FROM premiacion_evento 
      WHERE premiacion_evento_id = ${premiacion_evento_id}
    `;

    // Eliminar la premiación (actividad)
    await sql`
      DELETE FROM premiacion 
      WHERE premiacion_id = ${premiacion_id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error deleting actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 