import { NextRequest, NextResponse } from 'next/server';
import { analyzeUserRoles } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    console.log(`=== ANALIZANDO ROLES API ===`);
    console.log(`Usuario ID: ${userId}`);
    
    const analysis = await analyzeUserRoles(parseInt(userId));

    return NextResponse.json({
      success: true,
      userId: parseInt(userId),
      analysis: analysis
    });

  } catch (error) {
    console.error('Error analizando roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 