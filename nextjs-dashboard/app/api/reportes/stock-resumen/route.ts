import { NextRequest, NextResponse } from 'next/server'
import { getStockAlmacen, getStockAnaquel, getStockGeneral } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const [almacen, anaquel, general] = await Promise.all([
      getStockAlmacen(),
      getStockAnaquel(),
      getStockGeneral()
    ])
    return NextResponse.json({ success: true, almacen, anaquel, general })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
} 