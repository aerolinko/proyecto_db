import { type NextRequest, NextResponse } from "next/server"
import { jasperService } from "@/lib/jasperService"
import {
  getReportProductosMayorDemanda,
  getReportReposicionAnaqueles,
  getReportCuotasAfiliacionPendientes,
  getReportNominaDepartamento,
  getReportHistorialComprasClienteJuridico,
} from "@/db"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO POST /api/jasper-reports ===")

    const { reportType, parameters, format = 'pdf' } = await request.json()
    console.log("Tipo de reporte:", reportType)
    console.log("Parámetros:", parameters)
    console.log("Formato:", format)

    // Obtener datos según el tipo de reporte
    let data: any[] = []
    let reportTitle = ""

    switch (reportType) {
      case "productos-mayor-demanda":
        data = await getReportProductosMayorDemanda(parameters.fechaInicio, parameters.fechaFin)
        reportTitle = "Productos con Mayor Demanda en Tienda Online"
        break

      case "reposicion-anaqueles":
        data = await getReportReposicionAnaqueles(parameters.fechaInicio, parameters.fechaFin)
        reportTitle = "Reposición de Anaqueles Generadas"
        break

      case "cuotas-afiliacion-pendientes":
        data = await getReportCuotasAfiliacionPendientes()
        reportTitle = "Cuotas de Afiliación Pendientes de Pago"
        break

      case "nomina-departamento":
        data = await getReportNominaDepartamento(parameters.fechaInicio, parameters.fechaFin)
        reportTitle = "Costo Total de Nómina por Departamento/Cargo"
        break

      case "historial-compras-cliente-juridico":
        data = await getReportHistorialComprasClienteJuridico(
          parameters.clienteId, 
          parameters.fechaInicio, 
          parameters.fechaFin
        )
        reportTitle = "Historial Consolidado de Compras Online por Cliente Jurídico"
        break

      default:
        throw new Error("Tipo de reporte no válido")
    }

    console.log(`Datos obtenidos: ${data.length} registros`)

    // Generar reporte con JasperReports
    const jasperParams = {
      reportType,
      parameters: {
        ...parameters,
        data: JSON.stringify(data),
        reportTitle,
        generatedAt: new Date().toISOString(),
        totalRecords: data.length
      },
      format
    }

    const jasperResult = await jasperService.generateReport(jasperParams)

    if (!jasperResult.success) {
      throw new Error(jasperResult.error || 'Error generando reporte con JasperReports')
    }

    // Retornar el reporte generado
    const response = new NextResponse(jasperResult.reportData, {
      status: 200,
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 
                       format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                       'text/csv',
        'Content-Disposition': `attachment; filename="${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${format}"`,
        'Cache-Control': 'no-cache'
      }
    })

    return response

  } catch (error) {
    console.error("Error generando reporte JasperReports:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error generando reporte: " + (error as Error).message,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log("=== GET /api/jasper-reports - Listando reportes disponibles ===")
    
    const reports = await jasperService.listReports()
    
    return NextResponse.json({
      success: true,
      reports,
      availableFormats: ['pdf', 'xlsx', 'csv'],
      availableReportTypes: [
        {
          value: "productos-mayor-demanda",
          label: "Productos con Mayor Demanda",
          description: "Lista los productos de cerveza con mayor volumen de ventas",
          parameters: ["fechaInicio", "fechaFin"]
        },
        {
          value: "reposicion-anaqueles",
          label: "Reposición de Anaqueles",
          description: "Órdenes automáticas cuando el stock desciende a 20 unidades",
          parameters: ["fechaInicio", "fechaFin"]
        },
        {
          value: "cuotas-afiliacion-pendientes",
          label: "Cuotas de Afiliación Pendientes",
          description: "Miembros proveedores con cuotas mensuales pendientes",
          parameters: []
        },
        {
          value: "nomina-departamento",
          label: "Nómina por Departamento",
          description: "Costo total de nómina por departamento y cargo",
          parameters: ["fechaInicio", "fechaFin"]
        },
        {
          value: "historial-compras-cliente-juridico",
          label: "Historial de Compras Cliente Jurídico",
          description: "Resumen detallado de compras por razón social",
          parameters: ["clienteId", "fechaInicio", "fechaFin"]
        }
      ]
    })
  } catch (error) {
    console.error("Error listando reportes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error listando reportes",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
} 