import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();

    // Validar el estado
    const validStatuses = ['EN_PROCESO', 'LISTO_ENTREGA', 'ENTREGADO', 'CANCELADO'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Estado no válido' },
        { status: 400 }
      );
    }

    // Actualizar el estado de la orden
    let updateQuery;
    let fechaEntrega = null;

    if (status === 'ENTREGADO') {
      // Si se marca como entregado, establecer la fecha de entrega
      fechaEntrega = new Date().toISOString();
      updateQuery = sql`
        UPDATE venta_online 
        SET estado = ${status}, fecha_entrega = ${fechaEntrega}
        WHERE venta_online_id = ${orderId}
      `;
    } else {
      updateQuery = sql`
        UPDATE venta_online 
        SET estado = ${status}
        WHERE venta_online_id = ${orderId}
      `;
    }

    const result = await updateQuery;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    // Obtener la orden actualizada
    const orderResult = await sql`
      SELECT 
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total,
        vo.direccion,
        vo.estado,
        vo.usuario_id,
        -- Información del cliente
        CASE 
          WHEN c.nombre IS NOT NULL THEN c.nombre
          WHEN cj.razon_social IS NOT NULL THEN cj.razon_social
          ELSE 'Cliente no identificado'
        END as cliente_nombre,
        COALESCE(c.telefono, cj.telefono) as cliente_telefono,
        COALESCE(c.email, cj.email) as cliente_email
      FROM venta_online vo
      LEFT JOIN cliente_natural c ON vo.usuario_id = c.cliente_natural_id
      LEFT JOIN cliente_juridico cj ON vo.usuario_id = cj.cliente_juridico_id
      WHERE vo.venta_online_id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Error al obtener la orden actualizada' },
        { status: 500 }
      );
    }

    const updatedOrder = orderResult.rows[0];

    return NextResponse.json({
      success: true,
      message: `Estado de la orden actualizado a ${status}`,
      order: {
        venta_online_id: updatedOrder.venta_online_id,
        fecha_emision: updatedOrder.fecha_emision,
        fecha_estimada: updatedOrder.fecha_estimada,
        fecha_entrega: updatedOrder.fecha_entrega,
        total: parseFloat(updatedOrder.total),
        direccion: updatedOrder.direccion,
        estado: updatedOrder.estado,
        usuario_id: updatedOrder.usuario_id,
        cliente_info: {
          nombre: updatedOrder.cliente_nombre,
          telefono: updatedOrder.cliente_telefono,
          email: updatedOrder.cliente_email
        }
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 