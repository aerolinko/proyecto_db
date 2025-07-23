import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// GET - Obtener un evento específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);

    if (!eventoIdNum || isNaN(eventoIdNum)) {
      return NextResponse.json({
        success: false,
        error: 'ID de evento inválido'
      }, { status: 400 });
    }

    const result = await sql`
      SELECT 
        e.*,
        te.nombre as tipo_evento_nombre,
        l.nombre as lugar_nombre,
        l.tipo as lugar_tipo
      FROM EVENTO e
      INNER JOIN TIPO_EVENTO te ON e.fk_tipo_evento = te.tipo_evento_id
      INNER JOIN LUGAR l ON e.fk_lugar = l.lugar_id
      WHERE e.evento_id = ${eventoIdNum}
    `;

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Evento no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('Error obteniendo evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PUT - Actualizar un evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);
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

    if (!eventoIdNum || isNaN(eventoIdNum)) {
      return NextResponse.json({
        success: false,
        error: 'ID de evento inválido'
      }, { status: 400 });
    }

    await sql`
      UPDATE EVENTO SET
        nombre = ${nombre},
        capacidad = ${capacidad},
        direccion = ${direccion},
        entrada_paga = ${entrada_paga},
        fecha_inicio = ${fecha_inicio},
        fecha_fin = ${fecha_fin},
        estacionamiento = ${estacionamiento},
        numero_entradas = ${numero_entradas},
        precio_entradas = ${precio_entradas},
        fk_tipo_evento = ${fk_tipo_evento},
        fk_lugar = ${fk_lugar}
      WHERE evento_id = ${eventoIdNum}
    `;

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE - Eliminar un evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);

    if (!eventoIdNum || isNaN(eventoIdNum)) {
      return NextResponse.json({
        success: false,
        error: 'ID de evento inválido'
      }, { status: 400 });
    }

    // Eliminar primero los hijos en evento_empleado
    await sql`DELETE FROM evento_empleado WHERE fk_evento = ${eventoIdNum}`;
    // Eliminar los hijos en evento_miembro_acaucab
    await sql`DELETE FROM evento_miembro_acaucab WHERE fk_evento = ${eventoIdNum}`;
    // Luego eliminar el evento
    await sql`DELETE FROM evento WHERE evento_id = ${eventoIdNum}`;

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// PATCH - Aprobar evento
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);
    const body = await request.json();
    const { userId, accion } = body; // accion: 'aprobar' o 'rechazar'

    if (!eventoIdNum || isNaN(eventoIdNum) || !userId) {
      return NextResponse.json({
        success: false,
        error: 'ID de evento o usuario inválido'
      }, { status: 400 });
    }

    if (accion === 'aprobar') {
      await sql`CALL aprobar_evento(${eventoIdNum}, ${userId})`;
      return NextResponse.json({
        success: true,
        message: 'Evento aprobado exitosamente'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Acción no soportada'
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al aprobar evento'
    }, { status: 500 });
  }
} 