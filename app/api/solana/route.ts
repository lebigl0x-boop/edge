import { NextRequest, NextResponse } from 'next/server'

// Proxy côté serveur pour éviter les restrictions CORS du RPC Solana
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address) return NextResponse.json({ error: 'address manquant' }, { status: 400 })

  const rpc = process.env.SOLANA_RPC_URL ?? 'https://api.mainnet-beta.solana.com'

  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    })
    const data = await res.json() as { result?: { value?: number }; error?: unknown }
    if (data.result?.value === undefined) {
      return NextResponse.json({ error: 'Adresse invalide ou RPC indisponible' }, { status: 400 })
    }
    const sol = data.result.value / 1_000_000_000
    return NextResponse.json({ sol, lamports: data.result.value })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
