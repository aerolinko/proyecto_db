import { NextRequest, NextResponse } from 'next/server';
import { cleanClientRoles } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    console.log(`=== LIMPIANDO ROLES DE CLIENTE API ===`);
    console.log(`Usuario ID: ${userId}`);
    
    const deletedRoles = await cleanClientRoles(parseInt(userId));

    return NextResponse.json({
      success: true,
      userId: parseInt(userId),
      deletedRoles: deletedRoles,
      message: `Se eliminaron ${deletedRoles.length} roles del cliente`
    });

  } catch (error) {
    console.error('Error limpiando roles:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 