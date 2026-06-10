import { NextResponse } from 'next/server'
import { getRebuysForTrade, createRebuy } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const rebuys = await getRebuysForTrade(Number(id))
    return NextResponse.json(rebuys)
  } catch (err) {
    console.error('[GET /api/trades/[id]/rebuys]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json() as {
      mc_rebuy?: number
      taille_ajoutee?: number
      raison?: string
      note?: string
    }
    if (!body.mc_rebuy || !body.taille_ajoutee || !body.raison) {
      return NextResponse.json({ error: 'mc_rebuy, taille_ajoutee et raison sont requis' }, { status: 400 })
    }
    const rebuyId = await createRebuy(Number(id), {
      mc_rebuy: body.mc_rebuy,
      taille_ajoutee: body.taille_ajoutee,
      raison: body.raison,
      note: body.note,
    })
    return NextResponse.json({ id: rebuyId })
  } catch (err) {
    console.error('[POST /api/trades/[id]/rebuys]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
