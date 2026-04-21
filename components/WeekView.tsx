'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types/trade'

function getWeekDays(): string[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface Props {
  trades: Trade[]
}

export default function WeekView({ trades }: Props) {
  const days = getWeekDays()
  const today = new Date().toISOString().slice(0, 10)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    fetch(`/api/notes?from=${days[0]}&to=${days[6]}`)
      .then(r => r.json())
      .then((data: { date: string; note: string }[]) => {
        const map: Record<string, string> = {}
        data.forEach(d => { map[d.date] = d.note })
        setNotes(map)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleNoteChange(date: string, value: string) {
    setNotes(prev => ({ ...prev, [date]: value }))
    clearTimeout(timers.current[date])
    timers.current[date] = setTimeout(() => {
      setSaving(prev => ({ ...prev, [date]: true }))
      fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, note: value }),
      })
        .then(() => setSaving(prev => ({ ...prev, [date]: false })))
        .catch(() => setSaving(prev => ({ ...prev, [date]: false })))
    }, 600)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 10,
    }}>
      {days.map((date, i) => {
        const dayTrades = trades.filter(t => t.date === date)
        const dayPnl = dayTrades.reduce((s, t) => s + (t.pnl_sol ?? 0), 0)
        const isToday = date === today

        return (
          <div
            key={date}
            className="card"
            style={{
              padding: 14,
              border: isToday ? '1px solid rgba(10,132,255,0.5)' : '1px solid rgba(255,255,255,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* En-tête jour */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <div style={{
                  fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: isToday ? '#0a84ff' : 'rgba(255,255,255,0.3)',
                }}>
                  {DAY_NAMES[i]}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: isToday ? 'white' : 'rgba(255,255,255,0.55)' }}>
                  {date.slice(8)}
                </div>
              </div>
              {dayTrades.length > 0 && (
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  color: dayPnl >= 0 ? '#30d158' : '#ff453a',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {dayPnl >= 0 ? '+' : ''}{dayPnl.toFixed(2)}
                </div>
              )}
            </div>

            {/* Trades du jour */}
            {dayTrades.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayTrades.map(t => (
                  <Link
                    key={t.id}
                    href={`/trade/${t.id}`}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 6px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      textDecoration: 'none',
                      gap: 6,
                    }}
                  >
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.token}
                      {t.trade_aplus ? <span style={{ marginLeft: 3, fontSize: 9 }}>⭐</span> : null}
                    </span>
                    <span style={{
                      fontSize: '0.68rem', fontVariantNumeric: 'tabular-nums', flexShrink: 0,
                      color: (t.pnl_sol ?? 0) >= 0 ? '#30d158' : '#ff453a',
                    }}>
                      {(t.pnl_sol ?? 0) >= 0 ? '+' : ''}{(t.pnl_sol ?? 0).toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>
                Aucun trade
              </div>
            )}

            {/* Note journalière */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <textarea
                value={notes[date] ?? ''}
                onChange={e => handleNoteChange(date, e.target.value)}
                placeholder="Compte rendu du jour..."
                style={{
                  flex: 1,
                  minHeight: 80,
                  width: '100%',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.72rem',
                  lineHeight: 1.6,
                  padding: '8px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
              />
              {saving[date] && (
                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', textAlign: 'right' }}>
                  Sauvegarde...
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
