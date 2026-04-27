'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { ChartData } from '@/lib/db'
import BarRows from '@/components/ui/BarRows'
import { monoFont } from '@/components/ui/tokens'

const FR_MONTHS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function monthLabel(ym: string) {
  const [, m] = (ym ?? '').split('-')
  return FR_MONTHS[m] ?? ym
}

const TOOLTIP_STYLE = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 11,
  fontFamily: monoFont,
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: monoFont, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
      {children}
    </div>
  )
}

function Empty() {
  return (
    <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: 12 }}>
      Pas encore de données
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
      {children}
    </div>
  )
}

export default function AnalyticsTab({ data }: { data: ChartData | null }) {
  if (!data) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, height: 180 }} />
        ))}
      </div>
    )
  }

  // Build equity curve points for the large SVG
  const equityMax = data.equityCurve.length > 0 ? Math.max(...data.equityCurve.map(p => p.cumPnl)) : 0
  const equityMin = data.equityCurve.length > 0 ? Math.min(0, ...data.equityCurve.map(p => p.cumPnl)) : 0
  const peak = equityMax
  const dd = data.equityCurve.reduce((minDd, p) => {
    const runMax = Math.max(...data.equityCurve.slice(0, data.equityCurve.indexOf(p) + 1).map(x => x.cumPnl))
    return Math.min(minDd, p.cumPnl - runMax)
  }, 0)

  // BarRows data from ChartData
  const byTypeRows = data.byTradeType.map(r => ({
    label: r.type,
    count: r.wins + r.losses,
    pnl: r.avgPnl * (r.wins + r.losses),
  })).sort((a, b) => b.pnl - a.pnl)

  const topTokenRows = data.topTokens.map(r => ({
    label: r.token,
    count: r.count,
    pnl: r.totalPnl,
  }))

  const errorRows = data.errorDistribution
    .filter(r => r.erreur !== 'Aucune' && r.erreur !== '')
    .map(r => ({ label: r.erreur, count: r.count, pnl: 0 }))

  return (
    <div style={{ display: 'grid', gap: 12 }}>

      {/* Equity curve — large */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
          <SectionTitle>Equity Curve · SOL cumulatif</SectionTitle>
          <div style={{ fontFamily: monoFont, fontSize: 11, color: 'var(--text-2)' }}>
            peak <span style={{ color: 'var(--green)' }}>{peak >= 0 ? '+' : ''}{peak.toFixed(2)}</span>
            {dd < 0 && <> · drawdown <span style={{ color: 'var(--red)' }}>{dd.toFixed(2)}</span></>}
          </div>
        </div>
        {data.equityCurve.length < 2 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.equityCurve} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: monoFont }}
                tickLine={false} axisLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: monoFont }}
                tickLine={false} axisLine={false} width={50}
                tickFormatter={v => `${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(1)}`}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(3)} SOL`, 'PnL cumulé']}
              />
              <Line
                type="monotone" dataKey="cumPnl"
                stroke="oklch(0.74 0.16 152)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, fill: 'oklch(0.74 0.16 152)', stroke: 'none' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Win rate by month */}
      {data.winRateByMonth.length > 1 && (
        <Card>
          <SectionTitle>Win rate par mois (%)</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data.winRateByMonth} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: monoFont }} tickLine={false} axisLine={false} tickFormatter={monthLabel} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-3)', fontSize: 10, fontFamily: monoFont }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Win Rate']} labelFormatter={(l) => monthLabel(String(l))} />
              <Line type="monotone" dataKey="winRate" stroke="oklch(0.74 0.14 240)" strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: 'oklch(0.74 0.14 240)', stroke: 'none' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        <Card>
          <SectionTitle>Performance par type</SectionTitle>
          {byTypeRows.length === 0 ? <Empty /> : <BarRows rows={byTypeRows} />}
        </Card>

        <Card>
          <SectionTitle>Top tokens</SectionTitle>
          {topTokenRows.length === 0 ? <Empty /> : <BarRows rows={topTokenRows} />}
        </Card>

        <Card>
          <SectionTitle>Distribution des erreurs</SectionTitle>
          {errorRows.length === 0 ? (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', fontSize: 12, fontFamily: monoFont }}>
              ✓ Aucune erreur enregistrée
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {errorRows.map(r => {
                const maxCount = Math.max(...errorRows.map(x => x.count)) || 1
                return (
                  <div key={r.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.label}</span>
                      <span style={{ fontFamily: monoFont, fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>{r.count}×</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(r.count / maxCount) * 100}%`, background: 'var(--red)', opacity: 0.7, borderRadius: 2, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Stats par mois</SectionTitle>
          {data.winRateByMonth.length === 0 ? <Empty /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...data.winRateByMonth].reverse().slice(0, 6).map(r => (
                <div key={r.month} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 60px', gap: 10, alignItems: 'center', fontSize: 12 }}>
                  <span style={{ fontFamily: monoFont, color: 'var(--text-3)' }}>{monthLabel(r.month)}</span>
                  <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${r.winRate}%`, background: r.winRate >= 50 ? 'var(--green)' : 'var(--amber)', borderRadius: 2, transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontFamily: monoFont, textAlign: 'right', color: r.winRate >= 50 ? 'var(--green)' : 'var(--amber)', fontWeight: 600 }}>
                    {r.winRate.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>
    </div>
  )
}
