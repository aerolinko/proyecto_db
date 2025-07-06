import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const result = await sql`SELECT * FROM TIPO_EVENTO ORDER BY nombre`;

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error obteniendo tipos de evento:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
} 