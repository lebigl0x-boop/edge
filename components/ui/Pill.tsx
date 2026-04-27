'use client'

import { tokens } from './tokens'

type Variant = 'green' | 'red' | 'amber' | 'accent' | 'neutral'

const VARIANTS: Record<Variant, { color: string; bg: string; border: string }> = {
  green:   { color: tokens.green,  bg: tokens.greenSoft,  border: tokens.greenBorder },
  red:     { color: tokens.red,    bg: tokens.redSoft,    border: tokens.redBorder },
  amber:   { color: tokens.amber,  bg: tokens.amberSoft,  border: tokens.amberBorder },
  accent:  { color: tokens.accent, bg: tokens.accentSoft, border: tokens.accentBorder },
  neutral: { color: tokens.text2,  bg: 'transparent',     border: tokens.border },
}

interface Props {
  children: React.ReactNode
  variant?: Variant
  active?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
}

export default function Pill({ children, variant = 'neutral', active, onClick, size = 'md', type = 'button' }: Props) {
  const c = VARIANTS[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: active ? c.bg : 'transparent',
        border: `1px solid ${active ? c.border : tokens.border}`,
        color: active ? c.color : tokens.text2,
        padding: size === 'sm' ? '3px 9px' : '6px 12px',
        borderRadius: 99,
        fontSize: size === 'sm' ? 10 : 12,
        cursor: onClick ? 'pointer' : 'default',
        fontWeight: active ? 600 : 500,
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
