'use server'

import { NextResponse } from "next/server";
import { getIndicadoresClientes } from "@/db";

export async function GET(request: Request) {
  try {
    console.log("=== GET /api/reportes/indicadores-clientes ===")
    
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    
    console.log("Parámetros recibidos:", { fechaInicio, fechaFin });
    
    // Validar formato de fechas si se proporcionan
    if (fechaInicio && !isValidDate(fechaInicio)) {
      return NextResponse.json({ 
        error: 'Formato de fecha de inicio inválido. Use YYYY-MM-DD' 
      }, { status: 400 });
    }
    
    if (fechaFin && !isValidDate(fechaFin)) {
      return NextResponse.json({ 
        error: 'Formato de fecha de fin inválido. Use YYYY-MM-DD' 
      }, { status: 400 });
    }
    
    // Obtener los indicadores de clientes
    const indicadores = await getIndicadoresClientes(fechaInicio || undefined, fechaFin || undefined);
    
    console.log("Indicadores obtenidos exitosamente");
    
    return NextResponse.json({
      success: true,
      data: indicadores,
      message: "Indicadores de clientes obtenidos exitosamente"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error en GET /api/reportes/indicadores-clientes:", error);
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor al obtener indicadores de clientes",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

// Función auxiliar para validar formato de fecha
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
} 