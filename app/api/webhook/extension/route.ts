import { NextResponse } from 'next/server'
import { createDraftTrade, findOpenBuyDraft, completeDraftWithSell } from '@/lib/db'

interface ExtensionPayload {
  token_address: string
  direction: 'buy' | 'sell'
  amount_sol?: number | null
  mc_entry?: number | null
  symbol?: string | null
  timestamp?: number | null
  source_url?: string
  raw_request?: unknown
}

export async function POST(req: Request) {
  try {
    const body: ExtensionPayload = await req.json()

    const {
      token_address,
      direction,
      amount_sol,
      mc_entry,
      symbol,
      timestamp,
    } = body

    if (!token_address || !direction) {
      return NextResponse.json(
        { ok: false, error: 'token_address and direction are required' },
        { status: 400 }
      )
    }

    const ts = timestamp ? new Date(timestamp * 1000) : new Date()
    const date = ts.toISOString().split('T')[0]
    const heure = ts.toTimeString().slice(0, 5)

    const tokenLabel = symbol ?? token_address.slice(0, 8)
    const mcRounded = mc_entry !== null && mc_entry !== undefined
      ? Math.round(mc_entry * 100) / 100
      : null

    if (direction === 'sell') {
      const openBuy = await findOpenBuyDraft(token_address)

      if (openBuy) {
        await completeDraftWithSell(
          openBuy.id as number,
          mcRounded,
          amount_sol ?? 0,
          0,          // fees not available from extension
          `ext-${Date.now()}`,
        )
        return NextResponse.json({ ok: true, action: 'sell_completed', id: openBuy.id })
      }

      // No open buy draft — ignore the sell
      return NextResponse.json({ ok: true, action: 'sell_ignored', reason: 'no_open_buy' })
    }

    // BUY — create a new draft
    const id = await createDraftTrade({
      token: tokenLabel,
      token_address,
      taille: amount_sol ?? 0,
      fees_sol: 0,
      market_cap_entree: mcRounded,
      market_cap_sortie: null,
      date,
      heure_entree: heure,
      tx_signature: `ext-${Date.now()}`,
      direction: 'buy',
    })

    return NextResponse.json({ ok: true, action: 'buy_created', id })

  } catch (err) {
    console.error('[POST /api/webhook/extension]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
