export type ExecGrade = 'A' | 'B' | 'C' | 'D'
export type PerfGrade = 'S' | 'A' | 'B' | 'C' | 'D'

export function execScore(
  r1: boolean, r2: boolean, r3: boolean, r4: boolean,
  erreur: string | null
): ExecGrade {
  const rules = [r1, r2, r3, r4].filter(Boolean).length
  if (rules === 4 && (!erreur || erreur === 'Aucune')) return 'A'
  if (rules >= 3) return 'B'
  if (rules >= 2) return 'C'
  return 'D'
}

export function perfScore(pnlPercent: number | null | undefined): PerfGrade {
  if (pnlPercent === null || pnlPercent === undefined) return 'C'
  if (pnlPercent >= 200) return 'S'
  if (pnlPercent >= 100) return 'A'
  if (pnlPercent >= 50) return 'B'
  if (pnlPercent >= -20) return 'C'
  return 'D'
}

export const execColor: Record<ExecGrade, string> = {
  A: '#30d158',
  B: '#0a84ff',
  C: '#ff9f0a',
  D: '#ff453a',
}

export const perfColor: Record<PerfGrade, string> = {
  S: '#ffd60a',
  A: '#30d158',
  B: '#0a84ff',
  C: '#ff9f0a',
  D: '#ff453a',
}

export const execLabel: Record<ExecGrade, string> = {
  A: 'Parfait (4/4 + no error)',
  B: '3 règles respectées',
  C: '2 règles respectées',
  D: '< 2 règles',
}

export const perfLabel: Record<PerfGrade, string> = {
  S: '≥ 200%',
  A: '≥ 100%',
  B: '≥ 50%',
  C: '≥ -20%',
  D: '< -20%',
}
