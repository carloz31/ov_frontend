import type { JourneyState } from '@/features/missions/logic'
import { activityById } from '@/features/missions/content'
import { BookOpen, Building2, ClipboardList, Feather, KeyRound, type LucideIcon } from 'lucide-react'
import {
  cityCases,
  fieldMissions,
  type FieldMission,
} from '@/features/occupation-exploration/data/AdventureData'
import { canAccessCity } from '@/features/occupation-exploration/lib/AdventureStore'
import { lumiDayKey } from '@/features/occupation-exploration/lib/LumiFriendship'
import { getActivityPrompt } from '@/features/occupation-exploration/data/JournalData'
import { getExplorationImagePath } from '@/features/occupation-exploration/lib/ExplorationAssets'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'

export type StudentMapPoint = {
  id: string
  title: string
  subtitle: string
  x: number
  y: number
  icon: LucideIcon
  status: 'locked' | 'available' | 'completed'
  zone: 'camino' | 'ciudad'
  specActivityId?: string
  bloque?: number
  actionEnabled: boolean
}

export type StudentZone = 'missions' | 'central'

export const specActivityByMission: Partial<Record<FieldMission['id'], string>> = {
  welcome: 'mission-welcome',
  story: 'mission-story',
  future: 'mission-future',
  beliefs: 'enc-mitos',
  compass: 'mission-compass',
  plan: 'act-06',
  expectations: 'mission-expectations',
  'next-step': 'mission-next-step',
}

export function getMissionsToSync(
  adventure: Pick<AdventureState, 'completedMissionIds'>,
  journey: Pick<JourneyState, 'progress'>,
): FieldMission['id'][] {
  return fieldMissions
    .filter((mission) => {
      const activityId = specActivityByMission[mission.id]
      return (
        activityId &&
        journey.progress[activityId]?.estado === 'completada' &&
        !adventure.completedMissionIds.includes(mission.id)
      )
    })
    .map((mission) => mission.id)
}

function missionComplete(mission: FieldMission, adventure: AdventureState, journey: JourneyState) {
  const specId = specActivityByMission[mission.id]
  return (
    adventure.completedMissionIds.includes(mission.id) ||
    (specId !== undefined && journey.progress[specId]?.estado === 'completada')
  )
}

export function getActivityType(mission: FieldMission) {
  if (mission.id === 'beliefs' || mission.kind === 'information') return 'Informativa'
  if (mission.kind === 'questionnaire') return 'Test'
  return 'Registro'
}
export function getMissionMeta(mission: FieldMission) {
  if (mission.kind === 'information') return '4 min'
  if (mission.kind === 'reflection') return 'A tu ritmo'
  if (mission.kind === 'deliverable') return '5 min'
  return '6 min'
}
export function getMissionIcon(mission: FieldMission): LucideIcon {
  const type = getActivityType(mission)
  return type === 'Informativa' ? BookOpen : type === 'Test' ? ClipboardList : Feather
}

export const caminoSequence = ['welcome', 'beliefs', 'story'] as const

const orderedMissions = [
  ...caminoSequence.map((id) => fieldMissions.find((mission) => mission.id === id)!),
  ...fieldMissions.filter((mission) => !caminoSequence.some((id) => id === mission.id)),
]

export function getNextCaminoActivity(points: StudentMapPoint[]) {
  const next = points.find((point) => point.id !== 'city' && point.status === 'available')
  return activityById(next?.specActivityId ?? '') ?? null
}

export function getCaminoPoints(adventure: AdventureState, journey: JourneyState): StudentMapPoint[] {
  return [
    ...orderedMissions.map((mission, index): StudentMapPoint => ({
      id: mission.id,
      title: mission.title,
      x: fieldMissions[index].x,
      y: fieldMissions[index].y,
      subtitle: `${getActivityType(mission)} · ${getMissionMeta(mission)}`,
      icon: getMissionIcon(mission),
      zone: 'camino',
      specActivityId: specActivityByMission[mission.id],
      bloque: activityById(specActivityByMission[mission.id] ?? '')?.bloque,
      status: missionComplete(mission, adventure, journey)
        ? 'completed'
        : index < caminoSequence.length &&
            (index === 0 || missionComplete(orderedMissions[index - 1], adventure, journey))
          ? 'available'
          : 'locked',
      actionEnabled: true,
    })),
    {
      id: 'city',
      title: 'La llave de la ciudad',
      subtitle: canAccessCity(adventure) ? 'Entrar a la ciudad' : 'Destino al completar el camino',
      x: 950,
      y: 480,
      icon: KeyRound,
      zone: 'camino',
      status: canAccessCity(adventure) ? 'available' : 'locked',
      actionEnabled: true,
    },
  ]
}

export function getCiudadPoints(adventure: AdventureState, journey: JourneyState): StudentMapPoint[] {
  const testCompleted = journey.progress['act-tip-01']?.estado === 'completada'
  return [
    ...cityCases.map((item): StudentMapPoint => ({
      id: item.id,
      title: item.title,
      x: item.x,
      y: item.y,
      zone: 'ciudad',
      subtitle: adventure.solvedCaseIds.includes(item.id)
        ? 'La comunidad te agradece'
        : 'Un llamado de auxilio',
      icon: Building2,
      status: adventure.solvedCaseIds.includes(item.id)
        ? 'completed'
        : item.id === 'forest-fire'
          ? 'available'
          : 'locked',
      actionEnabled: item.id === 'forest-fire',
    })),
    {
      id: 'mara-test',
      title: 'Una vuelta por el molino',
      subtitle: testCompleted ? 'Test · Primera interacción completada' : 'Test · Interacción 1 de 14',
      x: 875,
      y: 530,
      icon: ClipboardList,
      status: testCompleted ? 'completed' : 'available',
      zone: 'ciudad',
      specActivityId: 'act-tip-01',
      actionEnabled: true,
    },
  ]
}

