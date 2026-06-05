'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NoteRich from '@/components/ui/NoteRich'
import { monoFont, pnlColor, tokens } from '@/components/ui/tokens'

type Val = string | number | boolean | null

function useForm(init: Record<string, Val>) {
  const [form, setForm] = useState(init)
  const set = (key: string, val: Val) => setForm(p => ({ ...p, [key]: val }))
  return { form, set }
}

// ─── Pill row ─────────────────────────────────────────────────────
function PillRow({
  label, options, value, onChange, colors,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  colors?: Array<'green' | 'red' | 'amber' | 'accent' | 'neutral'>
}) {
  const colorMap = {
    green: tokens.green, red: tokens.red, amber: tokens.amber,
    accent: tokens.accent, neutral: tokens.text2,
  }
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((o, i) => {
          const active = o === value
          const c = colors ? colorMap[colors[i]] : tokens.accent
          return (
            <button key={o} type="button" onClick={() => onChange(active ? '' : o)} style={{
              background: active ? `color-mix(in oklch, ${c} 14%, transparent)` : 'transparent',
              border: `1px solid ${active ? `color-mix(in oklch, ${c} 30%, transparent)` : 'var(--border)'}`,
              color: active ? c : 'var(--text-2)',
              padding: '6px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
              fontWeight: active ? 600 : 500,
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}>{o}</button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────
function FieldCmd({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

const inputCmd: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 12px',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 500,
  outline: 'none',
  fontFamily: "'JetBrains Mono', monospace",
  fontFeatureSettings: '"tnum"',
  transition: 'border-color 0.15s',
}

const convictionMap: Record<string, string> = { 'A · Forte': 'A', 'B · Moyenne': 'B', 'C · Faible': 'C' }
const FEES_KEY = 'edge_fees'
const today = new Date().toISOString().slice(0, 10)
const nowTime = new Date().toTimeString().slice(0, 5)

export default function NouveauTrade() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [fees, setFees] = useState({ prio: 0.001, tip: 0.001 })

  useEffect(() => {
    const saved = localStorage.getItem(FEES_KEY)
    if (saved) { try { setFees(JSON.parse(saved)) } catch {} }
  }, [])

  const { form, set } = useForm({
    date: today,
    heure_entree: nowTime,
    token: '',
    market_cap_entree: '',
    market_cap_sortie: '',
    taille: '',
    pnl_sol: '',
    meme_narrative: '',
    entry_qualite: '',
    r1_respectee: false,
    r2_respectee: false,
    r4_respectee: false,
    sl_touche: false,
    coupe_bon_moment: false,
    coin_lent: false,
    erreur: '',
    erreur_autre: '',
    trade_aplus: false,
    bien_fait: '',
  })

  const { autoPct, autoPnlSol } = useMemo(() => {
    const mcE = parseFloat(form.market_cap_entree as string)
    const mcS = parseFloat(form.market_cap_sortie as string)
    const taille = parseFloat(form.taille as string)
    if (isNaN(mcE) || isNaN(mcS) || mcE <= 0) return { autoPct: null, autoPnlSol: null }
    const pct = ((mcS - mcE) / mcE) * 100
    if (isNaN(taille) || taille <= 0) return { autoPct: pct, autoPnlSol: null }
    const totalFees = (fees.prio + fees.tip) * 2
    const sol = taille * (mcS - mcE) / mcE - totalFees
    return { autoPct: pct, autoPnlSol: sol }
  }, [form.market_cap_entree, form.market_cap_sortie, form.taille, fees])

  const convLabel = Object.entries(convictionMap).find(([, v]) => v === form.entry_qualite)?.[0] ?? ''
  const NUM_FIELDS = ['market_cap_entree', 'market_cap_sortie', 'taille', 'pnl_sol']
  const pnlManual = useRef(false)
  const totalFees = (fees.prio + fees.tip) * 2

  useEffect(() => {
    if (!pnlManual.current && autoPnlSol !== null) {
      set('pnl_sol', String(Math.round(autoPnlSol * 1000) / 1000))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPnlSol])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, Val> = {}
      for (const [k, v] of Object.entries(form)) {
        if (v === '' || v === null) continue
        if (NUM_FIELDS.includes(k)) {
          const n = parseFloat(v as string)
          if (!isNaN(n)) {
            payload[k] = (k === 'market_cap_entree' || k === 'market_cap_sortie') ? n * 1000 : n
          }
        } else {
          payload[k] = v
        }
      }
      payload.date = form.date || today
      if (!payload.pnl_sol && autoPnlSol !== null) payload.pnl_sol = Math.round(autoPnlSol * 1000) / 1000
      if (autoPct !== null) payload.pnl_percent = Math.round(autoPct * 10) / 10

      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) router.push('/')
    } finally {
      setSaving(false)
    }
  }

  const pnlVal = autoPnlSol
  const pnlBg = pnlVal != null && pnlVal > 0
    ? 'oklch(0.74 0.16 152 / 0.08)'
    : pnlVal != null && pnlVal < 0
      ? 'oklch(0.68 0.21 22 / 0.08)'
      : 'var(--surface-2)'
  const pnlBorder = pnlVal != null && pnlVal > 0
    ? 'oklch(0.74 0.16 152 / 0.25)'
    : pnlVal != null && pnlVal < 0
      ? 'oklch(0.68 0.21 22 / 0.25)'
      : 'var(--border)'

  const disciplines = [
    { k: 'r1_respectee', l: 'R1 Narrative' },
    { k: 'r2_respectee', l: 'R2 ATH cible' },
    { k: 'r4_respectee', l: 'R4 SL −20%' },
  ] as const

  return (
    <div style={{ padding: '28px 24px 60px', display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{
        width: 760,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-strong)',
        borderRadius: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}>

        {/* Title bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>›</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Quick Capture</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>{today} · {nowTime}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>tab pour avancer · ⏎ pour save · esc</span>
            <Link href="/" className="btn-ghost" style={{ padding: '4px 10px', fontSize: 11 }}>✕</Link>
          </div>
        </div>

        {/* Numbers row */}
        <div style={{ padding: '20px 20px 14px', display: 'grid', gridTemplateColumns: '110px 1fr 1fr 1fr 90px', gap: 10, alignItems: 'end' }}>
          <FieldCmd label="Token">
            <input
              value={form.token as string}
              onChange={e => set('token', e.target.value.toUpperCase())}
              placeholder="WIF"
              required
              style={inputCmd}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </FieldCmd>
          <FieldCmd label="MC Entrée · k$">
            <input
              type="number" step="0.1" placeholder="29.9"
              value={form.market_cap_entree as string}
              onChange={e => set('market_cap_entree', e.target.value)}
              style={inputCmd}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </FieldCmd>
          <FieldCmd label="MC Sortie · k$">
            <input
              type="number" step="0.1" placeholder="89.7"
              value={form.market_cap_sortie as string}
              onChange={e => set('market_cap_sortie', e.target.value)}
              style={inputCmd}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </FieldCmd>
          <FieldCmd label="Taille · SOL">
            <input
              type="number" step="0.01" placeholder="1.5"
              value={form.taille as string}
              onChange={e => set('taille', e.target.value)}
              style={inputCmd}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </FieldCmd>
          <FieldCmd label="Date">
            <input
              type="date"
              value={form.date as string}
              onChange={e => set('date', e.target.value)}
              style={{ ...inputCmd, fontSize: 11 }}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            />
          </FieldCmd>
        </div>

        {/* Live PnL preview */}
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{
            display: 'flex', gap: 12, padding: '14px 18px', borderRadius: 10,
            background: pnlBg,
            border: `1px solid ${pnlBorder}`,
            alignItems: 'baseline', justifyContent: 'space-between',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', gap: 28, alignItems: 'baseline' }}>
              <div>
                <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>PnL</div>
                <div style={{
                  fontFamily: monoFont,
                  fontSize: 28, fontWeight: 700,
                  color: pnlVal != null ? pnlColor(pnlVal) : 'var(--text-3)',
                  letterSpacing: '-0.02em',
                }}>
                  {pnlVal != null ? `${pnlVal >= 0 ? '+' : ''}${pnlVal.toFixed(3)}` : '—'}
                  <span style={{ fontSize: 14, color: 'var(--text-3)', marginLeft: 4, fontWeight: 500 }}>SOL</span>
                </div>
              </div>
              {autoPct !== null && (
                <div>
                  <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Perf</div>
                  <div style={{
                    fontFamily: monoFont,
                    fontSize: 28, fontWeight: 700,
                    color: pnlColor(autoPct),
                    letterSpacing: '-0.02em',
                  }}>
                    {autoPct >= 0 ? '+' : ''}{autoPct.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
              fees · {totalFees.toFixed(4)} SOL
            </div>
          </div>
        </div>

        {/* Conviction · Narrative */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PillRow
            label="Conviction"
            options={['A · Forte', 'B · Moyenne', 'C · Faible']}
            value={convLabel}
            onChange={v => set('entry_qualite', convictionMap[v] ?? '')}
            colors={['green', 'amber', 'red']}
          />
          <div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>Narrative</div>
            <select
              value={form.meme_narrative as string}
              onChange={e => set('meme_narrative', e.target.value)}
              style={{
                ...inputCmd,
                fontSize: 12,
                padding: '8px 12px',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <option value="">— Choisir —</option>
              {['Animaux','Internet meme','Crypto culture','AI','Tech Narrative','Meta narrative','Political','Societal','Influencer','Trend','Tweet Play'].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Discipline */}
        <div style={{ padding: '18px 20px 12px' }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Discipline · 3 règles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {disciplines.map(r => {
              const on = form[r.k] as boolean
              return (
                <button key={r.k} type="button" onClick={() => set(r.k, !on)} style={{
                  background: on ? 'oklch(0.74 0.16 152 / 0.10)' : 'var(--surface-2)',
                  border: `1px solid ${on ? 'oklch(0.74 0.16 152 / 0.30)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 12, color: on ? 'var(--text)' : 'var(--text-2)' }}>{r.l}</span>
                  <span style={{
                    width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${on ? 'var(--green)' : 'var(--text-4)'}`,
                    background: on ? 'var(--green)' : 'transparent',
                    color: 'var(--bg)', fontSize: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on ? '✓' : ''}</span>
                </button>
              )
            })}
          </div>
          {/* Extra toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
            {([
              { k: 'sl_touche', l: 'SL touché' },
              { k: 'coupe_bon_moment', l: 'Bon moment' },
              { k: 'coin_lent', l: 'Coin lent' },
            ] as const).map(r => {
              const on = form[r.k] as boolean
              return (
                <button key={r.k} type="button" onClick={() => set(r.k, !on)} style={{
                  background: on ? 'oklch(0.74 0.14 240 / 0.08)' : 'var(--surface-2)',
                  border: `1px solid ${on ? 'oklch(0.74 0.14 240 / 0.25)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '8px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: 11, color: on ? 'var(--text)' : 'var(--text-2)' }}>{r.l}</span>
                  <span style={{
                    width: 12, height: 12, borderRadius: 3, flexShrink: 0,
                    border: `1.5px solid ${on ? 'var(--accent)' : 'var(--text-4)'}`,
                    background: on ? 'var(--accent)' : 'transparent',
                    color: 'var(--bg)', fontSize: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{on ? '✓' : ''}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Erreur */}
        <div style={{ padding: '0 20px 12px' }}>
          <PillRow
            label="Erreur"
            options={['Aucune', 'FOMO', 'Overtrade', 'Mauvais sizing', 'Pas de SL', 'Exit trop tôt', 'Autre']}
            value={form.erreur as string}
            onChange={v => set('erreur', v)}
            colors={['green', 'red', 'red', 'red', 'red', 'amber', 'neutral']}
          />
          {form.erreur === 'Autre' && (
            <input
              placeholder="Précise…"
              value={form.erreur_autre as string}
              onChange={e => set('erreur_autre', e.target.value)}
              style={{ ...inputCmd, marginTop: 8 }}
            />
          )}
        </div>

        {/* Trade A+ */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => set('trade_aplus', !form.trade_aplus)} style={{
            background: form.trade_aplus ? 'var(--amber-soft)' : 'transparent',
            border: `1px solid ${form.trade_aplus ? 'var(--amber)' : 'var(--border)'}`,
            color: form.trade_aplus ? 'var(--amber)' : 'var(--text-3)',
            padding: '6px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer',
            fontWeight: form.trade_aplus ? 600 : 500, transition: 'all 0.15s',
            fontFamily: 'inherit',
          }}>
            ★ Mark A+
          </button>
        </div>

        {/* Note */}
        <div style={{ padding: '0 20px 18px' }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Note · #tags @tokens supportés
          </div>
          <textarea
            value={form.bien_fait as string}
            onChange={e => set('bien_fait', e.target.value)}
            placeholder="Ce qui s'est passé, ce à retenir… #breakout @WIF"
            style={{
              width: '100%',
              minHeight: 80,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '12px 14px',
              color: 'var(--text)',
              fontSize: 13,
              lineHeight: 1.5,
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.4)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          {form.bien_fait && (
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
              <NoteRich value={form.bien_fait as string} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
            {['#breakout','#patience','#discipline','#fomo','#regret'].map(tag => (
              <button key={tag} type="button" onClick={() => set('bien_fait', `${form.bien_fait as string} ${tag}`.trim())} className="mono" style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text-3)', borderRadius: 99, padding: '3px 9px', fontSize: 10, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-4)' }}>⏎ save · esc cancel</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/" className="btn-ghost">Annuler</Link>
            <button type="submit" disabled={saving} style={{
              background: 'var(--text)', color: 'var(--bg)', border: 'none',
              padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              opacity: saving ? 0.6 : 1,
              fontFamily: 'inherit',
            }}>
              {saving ? 'Enregistrement…' : 'Save trade'}
              <span className="mono" style={{ fontSize: 10, opacity: 0.5 }}>⏎</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
