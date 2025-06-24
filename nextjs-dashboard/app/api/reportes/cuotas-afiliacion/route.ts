import { NextRequest, NextResponse } from 'next/server'
import { getCuotasAfiliacionPendientes, getCuotasAfiliacionPendientesSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Cuotas de Afiliación Pendientes ===")
    
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')
    const usarSP = searchParams.get('usarSP') === 'true'

    console.log("Parámetros recibidos:", {
      fechaInicio,
      fechaFin,
      limite,
      usarSP
    })

    let data
    if (usarSP) {
      data = await getCuotasAfiliacionPendientesSP(fechaInicio || undefined, fechaFin || undefined, limite)
    } else {
      data = await getCuotasAfiliacionPendientes(fechaInicio || undefined, fechaFin || undefined, limite)
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    return NextResponse.json({
      success: true,
      data: data,
      total: data.length,
      filtros: {
        fechaInicio,
        fechaFin,
        limite,
        usarSP
      }
    })

  } catch (error) {
    console.error("Error en API cuotas-afiliacion:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener cuotas de afiliación pendientes',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 