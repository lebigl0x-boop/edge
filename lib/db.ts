import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquant — crée un .env.local avec ta connection string Neon')
  return neon(url)
}

export async function initSchema() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS daily_notes (
      id         SERIAL PRIMARY KEY,
      date       TEXT NOT NULL UNIQUE,
      note       TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS trades (
      id                  SERIAL PRIMARY KEY,
      date                TEXT NOT NULL DEFAULT '',
      heure_entree        TEXT DEFAULT '',
      token               TEXT NOT NULL DEFAULT '',
      market_cap_entree   DOUBLE PRECISION,
      market_cap_sortie   DOUBLE PRECISION,
      taille              DOUBLE PRECISION,
      pnl_sol             DOUBLE PRECISION,
      pnl_percent         DOUBLE PRECISION,
      meme_narrative      TEXT DEFAULT '',
      pourquoi_pump       TEXT DEFAULT '',
      clarte              INTEGER,
      mc_cible            DOUBLE PRECISION,
      rr_estime           DOUBLE PRECISION,
      valide_avant_entree BOOLEAN DEFAULT false,
      entry_qualite       TEXT,
      exit_qualite        TEXT,
      slippage            TEXT,
      r1_respectee        BOOLEAN DEFAULT false,
      r2_respectee        BOOLEAN DEFAULT false,
      r4_respectee        BOOLEAN DEFAULT false,
      sl_touche           BOOLEAN DEFAULT false,
      coupe_bon_moment    BOOLEAN DEFAULT false,
      coin_lent           BOOLEAN DEFAULT false,
      capital_libere      BOOLEAN DEFAULT false,
      erreur              TEXT,
      erreur_autre        TEXT DEFAULT '',
      trade_aplus         BOOLEAN DEFAULT false,
      devait_etre_pris    BOOLEAN DEFAULT false,
      narrative_dominante TEXT DEFAULT '',
      bien_fait           TEXT DEFAULT '',
      ameliorer           TEXT DEFAULT '',
      created_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `
  // Colonnes auto-import (ajout idempotent)
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT false`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS tx_signature TEXT`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS token_address TEXT`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS fees_sol DOUBLE PRECISION DEFAULT 0`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS sol_received DOUBLE PRECISION DEFAULT 0`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS fees_total DOUBLE PRECISION DEFAULT 0`
  // Contrainte unicité sur tx_signature (si pas déjà là)
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'trades_tx_signature_key'
      ) THEN
        ALTER TABLE trades ADD CONSTRAINT trades_tx_signature_key UNIQUE (tx_signature);
      END IF;
    END $$
  `
  await sql`
    CREATE TABLE IF NOT EXISTS wallet_settings (
      id              SERIAL PRIMARY KEY,
      wallet_address  TEXT NOT NULL,
      helius_webhook_id TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE wallet_settings ADD COLUMN IF NOT EXISTS last_tx_signature TEXT`

  // ── Colonnes v2 (pré-engagement) ─────────────────────────────────────────────
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS mc_invalidation DOUBLE PRECISION`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS ath_constate DOUBLE PRECISION`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS vente_dans_plan BOOLEAN`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS plan_sortie TEXT`
  await sql`ALTER TABLE trades ADD COLUMN IF NOT EXISTS pre_trade_saisi_a TIMESTAMPTZ`
}

// Fragment WHERE à embarquer dans les tagged templates
function whereFragment(filter?: string) {
  const sql = getSql()
  if (!filter || filter === 'all') return sql.unsafe('')
  if (filter === 'week') return sql.unsafe(`AND date >= TO_CHAR(DATE_TRUNC('week', NOW()), 'YYYY-MM-DD') AND date <= TO_CHAR(DATE_TRUNC('week', NOW()) + INTERVAL '6 days', 'YYYY-MM-DD')`)
  if (filter === 'month') return sql.unsafe(`AND date >= TO_CHAR(DATE_TRUNC('month', NOW()), 'YYYY-MM-DD')`)
  if (/^\d{4}-\d{2}$/.test(filter)) return sql.unsafe(`AND date LIKE '${filter}-%'`)
  const customMatch = filter.match(/^custom:(\d{4}-\d{2}-\d{2}):(\d{4}-\d{2}-\d{2})$/)
  if (customMatch) return sql.unsafe(`AND date >= '${customMatch[1]}' AND date <= '${customMatch[2]}'`)
  return sql.unsafe('')
}

export async function getAllTrades(filter?: string) {
  const sql = getSql()
  const wf = whereFragment(filter)
  if (!filter || filter === 'all') {
    return await sql`SELECT * FROM trades WHERE draft IS NOT TRUE ORDER BY date DESC, created_at DESC`
  }
  return await sql`SELECT * FROM trades WHERE 1=1 AND (draft IS NOT TRUE) ${wf} ORDER BY date DESC, created_at DESC`
}

export async function getTradeById(id: number) {
  const sql = getSql()
  const rows = await sql`SELECT * FROM trades WHERE id = ${id}`
  return rows[0] ?? null
}

export async function createTrade(trade: Record<string, unknown>) {
  const sql = getSql()
  const g = (k: string) => trade[k] ?? null
  const rows = await sql`
    INSERT INTO trades (
      date, heure_entree, token,
      market_cap_entree, market_cap_sortie, taille, pnl_sol, pnl_percent,
      meme_narrative, pourquoi_pump, clarte, mc_cible, rr_estime,
      valide_avant_entree,
      entry_qualite, exit_qualite, slippage,
      r1_respectee, r2_respectee, r4_respectee,
      sl_touche, coupe_bon_moment, coin_lent, capital_libere,
      erreur, erreur_autre,
      trade_aplus, devait_etre_pris,
      narrative_dominante, bien_fait, ameliorer
    ) VALUES (
      ${g('date')}, ${g('heure_entree')}, ${g('token')},
      ${g('market_cap_entree')}, ${g('market_cap_sortie')}, ${g('taille')}, ${g('pnl_sol')}, ${g('pnl_percent')},
      ${g('meme_narrative')}, ${g('pourquoi_pump')}, ${g('clarte')}, ${g('mc_cible')}, ${g('rr_estime')},
      ${g('valide_avant_entree')},
      ${g('entry_qualite')}, ${g('exit_qualite')}, ${g('slippage')},
      ${g('r1_respectee')}, ${g('r2_respectee')}, ${g('r4_respectee')},
      ${g('sl_touche')}, ${g('coupe_bon_moment')}, ${g('coin_lent')}, ${g('capital_libere')},
      ${g('erreur')}, ${g('erreur_autre')},
      ${g('trade_aplus')}, ${g('devait_etre_pris')},
      ${g('narrative_dominante')}, ${g('bien_fait')}, ${g('ameliorer')}
    )
    RETURNING id
  `
  return rows[0].id as number
}

export async function updateTrade(id: number, trade: Record<string, unknown>) {
  const sql = getSql()
  const g = (k: string) => trade[k] ?? null
  await sql`
    UPDATE trades SET
      date                = ${g('date')},
      heure_entree        = ${g('heure_entree')},
      token               = ${g('token')},
      market_cap_entree   = ${g('market_cap_entree')},
      market_cap_sortie   = ${g('market_cap_sortie')},
      taille              = ${g('taille')},
      pnl_sol             = ${g('pnl_sol')},
      pnl_percent         = ${g('pnl_percent')},
      meme_narrative      = ${g('meme_narrative')},
      pourquoi_pump       = ${g('pourquoi_pump')},
      mc_cible            = ${g('mc_cible')},
      mc_invalidation     = ${g('mc_invalidation')},
      plan_sortie         = ${g('plan_sortie')},
      ath_constate        = ${g('ath_constate')},
      vente_dans_plan     = ${g('vente_dans_plan')},
      entry_qualite       = ${g('entry_qualite')},
      r1_respectee        = ${g('r1_respectee')},
      r2_respectee        = ${g('r2_respectee')},
      r4_respectee        = ${g('r4_respectee')},
      sl_touche           = ${g('sl_touche')},
      coin_lent           = ${g('coin_lent')},
      erreur              = ${g('erreur')},
      erreur_autre        = ${g('erreur_autre')},
      trade_aplus         = ${g('trade_aplus')},
      bien_fait           = ${g('bien_fait')},
      draft               = false
    WHERE id = ${id}
  `
}

export async function upsertDailyNote(date: string, note: string) {
  const sql = getSql()
  await sql`
    INSERT INTO daily_notes (date, note, updated_at)
    VALUES (${date}, ${note}, NOW())
    ON CONFLICT (date) DO UPDATE SET note = ${note}, updated_at = NOW()
  `
}

export async function getDailyNotes(from: string, to: string): Promise<{ date: string; note: string }[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT date, note FROM daily_notes
    WHERE date >= ${from} AND date <= ${to}
    ORDER BY date ASC
  `
  return rows.map(r => ({ date: r.date as string, note: r.note as string }))
}

export async function deleteTrade(id: number) {
  const sql = getSql()
  await sql`DELETE FROM trades WHERE id = ${id}`
}

export async function getStats(filter?: string) {
  const sql = getSql()
  const cols = sql`SELECT pnl_sol, pnl_percent, trade_aplus, r1_respectee, r2_respectee, r4_respectee, sl_touche, erreur`
  const wf = whereFragment(filter)
  let rows
  if (!filter || filter === 'all') {
    rows = await sql`${cols} FROM trades WHERE draft IS NOT TRUE`
  } else {
    rows = await sql`${cols} FROM trades WHERE (draft IS NOT TRUE) ${wf}`
  }

  const total = rows.length
  const totalPnl = rows.reduce((s, r) => s + (Number(r.pnl_sol) || 0), 0)
  const wins = rows.filter(r => Number(r.pnl_sol) > 0).length
  const losses = rows.filter(r => Number(r.pnl_sol) < 0).length
  const aplus = rows.filter(r => r.trade_aplus).length

  // KPIs discipline (R1 + R2 + R4 = 3 règles)
  const disciplineScore = total > 0
    ? rows.reduce((s, r) => s + [r.r1_respectee, r.r2_respectee, r.r4_respectee].filter(Boolean).length / 3, 0) / total * 100
    : 0
  const slRespectRate = total > 0 ? rows.filter(r => r.r4_respectee).length / total * 100 : 0
  const slHitRate = total > 0 ? rows.filter(r => r.sl_touche).length / total * 100 : 0
  const errorRate = total > 0 ? rows.filter(r => r.erreur && r.erreur !== 'Aucune').length / total * 100 : 0
  const aplusRate = total > 0 ? aplus / total * 100 : 0

  // RR Réel
  const winPnls = rows.filter(r => Number(r.pnl_sol) > 0).map(r => Number(r.pnl_sol))
  const lossPnls = rows.filter(r => Number(r.pnl_sol) < 0).map(r => Number(r.pnl_sol))
  const avgWin = winPnls.length > 0 ? winPnls.reduce((s, v) => s + v, 0) / winPnls.length : 0
  const avgLoss = lossPnls.length > 0 ? Math.abs(lossPnls.reduce((s, v) => s + v, 0) / lossPnls.length) : 0
  const rrReel = avgLoss > 0 ? avgWin / avgLoss : null

  return {
    total, totalPnl, wins, losses, aplus,
    avgPnl: total > 0 ? totalPnl / total : 0,
    winRate: total > 0 ? (wins / total) * 100 : 0,
    disciplineScore, slRespectRate, slHitRate, errorRate, aplusRate, rrReel,
  }
}

export async function getAvailableMonths(): Promise<string[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT DISTINCT SUBSTRING(date, 1, 7) AS month
    FROM trades
    WHERE date != '' AND LENGTH(date) >= 7
    ORDER BY month DESC
  `
  return rows.map(r => r.month as string).filter(Boolean)
}

export interface ChartData {
  equityCurve: { date: string; pnl: number; cumPnl: number }[]
  errorDistribution: { erreur: string; count: number }[]
  topTokens: { token: string; totalPnl: number; count: number }[]
  winRateByMonth: { month: string; winRate: number; count: number }[]
}

// ─── Wallet Settings ──────────────────────────────────────────────────────────

export interface WalletSettings {
  id: number
  wallet_address: string
  helius_webhook_id: string | null
  created_at: string
}

export async function getWalletSettings(): Promise<WalletSettings | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM wallet_settings ORDER BY id ASC LIMIT 1`
  return (rows[0] ?? null) as WalletSettings | null
}

export async function getLastTxSignature(): Promise<string | null> {
  const sql = getSql()
  const rows = await sql`SELECT last_tx_signature FROM wallet_settings ORDER BY id ASC LIMIT 1`
  return (rows[0]?.last_tx_signature as string) ?? null
}

export async function updateLastTxSignature(signature: string): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE wallet_settings
    SET last_tx_signature = ${signature}
    WHERE id = (SELECT id FROM wallet_settings ORDER BY id ASC LIMIT 1)
  `
}

