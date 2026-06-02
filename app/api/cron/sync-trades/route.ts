import { NextResponse } from 'next/server'
import { getWalletSettings, getLastTxSignature, updateLastTxSignature, createDraftTrade, findOpenBuyDraft, completeDraftWithSell } from '@/lib/db'
import { fetchRecentTransactions, parseHeliusSwap, fetchTokenInfo } from '@/lib/helius'

// Vercel Cron — appelé toutes les minutes via vercel.json
// Aussi appelable manuellement : GET /api/cron/sync-trades

export async function GET(req: Request) {
  // Vérification token cron (sécurité basique)
  // En prod Vercel envoie automatiquement Authorization: Bearer {CRON_SECRET}
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getWalletSettings()
    if (!settings?.wallet_address) {
      return NextResponse.json({ ok: false, error: 'No wallet configured' }, { status: 400 })
    }

    const walletAddress = settings.wallet_address
    const lastSignature = await getLastTxSignature()

    // Récupérer les transactions récentes
    const transactions = await fetchRecentTransactions(walletAddress, lastSignature)

    if (transactions.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, newLastSignature: lastSignature })
    }

    // Traiter du plus ANCIEN au plus récent pour que le BUY soit créé avant le SELL
    const ordered = [...transactions].reverse()

    let processed = 0

    for (const tx of ordered) {
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
              swap.amountSol,
              swap.feeSol,
              swap.txSignature,
            )
            processed++
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
        // Ignorer les doublons (contrainte unique sur tx_signature)
        if (msg.includes('unique') || msg.includes('duplicate')) continue
        console.error('[cron/sync-trades] Erreur tx', tx.signature, err)
      }
    }

    // Mettre à jour la dernière signature traitée (la plus récente = index 0 du tableau original)
    const newLastSignature = transactions[0].signature
    await updateLastTxSignature(newLastSignature)

    return NextResponse.json({ ok: true, processed, newLastSignature })

  } catch (err) {
    console.error('[GET /api/cron/sync-trades]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
