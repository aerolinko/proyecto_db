import { NextRequest, NextResponse } from 'next/server'
import { getCuotasAfiliacionPendientesSP } from '@/db'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const reporte = await getCuotasAfiliacionPendientesSP()

    const jsreportResponse = await axios.post(
      'http://localhost:5488/api/report',
      {
        template: { name: 'cuotasAfiliacion' },
        data: { reporte }
      },
      { responseType: 'arraybuffer' }
    )

    return new NextResponse(jsreportResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="cuotas-afiliacion.pdf"'
      }
    })
  } catch (error) {
    console.error('Error en API reporte cuotas afiliacion:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 