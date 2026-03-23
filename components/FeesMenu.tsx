'use client'

import { useState, useEffect, useRef } from 'react'

const FEES_KEY = 'edge_fees'

export default function FeesMenu() {
  const [open, setOpen] = useState(false)
  const [fees, setFees] = useState({ prio: 0.001, tip: 0.001 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(FEES_KEY)
    if (saved) { try { setFees(JSON.parse(saved)) } catch {} }
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  function update(key: 'prio' | 'tip', val: string) {
    const n = parseFloat(val)
    const next = { ...fees, [key]: isNaN(n) ? fees[key] : n }
    setFees(next)
    localStorage.setItem(FEES_KEY, JSON.stringify(next))
  }

  const totalFees = (fees.prio + fees.tip) * 2

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Paramètres frais"
        style={{
          background: open ? 'rgba(255,255,255,0.08)' : 'none',
          border: 'none', cursor: 'pointer',
          width: 32, height: 32, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
          fontSize: 16, transition: 'all 0.15s',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
      >
        ⚙
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#1a1a1a',
          borderRadius: 12,
          padding: 16,
          minWidth: 220,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          zIndex: 200,
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
            Frais par transaction
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Priority fee</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" step="0.0001" min="0"
                  value={fees.prio}
                  onChange={e => update('prio', e.target.value)}
                  style={{
                    width: 80, background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7,
                    padding: '4px 8px', color: 'white', fontSize: '0.8rem',
                    fontFamily: 'inherit', outline: 'none', textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>SOL</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Tip (Jito)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="number" step="0.0001" min="0"
                  value={fees.tip}
                  onChange={e => update('tip', e.target.value)}
                  style={{
                    width: 80, background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7,
                    padding: '4px 8px', color: 'white', fontSize: '0.8rem',
                    fontFamily: 'inherit', outline: 'none', textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>SOL</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Total (buy + sell)</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontVariantNumeric: 'tabular-nums' }}>
              −{totalFees.toFixed(4)} SOL
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
