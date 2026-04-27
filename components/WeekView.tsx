'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import { monoFont, pnlColor, fmtPnl } from '@/components/ui/tokens'

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

const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const FR_MONTHS = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']

function fmtDay(date: string) {
  const [, m, d] = date.split('-')
  return `${parseInt(d)} ${FR_MONTHS[parseInt(m) - 1]}`
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

  // Week summary
  const weekTrades = trades
  const weekPnl = weekTrades.reduce((s, t) => s + (t.pnl_sol ?? 0), 0)
  const weekWins = weekTrades.filter(t => (t.pnl_sol ?? 0) > 0).length
  const weekLosses = weekTrades.filter(t => (t.pnl_sol ?? 0) < 0).length
  const weekAplus = weekTrades.filter(t => t.trade_aplus).length

  // Week number
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Week header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Semaine {weekNum} · {fmtDay(days[0])} → {fmtDay(days[6])}
          </h2>
          <div style={{ fontFamily: monoFont, fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            {weekTrades.length} trades
            {' · '}
            <span style={{ color: pnlColor(weekPnl) }}>{fmtPnl(weekPnl)} SOL</span>
            {' · '}{weekWins}W / {weekLosses}L
            {weekAplus > 0 && ` · ${weekAplus} A+`}
          </div>
        </div>
      </div>

      {/* 7-day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {days.map((date, i) => {
          const dayTrades = trades.filter(t => t.date === date)
          const dayPnl = dayTrades.reduce((s, t) => s + (t.pnl_sol ?? 0), 0)
          const isToday = date === today
          const hasNote = !!(notes[date]?.trim())
          const isOpen = open[date]
          const empty = dayTrades.length === 0

          return (
            <div key={date} style={{
              background: 'var(--surface-1)',
              border: `1px solid ${isToday ? 'oklch(0.74 0.14 240 / 0.35)' : 'var(--border)'}`,
              borderRadius: 10,
              overflow: 'hidden',
              opacity: empty && !isToday ? 0.5 : 1,
              display: 'flex', flexDirection: 'column',
              minHeight: 130,
            }}>
              {/* Day header */}
              <div style={{
                padding: '10px 10px 8px',
                background: isToday ? 'oklch(0.74 0.14 240 / 0.06)' : undefined,
                borderBottom: (dayTrades.length > 0 || isOpen) ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isToday ? 'var(--text)' : 'var(--text-2)' }}>
                    {DAY_SHORT[i]}
                  </span>
                  <span style={{ fontFamily: monoFont, fontSize: 9, color: 'var(--text-4)' }}>{fmtDay(date)}</span>
                </div>
                {!empty && (
                  <div style={{ fontFamily: monoFont, fontSize: 15, fontWeight: 700, color: pnlColor(dayPnl), letterSpacing: '-0.01em', marginTop: 4 }}>
                    {fmtPnl(dayPnl)}
                  </div>
                )}
                {empty && isToday && (
                  <div style={{ fontFamily: monoFont, fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>—</div>
                )}
              </div>

              {/* Trades */}
              {dayTrades.length > 0 && (
                <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                  {dayTrades.slice(0, 5).map(t => (
                    <Link key={t.id} href={`/trade/${t.id}`} style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: monoFont, fontSize: 10,
                      textDecoration: 'none',
                      padding: '2px 0',
                    }}>
                      <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>
                        {t.token}
                        {t.trade_aplus ? <span style={{ color: 'var(--amber)', marginLeft: 3, fontSize: 8 }}>★</span> : null}
                      </span>
                      <span style={{ color: pnlColor(t.pnl_sol ?? 0) }}>
                        {fmtPnl(t.pnl_sol ?? 0, 1)}
                      </span>
                    </Link>
                  ))}
                  {dayTrades.length > 5 && (
                    <span style={{ fontFamily: monoFont, fontSize: 9, color: 'var(--text-4)' }}>
                      +{dayTrades.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Note button */}
              <div style={{ padding: '6px 8px', marginTop: 'auto' }}>
                <button
                  onClick={() => setOpen(prev => ({ ...prev, [date]: !prev[date] }))}
                  style={{
                    fontSize: 9,
                    color: hasNote ? 'var(--accent)' : 'var(--text-4)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '2px 0', fontFamily: 'inherit',
                    transition: 'color 0.15s',
                  }}
                >
                  {hasNote ? '📝 Note' : '+ Note'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Expanded notes */}
      {days.some(d => open[d]) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
          {days.filter(d => open[d]).map(date => (
            <div key={date} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                {DAY_SHORT[days.indexOf(date)]} · {fmtDay(date)}
                {saving[date] && <span style={{ marginLeft: 8, color: 'var(--text-4)' }}>saving…</span>}
              </div>
              <textarea
                autoFocus={days.filter(d => open[d])[0] === date}
                value={notes[date] ?? ''}
                onChange={e => handleNoteChange(date, e.target.value)}
                placeholder="Compte rendu du jour, mindset, observations…"
                style={{
                  width: '100%', minHeight: 80,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  color: 'var(--text-2)', fontSize: '0.8rem', lineHeight: 1.55,
                  padding: '8px 10px', resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom recap */}
      {weekTrades.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Bilan */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Bilan de la semaine
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {(() => {
                const sorted = [...weekTrades].filter(t => t.pnl_sol !== null).sort((a, b) => (b.pnl_sol ?? 0) - (a.pnl_sol ?? 0))
                const best = sorted[0]
                const worst = sorted[sorted.length - 1]
                const dayPnls = days.map(d => ({
                  date: d,
                  pnl: weekTrades.filter(t => t.date === d).reduce((s, t) => s + (t.pnl_sol ?? 0), 0),
                }))
                const bestDay = dayPnls.sort((a, b) => b.pnl - a.pnl)[0]
                const items = [
                  { k: 'Best trade', v: best ? `${best.token} ${fmtPnl(best.pnl_sol ?? 0)} SOL` : '—', c: 'green' },
                  { k: 'Worst trade', v: worst && worst !== best ? `${worst.token} ${fmtPnl(worst.pnl_sol ?? 0)} SOL` : '—', c: 'red' },
                  { k: 'Best day', v: bestDay?.pnl !== 0 ? `${DAY_SHORT[days.indexOf(bestDay?.date)]} ${fmtPnl(bestDay?.pnl ?? 0)}` : '—', c: 'green' },
                  { k: 'Trades', v: `${weekTrades.length}`, c: null },
                  { k: 'Win / Loss', v: `${weekWins} / ${weekLosses}`, c: null },
                  { k: 'A+ trades', v: String(weekAplus), c: weekAplus > 0 ? 'amber' : null },
                ]
                return items.map(({ k, v, c }) => (
                  <div key={k}>
                    <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{k}</div>
                    <div style={{
                      fontFamily: monoFont, fontSize: 13, fontWeight: 600, marginTop: 4,
                      color: c === 'green' ? 'var(--green)' : c === 'red' ? 'var(--red)' : c === 'amber' ? 'var(--amber)' : 'var(--text)',
                    }}>{v}</div>
                  </div>
                ))
              })()}
            </div>
          </div>

          {/* Tags & notes de la semaine */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontFamily: monoFont, fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Tags de la semaine
            </div>
            {(() => {
              const allText = [
                ...weekTrades.map(t => t.bien_fait ?? ''),
                ...Object.values(notes),
              ].join(' ')
              const tagMap = new Map<string, number>()
              ;(allText.match(/[#@]\S+/g) ?? []).forEach(t => {
                tagMap.set(t, (tagMap.get(t) ?? 0) + 1)
              })
              const tags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1])
              if (tags.length === 0) return (
                <div style={{ color: 'var(--text-4)', fontSize: 12 }}>Aucun tag cette semaine</div>
              )
              return (
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {tags.map(([tag, count]) => (
                    <span key={tag} style={{
                      fontFamily: monoFont,
                      fontSize: 10, padding: '3px 8px', borderRadius: 99,
                      background: tag.startsWith('#') ? 'oklch(0.74 0.14 240 / 0.10)' : 'oklch(0.72 0.16 290 / 0.10)',
                      color: tag.startsWith('#') ? 'var(--accent)' : 'var(--violet)',
                    }}>
                      {tag} <span style={{ opacity: 0.5 }}>{count}</span>
                    </span>
                  ))}
                </div>
              )
            })()}
          </div>

        </div>
      )}
    </div>
  )
}
