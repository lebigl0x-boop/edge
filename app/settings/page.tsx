'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
  transition: 'border-color 0.15s',
  minWidth: 0,
}

function isValidSolana(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}

function truncate(addr: string, n = 8): string {
  if (addr.length <= n * 2 + 3) return addr
  return `${addr.slice(0, n)}...${addr.slice(-n)}`
}

export default function SettingsPage() {
  const [walletInput, setWalletInput] = useState('')
  const [currentWallet, setCurrentWallet] = useState<string | null>(null)
  const [webhookId, setWebhookId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(false)
  // Stack & tracking
  const [trackingEnabled, setTrackingEnabled] = useState(false)
  const [manualStack, setManualStack] = useState('')
  const [savingStack, setSavingStack] = useState(false)
  const [stackSuccess, setStackSuccess] = useState('')

  useEffect(() => {
    fetch('/api/settings/wallet')
      .then(r => r.json())
      .then((d: { walletAddress: string | null; webhookId: string | null; trackingEnabled: boolean; manualStack: number | null }) => {
        setCurrentWallet(d.walletAddress || null)
        setWebhookId(d.webhookId || null)
        if (d.walletAddress) setWalletInput(d.walletAddress)
        setTrackingEnabled(d.trackingEnabled ?? false)
        setManualStack(d.manualStack != null ? String(d.manualStack) : '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setError('')
    setSuccess('')
    if (!isValidSolana(walletInput.trim())) {
      setError('Adresse Solana invalide. Vérifie qu\'elle fait 32–44 caractères base58.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/settings/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletInput.trim() }),
      })
      const data = await res.json() as { ok?: boolean; error?: string; webhookId?: string; walletAddress?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Erreur lors de la configuration.')
      } else {
        setCurrentWallet(data.walletAddress ?? walletInput.trim())
        setWebhookId(data.webhookId ?? null)
        setSuccess('Webhook Helius configuré. Les trades seront importés automatiquement.')
      }
    } catch {
      setError('Erreur réseau.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    if (!confirm('Désactiver le tracking et supprimer le webhook ?')) return
    setRemoving(true)
    setError('')
    setSuccess('')
    try {
      await fetch('/api/settings/wallet', { method: 'DELETE' })
      setCurrentWallet(null)
      setWebhookId(null)
      setWalletInput('')
      setSuccess('Tracking désactivé.')
    } catch {
      setError('Erreur lors de la suppression.')
    } finally {
      setRemoving(false)
    }
  }

  async function handleSaveStack() {
    setSavingStack(true)
    setStackSuccess('')
    try {
      const stack = manualStack ? parseFloat(manualStack) : null
      await fetch('/api/settings/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingEnabled, manualStack: stack }),
      })
      setStackSuccess('Sauvegardé.')
      setTimeout(() => setStackSuccess(''), 2000)
    } finally {
      setSavingStack(false)
    }
  }

  const isActive = !!currentWallet && !!webhookId

  return (
    <div style={{ padding: '28px 24px 60px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Settings</h1>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Configuration du journal</p>
          </div>
          <Link href="/" style={{ color: 'var(--text-3)', fontSize: 12, textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px' }}>
            ← Retour
          </Link>
        </div>

        {/* Wallet tracking card */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}>

          {/* Card header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Auto-import des trades</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Via Helius Enhanced Webhooks</div>
            </div>
            {/* Status badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: isActive ? 'oklch(0.74 0.16 152 / 0.10)' : 'var(--surface-2)',
              border: `1px solid ${isActive ? 'oklch(0.74 0.16 152 / 0.25)' : 'var(--border)'}`,
              borderRadius: 99, padding: '4px 10px',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isActive ? 'var(--green)' : 'var(--text-4)',
                boxShadow: isActive ? '0 0 6px oklch(0.74 0.16 152 / 0.7)' : 'none',
              }} />
              <span className="mono" style={{ fontSize: 10, color: isActive ? 'var(--green)' : 'var(--text-3)', fontWeight: 600 }}>
                {isActive ? 'ACTIF' : 'INACTIF'}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '20px' }}>

            {loading ? (
              <div style={{ color: 'var(--text-4)', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>Chargement…</div>
            ) : (
              <>
                {/* Active status info */}
                {isActive && (
                  <div style={{
                    background: 'oklch(0.74 0.16 152 / 0.06)',
                    border: '1px solid oklch(0.74 0.16 152 / 0.15)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginBottom: 16,
                    display: 'flex', flexDirection: 'column', gap: 6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--green)', fontSize: 13 }}>✓</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Tracking actif</span>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {truncate(currentWallet!, 12)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Les swaps sont importés automatiquement dans Edge.
                    </div>
                  </div>
                )}

                {/* Wallet input */}
                <div style={{ marginBottom: 12 }}>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Adresse wallet publique
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={walletInput}
                      onChange={e => { setWalletInput(e.target.value); setError(''); setSuccess('') }}
                      placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving || !walletInput.trim()}
                      style={{
                        background: 'var(--text)', color: 'var(--bg)',
                        border: 'none', borderRadius: 8,
                        padding: '10px 16px', fontSize: 13, fontWeight: 600,
                        cursor: saving || !walletInput.trim() ? 'not-allowed' : 'pointer',
                        opacity: saving || !walletInput.trim() ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                        fontFamily: 'inherit',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {saving ? '…' : isActive ? 'Mettre à jour' : 'Activer'}
                    </button>
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <div style={{
                    background: 'oklch(0.68 0.21 22 / 0.08)',
                    border: '1px solid oklch(0.68 0.21 22 / 0.20)',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 12, color: 'var(--red)', marginBottom: 12,
                  }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{
                    background: 'oklch(0.74 0.16 152 / 0.08)',
                    border: '1px solid oklch(0.74 0.16 152 / 0.20)',
                    borderRadius: 8, padding: '10px 14px',
                    fontSize: 12, color: 'var(--green)', marginBottom: 12,
                  }}>
                    {success}
                  </div>
                )}

                {/* Webhook ID info */}
                {webhookId && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                      Helius Webhook ID
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-4)', wordBreak: 'break-all' }}>
                      {webhookId}
                    </div>
                  </div>
                )}

                {/* Remove button */}
                {isActive && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                    <button
                      onClick={handleRemove}
                      disabled={removing}
                      style={{
                        background: 'transparent', color: 'var(--red)',
                        border: '1px solid oklch(0.68 0.21 22 / 0.25)',
                        borderRadius: 6, padding: '6px 14px',
                        fontSize: 12, cursor: removing ? 'not-allowed' : 'pointer',
                        opacity: removing ? 0.5 : 1,
                        fontFamily: 'inherit',
                      }}
                    >
                      {removing ? 'Suppression…' : 'Désactiver le tracking'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Stack & Tracking */}
        <div style={{
          marginTop: 16,
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Stack & Sizing</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Référence pour le garde-fou de sizing (10 % du stack)</div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Toggle tracking */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Tracking wallet actif</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>
                  Récupère la balance via RPC Solana. Off par défaut.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingEnabled(v => !v)}
                style={{
                  width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: trackingEnabled ? 'var(--green)' : 'var(--surface-3)',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  position: 'absolute', top: 3, left: trackingEnabled ? 21 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'white', transition: 'left 0.2s',
                }} />
              </button>
            </div>

            {/* Stack manuel */}
            <div>
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                Stack actuel (SOL) — saisi manuellement
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" step="0.01" placeholder="ex. 12.50"
                  value={manualStack}
                  onChange={e => setManualStack(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleSaveStack}
                  disabled={savingStack}
                  style={{
                    background: 'var(--text)', color: 'var(--bg)',
                    border: 'none', borderRadius: 8,
                    padding: '10px 16px', fontSize: 13, fontWeight: 600,
                    cursor: savingStack ? 'not-allowed' : 'pointer',
                    opacity: savingStack ? 0.5 : 1,
                    whiteSpace: 'nowrap', fontFamily: 'inherit',
                  }}
                >
                  {savingStack ? '…' : 'Sauvegarder'}
                </button>
              </div>
              {stackSuccess && (
                <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>{stackSuccess}</div>
              )}
            </div>

          </div>
        </div>

        {/* Help note */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Comment ça marche
          </div>
          <ul style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7, paddingLeft: 16 }}>
            <li>Entre ton adresse wallet publique Solana</li>
            <li>Edge enregistre un webhook Helius pour détecter tes swaps</li>
            <li>Chaque swap crée un "draft trade" dans le journal</li>
            <li>Valide ou rejette chaque draft depuis <Link href="/drafts" style={{ color: 'var(--accent)', textDecoration: 'none' }}>la page drafts</Link></li>
          </ul>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-4)' }}>
            Nécessite : <span className="mono">HELIUS_API_KEY</span> + <span className="mono">NEXT_PUBLIC_APP_URL</span> dans <span className="mono">.env.local</span>
          </div>
        </div>

      </div>
    </div>
  )
}
