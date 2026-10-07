import { completeCase, recordCaseScore } from './AdventureStore'
import { unlockCaseOccupations } from '@/features/student-experience/discovery/explorationStore'
import { FOREST_FIRE_PASS_SCORE, getCorrectOccupationIds, getTotalSatisfaction } from './ForestFireCaseLogic'
import type { ForestFireAssignments } from '../types/ForestFireCaseTypes'

// Called once when entering the report; exiting and budget game-over do not finish an attempt.
export function finishForestFireAttempt(assignments: ForestFireAssignments) {
  const score = getTotalSatisfaction(assignments)
  const passed = score >= FOREST_FIRE_PASS_SCORE
  recordCaseScore('forest-fire', score)
  if (passed) completeCase('forest-fire')
  const newIconIds = passed ? unlockCaseOccupations(getCorrectOccupationIds(assignments)) : []
  return { score, passed, newIconIds }
}
