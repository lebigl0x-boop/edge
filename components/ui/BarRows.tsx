import { monoFont, pnlColor, fmtPnl } from './tokens'

interface Row {
  label: string
  count?: number
  pnl: number
}

interface Props {
  rows: Row[]
}

export default function BarRows({ rows }: Props) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.pnl))) || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(r => {
        const w = (Math.abs(r.pnl) / maxAbs) * 100
        const color = pnlColor(r.pnl)
        return (
          <div key={r.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.label}</span>
              <span style={{ fontFamily: monoFont, fontSize: 11, color: 'var(--text-3)' }}>
                {r.count !== undefined && `${r.count}t · `}
                <span style={{ color, fontWeight: 600 }}>{fmtPnl(r.pnl)} SOL</span>
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${w}%`,
                background: color,
                borderRadius: 2,
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
