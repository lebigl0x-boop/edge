export type QualityABC = 'A' | 'B' | 'C'
export type Slippage = 'faible' | 'ok' | 'élevé'
export type Erreur =
  | 'Aucune'
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
  // 2. Contexte & Setup (pré-trade)
  meme_narrative: string
  pourquoi_pump: string          // "Pourquoi ça pump" — obligatoire v2
  mc_cible: number | null        // MC cible en k$ — obligatoire v2
  mc_invalidation: number | null // MC invalidation en k$ — nouveau v2
  plan_sortie: string | null     // Plan de sortie texte — nouveau v2
  pre_trade_saisi_a: string | null // Horodatage saisie pré-trade — nouveau v2
  // Anciens champs (conservés pour rétrocompatibilité, hors formulaire v2)
  clarte: number | null
  rr_estime: number | null
  valide_avant_entree: boolean
  // 3. Exécution
  entry_qualite: QualityABC | null
  exit_qualite: QualityABC | null
  slippage: Slippage | null
  // 4. Discipline (R1+R2 remplacés par pré-trade, R4 remplacé par mc_invalidation)
  r1_respectee: boolean
  r2_respectee: boolean
  r4_respectee: boolean
  // 5. Gestion
  sl_touche: boolean
  coupe_bon_moment: boolean
  coin_lent: boolean
  capital_libere: boolean
  // 6. Post-trade
  ath_constate: number | null    // ATH MC constaté après le trade — nouveau v2
  vente_dans_plan: boolean | null // La sortie a suivi le plan — nouveau v2
  // 7. Erreur
  erreur: Erreur
  erreur_autre: string
  // 8. Qualité
  trade_aplus: boolean
  devait_etre_pris: boolean
  // 9. Contexte marché (legacy)
  narrative_dominante: string
  // 10. Note rapide
  bien_fait: string
  ameliorer: string
  // Auto-import
  draft: boolean
  tx_signature: string | null
  token_address: string | null
  fees_sol: number
  sol_received: number
  fees_total: number
  // Cycle
  cycle: string | null   // 'cycle-1' | 'v1-historique' | null
  // Meta
  created_at: string
}

export type TradeInput = Omit<Trade, 'id' | 'created_at'>
