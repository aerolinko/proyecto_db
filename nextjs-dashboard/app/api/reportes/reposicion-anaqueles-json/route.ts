import { NextRequest, NextResponse } from 'next/server'
import { getReposicionAnaquelesSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined

    const reporte = await getReposicionAnaquelesSP(fechaInicio, fechaFin)

    return NextResponse.json({
      success: true,
      reporte: reporte,
      total: reporte.length,
      filtros: { fechaInicio, fechaFin }
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