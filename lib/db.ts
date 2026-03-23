import { neon } from '@neondatabase/serverless'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL manquant — crée un .env.local avec ta connection string Neon')
  return neon(url)
}

export async function initSchema() {
  const sql = getSql()
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
      type_trade          TEXT,
      entry_qualite       TEXT,
      exit_qualite        TEXT,
      slippage            TEXT,
      r1_respectee        BOOLEAN DEFAULT false,
      r2_respectee        BOOLEAN DEFAULT false,
      r3_respectee        BOOLEAN DEFAULT false,
      r4_respectee        BOOLEAN DEFAULT false,
      sl_touche           BOOLEAN DEFAULT false,
      coupe_bon_moment    BOOLEAN DEFAULT false,
      coin_lent           BOOLEAN DEFAULT false,
      capital_libere      BOOLEAN DEFAULT false,
      erreur              TEXT,
      erreur_autre        TEXT DEFAULT '',
      trade_aplus         BOOLEAN DEFAULT false,
      devait_etre_pris    BOOLEAN DEFAULT false,
      marche_global       TEXT,
      narrative_dominante TEXT DEFAULT '',
      bien_fait           TEXT DEFAULT '',
      ameliorer           TEXT DEFAULT '',
      created_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `
}

// Fragment WHERE à embarquer dans les tagged templates
function whereFragment(filter?: string) {
  const sql = getSql()
  if (!filter || filter === 'all') return sql.unsafe('')
  if (filter === 'week') return sql.unsafe(`AND date >= TO_CHAR(NOW() - INTERVAL '7 days', 'YYYY-MM-DD')`)
  if (filter === 'month') return sql.unsafe(`AND date >= TO_CHAR(DATE_TRUNC('month', NOW()), 'YYYY-MM-DD')`)
  if (/^\d{4}-\d{2}$/.test(filter)) return sql.unsafe(`AND date LIKE '${filter}-%'`)
  return sql.unsafe('')
}

export async function getAllTrades(filter?: string) {
  const sql = getSql()
  const wf = whereFragment(filter)
  if (!filter || filter === 'all') {
    return await sql`SELECT * FROM trades ORDER BY date DESC, created_at DESC`
  }
  return await sql`SELECT * FROM trades WHERE 1=1 ${wf} ORDER BY date DESC, created_at DESC`
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
      valide_avant_entree, type_trade,
      entry_qualite, exit_qualite, slippage,
      r1_respectee, r2_respectee, r3_respectee, r4_respectee,
      sl_touche, coupe_bon_moment, coin_lent, capital_libere,
      erreur, erreur_autre,
      trade_aplus, devait_etre_pris,
      marche_global, narrative_dominante, bien_fait, ameliorer
    ) VALUES (
      ${g('date')}, ${g('heure_entree')}, ${g('token')},
      ${g('market_cap_entree')}, ${g('market_cap_sortie')}, ${g('taille')}, ${g('pnl_sol')}, ${g('pnl_percent')},
      ${g('meme_narrative')}, ${g('pourquoi_pump')}, ${g('clarte')}, ${g('mc_cible')}, ${g('rr_estime')},
      ${g('valide_avant_entree')}, ${g('type_trade')},
      ${g('entry_qualite')}, ${g('exit_qualite')}, ${g('slippage')},
      ${g('r1_respectee')}, ${g('r2_respectee')}, ${g('r3_respectee')}, ${g('r4_respectee')},
      ${g('sl_touche')}, ${g('coupe_bon_moment')}, ${g('coin_lent')}, ${g('capital_libere')},
      ${g('erreur')}, ${g('erreur_autre')},
      ${g('trade_aplus')}, ${g('devait_etre_pris')},
      ${g('marche_global')}, ${g('narrative_dominante')}, ${g('bien_fait')}, ${g('ameliorer')}
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
      type_trade          = ${g('type_trade')},
      entry_qualite       = ${g('entry_qualite')},
      marche_global       = ${g('marche_global')},
      r1_respectee        = ${g('r1_respectee')},
      r2_respectee        = ${g('r2_respectee')},
      r3_respectee        = ${g('r3_respectee')},
      r4_respectee        = ${g('r4_respectee')},
      sl_touche           = ${g('sl_touche')},
      coupe_bon_moment    = ${g('coupe_bon_moment')},
      coin_lent           = ${g('coin_lent')},
      erreur              = ${g('erreur')},
      erreur_autre        = ${g('erreur_autre')},
      trade_aplus         = ${g('trade_aplus')},
      bien_fait           = ${g('bien_fait')}
    WHERE id = ${id}
  `
}

