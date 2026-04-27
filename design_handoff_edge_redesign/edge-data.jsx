// Shared mock data + small helpers used across all 3 directions.

const TRADES = [
  { id: 1, date: '04-22', heure: '14:32', token: 'WIF',     type: 'Momentum', narrative: 'Animaux',          mcE: 29.9,   mcS: 89.7,  taille: 1.5,  pnlSol:  3.01, pnlPct: 200,  conv: 'A', marche: 'Bull',   aplus: true,  err: 'Aucune',     sl: false, note: 'Entry parfaite sur le retest, j\'ai laissé courir.' },
  { id: 2, date: '04-22', heure: '17:08', token: 'PNUT',    type: 'Early',    narrative: 'Animaux',          mcE: 12.0,   mcS: 8.4,   taille: 0.8,  pnlSol: -0.24, pnlPct: -30,  conv: 'B', marche: 'Bull',   aplus: false, err: 'Pas de SL',  sl: false, note: 'Pas mis le SL, je voulais "voir".' },
  { id: 3, date: '04-22', heure: '20:51', token: 'GOAT',    type: 'Breakout', narrative: 'AI',               mcE: 145,    mcS: 312,   taille: 2.0,  pnlSol:  2.30, pnlPct: 115,  conv: 'A', marche: 'Bull',   aplus: true,  err: 'Aucune',     sl: false, note: 'Breakout net, volume × 4. Coupé en deux fois.' },
  { id: 4, date: '04-23', heure: '09:14', token: 'POPCAT',  type: 'Rotation', narrative: 'Animaux',          mcE: 890,    mcS: 845,   taille: 1.2,  pnlSol: -0.06, pnlPct: -5,   conv: 'C', marche: 'Neutre', aplus: false, err: 'FOMO',       sl: true,  note: 'FOMO sur la rotation, no thesis.' },
  { id: 5, date: '04-23', heure: '11:47', token: 'MOODENG', type: 'Momentum', narrative: 'Animaux',          mcE: 45,     mcS: 120,   taille: 1.0,  pnlSol:  1.66, pnlPct: 167,  conv: 'B', marche: 'Neutre', aplus: false, err: 'Aucune',     sl: false, note: 'Bonne lecture du momentum, pas A+ car late entry.' },
  { id: 6, date: '04-23', heure: '15:22', token: 'CHILLGUY',type: 'Breakout', narrative: 'Internet meme',    mcE: 67,     mcS: 54,    taille: 1.0,  pnlSol: -0.20, pnlPct: -19,  conv: 'B', marche: 'Neutre', aplus: false, err: 'Exit trop tôt', sl: false, note: 'SL respecté, le coin a re-pumpé après. Frustrant mais discipline.' },
  { id: 7, date: '04-23', heure: '22:03', token: 'TRUMP',   type: 'Early',    narrative: 'Political',        mcE: 8.5,    mcS: 22,    taille: 0.5,  pnlSol:  0.79, pnlPct: 159,  conv: 'A', marche: 'Bull',   aplus: true,  err: 'Aucune',     sl: false, note: 'Tweet play classique, sized small comme prévu.' },
  { id: 8, date: '04-24', heure: '08:55', token: 'FARTCOIN',type: 'Momentum', narrative: 'Internet meme',    mcE: 320,    mcS: 280,   taille: 1.5,  pnlSol: -0.21, pnlPct: -13,  conv: 'B', marche: 'Neutre', aplus: false, err: 'Mauvais sizing', sl: true, note: 'Sized trop gros pour la conviction réelle.' },
  { id: 9, date: '04-24', heure: '12:30', token: 'AI16Z',   type: 'Rotation', narrative: 'AI',               mcE: 1200,   mcS: 1450,  taille: 1.8,  pnlSol:  0.39, pnlPct: 21,   conv: 'B', marche: 'Neutre', aplus: false, err: 'Aucune',     sl: false, note: 'Trade propre, RR ok.' },
  { id: 10,date: '04-24', heure: '19:42', token: 'SPX6900', type: 'Momentum', narrative: 'Crypto culture',   mcE: 180,    mcS: 410,   taille: 1.2,  pnlSol:  1.55, pnlPct: 128,  conv: 'A', marche: 'Bull',   aplus: true,  err: 'Aucune',     sl: false, note: 'Belle continuation, A+.' },
  { id: 11,date: '04-25', heure: '10:11', token: 'GIGA',    type: 'Breakout', narrative: 'Internet meme',    mcE: 92,     mcS: 76,    taille: 1.0,  pnlSol: -0.16, pnlPct: -17,  conv: 'C', marche: 'Mort',   aplus: false, err: 'FOMO',       sl: true,  note: 'Marché mort, pas dû entrer.' },
  { id: 12,date: '04-25', heure: '13:04', token: 'PEPE',    type: 'Rotation', narrative: 'Animaux',          mcE: 4200,   mcS: 4350,  taille: 2.0,  pnlSol:  0.07, pnlPct: 4,    conv: 'B', marche: 'Mort',   aplus: false, err: 'Exit trop tôt', sl: false, note: 'Sortie trop tôt, gros buyer dans le book.' },
];

