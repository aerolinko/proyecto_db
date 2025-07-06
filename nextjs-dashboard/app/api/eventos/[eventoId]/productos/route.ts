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

    console.log(`=== OBTENIENDO PRODUCTOS PARA EVENTO ${eventoIdNum} ===`);

    const result = await sql`SELECT * FROM obtener_productos_evento(${eventoIdNum})`;
    
    console.log(`Productos obtenidos: ${result.length} registros`);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error al obtener productos del evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos del evento' },
      { status: 500 }
    );
  }
} 