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

function Section({ title, children, locked }: { title: string; children: React.ReactNode; locked?: boolean }) {
  return (
    <div className="form-section" style={locked ? { opacity: 0.65, pointerEvents: 'none' } : undefined}>
      <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {title}
        {locked && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'var(--text-4)', border: '1px solid var(--border)', borderRadius: 4,
            padding: '2px 6px', fontFamily: "'JetBrains Mono', monospace",
          }}>Verrouillé</span>
        )}
      </div>
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

function ReadonlyValue({ label, value, hint }: { label: string; value: string | null | undefined; hint?: string }) {
  return (
    <div className="field-wrap">
      <label className="field-label">
        {label}
        {hint && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginLeft: 5 }}>{hint}</span>}
      </label>
      <div style={{
        padding: '10px 12px', borderRadius: 8,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 14, color: 'rgba(255,255,255,0.5)',
        fontFamily: 'inherit', lineHeight: 1.5,
        minHeight: 38,
      }}>
        {value || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>—</span>}
      </div>
    </div>
  )
}

const FEES_KEY = 'edge_fees'
const NUM_FIELDS = ['market_cap_entree', 'market_cap_sortie', 'taille', 'pnl_sol', 'ath_constate']

const convictionLabel = (q: string | null | undefined) =>
  q === 'A' ? 'Forte' : q === 'B' ? 'Moyenne' : q === 'C' ? 'Faible' : '—'

function formatMCDisplay(fullUsd: number | null | undefined): string {
  if (fullUsd == null) return '—'
  return `${(fullUsd / 1000).toFixed(1)} k$`
}

const POST_EMPTY: Record<string, Val> = {
  date: '', heure_entree: '',
  market_cap_entree: '', market_cap_sortie: '',
  pnl_sol: '',
  ath_constate: '',
  vente_dans_plan: null,
  sl_touche: false, coupe_bon_moment: false, coin_lent: false,
  erreur: '', erreur_autre: '', trade_aplus: false, bien_fait: '',
}

