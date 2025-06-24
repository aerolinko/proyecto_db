import { NextRequest, NextResponse } from 'next/server'
import { getStockGeneral } from '@/db'

export async function GET(request: NextRequest) {
  try {
    const stock = await getStockGeneral()
    return NextResponse.json({ success: true, stock })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 })
  }
} 