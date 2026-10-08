import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { modoApi } from '@/config/env'
import { useEstadoServidor } from '@/store/servidor/estadoServidor'
import { actividadServidor, ciudadDisponible } from '@/lib/servidor/adaptadores'

import { challenges } from '@/data/content/challenges'

import { activityById } from '@/data/activities/content'

import { useJourney } from '@/store/journeyStore'
import { canAccessCity, useAdventure } from '@/store/adventureStore'

export function useCityAccess() {
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

  const challenge = challenges.find((c) => c.id === params.get('actividad'))
  const activity = activityById('act-tip-01')
  return {
    adventure,
    journey,
    params,
    setParams,
    interaccion:
      modoApi && permitido
        ? { codigo, clave: `${servidor.estado?.cuenta.codigo}/${codigo}/${params.get('revision')}` }
        : undefined,
    challenge: !modoApi && canAccessCity(adventure) ? challenge : undefined,
    activity:
      !modoApi && canAccessCity(adventure) && activity && params.get('actividad') === activity.id
        ? activity
        : undefined,
  }
}
