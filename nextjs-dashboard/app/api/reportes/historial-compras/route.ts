import { NextRequest, NextResponse } from 'next/server'
import { 
  getHistorialComprasClienteJuridico, 
  getResumenComprasClienteJuridico,
  getClientesJuridicos,
  getHistorialComprasClienteJuridicoSimple,
  getResumenComprasClienteJuridicoSimple
} from '@/db'

export async function GET(request: NextRequest) {
  try {
    console.log("=== API: Historial de Compras por Cliente Jurídico ===")
    
    const { searchParams } = new URL(request.url)
    const clienteJuridicoId = searchParams.get('clienteJuridicoId') ? 
      parseInt(searchParams.get('clienteJuridicoId')!) : undefined
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')
    const tipo = searchParams.get('tipo') || 'detalle' // 'detalle' o 'resumen'
    const accion = searchParams.get('accion') || 'reporte' // 'reporte' o 'clientes'
    const modo = searchParams.get('modo') || 'simple' // 'simple' o 'completo'

    console.log("Parámetros recibidos:", {
      clienteJuridicoId,
      fechaInicio,
      fechaFin,
      limite,
      tipo,
      accion,
      modo
    })

    let data
    if (accion === 'clientes') {
      // Obtener lista de clientes jurídicos
      data = await getClientesJuridicos()
    } else if (tipo === 'resumen') {
      // Obtener resumen de compras
      if (modo === 'simple') {
        data = await getResumenComprasClienteJuridicoSimple(
          clienteJuridicoId, 
          fechaInicio || undefined, 
          fechaFin || undefined, 
          limite
        )
      } else {
        data = await getResumenComprasClienteJuridico(
          clienteJuridicoId, 
          fechaInicio || undefined, 
          fechaFin || undefined, 
          limite
        )
      }
    } else {
      // Obtener historial detallado
      if (modo === 'simple') {
        data = await getHistorialComprasClienteJuridicoSimple(
          clienteJuridicoId, 
          fechaInicio || undefined, 
          fechaFin || undefined, 
          limite
        )
      } else {
        data = await getHistorialComprasClienteJuridico(
          clienteJuridicoId, 
          fechaInicio || undefined, 
          fechaFin || undefined, 
          limite
        )
      }
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    return NextResponse.json({
      success: true,
      data: data,
      total: data.length,
      tipo: tipo,
      accion: accion,
      modo: modo,
      filtros: {
        clienteJuridicoId,
        fechaInicio,
        fechaFin,
        limite
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