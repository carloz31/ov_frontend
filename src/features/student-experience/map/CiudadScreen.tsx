import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { modoApi } from '@/features/servidor/config'
import { useEstadoServidor } from '@/features/servidor/estadoServidor'
import { challenges } from '../challenges/data'
import { ChallengePlayer } from '../challenges/ChallengePlayer'
import { activityById } from '@/features/missions/content'
import { StudentActivityPlayer } from '../player/StudentActivityPlayer'
import { useJourney } from '@/features/missions/store'
import { canAccessCity, useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getCiudadPoints } from './mapPoints'
import { MapScreenLayout } from './MapScreenLayout'
import '@/features/missions/journey.css'

export function CiudadScreen() {
  useEstadoServidor()
  const adventure = useAdventure()
  const journey = useJourney()
  const [params, setParams] = useSearchParams()
  useEffect(() => {
    if (!modoApi || !params.has('actividad')) return
    const next = new URLSearchParams(params)
    const codigo = params.get('actividad') ?? ''
    next.delete('actividad')
    next.delete('revision')
    next.delete('modo')
    next.set('punto', /^act-tip-/.test(codigo) ? 'mara-test' : codigo)
    setParams(next, { replace: true })
  }, [params, setParams])
  const challenge = challenges.find((c) => c.id === params.get('actividad'))
  if (!modoApi && canAccessCity(adventure) && challenge)
    return <ChallengePlayer key={challenge.id} challenge={challenge} onClose={() => setParams({})} />
  const activity = activityById('act-tip-01')
  if (!modoApi && canAccessCity(adventure) && activity && params.get('actividad') === activity.id)
    return (
      <div className="sx-player-host">
        <StudentActivityPlayer
          activity={activity}
          imageUrl="/images/background/afueras.png"
          direct={params.get('modo') === 'directa'}
          onClose={() => setParams({})}
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
