import { type NextRequest, NextResponse } from "next/server"
import {
  getReportUsuarios,
  getReportEmpleados,
  getReportVentas,
  getAllLugares,
  getAllProducts,
  getReportRoles,
} from "@/db"

export async function POST(request: NextRequest) {
  try {
    console.log("=== INICIO POST /api/reportes ===")

    const { reportType, parameters } = await request.json()
    console.log("Tipo de reporte:", reportType)
    console.log("Parámetros:", parameters)

    let data: any[] = []
    let reportTitle = ""
    let columns: string[] = []

    switch (reportType) {
      case "usuarios":
        data = await getReportUsuarios(parameters.fechaInicio, parameters.fechaFin)
        reportTitle = "Reporte de Usuarios"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = [
            "usuario_id",
            "nombre_usuario",
            "fecha_creacion",
            "primer_nombre",
            "primer_apellido",
            "cedula",
            "nombre_completo",
          ]
        }
        break

      case "empleados":
        data = await getReportEmpleados(parameters.lugarId)
        reportTitle = "Reporte de Empleados"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = [
            "empleado_id",
            "cedula",
            "primer_nombre",
            "primer_apellido",
            "segundo_nombre",
            "segundo_apellido",
            "direccion",
            "fecha_contrato",
            "lugar_nombre",
          ]
        }
        break

      case "ventas":
        data = await getReportVentas(parameters.fechaInicio, parameters.fechaFin)
        reportTitle = "Reporte de Ventas"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = ["venta_id", "fecha_venta", "monto_total", "tipo_cliente", "cliente_nombre"]
        }
        break

      case "roles":
        data = await getReportRoles()
        reportTitle = "Reporte de Roles"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = ["rol_id", "nombre_rol", "descripcion_rol", "total_permisos"]
        }
        break

      case "productos":
        data = await getAllProducts()
        reportTitle = "Reporte de Productos"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = ["producto_id", "nombre", "precio", "stock", "categoria"]
        }
        break

      case "lugares":
        data = await getAllLugares()
        reportTitle = "Reporte de Lugares"
        // Usar las columnas exactas que devuelve tu función
        if (data.length > 0) {
          columns = Object.keys(data[0])
        } else {
          columns = ["lugar_id", "nombre", "tipo", "fk_lugar"]
        }
        break

      default:
        throw new Error("Tipo de reporte no válido")
    }

    console.log(`Datos obtenidos: ${data.length} registros`)
    console.log("Columnas detectadas:", columns)

    // Retornar los datos del reporte
    return NextResponse.json({
      success: true,
      reportTitle,
      columns,
      data,
      totalRecords: data.length,
      generatedAt: new Date().toISOString(),
      parameters,
    })
  } catch (error) {
    console.error("Error generando reporte:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error generando reporte: " + (error as Error).message,
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log("=== GET /api/reportes - Obteniendo lugares ===")
    const lugares = await getAllLugares()
    console.log(`Lugares obtenidos: ${lugares.length}`)

    return NextResponse.json({
      success: true,
      lugares: lugares,
    })
  } catch (error) {
    console.error("Error getting lugares:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error obteniendo lugares",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
