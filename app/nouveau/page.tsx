'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LS_WALLET = 'sol_wallet_address'
const FEES_KEY = 'edge_fees'

const NARRATIVES = [
  'Animaux','Internet meme','Crypto culture','AI','Tech Narrative',
  'Meta narrative','Political','Societal','Influencer','Trend','Tweet Play',
]

const PLAN_DEFAULT = '50 % à 2x, reste : invalidation structurelle, stop catastrophe -50 %'

// ─── Styles ──────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--surface-1)',
  border: '1px solid var(--border)',
  borderRadius: 14,
  overflow: 'hidden',
}

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

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-3)',
  letterSpacing: '0.10em',
  textTransform: 'uppercase' as const,
  marginBottom: 7,
  display: 'block',
  fontFamily: "'JetBrains Mono', monospace",
}

function Field({ lbl, children }: { lbl: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={label}>{lbl}</span>
      {children}
    </div>
  )
}

// ─── Pill selector ───────────────────────────────────────────────────────────

type PillColor = 'green' | 'amber' | 'red' | 'accent'
const colorMap: Record<PillColor, string> = {
  green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', accent: 'var(--accent)',
}

function PillSelect({
  lbl, options, value, onChange, colors,
}: {
  lbl: string
  options: string[]
  value: string
  onChange: (v: string) => void
  colors?: PillColor[]
}) {
  return (
    <Field lbl={lbl}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o, i) => {
          const active = o === value
          const c = colors ? colorMap[colors[i]] : colorMap.accent
          return (
            <button key={o} type="button" onClick={() => onChange(active ? '' : o)} style={{
              padding: '10px 18px', borderRadius: 99, fontSize: 14, cursor: 'pointer',
              fontWeight: active ? 700 : 500, fontFamily: 'inherit',
              background: active ? `color-mix(in oklch, ${c} 18%, transparent)` : 'var(--surface-2)',
              border: `1.5px solid ${active ? c : 'var(--border)'}`,
              color: active ? c : 'var(--text-2)',
              transition: 'all 0.15s',
              minHeight: 44,
            }}>{o}</button>
          )
        })}
      </div>
    </Field>
  )
}

// ─── Alert dialog ────────────────────────────────────────────────────────────

