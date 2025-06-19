import type { NextRequest } from "next/server"
import {findEmpleadoTable, getEmpleados} from "@/db";


export async function GET(request: NextRequest) {
  try {
    console.log("=== INICIO GET /api/empleados ===")

    // Encontrar la tabla empleado
    const { schemaTable } = await findEmpleadoTable()
    console.log("Usando tabla empleado:", schemaTable)

    // Obtener todos los empleados
    const empleados = await getEmpleados()

    console.log("Empleados obtenidos:", empleados.length)

    return Response.json({
      message: "Empleados obtenidos exitosamente",
      empleados: empleados,
      count: empleados.length,
    })
  } catch (error) {
    console.error("Error in GET empleados:", error)
    return Response.json(
      {
        error: "Error al obtener empleados",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
