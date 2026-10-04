import type { JourneyState } from '@/features/missions/logic'
import { fieldMissions, type FieldMission } from '@/features/occupation-exploration/data/AdventureData'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'

export const specActivityByMission: Partial<Record<FieldMission['id'], string>> = {
  welcome: 'mission-welcome',
  story: 'mission-story',
  future: 'mission-future',
  beliefs: 'enc-mitos',
  compass: 'mission-compass',
  plan: 'act-06',
  expectations: 'mission-expectations',
  'next-step': 'mission-next-step',
}

export function getMissionsToSync(
  adventure: Pick<AdventureState, 'completedMissionIds'>,
  journey: Pick<JourneyState, 'progress'>,
): FieldMission['id'][] {
  return fieldMissions
    .filter((mission) => {
      const activityId = specActivityByMission[mission.id]
      return (
        activityId &&
        journey.progress[activityId]?.estado === 'completada' &&
        !adventure.completedMissionIds.includes(mission.id)
      )
    })
    .map((mission) => mission.id)
}
