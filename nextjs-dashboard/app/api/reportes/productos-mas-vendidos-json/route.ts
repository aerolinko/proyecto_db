import { NextRequest, NextResponse } from 'next/server'
import { getProductosMasVendidosSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 10

    const reporte = await getProductosMasVendidosSP(fechaInicio, fechaFin, limite)

    return NextResponse.json({
      success: true,
      reporte: reporte,
      total: reporte.length,
      filtros: { fechaInicio, fechaFin, limite }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}