import type { NextRequest } from "next/server"
import { sql } from "@/db"

export async function GET(request: NextRequest) {
  try {
    console.log("=== INICIO GET /api/empleados/test ===")

    const results: any = {}

    // 1. Verificar si la tabla empleado existe y tiene datos
    try {
      const empleadoCount = await sql`SELECT COUNT(*) as count FROM empleado`
      results.empleadoCount = empleadoCount[0]?.count || 0
      console.log("Total empleados en tabla:", results.empleadoCount)
    } catch (error) {
      results.empleadoCountError = error instanceof Error ? error.message : String(error)
    }

    // 2. Verificar si la función get_empleados() existe
    try {
      const functionExists = await sql`
        SELECT routine_name, routine_type 
        FROM information_schema.routines 
        WHERE routine_name = 'get_empleados'
      `
      results.functionExists = functionExists.length > 0
      console.log("Función get_empleados existe:", results.functionExists)
    } catch (error) {
      results.functionExistsError = error instanceof Error ? error.message : String(error)
    }

    // 3. Probar consulta directa a la tabla empleado
    try {
      const directQuery = await sql`
        SELECT 
          empleado_id::TEXT as id,
          cedula,
          primer_nombre,
          primer_apellido,
          CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo
        FROM empleado 
        ORDER BY primer_nombre, primer_apellido 
        LIMIT 5
      `
      results.directQuery = directQuery
      console.log("Consulta directa exitosa:", directQuery.length, "registros")
    } catch (error) {
      results.directQueryError = error instanceof Error ? error.message : String(error)
    }

    // 4. Probar la función get_empleados()
    try {
      const functionResult = await sql`SELECT * FROM get_empleados() LIMIT 5`
      results.functionResult = functionResult
      console.log("Función get_empleados exitosa:", functionResult.length, "registros")
    } catch (error) {
      results.functionResultError = error instanceof Error ? error.message : String(error)
    }

    // 5. Probar función simple
    try {
      const simpleResult = await sql`SELECT * FROM get_empleados_simple() LIMIT 5`
      results.simpleResult = simpleResult
      console.log("Función simple exitosa:", simpleResult.length, "registros")
    } catch (error) {
      results.simpleResultError = error instanceof Error ? error.message : String(error)
    }

    // 6. Probar función de empleados disponibles
    try {
      const disponiblesResult = await sql`SELECT * FROM get_empleados_disponibles() LIMIT 5`
      results.disponiblesResult = disponiblesResult
      console.log("Función disponibles exitosa:", disponiblesResult.length, "registros")
    } catch (error) {
      results.disponiblesResultError = error instanceof Error ? error.message : String(error)
    }

    return Response.json({
      message: "Diagnóstico completado",
      results: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in GET empleados/test:", error)
    return Response.json(
      {
        error: "Error en diagnóstico",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
} 