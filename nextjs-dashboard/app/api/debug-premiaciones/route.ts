import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

// GET - Debug para verificar datos en PREMIACION
export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG PREMIACIONES ===');
    
    // 1. Verificar estructura de la tabla
    const estructura = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'premiacion' 
      ORDER BY ordinal_position
    `;
    
    // 2. Verificar total de registros
    const total = await sql`SELECT COUNT(*) as total FROM premiacion`;
    
    // 3. Verificar tipos de premiación
    const tipos = await sql`
      SELECT tipo, COUNT(*) as cantidad
      FROM premiacion 
      GROUP BY tipo
      ORDER BY cantidad DESC
    `;
    
    // 4. Verificar todas las premiaciones
    const todas = await sql`
      SELECT 
        premiacion_id,
        nombre,
        fecha,
        hora_inicio,
        hora_fin,
        tipo
      FROM premiacion 
      ORDER BY fecha DESC, hora_inicio
    `;
    
    // 5. Verificar premiaciones con tipo 'actividad'
    const actividades = await sql`
      SELECT 
        premiacion_id,
        nombre,
        fecha,
        hora_inicio,
        hora_fin,
        tipo
      FROM premiacion 
      WHERE tipo = 'actividad'
      ORDER BY fecha DESC, hora_inicio
    `;
    
    // 6. Verificar relación con eventos
    const conEventos = await sql`
      SELECT 
        p.premiacion_id,
        p.nombre,
        p.tipo,
        e.evento_id,
        e.nombre as evento_nombre
      FROM premiacion p
      LEFT JOIN premiacion_evento pe ON p.premiacion_id = pe.fk_premiacion
      LEFT JOIN evento e ON pe.fk_evento = e.evento_id
      ORDER BY p.fecha DESC
    `;
    
    return NextResponse.json({
      success: true,
      debug: {
        estructura: estructura,
        total_registros: total[0]?.total,
        tipos_premiacion: tipos,
        todas_premiaciones: todas,
        actividades: actividades,
        con_eventos: conEventos
      }
    });

  } catch (error) {
    console.error('Error en debug premiaciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 