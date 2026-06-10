import { NextResponse } from 'next/server'
import { getIncompleteTrades } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cycle = searchParams.get('cycle') ?? 'cycle-1'
    const trades = await getIncompleteTrades(cycle)
    return NextResponse.json(trades)
  } catch (err) {
    console.error('[GET /api/incomplete]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
