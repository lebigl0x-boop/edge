'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DraftTrade {
  id: number
  token: string
  token_address: string | null
  date: string
  heure_entree: string
  taille: number | null
  market_cap_entree: number | null
  market_cap_sortie: number | null
  pnl_sol: number | null
  tx_signature: string | null
  created_at: string
}

function fmtMC(kUsd: number | null): string {
  if (kUsd === null || kUsd === undefined) return '—'
  if (kUsd >= 1000) return `${(kUsd / 1000).toFixed(1)}M`
  return `${kUsd.toFixed(0)}k`
}

function fmtSol(n: number | null): string {
  if (n === null || n === undefined || n === 0) return '—'
  return `${n.toFixed(3)} SOL`
}

function guessDirection(trade: DraftTrade): 'buy' | 'sell' | null {
  if ((trade.taille ?? 0) > 0 && trade.market_cap_entree !== null) return 'buy'
  if (trade.market_cap_sortie !== null) return 'sell'
  return null
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [rejecting, setRejecting] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/drafts')
      .then(r => r.json())
      .then((d: DraftTrade[]) => setDrafts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleReject(id: number) {
    if (!confirm('Rejeter ce draft trade ?')) return
    setRejecting(id)
    try {
      await fetch(`/api/drafts?id=${id}`, { method: 'DELETE' })
      setDrafts(prev => prev.filter(d => d.id !== id))
    } catch {
      // ignore
    } finally {
      setRejecting(null)
    }
  }

  return (
    <div style={{ padding: '28px 24px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Drafts
            {drafts.length > 0 && (
              <span style={{
                marginLeft: 10, fontSize: 12, fontWeight: 600,
                background: 'oklch(0.78 0.14 70 / 0.12)',
                border: '1px solid oklch(0.78 0.14 70 / 0.25)',
                color: 'var(--amber)',
                borderRadius: 99, padding: '2px 9px',
                verticalAlign: 'middle',
              }}>
                {drafts.length}
              </span>
            )}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Trades importés automatiquement · à valider ou rejeter</p>
        </div>
        <Link href="/" style={{ color: 'var(--text-3)', fontSize: 12, textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px' }}>
          ← Dashboard
        </Link>
      </div>

      {loading && (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>Chargement…</div>
      )}

      {!loading && drafts.length === 0 && (
        <div style={{
          padding: 48, textAlign: 'center',
          background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Aucun draft</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
            Tous tes imports ont été traités.
          </div>
          <Link href="/settings" style={{ color: 'var(--accent)', fontSize: 12, textDecoration: 'none' }}>
            Configurer le wallet tracking →
          </Link>
        </div>
      )}

      {!loading && drafts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {drafts.map(draft => {
            const dir = guessDirection(draft)
            const dirColor = dir === 'buy' ? 'var(--green)' : dir === 'sell' ? 'var(--red)' : 'var(--text-3)'
            const dirBg = dir === 'buy' ? 'oklch(0.74 0.16 152 / 0.08)' : dir === 'sell' ? 'oklch(0.68 0.21 22 / 0.08)' : 'var(--surface-2)'
            const dirBorder = dir === 'buy' ? 'oklch(0.74 0.16 152 / 0.20)' : dir === 'sell' ? 'oklch(0.68 0.21 22 / 0.20)' : 'var(--border)'

            return (
              <div key={draft.id} style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>

                  {/* Direction badge */}
                  <div style={{
                    background: dirBg,
                    border: `1px solid ${dirBorder}`,
                    borderRadius: 6, padding: '4px 8px',
                    flexShrink: 0,
                  }}>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: dirColor, letterSpacing: '0.08em' }}>
                      {dir === 'buy' ? 'BUY' : dir === 'sell' ? 'SELL' : '?'}
                    </span>
                  </div>

                  {/* Token */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{draft.token}</span>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{draft.date} · {draft.heure_entree}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(draft.taille ?? 0) > 0 && (
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          Bid: <span style={{ color: 'var(--text-2)' }}>{fmtSol(draft.taille)}</span>
                        </span>
                      )}
                      {draft.market_cap_entree !== null && (
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          MC entry: <span style={{ color: 'var(--text-2)' }}>{fmtMC(draft.market_cap_entree)}</span>
                        </span>
                      )}
                      {draft.market_cap_sortie !== null && (
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          MC exit: <span style={{ color: 'var(--text-2)' }}>{fmtMC(draft.market_cap_sortie)}</span>
                        </span>
                      )}
                      {draft.pnl_sol !== null && draft.pnl_sol !== undefined && (
                        <span className="mono" style={{
                          fontSize: 12, fontWeight: 700,
                          color: draft.pnl_sol >= 0 ? 'var(--green)' : 'var(--red)',
                        }}>
                          {draft.pnl_sol >= 0 ? '+' : ''}{draft.pnl_sol.toFixed(3)} SOL
                        </span>
                      )}
                    </div>
                    {draft.tx_signature && (
                      <div style={{ marginTop: 3 }}>
                        <a
                          href={`https://solscan.io/tx/${draft.tx_signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono"
                          style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'none', opacity: 0.7 }}
                        >
                          {draft.tx_signature.slice(0, 20)}… ↗
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <Link
                      href={`/trade/${draft.id}/edit`}
                      style={{
                        background: 'var(--text)', color: 'var(--bg)',
                        border: 'none', borderRadius: 6,
                        padding: '7px 14px', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontFamily: 'inherit',
                      }}
                    >
                      Compléter →
                    </Link>
                    <button
                      onClick={() => handleReject(draft.id)}
                      disabled={rejecting === draft.id}
                      style={{
                        background: 'transparent',
                        color: 'var(--text-3)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        padding: '7px 12px', fontSize: 12,
                        cursor: rejecting === draft.id ? 'not-allowed' : 'pointer',
                        opacity: rejecting === draft.id ? 0.5 : 1,
                        fontFamily: 'inherit',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (rejecting !== draft.id) {
                          e.currentTarget.style.borderColor = 'oklch(0.68 0.21 22 / 0.4)'
                          e.currentTarget.style.color = 'var(--red)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.color = 'var(--text-3)'
                      }}
                    >
                      {rejecting === draft.id ? '…' : 'Rejeter'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && drafts.length > 0 && (
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-4)', textAlign: 'center' }}>
          "Compléter" ouvre le formulaire d&apos;édition complet · "Rejeter" supprime le draft définitivement
        </div>
      )}
    </div>
  )
}
