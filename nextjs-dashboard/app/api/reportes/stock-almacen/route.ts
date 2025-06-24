import { NextRequest, NextResponse } from 'next/server'
import { getStockAlmacen } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const stock = await getStockAlmacen()
    return NextResponse.json({ success: true, stock })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
} 