export async function upsertWalletSettings(walletAddress: string, webhookId?: string): Promise<void> {
  const sql = getSql()
  const rows = await sql`SELECT id FROM wallet_settings ORDER BY id ASC LIMIT 1`
  if (rows.length > 0) {
    await sql`
      UPDATE wallet_settings
      SET wallet_address = ${walletAddress}, helius_webhook_id = ${webhookId ?? null}
      WHERE id = ${rows[0].id as number}
    `
  } else {
    await sql`
      INSERT INTO wallet_settings (wallet_address, helius_webhook_id)
      VALUES (${walletAddress}, ${webhookId ?? null})
    `
  }
}

// ─── Draft Trades ─────────────────────────────────────────────────────────────

export interface DraftTradeInput {
  token: string
  token_address: string
  taille: number
  fees_sol?: number
  market_cap_entree: number | null
  market_cap_sortie?: number | null
  date: string
  heure_entree: string
  tx_signature: string
  direction: 'buy' | 'sell'
}

// Cherche un draft BUY ouvert pour ce token (avec ou sans mc_sortie — gère les sells partiels)
export async function findOpenBuyDraft(tokenAddress: string) {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM trades
    WHERE draft = true
      AND token_address = ${tokenAddress}
      AND taille > 0
      AND market_cap_entree IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1
  `
  return rows[0] ?? null
}

// Complète/met à jour un draft BUY avec un sell (partiel ou total)
// Calcule la moyenne pondérée des exits et le PNL exact
export async function completeDraftWithSell(
  id: number,
  mcSell: number | null,
  solReceived: number,
  feeSell: number,
  txSignatureSell: string,
): Promise<void> {
  const sql = getSql()

  // Récupérer les valeurs actuelles pour le calcul incrémental
  const rows = await sql`SELECT sol_received, market_cap_sortie, taille, fees_sol, fees_total FROM trades WHERE id = ${id}`
  if (!rows[0]) return

  const prev = rows[0]
  const prevSolReceived = Number(prev.sol_received ?? 0)
  const prevMcSortie = Number(prev.market_cap_sortie ?? 0)
  const taille = Number(prev.taille ?? 0)
  const feesBuy = Number(prev.fees_sol ?? 0)
  const prevFeesTotal = Number(prev.fees_total ?? feesBuy)

  // Moyenne pondérée du MC de sortie
  const newSolReceived = prevSolReceived + solReceived
  const avgMcSortie = mcSell !== null && newSolReceived > 0
    ? Math.round(((prevMcSortie * prevSolReceived) + (mcSell * solReceived)) / newSolReceived * 100) / 100
    : prevMcSortie || mcSell

  // Frais cumulés (buy + tous les sells)
  const newFeesTotal = Math.round((prevFeesTotal + feeSell) * 1e6) / 1e6

  // PNL exact = SOL reçu total - mise initiale - frais totaux
  const pnl = Math.round((newSolReceived - taille - newFeesTotal) * 1000) / 1000

  // R4 : perte ≤ 20% par rapport au MC entry
  const mcEntry = Number((await sql`SELECT market_cap_entree FROM trades WHERE id = ${id}`)[0]?.market_cap_entree ?? 0)
  const pnlPct = mcEntry > 0 && avgMcSortie ? (avgMcSortie - mcEntry) / mcEntry * 100 : null
  const r4 = pnlPct !== null ? pnlPct >= -20 : null

  await sql`
    UPDATE trades SET
      market_cap_sortie = ${avgMcSortie},
      sol_received      = ${newSolReceived},
      fees_total        = ${newFeesTotal},
      pnl_sol           = ${pnl},
      tx_signature      = ${txSignatureSell},
      r4_respectee      = COALESCE(${r4}, r4_respectee)
    WHERE id = ${id}
  `
}

export async function getDraftTrades() {
  const sql = getSql()
  return await sql`SELECT * FROM trades WHERE draft = true ORDER BY created_at DESC`
}

export async function createDraftTrade(data: DraftTradeInput): Promise<number> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO trades (
      token, token_address, taille, fees_sol, market_cap_entree, market_cap_sortie,
      date, heure_entree, tx_signature, draft
    ) VALUES (
      ${data.token},
      ${data.token_address},
      ${data.taille},
      ${data.fees_sol ?? 0},
      ${data.market_cap_entree ?? null},
      ${data.market_cap_sortie ?? null},
      ${data.date},
      ${data.heure_entree},
      ${data.tx_signature},
      true
    )
    RETURNING id
  `
  return rows[0].id as number
}

