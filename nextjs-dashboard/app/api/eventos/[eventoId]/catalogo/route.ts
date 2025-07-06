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

    console.log(`=== OBTENIENDO CATÁLOGO PARA EVENTO ${eventoIdNum} ===`);

    const result = await sql`SELECT * FROM obtener_catalogo_evento(${eventoIdNum})`;

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error obteniendo catálogo del evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 