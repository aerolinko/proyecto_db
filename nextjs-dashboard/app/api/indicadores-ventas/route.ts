import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const periodo = searchParams.get('periodo');
    const limite = searchParams.get('limite');

    let result;

    switch (tipo) {
      case 'ventas-totales':
        result = await sql`
          SELECT * FROM get_ventas_totales_por_tienda(
            ${fechaInicio ? new Date(fechaInicio) : null},
            ${fechaFin ? new Date(fechaFin) : null}
          )
        `;
        break;

      case 'crecimiento':
        result = await sql`
          SELECT * FROM get_crecimiento_ventas(${periodo || 'mes'})
        `;
        break;

      case 'ticket-promedio':
        result = await sql`
          SELECT * FROM get_ticket_promedio(
            ${fechaInicio ? new Date(fechaInicio) : null},
            ${fechaFin ? new Date(fechaFin) : null},
            ${searchParams.get('tipoTienda')}
          )
        `;
        break;

      case 'volumen-unidades':
        result = await sql`
          SELECT * FROM get_volumen_unidades_vendidas(
            ${fechaInicio ? new Date(fechaInicio) : null},
            ${fechaFin ? new Date(fechaFin) : null},
            ${searchParams.get('tipoTienda')}
          )
        `;
        break;

      case 'estilos-cerveza':
        result = await sql`
          SELECT * FROM get_ventas_por_estilo_cerveza(
            ${fechaInicio ? new Date(fechaInicio) : null},
            ${fechaFin ? new Date(fechaFin) : null},
            ${limite ? parseInt(limite) : 10}
          )
        `;
        break;

      case 'resumen-general':
        result = await sql`
          SELECT * FROM get_resumen_indicadores_ventas(
            ${fechaInicio ? new Date(fechaInicio) : null},
            ${fechaFin ? new Date(fechaFin) : null}
          )
        `;
        break;

      default:
        return NextResponse.json(
          { error: 'Tipo de indicador no válido' },
          { status: 400 }
        );
    }

    return NextResponse.json({ data: result });

  } catch (error) {
    console.error('Error al obtener indicadores de ventas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 