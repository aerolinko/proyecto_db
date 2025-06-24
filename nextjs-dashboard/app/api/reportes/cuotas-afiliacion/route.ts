import { NextRequest, NextResponse } from 'next/server'
import { getCuotasAfiliacionPendientes, getCuotasAfiliacionPendientesSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Cuotas de Afiliación Pendientes ===")
    
    const { searchParams } = new URL(request.url)
    const usarSP = searchParams.get('usarSP') === 'true'

    console.log("Parámetros recibidos:", {
      usarSP
    })

    let data
    if (usarSP) {
      data = await getCuotasAfiliacionPendientesSP()
    } else {
      data = await getCuotasAfiliacionPendientes()
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    return NextResponse.json({
      success: true,
      data: data,
      total: data.length,
      filtros: {
        usarSP
      }
    })

  } catch (error) {
    console.error("Error en API cuotas-afiliacion:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener miembros ACAUCAB',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 