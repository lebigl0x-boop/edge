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
  aplus: number; avgPnl: number; winRate: number; rrReel: number | null
  venteDansPlanPct: number | null; coutSortiesPrematurees: number
  disciplineScore: number; slRespectRate: number; slHitRate: number
  errorRate: number; aplusRate: number
}

interface TodayStats { count: number; losses: number; pnl: number }

const FR_MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
function formatMonthLabel(ym: string) {
  const [y, m] = ym.split('-')
  return `${FR_MONTHS[parseInt(m) - 1]} ${y}`
}
function fmt(n: number | null, d = 2) {
  if (n === null || n === undefined) return '—'
  return n.toFixed(d)
}

type Period = 'all' | 'week' | 'month' | string
type CycleFilter = 'cycle-1' | 'v1-historique' | 'all'
type TradeFilter = 'all' | 'wins' | 'losses' | 'aplus'
type Tab = 'overview' | 'analytics' | 'semaine'

const PERIOD_OPTIONS = [
  { key: 'week', label: '7D' },
  { key: 'month', label: '30D' },
  { key: 'all', label: 'ALL' },
]

const CYCLE_OPTIONS: { key: CycleFilter; label: string }[] = [
  { key: 'cycle-1', label: 'Cycle 1' },
  { key: 'v1-historique', label: 'Historique' },
  { key: 'all', label: 'Tous' },
]

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('week')
  const [cycle, setCycle] = useState<CycleFilter>('cycle-1')
  const [months, setMonths] = useState<string[]>([])
  const [tab, setTab] = useState<Tab>('semaine')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [draftCount, setDraftCount] = useState(0)
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  // Wallet balance pour le calcul du stop -10%
  useEffect(() => {
    const addr = localStorage.getItem('sol_wallet_address')
    if (!addr) return
    fetch(`/api/solana?address=${encodeURIComponent(addr)}`)
      .then(r => r.json())
      .then((d: { sol?: number }) => { if (d.sol !== undefined) setWalletBalance(d.sol) })
      .catch(() => {})
  }, [])

  // Sync trades + today stats — au chargement et toutes les 60s
  useEffect(() => {
    function syncAndRefresh() {
      fetch('/api/cron/sync-trades').catch(() => {})
      fetch('/api/drafts/count').then(r => r.json()).then((d: { count: number }) => setDraftCount(d.count ?? 0)).catch(() => {})
      fetch(`/api/today?cycle=${cycle}`).then(r => r.json()).then((d: TodayStats) => setTodayStats(d)).catch(() => {})
    }
    syncAndRefresh()
    const interval = setInterval(syncAndRefresh, 60_000)
    return () => clearInterval(interval)
  }, [cycle])

  useEffect(() => {
    fetch('/api/months').then(r => r.json()).then(setMonths).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (period !== 'all') qs.set('filter', period)
    if (cycle !== 'all') qs.set('cycle', cycle)
    const q = qs.toString() ? `?${qs}` : ''
    Promise.all([
      fetch(`/api/trades${q}`).then(r => r.json()),
      fetch(`/api/stats${q}`).then(r => r.json()),
    ]).then(([t, s]) => {
      setTrades(Array.isArray(t) ? t : [])
      setStats(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [period, cycle])

  useEffect(() => {
    if (tab !== 'analytics') return
    setChartData(null)
    const qs = new URLSearchParams()
    if (period !== 'all') qs.set('filter', period)
    if (cycle !== 'all') qs.set('cycle', cycle)
    const q = qs.toString() ? `?${qs}` : ''
    fetch(`/api/charts${q}`).then(r => r.json()).then(setChartData).catch(() => {})
  }, [tab, period, cycle])

  const filtered = trades.filter(t => {
    if (tradeFilter === 'wins') return (t.pnl_sol ?? 0) > 0
    if (tradeFilter === 'losses') return (t.pnl_sol ?? 0) < 0
    if (tradeFilter === 'aplus') return t.trade_aplus
    return true
  })

  const equityPoints = useMemo(() => {
    let cum = 0
    return [...trades]
      .filter(t => t.pnl_sol !== null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(t => { cum += t.pnl_sol ?? 0; return { y: cum } })
  }, [trades])

  const byNarrative = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>()
    trades.forEach(t => {
      if (!t.meme_narrative) return
      const e = map.get(t.meme_narrative) ?? { pnl: 0, count: 0 }
      map.set(t.meme_narrative, { pnl: e.pnl + (t.pnl_sol ?? 0), count: e.count + 1 })
    })
    return Array.from(map.entries()).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.pnl - a.pnl).slice(0, 6)
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

  // Stop journalier : 4 pertes OU PnL ≤ -10% du stack
  const stopJournalier = useMemo(() => {
    if (!todayStats) return false
    if (todayStats.losses >= 4) return true
    if (walletBalance && walletBalance > 0) {
      const pct = (todayStats.pnl / walletBalance) * 100
      if (pct <= -10) return true
    }
    return false
  }, [todayStats, walletBalance])

  const todayPnlPct = walletBalance && walletBalance > 0 && todayStats
    ? (todayStats.pnl / walletBalance) * 100
    : null

  // KPIs v2 (cycle-1) ou v1 (historique)
  const isV1 = cycle === 'v1-historique'
  const kpis = stats ? (isV1 ? [
    { label: 'Win Rate',   value: `${fmt(stats.winRate, 0)}%`,         hint: '> 50%', color: stats.winRate >= 50 ? 'var(--green)' : 'var(--amber)' },
    { label: 'RR Réel',   value: stats.rrReel !== null ? `${fmt(stats.rrReel, 1)}×` : '—', hint: '> 2×', color: stats.rrReel !== null ? (stats.rrReel >= 2 ? 'var(--green)' : 'var(--amber)') : 'var(--text-3)' },
    { label: 'Discipline', value: `${fmt(stats.disciplineScore, 0)}%`, hint: '> 80%', color: stats.disciplineScore >= 80 ? 'var(--text)' : 'var(--amber)' },
    { label: 'SL Respect', value: `${fmt(stats.slRespectRate, 0)}%`,   hint: '> 90%', color: stats.slRespectRate >= 90 ? 'var(--text)' : 'var(--amber)' },
    { label: 'SL Hit',     value: `${fmt(stats.slHitRate, 0)}%`,       hint: '< 30%', color: stats.slHitRate <= 30 ? 'var(--text)' : 'var(--amber)' },
    { label: 'A+ Rate',    value: `${fmt(stats.aplusRate, 0)}%`,       hint: '> 30%', color: stats.aplusRate >= 30 ? 'var(--text)' : 'var(--amber)' },
  ] : [
    { label: 'Win Rate',   value: `${fmt(stats.winRate, 0)}%`,         hint: '> 50%', color: stats.winRate >= 50 ? 'var(--green)' : 'var(--amber)' },
    { label: 'RR Réel',   value: stats.rrReel !== null ? `${fmt(stats.rrReel, 1)}×` : '—', hint: '> 2×', color: stats.rrReel !== null ? (stats.rrReel >= 2 ? 'var(--green)' : 'var(--amber)') : 'var(--text-3)' },
    { label: 'Dans plan',  value: stats.venteDansPlanPct !== null ? `${fmt(stats.venteDansPlanPct, 0)}%` : '—', hint: '> 70%', color: stats.venteDansPlanPct !== null ? (stats.venteDansPlanPct >= 70 ? 'var(--green)' : 'var(--amber)') : 'var(--text-3)' },
    { label: 'Laissé/table', value: stats.coutSortiesPrematurees > 0 ? `−${fmt(stats.coutSortiesPrematurees, 2)}` : '0', hint: '→ 0', color: stats.coutSortiesPrematurees > 0.1 ? 'var(--amber)' : 'var(--text)' },
  ]) : []

  return (
    <div style={{ padding: '16px 20px 40px' }}>

      {/* Draft banner */}
      {draftCount > 0 && (
        <Link href="/drafts" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', marginBottom: 12,
          background: 'oklch(0.78 0.14 70 / 0.08)',
          border: '1px solid oklch(0.78 0.14 70 / 0.25)',
          borderRadius: 10, textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)', boxShadow: '0 0 8px oklch(0.78 0.14 70 / 0.6)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--amber)' }}>
              {draftCount} trade{draftCount > 1 ? 's' : ''} à valider
            </span>
          </div>
          <span className="mono" style={{ fontSize: 12, color: 'var(--amber)', opacity: 0.7 }}>Voir →</span>
        </Link>
      )}

      {/* Today counter */}
      {todayStats !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          padding: '9px 14px', marginBottom: 12,
          background: stopJournalier ? 'oklch(0.68 0.21 22 / 0.10)' : 'var(--surface-1)',
          border: `1px solid ${stopJournalier ? 'oklch(0.68 0.21 22 / 0.35)' : 'var(--border)'}`,
          borderRadius: 10,
        }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>Aujourd&apos;hui</span>
          {/* Losers dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {[1, 2, 3, 4].map(n => (
              <div key={n} style={{
                width: 9, height: 9, borderRadius: 3,
                background: n <= todayStats.losses ? 'var(--red)' : 'var(--surface-3)',
                border: `1px solid ${n <= todayStats.losses ? 'oklch(0.68 0.21 22 / 0.5)' : 'var(--border)'}`,
              }} />
            ))}
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 3 }}>
              {todayStats.losses}/4 pertes
            </span>
          </div>
          {/* PnL du jour */}
          <span className="mono" style={{
            fontSize: 13, fontWeight: 700,
            color: stopJournalier ? 'var(--red)' : pnlColor(todayStats.pnl),
          }}>
            {todayStats.pnl >= 0 ? '+' : ''}{todayStats.pnl.toFixed(3)} SOL
            {todayPnlPct !== null && (
              <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-3)', marginLeft: 5 }}>
                ({todayPnlPct >= 0 ? '+' : ''}{todayPnlPct.toFixed(1)}%)
              </span>
            )}
          </span>
          {stopJournalier && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: 'var(--red)',
              background: 'oklch(0.68 0.21 22 / 0.15)',
              border: '1px solid oklch(0.68 0.21 22 / 0.3)',
              borderRadius: 5, padding: '2px 8px',
            }}>
              STOP JOURNALIER
            </span>
          )}
        </div>
      )}

      {/* Hero strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 12, marginBottom: 12 }}>
        {/* PnL Hero */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 150 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>
              PnL · {period === 'week' ? '7D' : period === 'month' ? '30D' : isCustomRange ? 'custom' : isCustomMonth ? formatMonthLabel(period) : 'All'}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {PERIOD_OPTIONS.map(p => (
                <button key={p.key} className="mono" onClick={() => { setPeriod(p.key); setShowDatePicker(false) }} style={{
                  background: period === p.key ? 'var(--surface-3)' : 'transparent',
                  color: period === p.key ? 'var(--text)' : 'var(--text-3)',
                  border: 'none', borderRadius: 4, padding: '3px 7px', fontSize: 10, cursor: 'pointer', fontWeight: 600,
                }}>{p.label}</button>
              ))}
              {months.length > 0 && (
                <select value={isCustomMonth ? period : ''} onChange={e => { if (e.target.value) { setPeriod(e.target.value); setShowDatePicker(false) } }} className="mono" style={{ background: isCustomMonth ? 'var(--surface-3)' : 'transparent', color: isCustomMonth ? 'var(--text)' : 'var(--text-3)', border: 'none', borderRadius: 4, padding: '3px 5px', fontSize: 10, cursor: 'pointer', outline: 'none', appearance: 'none' }}>
                  <option value="">···</option>
                  {months.map(m => <option key={m} value={m}>{formatMonthLabel(m)}</option>)}
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ fontFamily: monoFont, fontSize: 34, fontWeight: 700, color: 'var(--text-4)' }}>···</div>
          ) : stats ? (
            <div>
              <div style={{ fontFamily: monoFont, fontSize: 36, fontWeight: 700, color: pnlColor(stats.totalPnl), letterSpacing: '-0.02em', lineHeight: 1 }}>
                {fmtPnl(stats.totalPnl)}
                <span style={{ fontSize: 16, color: 'var(--text-3)', marginLeft: 5, fontWeight: 500 }}>SOL</span>
              </div>
              <div style={{ fontFamily: monoFont, fontSize: 11, color: 'var(--text-2)', marginTop: 5 }}>
                <span style={{ color: stats.winRate >= 50 ? 'var(--green)' : 'var(--amber)' }}>{fmt(stats.winRate, 0)}% WR</span>
                {' · '}{stats.total} trades
                {' · '}{stats.wins}W / {stats.losses}L
              </div>
            </div>
          ) : null}
        </div>

        {/* Equity curve */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-3)', textTransform: 'uppercase' }}>Equity Curve</span>
            {/* Sélecteur cycle */}
            <div style={{ display: 'flex', gap: 3 }}>
              {CYCLE_OPTIONS.map(c => (
                <button key={c.key} onClick={() => setCycle(c.key)} className="mono" style={{
                  background: cycle === c.key ? 'var(--surface-3)' : 'transparent',
                  color: cycle === c.key ? 'var(--text)' : 'var(--text-3)',
                  border: `1px solid ${cycle === c.key ? 'var(--border-strong)' : 'transparent'}`,
                  borderRadius: 5, padding: '3px 8px', fontSize: 10, cursor: 'pointer', fontWeight: 600,
                }}>{c.label}</button>
              ))}
            </div>
          </div>
          <EquityCurve points={equityPoints} height={110} gradientId="dash-eq" />
        </div>
      </div>

      {/* Custom date range picker */}
      {showDatePicker && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); applyRange(e.target.value, dateTo) }} className="input-field" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }} />
          <span style={{ color: 'var(--text-4)' }}>→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); applyRange(dateFrom, e.target.value) }} className="input-field" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem' }} />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); setPeriod('all'); setShowDatePicker(false) }} style={{ color: 'var(--text-3)', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}>Effacer</button>
          )}
        </div>
      )}
      {isStandardPeriod && (
        <div style={{ marginBottom: 12 }}>
          <button onClick={openDatePicker} className="mono" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-4)', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
            📅 Plage custom
          </button>
        </div>
      )}

      {/* KPI Row */}
      {kpis.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <KpiRow kpis={kpis} />
        </div>
      )}

      {/* Tab bar */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Vue d&apos;ensemble</button>
        <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytiques</button>
        {period === 'week' && (
          <button className={`tab-btn ${tab === 'semaine' ? 'active' : ''}`} onClick={() => setTab('semaine')}>Semaine</button>
        )}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
          {/* Trades table */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Trades</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['all', 'wins', 'losses', 'aplus'] as TradeFilter[]).map(f => (
                    <button key={f} onClick={() => setTradeFilter(f)} style={{
                      background: tradeFilter === f ? 'var(--surface-3)' : 'transparent',
                      color: tradeFilter === f ? 'var(--text)' : 'var(--text-3)',
                      border: `1px solid ${tradeFilter === f ? 'var(--border-strong)' : 'transparent'}`,
                      borderRadius: 5, padding: '3px 9px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                      {f === 'all' ? 'All' : f === 'wins' ? 'Wins' : f === 'losses' ? 'Losses' : 'A+'}
                    </button>
                  ))}
                </div>
              </div>
              {stats && <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{stats.total} trades</span>}
            </div>

            <div className="mono" style={{ display: 'grid', gridTemplateColumns: '60px 1fr 90px 60px 24px', gap: 10, padding: '6px 16px', fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', borderBottom: '1px solid var(--border)' }}>
              <span>Date</span><span>Token</span>
              <span style={{ textAlign: 'right' }}>PnL SOL</span>
              <span>Conv</span><span />
            </div>

            {loading && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)', fontSize: 13 }}>Chargement…</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                <div style={{ color: 'var(--text-3)', marginBottom: 10 }}>Aucun trade</div>
                <Link href="/nouveau" style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>Nouveau pré-trade →</Link>
              </div>
            )}
            {filtered.map(t => <TradeRow key={t.id} trade={t} />)}
          </div>

          {/* Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {byNarrative.length > 0 && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>By narrative</div>
                {byNarrative.map(n => (
                  <div key={n.name} style={{ display: 'grid', gridTemplateColumns: '1fr 30px 60px', gap: 8, padding: '5px 0', fontSize: 12, alignItems: 'center', borderTop: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-2)' }}>{n.name}</span>
                    <span className="mono" style={{ color: 'var(--text-3)', fontSize: 10, textAlign: 'right' }}>{n.count}t</span>
                    <span className="mono" style={{ color: pnlColor(n.pnl), textAlign: 'right', fontWeight: 600 }}>{fmtPnl(n.pnl)}</span>
                  </div>
                ))}
              </div>
            )}
            {byNarrative.length === 0 && !loading && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', color: 'var(--text-4)', fontSize: 12 }}>
                Pas encore de données
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>Chargement…</div>}>
          <AnalyticsTab data={chartData} />
        </Suspense>
      )}

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

  return (
    <Link href={`/trade/${t.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="mono"
      style={{
        display: 'grid', gridTemplateColumns: '60px 1fr 90px 60px 24px',
        gap: 10, padding: '9px 16px', fontSize: 12,
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        background: hover ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.12s', textDecoration: 'none', color: 'inherit',
      }}
    >
      <span style={{ color: 'var(--text-3)' }}>{t.date?.slice(5) ?? '—'}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{t.token}</span>
        {t.trade_aplus && <span style={{ fontSize: 9, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '1px 4px', borderRadius: 3, fontWeight: 700 }}>A+</span>}
        {t.vente_dans_plan === false && <span style={{ fontSize: 9, color: 'var(--red)', border: '1px solid var(--red)', padding: '1px 4px', borderRadius: 3, opacity: 0.7 }}>HP</span>}
      </span>
      <span style={{ color: t.pnl_sol != null ? pnlColor(t.pnl_sol) : 'var(--text-4)', textAlign: 'right', fontWeight: 600 }}>
        {t.pnl_sol != null ? `${fmtPnl(t.pnl_sol)} SOL` : '—'}
      </span>
      <span style={{ color: convColor, fontSize: 11 }}>{conv ?? '—'}</span>
      <span style={{ color: 'var(--text-4)', fontSize: 11, textAlign: 'right', opacity: hover ? 1 : 0, transition: 'opacity 0.15s' }}>›</span>
    </Link>
  )
}
