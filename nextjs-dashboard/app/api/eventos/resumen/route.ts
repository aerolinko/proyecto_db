import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`SELECT * FROM get_resumen_eventos()`;

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    });

  } catch (error) {
    console.error('Error obteniendo resumen de eventos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 