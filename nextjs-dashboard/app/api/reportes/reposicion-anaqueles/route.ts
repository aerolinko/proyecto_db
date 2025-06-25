import { NextRequest, NextResponse } from 'next/server'
import { getReposicionAnaquelesSP } from '@/db'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 10

    const reporte = await getReposicionAnaquelesSP(fechaInicio, fechaFin, limite)
    const jsreportResponse = await axios.post(
      'http://localhost:5488/api/report',
      {
        template: { name: 'reposicionAnaqueles' },
        data: { reporte }
      },
      { responseType: 'arraybuffer' }
    )

    return new NextResponse(jsreportResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="reposicion-anaqueles.pdf"'
      }
    })
  } catch (error) {
    console.error('Error en API reporte reposicion anaqueles:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 