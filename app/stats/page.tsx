'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { AdvancedStats } from '@/lib/db'
import { pnlColor, monoFont } from '@/components/ui/tokens'

function fmt(n: number | null | undefined, d = 2) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return n.toFixed(d)
}

function fmtPnl(n: number | null | undefined) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(3)}`
}

const monoStyle: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" }

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid var(--border)',
        fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

function StatRow({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '8px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>{sub}</span>}
      </div>
      <span style={{ ...monoStyle, fontSize: 14, fontWeight: 700, color: color ?? 'var(--text)' }}>
        {value}
      </span>
    </div>
  )
}

type Period = 'week' | 'month' | 'all'
type CycleFilter = 'cycle-1' | 'v1-historique' | 'all'

const CYCLE_OPTIONS: { key: CycleFilter; label: string }[] = [
  { key: 'cycle-1', label: 'Cycle 1' },
  { key: 'v1-historique', label: 'Historique v1' },
  { key: 'all', label: 'Tous' },
]

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [cycle, setCycle] = useState<CycleFilter>('cycle-1')
  const [stats, setStats] = useState<AdvancedStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setStats(null)
    const qs = new URLSearchParams()
    if (period !== 'all') qs.set('filter', period)
    if (cycle !== 'all') qs.set('cycle', cycle)
    const q = qs.toString() ? `?${qs}` : ''
    fetch(`/api/stats/advanced${q}`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period, cycle])

  const periodLabel = period === 'week' ? '7 jours' : period === 'month' ? '30 jours' : 'Tout'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Stats avancées</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Analyse comportementale · v2</p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Cycle */}
          <div style={{ display: 'flex', gap: 3, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 7, padding: 3 }}>
            {CYCLE_OPTIONS.map(c => (
              <button key={c.key} onClick={() => setCycle(c.key)} style={{
                background: cycle === c.key ? 'var(--surface-3)' : 'transparent',
                color: cycle === c.key ? 'var(--text)' : 'var(--text-3)',
                border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              }}>{c.label}</button>
            ))}
          </div>
          {/* Période */}
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              background: period === p ? 'var(--surface-3)' : 'var(--surface-1)',
              color: period === p ? 'var(--text)' : 'var(--text-3)',
              border: `1px solid ${period === p ? 'var(--border-strong)' : 'var(--border)'}`,
              borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
            }}>
              {p === 'week' ? '7D' : p === 'month' ? '30D' : 'ALL'}
            </button>
          ))}
          <Link href="/" style={{
            fontSize: 12, color: 'var(--text-3)', textDecoration: 'none',
            border: '1px solid var(--border)', borderRadius: 6, padding: '5px 12px',
          }}>← Dashboard</Link>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-4)' }}>Chargement…</div>
      )}

      {!loading && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Taux de complétion */}
          {stats.totalTrades > 0 && (
            <div style={{
              padding: '12px 18px',
              background: stats.completionRate >= 100 ? 'oklch(0.74 0.16 152 / 0.06)' : 'oklch(0.78 0.14 70 / 0.06)',
              border: `1px solid ${stats.completionRate >= 100 ? 'oklch(0.74 0.16 152 / 0.2)' : 'oklch(0.78 0.14 70 / 0.2)'}`,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Complétion pré-trade</span>
              <span style={{
                ...monoStyle, fontSize: 15, fontWeight: 700,
                color: stats.completionRate >= 100 ? 'var(--green)' : 'var(--amber)',
              }}>
                {stats.tradesAvecPreTrade}/{stats.totalTrades} trades ({fmt(stats.completionRate, 0)}%)
              </span>
              {stats.completionRate < 100 && (
                <span style={{ fontSize: 11, color: 'var(--amber)' }}>
                  — {stats.totalTrades - stats.tradesAvecPreTrade} trade(s) sans plan pré-trade
                </span>
              )}
            </div>
          )}

          {/* Respect du plan — la stat la plus importante */}
          <Card title="Discipline plan de sortie">
            {stats.tradesAvecPlan === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-4)', padding: '8px 0' }}>
                Aucun trade avec champ &quot;Vente dans le plan&quot; renseigné sur {periodLabel}.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Dans le plan', data: { count: stats.tradesDansPlan, pnl: stats.pnlDansPlan, wr: stats.winrateDansPlan }, color: 'var(--green)', icon: '✓' },
                  { label: 'Hors plan', data: { count: stats.tradesHorsPlan, pnl: stats.pnlHorsPlan, wr: stats.winrateHorsPlan }, color: 'var(--red)', icon: '✗' },
                ].map(({ label, data, color, icon }) => (
                  <div key={label} style={{
                    padding: '16px', borderRadius: 12,
                    background: `color-mix(in oklch, ${color} 8%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${color} 22%, transparent)`,
                  }}>
                    <div style={{ fontSize: 11, color, fontWeight: 700, marginBottom: 10, letterSpacing: '0.08em' }}>
                      {icon} {label} · {data.count} trade{data.count > 1 ? 's' : ''}
                    </div>
                    <div style={{ ...monoStyle, fontSize: 22, fontWeight: 800, color: pnlColor(data.pnl), marginBottom: 4 }}>
                      {fmtPnl(data.pnl)}
                      <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>SOL</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Winrate : <span style={{ color, fontWeight: 600 }}>{fmt(data.wr, 0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coût des sorties prématurées */}
            {stats.nbSortiesPrematurees > 0 && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 10,
                background: 'oklch(0.78 0.14 70 / 0.06)',
                border: '1px solid oklch(0.78 0.14 70 / 0.20)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                  Gains laissés sur la table (ATH constaté &gt; MC sortie)
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                  <span style={{ ...monoStyle, fontSize: 20, fontWeight: 700, color: 'var(--amber)' }}>
                    −{Math.abs(stats.coutSortiesPrematurees).toFixed(3)} SOL
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    sur {stats.nbSortiesPrematurees} trade{stats.nbSortiesPrematurees > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Par conviction */}
          {stats.parConviction.length > 0 && (
            <Card title="Par conviction">
              {stats.parConviction.map(c => (
                <div key={c.conviction} style={{
                  display: 'grid', gridTemplateColumns: '90px 40px 1fr 100px',
                  gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: c.conviction === 'Forte' ? 'var(--green)' : c.conviction === 'Moyenne' ? 'var(--amber)' : 'var(--red)',
                  }}>{c.conviction}</span>
                  <span style={{ ...monoStyle, fontSize: 11, color: 'var(--text-3)' }}>{c.count}t</span>
                  <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 99 }}>
                    <div style={{
                      height: '100%', width: `${c.winrate}%`,
                      background: c.winrate >= 50 ? 'var(--green)' : 'var(--amber)',
                      borderRadius: 99,
                    }} />
                  </div>
                  <span style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: pnlColor(c.pnl), textAlign: 'right' }}>
                    {fmtPnl(c.pnl)}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 3 }}>SOL</span>
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Par narrative */}
          {stats.parNarrative.length > 0 && (
            <Card title="Par narrative">
              {stats.parNarrative.map(n => (
                <div key={n.narrative} style={{
                  display: 'grid', gridTemplateColumns: '1fr 40px 60px 100px',
                  gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{n.narrative}</span>
                  <span style={{ ...monoStyle, fontSize: 11, color: 'var(--text-3)' }}>{n.count}t</span>
                  <span style={{ ...monoStyle, fontSize: 11, color: 'var(--text-3)' }}>{fmt(n.winrate, 0)}%</span>
                  <span style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: pnlColor(n.pnl), textAlign: 'right' }}>
                    {fmtPnl(n.pnl)}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 3 }}>SOL</span>
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Par MC d'entrée */}
          {stats.parMcRange.length > 0 && (
            <Card title="Par MC d'entrée">
              {stats.parMcRange.map(r => (
                <div key={r.range} style={{
                  display: 'grid', gridTemplateColumns: '80px 40px 1fr 100px',
                  gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}>
                  <span style={{ ...monoStyle, fontSize: 12, color: 'var(--accent)' }}>{r.range}</span>
                  <span style={{ ...monoStyle, fontSize: 11, color: 'var(--text-3)' }}>{r.count}t</span>
                  <div>
                    <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${r.winrate}%`,
                        background: r.winrate >= 50 ? 'var(--green)' : 'var(--amber)',
                        borderRadius: 99,
                      }} />
                    </div>
                    <span style={{ ...monoStyle, fontSize: 10, color: 'var(--text-4)' }}>{fmt(r.winrate, 0)}% WR</span>
                  </div>
                  <span style={{ ...monoStyle, fontSize: 13, fontWeight: 700, color: pnlColor(r.pnl), textAlign: 'right' }}>
                    {fmtPnl(r.pnl)}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 3 }}>SOL</span>
                  </span>
                </div>
              ))}
            </Card>
          )}

          {stats.totalTrades === 0 && (
            <div style={{
              textAlign: 'center', padding: 60,
              background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
              <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Aucun trade sur {periodLabel}</div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