export function getZoneProgress(zone: StudentZone, adventure: AdventureState, journey: JourneyState) {
  return zone === 'missions'
    ? {
        label: 'Nivel de recorrido',
        value:
          (fieldMissions.filter((mission) => missionComplete(mission, adventure, journey)).length /
            fieldMissions.length) *
          100,
      }
    : {
        label: 'Afinidad con la ciudad',
        value: Math.round(
          (cityCases.filter((item) => adventure.solvedCaseIds.includes(item.id)).length / cityCases.length) *
            100,
        ),
      }
}

export function getRecommendedPoint(points: StudentMapPoint[]) {
  if (points[0]?.zone === 'camino')
    return (
      points.find((point) => point.id !== 'city' && point.status === 'available') ??
      points.find((point) => point.id === 'city' && point.status === 'available')
    )
  return points.find((point) => point.status === 'available' && point.actionEnabled)
}

export function getReturnGreeting(adventure: AdventureState, point?: StudentMapPoint, now = new Date()) {
  if (!point) return undefined
  const today = lumiDayKey(now)
  const previous = adventure.visits
    .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day) && day < today)
    .sort()
    .at(-1)
  if (!previous || (Date.parse(today) - Date.parse(previous)) / 86400000 < 3) return undefined
  return `¡Qué bueno verte de nuevo! Te espera ${point.title}.${!canAccessCity(adventure) ? ' La ciudad sigue esperándote al final del camino.' : ''}`
}

export type PointDetails = {
  title: string
  region: string
  badge: string
  meta: string
  type: string
  description: string
  requirement?: string
  actionLabel: string
  disabled: boolean
  activityId?: string
  revision?: boolean
  href?: string
  imageUrl?: string
  journal?: { completed: boolean; activityId: string; title: string; prompt: string }
}

export function getPointDetails(
  point: StudentMapPoint,
  adventure: AdventureState,
  journey: JourneyState,
): PointDetails {
  const mission = fieldMissions.find((item) => item.id === point.id)
  const activity = activityById(point.specActivityId ?? '')
  const inProgress = journey.progress[point.specActivityId ?? '']?.estado === 'en_curso'
  const badge =
    point.status === 'locked'
      ? 'Bloqueada'
      : point.status === 'completed'
        ? 'Completada'
        : inProgress
          ? 'En progreso'
          : 'Disponible'
  const journal = (title: string) => ({
    completed: point.status === 'completed',
    activityId: point.specActivityId ?? point.id,
    title,
    prompt:
      activity?.promptDiario ??
      getActivityPrompt(point.specActivityId ?? point.id, adventure.readinessCheckIns),
  })
  if (mission) {
    const index = orderedMissions.findIndex((item) => item.id === mission.id)
    const previous = index > 0 && index < caminoSequence.length ? orderedMissions[index - 1] : undefined
    return {
      title: point.title,
      region: mission.region,
      badge,
      meta: getMissionMeta(mission),
      type: getActivityType(mission),
      description: mission.description,
      requirement:
        point.status === 'locked'
          ? previous
            ? `Requisito: completa la actividad “${previous.title}”.`
            : 'Esta actividad aún no está disponible.'
          : undefined,
      actionLabel:
        point.status === 'locked'
          ? 'Actividad bloqueada'
          : point.status === 'completed'
            ? getActivityType(mission) === 'Informativa'
              ? 'Volver a realizar esta misión'
              : 'Ver o modificar mis respuestas'
            : inProgress
              ? 'Continuar actividad'
              : 'Iniciar actividad',
      disabled: point.status === 'locked',
      activityId: point.specActivityId,
      revision: point.status === 'completed',
      journal: journal(point.title),
    }
  }
  if (point.id === 'city')
    return {
      title: point.title,
      region: 'Meta del recorrido',
      badge,
      meta: 'Ciudad',
      type: 'Ciudad',
      description:
        'Cambia a la ciudad para atender sus llamados, investigar carreras y encontrarte con nuevas actividades.',
      actionLabel: 'Ir a la ciudad',
      disabled: false,
      href: appPaths.student.exploration,
    }
  if (point.id === 'mara-test')
    return {
      title: point.title,
      region: 'Molino de la ciudad',
      badge,
      meta: 'Interacción 1 de 14 · 4 min',
      type: 'Test',
      description:
        'Conversa con Mara y responde siete preguntas del Test de Intereses Profesionales. No hay respuestas correctas o incorrectas.',
      actionLabel: point.status === 'completed' ? 'Ver resumen' : 'Iniciar test',
      disabled: false,
      activityId: 'act-tip-01',
      revision: false,
      journal: journal(activity?.titulo ?? point.title),
    }
  const cityCase = cityCases.find((item) => item.id === point.id)
  return {
    title: point.title,
    region: 'Llamado de la ciudad',
    badge,
    meta: 'Caso vocacional',
    type: 'Central de casos',
    description: cityCase?.description ?? '',
    imageUrl: getExplorationImagePath(
      point.id === 'forest-fire' ? 'forest-fire-case-background.png' : 'exploration-case-background.png',
    ),
    actionLabel: 'Iniciar',
    disabled: !point.actionEnabled,
    href: appPaths.student.case(point.id),
  }
}
