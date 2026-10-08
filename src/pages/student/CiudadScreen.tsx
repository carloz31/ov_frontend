import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { modoApi } from '@/config/env'
import { useEstadoServidor } from '@/store/servidor/estadoServidor'
import { actividadServidor, ciudadDisponible } from '@/lib/servidor/adaptadores'
import { MaraInteractionPlayer } from '@/features/activities/components/MaraInteractionPlayer'
import { challenges } from '@/data/content/challenges'
import { ChallengePlayer } from '@/features/activities/components/challenges/ChallengePlayer'
import { activityById } from '@/data/activities/content'
import { StudentActivityPlayer } from '@/features/activities/components/StudentActivityPlayer'
import { useJourney } from '@/store/journeyStore'
import { canAccessCity, useAdventure } from '@/store/adventureStore'
import { getCiudadPoints } from '@/features/adventure/lib/mapPoints'
import { MapScreenLayout } from '@/features/adventure/components/MapScreenLayout'
import '@/styles/student/journey.css'

export function CiudadScreen() {
  const servidor = useEstadoServidor()
  const adventure = useAdventure()
  const journey = useJourney()
  const [params, setParams] = useSearchParams()
  const codigo = params.get('actividad') ?? ''
  const actividadApi = actividadServidor(servidor.estado, codigo)
  const permitido =
    ciudadDisponible(servidor.estado) &&
    /^act-tip-(0[1-9]|1[0-4]|final)$/.test(codigo) &&
    actividadApi &&
    actividadApi.estado !== 'BLOQUEADA'
  useEffect(() => {
    if (!modoApi || !params.has('actividad') || permitido) return
    const next = new URLSearchParams(params)
    const codigo = params.get('actividad') ?? ''
    next.delete('actividad')
    next.delete('revision')
    next.delete('modo')
    next.set('punto', /^act-tip-/.test(codigo) ? 'mara-test' : codigo)
    setParams(next, { replace: true })
  }, [params, setParams, permitido])
  if (modoApi && permitido)
    return (
      <div className="sx-player-host">
        <MaraInteractionPlayer
          key={`${servidor.estado?.cuenta.codigo}/${codigo}/${params.get('revision')}`}
          codigo={codigo}
          revision={params.get('revision') === '1'}
          onClose={() => setParams({})}
        />
      </div>
    )
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
