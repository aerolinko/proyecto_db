import { NextRequest, NextResponse } from "next/server"
import { getTendenciaVentas } from "@/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    const data = await getTendenciaVentas(fechaInicio || undefined, fechaFin || undefined)

    return NextResponse.json({
      success: true,
      data: data
    })

  } catch (error) {
    console.error("Error al obtener tendencia de ventas:", error)
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