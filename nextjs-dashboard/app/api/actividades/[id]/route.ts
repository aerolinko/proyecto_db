import { NextRequest, NextResponse } from 'next/server';
import { updateActividad, deleteActividad } from '@/db';

// PUT - Actualizar una actividad
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nombre, fecha, hora_inicio, hora_fin } = await request.json();

    // Validar datos requeridos
    if (!nombre || !fecha || !hora_inicio || !hora_fin) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const result = await updateActividad(
      parseInt(id),
      nombre,
      fecha,
      hora_inicio,
      hora_fin
    );

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Actividad actualizada exitosamente'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error updating actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una actividad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await deleteActividad(parseInt(id));

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Actividad eliminada exitosamente'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error deleting actividad:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 