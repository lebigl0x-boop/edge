export type TradeType = 'Early' | 'Breakout' | 'Momentum' | 'Rotation'
export type QualityABC = 'A' | 'B' | 'C'
export type Slippage = 'faible' | 'ok' | 'élevé'
export type MarcheGlobal = 'bull' | 'neutre' | 'mort'
export type Erreur =
  | 'FOMO'
  | 'Overtrade'
  | 'Mauvaise narrative'
  | 'Mauvais sizing'
  | 'Pas de SL'
  | 'Exit trop tôt'
  | 'Autre'
  | null

export interface Trade {
  id: number
  // 1. Infos de base
  date: string
  heure_entree: string
  token: string
  market_cap_entree: number | null
  market_cap_sortie: number | null
  taille: number | null
  pnl_sol: number | null
  pnl_percent: number | null
  // 2. Contexte & Setup
  meme_narrative: string
  pourquoi_pump: string
  clarte: number | null // 1-5
  mc_cible: number | null
  rr_estime: number | null
  valide_avant_entree: boolean
  type_trade: TradeType | null
  // 3. Exécution
  entry_qualite: QualityABC | null
  exit_qualite: QualityABC | null
  slippage: Slippage | null
  // 4. Discipline
  r1_respectee: boolean
  r2_respectee: boolean
  r3_respectee: boolean
  r4_respectee: boolean
  // 5. Gestion
  sl_touche: boolean
  coupe_bon_moment: boolean
  coin_lent: boolean
  capital_libere: boolean
  // 6. Erreur
  erreur: Erreur
  erreur_autre: string
  // 7. Qualité
  trade_aplus: boolean
  devait_etre_pris: boolean
  // 8. Contexte marché
  marche_global: MarcheGlobal | null
  narrative_dominante: string
  // 9. Note rapide
  bien_fait: string
  ameliorer: string
  // Meta
  created_at: string
}

export type TradeInput = Omit<Trade, 'id' | 'created_at'>
