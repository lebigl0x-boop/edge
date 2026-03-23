'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import type { Trade } from '@/types/trade'

type Val = string | number | boolean | null

function useForm(init: Record<string, Val>) {
  const [form, setForm] = useState(init)
  const set = (key: string, val: Val) => setForm(p => ({ ...p, [key]: val }))
  return { form, set, setAll: setForm }
}

function Pills({ options, value, onChange, colorClass }: {
  options: string[]
  value: string
  onChange: (v: string) => void
  colorClass?: (o: string) => string
}) {
  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o
        const cls = active ? (colorClass ? colorClass(o) : 'pill-blue') : ''
        return (
          <button key={o} type="button" className={`radio-pill ${cls}`} onClick={() => onChange(active ? '' : o)}>
            {o}
          </button>
        )
      })}
    </div>
  )
}

function Toggle({ label, sub, value, onChange }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row" style={{ alignItems: sub ? 'flex-start' : 'center' }}>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 2, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      <button type="button" className={`toggle-btn ${value ? 'on' : 'off'}`} style={{ marginTop: sub ? 2 : 0 }} onClick={() => onChange(!value)} />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="form-section">
      <div className="section-label">{title}</div>
      {children}
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field-wrap">
      <label className="field-label">
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 5 }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const convictionMap: Record<string, string> = { Forte: 'A', Moyenne: 'B', Faible: 'C' }
const FEES_KEY = 'edge_fees'

const EMPTY: Record<string, Val> = {
  date: '', heure_entree: '', token: '',
  market_cap_entree: '', market_cap_sortie: '',
  taille: '', pnl_sol: '', type_trade: '',
  meme_narrative: '', entry_qualite: '', marche_global: '',
  r1_respectee: false, r2_respectee: false, r3_respectee: false, r4_respectee: false,
  sl_touche: false, coupe_bon_moment: false, coin_lent: false,
  erreur: '', erreur_autre: '', trade_aplus: false, bien_fait: '',
}

