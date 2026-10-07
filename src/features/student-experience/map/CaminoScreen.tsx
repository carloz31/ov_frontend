import { useEffect } from 'react'
import { useEstadoServidor } from '@/features/servidor/estadoServidor'
import { useSearchParams } from 'react-router'
import { activityById } from '@/features/missions/content'
import { StudentActivityPlayer } from '../player/StudentActivityPlayer'
import { useJourney } from '@/features/missions/store'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getCaminoPoints } from './mapPoints'
import { MapScreenLayout } from './MapScreenLayout'
import '@/features/missions/journey.css'
import { useReflections } from '../reflection/store'

export function CaminoScreen() {
  useEstadoServidor()
  const adventure = useAdventure()
  const journey = useJourney()
  useReflections()
  const [params, setParams] = useSearchParams()
  const points = getCaminoPoints(adventure, journey)
  const activity = activityById(params.get('actividad') ?? '')
  const requestedPoint = activity ? points.find((point) => point.specActivityId === activity.id) : undefined
  const allowed = !!activity && !!requestedPoint && requestedPoint.status !== 'locked'
  useEffect(() => {
    if (!params.has('actividad') || allowed) return
    const next = new URLSearchParams(params)
    next.delete('actividad')
    next.delete('revision')
    if (requestedPoint) next.set('punto', requestedPoint.id)
    setParams(next, { replace: true })
  }, [params, setParams, allowed, requestedPoint])
  if (activity && allowed)
    return (
      <div className="sx-player-host">
        <StudentActivityPlayer
          key={activity.id}
          activity={activity}
          imageUrl="/images/background/forest.png"
          edit={params.get('revision') === '1'}
          onClose={() => setParams({})}
        />
      </div>
    )
  return <MapScreenLayout zone="missions" points={points} adventure={adventure} journey={journey} />
}
