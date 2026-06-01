import { NextResponse } from 'next/server'
import { getWalletSettings, upsertWalletSettings, initSchema } from '@/lib/db'
import { registerHeliusWebhook, deleteHeliusWebhook } from '@/lib/helius'

// Validation basique adresse Solana : base58, 32–44 chars
function isValidSolanaAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}

export async function GET() {
  try {
    await initSchema()
    const settings = await getWalletSettings()
    return NextResponse.json({
      walletAddress: settings?.wallet_address ?? null,
      webhookId: settings?.helius_webhook_id ?? null,
    })
  } catch (err) {
    console.error('[GET /api/settings/wallet]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await initSchema()
    const body = await req.json() as { walletAddress?: string }
    const walletAddress = body.walletAddress?.trim() ?? ''

    if (!isValidSolanaAddress(walletAddress)) {
      return NextResponse.json({ error: 'Adresse Solana invalide' }, { status: 400 })
    }

    // Supprimer l'ancien webhook si existant
    const existing = await getWalletSettings()
    if (existing?.helius_webhook_id) {
      try {
        await deleteHeliusWebhook(existing.helius_webhook_id)
      } catch (err) {
        console.warn('[settings/wallet] Impossible de supprimer l\'ancien webhook:', err)
      }
    }

    // Construire l'URL du webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_APP_URL manquant dans .env.local' }, { status: 500 })
    }
    const webhookUrl = `${appUrl}/api/webhook/helius`

    // Enregistrer le nouveau webhook Helius
    let webhookId: string | undefined
    try {
      webhookId = await registerHeliusWebhook(walletAddress, webhookUrl)
    } catch (err) {
      console.error('[settings/wallet] Échec enregistrement webhook Helius:', err)
      return NextResponse.json({
        error: 'Impossible de créer le webhook Helius. Vérifie ta HELIUS_API_KEY.',
      }, { status: 502 })
    }

    await upsertWalletSettings(walletAddress, webhookId)

    return NextResponse.json({ ok: true, walletAddress, webhookId })
  } catch (err) {
    console.error('[POST /api/settings/wallet]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const existing = await getWalletSettings()
    if (existing?.helius_webhook_id) {
      await deleteHeliusWebhook(existing.helius_webhook_id)
    }
    if (existing) {
      await upsertWalletSettings('', undefined)
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/settings/wallet]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