export default function EditTrade() {
  const { id } = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [fees, setFees] = useState({ prio: 0.001, tip: 0.001 })
  const { form, set, setAll } = useForm(EMPTY)

  useEffect(() => {
    const saved = localStorage.getItem(FEES_KEY)
    if (saved) { try { setFees(JSON.parse(saved)) } catch {} }
  }, [])

  // Load existing trade
  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then(r => r.json())
      .then((t: Trade) => {
        setAll({
          date: t.date ?? '',
          heure_entree: t.heure_entree ?? '',
          token: t.token ?? '',
          // MC stored as full $, display in k$
          market_cap_entree: t.market_cap_entree != null ? String(t.market_cap_entree / 1000) : '',
          market_cap_sortie: t.market_cap_sortie != null ? String(t.market_cap_sortie / 1000) : '',
          taille: t.taille != null ? String(t.taille) : '',
          pnl_sol: t.pnl_sol != null ? String(t.pnl_sol) : '',
          type_trade: t.type_trade ?? '',
          meme_narrative: t.meme_narrative ?? '',
          entry_qualite: t.entry_qualite ?? '',
          marche_global: t.marche_global ?? '',
          r1_respectee: Boolean(t.r1_respectee),
          r2_respectee: Boolean(t.r2_respectee),
          r3_respectee: Boolean(t.r3_respectee),
          r4_respectee: Boolean(t.r4_respectee),
          sl_touche: Boolean(t.sl_touche),
          coupe_bon_moment: Boolean(t.coupe_bon_moment),
          coin_lent: Boolean(t.coin_lent),
          erreur: t.erreur ?? '',
          erreur_autre: t.erreur_autre ?? '',
          trade_aplus: Boolean(t.trade_aplus),
          bien_fait: t.bien_fait ?? '',
        })
        pnlManual.current = true // don't auto-override loaded PnL
        setLoaded(true)
      })
  }, [id])

  const { autoPct, autoPnlSol } = useMemo(() => {
    const mcE = parseFloat(form.market_cap_entree as string)
    const mcS = parseFloat(form.market_cap_sortie as string)
    const taille = parseFloat(form.taille as string)
    if (isNaN(mcE) || isNaN(mcS) || mcE <= 0) return { autoPct: null, autoPnlSol: null }
    const pct = ((mcS - mcE) / mcE) * 100
    if (isNaN(taille) || taille <= 0) return { autoPct: pct, autoPnlSol: null }
    const totalFees = (fees.prio + fees.tip) * 2
    return { autoPct: pct, autoPnlSol: taille * (mcS - mcE) / mcE - totalFees }
  }, [form.market_cap_entree, form.market_cap_sortie, form.taille, fees])

  const convictionLabel = Object.entries(convictionMap).find(([, v]) => v === form.entry_qualite)?.[0] ?? ''
  const pnlManual = useRef(true)
  const NUM_FIELDS = ['market_cap_entree', 'market_cap_sortie', 'taille', 'pnl_sol']
  const totalFees = (fees.prio + fees.tip) * 2
  const hasPnlPreview = autoPct !== null || autoPnlSol !== null

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
      if (!payload.pnl_sol && autoPnlSol !== null) {
        payload.pnl_sol = Math.round(autoPnlSol * 1000) / 1000
      }
      if (autoPct !== null) {
        payload.pnl_percent = Math.round(autoPct * 10) / 10
      }

      const res = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) router.push(`/trade/${id}`)
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) {
    return <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>Chargement...</div>
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href={`/trade/${id}`} className="btn-ghost">← Retour</Link>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Modifier — <span style={{ color: 'rgba(255,255,255,0.5)' }}>{form.token as string}</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit}>

        {/* 1. Le Trade */}
        <Section title="Le Trade">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Token">
              <input
                className="input-field" placeholder="WIF"
                value={form.token as string}
                onChange={e => set('token', e.target.value.toUpperCase())}
                required
              />
            </Field>
            <Field label="Type">
              <Pills
                options={['Early', 'Breakout', 'Momentum', 'Rotation']}
                value={form.type_trade as string}
                onChange={v => set('type_trade', v)}
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Date">
              <input type="date" className="input-field" value={form.date as string} onChange={e => set('date', e.target.value)} required />
            </Field>
            <Field label="Heure">
              <input type="time" className="input-field" value={form.heure_entree as string} onChange={e => set('heure_entree', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="MC Entrée" hint="(k$)">
              <input type="number" step="0.1" className="input-field" placeholder="29.9"
                value={form.market_cap_entree as string}
                onChange={e => set('market_cap_entree', e.target.value)} />
            </Field>
            <Field label="MC Sortie" hint="(k$)">
              <input type="number" step="0.1" className="input-field" placeholder="89.7"
                value={form.market_cap_sortie as string}
                onChange={e => set('market_cap_sortie', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Taille" hint="(SOL)">
              <input type="number" step="0.01" className="input-field" placeholder="1.5"
                value={form.taille as string}
                onChange={e => set('taille', e.target.value)} />
            </Field>
            <Field label="PnL" hint={!pnlManual.current && autoPnlSol !== null ? '(calculé)' : '(SOL)'}>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" step="0.001" className="input-field" placeholder="—"
                  value={form.pnl_sol as string}
                  onChange={e => { pnlManual.current = true; set('pnl_sol', e.target.value) }}
                  style={{ paddingRight: pnlManual.current && autoPnlSol !== null ? 52 : undefined }}
                />
                {pnlManual.current && autoPnlSol !== null && (
                  <button
                    type="button"
                    onClick={() => { pnlManual.current = false; set('pnl_sol', String(Math.round(autoPnlSol * 1000) / 1000)) }}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#0a84ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px' }}
                  >
                    reset
                  </button>
                )}
              </div>
            </Field>
          </div>

          {hasPnlPreview && (
            <div style={{ marginTop: 4, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {autoPct !== null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: autoPct >= 0 ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', borderRadius: 8, padding: '5px 12px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>Perf</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: autoPct >= 0 ? '#30d158' : '#ff453a' }}>
                    {autoPct >= 0 ? '+' : ''}{autoPct.toFixed(1)}%
                  </span>
                </div>
              )}
              {autoPnlSol !== null && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: autoPnlSol >= 0 ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', borderRadius: 8, padding: '5px 12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: autoPnlSol >= 0 ? '#30d158' : '#ff453a' }}>
                    {autoPnlSol >= 0 ? '+' : ''}{autoPnlSol.toFixed(3)} SOL
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>fees −{totalFees.toFixed(3)}</span>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* 2. L'Edge */}
        <Section title="L'Edge">
          <Field label="Narrative">
            <select className="input-field" value={form.meme_narrative as string} onChange={e => set('meme_narrative', e.target.value)}>
              <option value="">— Choisir —</option>
              <option value="Animaux">Animaux</option>
              <option value="Internet meme">Internet meme</option>
              <option value="Crypto culture">Crypto culture</option>
              <option value="AI">AI</option>
              <option value="Tech Narrative">Tech Narrative</option>
              <option value="Meta narrative">Meta narrative</option>
              <option value="Political">Political</option>
              <option value="Societal">Societal</option>
              <option value="Influencer">Influencer</option>
              <option value="Trend">Trend</option>
              <option value="Tweet Play">Tweet Play</option>
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Field label="Conviction">
              <Pills
                options={['Forte', 'Moyenne', 'Faible']}
                value={convictionLabel}
                onChange={v => set('entry_qualite', convictionMap[v] ?? '')}
                colorClass={o => o === 'Forte' ? 'pill-green' : o === 'Moyenne' ? 'pill-orange' : 'pill-red'}
              />
            </Field>
            <Field label="Marché">
              <Pills
                options={['Bull', 'Neutre', 'Mort']}
                value={form.marche_global as string}
                onChange={v => set('marche_global', v)}
                colorClass={o => o === 'Bull' ? 'pill-green' : o === 'Neutre' ? 'pill-orange' : 'pill-red'}
              />
            </Field>
          </div>
        </Section>

        {/* 3. Discipline */}
        <Section title="Discipline">
          <Toggle label="R1 — Narrative comprise" sub="Je comprends le meme, pourquoi les gens le partageraient, et il est simple à expliquer." value={form.r1_respectee as boolean} onChange={v => set('r1_respectee', v)} />
          <Toggle label="R2 — ATH potentiel estimé" sub="J'ai une idée claire du risk/reward et du market cap cible avant d'entrer." value={form.r2_respectee as boolean} onChange={v => set('r2_respectee', v)} />
          <Toggle label="R3 — Capital libéré si coin lent" sub="Si le coin stagne, je prends profit et je libère le capital pour d'autres opportunités." value={form.r3_respectee as boolean} onChange={v => set('r3_respectee', v)} />
          <Toggle label="R4 — Perte limitée à -20%" sub="J'ai respecté mon stop loss, même si le coin a pumpé après." value={form.r4_respectee as boolean} onChange={v => set('r4_respectee', v)} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <Toggle label="SL touché" value={form.sl_touche as boolean} onChange={v => set('sl_touche', v)} />
          <Toggle label="Coupé au bon moment" value={form.coupe_bon_moment as boolean} onChange={v => set('coupe_bon_moment', v)} />
          <Toggle label="Coin lent / stagné" value={form.coin_lent as boolean} onChange={v => set('coin_lent', v)} />
        </Section>

        {/* 4. Review */}
        <Section title="Review">
          <Field label="Erreur">
            <Pills
              options={['Aucune', 'FOMO', 'Overtrade', 'Mauvais sizing', 'Pas de SL', 'Exit trop tôt', 'Autre']}
              value={form.erreur as string}
              onChange={v => set('erreur', v)}
              colorClass={o => o === 'Aucune' ? 'pill-green' : o === 'Exit trop tôt' ? 'pill-orange' : 'pill-red'}
            />
            {form.erreur === 'Autre' && (
              <input className="input-field" placeholder="Précise..." value={form.erreur_autre as string}
                onChange={e => set('erreur_autre', e.target.value)} style={{ marginTop: 10 }} />
            )}
          </Field>
          <Toggle label="Trade A+" value={form.trade_aplus as boolean} onChange={v => set('trade_aplus', v)} />
          <Field label="Note rapide">
            <textarea className="input-field" placeholder="Ce qui s'est passé, ce à retenir..."
              value={form.bien_fait as string} onChange={e => set('bien_fait', e.target.value)}
              style={{ minHeight: 72 }} />
          </Field>
        </Section>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Link href={`/trade/${id}`} className="btn-ghost">Annuler</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      </form>
    </div>
  )
}
