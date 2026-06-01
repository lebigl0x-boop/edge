import { NextResponse } from 'next/server'
import { getWalletSettings, createDraftTrade } from '@/lib/db'
import { parseHeliusSwap, fetchMarketCap, type HeliusTransaction } from '@/lib/helius'

export async function POST(req: Request) {
  try {
    const transactions: HeliusTransaction[] = await req.json()

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    const settings = await getWalletSettings()
    if (!settings?.wallet_address) {
      return NextResponse.json({ ok: false, error: 'No wallet configured' }, { status: 400 })
    }

    const walletAddress = settings.wallet_address
    let processed = 0

    for (const tx of transactions) {
      const swap = parseHeliusSwap(tx, walletAddress)
      if (!swap) continue

      // Fetch market cap en parallèle avec la création du draft
      const mc = await fetchMarketCap(swap.tokenMint)

      const date = new Date(swap.timestamp * 1000).toISOString().split('T')[0]
      const heure = new Date(swap.timestamp * 1000).toTimeString().slice(0, 5)

      try {
        await createDraftTrade({
          token: swap.tokenSymbol,
          token_address: swap.tokenMint,
          taille: swap.direction === 'buy' ? swap.amountSol : 0,
          market_cap_entree: swap.direction === 'buy' ? mc : null,
          market_cap_sortie: swap.direction === 'sell' ? mc : null,
          date,
          heure_entree: heure,
          tx_signature: swap.txSignature,
          direction: swap.direction,
        })
        processed++
      } catch (err: unknown) {
        // Contrainte unicité : tx déjà importée, on skip silencieusement
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('unique') || msg.includes('duplicate')) {
          continue
        }
        throw err
      }
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('[POST /api/webhook/helius]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
