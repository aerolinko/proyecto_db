import { NextRequest, NextResponse } from 'next/server'
import { getHistorialComprasClienteJuridico } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteJuridicoId = searchParams.get('clienteJuridicoId') ? Number(searchParams.get('clienteJuridicoId')) : undefined
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 100

    const reporte = await getHistorialComprasClienteJuridico(clienteJuridicoId, fechaInicio, fechaFin, limite)

    return NextResponse.json({
      success: true,
      reporte: reporte,
      total: reporte.length,
      filtros: { clienteJuridicoId, fechaInicio, fechaFin, limite }
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