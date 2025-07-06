import { NextResponse } from 'next/server';
import { getMiembrosAcaucab } from '@/db';

export async function GET() {
  try {
    const miembros = await getMiembrosAcaucab();
    return NextResponse.json({ success: true, data: miembros });
  } catch (error) {
    console.error('Error al obtener miembros ACAUCAB:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener miembros ACAUCAB' },
      { status: 500 }
    );
  }
} 