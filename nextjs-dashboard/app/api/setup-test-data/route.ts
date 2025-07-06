import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CONFIGURANDO DATOS DE PRUEBA ===');

    // 1. Verificar si ya existen datos
    const existingEventos = await sql`SELECT COUNT(*) as count FROM evento`;
    const existingCatalogo = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab`;

    if (existingEventos[0]?.count > 0 && existingCatalogo[0]?.count > 0) {
      return NextResponse.json({
        success: true,
        message: 'Ya existen datos de prueba',
        data: {
          eventos: existingEventos[0].count,
          catalogo: existingCatalogo[0].count
        }
      });
    }

    // 2. Insertar eventos de prueba
    const eventosInsertados = await sql`
      INSERT INTO evento (nombre, capacidad, direccion, entrada_paga, fecha_inicio, fecha_fin, estacionamiento, numero_entradas, precio_entradas, fk_tipo_evento, fk_lugar)
      VALUES 
        ('Festival de Cerveza Artesanal 2024', 500, 'Centro Comercial Plaza Mayor', true, '2024-12-15', '2024-12-17', true, 500, 25000, 1, 1),
        ('Expo Cerveza Caracas', 300, 'Hotel Caracas Palace', true, '2024-11-20', '2024-11-22', false, 300, 30000, 2, 2),
        ('Feria de Cerveza Artesanal Valencia', 400, 'Centro de Eventos Valencia', true, '2024-10-10', '2024-10-12', true, 400, 20000, 3, 3)
      ON CONFLICT DO NOTHING
      RETURNING evento_id
    `;

    console.log(`Eventos insertados: ${eventosInsertados.length}`);

    // 3. Obtener IDs de eventos insertados
    const eventos = await sql`SELECT evento_id FROM evento ORDER BY evento_id DESC LIMIT 3`;
    
    // 4. Obtener cervezas y presentaciones disponibles
    const cervezasPresentaciones = await sql`
      SELECT cp.cerveza_presentacion_id, c.nombre as cerveza_nombre, p.material, p.cap_volumen
      FROM cerveza_presentacion cp
      INNER JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
      INNER JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
      LIMIT 10
    `;

    // 5. Obtener miembros ACAUCAB disponibles
    const miembros = await sql`SELECT miembro_id FROM miembro_acaucab LIMIT 5`;

    if (eventos.length === 0 || cervezasPresentaciones.length === 0 || miembros.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No hay datos base suficientes (eventos, cervezas o miembros)'
      });
    }

    // 6. Insertar catálogo de cervezas para cada evento
    let totalCatalogo = 0;
    for (const evento of eventos) {
      for (let i = 0; i < Math.min(3, cervezasPresentaciones.length); i++) {
        const cerveza = cervezasPresentaciones[i];
        const miembro = miembros[i % miembros.length];
        
        try {
          await sql`
            INSERT INTO evento_miembro_acaucab (fk_evento, fk_miembro_acaucab, fk_cerveza_presentacion, cantidad)
            VALUES (${evento.evento_id}, ${miembro.miembro_id}, ${cerveza.cerveza_presentacion_id}, ${Math.floor(Math.random() * 100) + 50})
            ON CONFLICT DO NOTHING
          `;
          totalCatalogo++;
        } catch (error) {
          console.error('Error insertando catálogo:', error);
        }
      }
    }

    // 7. Insertar empleados de prueba si no existen
    const empleadosExistentes = await sql`SELECT COUNT(*) as count FROM empleado`;
    if (empleadosExistentes[0]?.count === 0) {
      await sql`
        INSERT INTO empleado (primer_nombre, primer_apellido, cedula, direccion, fecha_contrato, fk_lugar)
        VALUES 
          ('Juan', 'Pérez', 12345678, 'Caracas, Venezuela', '2020-01-15', 1),
          ('María', 'González', 87654321, 'Valencia, Venezuela', '2019-03-20', 2),
          ('Carlos', 'Rodríguez', 11223344, 'Maracay, Venezuela', '2021-06-10', 3)
        ON CONFLICT DO NOTHING
      `;
    }

    // 8. Asignar empleados a eventos
    const empleados = await sql`SELECT empleado_id FROM empleado LIMIT 3`;
    for (const evento of eventos) {
      for (let i = 0; i < Math.min(2, empleados.length); i++) {
        try {
          await sql`
            INSERT INTO evento_empleado (fk_evento, fk_empleado)
            VALUES (${evento.evento_id}, ${empleados[i].empleado_id})
            ON CONFLICT DO NOTHING
          `;
        } catch (error) {
          console.error('Error asignando empleado:', error);
        }
      }
    }

    // 9. Verificar resultados finales
    const finalEventos = await sql`SELECT COUNT(*) as count FROM evento`;
    const finalCatalogo = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab`;
    const finalEmpleados = await sql`SELECT COUNT(*) as count FROM evento_empleado`;

    console.log('=== DATOS DE PRUEBA CONFIGURADOS ===');
    console.log(`Eventos: ${finalEventos[0]?.count}`);
    console.log(`Catálogo: ${finalCatalogo[0]?.count}`);
    console.log(`Empleados asignados: ${finalEmpleados[0]?.count}`);

    return NextResponse.json({
      success: true,
      message: 'Datos de prueba configurados exitosamente',
      data: {
        eventos: finalEventos[0]?.count || 0,
        catalogo: finalCatalogo[0]?.count || 0,
        empleados_asignados: finalEmpleados[0]?.count || 0,
        eventos_creados: eventosInsertados.length
      }
    });

  } catch (error) {
    console.error('Error configurando datos de prueba:', error);
    return NextResponse.json({
      success: false,
      error: 'Error configurando datos de prueba',
      details: error
    }, { status: 500 });
  }
} 