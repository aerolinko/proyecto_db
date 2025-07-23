import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { status } = await request.json();

    // Validar el estado (insensible a mayúsculas y espacios)
    const validStatuses = ['Pendiente', 'Completado'];
    const normalizedStatus = status?.trim().toLowerCase();
    const validNormalized = validStatuses.map(s => s.toLowerCase());

    if (!validNormalized.includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, error: 'Estado no válido' },
        { status: 400 }
      );
    }

    // Obtener el valor correcto para enviar al procedimiento
    const statusToSend = validStatuses.find(s => s.toLowerCase() === normalizedStatus);

    // Llamar al procedimiento que actualiza y registra el historial
    await sql`CALL cambiar_estado_orden(${orderId}, ${statusToSend})`;

    // Obtener la orden actualizada con el estado actual
    const orderResult = await sql`
      SELECT 
        vo.venta_online_id,
        vo.fecha_emision,
        vo.fecha_estimada,
        vo.fecha_entrega,
        vo.total,
        vo.direccion,
        evo.estado_venta_online_id,
        e.nombre AS estado
      FROM venta_online vo
      LEFT JOIN estado_venta_online evo ON evo.fk_venta_online = vo.venta_online_id AND evo.fecha_fin IS NULL
      LEFT JOIN estado e ON e.estado_id = evo.fk_estado
      WHERE vo.venta_online_id = ${orderId}
    `;

    if (orderResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      );
    }

    const updatedOrder = orderResult[0];

    return NextResponse.json({
      success: true,
      message: `Estado de la orden actualizado a ${statusToSend}`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 