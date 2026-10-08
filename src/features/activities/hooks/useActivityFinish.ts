import { modoApi } from '@/config/env'
import { actividadServidor, textosDesbloqueos } from '@/lib/servidor/adaptadores'
import { obtenerEstadoServidor } from '@/store/servidor/estadoServidor'
import type { DesbloqueoNuevo } from '@/types/servidor'
import { useNavigate } from 'react-router'
import { catalog } from '@/data/activities/content'
import type { Actividad } from '@/types/activities'
import { useJourney } from '@/store/journeyStore'

import { additionalMissions } from '@/data/activities/reflectionConfig'

export function useActivityFinish(activity: Actividad, desbloqueosServidor?: DesbloqueoNuevo[]) {
  const state = useJourney()
  const navigate = useNavigate()
  if (modoApi)
    return {
      state,
      navigate,
      registro: {
        titulo:
          actividadServidor(obtenerEstadoServidor().estado, activity.id)?.estado === 'COMPLETADA'
            ? 'Este hallazgo viaja contigo.'
            : 'Consultando tu avance.',
        desbloqueos: textosDesbloqueos(desbloqueosServidor ?? []),
      },
      piece: undefined,
      badge: undefined,
      sheets: [],
    }
  const piece = catalog.piezasLlave.find((piece) => piece.id === activity.recompensa?.piezaLlave)
  const badge =
    state.progress[activity.id]?.estado === 'completada' &&
    additionalMissions.find((m) => m.id === activity.id)?.insignia
  const ids = [
    ...new Set([
      ...activity.nodos.flatMap((node) => (node.tipo === 'diapositiva' ? (node.recursoIds ?? []) : [])),
      ...(activity.recompensa?.recursoIds ?? []),
    ]),
  ]
  const sheets = catalog.recursos.filter(
    (resource) =>
      ids.includes(resource.id) && resource.tipo === 'ficha' && state.resources.includes(resource.id),
  )
  return { state, navigate, registro: undefined, piece, badge, sheets }
}
