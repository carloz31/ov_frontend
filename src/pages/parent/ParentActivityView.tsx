import { useParams, useSearchParams } from 'react-router'

import { parentActivities } from '@/features/parent/data/parentPortal'

import { parentActivityAvailable } from '@/features/parent/lib/missionLogic'
import { useParentJourney } from '@/store/parentJourneyStore'

function ParentActivityView() {
  const { activityId } = useParams()
  const [params] = useSearchParams()
  const state = useParentJourney()
  const activity = parentActivities.find((item) => item.id === activityId)
  if (!activity || !parentActivityAvailable(activity, state))
    return <ActivityUnavailable locked={!!activity} />
  return (
    <ParentActivitySession
      key={`${activity.id}/${params.get('repasar') ?? ''}`}
      activity={activity}
      review={params.get('repasar') === '1' && state.progress[activity.id]?.estado === 'completada'}
    />
  )
}
import { ParentActivitySession } from '@/features/parent/components/ParentActivitySession'

import { ActivityUnavailable } from '@/features/parent/components/ActivityUnavailable'
export { ParentActivityView }
