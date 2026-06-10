import { NextRequest, NextResponse } from 'next/server'
import { getAdvancedStats } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') ?? undefined
    const cycle = req.nextUrl.searchParams.get('cycle') ?? undefined
    const stats = await getAdvancedStats(filter, cycle)
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
