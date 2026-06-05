'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import PnlNumber from '@/components/ui/PnlNumber'
import NoteRich from '@/components/ui/NoteRich'
import { monoFont, tokens } from '@/components/ui/tokens'

function fmt(n: number | null, d = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(d)
}

function formatMC(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) { const m = n / 1_000_000; return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(2)}M` }
  if (n >= 1_000) { const k = n / 1_000; return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K` }
  return String(n)
}

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
      {children}
    </div>
  )
}

function MetaCard({ title, rows }: { title?: string; rows: [string, string, string?][] }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {title && (
        <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '12px 16px 8px' }}>
          {title}
        </div>
      )}
      {rows.map(([k, v, color], i) => (
        <div key={k} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '8px 16px', fontSize: 12,
          borderTop: (i === 0 && !title) ? 'none' : '1px solid var(--border)',
          fontFamily: monoFont,
        }}>
          <span style={{ color: 'var(--text-3)' }}>{k}</span>
          <span style={{
            color: color === 'green' ? 'var(--green)' : color === 'red' ? 'var(--red)' : color === 'amber' ? 'var(--amber)' : 'var(--text)',
            fontWeight: 600,
          }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function MCViz({ mcE, mcS }: { mcE: number; mcS: number }) {
  const pct = ((mcS - mcE) / mcE) * 100
  const pos = pct >= 0
  return (
    <div style={{ width: 200 }}>
      <div style={{ fontFamily: monoFont, fontSize: 10, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{formatMC(mcE * 1000)}</span>
        <span style={{ color: pos ? 'var(--green)' : 'var(--red)' }}>→ {formatMC(mcS * 1000)}</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-3)', borderRadius: 3, marginTop: 6, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '100%', background: `linear-gradient(90deg, var(--text-4), ${pos ? 'var(--green)' : 'var(--red)'})` }} />
      </div>
      <div style={{ fontFamily: monoFont, fontSize: 10, color: pos ? 'var(--green)' : 'var(--red)', marginTop: 4, textAlign: 'right' }}>
        {pos ? '+' : ''}{pct.toFixed(0)}%
      </div>
    </div>
  )
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
    return <div style={{ padding: '40px 24px', color: 'var(--text-4)' }}>Chargement…</div>
  }

  if (!trade) {
    return (
      <div style={{ padding: '40px 24px' }}>
        <p style={{ color: 'var(--red)', marginBottom: 16 }}>Trade introuvable.</p>
        <Link href="/" className="btn-ghost">← Retour</Link>
      </div>
    )
  }

  const pnl = trade.pnl_sol ?? 0
  const mcE = trade.market_cap_entree ? trade.market_cap_entree / 1000 : null
  const mcS = trade.market_cap_sortie ? trade.market_cap_sortie / 1000 : null

  const convColor = trade.entry_qualite === 'A' ? 'var(--green)' : trade.entry_qualite === 'B' ? 'var(--amber)' : trade.entry_qualite === 'C' ? 'var(--red)' : undefined
  const convLabel = trade.entry_qualite === 'A' ? 'Forte' : trade.entry_qualite === 'B' ? 'Moyenne' : trade.entry_qualite === 'C' ? 'Faible' : '—'

  const discRules = [
    { l: 'R1 Narrative', d: 'Comprise', ok: !!trade.r1_respectee },
    { l: 'R2 ATH cible', d: 'RR estimé', ok: !!trade.r2_respectee },
    { l: 'R4 SL −20%', d: 'Stop loss', ok: !!trade.r4_respectee },
  ]
  const discCount = discRules.filter(r => r.ok).length

  const infoRows: [string, string, string?][] = [
    ['Date', trade.date ?? '—'],
    ...(trade.heure_entree ? [['Heure', trade.heure_entree] as [string, string]] : []),
    ...(trade.meme_narrative ? [['Narrative', trade.meme_narrative] as [string, string]] : []),
    ['Conviction', `${trade.entry_qualite ?? '—'} · ${convLabel}`, (convColor ? (trade.entry_qualite === 'A' ? 'green' : trade.entry_qualite === 'B' ? 'amber' : 'red') : undefined) as string | undefined],
  ]

  const numberRows: [string, string, string?][] = [
    ...(mcE !== null ? [['MC entrée', `${formatMC(mcE * 1000)}`] as [string, string]] : []),
    ...(mcS !== null ? [['MC sortie', `${formatMC(mcS * 1000)}`] as [string, string]] : []),
    ...(mcE !== null && mcS !== null ? [['Multiple', `×${(mcS / mcE).toFixed(1)}`, (pnl >= 0 ? 'green' : 'red') as string | undefined] as [string, string, string?]] : []),
    ...(trade.taille !== null ? [['Taille', `${fmt(trade.taille)} SOL`] as [string, string]] : []),
    ['PnL net', `${pnl >= 0 ? '+' : ''}${fmt(pnl)} SOL`, (pnl > 0 ? 'green' : pnl < 0 ? 'red' : undefined) as string | undefined],
    ...(trade.pnl_percent !== null ? [['Perf', `${(trade.pnl_percent ?? 0) >= 0 ? '+' : ''}${fmt(trade.pnl_percent, 1)}%`, (pnl > 0 ? 'green' : pnl < 0 ? 'red' : undefined) as string | undefined] as [string, string, string?]] : []),
  ]

  const execRows: [string, string, string?][] = [
    ['Entry qualité', trade.entry_qualite ?? '—', (trade.entry_qualite === 'A' ? 'green' : trade.entry_qualite === 'B' ? 'amber' : 'red') as string | undefined],
    ['Exit qualité', trade.exit_qualite ?? '—', (trade.exit_qualite === 'A' ? 'green' : trade.exit_qualite === 'B' ? 'amber' : 'red') as string | undefined],
    ['SL touché', trade.sl_touche ? 'Oui' : 'Non', (trade.sl_touche ? 'red' : 'green') as string | undefined],
    ['Erreur', (!trade.erreur || trade.erreur === 'Aucune') ? 'Aucune' : (trade.erreur === 'Autre' && trade.erreur_autre ? trade.erreur_autre : trade.erreur) ?? '—', (!trade.erreur || trade.erreur === 'Aucune' ? 'green' : 'red') as string | undefined],
  ]

  return (
    <div style={{ padding: '20px 24px 48px' }}>

      {/* Breadcrumb nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Link href="/" className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}>
          ← All trades
        </Link>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
          trades / {trade.token}{trade.date ? ` / ${trade.date}` : ''}
        </span>
        <div style={{ flex: 1 }} />
        <Link href={`/trade/${id}/edit`} className="btn-ghost" style={{ fontSize: 12 }}>Modifier</Link>
        <button className="btn-danger" onClick={handleDelete} disabled={deleting} style={{ fontSize: 12 }}>
          {deleting ? '…' : 'Supprimer'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>

        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Hero */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>{trade.token}</h1>
              {trade.trade_aplus && (
                <span style={{ fontSize: 10, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '2px 7px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.06em' }}>A+</span>
              )}
              {trade.meme_narrative && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {trade.meme_narrative}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 32, alignItems: 'baseline', flexWrap: 'wrap' }}>
              <div>
                <MonoLabel>PnL</MonoLabel>
                <PnlNumber value={pnl} size="hero" />
              </div>
              {trade.pnl_percent != null && (
                <div>
                  <MonoLabel>Perf</MonoLabel>
                  <PnlNumber value={trade.pnl_percent} size="hero" unit="%" />
                </div>
              )}
              {mcE !== null && mcS !== null && (
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <MCViz mcE={mcE} mcS={mcS} />
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          {trade.bien_fait && (
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
              <MonoLabel>Note</MonoLabel>
              <div style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text)' }}>
                <NoteRich value={trade.bien_fait} />
              </div>
              {/* Extract tags/mentions */}
              {(() => {
                const tags = (trade.bien_fait.match(/#\S+/g) ?? [])
                const mentions = (trade.bien_fait.match(/@\S+/g) ?? [])
                const all = [...new Set([...tags, ...mentions])]
                if (all.length === 0) return null
                return (
                  <div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {all.map(t => (
                      <span key={t} className="mono" style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 99,
                        background: t.startsWith('#') ? tokens.accentSoft : tokens.violetSoft,
                        color: t.startsWith('#') ? 'var(--accent)' : 'var(--violet)',
                      }}>{t}</span>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Discipline checklist */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px' }}>
            <MonoLabel>Discipline · {discCount}/3 {discCount === 3 ? '✓' : ''}</MonoLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {discRules.map(r => (
                <div key={r.l} style={{
                  background: r.ok ? 'oklch(0.74 0.16 152 / 0.06)' : 'oklch(0.68 0.21 22 / 0.06)',
                  border: `1px solid ${r.ok ? 'oklch(0.74 0.16 152 / 0.18)' : 'oklch(0.68 0.21 22 / 0.18)'}`,
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{r.l}</span>
                    <span style={{ color: r.ok ? 'var(--green)' : 'var(--red)', fontSize: 14 }}>{r.ok ? '✓' : '✗'}</span>
                  </div>
                  <span style={{ fontFamily: monoFont, fontSize: 10, color: 'var(--text-3)' }}>{r.d}</span>
                </div>
              ))}
            </div>

            {/* Extra flags */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {[
                { l: 'SL touché', v: trade.sl_touche },
                { l: 'Coupé au bon moment', v: trade.coupe_bon_moment },
                { l: 'Coin lent', v: trade.coin_lent },
              ].map(f => (
                <span key={f.l} style={{
                  fontFamily: monoFont,
                  fontSize: 10, padding: '3px 9px', borderRadius: 99,
                  background: f.v ? 'var(--green-soft)' : 'var(--surface-2)',
                  color: f.v ? 'var(--green)' : 'var(--text-4)',
                  border: `1px solid ${f.v ? 'oklch(0.74 0.16 152 / 0.25)' : 'var(--border)'}`,
                }}>
                  {f.v ? '✓' : '✗'} {f.l}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar — meta cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MetaCard rows={infoRows} />
          <MetaCard title="Numbers" rows={numberRows} />
          <MetaCard title="Exécution" rows={execRows} />
        </div>

      </div>
    </div>
  )
}
