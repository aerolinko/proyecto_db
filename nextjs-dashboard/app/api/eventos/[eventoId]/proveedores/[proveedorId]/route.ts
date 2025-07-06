import { NextRequest, NextResponse } from 'next/server';
import { removerProveedorEvento } from '@/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventoId: string; proveedorId: string }> }
) {
  try {
    const { eventoId, proveedorId } = await params;
    const eventoMiembroAcaucabId = parseInt(proveedorId);
    
    if (isNaN(eventoMiembroAcaucabId)) {
      return NextResponse.json(
        { success: false, error: 'ID de proveedor inválido' },
        { status: 400 }
      );
    }

    const success = await removerProveedorEvento(eventoMiembroAcaucabId);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Proveedor removido exitosamente' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'No se pudo remover el proveedor' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error al remover proveedor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al remover proveedor' },
      { status: 500 }
    );
  }
} 