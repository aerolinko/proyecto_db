import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);
    
    if (isNaN(eventoIdNum)) {
      return NextResponse.json(
        { success: false, error: 'ID de evento inválido' },
        { status: 400 }
      );
    }

    console.log(`=== OBTENIENDO EMPLEADOS PARA EVENTO ${eventoIdNum} ===`);

    const result = await sql`SELECT * FROM obtener_empleados_evento(${eventoIdNum})`;
    
    console.log(`Empleados obtenidos: ${result.length} registros`);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error al obtener empleados del evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener empleados del evento' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string }> }
) {
  try {
    const { eventoId } = await params;
    const eventoIdNum = parseInt(eventoId);
    const body = await request.json();
    const { empleado_id } = body;

    if (!eventoIdNum || isNaN(eventoIdNum)) {
      return NextResponse.json({
        success: false,
        error: 'ID de evento inválido'
      }, { status: 400 });
    }

    if (!empleado_id) {
      return NextResponse.json({
        success: false,
        error: 'ID de empleado requerido'
      }, { status: 400 });
    }

    // Llamar al procedimiento almacenado
    await sql`CALL asignar_empleado_evento(${eventoIdNum}, ${empleado_id})`;

    return NextResponse.json({
      success: true,
      message: 'Empleado asignado exitosamente'
    });

  } catch (error) {
    console.error('Error asignando empleado al evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 