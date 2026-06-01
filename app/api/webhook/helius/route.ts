import { NextResponse } from 'next/server'
import { getWalletSettings, createDraftTrade, findOpenBuyDraft, completeDraftWithSell } from '@/lib/db'
import { parseHeliusSwap, fetchTokenInfo, type HeliusTransaction } from '@/lib/helius'

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

      const { mc, symbol } = await fetchTokenInfo(swap.tokenMint)
      const tokenName = symbol || swap.tokenSymbol
      const date = new Date(swap.timestamp * 1000).toISOString().split('T')[0]
      const heure = new Date(swap.timestamp * 1000).toTimeString().slice(0, 5)

      // Arrondir le MC à 2 décimales en k$
      const mcRounded = mc !== null ? Math.round(mc * 100) / 100 : null

      try {
        if (swap.direction === 'sell') {
          const openBuy = await findOpenBuyDraft(swap.tokenMint)

          if (openBuy) {
            await completeDraftWithSell(
              openBuy.id as number,
              mcRounded,
              swap.amountSol,  // SOL reçu sur ce sell
              swap.feeSol,
              swap.txSignature,
            )
            processed++
            continue
          }
          continue
        }

        // BUY → créer un nouveau draft
        await createDraftTrade({
          token: tokenName,
          token_address: swap.tokenMint,
          taille: swap.amountSol,
          fees_sol: swap.feeSol,
          market_cap_entree: mcRounded,
          market_cap_sortie: null,
          date,
          heure_entree: heure,
          tx_signature: swap.txSignature,
          direction: 'buy',
        })
        processed++

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('unique') || msg.includes('duplicate')) continue
        throw err
      }
    }

    return NextResponse.json({ ok: true, processed })
  } catch (err) {
    console.error('[POST /api/webhook/helius]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
