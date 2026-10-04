import { useSearchParams } from 'react-router'
import { activityById } from '@/features/missions/content'
import { JourneyPlayer } from '@/features/missions/JourneyPlayer'
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
      <div className="sx-legacy-player">
        <JourneyPlayer
          activity={activity}
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
