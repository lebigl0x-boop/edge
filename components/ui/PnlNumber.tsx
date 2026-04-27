import { pnlColor, monoFont } from './tokens'

type Size = 'hero' | 'large' | 'normal' | 'small'

interface Props {
  value: number | null
  unit?: string
  size?: Size
  decimals?: number
}

const SIZES: Record<Size, { fs: number; unitFs: number }> = {
  hero:   { fs: 40, unitFs: 18 },
  large:  { fs: 28, unitFs: 13 },
  normal: { fs: 16, unitFs: 11 },
  small:  { fs: 12, unitFs: 9 },
}

export default function PnlNumber({ value, unit = 'SOL', size = 'normal', decimals }: Props) {
  const { fs, unitFs } = SIZES[size]
  const d = decimals ?? (size === 'hero' || size === 'large' ? 2 : 2)

  if (value === null || value === undefined) {
    return (
      <span style={{ fontFamily: monoFont, fontSize: fs, color: 'var(--text-3)', fontFeatureSettings: '"tnum"' }}>—</span>
    )
  }

  const color = pnlColor(value)
  const sign = value > 0 ? '+' : ''

  return (
    <span style={{
      fontFamily: monoFont,
      fontSize: fs,
      fontWeight: 700,
      color,
      letterSpacing: '-0.02em',
      fontFeatureSettings: '"tnum"',
    }}>
      {sign}{value.toFixed(d)}
      {unit && (
        <span style={{ fontSize: unitFs, color: 'var(--text-3)', marginLeft: 5, fontWeight: 500 }}>
          {unit}
        </span>
      )}
    </span>
  )
}
