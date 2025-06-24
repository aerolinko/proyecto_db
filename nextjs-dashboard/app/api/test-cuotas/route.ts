import { NextRequest, NextResponse } from 'next/server'
import { testCuotasAfiliacionSimple, testCuotasAfiliacionConHaving } from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Test Cuotas de Afiliación ===")
    
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test') || 'simple'

    let data
    if (testType === 'having') {
      data = await testCuotasAfiliacionConHaving()
    } else {
      data = await testCuotasAfiliacionSimple()
    }

    console.log(`Datos de prueba obtenidos: ${data.length} registros`)

    return NextResponse.json({
      success: true,
      testType,
      data: data,
      total: data.length
    })

  } catch (error) {
    console.error("Error en API test-cuotas:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al probar cuotas de afiliación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 