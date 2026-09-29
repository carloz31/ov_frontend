import { forestFirePhases } from '../data/ForestFireCaseData'
import type { ForestFireAssignments, ForestFirePhase, ForestFireProblem } from '../types/ForestFireCaseTypes'

const FOREST_FIRE_BUDGET_LIMIT = 16
const FOREST_FIRE_OPTIMAL_BUDGET = forestFirePhases.reduce(
  (total, phase) =>
    total +
    phase.problems.reduce((phaseTotal, problem) => phaseTotal + problem.expectedProfessionalIds.length, 0),
  0,
)

type ForestFireBudgetEvaluation = 'below-optimal' | 'optimal' | 'slightly-high' | 'high'

function getBudgetSpent(assignments: ForestFireAssignments) {
  return Object.values(assignments)
    .flatMap((phaseAssignments) => Object.values(phaseAssignments))
    .reduce((total, professionalIds) => total + professionalIds.length, 0)
}

function getProblemSatisfaction(problem: ForestFireProblem, selectedIds: string[]) {
  return problem.expectedProfessionalIds.filter((professionalId) => selectedIds.includes(professionalId))
    .length
}

function getPhaseSatisfaction(phase: ForestFirePhase, assignments: Record<string, string[]>) {
  return phase.problems.reduce(
    (total, problem) => total + getProblemSatisfaction(problem, assignments[problem.id]),
    0,
  )
}

function getTotalSatisfaction(assignments: ForestFireAssignments) {
  return forestFirePhases.reduce(
    (total, phase) => total + getPhaseSatisfaction(phase, assignments[phase.id]),
    0,
  )
}

function getBudgetEvaluation(spent: number): ForestFireBudgetEvaluation {
  if (spent < FOREST_FIRE_OPTIMAL_BUDGET) return 'below-optimal'
  if (spent === FOREST_FIRE_OPTIMAL_BUDGET) return 'optimal'
  if ((spent / FOREST_FIRE_OPTIMAL_BUDGET) * 100 <= 110) return 'slightly-high'
  return 'high'
}

export {
  FOREST_FIRE_BUDGET_LIMIT,
  FOREST_FIRE_OPTIMAL_BUDGET,
  getBudgetEvaluation,
  getBudgetSpent,
  getPhaseSatisfaction,
  getProblemSatisfaction,
  getTotalSatisfaction,
}

export type { ForestFireBudgetEvaluation }
