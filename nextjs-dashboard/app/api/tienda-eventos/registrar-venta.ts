import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente, evento, total, pagos } = body;
    // cliente: { nombre, apellido, cedula, telefono, email }
    // evento: { evento_id, precio_unitario, cantidad }
    // pagos: [{ tipo, numero, banco, fecha_exp?, monto }]

    // 1. Buscar o crear el cliente
    let clienteIdRes = await sql`
      INSERT INTO CLIENTE_NATURAL (nombre, apellido, cedula, telefono, email)
      VALUES (${cliente.nombre}, ${cliente.apellido}, ${cliente.cedula}, ${cliente.telefono}, ${cliente.email})
      ON CONFLICT (cedula) DO UPDATE SET nombre=EXCLUDED.nombre, apellido=EXCLUDED.apellido, telefono=EXCLUDED.telefono, email=EXCLUDED.email
      RETURNING cliente_id
    `;
    const cliente_id = clienteIdRes[0].cliente_id;

    // 2. Buscar o crear EVENTO_CLIENTE
    let eventoClienteRes = await sql`
      INSERT INTO EVENTO_CLIENTE (fk_evento, fk_cliente_natural)
      VALUES (${evento.evento_id}, ${cliente_id})
      ON CONFLICT DO NOTHING
      RETURNING evento_cliente_id
    `;
    let evento_cliente_id = eventoClienteRes[0]?.evento_cliente_id;
    if (!evento_cliente_id) {
      // Si ya existía, buscarlo
      const res = await sql`
        SELECT evento_cliente_id FROM EVENTO_CLIENTE
        WHERE fk_evento = ${evento.evento_id} AND fk_cliente_natural = ${cliente_id}
      `;
      evento_cliente_id = res[0].evento_cliente_id;
    }

    // 3. Insertar en VENTA_EVENTO
    const ventaRes = await sql`
      INSERT INTO VENTA_EVENTO (total, fecha, fk_evento_cliente, fk_evento)
      VALUES (${total}, CURRENT_DATE, ${evento_cliente_id}, ${evento.evento_id})
      RETURNING venta_evento_id
    `;
    const venta_evento_id = ventaRes[0].venta_evento_id;

    // 4. Insertar en DETALLE_VENTA_EVENTO
    await sql`
      INSERT INTO DETALLE_VENTA_EVENTO (
        fk_evento_miembro_acaucab,
        fk_venta_evento,
        fk_evento_entrada,
        precio_unitario,
        cantidad
      ) VALUES (
        NULL, ${venta_evento_id}, ${evento.evento_id}, ${evento.precio_unitario}, ${evento.cantidad}
      )
    `;

    // 5. Insertar cada método de pago y el pago
    for (const pago of pagos) {
      let metodo_pago_id = null;
      if (pago.tipo === 'debito') {
        const res = await sql`
          INSERT INTO METODO_PAGO_DEBITO (numero, banco, fk_cliente_natural)
          VALUES (${pago.numero}, ${pago.banco}, ${cliente_id})
          RETURNING metodo_pago_id
        `;
        metodo_pago_id = res[0].metodo_pago_id;
        await sql`
          INSERT INTO PAGO (monto, fecha, fk_venta_evento, fk_metodo_pago_debito)
          VALUES (${pago.monto}, CURRENT_DATE, ${venta_evento_id}, ${metodo_pago_id})
        `;
      } else if (pago.tipo === 'credito') {
        const res = await sql`
          INSERT INTO METODO_PAGO_CREDITO (numero, banco, fecha_exp, fk_cliente_natural)
          VALUES (${pago.numero}, ${pago.banco}, ${pago.fecha_exp}, ${cliente_id})
          RETURNING metodo_pago_id
        `;
        metodo_pago_id = res[0].metodo_pago_id;
        await sql`
          INSERT INTO PAGO (monto, fecha, fk_venta_evento, fk_metodo_pago_credito)
          VALUES (${pago.monto}, CURRENT_DATE, ${venta_evento_id}, ${metodo_pago_id})
        `;
      }
      // Puedes agregar más tipos de pago aquí...
    }

    return NextResponse.json({ success: true, venta_evento_id });
  } catch (error) {
    console.error('Error registrando venta de evento:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
} 