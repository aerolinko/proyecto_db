import { NextRequest, NextResponse } from 'next/server';
import { getCervezasPorProveedor } from '@/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ miembroId: string }> }
) {
  try {
    const { miembroId } = await params;
    const miembroIdNum = parseInt(miembroId);
    
    if (isNaN(miembroIdNum)) {
      return NextResponse.json(
        { success: false, error: 'ID de miembro inválido' },
        { status: 400 }
      );
    }

    const cervezas = await getCervezasPorProveedor(miembroIdNum);
    
    return NextResponse.json({ success: true, data: cervezas });
  } catch (error) {
    console.error('Error al obtener cervezas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener cervezas' },
      { status: 500 }
    );
  }
} 