export async function validateDraft(id: number, updates: Record<string, unknown>): Promise<void> {
  const sql = getSql()
  const g = (k: string) => updates[k] ?? null
  await sql`
    UPDATE trades SET
      draft               = false,
      date                = COALESCE(${g('date')}, date),
      heure_entree        = COALESCE(${g('heure_entree')}, heure_entree),
      token               = COALESCE(${g('token')}, token),
      market_cap_entree   = COALESCE(${g('market_cap_entree')}, market_cap_entree),
      market_cap_sortie   = COALESCE(${g('market_cap_sortie')}, market_cap_sortie),
      taille              = COALESCE(${g('taille')}, taille),
      pnl_sol             = COALESCE(${g('pnl_sol')}, pnl_sol),
      pnl_percent         = COALESCE(${g('pnl_percent')}, pnl_percent),
      entry_qualite       = COALESCE(${g('entry_qualite')}, entry_qualite),
      erreur              = COALESCE(${g('erreur')}, erreur),
      bien_fait           = COALESCE(${g('bien_fait')}, bien_fait)
    WHERE id = ${id}
  `
}

export async function getDraftCount(): Promise<number> {
  const sql = getSql()
  const rows = await sql`SELECT COUNT(*)::int AS count FROM trades WHERE draft = true`
  return Number(rows[0]?.count ?? 0)
}