export default function EditTrade() {
  const { id } = useParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [trade, setTrade] = useState<Trade | null>(null)
  const [fees, setFees] = useState({ prio: 0.001, tip: 0.001 })
  const { form, set, setAll } = useForm(POST_EMPTY)
  const pnlManual = useRef(true)

  useEffect(() => {
    const saved = localStorage.getItem(FEES_KEY)
    if (saved) { try { setFees(JSON.parse(saved)) } catch {} }
  }, [])

  useEffect(() => {
    fetch(`/api/trades/${id}`)
      .then(r => r.json())
      .then((t: Trade) => {
        setTrade(t)
        setAll({
          date: t.date ?? '',
          heure_entree: t.heure_entree ?? '',
          market_cap_entree: t.market_cap_entree != null ? String(t.market_cap_entree / 1000) : '',
          market_cap_sortie: t.market_cap_sortie != null ? String(t.market_cap_sortie / 1000) : '',
          pnl_sol: t.pnl_sol != null ? String(t.pnl_sol) : '',
          ath_constate: t.ath_constate != null ? String(t.ath_constate / 1000) : '',
          vente_dans_plan: t.vente_dans_plan ?? null,
          sl_touche: Boolean(t.sl_touche),
          coupe_bon_moment: Boolean(t.coupe_bon_moment),
          coin_lent: Boolean(t.coin_lent),
          erreur: t.erreur ?? '',
          erreur_autre: t.erreur_autre ?? '',
          trade_aplus: Boolean(t.trade_aplus),
          bien_fait: t.bien_fait ?? '',
        })
        pnlManual.current = true
        setLoaded(true)
      })
  }, [id])

  const { autoPct, autoPnlSol } = useMemo(() => {
    const mcE = parseFloat(form.market_cap_entree as string)
    const mcS = parseFloat(form.market_cap_sortie as string)
    const taille = trade?.taille ?? 0
    if (isNaN(mcE) || isNaN(mcS) || mcE <= 0) return { autoPct: null, autoPnlSol: null }
    const pct = ((mcS - mcE) / mcE) * 100
    if (!taille || taille <= 0) return { autoPct: pct, autoPnlSol: null }
    const totalFees = (fees.prio + fees.tip) * 2
    return { autoPct: pct, autoPnlSol: taille * (mcS - mcE) / mcE - totalFees }
  }, [form.market_cap_entree, form.market_cap_sortie, trade?.taille, fees])

  const totalFees = (fees.prio + fees.tip) * 2
  const hasPnlPreview = autoPct !== null || autoPnlSol !== null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: Record<string, Val> = {}
      for (const [k, v] of Object.entries(form)) {
        if (v === '' || v === undefined) continue
        if (k === 'vente_dans_plan') {
          if (v !== null) payload[k] = v
          continue
        }
        if (NUM_FIELDS.includes(k)) {
          const n = parseFloat(v as string)
          if (!isNaN(n)) {
            payload[k] = (k === 'market_cap_entree' || k === 'market_cap_sortie' || k === 'ath_constate') ? n * 1000 : n
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

  if (!loaded || !trade) {
    return <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 20px', color: 'rgba(255,255,255,0.3)' }}>Chargement...</div>
  }

  const isV1 = trade.cycle === 'v1-historique'

  // ── V1-historique : tout en lecture seule ─────────────────────────────────
  if (isV1) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <Link href={`/trade/${id}`} className="btn-ghost">← Retour</Link>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            {trade.token} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>v1-historique</span>
          </h1>
        </div>
        <div style={{
          padding: '14px 18px', marginBottom: 24, borderRadius: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
        }}>
          Ce trade appartient au cycle v1-historique — il est en <strong style={{ color: 'rgba(255,255,255,0.6)' }}>lecture seule</strong> et ne peut pas être modifié.
          Pour voir le détail, utilisez la <Link href={`/trade/${id}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>page de visualisation</Link>.
        </div>
        <Link href={`/trade/${id}`} className="btn-ghost">Voir le trade →</Link>
      </div>
    )
  }

  // ── V2 : pré-trade verrouillé + post-trade éditable ───────────────────────
  const convLbl = convictionLabel(trade.entry_qualite)
  const convColor = trade.entry_qualite === 'A' ? 'var(--green)' : trade.entry_qualite === 'B' ? 'var(--amber)' : trade.entry_qualite === 'C' ? 'var(--red)' : 'rgba(255,255,255,0.4)'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href={`/trade/${id}`} className="btn-ghost">← Retour</Link>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Modifier — <span style={{ color: 'rgba(255,255,255,0.5)' }}>{trade.token}</span>
        </h1>
      </div>

      {/* ── Pré-trade verrouillé ── */}
      <div style={{
        marginBottom: 24, borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.02)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>
            Plan pré-trade
          </span>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4, padding: '2px 6px', fontFamily: "'JetBrains Mono', monospace",
          }}>🔒 Verrouillé</span>
        </div>

        <div style={{ padding: '16px', opacity: 0.7 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Narrative</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{trade.meme_narrative || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Conviction</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: convColor }}>{convLbl}</div>
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Pourquoi ça pump</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{trade.pourquoi_pump || '—'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>MC cible</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{formatMCDisplay(trade.mc_cible)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>MC invalidation</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{formatMCDisplay(trade.mc_invalidation)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Taille initiale</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{trade.taille != null ? `${trade.taille} SOL` : '—'}</div>
            </div>
          </div>

          {trade.plan_sortie && (
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>Plan de sortie</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{trade.plan_sortie}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Post-trade éditable ── */}
      <form onSubmit={handleSubmit}>

        <Section title="Résultats réels">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Date">
              <input type="date" className="input-field" value={form.date as string} onChange={e => set('date', e.target.value)} required />
            </Field>
            <Field label="Heure">
              <input type="time" className="input-field" value={form.heure_entree as string} onChange={e => set('heure_entree', e.target.value)} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="MC Entrée réelle" hint="(k$)">
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

          <Field label="PnL" hint={!pnlManual.current && autoPnlSol !== null ? '(calculé)' : '(SOL)'}>
            <div style={{ position: 'relative' }}>
              <input
                type="number" step="0.001" className="input-field" placeholder="—"
                value={form.pnl_sol as string}
                onChange={e => { pnlManual.current = true; set('pnl_sol', e.target.value) }}
                style={{ paddingRight: pnlManual.current && autoPnlSol !== null ? 52 : undefined }}
              />
              {pnlManual.current && autoPnlSol !== null && (
                <button type="button"
                  onClick={() => { pnlManual.current = false; set('pnl_sol', String(Math.round(autoPnlSol * 1000) / 1000)) }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#0a84ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px' }}
                >reset</button>
              )}
            </div>
          </Field>

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

          <Field label="ATH MC constaté" hint="(k$)">
            <input type="number" step="0.1" className="input-field" placeholder="350"
              value={form.ath_constate as string}
              onChange={e => set('ath_constate', e.target.value)} />
          </Field>
        </Section>

        <Section title="Respect du plan">
          <Field label="Vente dans le plan ?">
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ v: true, label: 'Oui', color: '#30d158' }, { v: false, label: 'Non / Hors plan', color: '#ff453a' }].map(opt => (
                <button key={String(opt.v)} type="button"
                  onClick={() => set('vente_dans_plan', form.vente_dans_plan === opt.v ? null : opt.v)}
                  className={`radio-pill`}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                    background: form.vente_dans_plan === opt.v
                      ? (opt.v ? 'rgba(48,209,88,0.15)' : 'rgba(255,69,58,0.15)')
                      : 'rgba(255,255,255,0.04)',
                    color: form.vente_dans_plan === opt.v ? opt.color : 'rgba(255,255,255,0.4)',
                    outline: form.vente_dans_plan === opt.v ? `1px solid ${opt.color}40` : '1px solid rgba(255,255,255,0.07)',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Gestion & Review">
          <Toggle label="SL touché" value={form.sl_touche as boolean} onChange={v => set('sl_touche', v)} />
          <Toggle label="Coupé au bon moment" value={form.coupe_bon_moment as boolean} onChange={v => set('coupe_bon_moment', v)} />
          <Toggle label="Coin lent / stagné" value={form.coin_lent as boolean} onChange={v => set('coin_lent', v)} />
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
          <Field label="Erreur">
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {['Aucune', 'FOMO', 'Overtrade', 'Mauvais sizing', 'Pas de SL', 'Exit trop tôt', 'Autre'].map(o => (
                <button key={o} type="button"
                  className={`radio-pill ${form.erreur === o ? (o === 'Aucune' ? 'pill-green' : o === 'Exit trop tôt' ? 'pill-orange' : 'pill-red') : ''}`}
                  onClick={() => set('erreur', form.erreur === o ? '' : o)}
                >{o}</button>
              ))}
            </div>
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
