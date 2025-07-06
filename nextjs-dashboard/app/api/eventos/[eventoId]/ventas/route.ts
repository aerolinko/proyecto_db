import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

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

    const result = await sql`SELECT * FROM get_ventas_evento(${eventoIdNum})`;

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo ventas del evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 