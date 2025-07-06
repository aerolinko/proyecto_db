import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function POST(request: NextRequest) {
  try {
    console.log("=== CONFIGURANDO DATOS DE PRUEBA PARA EVENTOS ===");
    
    // Verificar si ya hay datos
    const eventosCount = await sql`SELECT COUNT(*) as count FROM evento`;
    const emaCount = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab`;
    
    console.log(`Eventos existentes: ${eventosCount[0]?.count}`);
    console.log(`EVENTO_MIEMBRO_ACAUCAB existentes: ${emaCount[0]?.count}`);
    
    let acciones = [];
    
    // Si no hay eventos, crear uno de prueba
    if (eventosCount[0]?.count === 0) {
      try {
        // Primero verificar si hay tipos de evento y lugares
        const tiposEvento = await sql`SELECT COUNT(*) as count FROM tipo_evento`;
        const lugares = await sql`SELECT COUNT(*) as count FROM lugar`;
        
        if (tiposEvento[0]?.count === 0) {
          await sql`INSERT INTO tipo_evento (nombre, descripcion) VALUES ('Festival', 'Festival de cerveza artesanal')`;
          acciones.push("✅ Creado tipo de evento 'Festival'");
        }
        
        if (lugares[0]?.count === 0) {
          await sql`INSERT INTO lugar (nombre, direccion, capacidad) VALUES ('Centro de Eventos', 'Av. Principal 123', 1000)`;
          acciones.push("✅ Creado lugar 'Centro de Eventos'");
        }
        
        // Obtener IDs
        const tipoEvento = await sql`SELECT tipo_evento_id FROM tipo_evento LIMIT 1`;
        const lugar = await sql`SELECT lugar_id FROM lugar LIMIT 1`;
        
        if (tipoEvento.length > 0 && lugar.length > 0) {
          await sql`
            INSERT INTO evento (
              nombre, capacidad, direccion, entrada_paga, 
              fecha_inicio, fecha_fin, estacionamiento, 
              numero_entradas, precio_entradas, fk_tipo_evento, fk_lugar
            ) VALUES (
              'Festival de Cerveza 2024', 500, 'Av. Principal 123', true,
              '2024-12-15', '2024-12-17', true, 500, 25.00,
              ${tipoEvento[0].tipo_evento_id}, ${lugar[0].lugar_id}
            )
          `;
          acciones.push("✅ Creado evento 'Festival de Cerveza 2024'");
        }
      } catch (error) {
        console.error("Error creando evento:", error);
        acciones.push("❌ Error creando evento");
      }
    } else {
      acciones.push("ℹ️ Ya existen eventos");
    }
    
    // Si no hay EVENTO_MIEMBRO_ACAUCAB, crear algunos de prueba
    if (emaCount[0]?.count === 0) {
      try {
        // Verificar si hay miembros ACAUCAB
        const miembrosCount = await sql`SELECT COUNT(*) as count FROM miembro_acaucab`;
        
        if (miembrosCount[0]?.count === 0) {
          await sql`
            INSERT INTO miembro_acaucab (
              denominacion_comercial, razon_social, direccion, pagina_web
            ) VALUES (
              'Cervecería Artesanal ABC', 'ABC Cervezas S.A.', 'Calle 1 #123', 'www.abccervezas.com'
            )
          `;
          acciones.push("✅ Creado miembro ACAUCAB 'Cervecería Artesanal ABC'");
        }
        
        // Verificar si hay cervezas
        const cervezasCount = await sql`SELECT COUNT(*) as count FROM cerveza`;
        
        if (cervezasCount[0]?.count === 0) {
          // Crear tipos de cerveza si no existen
          const tiposCervezaCount = await sql`SELECT COUNT(*) as count FROM tipo_cerveza`;
          if (tiposCervezaCount[0]?.count === 0) {
            await sql`INSERT INTO tipo_cerveza (nombre) VALUES ('Ale')`;
            await sql`INSERT INTO tipo_cerveza (nombre) VALUES ('Lager')`;
            acciones.push("✅ Creados tipos de cerveza");
          }
          
          // Crear estilos de cerveza si no existen
          const estilosCervezaCount = await sql`SELECT COUNT(*) as count FROM estilo_cerveza`;
          if (estilosCervezaCount[0]?.count === 0) {
            await sql`INSERT INTO estilo_cerveza (nombre) VALUES ('IPA')`;
            await sql`INSERT INTO estilo_cerveza (nombre) VALUES ('Porter')`;
            await sql`INSERT INTO estilo_cerveza (nombre) VALUES ('Stout')`;
            acciones.push("✅ Creados estilos de cerveza");
          }
          
          // Obtener IDs
          const tipoCerveza = await sql`SELECT tipo_cerveza_id FROM tipo_cerveza LIMIT 1`;
          const estiloCerveza = await sql`SELECT estilo_cerveza_id FROM estilo_cerveza LIMIT 1`;
          
          if (tipoCerveza.length > 0 && estiloCerveza.length > 0) {
            await sql`
              INSERT INTO cerveza (
                nombre, densidad_inicial, densidad_final, ibus, nivel_alcohol, 
                fk_tipo_cerveza, fk_estilo_cerveza
              ) VALUES (
                'IPA Artesanal', 1.050, 1.012, 60, 5.2,
                ${tipoCerveza[0].tipo_cerveza_id}, ${estiloCerveza[0].estilo_cerveza_id}
              )
            `;
            acciones.push("✅ Creada cerveza 'IPA Artesanal'");
          }
        }
        
        // Verificar si hay presentaciones
        const presentacionesCount = await sql`SELECT COUNT(*) as count FROM presentacion`;
        
        if (presentacionesCount[0]?.count === 0) {
          await sql`INSERT INTO presentacion (material, cap_volumen) VALUES ('Botella', 330)`;
          await sql`INSERT INTO presentacion (material, cap_volumen) VALUES ('Lata', 355)`;
          acciones.push("✅ Creadas presentaciones");
        }
        
        // Crear CERVEZA_PRESENTACION
        const cpCount = await sql`SELECT COUNT(*) as count FROM cerveza_presentacion`;
        
        if (cpCount[0]?.count === 0) {
          const cerveza = await sql`SELECT cerveza_id FROM cerveza LIMIT 1`;
          const miembro = await sql`SELECT miembro_id FROM miembro_acaucab LIMIT 1`;
          const presentacion = await sql`SELECT presentacion_id FROM presentacion LIMIT 1`;
          
          if (cerveza.length > 0 && miembro.length > 0 && presentacion.length > 0) {
            await sql`
              INSERT INTO cerveza_presentacion (
                fk_cerveza, fk_miembro_acaucab, fk_presentacion
              ) VALUES (
                ${cerveza[0].cerveza_id}, ${miembro[0].miembro_id}, ${presentacion[0].presentacion_id}
              )
            `;
            acciones.push("✅ Creada cerveza_presentacion");
          }
        }
        
        // Ahora crear EVENTO_MIEMBRO_ACAUCAB
        const evento = await sql`SELECT evento_id FROM evento LIMIT 1`;
        const miembro = await sql`SELECT miembro_id FROM miembro_acaucab LIMIT 1`;
        const cp = await sql`SELECT cerveza_presentacion_id FROM cerveza_presentacion LIMIT 1`;
        
        if (evento.length > 0 && miembro.length > 0 && cp.length > 0) {
          await sql`
            INSERT INTO evento_miembro_acaucab (
              fk_evento, fk_miembro_acaucab, fk_cerveza_presentacion, cantidad
            ) VALUES (
              ${evento[0].evento_id}, ${miembro[0].miembro_id}, ${cp[0].cerveza_presentacion_id}, 100
            )
          `;
          acciones.push("✅ Creado EVENTO_MIEMBRO_ACAUCAB de prueba");
        }
        
      } catch (error) {
        console.error("Error creando EVENTO_MIEMBRO_ACAUCAB:", error);
        acciones.push("❌ Error creando EVENTO_MIEMBRO_ACAUCAB");
      }
    } else {
      acciones.push("ℹ️ Ya existen registros en EVENTO_MIEMBRO_ACAUCAB");
    }
    
    // Verificar resultado final
    const finalEventosCount = await sql`SELECT COUNT(*) as count FROM evento`;
    const finalEmaCount = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab`;
    
    return NextResponse.json({
      success: true,
      data: {
        acciones_realizadas: acciones,
        eventos_finales: finalEventosCount[0]?.count,
        evento_miembro_acaucab_finales: finalEmaCount[0]?.count,
        mensaje: "Datos de prueba configurados correctamente"
      }
    });
    
  } catch (error) {
    console.error('Error configurando datos de prueba:', error);
    return NextResponse.json(
      { success: false, error: 'Error configurando datos de prueba', details: error },
      { status: 500 }
    );
  }
} 