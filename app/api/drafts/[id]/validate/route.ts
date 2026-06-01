import { NextResponse } from 'next/server'
import { validateDraft } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr, 10)
    if (isNaN(id)) return NextResponse.json({ error: 'id invalide' }, { status: 400 })

    const updates = await req.json() as Record<string, unknown>
    await validateDraft(id, updates)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[POST /api/drafts/[id]/validate]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
