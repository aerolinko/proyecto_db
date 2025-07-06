import type { NextRequest } from "next/server"
import { 
  getVentasOnlineByUserId, 
  getDetallesVentaOnline,
  createVentaOnline,
  createDetalleVentaOnline,
  createEstadoVentaOnline,
  findAlmacenCervezaByProductName
} from '@/db';

export async function GET(request: NextRequest) {
  try {
    console.log("=== INICIO GET /api/ventas-online ===")

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "userId es requerido" }, { status: 400 })
    }

    console.log("Buscando ventas online para usuario:", userId)

    // Obtener las ventas online del usuario
    const ventas = await getVentasOnlineByUserId(userId);
    console.log("Ventas encontradas:", ventas.length)

    // Para cada venta, obtener los detalles de productos
    const orders = await Promise.all(
      ventas.map(async (venta) => {
        const productos = await getDetallesVentaOnline(venta.venta_online_id);

        // Eliminar duplicados basados en detalle_venta_online_id
        const productosUnicos = productos.filter((producto, index, self) => 
          index === self.findIndex(p => p.detalle_venta_online_id === producto.detalle_venta_online_id)
        );

        return {
          venta_online_id: venta.venta_online_id,
          fecha_emision: venta.fecha_emision,
          fecha_estimada: venta.fecha_estimada,
          fecha_entrega: venta.fecha_entrega,
          total: venta.total / 100, // Convertir de centavos a dólares
          direccion: venta.direccion,
          estado: venta.estado,
          productos: productosUnicos.map(p => ({
            ...p,
            precio_unitario: p.precio_unitario / 100, // Convertir de centavos a dólares
            subtotal: p.subtotal / 100 // Convertir de centavos a dólares
          }))
        };
      })
    );

    console.log("Órdenes procesadas:", orders.length)

    return Response.json({
      message: "Ventas online obtenidas exitosamente",
      orders: orders,
      count: orders.length,
    })
  } catch (error) {
    console.error("=== ERROR GENERAL ===")
    console.error("Error:", error)

    return Response.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO POST /api/ventas-online ===")

    const { userId, cart, paymentMethods, total, direccion } = await request.json()
    
    console.log("Datos recibidos:", {
      userId,
      total,
      direccion,
      cartItems: cart.length,
      paymentMethods: paymentMethods.length
    })

    if (!userId || !cart || !paymentMethods || !total || !direccion) {
      return Response.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Crear la venta online
    const ventaId = await createVentaOnline(userId, total, direccion);
    console.log("Venta creada con ID:", ventaId);

    // Insertar los detalles de la venta
    for (const item of cart) {
      const almacenCervezaId = await findAlmacenCervezaByProductName(item.name);
      
      if (almacenCervezaId) {
        await createDetalleVentaOnline(ventaId, almacenCervezaId, item.price, item.quantity);
      }
    }

    // Crear estado inicial de la venta
    await createEstadoVentaOnline(ventaId);

    console.log("Venta online creada exitosamente")

    return Response.json(
      {
        message: "Venta online creada exitosamente",
        ventaId: ventaId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in POST:", error)

    return Response.json(
      {
        error: "Error al crear venta online",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
} 