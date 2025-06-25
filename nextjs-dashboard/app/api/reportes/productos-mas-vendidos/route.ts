import { NextRequest, NextResponse } from 'next/server'
import { getProductosMasVendidosSP } from '@/db'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 10

    // 1. Obtén los datos
    const reporte = await getProductosMasVendidosSP(fechaInicio, fechaFin, limite)

    const jsreportResponse = await axios.post(
      'http://localhost:5488/api/report',
      {
        template: { name: 'productosMasVendidos' },
        data: { productos: reporte }
      },
      { responseType: 'arraybuffer' }
    )

    return new NextResponse(jsreportResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="productos-mas-vendidos.pdf"'
      }
    })
  } catch (error) {
    console.error('Error en API reporte productos más vendidos:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}