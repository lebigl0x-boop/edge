import { monoFont } from './tokens'

interface Kpi {
  label: string
  value: string
  hint?: string
  color?: string
}

interface Props {
  kpis: Kpi[]
}

export default function KpiRow({ kpis }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${kpis.length}, 1fr)`,
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {kpis.map((k, i) => (
        <div key={k.label} style={{
          padding: '16px 18px',
          borderRight: i < kpis.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {k.label}
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700, color: k.color ?? 'var(--text)', marginTop: 6, letterSpacing: '-0.02em' }}>
            {k.value}
          </div>
          {k.hint && (
            <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-4)', marginTop: 3 }}>
              {k.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
