import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { modoApi } from '@/features/servidor/config'
import { useEstadoServidor } from '@/features/servidor/estadoServidor'
import { actividadServidor, ciudadDisponible } from '@/features/servidor/adaptadores'
import { MaraInteractionPlayer } from '../player/MaraInteractionPlayer'
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
