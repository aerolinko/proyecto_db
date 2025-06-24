import { NextRequest, NextResponse } from 'next/server'
import { getProductosMasVendidos, getProductosMasVendidosSP } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = searchParams.get('limite') ? Number(searchParams.get('limite')) : 10

    console.log('=== API Reporte Productos Más Vendidos ===')
    console.log('Parámetros:', { fechaInicio, fechaFin, limite })

    // Opción 1: Usar función directa de db.ts
   // const reporte = await getProductosMasVendidos(fechaInicio, fechaFin, limite)
    
    // Opción 2: Usar Stored Procedure (descomenta la línea de abajo y comenta la de arriba)
     const reporte = await getProductosMasVendidosSP(fechaInicio, fechaFin, limite)

    return NextResponse.json({
      success: true,
      reporte: reporte,
      total: reporte.length,
      filtros: { fechaInicio, fechaFin, limite }
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