// ─── Pré-trade v2 ─────────────────────────────────────────────────────────────

export interface PreTradeInput {
  token: string
  meme_narrative: string
  entry_qualite: string  // A / B / C
  pourquoi_pump: string
  mc_cible: number
  mc_invalidation: number
  plan_sortie: string
  taille: number
  market_cap_entree?: number | null  // estimé à l'entrée (optionnel)
  date: string
  heure_entree: string
}

export async function createPreTrade(data: PreTradeInput): Promise<number> {
  const sql = getSql()
  const rows = await sql`
    INSERT INTO trades (
      token, meme_narrative, entry_qualite,
      pourquoi_pump, mc_cible, mc_invalidation, plan_sortie,
      taille, market_cap_entree,
      date, heure_entree,
      draft, pre_trade_saisi_a
    ) VALUES (
      ${data.token},
      ${data.meme_narrative},
      ${data.entry_qualite},
      ${data.pourquoi_pump},
      ${data.mc_cible},
      ${data.mc_invalidation},
      ${data.plan_sortie},
      ${data.taille},
      ${data.market_cap_entree ?? null},
      ${data.date},
      ${data.heure_entree},
      true,
      NOW()
    )
    RETURNING id
  `
  return rows[0].id as number
}

// ─── Stats avancées v2 ────────────────────────────────────────────────────────

