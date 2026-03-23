import { NextRequest, NextResponse } from 'next/server'
import { getTradeById, deleteTrade } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trade = await getTradeById(Number(id))
    if (!trade) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteTrade(Number(id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
