import { NextRequest, NextResponse } from 'next/server'
import { getNominaDepartamento, getNominaDepartamentoResumen } from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Nómina por Departamento ===")
    
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')
    const tipo = searchParams.get('tipo') || 'detalle' // 'detalle' o 'resumen'

    console.log("Parámetros recibidos:", {
      fechaInicio,
      fechaFin,
      limite,
      tipo
    })

    let data
    if (tipo === 'resumen') {
      data = await getNominaDepartamentoResumen(fechaInicio || undefined, fechaFin || undefined, limite)
    } else {
      data = await getNominaDepartamento(fechaInicio || undefined, fechaFin || undefined, limite)
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    return NextResponse.json({
      success: true,
      data: data,
      total: data.length,
      tipo: tipo,
      filtros: {
        fechaInicio,
        fechaFin,
        limite
      }
    })

  } catch (error) {
    console.error("Error en API nomina-departamento:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de nómina por departamento',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 