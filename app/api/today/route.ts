import { NextRequest, NextResponse } from 'next/server'
import { getTodayStats, getCurrentCycle } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    // Par défaut : cycle courant (peut être surchargé via ?cycle=all)
    const cycleParam = req.nextUrl.searchParams.get('cycle')
    const cycle = cycleParam ?? await getCurrentCycle()
    const stats = await getTodayStats(cycle)
    return NextResponse.json(stats)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