export interface AdvancedStats {
  // Discipline plan
  tradesAvecPlan: number
  tradesDansPlan: number
  tradesHorsPlan: number
  pnlDansPlan: number
  pnlHorsPlan: number
  winrateDansPlan: number
  winrateHorsPlan: number
  // Gains laissés sur la table
  coutSortiesPrematurees: number
  nbSortiesPrematurees: number
  // Par narrative
  parNarrative: { narrative: string; count: number; pnl: number; winrate: number }[]
  // Par conviction
  parConviction: { conviction: string; count: number; pnl: number; winrate: number }[]
  // Par tranche de MC
  parMcRange: { range: string; count: number; pnl: number; winrate: number }[]
  // Taux de complétion pré-trade
  totalTrades: number
  tradesAvecPreTrade: number
  completionRate: number
}

export async function getAdvancedStats(filter?: string): Promise<AdvancedStats> {
  const sql = getSql()
  const wf = whereFragment(filter)
  const hasFilter = filter && filter !== 'all'

  const rows = hasFilter
    ? await sql`
        SELECT pnl_sol, meme_narrative, entry_qualite, market_cap_entree,
               ath_constate, market_cap_sortie, taille,
               vente_dans_plan, pre_trade_saisi_a
        FROM trades
        WHERE draft IS NOT TRUE ${wf}
      `
    : await sql`
        SELECT pnl_sol, meme_narrative, entry_qualite, market_cap_entree,
               ath_constate, market_cap_sortie, taille,
               vente_dans_plan, pre_trade_saisi_a
        FROM trades
        WHERE draft IS NOT TRUE
      `

  const total = rows.length

  // Discipline plan
  const avecPlan = rows.filter(r => r.vente_dans_plan !== null && r.vente_dans_plan !== undefined)
  const dansPlan = avecPlan.filter(r => r.vente_dans_plan === true)
  const horsPlan = avecPlan.filter(r => r.vente_dans_plan === false)

  const pnlSum = (arr: typeof rows) => arr.reduce((s, r) => s + (Number(r.pnl_sol) || 0), 0)
  const wins = (arr: typeof rows) => arr.filter(r => Number(r.pnl_sol) > 0).length
  const wr = (arr: typeof rows) => arr.length > 0 ? wins(arr) / arr.length * 100 : 0

  // Coût des sorties prématurées
  let coutPremature = 0
  let nbPremature = 0
  for (const r of rows) {
    const mcS = Number(r.market_cap_sortie ?? 0)
    const mcE = Number(r.market_cap_entree ?? 0)
    const ath = Number(r.ath_constate ?? 0)
    const taille = Number(r.taille ?? 0)
    if (ath > mcS && mcE > 0 && taille > 0) {
      coutPremature += taille * ((ath / mcE) - (mcS / mcE))
      nbPremature++
    }
  }

  // Par narrative
  const narrativeMap = new Map<string, { count: number; pnl: number; wins: number }>()
  for (const r of rows) {
    if (!r.meme_narrative) continue
    const e = narrativeMap.get(r.meme_narrative) ?? { count: 0, pnl: 0, wins: 0 }
    e.count++
    e.pnl += Number(r.pnl_sol) || 0
    if (Number(r.pnl_sol) > 0) e.wins++
    narrativeMap.set(r.meme_narrative, e)
  }
  const parNarrative = Array.from(narrativeMap.entries())
    .map(([narrative, d]) => ({ narrative, count: d.count, pnl: d.pnl, winrate: d.count > 0 ? d.wins / d.count * 100 : 0 }))
    .sort((a, b) => b.pnl - a.pnl)

  // Par conviction
  const convMap = new Map<string, { count: number; pnl: number; wins: number }>()
  for (const r of rows) {
    const label = r.entry_qualite === 'A' ? 'Forte' : r.entry_qualite === 'B' ? 'Moyenne' : r.entry_qualite === 'C' ? 'Faible' : null
    if (!label) continue
    const e = convMap.get(label) ?? { count: 0, pnl: 0, wins: 0 }
    e.count++
    e.pnl += Number(r.pnl_sol) || 0
    if (Number(r.pnl_sol) > 0) e.wins++
    convMap.set(label, e)
  }
  const parConviction = ['Forte', 'Moyenne', 'Faible']
    .filter(c => convMap.has(c))
    .map(conviction => {
      const d = convMap.get(conviction)!
      return { conviction, count: d.count, pnl: d.pnl, winrate: d.count > 0 ? d.wins / d.count * 100 : 0 }
    })

  // Par tranche de MC (en k$, stocké en $ dans DB donc /1000)
  function mcRange(mcFull: number | null): string {
    if (!mcFull) return '?'
    const k = mcFull / 1000
    if (k < 10) return '<10k'
    if (k < 20) return '10-20k'
    if (k < 50) return '20-50k'
    if (k < 100) return '50-100k'
    return '>100k'
  }
  const mcMap = new Map<string, { count: number; pnl: number; wins: number }>()
  for (const r of rows) {
    const range = mcRange(r.market_cap_entree ? Number(r.market_cap_entree) : null)
    if (range === '?') continue
    const e = mcMap.get(range) ?? { count: 0, pnl: 0, wins: 0 }
    e.count++
    e.pnl += Number(r.pnl_sol) || 0
    if (Number(r.pnl_sol) > 0) e.wins++
    mcMap.set(range, e)
  }
  const mcOrder = ['<10k', '10-20k', '20-50k', '50-100k', '>100k']
  const parMcRange = mcOrder.filter(r => mcMap.has(r)).map(range => {
    const d = mcMap.get(range)!
    return { range, count: d.count, pnl: d.pnl, winrate: d.count > 0 ? d.wins / d.count * 100 : 0 }
  })

  // Taux de complétion pré-trade
  const avecPreTrade = rows.filter(r => r.pre_trade_saisi_a !== null && r.pre_trade_saisi_a !== undefined).length

  return {
    tradesAvecPlan: avecPlan.length,
    tradesDansPlan: dansPlan.length,
    tradesHorsPlan: horsPlan.length,
    pnlDansPlan: pnlSum(dansPlan),
    pnlHorsPlan: pnlSum(horsPlan),
    winrateDansPlan: wr(dansPlan),
    winrateHorsPlan: wr(horsPlan),
    coutSortiesPrematurees: Math.round(coutPremature * 1000) / 1000,
    nbSortiesPrematurees: nbPremature,
    parNarrative,
    parConviction,
    parMcRange,
    totalTrades: total,
    tradesAvecPreTrade: avecPreTrade,
    completionRate: total > 0 ? avecPreTrade / total * 100 : 0,
  }
}