function SizingAlert({ pct, onConfirm, onCancel }: { pct: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: 24,
    }}>
      <div style={{
        background: 'var(--surface-1)',
        border: '1px solid oklch(0.68 0.21 22 / 0.5)',
        borderRadius: 16, padding: 28, maxWidth: 360, width: '100%',
      }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>
          Position surdimensionnée
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
          Cette position représente{' '}
          <span style={{ color: 'var(--red)', fontWeight: 700 }}>{pct.toFixed(1)} %</span>{' '}
          de ton stack.{' '}Plafond recommandé : <strong>10 %</strong>.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, fontSize: 14,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Corriger
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: 10, fontSize: 14,
              background: 'oklch(0.68 0.21 22 / 0.15)',
              border: '1px solid oklch(0.68 0.21 22 / 0.4)',
              color: 'var(--red)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            }}
          >
            Confirmer quand même
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NouveauPreTrade() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [showSizingAlert, setShowSizingAlert] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [incompleteTrades, setIncompleteTrades] = useState<{ id: number; token: string; date: string }[] | null>(null)

  // Form state
  const [token, setToken] = useState('')
  const [narrative, setNarrative] = useState('')
  const [conviction, setConviction] = useState('')  // A / B / C
  const [pourquoi, setPourquoi] = useState('')
  const [mcCible, setMcCible] = useState('')
  const [mcInval, setMcInval] = useState('')
  const [mcEntree, setMcEntree] = useState('')  // estimé, optionnel
  const [planSortie, setPlanSortie] = useState(PLAN_DEFAULT)
  const [taille, setTaille] = useState('')

  // Vérifier les trades à compléter (verrou si > 2)
  useEffect(() => {
    fetch('/api/incomplete?cycle=cycle-1')
      .then(r => r.json())
      .then((d: { id: number; token: string; date: string }[]) => setIncompleteTrades(Array.isArray(d) ? d : []))
      .catch(() => setIncompleteTrades([]))
  }, [])

  // Load wallet balance (tracking ou stack manuel)
  useEffect(() => {
    fetch('/api/settings/wallet')
      .then(r => r.json())
      .then((s: { trackingEnabled?: boolean; manualStack?: number | null }) => {
        if (!s.trackingEnabled) {
          if (s.manualStack != null) setWalletBalance(s.manualStack)
          return
        }
        const addr = localStorage.getItem(LS_WALLET)
        if (!addr) return
        fetch(`/api/solana?address=${encodeURIComponent(addr)}`)
          .then(r => r.json())
          .then((d: { sol?: number }) => { if (d.sol !== undefined) setWalletBalance(d.sol) })
          .catch(() => {})
      })
      .catch(() => {})
  }, [])

  // R/R calculé
  const rr = useMemo(() => {
    const cible = parseFloat(mcCible)
    const inval = parseFloat(mcInval)
    const entree = parseFloat(mcEntree) || null
    if (isNaN(cible) || isNaN(inval) || cible <= 0 || inval <= 0) return null
    if (entree && entree > 0) {
      const risk = entree - inval
      if (risk <= 0) return null
      return (cible - entree) / risk
    }
    // Sans MC entrée : ratio brut cible/inval
    return cible / inval
  }, [mcCible, mcInval, mcEntree])

  // Sizing %
  const sizingPct = useMemo(() => {
    const t = parseFloat(taille)
    if (isNaN(t) || t <= 0 || !walletBalance || walletBalance <= 0) return null
    return (t / walletBalance) * 100
  }, [taille, walletBalance])

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'oklch(0.74 0.14 240 / 0.5)'
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.currentTarget.style.borderColor = 'var(--border)'
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!token.trim()) errs.push('Token manquant')
    if (!narrative) errs.push('Narrative manquante')
    if (!conviction) errs.push('Conviction manquante')
    if (!pourquoi.trim()) errs.push('Pourquoi ça pump manquant')
    if (!mcCible || isNaN(parseFloat(mcCible)) || parseFloat(mcCible) <= 0) errs.push('MC cible invalide')
    if (!mcInval || isNaN(parseFloat(mcInval)) || parseFloat(mcInval) <= 0) errs.push('MC invalidation invalide')
    if (!planSortie.trim()) errs.push('Plan de sortie manquant')
    if (!taille || isNaN(parseFloat(taille)) || parseFloat(taille) <= 0) errs.push('Taille manquante')
    return errs
  }

  const doSave = useCallback(async () => {
    setSaving(true)
    setShowSizingAlert(false)
    setPendingSubmit(false)
    try {
      const now = new Date()
      const payload = {
        token: token.toUpperCase().trim(),
        meme_narrative: narrative,
        entry_qualite: conviction,
        pourquoi_pump: pourquoi.trim(),
        mc_cible: parseFloat(mcCible) * 1000,  // k$ → $
        mc_invalidation: parseFloat(mcInval) * 1000,
        plan_sortie: planSortie.trim(),
        taille: parseFloat(taille),
        market_cap_entree: mcEntree && !isNaN(parseFloat(mcEntree)) ? parseFloat(mcEntree) * 1000 : null,
        date: now.toISOString().slice(0, 10),
        heure_entree: now.toTimeString().slice(0, 5),
      }

      const res = await fetch('/api/trades/pretrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        router.push('/')
      } else {
        const err = await res.json() as { error?: string }
        setErrors([err.error ?? 'Erreur serveur'])
      }
    } finally {
      setSaving(false)
    }
  }, [token, narrative, conviction, pourquoi, mcCible, mcInval, planSortie, taille, mcEntree, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])

    // Sizing guard
    if (sizingPct !== null && sizingPct > 10) {
      setShowSizingAlert(true)
      setPendingSubmit(true)
      return
    }

    await doSave()
  }

  const today = new Date().toISOString().slice(0, 10)
  const convMap: Record<string, string> = { A: 'Forte', B: 'Moyenne', C: 'Faible' }

  // Verrou : plus de 2 trades incomplets
  const isBlocked = incompleteTrades !== null && incompleteTrades.length > 2
  if (isBlocked) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>Pré-trade</div>
          </div>
          <Link href="/" style={{ color: 'var(--text-3)', fontSize: 12, textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>← Retour</Link>
        </div>
        <div style={{
          padding: '24px', borderRadius: 14,
          background: 'oklch(0.68 0.21 22 / 0.08)',
          border: '1px solid oklch(0.68 0.21 22 / 0.3)',
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 10, lineHeight: 1.3 }}>
            Création bloquée
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 20 }}>
            Complète tes trades précédents <strong>(ATH constaté + vente dans le plan)</strong> avant d&apos;en ouvrir un nouveau. Tu as {incompleteTrades.length} trades en attente.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {incompleteTrades.map(t => (
              <Link key={t.id} href={`/drafts/${t.id}/complete`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 10, textDecoration: 'none',
                background: 'var(--surface-1)', border: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{t.token}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>{t.date?.slice(5)}</span>
                  <span style={{ fontSize: 12, color: 'var(--amber)' }}>Compléter →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>

      {showSizingAlert && sizingPct !== null && (
        <SizingAlert
          pct={sizingPct}
          onConfirm={doSave}
          onCancel={() => { setShowSizingAlert(false); setPendingSubmit(false) }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 2 }}>
            Pré-trade
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {today} · À remplir <em>avant</em> le buy
          </div>
        </div>
        <Link href="/" style={{
          color: 'var(--text-3)', fontSize: 12, textDecoration: 'none',
          border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px',
        }}>← Retour</Link>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div style={{
          background: 'oklch(0.68 0.21 22 / 0.1)',
          border: '1px solid oklch(0.68 0.21 22 / 0.3)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
        }}>
          {errors.map((err, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.6 }}>· {err}</div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Token */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px' }}>
              <Field lbl="Token">
                <input
                  value={token}
                  onChange={e => setToken(e.target.value.toUpperCase())}
                  placeholder="WIF"
                  autoCapitalize="characters"
                  autoComplete="off"
                  style={{ ...inp, fontSize: 22, fontWeight: 800, letterSpacing: '0.04em' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>
            </div>
          </div>

          {/* Narrative + Conviction */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <span style={label}>Narrative</span>
                <select
                  value={narrative}
                  onChange={e => setNarrative(e.target.value)}
                  style={{ ...inp, cursor: 'pointer' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="">— Choisir —</option>
                  {NARRATIVES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <PillSelect
                lbl="Conviction"
                options={['Forte', 'Moyenne', 'Faible']}
                value={conviction ? convMap[conviction] : ''}
                onChange={v => setConviction(v === 'Forte' ? 'A' : v === 'Moyenne' ? 'B' : v === 'Faible' ? 'C' : '')}
                colors={['green', 'amber', 'red']}
              />
            </div>
          </div>

          {/* Pourquoi pump */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px' }}>
              <Field lbl="Pourquoi ça pump">
                <input
                  value={pourquoi}
                  onChange={e => setPourquoi(e.target.value)}
                  placeholder="ex. Nouveau partenariat + KOL Tier-1 incoming"
                  style={inp}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>
            </div>
          </div>

          {/* MC cible + invalidation + R/R */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field lbl="MC cible · k$">
                  <input
                    type="number" inputMode="decimal" step="0.1" placeholder="200"
                    value={mcCible}
                    onChange={e => setMcCible(e.target.value)}
                    style={inp}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
                <Field lbl="MC invalidation · k$">
                  <input
                    type="number" inputMode="decimal" step="0.1" placeholder="15"
                    value={mcInval}
                    onChange={e => setMcInval(e.target.value)}
                    style={inp}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              </div>

              {/* MC entrée estimé (optionnel, pour R/R précis) */}
              <Field lbl="MC entrée estimé · k$ (optionnel)">
                <input
                  type="number" inputMode="decimal" step="0.1" placeholder="25"
                  value={mcEntree}
                  onChange={e => setMcEntree(e.target.value)}
                  style={{ ...inp, fontSize: 14 }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              {/* R/R affiché */}
              {rr !== null && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: rr >= 2 ? 'oklch(0.74 0.16 152 / 0.08)' : rr >= 1 ? 'oklch(0.78 0.14 70 / 0.08)' : 'oklch(0.68 0.21 22 / 0.08)',
                  border: `1px solid ${rr >= 2 ? 'oklch(0.74 0.16 152 / 0.25)' : rr >= 1 ? 'oklch(0.78 0.14 70 / 0.25)' : 'oklch(0.68 0.21 22 / 0.25)'}`,
                  borderRadius: 10, padding: '10px 14px',
                }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>R/R</span>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: rr >= 2 ? 'var(--green)' : rr >= 1 ? 'var(--amber)' : 'var(--red)',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '-0.02em',
                  }}>
                    {rr.toFixed(1)}×
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {mcEntree ? 'calculé' : 'estimé (sans MC entrée)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Plan de sortie */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px' }}>
              <Field lbl="Plan de sortie">
                <textarea
                  value={planSortie}
                  onChange={e => setPlanSortie(e.target.value)}
                  rows={3}
                  style={{
                    ...inp,
                    resize: 'vertical',
                    minHeight: 80,
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>
            </div>
          </div>

          {/* Taille */}
          <div style={card}>
            <div style={{ padding: '18px 18px 20px' }}>
              <Field lbl="Taille · SOL">
                <input
                  type="number" inputMode="decimal" step="0.01" placeholder="0.2"
                  value={taille}
                  onChange={e => setTaille(e.target.value)}
                  style={{ ...inp, fontSize: 20, fontWeight: 700 }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              {/* Sizing info */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                {walletBalance !== null && (
                  <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Stack : {walletBalance.toFixed(2)} SOL
                  </span>
                )}
                {sizingPct !== null && (
                  <span style={{
                    fontSize: 12, fontWeight: 600,
                    color: sizingPct > 10 ? 'var(--red)' : sizingPct > 7 ? 'var(--amber)' : 'var(--green)',
                    fontFamily: "'JetBrains Mono', monospace",
                    background: sizingPct > 10 ? 'oklch(0.68 0.21 22 / 0.1)' : 'transparent',
                    padding: sizingPct > 10 ? '2px 8px' : '0',
                    borderRadius: 6,
                  }}>
                    {sizingPct.toFixed(1)} %
                    {sizingPct > 10 && ' ⚠'}
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto' }}>
                  std 0.2 · conviction 0.5
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || pendingSubmit}
            style={{
              width: '100%',
              background: saving ? 'var(--surface-3)' : 'var(--text)',
              color: saving ? 'var(--text-3)' : 'var(--bg)',
              border: 'none', borderRadius: 12,
              padding: '18px', fontSize: 16, fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              letterSpacing: '-0.01em',
            }}
          >
            {saving ? 'Enregistrement…' : 'Valider le plan → Prêt à enter'}
          </button>

        </div>
      </form>
    </div>
  )
}
