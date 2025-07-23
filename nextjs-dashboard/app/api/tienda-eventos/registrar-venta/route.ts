
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';
import { sendMail } from '@/lib/sendMail';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente, evento, total } = body;
    let { pagos } = body;
    // Validar y forzar que pagos sea un array no vacío
    if (!Array.isArray(pagos)) {
      if (pagos && typeof pagos === 'object') {
        pagos = [pagos];
      } else {
        pagos = [];
      }
    }
    if (pagos.length === 0) {
      return NextResponse.json({ success: false, error: 'Debe agregar al menos un método de pago.' }, { status: 400 });
    }

    // Validar estructura de cada pago
    for (const pago of pagos) {
      if (!pago.tipo || (pago.tipo !== 'debito' && pago.tipo !== 'credito')) {
        return NextResponse.json({ success: false, error: 'El tipo de método de pago debe ser "debito" o "credito".' }, { status: 400 });
      }
      if (!pago.numero || !pago.banco || !pago.monto) {
        return NextResponse.json({ success: false, error: 'Cada método de pago debe tener número, banco y monto.' }, { status: 400 });
      }
      if (pago.tipo === 'credito' && !pago.fecha_exp) {
        return NextResponse.json({ success: false, error: 'Las tarjetas de crédito deben tener fecha de expiración.' }, { status: 400 });
      }
    }

    // DEBUG: Log para ver el valor real de pagos
    const pagosArrayJsonb = JSON.stringify(pagos.map(p => ({
      tipo: p.tipo,
      numero: p.numero,
      banco: p.banco,
      monto: p.monto,
      fecha_exp: p.fecha_exp || null
    })));
    console.log('Pagos enviados al procedimiento:', pagosArrayJsonb);

    // cliente: { primer_nombre, primer_apellido, cedula, direccion, RIF }
    // evento: { evento_id, precio_unitario, cantidad }
    // pagos: [{ tipo, numero, banco, fecha_exp?, monto }]

    // 1. Buscar o crear el cliente natural (usando los campos correctos)
    let clienteIdRes = await sql`
      INSERT INTO CLIENTE_NATURAL (
        RIF, direccion, primer_nombre, primer_apellido, cedula, total_puntos, fk_lugar
      )
      VALUES (
        ${cliente.RIF || 'GENERICA'},
        ${cliente.direccion || 'NO ESPECIFICADA'},
        ${cliente.primer_nombre},
        ${cliente.primer_apellido},
        ${cliente.cedula},
        0,
        1
      )
      ON CONFLICT (cedula) DO UPDATE 
        SET primer_nombre=EXCLUDED.primer_nombre, 
            primer_apellido=EXCLUDED.primer_apellido, 
            direccion=EXCLUDED.direccion
      RETURNING cliente_id
    `;
    const cliente_id = clienteIdRes[0].cliente_id;

    // 2. Llamar al procedimiento almacenado para guardar la venta, detalle y pagos
    // Usar plantilla SQL directa para el CALL
    const callSql = `CALL insertar_venta_evento_con_detalle(${cliente_id}, ${evento.evento_id}, ${total}, ${evento.precio_unitario}, ${evento.cantidad}, '${pagosArrayJsonb}'::jsonb)`;
    await sql.unsafe(callSql);

    // 3. Obtener el último id de venta_evento para mostrarlo en la confirmación
    const ventaRes = await sql`
      SELECT MAX(venta_evento_id) as venta_evento_id FROM VENTA_EVENTO WHERE fk_evento = ${evento.evento_id} AND fk_evento_cliente IN (SELECT evento_cliente_id FROM EVENTO_CLIENTE WHERE fk_cliente_natural = ${cliente_id})
    `;
    const venta_evento_id = ventaRes[0].venta_evento_id;

    // Enviar correo de verificación a josemanuelorog@gmail.com
    try {
      await sendMail({
        to: 'josemanuelorog@gmail.com',
        subject: 'Nueva compra de evento',
        text: `Se ha registrado una nueva compra de evento.\n\nCliente: ${cliente.primer_nombre} ${cliente.primer_apellido} (Cédula: ${cliente.cedula})\nEvento: ${evento.nombre} (ID: ${evento.evento_id})\nTotal pagado: Bs. ${total}\nVenta ID: ${venta_evento_id}`,
        html: `<h2>Nueva compra de evento</h2><p><b>Cliente:</b> ${cliente.primer_nombre} ${cliente.primer_apellido} (Cédula: ${cliente.cedula})</p><p><b>Evento:</b> ${evento.nombre} (ID: ${evento.evento_id})</p><p><b>Total pagado:</b> Bs. ${total}</p><p><b>Venta ID:</b> ${venta_evento_id}</p>`
      });
    } catch (mailErr) {
      console.error('Error enviando correo de verificación:', mailErr);
    }
    return NextResponse.json({ success: true, venta_evento_id });
  } catch (error) {
    console.error('Error registrando venta de evento:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
} 