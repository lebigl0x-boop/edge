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

const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const FR_MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']

function formatDayLabel(date: string) {
  const [y, m, d] = date.split('-')
  return `${d} ${FR_MONTHS[parseInt(m) - 1]} ${y}`
}

interface Props {
  trades: Trade[]
}

export default function WeekView({ trades }: Props) {
  const days = getWeekDays()
  const today = new Date().toISOString().slice(0, 10)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    fetch(`/api/notes?from=${days[0]}&to=${days[6]}`)
      .then(r => r.json())
      .then((data: { date: string; note: string }[]) => {
        const map: Record<string, string> = {}
        const openMap: Record<string, boolean> = {}
        data.forEach(d => {
          map[d.date] = d.note
          if (d.note) openMap[d.date] = true
        })
        setNotes(map)
        setOpen(openMap)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleNote(date: string) {
    setOpen(prev => ({ ...prev, [date]: !prev[date] }))
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {days.map((date, i) => {
        const dayTrades = trades.filter(t => t.date === date)
        const dayPnl = dayTrades.reduce((s, t) => s + (t.pnl_sol ?? 0), 0)
        const isToday = date === today
        const hasNote = !!(notes[date]?.trim())
        const isOpen = open[date]

        return (
          <div key={date} className="card" style={{
            padding: 0,
            overflow: 'hidden',
            border: isToday ? '1px solid rgba(10,132,255,0.35)' : '1px solid rgba(255,255,255,0.04)',
          }}>
            {/* Header du jour */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: (dayTrades.length > 0 || isOpen) ? '1px solid rgba(255,255,255,0.06)' : 'none',
              background: isToday ? 'rgba(10,132,255,0.06)' : undefined,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{
                  fontSize: '0.95rem', fontWeight: 700,
                  color: isToday ? 'white' : 'rgba(255,255,255,0.6)',
                }}>
                  {DAY_NAMES_FULL[i]}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
                  {formatDayLabel(date)}
                </span>
                {isToday && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#0a84ff',
                    background: 'rgba(10,132,255,0.15)', padding: '2px 6px', borderRadius: 4,
                  }}>
                    Aujourd&apos;hui
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {dayTrades.length > 0 && (
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: dayPnl >= 0 ? '#30d158' : '#ff453a',
                  }}>
                    {dayPnl >= 0 ? '+' : ''}{dayPnl.toFixed(2)} SOL
                  </span>
                )}
                <button
                  onClick={() => toggleNote(date)}
                  style={{
                    fontSize: '0.72rem', fontWeight: 600,
                    color: hasNote ? '#0a84ff' : 'rgba(255,255,255,0.35)',
                    background: hasNote ? 'rgba(10,132,255,0.1)' : 'rgba(255,255,255,0.06)',
                    border: 'none', borderRadius: 6,
                    padding: '5px 10px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {hasNote ? '📝 Note' : '+ Note'}
                </button>
              </div>
            </div>

            {/* Trades du jour */}
            {dayTrades.length > 0 && (
              <div style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dayTrades.map(t => (
                  <Link key={t.id} href={`/trade/${t.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    textDecoration: 'none',
                  }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', minWidth: 80 }}>
                      {t.token}
                      {t.trade_aplus ? <span style={{ marginLeft: 4, fontSize: 9 }}>⭐</span> : null}
                    </span>
                    <span style={{
                      fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums',
                      color: (t.pnl_sol ?? 0) >= 0 ? '#30d158' : '#ff453a',
                      fontWeight: 600,
                    }}>
                      {(t.pnl_sol ?? 0) >= 0 ? '+' : ''}{(t.pnl_sol ?? 0).toFixed(2)} SOL
                    </span>
                    {t.type_trade && (
                      <span className="badge" style={{ background: 'rgba(10,132,255,0.1)', color: '#0a84ff', fontSize: '0.6rem' }}>
                        {t.type_trade}
                      </span>
                    )}
                    {t.meme_narrative && (
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.meme_narrative}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Note journalière (dépliable) */}
            {isOpen && (
              <div style={{ padding: '12px 20px', borderTop: dayTrades.length > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <textarea
                  autoFocus
                  value={notes[date] ?? ''}
                  onChange={e => handleNoteChange(date, e.target.value)}
                  placeholder="Compte rendu du jour, mindset, observations de marché..."
                  style={{
                    width: '100%',
                    minHeight: 90,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    padding: '10px 12px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(10,132,255,0.4)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                />
                {saving[date] && (
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginTop: 4, textAlign: 'right' }}>
                    Sauvegarde...
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