const STATS = {
  total: 12, wins: 7, losses: 5,
  totalPnl: 8.90, avgPnl: 0.74,
  winRate: 58, rrReel: 2.4,
  discipline: 83, slRespect: 92, slHit: 25, errorRate: 33, aplusRate: 33,
  bestToken: 'WIF', worstToken: 'POPCAT',
  bestNarrative: 'Animaux', dominantError: 'FOMO',
};

// Equity curve points (cumulative PnL across trades, in display order)
const EQUITY = (() => {
  let cum = 0;
  return TRADES.map(t => { cum += t.pnlSol; return { x: t.date + ' ' + t.heure, y: +cum.toFixed(2), token: t.token }; });
})();

const ERRORS = [
  { name: 'FOMO',         count: 2, pnl: -0.40, color: 'red' },
  { name: 'Exit trop tôt',count: 2, pnl: -0.13, color: 'amber' },
  { name: 'Pas de SL',    count: 1, pnl: -0.24, color: 'red' },
  { name: 'Mauvais sizing',count: 1, pnl: -0.21, color: 'red' },
  { name: 'Aucune',       count: 6, pnl: +9.88, color: 'green' },
];

const NARRATIVES = [
  { name: 'Animaux',        trades: 5, pnl: +6.66, win: 60 },
  { name: 'AI',             trades: 2, pnl: +2.69, win: 100 },
  { name: 'Internet meme',  trades: 3, pnl: -0.57, win: 0 },
  { name: 'Political',      trades: 1, pnl: +0.79, win: 100 },
  { name: 'Crypto culture', trades: 1, pnl: +1.55, win: 100 },
];

// 7-day calendar grid for week view (most recent week)
const WEEK_DAYS = [
  { date: '04-21', label: 'Lun', trades: [], pnl: 0 },
  { date: '04-22', label: 'Mar', trades: [1,2,3], pnl: 5.07 },
  { date: '04-23', label: 'Mer', trades: [4,5,6,7], pnl: 2.19 },
  { date: '04-24', label: 'Jeu', trades: [8,9,10], pnl: 1.73 },
  { date: '04-25', label: 'Ven', trades: [11,12], pnl: -0.09 },
  { date: '04-26', label: 'Sam', trades: [], pnl: 0 },
  { date: '04-27', label: 'Dim', trades: [], pnl: 0 },
];

function tradeById(id) { return TRADES.find(t => t.id === id); }

function fmtPnl(n, d=2) {
  if (n == null) return '—';
  const s = n >= 0 ? '+' : '';
  return s + n.toFixed(d);
}

function pnlColor(n) {
  if (n == null || n === 0) return 'var(--text-3)';
  return n > 0 ? 'var(--green)' : 'var(--red)';
}

function fmtMC(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n/1000).toFixed(1) + 'M';
  return n.toFixed(0) + 'K';
}

// expose
Object.assign(window, { TRADES, STATS, EQUITY, ERRORS, NARRATIVES, WEEK_DAYS, tradeById, fmtPnl, pnlColor, fmtMC });
