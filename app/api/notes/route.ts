import { NextRequest, NextResponse } from 'next/server'
import { getDailyNotes, upsertDailyNote } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from') ?? ''
    const to = req.nextUrl.searchParams.get('to') ?? ''
    if (!from || !to) return NextResponse.json({ error: 'from and to required' }, { status: 400 })
    const notes = await getDailyNotes(from, to)
    return NextResponse.json(notes)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { date, note } = await req.json()
    if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })
    await upsertDailyNote(date, note ?? '')
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
