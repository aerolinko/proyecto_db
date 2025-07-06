import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// GET - Obtener proveedores de un evento
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

    console.log(`=== OBTENIENDO PROVEEDORES PARA EVENTO ${eventoIdNum} ===`);

    const result = await sql`SELECT * FROM obtener_proveedores_evento(${eventoIdNum})`;
    
    console.log(`Proveedores obtenidos: ${result.length} registros`);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error al obtener proveedores del evento:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener proveedores del evento' },
      { status: 500 }
    );
  }
}

// POST - Agregar proveedor a evento
export async function POST(
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

    const body = await request.json();
    
    const {
      miembro_id,
      cerveza_presentacion_id,
      cantidad
    } = body;

    // Validaciones básicas
    if (!miembro_id || !cerveza_presentacion_id || !cantidad) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const registroId = await agregarProveedorEvento(
      eventoIdNum,
      miembro_id,
      cerveza_presentacion_id,
      cantidad
    );

    return NextResponse.json({ 
      success: true, 
      data: { evento_miembro_acaucab_id: registroId },
      message: 'Proveedor agregado exitosamente' 
    });
  } catch (error) {
    console.error('Error al agregar proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al agregar proveedor' },
      { status: 500 }
    );
  }
} 