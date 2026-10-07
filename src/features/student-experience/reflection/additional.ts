import type { JourneyState } from '@/features/missions/logic'
import { additionalMissions } from './config'

// Public aggregation for future thematic displays; no role-specific panel dependencies.
export function additionalThematicProgress(journey: Pick<JourneyState, 'progress'>) {
  return additionalMissions.reduce<Record<string, number>>((counts, mission) => {
    if (journey.progress[mission.id]?.estado === 'completada')
      counts[mission.tematica] = (counts[mission.tematica] ?? 0) + 1
    return counts
  }, {})
}
