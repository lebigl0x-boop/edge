import { NextRequest, NextResponse } from 'next/server'
import { getStats } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const filter = req.nextUrl.searchParams.get('filter') ?? undefined
    const stats = await getStats(filter)
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
