import { NextRequest, NextResponse } from 'next/server'
import { testMiembrosAcaucabSimple, testCuotasAfiliacionConHaving, verificarMiembrosAcaucab, asignarFechasAfiliacion, testDatosBasicos, testReporteCuotas, diagnosticoDetallado, getEstadoAfiliacionSimple, verDatosPagos, verificarContactosFaltantes, generarInsertsContactos, generarArchivoSQLContactos } from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Test Miembros ACAUCAB ===")
    
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test') || 'simple'

    let data
    if (testType === 'having') {
      data = await testCuotasAfiliacionConHaving()
    } else if (testType === 'verificar') {
      data = await verificarMiembrosAcaucab()
    } else if (testType === 'asignar') {
      data = await asignarFechasAfiliacion()
    } else if (testType === 'basicos') {
      data = await testDatosBasicos()
    } else if (testType === 'reporte') {
      data = await testReporteCuotas()
    } else if (testType === 'diagnostico') {
      data = await diagnosticoDetallado()
    } else if (testType === 'estado') {
      data = await getEstadoAfiliacionSimple()
    } else if (testType === 'pagos') {
      data = await verDatosPagos()
    } else if (testType === 'contactos_faltantes') {
      data = await verificarContactosFaltantes()
    } else if (testType === 'generar_contactos') {
      data = await generarInsertsContactos()
    } else if (testType === 'sql_contactos') {
      data = await generarArchivoSQLContactos()
    } else {
      data = await testMiembrosAcaucabSimple()
    }

    console.log(`Datos de prueba obtenidos: ${Array.isArray(data) ? data.length : 'N/A'} registros`)

    return NextResponse.json({
      success: true,
      testType,
      data: data,
      total: Array.isArray(data) ? data.length : 'N/A'
    })

  } catch (error) {
    console.error("Error en API test-cuotas:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al probar miembros ACAUCAB',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 