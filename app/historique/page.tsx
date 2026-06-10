'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import { pnlColor, monoFont, fmtPnl } from '@/components/ui/tokens'

function fmt(n: number | null | undefined, d = 2) {
  if (n == null || isNaN(n)) return '—'
  return n.toFixed(d)
}

type SortKey = 'date' | 'pnl_sol' | 'token'

export default function HistoriquePage() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('date')
  const [asc, setAsc] = useState(false)

  useEffect(() => {
    fetch('/api/trades?cycle=v1-historique')
      .then(r => r.json())
      .then((d: Trade[]) => setTrades(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let t = trades
    if (search.trim()) {
      const q = search.toLowerCase()
      t = t.filter(x => x.token.toLowerCase().includes(q) || (x.meme_narrative ?? '').toLowerCase().includes(q))
    }
    return [...t].sort((a, b) => {
      let cmp = 0
      if (sort === 'date') cmp = a.date.localeCompare(b.date)
      else if (sort === 'pnl_sol') cmp = (a.pnl_sol ?? 0) - (b.pnl_sol ?? 0)
      else if (sort === 'token') cmp = a.token.localeCompare(b.token)
      return asc ? cmp : -cmp
    })
  }, [trades, search, sort, asc])

  const totalPnl = trades.reduce((s, t) => s + (t.pnl_sol ?? 0), 0)
  const wins = trades.filter(t => (t.pnl_sol ?? 0) > 0).length
  const wr = trades.length > 0 ? wins / trades.length * 100 : 0

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc(v => !v)
    else { setSort(key); setAsc(false) }
  }

  function SortBtn({ k, label }: { k: SortKey; label: string }) {
    const active = sort === k
    return (
      <button onClick={() => toggleSort(k)} className="mono" style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px',
        color: active ? 'var(--text)' : 'var(--text-3)', fontSize: 9.5,
        fontWeight: active ? 700 : 500,
        letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        {label}
        {active && <span style={{ fontSize: 8 }}>{asc ? '↑' : '↓'}</span>}
      </button>
    )
  }

  return (
    <div style={{ padding: '24px 20px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Historique v1
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Trades antérieurs au flux pré-engagement · lecture seule
          </p>
        </div>
        <Link href="/" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px' }}>
          ← Dashboard
        </Link>
      </div>

      {/* Summary */}
      {!loading && trades.length > 0 && (
        <div style={{
          display: 'flex', gap: 20, flexWrap: 'wrap',
          padding: '12px 16px', marginBottom: 16,
          background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {trades.length} trades
          </span>
          <span style={{ fontFamily: monoFont, fontSize: 14, fontWeight: 700, color: pnlColor(totalPnl) }}>
            {fmtPnl(totalPnl)} SOL
          </span>
          <span className="mono" style={{ fontSize: 12, color: wr >= 50 ? 'var(--green)' : 'var(--amber)' }}>
            {fmt(wr, 0)}% WR
          </span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {wins}W / {trades.length - wins}L
          </span>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Chercher un token ou une narrative…"
          style={{
            width: '100%', maxWidth: 360,
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
            fontFamily: 'inherit',
          }}
        />
      </div>

      {loading && <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-4)' }}>Chargement…</div>}

      {!loading && filtered.length === 0 && (
        <div style={{
          padding: 60, textAlign: 'center',
          background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📂</div>
          <div style={{ fontSize: 14, color: 'var(--text-3)' }}>
            {search ? 'Aucun résultat' : 'Aucun trade v1-historique'}
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '70px 100px 1fr 100px 80px 80px 80px',
            gap: 10, padding: '8px 16px',
            borderBottom: '1px solid var(--border)',
          }}>
            <SortBtn k="date" label="Date" />
            <SortBtn k="token" label="Token" />
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Narrative</span>
            <SortBtn k="pnl_sol" label="PnL SOL" />
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Conv</span>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Erreur</span>
            <span className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>R1·R2·R4</span>
          </div>

          {filtered.map(t => {
            const conv = t.entry_qualite
            const convColor = conv === 'A' ? 'var(--green)' : conv === 'B' ? 'var(--amber)' : conv === 'C' ? 'var(--red)' : 'var(--text-4)'
            const hasErr = t.erreur && t.erreur !== 'Aucune'
            const errLabel = t.erreur === 'Autre' && t.erreur_autre ? t.erreur_autre.split(' ')[0] : (t.erreur ?? '—')
            const disc = [t.r1_respectee, t.r2_respectee, t.r4_respectee]

            return (
              <div key={t.id} className="mono" style={{
                display: 'grid',
                gridTemplateColumns: '70px 100px 1fr 100px 80px 80px 80px',
                gap: 10, padding: '9px 16px', fontSize: 12,
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-3)' }}>{t.date?.slice(5) ?? '—'}</span>
                <span style={{ fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t.token}
                  {t.trade_aplus && <span style={{ fontSize: 8, color: 'var(--amber)', border: '1px solid var(--amber)', padding: '1px 3px', borderRadius: 3 }}>A+</span>}
                </span>
                <span style={{ color: 'var(--text-3)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.meme_narrative || '—'}
                </span>
                <span style={{ color: t.pnl_sol != null ? pnlColor(t.pnl_sol) : 'var(--text-4)', fontWeight: 600, textAlign: 'right' }}>
                  {t.pnl_sol != null ? `${fmtPnl(t.pnl_sol)} SOL` : '—'}
                </span>
                <span style={{ color: convColor }}>{conv ?? '—'}</span>
                <span style={{ color: hasErr ? 'var(--red)' : 'var(--text-4)', fontSize: 11 }}>
                  {hasErr ? errLabel : '—'}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {disc.map((v, i) => (
                    <div key={i} style={{
                      width: 14, height: 14, borderRadius: 3, fontSize: 8,
                      background: v ? 'oklch(0.74 0.16 152 / 0.15)' : 'var(--surface-3)',
                      border: `1px solid ${v ? 'oklch(0.74 0.16 152 / 0.4)' : 'var(--border)'}`,
                      color: v ? 'var(--green)' : 'var(--text-4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {v ? '✓' : ''}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
