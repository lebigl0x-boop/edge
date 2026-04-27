'use client'

import { useEffect, useState, useMemo, lazy, Suspense } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import type { ChartData } from '@/lib/db'
import KpiRow from '@/components/ui/KpiRow'
import EquityCurve from '@/components/ui/EquityCurve'
import { monoFont, pnlColor, fmtPnl } from '@/components/ui/tokens'

const AnalyticsTab = lazy(() => import('@/components/AnalyticsTab'))
const WeekView = lazy(() => import('@/components/WeekView'))

interface Stats {
  total: number; totalPnl: number; wins: number; losses: number
  aplus: number; avgPnl: number; winRate: number
  disciplineScore: number; slRespectRate: number; slHitRate: number
  errorRate: number; aplusRate: number; rrReel: number | null
}

const FR_MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${FR_MONTHS[parseInt(m) - 1]} ${y}`
}

function fmt(n: number | null, d = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(d)
}

type Period = 'all' | 'week' | 'month' | string
type TradeFilter = 'all' | 'wins' | 'losses' | 'aplus'
type Tab = 'overview' | 'analytics' | 'semaine'

const PERIOD_OPTIONS = [
  { key: 'week', label: '7D' },
  { key: 'month', label: '30D' },
  { key: 'all', label: 'ALL' },
]

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('week')
  const [months, setMonths] = useState<string[]>([])
  const [tab, setTab] = useState<Tab>('semaine')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetch('/api/months').then(r => r.json()).then(setMonths).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const qs = period !== 'all' ? `?filter=${period}` : ''
    Promise.all([
      fetch(`/api/trades${qs}`).then(r => r.json()),
      fetch(`/api/stats${qs}`).then(r => r.json()),
    ]).then(([t, s]) => {
      setTrades(Array.isArray(t) ? t : [])
      setStats(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [period])

  useEffect(() => {
    if (tab !== 'analytics') return
    setChartData(null)
    const qs = period !== 'all' ? `?filter=${period}` : ''
    fetch(`/api/charts${qs}`).then(r => r.json()).then(setChartData).catch(() => {})
  }, [tab, period])

  const filtered = trades.filter(t => {
    if (tradeFilter === 'wins') return (t.pnl_sol ?? 0) > 0
    if (tradeFilter === 'losses') return (t.pnl_sol ?? 0) < 0
    if (tradeFilter === 'aplus') return t.trade_aplus
    return true
  })

  // Equity curve from trades (client-side computation)
  const equityPoints = useMemo(() => {
    let cum = 0
    return [...trades]
      .filter(t => t.pnl_sol !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => { cum += t.pnl_sol ?? 0; return { y: cum } })
  }, [trades])

  // Side widgets computed from trades
  const byNarrative = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>()
    trades.forEach(t => {
      if (!t.meme_narrative) return
      const e = map.get(t.meme_narrative) ?? { pnl: 0, count: 0 }
      map.set(t.meme_narrative, { pnl: e.pnl + (t.pnl_sol ?? 0), count: e.count + 1 })
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 6)
  }, [trades])

  const topErrors = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>()
    trades.forEach(t => {
      if (!t.erreur || t.erreur === 'Aucune') return
      const key = t.erreur === 'Autre' && t.erreur_autre ? t.erreur_autre : t.erreur
      if (!key) return
      const e = map.get(key) ?? { pnl: 0, count: 0 }
      map.set(key, { pnl: e.pnl + (t.pnl_sol ?? 0), count: e.count + 1 })
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => a.pnl - b.pnl)
      .slice(0, 5)
  }, [trades])

  const isCustomMonth = /^\d{4}-\d{2}$/.test(period)
  const isCustomRange = period.startsWith('custom:')
  const isStandardPeriod = period === 'week' || period === 'month' || period === 'all'

  function openDatePicker() {
    if (isCustomRange) {
      const parts = period.split(':')
      setDateFrom(parts[1] ?? '')
      setDateTo(parts[2] ?? '')
    }
    setShowDatePicker(v => !v)
  }

  function applyRange(from: string, to: string) {
    if (from && to) setPeriod(`custom:${from}:${to}`)
  }

  const kpis = stats ? [
    { label: 'Win Rate',   value: `${fmt(stats.winRate, 0)}%`,          hint: '> 50%',  color: stats.winRate >= 50 ? 'var(--green)' : 'var(--amber)' },
    { label: 'RR Réel',    value: stats.rrReel !== null ? `${fmt(stats.rrReel, 1)}×` : '—', hint: '> 2×', color: stats.rrReel !== null ? (stats.rrReel >= 2 ? 'var(--green)' : 'var(--amber)') : 'var(--text-3)' },
    { label: 'Discipline', value: `${fmt(stats.disciplineScore, 0)}%`,  hint: '> 80%',  color: stats.disciplineScore >= 80 ? 'var(--text)' : 'var(--amber)' },
    { label: 'SL Respect', value: `${fmt(stats.slRespectRate, 0)}%`,    hint: '> 90%',  color: stats.slRespectRate >= 90 ? 'var(--text)' : 'var(--amber)' },
    { label: 'SL Hit',     value: `${fmt(stats.slHitRate, 0)}%`,        hint: '< 30%',  color: stats.slHitRate <= 30 ? 'var(--text)' : 'var(--amber)' },
    { label: 'A+ Rate',    value: `${fmt(stats.aplusRate, 0)}%`,        hint: '> 30%',  color: stats.aplusRate >= 30 ? 'var(--text)' : 'var(--amber)' },
  ] : []

  return (
    <div style={{ padding: '20px 24px 40px' }}>

      {/* Hero strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 14, marginBottom: 14 }}>

        {/* PnL Hero */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '18px 20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          minHeight: 160,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              PnL · {period === 'week' ? '7 days' : period === 'month' ? '30 days' : isCustomRange ? 'custom' : isCustomMonth ? formatMonthLabel(period) : 'All time'}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {PERIOD_OPTIONS.map(p => (
                <button key={p.key} className="mono" onClick={() => { setPeriod(p.key); setShowDatePicker(false) }} style={{
                  background: period === p.key ? 'var(--surface-3)' : 'transparent',
                  color: period === p.key ? 'var(--text)' : 'var(--text-3)',
                  border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600,
                }}>{p.label}</button>
              ))}
              {/* Month selector */}
              {months.length > 0 && (
                <select
                  value={isCustomMonth ? period : ''}
                  onChange={e => { if (e.target.value) { setPeriod(e.target.value); setShowDatePicker(false) } }}
                  className="mono"
                  style={{
                    background: isCustomMonth ? 'var(--surface-3)' : 'transparent',
                    color: isCustomMonth ? 'var(--text)' : 'var(--text-3)',
                    border: 'none', borderRadius: 4, padding: '3px 6px', fontSize: 10, cursor: 'pointer',
                    outline: 'none', appearance: 'none',
                  }}
                >
                  <option value="">···</option>
                  {months.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ fontFamily: monoFont, fontSize: 36, fontWeight: 700, color: 'var(--text-4)', letterSpacing: '-0.02em' }}>···</div>
          ) : stats ? (
            <div>
              <div style={{
                fontFamily: monoFont,
                fontSize: 38,
                fontWeight: 700,
                color: pnlColor(stats.totalPnl),
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {fmtPnl(stats.totalPnl)}
                <span style={{ fontSize: 18, color: 'var(--text-3)', marginLeft: 6, fontWeight: 500 }}>SOL</span>
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 11, color: 'var(--text-2)', marginTop: 6 }}>
                <span style={{ color: stats.winRate >= 50 ? 'var(--green)' : 'var(--amber)' }}>{fmt(stats.winRate, 0)}% WR</span>
                {' · '}{stats.total} trades
                {' · '}{stats.wins}W / {stats.losses}L
              </div>
            </div>
          ) : null}
        </div>

        {/* Equity curve */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '18px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Equity Curve</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>cumulatif · SOL</span>
          </div>
          <EquityCurve points={equityPoints} height={120} gradientId="dash-eq" />
        </div>
      </div>

      {/* Custom date range picker */}
      {showDatePicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); applyRange(e.target.value, dateTo) }} className="input-field" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }} />
          <span style={{ color: 'var(--text-4)', fontSize: '0.82rem' }}>→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); applyRange(dateFrom, e.target.value) }} className="input-field" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setPeriod('all'); setShowDatePicker(false) }} style={{ color: 'var(--text-3)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Effacer</button>
          )}
        </div>
      )}

      {/* Custom range button */}
      {!isStandardPeriod && !isCustomMonth && !showDatePicker && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={openDatePicker} className="mono" style={{ background: isCustomRange ? 'var(--surface-3)' : 'var(--surface-1)', border: '1px solid var(--border)', color: isCustomRange ? 'var(--text)' : 'var(--text-3)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
            {isCustomRange ? `${period.split(':')[1]} → ${period.split(':')[2]}` : '📅 Plage custom'}
          </button>
        </div>
      )}
      {isStandardPeriod && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={openDatePicker} className="mono" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-4)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
            📅 Plage custom
          </button>
        </div>
      )}

      {/* KPI Row */}
      {kpis.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <KpiRow kpis={kpis} />
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
          Vue d&apos;ensemble
        </button>
        <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>
          Analytiques
        </button>
        {period === 'week' && (
          <button className={`tab-btn ${tab === 'semaine' ? 'active' : ''}`} onClick={() => setTab('semaine')}>
            Semaine
          </button>
        )}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

          {/* Trades table */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Trades</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['all', 'wins', 'losses', 'aplus'] as TradeFilter[]).map(f => (
                    <button key={f} onClick={() => setTradeFilter(f)} style={{
                      background: tradeFilter === f ? 'var(--surface-3)' : 'transparent',
                      color: tradeFilter === f ? 'var(--text)' : 'var(--text-3)',
                      border: `1px solid ${tradeFilter === f ? 'var(--border-strong)' : 'transparent'}`,
                      borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                      {f === 'all' ? 'All' : f === 'wins' ? 'Wins' : f === 'losses' ? 'Losses' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>
              {stats && (
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {stats.total} trades
                </span>
              )}
            </div>

            {/* Column headers */}
            <div className="mono" style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 70px 90px 60px 80px 24px',
              gap: 10, padding: '7px 18px',
              fontSize: 9.5, color: 'var(--text-3)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>Date</span><span>Token</span><span>Type</span>
              <span style={{ textAlign: 'right' }}>PnL SOL</span>
              <span>Conv</span><span>Erreur</span><span />
            </div>

            {loading && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>Chargement…</div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                <div style={{ color: 'var(--text-3)', marginBottom: 10 }}>Aucun trade</div>
                <Link href="/nouveau" style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>Ajouter ton premier trade →</Link>
              </div>
            )}

            {filtered.map(t => <TradeRow key={t.id} trade={t} />)}
          </div>

          {/* Side widgets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Top errors */}
            {topErrors.length > 0 && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Top erreurs</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)' }}>{topErrors.length}</span>
                </div>
                {topErrors.map(e => {
                  const maxCount = Math.max(...topErrors.map(x => x.count)) || 1
                  return (
                    <div key={e.name} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-2)' }}>{e.name}</span>
                        <span className="mono" style={{ color: 'var(--red)' }}>{fmtPnl(e.pnl)}</span>
                      </div>
                      <div style={{ height: 3, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(e.count / maxCount) * 100}%`, background: 'var(--red)', opacity: 0.6, borderRadius: 2 }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* By narrative */}
            {byNarrative.length > 0 && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
                  By narrative
                </div>
                {byNarrative.map(n => (
                  <div key={n.name} style={{
                    display: 'grid', gridTemplateColumns: '1fr 30px 60px',
                    gap: 8, padding: '6px 0', fontSize: 12, alignItems: 'center',
                    borderTop: '1px solid var(--border)',
                  }}>
                    <span style={{ color: 'var(--text-2)' }}>{n.name}</span>
                    <span className="mono" style={{ color: 'var(--text-3)', fontSize: 10, textAlign: 'right' }}>{n.count}t</span>
                    <span className="mono" style={{ color: pnlColor(n.pnl), textAlign: 'right', fontWeight: 600 }}>{fmtPnl(n.pnl)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {byNarrative.length === 0 && !loading && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', color: 'var(--text-4)', fontSize: 12 }}>
                Pas encore de données
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>Chargement…</div>}>
          <AnalyticsTab data={chartData} />
        </Suspense>
      )}

      {/* Semaine tab */}
      {tab === 'semaine' && (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>Chargement…</div>}>
          <WeekView trades={trades} />
        </Suspense>
      )}

    </div>
  )
}

