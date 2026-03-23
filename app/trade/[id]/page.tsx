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
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function Bool({ val }: { val: boolean | number | null }) {
  const v = Boolean(val)
  return <span className={`badge ${v ? 'badge-yes' : 'badge-no'}`}>{v ? 'Oui' : 'Non'}</span>
}

function QBadge({ val }: { val: string | null }) {
  if (!val) return <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>
  return <span className={`badge badge-${val}`}>{val}</span>
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

function MarcheLabel({ val }: { val: string | null }) {
  if (val === 'bull') return <span style={{ color: '#30d158' }}>🔥 Bull actif</span>
  if (val === 'neutre') return <span style={{ color: '#ff9f0a' }}>😐 Neutre</span>
  if (val === 'mort') return <span style={{ color: '#ff453a' }}>❄️ Mort</span>
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
        <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? '...' : 'Supprimer'}
        </button>
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
            <MetaItem label="MC Entrée" value={formatMC(trade.market_cap_entree)} />
            <MetaItem label="MC Sortie" value={formatMC(trade.market_cap_sortie)} />
            {trade.type_trade && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>Type</div>
                <span className="badge" style={{ background: 'rgba(10,132,255,0.12)', color: '#0a84ff' }}>{trade.type_trade}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid de blocs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>

        <Block title="Contexte & Setup">
          {trade.meme_narrative && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Narrative</div>
              <div style={{ fontSize: '0.875rem' }}>{trade.meme_narrative}</div>
            </div>
          )}
          {trade.pourquoi_pump && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>Pourquoi pump</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.85)' }}>{trade.pourquoi_pump}</div>
            </div>
          )}
          <Kv label="Clarté">{trade.clarte ? `${trade.clarte}/5` : '—'}</Kv>
          <Kv label="MC Cible">{formatMC(trade.mc_cible)}</Kv>
          <Kv label="RR Estimé">{trade.rr_estime ? `${fmt(trade.rr_estime, 1)}x` : '—'}</Kv>
          <Kv label="Validé avant entrée"><Bool val={trade.valide_avant_entree} /></Kv>
        </Block>

        <Block title="Exécution">
          <Kv label="Entry qualité"><QBadge val={trade.entry_qualite} /></Kv>
          <Kv label="Exit qualité"><QBadge val={trade.exit_qualite} /></Kv>
          <Kv label="Slippage">
            {trade.slippage ? (
              <span style={{
                color: trade.slippage === 'faible' ? '#30d158' : trade.slippage === 'élevé' ? '#ff453a' : '#ff9f0a',
                fontWeight: 600
              }}>{trade.slippage}</span>
            ) : '—'}
          </Kv>
        </Block>

        <Block title="Discipline">
          <Kv label="R1"><Bool val={trade.r1_respectee} /></Kv>
          <Kv label="R2"><Bool val={trade.r2_respectee} /></Kv>
          <Kv label="R3"><Bool val={trade.r3_respectee} /></Kv>
          <Kv label="R4"><Bool val={trade.r4_respectee} /></Kv>
        </Block>

        <Block title="Gestion">
          <Kv label="SL touché"><Bool val={trade.sl_touche} /></Kv>
          <Kv label="Coupé au bon moment"><Bool val={trade.coupe_bon_moment} /></Kv>
          <Kv label="Coin lent"><Bool val={trade.coin_lent} /></Kv>
          <Kv label="Capital libéré"><Bool val={trade.capital_libere} /></Kv>
        </Block>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <Block title="Erreur">
          {trade.erreur ? (
            <span className="badge badge-no" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>
              {trade.erreur === 'Autre' && trade.erreur_autre ? trade.erreur_autre : trade.erreur}
            </span>
          ) : (
            <span style={{ color: '#30d158', fontSize: '0.875rem', fontWeight: 500 }}>✓ Aucune erreur</span>
          )}
        </Block>

        <Block title="Qualité">
          <Kv label="Trade A+"><Bool val={trade.trade_aplus} /></Kv>
          <Kv label="Devait être pris"><Bool val={trade.devait_etre_pris} /></Kv>
        </Block>
      </div>

      <Block title="Contexte marché">
        <Kv label="Marché global"><MarcheLabel val={trade.marche_global} /></Kv>
        {trade.narrative_dominante && (
          <Kv label="Narrative dominante">{trade.narrative_dominante}</Kv>
        )}
      </Block>

      {(trade.bien_fait || trade.ameliorer) && (
        <div className="card" style={{ padding: 20, marginTop: 10 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Note rapide
          </div>
          {trade.bien_fait && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#30d158', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>✓ Bien fait</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{trade.bien_fait}</div>
            </div>
          )}
          {trade.ameliorer && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ff9f0a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>⚠ À améliorer</div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>{trade.ameliorer}</div>
            </div>
          )}
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
