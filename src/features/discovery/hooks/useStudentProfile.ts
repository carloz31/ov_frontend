import { modoApi } from '@/config/env'
import { useEstadoServidor } from '@/store/servidor/estadoServidor'
import { progresoCamino, paginaInteresesServidor } from '@/lib/servidor/adaptadores'

import { useOccupationExplorationContext } from '@/context/occupationExplorationContext'
import { getTravelerLevel, useAdventure } from '@/store/adventureStore'
import { useJourney } from '@/store/journeyStore'

import { useDiscovery } from '@/store/discoveryStore'

import { getProfileBadges, getStudentAchievementGroups } from '@/features/discovery/lib/passport'
import { getHelenaPages } from '@/features/discovery/lib/helenaPages'
import { getOrderedPlans } from '@/features/discovery/lib/plans'
import { insigniasServidor } from '@/lib/servidor/adaptadores'
import { getAchievementPresentations } from '@/features/discovery/lib/achievements'

export function useStudentProfile() {
  const adventure = useAdventure(),
    journey = useJourney(),
    discovery = useDiscovery()
  const context = useOccupationExplorationContext()
  const servidor = useEstadoServidor()
  const nivelApi = modoApi ? getTravelerLevel(adventure, servidor.estado?.nivel_actual ?? null) : null
  const gruposApi = modoApi ? insigniasServidor(servidor.estado, getAchievementPresentations()) : []
  const insigniasApi = modoApi
    ? getProfileBadges(adventure, discovery, journey, {
        grupos: gruposApi,
        cuenta: servidor.estado?.cuenta.codigo ?? '',
      })
    : []

  if (modoApi)
    return {
      adventure,
      journey,
      context,
      ficha: {
        nombre: servidor.estado?.cuenta.nombre ?? 'Mi perfil',
        progreso: progresoCamino(servidor.estado).porcentaje,
        nivel: nivelApi,
        insignias: insigniasApi,
        textoIntereses:
          paginaInteresesServidor(servidor.estado, servidor.resultadoRiasec, discovery).state === 'ready'
            ? 'Tu página de intereses está lista para revelar.'
            : paginaInteresesServidor(servidor.estado, servidor.resultadoRiasec, discovery).state ===
                'revealed'
              ? 'Tu página de intereses está descifrada.'
              : servidor.errorResultado
                ? 'No se pudo consultar tu resultado.'
                : 'Conversa con Mara para reunir las pistas de tus intereses.',
      },
      level: undefined,
      badges: [],
      visibleBadges: [],
      pages: [],
      plans: [],
      extraFavorites: 0,
    }
  const level = getTravelerLevel(adventure)
  const badges = getStudentAchievementGroups(adventure, journey).flatMap((g, index) =>
    g.items.filter((b) => b.done).map((b) => ({ ...b, group: index })),
  )
  const visibleBadges = getProfileBadges(adventure, discovery, journey)
  const pages = getHelenaPages(journey, discovery)
  const plans = getOrderedPlans(context.decisionSheets, discovery.planOrder)
  const extraFavorites = context.careerInterestIds.filter(
    (id) => !plans.some((p) => p.sourceId === id),
  ).length
  return {
    adventure,
    journey,
    context,
    ficha: undefined,
    level,
    badges,
    visibleBadges,
    pages,
    plans,
    extraFavorites,
  }
}
