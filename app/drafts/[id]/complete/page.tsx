'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { Trade } from '@/types/trade'
import { pnlColor, monoFont } from '@/components/ui/tokens'

const FEES_KEY = 'edge_fees'

const inp: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: '14px 14px',
  color: 'var(--text)',
  fontSize: 16,
  fontWeight: 500,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  WebkitAppearance: 'none',
}

const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
  letterSpacing: '0.10em', textTransform: 'uppercase' as const,
  marginBottom: 7, display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
}

function Field({ l, children }: { l: string; children: React.ReactNode }) {
  return <div><span style={lbl}>{l}</span>{children}</div>
}

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.5)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--border)'
}

function Toggle({ label, value, onChange, big }: { label: string; value: boolean | null; onChange: (v: boolean) => void; big?: boolean }) {
  if (big) {
    return (
      <div>
        <span style={lbl}>{label}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[true, false].map(v => {
            const isSelected = value === v
            const c = v ? 'var(--green)' : 'var(--red)'
            return (
              <button key={String(v)} type="button" onClick={() => onChange(v)} style={{
                padding: '18px', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                background: isSelected ? `color-mix(in oklch, ${c} 14%, transparent)` : 'var(--surface-2)',
                border: `2px solid ${isSelected ? c : 'var(--border)'}`,
                color: isSelected ? c : 'var(--text-3)',
                transition: 'all 0.15s',
              }}>
                {v ? '✓ Oui' : '✗ Non'}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px',
      background: 'var(--surface-2)', borderRadius: 10,
      border: `1px solid ${value ? 'oklch(0.74 0.14 240 / 0.25)' : 'var(--border)'}`,
      cursor: 'pointer',
    }} onClick={() => onChange(!value)}>
      <span style={{ fontSize: 14, color: value ? 'var(--text)' : 'var(--text-2)' }}>{label}</span>
      <div style={{
        width: 36, height: 22, borderRadius: 99,
        background: value ? 'var(--accent)' : 'var(--surface-3)',
        position: 'relative', transition: 'background 0.15s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 17 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: 'white', transition: 'left 0.15s',
        }} />
      </div>
    </div>
  )
}

export default function CompleteTrade() {
  const { id } = useParams()
  const router = useRouter()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fees, setFees] = useState({ prio: 0.001, tip: 0.001 })

  // Form
  const [mcEntree, setMcEntree] = useState('')
  const [mcSortie, setMcSortie] = useState('')
  const [pnlSol, setPnlSol] = useState('')
  const [athConstate, setAthConstate] = useState('')
  const [venteDansPlan, setVenteDansPlan] = useState<boolean | null>(null)
  const [slTouche, setSlTouche] = useState(false)
  const [coinLent, setCoinLent] = useState(false)
  const [tradeAplus, setTradeAplus] = useState(false)
  const [note, setNote] = useState('')
  const pnlManual = useRef(false)

  useEffect(() => {
    const saved = localStorage.getItem(FEES_KEY)
    if (saved) { try { setFees(JSON.parse(saved)) } catch {} }
  }, [])

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then(r => r.json())
      .then((t: Trade) => {
        setTrade(t)
        // Pré-remplir les champs déjà connus (auto-import)
        if (t.market_cap_entree != null) setMcEntree(String(t.market_cap_entree / 1000))
        if (t.market_cap_sortie != null) { setMcSortie(String(t.market_cap_sortie / 1000)); }
        if (t.pnl_sol != null) { setPnlSol(String(t.pnl_sol)); pnlManual.current = true }
        setSlTouche(Boolean(t.sl_touche))
        setCoinLent(Boolean(t.coin_lent))
        setTradeAplus(Boolean(t.trade_aplus))
        setNote(t.bien_fait ?? '')
        setLoaded(true)
      })
  }, [id])

  const { autoPct, autoPnlSol } = useMemo(() => {
    const mcE = parseFloat(mcEntree)
    const mcS = parseFloat(mcSortie)
    const taille = trade?.taille ?? 0
    if (isNaN(mcE) || isNaN(mcS) || mcE <= 0) return { autoPct: null, autoPnlSol: null }
    const pct = ((mcS - mcE) / mcE) * 100
    if (!taille || taille <= 0) return { autoPct: pct, autoPnlSol: null }
    const totalFees = (fees.prio + fees.tip) * 2
    return { autoPct: pct, autoPnlSol: taille * (mcS - mcE) / mcE - totalFees }
  }, [mcEntree, mcSortie, trade?.taille, fees])

  useEffect(() => {
    if (!pnlManual.current && autoPnlSol !== null) {
      setPnlSol(String(Math.round(autoPnlSol * 1000) / 1000))
    }
  }, [autoPnlSol])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        // Champs du pré-trade (conserver)
        token: trade?.token,
        meme_narrative: trade?.meme_narrative,
        pourquoi_pump: trade?.pourquoi_pump,
        mc_cible: trade?.mc_cible,
        mc_invalidation: trade?.mc_invalidation,
        plan_sortie: trade?.plan_sortie,
        entry_qualite: trade?.entry_qualite,
        taille: trade?.taille,
        date: trade?.date,
        heure_entree: trade?.heure_entree,
        // Complétion post-trade
        market_cap_entree: mcEntree ? parseFloat(mcEntree) * 1000 : trade?.market_cap_entree,
        market_cap_sortie: mcSortie ? parseFloat(mcSortie) * 1000 : trade?.market_cap_sortie,
        pnl_sol: pnlSol ? parseFloat(pnlSol) : (autoPnlSol ?? trade?.pnl_sol),
        pnl_percent: autoPct ?? trade?.pnl_percent,
        ath_constate: athConstate ? parseFloat(athConstate) * 1000 : null,
        vente_dans_plan: venteDansPlan,
        sl_touche: slTouche,
        coin_lent: coinLent,
        trade_aplus: tradeAplus,
        bien_fait: note,
        // R1/R2 auto-validés par le flux pré-trade
        r1_respectee: true,
        r2_respectee: true,
      }

      const res = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) router.push('/drafts')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px', color: 'var(--text-4)', textAlign: 'center' }}>
        Chargement…
      </div>
    )
  }

  const pnlVal = pnlSol ? parseFloat(pnlSol) : autoPnlSol

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>
            Post-trade
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600 }}>
            {trade?.token}
            {trade?.entry_qualite && (
              <span style={{
                marginLeft: 8, fontSize: 11,
                color: trade.entry_qualite === 'A' ? 'var(--green)' : trade.entry_qualite === 'B' ? 'var(--amber)' : 'var(--red)',
                border: `1px solid currentColor`, borderRadius: 4, padding: '1px 5px',
              }}>
                {trade.entry_qualite === 'A' ? 'Forte' : trade.entry_qualite === 'B' ? 'Moyenne' : 'Faible'}
              </span>
            )}
          </div>
          {/* Rappel du plan */}
          {trade?.plan_sortie && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.4 }}>
              Plan : {trade.plan_sortie}
            </div>
          )}
        </div>
        <Link href="/drafts" style={{
          color: 'var(--text-3)', fontSize: 12, textDecoration: 'none',
          border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px',
          whiteSpace: 'nowrap',
        }}>← Drafts</Link>
      </div>

      {/* Infos pré-trade en lecture seule */}
      {(trade?.mc_cible || trade?.mc_invalidation) && (
        <div style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16,
          padding: '10px 14px',
          background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10,
        }}>
          {trade.mc_cible && (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Cible : <span style={{ color: 'var(--green)', fontWeight: 600 }}>{(trade.mc_cible / 1000).toFixed(0)}k</span>
            </span>
          )}
          {trade.mc_invalidation && (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Inval : <span style={{ color: 'var(--red)', fontWeight: 600 }}>{(trade.mc_invalidation / 1000).toFixed(0)}k</span>
            </span>
          )}
          {trade.taille && (
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Taille : <span style={{ color: 'var(--text)', fontWeight: 600 }}>{trade.taille} SOL</span>
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* MC + PnL */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 18px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field l="MC entrée · k$">
                <input
                  type="number" inputMode="decimal" step="0.1" placeholder="25"
                  value={mcEntree}
                  onChange={e => setMcEntree(e.target.value)}
                  style={inp}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </Field>
              <Field l="MC sortie · k$">
                <input
                  type="number" inputMode="decimal" step="0.1" placeholder="80"
                  value={mcSortie}
                  onChange={e => setMcSortie(e.target.value)}
                  style={inp}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field l="PnL · SOL">
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" inputMode="decimal" step="0.001"
                    value={pnlSol}
                    onChange={e => { pnlManual.current = true; setPnlSol(e.target.value) }}
                    placeholder="auto"
                    style={inp}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  {pnlManual.current && autoPnlSol !== null && (
                    <button type="button" onClick={() => { pnlManual.current = false; setPnlSol(String(Math.round(autoPnlSol * 1000) / 1000)) }}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      reset
                    </button>
                  )}
                </div>
              </Field>
              <Field l="ATH constaté · k$">
                <input
                  type="number" inputMode="decimal" step="0.1" placeholder="150"
                  value={athConstate}
                  onChange={e => setAthConstate(e.target.value)}
                  style={inp}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </Field>
            </div>

            {/* PnL preview */}
            {pnlVal !== null && pnlVal !== undefined && !isNaN(pnlVal) && (
              <div style={{
                marginTop: 14, padding: '12px 14px', borderRadius: 10,
                background: pnlVal >= 0 ? 'oklch(0.74 0.16 152 / 0.08)' : 'oklch(0.68 0.21 22 / 0.08)',
                border: `1px solid ${pnlVal >= 0 ? 'oklch(0.74 0.16 152 / 0.25)' : 'oklch(0.68 0.21 22 / 0.25)'}`,
                display: 'flex', gap: 16, alignItems: 'baseline',
              }}>
                <span style={{
                  fontFamily: monoFont, fontSize: 28, fontWeight: 800,
                  color: pnlColor(pnlVal), letterSpacing: '-0.02em',
                }}>
                  {pnlVal >= 0 ? '+' : ''}{pnlVal.toFixed(3)}
                  <span style={{ fontSize: 14, color: 'var(--text-3)', marginLeft: 4, fontWeight: 500 }}>SOL</span>
                </span>
                {autoPct !== null && (
                  <span style={{ fontFamily: monoFont, fontSize: 20, fontWeight: 700, color: pnlColor(autoPct) }}>
                    {autoPct >= 0 ? '+' : ''}{autoPct.toFixed(0)}%
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Vente dans le plan — champ clé */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 18px 20px' }}>
            <Toggle
              label="Vente dans le plan ?"
              value={venteDansPlan}
              onChange={setVenteDansPlan}
              big
            />
          </div>

          {/* Toggles secondaires */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Toggle label="SL touché" value={slTouche} onChange={setSlTouche} />
              <Toggle label="Coin lent / stagné" value={coinLent} onChange={setCoinLent} />
              <Toggle label="Trade A+" value={tradeAplus} onChange={setTradeAplus} />
            </div>
          </div>

          {/* Note */}
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 18px 20px' }}>
            <Field l="Note rapide">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ce qui s'est passé, ce que tu retiens…"
                rows={3}
                style={{ ...inp, resize: 'vertical', minHeight: 80, lineHeight: 1.5, fontSize: 14 }}
                onFocus={focusStyle}
                onBlur={blurStyle}
              />
            </Field>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              background: saving ? 'var(--surface-3)' : 'var(--text)',
              color: saving ? 'var(--text-3)' : 'var(--bg)',
              border: 'none', borderRadius: 12,
              padding: '18px', fontSize: 16, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            {saving ? 'Enregistrement…' : 'Clôturer le trade →'}
          </button>

        </div>
      </form>
    </div>
  )
}
