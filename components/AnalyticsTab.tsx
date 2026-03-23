'use client'

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { ChartData } from '@/lib/db'

const FR_MONTHS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
}

function monthLabel(ym: string) {
  const [, m] = (ym ?? '').split('-')
  return FR_MONTHS[m] ?? ym
}

const COLORS = ['#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2', '#ff6961', '#32ade6']
const TOOLTIP_STYLE = { background: '#1a1a1a', border: 'none', borderRadius: 10, color: 'white', fontSize: 12 }

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
      {children}
    </div>
  )
}

function Empty() {
  return <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Pas encore de données</div>
}

export default function AnalyticsTab({ data }: { data: ChartData | null }) {
  if (!data) {
    return (
      <div style={{ display: 'grid', gap: 12 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ padding: 24, height: 200, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>

      {/* Equity Curve */}
      <div className="card" style={{ padding: 24 }}>
        <SectionTitle>Courbe de PnL cumulé (SOL)</SectionTitle>
        {data.equityCurve.length < 2 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.equityCurve} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} width={50} tickFormatter={v => `${v > 0 ? '+' : ''}${Number(v).toFixed(2)}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(3)} SOL`, 'PnL cumulé']} />
              <Line
                type="monotone" dataKey="cumPnl" stroke="#0a84ff" dot={false}
                strokeWidth={2.5} activeDot={{ r: 5, fill: '#0a84ff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Win Rate par mois */}
      <div className="card" style={{ padding: 24 }}>
        <SectionTitle>Win rate par mois (%)</SectionTitle>
        {data.winRateByMonth.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.winRateByMonth} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={monthLabel} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Win Rate']} labelFormatter={(l) => monthLabel(String(l))} />
              <Bar dataKey="winRate" fill="#30d158" radius={[5, 5, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Row: Trade type + Erreurs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Par type de trade */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle>Par type de trade</SectionTitle>
          {data.byTradeType.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byTradeType} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="type" type="category" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="wins" name="Wins" fill="#30d158" stackId="s" />
                <Bar dataKey="losses" name="Losses" fill="#ff453a" stackId="s" radius={[0, 5, 5, 0]} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribution erreurs */}
        <div className="card" style={{ padding: 24 }}>
          <SectionTitle>Distribution des erreurs</SectionTitle>
          {data.errorDistribution.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Aucune erreur enregistrée</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.errorDistribution} dataKey="count" nameKey="erreur" cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={4} strokeWidth={0}>
                  {data.errorDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Tokens */}
      <div className="card" style={{ padding: 24 }}>
        <SectionTitle>Top tokens par PnL total (SOL)</SectionTitle>
        {data.topTokens.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.topTokens} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="token" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v > 0 ? '+' : ''}${Number(v).toFixed(2)}`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(3)} SOL`, 'PnL total']} />
              <Bar dataKey="totalPnl" radius={[5, 5, 0, 0]} maxBarSize={48}>
                {data.topTokens.map((entry, i) => (
                  <Cell key={i} fill={entry.totalPnl >= 0 ? '#30d158' : '#ff453a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
