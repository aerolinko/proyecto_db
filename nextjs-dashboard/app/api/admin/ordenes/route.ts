import { NextRequest, NextResponse } from 'next/server';
import sql from '@/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las órdenes con información del cliente y productos
    const result = await sql`
      SELECT 
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total,
        vo.direccion,
        COALESCE(latest_estado.nombre, 'Pendiente') as estado,
        vo.fk_usuario as usuario_id,
        -- Información del cliente
        CASE 
          WHEN cn.primer_nombre IS NOT NULL THEN CONCAT(cn.primer_nombre, ' ', cn.primer_apellido)
          WHEN cj.razon_social IS NOT NULL THEN cj.razon_social
          ELSE 'Cliente no identificado'
        END as cliente_nombre,
        COALESCE('', '') as cliente_telefono,
        COALESCE(u.nombre_usuario, '') as cliente_email
      FROM venta_online vo
      LEFT JOIN usuario u ON vo.fk_usuario = u.usuario_id
      LEFT JOIN cliente_natural cn ON u.fk_cliente_natural = cn.cliente_id
      LEFT JOIN cliente_juridico cj ON u.fk_cliente_juridico = cj.cliente_id
      LEFT JOIN (
        SELECT DISTINCT ON (evo.fk_venta_online) 
          evo.fk_venta_online,
          e.nombre
        FROM estado_venta_online evo
        JOIN estado e ON evo.fk_estado = e.estado_id
        ORDER BY evo.fk_venta_online, evo.fecha_inicio DESC
      ) latest_estado ON vo.venta_online_id = latest_estado.fk_venta_online
      ORDER BY vo.fecha_emision DESC
    `;
    
        const orders = result.map((order, index) => {
      return {
        venta_online_id: order.venta_online_id,
        fecha_emision: order.fecha_emision,
        fecha_estimada: order.fecha_estimada,
        fecha_entrega: order.fecha_entrega,
        total: parseFloat(order.total),
        direccion: order.direccion,
        estado: order.estado,
        usuario_id: order.usuario_id,
        cliente_info: {
          nombre: order.cliente_nombre,
          telefono: order.cliente_telefono,
          email: order.cliente_email
        },
        productos: [{}]
      };
    });
    
        // Obtener productos para cada orden
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      
      try {
        const productosResult = await sql`
          SELECT 
            dvo.detalle_venta_online_id,
            c.nombre as nombre_cerveza,
            CONCAT(p.cap_volumen, 'ml ', p.material) as presentacion,
            dvo.precio_unitario,
            dvo.cantidad,
            (dvo.precio_unitario * dvo.cantidad) as subtotal
          FROM detalle_venta_online dvo
          JOIN almacen_cerveza ac ON dvo.fk_almacen_cerveza = ac.almacen_cerveza_id
          JOIN cerveza_presentacion cp ON ac.fk_cerveza_presentacion = cp.cerveza_presentacion_id
          JOIN cerveza c ON cp.fk_cerveza = c.cerveza_id
          JOIN presentacion p ON cp.fk_presentacion = p.presentacion_id
          WHERE dvo.fk_venta_online = ${order.venta_online_id}
        `;

        order.productos = productosResult.map(producto => ({
          detalle_venta_online_id: producto.detalle_venta_online_id,
          nombre_cerveza: producto.nombre_cerveza,
          presentacion: producto.presentacion,
          precio_unitario: parseFloat(producto.precio_unitario),
          cantidad: producto.cantidad,
          subtotal: parseFloat(producto.subtotal)
        }));
      } catch (error) {
        console.error(`Error fetching products for order ${order.venta_online_id}:`, error);
        order.productos = [];
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      orders: orders 
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 