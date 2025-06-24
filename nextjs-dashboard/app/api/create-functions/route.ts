import { NextRequest, NextResponse } from 'next/server'
import { createReportStoredProcedures } from '@/db'

export async function POST(request: NextRequest) {
  try {
    console.log("=== Creando funciones de base de datos ===")
    
    await createReportStoredProcedures()
    
    return NextResponse.json({ 
      success: true, 
      message: "✅ Todas las funciones han sido creadas exitosamente" 
    })
  } catch (error) {
    console.error("❌ Error creando funciones:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Error creando funciones",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 