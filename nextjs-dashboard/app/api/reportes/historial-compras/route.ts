import { NextRequest, NextResponse } from 'next/server'
import { getHistorialComprasClienteJuridico, getClientesJuridicos } from '@/db'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Historial de Compras por Cliente Jurídico ===")
    
    const { searchParams } = new URL(request.url)
    const clienteJuridicoId = searchParams.get('clienteJuridicoId') ? 
      parseInt(searchParams.get('clienteJuridicoId')!) : undefined
    const fechaInicio = searchParams.get('fechaInicio') || undefined
    const fechaFin = searchParams.get('fechaFin') || undefined
    const limite = parseInt(searchParams.get('limite') || '100')
    const accion = searchParams.get('accion') || 'reporte' // 'reporte' o 'clientes'

    console.log("Parámetros recibidos:", {
      clienteJuridicoId,
      fechaInicio,
      fechaFin,
      limite,
      accion
    })

    let data
    if (accion === 'clientes') {
      // Obtener lista de clientes jurídicos
      data = await getClientesJuridicos()
    } else {
      // Obtener historial detallado usando stored procedure
      data = await getHistorialComprasClienteJuridico(
        clienteJuridicoId, 
        fechaInicio, 
        fechaFin, 
        limite
      )
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    const jsreportResponse = await axios.post(
      'http://localhost:5488/api/report',
      {
        template: { name: 'historialCompras' },
        data: { reporte: data }
      },
      { responseType: 'arraybuffer' }
    )

    return new NextResponse(jsreportResponse.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="historial-compras.pdf"'
      }
    })
  } catch (error) {
    console.error("Error en API historial-compras:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener historial de compras por cliente jurídico',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
} 