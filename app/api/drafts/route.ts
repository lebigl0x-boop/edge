import { NextResponse } from 'next/server'
import { getDraftTrades, deleteTrade } from '@/lib/db'

export async function GET() {
  try {
    const drafts = await getDraftTrades()
    return NextResponse.json(drafts)
  } catch (err) {
    console.error('[GET /api/drafts]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = parseInt(searchParams.get('id') ?? '', 10)
    if (isNaN(id)) return NextResponse.json({ error: 'id invalide' }, { status: 400 })
    await deleteTrade(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/drafts]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