// ─── Stats du jour ────────────────────────────────────────────────────────────

export async function getTodayStats(): Promise<{ count: number; pnl: number }> {
  const sql = getSql()
  const today = new Date().toISOString().slice(0, 10)
  const rows = await sql`
    SELECT pnl_sol FROM trades
    WHERE draft IS NOT TRUE AND date = ${today}
  `
  return {
    count: rows.length,
    pnl: rows.reduce((s, r) => s + (Number(r.pnl_sol) || 0), 0),
  }
}

export async function getChartData(filter?: string): Promise<ChartData> {
  const sql = getSql()
  const wf = whereFragment(filter)
  const hasFilter = filter && filter !== 'all'

  const [equityRows, erreurRows, tokenRows, monthRows] = await Promise.all([
    // Equity curve
    hasFilter
      ? sql`SELECT date, SUM(pnl_sol)::float AS pnl, SUM(SUM(pnl_sol)) OVER (ORDER BY date ASC)::float AS cum_pnl FROM trades WHERE pnl_sol IS NOT NULL ${wf} GROUP BY date ORDER BY date ASC`
      : sql`SELECT date, SUM(pnl_sol)::float AS pnl, SUM(SUM(pnl_sol)) OVER (ORDER BY date ASC)::float AS cum_pnl FROM trades WHERE pnl_sol IS NOT NULL GROUP BY date ORDER BY date ASC`,

    // Erreurs
    hasFilter
      ? sql`SELECT erreur, COUNT(*)::int AS count FROM trades WHERE erreur IS NOT NULL AND erreur != '' ${wf} GROUP BY erreur ORDER BY count DESC`
      : sql`SELECT erreur, COUNT(*)::int AS count FROM trades WHERE erreur IS NOT NULL AND erreur != '' GROUP BY erreur ORDER BY count DESC`,

    // Top tokens
    hasFilter
      ? sql`SELECT token, SUM(pnl_sol)::float AS total_pnl, COUNT(*)::int AS count FROM trades WHERE pnl_sol IS NOT NULL ${wf} GROUP BY token ORDER BY total_pnl DESC LIMIT 10`
      : sql`SELECT token, SUM(pnl_sol)::float AS total_pnl, COUNT(*)::int AS count FROM trades WHERE pnl_sol IS NOT NULL GROUP BY token ORDER BY total_pnl DESC LIMIT 10`,

    // Win rate par mois (toujours sur tout pour voir la tendance globale)
    sql`SELECT SUBSTRING(date, 1, 7) AS month, ROUND(100.0 * COUNT(*) FILTER (WHERE pnl_sol > 0) / NULLIF(COUNT(*), 0), 1)::float AS win_rate, COUNT(*)::int AS count FROM trades WHERE pnl_sol IS NOT NULL AND LENGTH(date) >= 7 GROUP BY SUBSTRING(date, 1, 7) ORDER BY month ASC`,
  ])

  return {
    equityCurve: equityRows.map(r => ({ date: r.date as string, pnl: Number(r.pnl ?? 0), cumPnl: Number(r.cum_pnl ?? 0) })),
    errorDistribution: erreurRows.map(r => ({ erreur: r.erreur as string, count: Number(r.count ?? 0) })),
    topTokens: tokenRows.map(r => ({ token: r.token as string, totalPnl: Number(r.total_pnl ?? 0), count: Number(r.count ?? 0) })),
    winRateByMonth: monthRows.map(r => ({ month: r.month as string, winRate: Number(r.win_rate ?? 0), count: Number(r.count ?? 0) })),
  }
}
