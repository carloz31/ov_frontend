import { useSearchParams } from 'react-router'
import { activityById } from '@/features/missions/content'
import { StudentActivityPlayer } from '../player/StudentActivityPlayer'
import { useJourney } from '@/features/missions/store'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getCaminoPoints } from './mapPoints'
import { MapScreenLayout } from './MapScreenLayout'
import '@/features/missions/journey.css'

export function CaminoScreen() {
  const adventure = useAdventure()
  const journey = useJourney()
  const [params, setParams] = useSearchParams()
  const activity = activityById(params.get('actividad') ?? '')
  if (activity)
    return (
      <div className="sx-player-host">
        <StudentActivityPlayer
          key={activity.id}
          activity={activity}
          edit={params.get('revision') === '1'}
          onClose={() => setParams({})}
          onNext={(id) => {
            if (activityById(id)) setParams({ actividad: id })
            else setParams({})
          }}
        />
      </div>
    )
  return (
    <MapScreenLayout
      zone="missions"
      points={getCaminoPoints(adventure, journey)}
      adventure={adventure}
      journey={journey}
    />
  )
}
