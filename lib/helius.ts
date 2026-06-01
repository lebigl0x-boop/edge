// Helius API helpers for webhook management and swap parsing

const SOL_MINT = 'So11111111111111111111111111111111111111112'

export interface SwapInfo {
  txSignature: string
  tokenMint: string
  tokenSymbol: string
  amountSol: number      // SOL dépensé (buy) ou reçu (sell)
  direction: 'buy' | 'sell'
  timestamp: number       // unix timestamp
}

export interface HeliusTransaction {
  signature: string
  timestamp: number
  type: string
  tokenTransfers?: Array<{
    mint: string
    tokenAmount: number
    fromUserAccount?: string
    toUserAccount?: string
  }>
  nativeTransfers?: Array<{
    amount: number  // en lamports
    fromUserAccount: string
    toUserAccount: string
  }>
  source?: string
  description?: string
  feePayer?: string
  accountData?: Array<{
    account: string
    nativeBalanceChange: number
    tokenBalanceChanges: unknown[]
  }>
}

// ─── Webhook management ───────────────────────────────────────────────────────

export async function registerHeliusWebhook(walletAddress: string, webhookUrl: string): Promise<string> {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) throw new Error('HELIUS_API_KEY manquant dans .env.local')

  const res = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookURL: webhookUrl,
      transactionTypes: ['SWAP'],
      accountAddresses: [walletAddress],
      webhookType: 'enhanced',
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Helius registerWebhook failed: ${res.status} — ${body}`)
  }

  const data = await res.json() as { webhookID: string }
  return data.webhookID
}

export async function deleteHeliusWebhook(webhookId: string): Promise<void> {
  const apiKey = process.env.HELIUS_API_KEY
  if (!apiKey) throw new Error('HELIUS_API_KEY manquant dans .env.local')

  const res = await fetch(`https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${apiKey}`, {
    method: 'DELETE',
  })

  // 404 = déjà supprimé, on ignore
  if (!res.ok && res.status !== 404) {
    const body = await res.text()
    throw new Error(`Helius deleteWebhook failed: ${res.status} — ${body}`)
  }
}

// ─── Market Cap ───────────────────────────────────────────────────────────────

export async function fetchMarketCap(mintAddress: string): Promise<number | null> {
  // 1. Essai pump.fun
  try {
    const res = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
      headers: { 'User-Agent': 'edge-journal/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json() as { complete?: boolean; usd_market_cap?: number }
      if (data.usd_market_cap && data.usd_market_cap > 0) {
        // Retourner en k$ (comme le reste du projet)
        return data.usd_market_cap / 1000
      }
    }
  } catch {
    // Continue vers fallback
  }

  // 2. Fallback DexScreener
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const data = await res.json() as { pairs?: Array<{ fdv?: number }> }
      const fdv = data.pairs?.[0]?.fdv
      if (fdv && fdv > 0) {
        return fdv / 1000  // en k$
      }
    }
  } catch {
    // Les deux ont échoué
  }

  return null
}

// ─── Swap parsing ─────────────────────────────────────────────────────────────

export function parseHeliusSwap(tx: HeliusTransaction, walletAddress?: string): SwapInfo | null {
  if (tx.type !== 'SWAP') return null

  const tokenTransfers = tx.tokenTransfers ?? []
  const nativeTransfers = tx.nativeTransfers ?? []

  // Trouver le token non-SOL impliqué
  const nonSolTransfer = tokenTransfers.find(t => t.mint !== SOL_MINT)
  if (!nonSolTransfer) return null

  const tokenMint = nonSolTransfer.mint
  const tokenSymbol = tokenMint.slice(0, 6).toUpperCase()

  // Déterminer la direction via les nativeTransfers
  // Si le wallet envoie des SOL → buy, si le wallet reçoit des SOL → sell
  let solOut = 0  // SOL envoyés depuis le wallet
  let solIn = 0   // SOL reçus par le wallet

  for (const nt of nativeTransfers) {
    const amount = nt.amount / 1e9  // lamports → SOL
    if (walletAddress) {
      if (nt.fromUserAccount === walletAddress) solOut += amount
      if (nt.toUserAccount === walletAddress) solIn += amount
    } else {
      // Sans wallet connu : utiliser feePayer comme heuristique
      const fp = tx.feePayer
      if (fp && nt.fromUserAccount === fp) solOut += amount
      if (fp && nt.toUserAccount === fp) solIn += amount
    }
  }

  // Si on ne peut pas discriminer, utiliser la direction des tokenTransfers
  let direction: 'buy' | 'sell'
  let amountSol: number

  if (solOut > solIn) {
    direction = 'buy'
    amountSol = solOut - solIn
  } else if (solIn > solOut) {
    direction = 'sell'
    amountSol = solIn - solOut
  } else {
    // Fallback : si le wallet reçoit le token → buy
    if (walletAddress && nonSolTransfer.toUserAccount === walletAddress) {
      direction = 'buy'
    } else if (walletAddress && nonSolTransfer.fromUserAccount === walletAddress) {
      direction = 'sell'
    } else {
      return null  // Impossible de déterminer
    }
    amountSol = 0
  }

  // Ignorer les montants microscopiques (dust)
  if (direction === 'buy' && amountSol < 0.001) return null

  return {
    txSignature: tx.signature,
    tokenMint,
    tokenSymbol,
    amountSol,
    direction,
    timestamp: tx.timestamp,
  }
}
