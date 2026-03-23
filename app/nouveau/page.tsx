'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Val = string | number | boolean | null

function useForm(init: Record<string, Val>) {
  const [form, setForm] = useState(init)
  const set = (key: string, val: Val) => setForm(p => ({ ...p, [key]: val }))
  return { form, set }
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-row">
      <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>{label}</span>
      <button type="button" className={`toggle-btn ${value ? 'on' : 'off'}`} onClick={() => onChange(!value)} />
    </div>
  )
}

function Section({ title, children, sub }: { title: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="form-section">
      <div className="section-label">{title}</div>
      {sub && <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0a84ff', marginBottom: 16, letterSpacing: '0.05em' }}>{sub}</div>}
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

const today = new Date().toISOString().slice(0, 10)
const nowTime = new Date().toTimeString().slice(0, 5)

export default function NouveauTrade() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const { form, set } = useForm({
    date: today,
    heure_entree: nowTime,
    token: '',
    market_cap_entree: '',
    market_cap_sortie: '',
    taille: '',
    pnl_sol: '',
    pnl_percent: '',
    meme_narrative: '',
    pourquoi_pump: '',
    clarte: '',
    mc_cible: '',
    rr_estime: '',
    valide_avant_entree: false,
    type_trade: '',
    entry_qualite: '',
    exit_qualite: '',
    slippage: '',
    r1_respectee: false,
    r2_respectee: false,
    r3_respectee: false,
    r4_respectee: false,
    sl_touche: false,
    coupe_bon_moment: false,
    coin_lent: false,
    capital_libere: false,
    erreur: '',
    erreur_autre: '',
    trade_aplus: false,
    devait_etre_pris: false,
    marche_global: '',
    narrative_dominante: '',
    bien_fait: '',
    ameliorer: '',
  })

  const NUM_FIELDS = ['market_cap_entree', 'market_cap_sortie', 'taille', 'pnl_sol', 'pnl_percent', 'clarte', 'mc_cible', 'rr_estime']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, Val> = {}
      for (const [k, v] of Object.entries(form)) {
        if (v === '' || v === null) continue
        if (NUM_FIELDS.includes(k)) {
          const n = parseFloat(v as string)
          if (!isNaN(n)) payload[k] = n
        } else {
          payload[k] = v
        }
      }
      payload.date = form.date || today
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

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/" className="btn-ghost">← Retour</Link>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Nouveau trade</h1>
      </div>

      <form onSubmit={handleSubmit}>

        {/* 1. Infos de base */}
        <Section title="📍 1 — Informations de base">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Date">
              <input type="date" className="input-field" value={form.date as string} onChange={e => set('date', e.target.value)} required />
            </Field>
            <Field label="Heure entrée">
              <input type="time" className="input-field" value={form.heure_entree as string} onChange={e => set('heure_entree', e.target.value)} />
            </Field>
          </div>
          <Field label="Token" hint="(ex: BONK, WIF...)">
            <input className="input-field" placeholder="WIF" value={form.token as string} onChange={e => set('token', e.target.value.toUpperCase())} required />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="MC Entrée" hint="($)">
              <input type="number" className="input-field" placeholder="500000" value={form.market_cap_entree as string} onChange={e => set('market_cap_entree', e.target.value)} />
            </Field>
            <Field label="MC Sortie" hint="($)">
              <input type="number" className="input-field" placeholder="1500000" value={form.market_cap_sortie as string} onChange={e => set('market_cap_sortie', e.target.value)} />
            </Field>
            <Field label="Taille" hint="(SOL)">
              <input type="number" step="0.01" className="input-field" placeholder="1.5" value={form.taille as string} onChange={e => set('taille', e.target.value)} />
            </Field>
            <Field label="PnL" hint="(SOL)">
              <input type="number" step="0.001" className="input-field" placeholder="+0.5" value={form.pnl_sol as string} onChange={e => set('pnl_sol', e.target.value)} />
            </Field>
            <Field label="PnL" hint="(%)">
              <input type="number" step="0.1" className="input-field" placeholder="33" value={form.pnl_percent as string} onChange={e => set('pnl_percent', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* 2. Contexte & Setup */}
        <Section title="🧠 2 — Contexte & Setup" sub="Narrative (R1)">
          <Field label="Meme / Narrative">
            <input className="input-field" placeholder="ex: memes animaux, AI agents..." value={form.meme_narrative as string} onChange={e => set('meme_narrative', e.target.value)} />
          </Field>
          <Field label="Pourquoi ça peut pump">
            <textarea className="input-field" placeholder="Explique l'edge..." value={form.pourquoi_pump as string} onChange={e => set('pourquoi_pump', e.target.value)} />
          </Field>
          <Field label="Clarté">
            <Pills
              options={['1', '2', '3', '4', '5']}
              value={String(form.clarte ?? '')}
              onChange={v => set('clarte', v)}
              colorClass={o => ['1','2'].includes(o) ? 'pill-red' : o === '3' ? 'pill-orange' : 'pill-green'}
            />
          </Field>

          <div style={{ marginTop: 24, marginBottom: 12, fontSize: '0.72rem', fontWeight: 700, color: '#0a84ff', letterSpacing: '0.05em' }}>POTENTIEL (R2)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="MC Cible" hint="($)">
              <input type="number" className="input-field" placeholder="5000000" value={form.mc_cible as string} onChange={e => set('mc_cible', e.target.value)} />
            </Field>
            <Field label="RR Estimé" hint="(x)">
              <input type="number" step="0.1" className="input-field" placeholder="3.5" value={form.rr_estime as string} onChange={e => set('rr_estime', e.target.value)} />
            </Field>
          </div>
          <Toggle label="Validé avant entrée ?" value={form.valide_avant_entree as boolean} onChange={v => set('valide_avant_entree', v)} />

          <div style={{ marginTop: 20 }}>
            <Field label="Type de trade">
              <Pills options={['Early', 'Breakout', 'Momentum', 'Rotation']} value={form.type_trade as string} onChange={v => set('type_trade', v)} />
            </Field>
          </div>
        </Section>

        {/* 3. Exécution */}
        <Section title="⚙️ 3 — Exécution">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <Field label="Entry qualité">
              <Pills options={['A','B','C']} value={form.entry_qualite as string} onChange={v => set('entry_qualite', v)} colorClass={o => o === 'A' ? 'pill-green' : o === 'B' ? 'pill-orange' : 'pill-red'} />
            </Field>
            <Field label="Exit qualité">
              <Pills options={['A','B','C']} value={form.exit_qualite as string} onChange={v => set('exit_qualite', v)} colorClass={o => o === 'A' ? 'pill-green' : o === 'B' ? 'pill-orange' : 'pill-red'} />
            </Field>
            <Field label="Slippage">
              <Pills options={['faible','ok','élevé']} value={form.slippage as string} onChange={v => set('slippage', v)} colorClass={o => o === 'faible' ? 'pill-green' : o === 'ok' ? 'pill-orange' : 'pill-red'} />
            </Field>
          </div>
        </Section>

        {/* 4. Discipline */}
        <Section title="⚖️ 4 — Discipline">
          <Toggle label="R1 respectée ?" value={form.r1_respectee as boolean} onChange={v => set('r1_respectee', v)} />
          <Toggle label="R2 respectée ?" value={form.r2_respectee as boolean} onChange={v => set('r2_respectee', v)} />
          <Toggle label="R3 respectée ?" value={form.r3_respectee as boolean} onChange={v => set('r3_respectee', v)} />
          <Toggle label="R4 respectée ?" value={form.r4_respectee as boolean} onChange={v => set('r4_respectee', v)} />
        </Section>

        {/* 5. Gestion */}
        <Section title="🛑 5 — Gestion du trade">
          <Toggle label="SL touché ?" value={form.sl_touche as boolean} onChange={v => set('sl_touche', v)} />
          <Toggle label="As-tu coupé au bon moment ?" value={form.coupe_bon_moment as boolean} onChange={v => set('coupe_bon_moment', v)} />
          <Toggle label="Coin devenu lent ?" value={form.coin_lent as boolean} onChange={v => set('coin_lent', v)} />
          <Toggle label="As-tu libéré le capital ?" value={form.capital_libere as boolean} onChange={v => set('capital_libere', v)} />
        </Section>

        {/* 6. Erreur */}
        <Section title="❌ 6 — Erreur (une seule max)">
          <Pills
            options={['FOMO','Overtrade','Mauvaise narrative','Mauvais sizing','Pas de SL','Exit trop tôt','Autre']}
            value={form.erreur as string}
            onChange={v => set('erreur', v)}
            colorClass={o => o === 'Exit trop tôt' ? 'pill-orange' : 'pill-red'}
          />
          {form.erreur === 'Autre' && (
            <div style={{ marginTop: 12 }}>
              <input className="input-field" placeholder="Précise l'erreur..." value={form.erreur_autre as string} onChange={e => set('erreur_autre', e.target.value)} />
            </div>
          )}
        </Section>

        {/* 7. Qualité */}
        <Section title="🔥 7 — Qualité du trade">
          <Toggle label="Était-ce un trade A+ ?" value={form.trade_aplus as boolean} onChange={v => set('trade_aplus', v)} />
          <Toggle label="Ce trade devait-il être pris ?" value={form.devait_etre_pris as boolean} onChange={v => set('devait_etre_pris', v)} />
        </Section>

        {/* 8. Contexte marché */}
        <Section title="📊 8 — Contexte marché">
          <Field label="Marché global">
            <Pills
              options={['bull','neutre','mort']}
              value={form.marche_global as string}
              onChange={v => set('marche_global', v)}
              colorClass={o => o === 'bull' ? 'pill-green' : o === 'neutre' ? 'pill-orange' : 'pill-red'}
            />
          </Field>
          <Field label="Narrative dominante">
            <input className="input-field" placeholder="ex: memes animaux, AI, shitcoin random..." value={form.narrative_dominante as string} onChange={e => set('narrative_dominante', e.target.value)} />
          </Field>
        </Section>

        {/* 9. Note rapide */}
        <Section title="🧾 9 — Note rapide">
          <Field label="Ce que tu as bien fait">
            <textarea className="input-field" placeholder="Max 2 lignes..." value={form.bien_fait as string} onChange={e => set('bien_fait', e.target.value)} style={{ minHeight: 64 }} />
          </Field>
          <Field label="Ce que tu dois améliorer">
            <textarea className="input-field" placeholder="Max 2 lignes..." value={form.ameliorer as string} onChange={e => set('ameliorer', e.target.value)} style={{ minHeight: 64 }} />
          </Field>
        </Section>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Link href="/" className="btn-ghost">Annuler</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}