export async function deleteTrade(id: number) {
  const sql = getSql()
  await sql`DELETE FROM trades WHERE id = ${id}`
}

export async function getStats(filter?: string) {
  const sql = getSql()
  // Fetch minimal data and compute in JS (simple + safe)
  let rows
  if (!filter || filter === 'all') {
    rows = await sql`SELECT pnl_sol, trade_aplus FROM trades`
  } else if (filter === 'week') {
    rows = await sql`SELECT pnl_sol, trade_aplus FROM trades WHERE date >= TO_CHAR(NOW() - INTERVAL '7 days', 'YYYY-MM-DD')`
  } else if (filter === 'month') {
    rows = await sql`SELECT pnl_sol, trade_aplus FROM trades WHERE date >= TO_CHAR(DATE_TRUNC('month', NOW()), 'YYYY-MM-DD')`
  } else if (/^\d{4}-\d{2}$/.test(filter)) {
    rows = await sql`SELECT pnl_sol, trade_aplus FROM trades WHERE date LIKE ${filter + '-%'}`
  } else {
    rows = await sql`SELECT pnl_sol, trade_aplus FROM trades`
  }

  const total = rows.length
  const totalPnl = rows.reduce((s, r) => s + (Number(r.pnl_sol) || 0), 0)
  const wins = rows.filter(r => Number(r.pnl_sol) > 0).length
  const losses = rows.filter(r => Number(r.pnl_sol) < 0).length
  const aplus = rows.filter(r => r.trade_aplus).length
  return {
    total,
    totalPnl,
    wins,
    losses,
    aplus,
    avgPnl: total > 0 ? totalPnl / total : 0,
    winRate: total > 0 ? (wins / total) * 100 : 0,
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
  byTradeType: { type: string; wins: number; losses: number; avgPnl: number }[]
  errorDistribution: { erreur: string; count: number }[]
  topTokens: { token: string; totalPnl: number; count: number }[]
  winRateByMonth: { month: string; winRate: number; count: number }[]
}

export async function getChartData(filter?: string): Promise<ChartData> {
  const sql = getSql()
  const wf = whereFragment(filter)
  const hasFilter = filter && filter !== 'all'

  const [equityRows, typeRows, erreurRows, tokenRows, monthRows] = await Promise.all([
    // Equity curve
    hasFilter
      ? sql`SELECT date, SUM(pnl_sol)::float AS pnl, SUM(SUM(pnl_sol)) OVER (ORDER BY date ASC)::float AS cum_pnl FROM trades WHERE pnl_sol IS NOT NULL ${wf} GROUP BY date ORDER BY date ASC`
      : sql`SELECT date, SUM(pnl_sol)::float AS pnl, SUM(SUM(pnl_sol)) OVER (ORDER BY date ASC)::float AS cum_pnl FROM trades WHERE pnl_sol IS NOT NULL GROUP BY date ORDER BY date ASC`,

    // Par type de trade
    hasFilter
      ? sql`SELECT type_trade AS type, COUNT(*) FILTER (WHERE pnl_sol > 0)::int AS wins, COUNT(*) FILTER (WHERE pnl_sol < 0)::int AS losses, AVG(pnl_sol)::float AS avg_pnl FROM trades WHERE type_trade IS NOT NULL ${wf} GROUP BY type_trade`
      : sql`SELECT type_trade AS type, COUNT(*) FILTER (WHERE pnl_sol > 0)::int AS wins, COUNT(*) FILTER (WHERE pnl_sol < 0)::int AS losses, AVG(pnl_sol)::float AS avg_pnl FROM trades WHERE type_trade IS NOT NULL GROUP BY type_trade`,

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
    byTradeType: typeRows.map(r => ({ type: r.type as string, wins: Number(r.wins ?? 0), losses: Number(r.losses ?? 0), avgPnl: Number(r.avg_pnl ?? 0) })),
    errorDistribution: erreurRows.map(r => ({ erreur: r.erreur as string, count: Number(r.count ?? 0) })),
    topTokens: tokenRows.map(r => ({ token: r.token as string, totalPnl: Number(r.total_pnl ?? 0), count: Number(r.count ?? 0) })),
    winRateByMonth: monthRows.map(r => ({ month: r.month as string, winRate: Number(r.win_rate ?? 0), count: Number(r.count ?? 0) })),
  }
}
