import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG EVENTOS ===');
    
    // Verificar conexión
    let conexion = false;
    try {
      await sql`SELECT 1`;
      conexion = true;
    } catch (error) {
      console.error('Error de conexión:', error);
    }

    // Verificar tablas
    const tablas = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('evento', 'evento_miembro_acaucab', 'evento_empleado', 'venta_evento', 'cerveza', 'cerveza_presentacion', 'miembro_acaucab', 'empleado')
      ORDER BY table_name
    `;

    // Contar registros
    const conteos = await sql`
      SELECT 
        'EVENTOS' as tabla,
        COUNT(*) as total
      FROM evento
      UNION ALL
      SELECT 
        'EVENTO_MIEMBRO_ACAUCAB' as tabla,
        COUNT(*) as total
      FROM evento_miembro_acaucab
      UNION ALL
      SELECT 
        'EVENTO_EMPLEADO' as tabla,
        COUNT(*) as total
      FROM evento_empleado
      UNION ALL
      SELECT 
        'CERVEZA' as tabla,
        COUNT(*) as total
      FROM cerveza
      UNION ALL
      SELECT 
        'CERVEZA_PRESENTACION' as tabla,
        COUNT(*) as total
      FROM cerveza_presentacion
      UNION ALL
      SELECT 
        'MIEMBRO_ACAUCAB' as tabla,
        COUNT(*) as total
      FROM miembro_acaucab
      UNION ALL
      SELECT 
        'EMPLEADO' as tabla,
        COUNT(*) as total
      FROM empleado
    `;

    // Verificar datos de ejemplo
    const eventos_ejemplo = await sql`
      SELECT evento_id, nombre, fecha_inicio, fecha_fin
      FROM evento
      LIMIT 5
    `;

    const catalogo_ejemplo = await sql`
      SELECT 
        ema.evento_miembro_acaucab_id,
        e.nombre as evento_nombre,
        c.nombre as cerveza_nombre,
        ma.razon_social as proveedor
      FROM evento_miembro_acaucab ema
      INNER JOIN evento e ON ema.fk_evento = e.evento_id
      INNER JOIN cerveza_presentacion cp ON ema.fk_cerveza_presentacion = cp.cerveza_presentacion_id
      INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
      INNER JOIN miembro_acaucab ma ON ema.fk_miembro_acaucab = ma.miembro_id
      LIMIT 5
    `;

    // Diagnóstico
    const diagnostico = [];
    
    if (conexion) {
      diagnostico.push('✅ Conexión a base de datos: OK');
    } else {
      diagnostico.push('❌ Conexión a base de datos: ERROR');
    }

    if (tablas.length >= 7) {
      diagnostico.push('✅ Tablas principales: Encontradas');
    } else {
      diagnostico.push(`⚠️ Tablas principales: Solo ${tablas.length}/7 encontradas`);
    }

    const eventoCount = conteos.find((c: any) => c.tabla === 'EVENTOS')?.total || 0;
    const catalogoCount = conteos.find((c: any) => c.tabla === 'EVENTO_MIEMBRO_ACAUCAB')?.total || 0;

    if (eventoCount > 0) {
      diagnostico.push(`✅ Eventos: ${eventoCount} registros`);
    } else {
      diagnostico.push('❌ Eventos: No hay registros');
    }

    if (catalogoCount > 0) {
      diagnostico.push(`✅ Catálogo: ${catalogoCount} productos`);
    } else {
      diagnostico.push('❌ Catálogo: No hay productos asignados');
    }

    return NextResponse.json({
      success: true,
      data: {
        conexion,
        tablas_encontradas: tablas.map((t: any) => t.table_name),
        total_eventos: eventoCount,
        total_evento_miembro_acaucab: catalogoCount,
        eventos_ejemplo,
        catalogo_ejemplo,
        diagnostico
      }
    });

  } catch (error) {
    console.error('Error en debug:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en debug',
      details: error
    }, { status: 500 });
  }
} 