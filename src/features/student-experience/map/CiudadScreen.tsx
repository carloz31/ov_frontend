import { useSearchParams } from 'react-router'
import { activityById } from '@/features/missions/content'
import { StudentActivityPlayer } from '../player/StudentActivityPlayer'
import { useJourney } from '@/features/missions/store'
import { canAccessCity, useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getCiudadPoints } from './mapPoints'
import { MapScreenLayout } from './MapScreenLayout'
import '@/features/missions/journey.css'

export function CiudadScreen() {
  const adventure = useAdventure()
  const journey = useJourney()
  const [params, setParams] = useSearchParams()
  const activity = activityById('act-tip-01')
  if (canAccessCity(adventure) && activity && params.get('actividad') === activity.id)
    return (
      <div className="sx-player-host">
        <StudentActivityPlayer
          activity={activity}
          imageUrl="/images/background/afueras.png"
          direct={params.get('modo') === 'directa'}
          onClose={() => setParams({})}
          onNext={() => setParams({})}
        />
      </div>
    )
  return (
    <MapScreenLayout
      zone="central"
      points={getCiudadPoints(adventure, journey)}
      adventure={adventure}
      journey={journey}
    />
  )
}
