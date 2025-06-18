import type { NextRequest } from "next/server"

async function findEmpleadoTable(sql: any) {
  const tablesFound = await sql`
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE tablename ILIKE 'empleado'
    ORDER BY schemaname
  `

  if (tablesFound.length === 0) {
    throw new Error("Tabla 'empleado' no encontrada")
  }

  const tableSchema = tablesFound[0].schemaname
  const tableName = tablesFound[0].tablename
  const schemaTable = tableSchema === "public" ? tableName : `${tableSchema}.${tableName}`

  return { tableSchema, tableName, schemaTable }
}

export async function GET(request: NextRequest) {
  let sql: any = null

  try {
    console.log("=== INICIO GET /api/empleados ===")

    const postgres = (await import("postgres")).default
    sql = postgres({
      host: "localhost",
      port: 5432,
      database: "postgres",
      username: "postgres",
      password: "1602",
      max: 5,
      idle_timeout: 10,
      connect_timeout: 5,
    })

    // Encontrar la tabla empleado
    const { schemaTable } = await findEmpleadoTable(sql)
    console.log("Usando tabla empleado:", schemaTable)

    // Obtener todos los empleados
    const empleados = await sql`
      SELECT 
        empleado_id::text as id,
        cedula,
        primer_nombre,
        primer_apellido,
        segundo_nombre,
        segundo_apellido,
        direccion,
        fecha_contrato,
        fk_lugar,
        CONCAT(primer_nombre, ' ', primer_apellido) as nombre_completo,
        CONCAT(primer_nombre, ' ', COALESCE(segundo_nombre, ''), ' ', primer_apellido, ' ', COALESCE(segundo_apellido, '')) as nombre_completo_full
      FROM ${sql(schemaTable)}
      ORDER BY primer_nombre, primer_apellido
    `

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
  } finally {
    if (sql) {
      try {
        await sql.end()
      } catch (closeError) {
        console.error("Error cerrando conexión:", closeError)
      }
    }
  }
}
