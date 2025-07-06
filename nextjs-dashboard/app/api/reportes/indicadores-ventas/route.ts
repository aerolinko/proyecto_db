import { NextRequest, NextResponse } from "next/server"
import sql from "@/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    let result
    if (fechaInicio || fechaFin) {
      result = await sql`SELECT obtener_indicadores_ventas(${fechaInicio}, ${fechaFin}) as resultado`
    } else {
      result = await sql`SELECT obtener_indicadores_ventas() as resultado`
    }

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se encontraron datos" },
        { status: 404 }
      )
    }

    const data = result[0].resultado

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error("Error al obtener indicadores de ventas:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
} 