interface Point { y: number; label?: string }

interface Props {
  points: Point[]
  height?: number
  gradientId?: string
  showDots?: boolean
}

export default function EquityCurve({ points, height = 130, gradientId = 'eq1', showDots = true }: Props) {
  if (points.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-4)', fontSize: 12 }}>
        Pas encore de données
      </div>
    )
  }

  const W = 720, H = height, P = 6
  const max = Math.max(...points.map(p => p.y))
  const min = Math.min(0, ...points.map(p => p.y))
  const range = max - min || 1
  const x = (i: number) => P + (i / (points.length - 1)) * (W - P * 2)
  const y = (v: number) => H - P - ((v - min) / range) * (H - P * 2)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ')
  const areaD = pathD + ` L${x(points.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.74 0.16 152)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" y1={y(0)} x2={W} y2={y(0)} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 3" />
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path d={pathD} fill="none" stroke="oklch(0.74 0.16 152)" strokeWidth="1.5" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r="2" fill="oklch(0.74 0.16 152)" />
      ))}
    </svg>
  )
}
