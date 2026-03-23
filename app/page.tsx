'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import type { ChartData } from '@/lib/db'

const AnalyticsTab = lazy(() => import('@/components/AnalyticsTab'))

interface Stats {
  total: number; totalPnl: number; wins: number; losses: number
  aplus: number; avgPnl: number; winRate: number
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

function PnlCell({ val }: { val: number | null }) {
  if (val === null || val === undefined) return <span style={{ color: 'rgba(255,255,255,0.3)' }}>—</span>
  const c = val > 0 ? '#30d158' : val < 0 ? '#ff453a' : 'rgba(255,255,255,0.4)'
  return <span style={{ color: c, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{val > 0 ? '+' : ''}{fmt(val)} SOL</span>
}

function QBadge({ val }: { val: string | null }) {
  if (!val) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
  return <span className={`badge badge-${val}`}>{val}</span>
}

function MarcheIcon({ val }: { val: string | null }) {
  if (val === 'bull') return <span title="Bull actif" style={{ fontSize: 11 }}>🔥</span>
  if (val === 'neutre') return <span title="Neutre" style={{ fontSize: 11 }}>😐</span>
  if (val === 'mort') return <span title="Mort" style={{ fontSize: 11 }}>❄️</span>
  return null
}

function formatMC(n: number | null): string {
  if (!n) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

type Period = 'all' | 'week' | 'month' | string
type TradeFilter = 'all' | 'wins' | 'losses' | 'aplus'

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('all')
  const [months, setMonths] = useState<string[]>([])
  const [tab, setTab] = useState<'overview' | 'analytics'>('overview')
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('all')

  // Charger les mois disponibles au démarrage
  useEffect(() => {
    fetch('/api/months').then(r => r.json()).then(setMonths).catch(() => {})
  }, [])

  // Recharger trades + stats quand la période change
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

  // Charger les charts uniquement quand l'onglet analytics est ouvert (lazy)
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

  const isCustomMonth = /^\d{4}-\d{2}$/.test(period)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 48px' }}>

      {/* Page title + actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Trades
          </h1>
          {stats && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
              {stats.total} trade{stats.total !== 1 ? 's' : ''} · Win rate {fmt(stats.winRate, 0)}%
            </p>
          )}
        </div>
        <Link href="/nouveau" className="btn-primary">+ Nouveau trade</Link>
      </div>

      {/* Filtres temporels */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
        <div className="seg-ctrl">
          <button className={`seg-btn ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>Tout</button>
          <button className={`seg-btn ${period === 'week' ? 'active' : ''}`} onClick={() => setPeriod('week')}>Cette semaine</button>
          <button className={`seg-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>Ce mois-ci</button>
        </div>
        {months.length > 0 && (
          <select
            value={isCustomMonth ? period : ''}
            onChange={e => { if (e.target.value) setPeriod(e.target.value) }}
            className="input-field"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="">Par mois...</option>
            {months.map(m => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
          <StatCard label="PnL Total" value={`${stats.totalPnl >= 0 ? '+' : ''}${fmt(stats.totalPnl)} SOL`} color={stats.totalPnl >= 0 ? '#30d158' : '#ff453a'} />
          <StatCard label="Win Rate" value={`${fmt(stats.winRate, 0)}%`} color={stats.winRate >= 50 ? '#30d158' : '#ff453a'} />
          <StatCard label="Trades" value={String(stats.total)} />
          <StatCard label="Wins" value={String(stats.wins)} color="#30d158" />
          <StatCard label="Losses" value={String(stats.losses)} color="#ff453a" />
          <StatCard label="A+ Trades" value={String(stats.aplus)} color="#bf5af2" />
          <StatCard label="Moy. PnL" value={`${stats.avgPnl >= 0 ? '+' : ''}${fmt(stats.avgPnl)} SOL`} color={stats.avgPnl >= 0 ? '#30d158' : '#ff453a'} />
        </div>
      )}

      {/* Onglets */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Vue d&apos;ensemble</button>
        <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytiques</button>
      </div>

      {/* Onglet : Overview */}
      {tab === 'overview' && (
        <>
          {/* Sous-filtres trades */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {(['all', 'wins', 'losses', 'aplus'] as TradeFilter[]).map(f => (
              <button key={f} className={`radio-pill ${tradeFilter === f ? (f === 'wins' ? 'pill-green' : f === 'losses' ? 'pill-red' : f === 'aplus' ? 'pill-blue' : 'pill-blue') : ''}`} onClick={() => setTradeFilter(f)}>
                {f === 'all' ? 'Tous' : f === 'wins' ? '✅ Wins' : f === 'losses' ? '❌ Losses' : '⭐ A+'}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px 100px 52px 52px 90px',
              gap: 10, padding: '10px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {['Date', 'Token', 'PnL', 'MC Entrée', 'In', 'Out', 'Type'].map(h => (
                <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                  {h}
                </span>
              ))}
            </div>

            {loading && (
              <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>Chargement...</div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: 56, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Aucun trade</div>
                <Link href="/nouveau" style={{ color: '#0a84ff', fontSize: '0.875rem' }}>Ajouter ton premier trade →</Link>
              </div>
            )}

            {filtered.map(t => (
              <Link key={t.id} href={`/trade/${t.id}`} className="trade-row">
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
                  {t.date?.slice(5) ?? '—'}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {t.token}
                    {t.trade_aplus ? <span style={{ fontSize: 10 }}>⭐</span> : null}
                    <MarcheIcon val={t.marche_global} />
                  </div>
                  {t.meme_narrative ? (
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                      {t.meme_narrative}
                    </div>
                  ) : null}
                </div>
                <PnlCell val={t.pnl_sol} />
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{formatMC(t.market_cap_entree)}</span>
                <QBadge val={t.entry_qualite} />
                <QBadge val={t.exit_qualite} />
                {t.type_trade ? (
                  <span className="badge" style={{ background: 'rgba(10,132,255,0.1)', color: '#0a84ff', fontSize: '0.65rem' }}>{t.type_trade}</span>
                ) : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Onglet : Analytics */}
      {tab === 'analytics' && (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Chargement des graphiques...</div>}>
          <AnalyticsTab data={chartData} />
        </Suspense>
      )}

    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: color ?? 'white', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  )
}
