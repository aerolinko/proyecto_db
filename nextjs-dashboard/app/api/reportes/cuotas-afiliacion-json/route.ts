import { NextRequest, NextResponse } from 'next/server'
import { getCuotasAfiliacionPendientesSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const reporte = await getCuotasAfiliacionPendientesSP()
    return NextResponse.json({
      success: true,
      reporte: reporte,
      total: reporte.length
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