function TradeRow({ trade: t }: { trade: Trade }) {
  const [hover, setHover] = useState(false)
  const conv = t.entry_qualite
  const convColor = conv === 'A' ? 'var(--green)' : conv === 'B' ? 'var(--amber)' : conv === 'C' ? 'var(--red)' : 'var(--text-4)'
  const hasErr = t.erreur && t.erreur !== 'Aucune'
  const errLabel = t.erreur === 'Autre' && t.erreur_autre ? t.erreur_autre.split(' ')[0] : (t.erreur ?? '—')?.split(' ')[0]

  return (
    <Link
      href={`/trade/${t.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mono"
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 70px 90px 60px 80px 24px',
        gap: 10,
        padding: '10px 18px',
        fontSize: 12,
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        background: hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span style={{ color: 'var(--text-3)' }}>{t.date?.slice(5) ?? '—'}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{t.token}</span>
        {t.trade_aplus && <span style={{ fontSize: 9, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '1px 4px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.05em' }}>A+</span>}
      </span>
      <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{t.type_trade ?? '—'}</span>
      <span style={{ color: t.pnl_sol != null ? pnlColor(t.pnl_sol) : 'var(--text-4)', textAlign: 'right', fontWeight: 600 }}>
        {t.pnl_sol != null ? `${fmtPnl(t.pnl_sol)} SOL` : '—'}
      </span>
      <span style={{ color: convColor, fontSize: 11 }}>{conv ?? '—'}</span>
      <span style={{ color: hasErr ? 'var(--red)' : 'var(--text-4)', fontSize: 11 }}>
        {hasErr ? errLabel : '—'}
      </span>
      <span style={{ color: 'var(--text-4)', fontSize: 11, textAlign: 'right', opacity: hover ? 1 : 0, transition: 'opacity 0.15s' }}>›</span>
    </Link>
  )
}
