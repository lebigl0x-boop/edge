export const tokens = {
  green:      'oklch(0.74 0.16 152)',
  greenSoft:  'oklch(0.74 0.16 152 / 0.14)',
  greenBorder:'oklch(0.74 0.16 152 / 0.30)',
  red:        'oklch(0.68 0.21 22)',
  redSoft:    'oklch(0.68 0.21 22 / 0.14)',
  redBorder:  'oklch(0.68 0.21 22 / 0.30)',
  amber:      'oklch(0.78 0.14 70)',
  amberSoft:  'oklch(0.78 0.14 70 / 0.14)',
  amberBorder:'oklch(0.78 0.14 70 / 0.30)',
  accent:     'oklch(0.74 0.14 240)',
  accentSoft: 'oklch(0.74 0.14 240 / 0.12)',
  accentBorder:'oklch(0.74 0.14 240 / 0.25)',
  violet:     'oklch(0.72 0.16 290)',
  violetSoft: 'oklch(0.72 0.16 290 / 0.12)',
  text:       '#ededf0',
  text2:      'rgba(237,237,240,0.62)',
  text3:      'rgba(237,237,240,0.38)',
  text4:      'rgba(237,237,240,0.20)',
  surface1:   '#131316',
  surface2:   '#1a1a1f',
  surface3:   '#232329',
  border:     'rgba(255,255,255,0.06)',
  borderStrong:'rgba(255,255,255,0.10)',
} as const

export function pnlColor(val: number): string {
  if (val > 0) return tokens.green
  if (val < 0) return tokens.red
  return tokens.text3
}

export function fmtPnl(val: number | null | undefined, d = 2): string {
  if (val == null || isNaN(val)) return '—'
  const sign = val >= 0 ? '+' : ''
  return `${sign}${val.toFixed(d)}`
}

export const monoFont = "'JetBrains Mono', ui-monospace, monospace"
