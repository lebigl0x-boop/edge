'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Trade } from '@/types/trade'

function fmt(n: number | null, d = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(d)
}

function formatMC(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`
  }
  return `$${n}`
}

function Bool({ val, labelYes = 'Oui', labelNo = 'Non' }: { val: boolean | number | null; labelYes?: string; labelNo?: string }) {
  const v = Boolean(val)
  return <span className={`badge ${v ? 'badge-yes' : 'badge-no'}`}>{v ? labelYes : labelNo}</span>
}

function Kv({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="kv-row">
      <span className="kv-key">{label}</span>
      <span style={{ fontWeight: 500 }}>{children}</span>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function ConvictionBadge({ val }: { val: string | null }) {
  if (!val) return <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
  const map: Record<string, { label: string; color: string }> = {
    A: { label: 'Forte', color: '#30d158' },
    B: { label: 'Moyenne', color: '#ff9f0a' },
    C: { label: 'Faible', color: '#ff453a' },
  }
  const m = map[val]
  if (!m) return <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
  return <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
}

function MarcheLabel({ val }: { val: string | null }) {
  const v = val?.toLowerCase()
  if (v === 'bull') return <span style={{ color: '#30d158' }}>Bull</span>
  if (v === 'neutre') return <span style={{ color: '#ff9f0a' }}>Neutre</span>
  if (v === 'mort') return <span style={{ color: '#ff453a' }}>Mort</span>
  return <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
}

export default function TradePage() {
  const { id } = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then(r => r.json())
      .then(t => { setTrade(t); setLoading(false) })
  }, [id])

  async function handleDelete() {
    if (!confirm(`Supprimer le trade ${trade?.token} ?`)) return
    setDeleting(true)
    await fetch(`/api/trades/${id}`, { method: 'DELETE' })
    router.push('/')
  }

  if (loading) {
    return <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>Chargement...</div>
  }

  if (!trade) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
        <p style={{ color: '#ff453a', marginBottom: 16 }}>Trade introuvable.</p>
        <Link href="/" className="btn-ghost">← Retour</Link>
      </div>
    )
  }

  const pnl = trade.pnl_sol ?? 0
  const pnlColor = pnl > 0 ? '#30d158' : pnl < 0 ? '#ff453a' : 'rgba(255,255,255,0.4)'

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" className="btn-ghost">← Retour</Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
              {trade.token}
              {trade.trade_aplus ? <span style={{ fontSize: 16 }}>⭐</span> : null}
            </h1>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: 2 }}>
              {trade.date}{trade.heure_entree ? ` · ${trade.heure_entree}` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/trade/${id}/edit`} className="btn-ghost">Modifier</Link>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '...' : 'Supprimer'}
          </button>
        </div>
      </div>

      {/* Hero PnL */}
      <div className="card" style={{ padding: 28, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>PnL</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: pnlColor, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
              {pnl > 0 ? '+' : ''}{fmt(trade.pnl_sol)} SOL
            </div>
            {trade.pnl_percent != null && (
              <div style={{ fontSize: '1.1rem', color: pnlColor, marginTop: 4, fontWeight: 600 }}>
                {(trade.pnl_percent ?? 0) > 0 ? '+' : ''}{fmt(trade.pnl_percent, 1)}%
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingTop: 4 }}>
            {trade.taille != null && (
              <MetaItem label="Taille" value={`${fmt(trade.taille)} SOL`} />
            )}
            {trade.market_cap_entree != null && trade.market_cap_sortie != null ? (
              <MetaItem
                label="MC"
                value={`${formatMC(trade.market_cap_entree)} → ${formatMC(trade.market_cap_sortie)}`}
              />
            ) : (
              <>
                <MetaItem label="MC Entrée" value={formatMC(trade.market_cap_entree)} />
                <MetaItem label="MC Sortie" value={formatMC(trade.market_cap_sortie)} />
              </>
            )}
            {trade.type_trade && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Type</div>
                <span className="badge" style={{ background: 'rgba(10,132,255,0.12)', color: '#0a84ff' }}>{trade.type_trade}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>

        <Block title="L'Edge">
          {trade.meme_narrative && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Narrative</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{trade.meme_narrative}</div>
            </div>
          )}
          <Kv label="Conviction"><ConvictionBadge val={trade.entry_qualite} /></Kv>
          <Kv label="Marché"><MarcheLabel val={trade.marche_global} /></Kv>
        </Block>

        <Block title="Discipline">
          <Kv label="R1 — Narrative"><Bool val={trade.r1_respectee} /></Kv>
          <Kv label="R2 — ATH estimé"><Bool val={trade.r2_respectee} /></Kv>
          <Kv label="R3 — Capital libéré"><Bool val={trade.r3_respectee} /></Kv>
          <Kv label="R4 — SL respecté"><Bool val={trade.r4_respectee} /></Kv>
        </Block>

        <Block title="Gestion">
          <Kv label="SL touché"><Bool val={trade.sl_touche} labelYes="Oui" labelNo="Non" /></Kv>
          <Kv label="Coupé au bon moment"><Bool val={trade.coupe_bon_moment} /></Kv>
          <Kv label="Coin lent"><Bool val={trade.coin_lent} /></Kv>
        </Block>

        <Block title="Review">
          <Kv label="Trade A+"><Bool val={trade.trade_aplus} /></Kv>
          <div style={{ marginTop: 12 }}>
            {trade.erreur && trade.erreur !== 'Aucune' ? (
              <span className="badge badge-no" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
                {trade.erreur === 'Autre' && trade.erreur_autre ? trade.erreur_autre : trade.erreur}
              </span>
            ) : (
              <span style={{ color: '#30d158', fontSize: '0.875rem', fontWeight: 500 }}>✓ Aucune erreur</span>
            )}
          </div>
        </Block>
      </div>

      {trade.bien_fait && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
            Note
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{trade.bien_fait}</div>
        </div>
      )}
    </div>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  )
}
