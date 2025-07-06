import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function POST(request: NextRequest) {
  try {
    console.log("=== AGREGANDO DATOS AL EVENTO 118 ===");
    
    let acciones = [];
    
    // Verificar si el evento 118 existe
    const evento118 = await sql`SELECT * FROM evento WHERE evento_id = 118`;
    if (evento118.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'El evento 118 no existe'
      });
    }
    
    acciones.push(`✅ Evento 118 encontrado: "${evento118[0].nombre}"`);
    
    // Verificar si ya tiene datos
    const ema118 = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab WHERE fk_evento = 118`;
    if (ema118[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        error: `El evento 118 ya tiene ${ema118[0].count} proveedores asignados`
      });
    }
    
    // Verificar si hay miembros ACAUCAB
    const miembrosCount = await sql`SELECT COUNT(*) as count FROM miembro_acaucab`;
    if (miembrosCount[0]?.count === 0) {
      // Crear miembro ACAUCAB
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
    
    // Crear CERVEZA_PRESENTACION si no existe
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
    
    // Ahora crear EVENTO_MIEMBRO_ACAUCAB para el evento 118
    const miembro = await sql`SELECT miembro_id FROM miembro_acaucab LIMIT 1`;
    const cp = await sql`SELECT cerveza_presentacion_id FROM cerveza_presentacion LIMIT 1`;
    
    if (miembro.length > 0 && cp.length > 0) {
      await sql`
        INSERT INTO evento_miembro_acaucab (
          fk_evento, fk_miembro_acaucab, fk_cerveza_presentacion, cantidad
        ) VALUES (
          118, ${miembro[0].miembro_id}, ${cp[0].cerveza_presentacion_id}, 100
        )
      `;
      acciones.push("✅ Creado EVENTO_MIEMBRO_ACAUCAB para evento 118");
    }
    
    // Verificar resultado final
    const finalEma118 = await sql`SELECT COUNT(*) as count FROM evento_miembro_acaucab WHERE fk_evento = 118`;
    
    // Probar las funciones
    let productosTest = null;
    let catalogoTest = null;
    
    try {
      const productosResult = await sql`SELECT * FROM obtenerProductosEvento(118)`;
      productosTest = productosResult.length;
      console.log("obtenerProductosEvento(118) después de agregar datos:", productosResult.length);
    } catch (error) {
      console.error("Error probando obtenerProductosEvento:", error);
    }
    
    try {
      const catalogoResult = await sql`SELECT * FROM obtenerCatalogoCervezasEvento(118)`;
      catalogoTest = catalogoResult.length;
      console.log("obtenerCatalogoCervezasEvento(118) después de agregar datos:", catalogoResult.length);
    } catch (error) {
      console.error("Error probando obtenerCatalogoCervezasEvento:", error);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        acciones_realizadas: acciones,
        evento_miembro_acaucab_finales: finalEma118[0]?.count,
        productos_test: productosTest,
        catalogo_test: catalogoTest,
        mensaje: "Datos agregados al evento 118 correctamente"
      }
    });
    
  } catch (error) {
    console.error('Error agregando datos al evento 118:', error);
    return NextResponse.json(
      { success: false, error: 'Error agregando datos al evento 118', details: error },
      { status: 500 }
    );
  }
} 