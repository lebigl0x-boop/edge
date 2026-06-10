import { NextRequest, NextResponse } from 'next/server'
import { getChartData } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') ?? undefined
    const cycle = req.nextUrl.searchParams.get('cycle') ?? undefined
    const data = await getChartData(filter, cycle)
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
