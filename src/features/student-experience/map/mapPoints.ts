import type { JourneyState } from '@/features/missions/logic'
import { modoApi } from '@/features/servidor/config'
import { obtenerEstadoServidor } from '@/features/servidor/estadoServidor'
import {
  actividadServidor,
  ciudadDisponible,
  estadoPunto,
  interaccionMara,
  progresoCamino,
} from '@/features/servidor/adaptadores'
import { activityById } from '@/features/missions/content'
import { BookOpen, Building2, ClipboardList, Feather, KeyRound, Swords, type LucideIcon } from 'lucide-react'
import { getForestFireCaseStatus } from '@/features/occupation-exploration/lib/ForestFireCaseLogic'
import { challenges } from '../challenges/data'
import { canStartChallenge, challengeRequirements } from '../challenges/logic'
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
import { additionalMissions, baseRoute, pendingContent } from '../reflection/config'
import { getReflections } from '../reflection/store'
import { isWithinStudentDemo } from '@/features/occupation-exploration/lib/StudentDemoScope'

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
  additional?: boolean
  originId?: string
  revealing?: boolean
  revealQueued?: boolean
}

export type StudentZone = 'missions' | 'central'

export const specActivityByMission: Partial<Record<FieldMission['id'], string>> =
  Object.fromEntries(baseRoute)

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
  if (mission.id === 'pregones') return '10 min'
  if (mission.kind === 'information') return '4 min'
  if (mission.kind === 'reflection') return 'A tu ritmo'
  if (mission.kind === 'deliverable') return '5 min'
  return '6 min'
}
export function getMissionIcon(mission: FieldMission): LucideIcon {
  const type = getActivityType(mission)
  return type === 'Informativa' ? BookOpen : type === 'Test' ? ClipboardList : Feather
}

export const caminoSequence = baseRoute.map(([id]) => id)

const orderedMissions = [
  ...caminoSequence.map((id) => fieldMissions.find((mission) => mission.id === id)!),
  ...fieldMissions.filter((mission) => !caminoSequence.some((id) => id === mission.id)),
]

export function getNextCaminoActivity(points: StudentMapPoint[]) {
  const next = points.find(
    (point) => !point.additional && point.id !== 'city' && point.status === 'available',
  )
  return activityById(next?.specActivityId ?? '') ?? null
}

export function getCaminoPoints(adventure: AdventureState, journey: JourneyState): StudentMapPoint[] {
  if (modoApi) {
    const estado = obtenerEstadoServidor().estado
    return [
      ...orderedMissions
        .filter((m) => specActivityByMission[m.id])
        .map((mission): StudentMapPoint => ({
          id: mission.id,
          title: mission.title,
          x: mission.x,
          y: mission.y,
          subtitle: `${getActivityType(mission)} · ${getMissionMeta(mission)}`,
          icon: getMissionIcon(mission),
          zone: 'camino',
          bloque: 1,
          specActivityId: specActivityByMission[mission.id],
          status: estadoPunto(actividadServidor(estado, specActivityByMission[mission.id]!)),
          actionEnabled: true,
        })),
      {
        id: 'city',
        title: 'La llave de la ciudad',
        subtitle: ciudadDisponible(estado) ? 'Entrar a la ciudad' : 'Destino al completar el camino',
        x: 950,
        y: 480,
        icon: KeyRound,
        zone: 'camino',
        status: ciudadDisponible(estado) ? 'available' : 'locked',
        actionEnabled: true,
      },
    ]
  }
  return [
    ...orderedMissions.map((mission, index): StudentMapPoint => ({
      id: mission.id,
      title: mission.title,
      x: mission.x,
      y: mission.y,
      subtitle: !isWithinStudentDemo(specActivityByMission[mission.id] ?? '')
        ? 'No disponible'
        : pendingContent.has(specActivityByMission[mission.id] ?? '') &&
            !missionComplete(mission, adventure, journey)
          ? 'Contenido pendiente'
          : `${getActivityType(mission)} · ${getMissionMeta(mission)}`,
      icon: getMissionIcon(mission),
      zone: 'camino',
      specActivityId: specActivityByMission[mission.id],
      bloque: activityById(specActivityByMission[mission.id] ?? '')?.bloque,
      status: !isWithinStudentDemo(specActivityByMission[mission.id] ?? '')
        ? 'locked'
        : missionComplete(mission, adventure, journey)
          ? 'completed'
          : !pendingContent.has(specActivityByMission[mission.id] ?? '') &&
              (index === 0 || missionComplete(orderedMissions[index - 1], adventure, journey))
            ? 'available'
            : 'locked',
      actionEnabled: true,
    })),
    ...additionalMissions
      .filter(
        (m) => isWithinStudentDemo(m.id) && getReflections().desbloqueos.some((d) => d.actividadId === m.id),
      )
      .map((m): StudentMapPoint => ({
        id: m.id,
        title: m.titulo,
        subtitle: 'Registro · Misión adicional',
        ...m.posicionMapa,
        icon: Feather,
        zone: 'camino',
        specActivityId: m.id,
        bloque: 1,
        status: journey.progress[m.id]?.estado === 'completada' ? 'completed' : 'available',
        actionEnabled: true,
        additional: true,
        originId: m.puntoOrigen,
        revealing: !getReflections().desbloqueos.find((d) => d.actividadId === m.id)?.visto,
        revealQueued:
          !getReflections().desbloqueos.find((d) => d.actividadId === m.id)?.visto &&
          getReflections().desbloqueos.find((d) => !d.visto && isWithinStudentDemo(d.actividadId))
            ?.actividadId !== m.id,
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
  if (modoApi) {
    const mara = interaccionMara(obtenerEstadoServidor().estado)
    return [
      ...cityCases.map((c): StudentMapPoint => ({
        id: c.id,
        title: c.title,
        x: c.x,
        y: c.y,
        zone: 'ciudad',
        subtitle: 'Disponible en una próxima iteración',
        icon: Building2,
        status: 'locked',
        actionEnabled: false,
      })),
      {
        id: 'mara-test',
        title: mara.actividad?.titulo ?? 'Una vuelta por el molino',
        subtitle: `Test · Interacción ${mara.numero} de 14`,
        x: 875,
        y: 530,
        zone: 'ciudad',
        icon: ClipboardList,
        specActivityId: mara.actividad?.codigo,
        status: estadoPunto(mara.actividad),
        actionEnabled: true,
      },
      {
        id: 'elena-result',
        title: 'Las pistas que hablan de ti',
        subtitle: 'Encuentro con Elena',
        x: 1030,
        y: 610,
        zone: 'ciudad',
        icon: BookOpen,
        specActivityId: 'act-tip-final',
        status: estadoPunto(actividadServidor(obtenerEstadoServidor().estado, 'act-tip-final')),
        actionEnabled:
          estadoPunto(actividadServidor(obtenerEstadoServidor().estado, 'act-tip-final')) !== 'locked',
      },
      ...challenges.map((c, i): StudentMapPoint => ({
        id: c.id,
        title: c.titulo,
        subtitle: 'Disponible en una próxima iteración',
        x: 710 + i * 90,
        y: 365,
        zone: 'ciudad',
        icon: Swords,
        status: 'locked',
        actionEnabled: false,
      })),
    ]
  }
  const testCompleted = journey.progress['act-tip-01']?.estado === 'completada'
  const points: StudentMapPoint[] = [
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
    ...challenges.map((c, i): StudentMapPoint => ({
      id: c.id,
      title: c.titulo,
      subtitle: `Desafío · ${c.nombre}`,
      x: 710 + i * 90,
      y: 365,
      zone: 'ciudad',
      icon: Swords,
      specActivityId: c.id,
      bloque: c.bloque,
      status:
        journey.progress[c.id]?.estado === 'completada'
          ? 'completed'
          : canStartChallenge(c, journey)
            ? 'available'
            : 'locked',
      actionEnabled: true,
    })),
  ]
  return points
}

export function getZoneProgress(zone: StudentZone, adventure: AdventureState, journey: JourneyState) {
  if (modoApi) {
    const estado = obtenerEstadoServidor().estado
    const ciudad = estado?.bloques.find((b) => b.codigo === 'CIUDAD')?.actividades ?? []
    return zone === 'missions'
      ? { label: 'Nivel de recorrido', value: progresoCamino(estado).porcentaje }
      : {
          label: 'Recorrido por la ciudad',
          value: ciudad.length
            ? (ciudad.filter((a) => a.estado === 'COMPLETADA').length / ciudad.length) * 100
            : 0,
        }
  }
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
      points.find((point) => !point.additional && point.id !== 'city' && point.status === 'available') ??
      points.find((point) => point.id === 'city' && point.status === 'available')
    )
  return points.find(
    (point) => point.status === 'available' && (point.actionEnabled || (modoApi && point.id === 'mara-test')),
  )
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
  reviewActivities?: { codigo: string; titulo: string }[]
  caseProgress?: boolean
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
  if (modoApi) {
    const actividad = actividadServidor(obtenerEstadoServidor().estado, point.specActivityId ?? '')
    const enCurso = actividad?.estado === 'EN_CURSO'
    const badge =
      point.status === 'completed'
        ? 'Completada'
        : point.status === 'locked'
          ? 'Bloqueada'
          : enCurso
            ? 'En progreso'
            : 'Disponible'
    const mission = fieldMissions.find((m) => m.id === point.id)
    if (mission)
      return {
        title: point.title,
        region: mission.region,
        badge,
        meta: getMissionMeta(mission),
        type: getActivityType(mission),
        description: mission.description,
        requirement: point.status === 'locked' ? 'Consultando el requisito en el servidor…' : undefined,
        actionLabel:
          point.status === 'locked'
            ? 'Actividad bloqueada'
            : point.status === 'completed'
              ? getActivityType(mission) === 'Informativa'
                ? 'Volver a realizar esta misión'
                : 'Ver o modificar mis respuestas'
              : enCurso
                ? 'Continuar actividad'
                : 'Iniciar actividad',
        disabled: point.status === 'locked',
        activityId: point.specActivityId,
        revision: point.status === 'completed',
      }
    if (point.id === 'city')
      return {
        title: point.title,
        region: 'Meta del recorrido',
        badge,
        meta: 'Ciudad',
        type: 'Ciudad',
        description: 'La ciudad te espera al final del camino.',
        requirement: point.status === 'locked' ? 'Consultando el requisito en el servidor…' : undefined,
        actionLabel: 'Ir a la ciudad',
        disabled: point.status === 'locked',
        href: appPaths.student.exploration,
      }
    if (point.id === 'mara-test') {
      const mara = interaccionMara(obtenerEstadoServidor().estado)
      return {
        title: point.title,
        region: 'Molino de la ciudad',
        badge,
        meta: `Interacción ${mara.numero} de 14`,
        type: 'Test',
        description: 'Conversa con Mara. No hay respuestas correctas o incorrectas.',
        requirement: point.status === 'locked' ? 'Consultando el requisito en el servidor…' : undefined,
        actionLabel:
          point.status === 'locked'
            ? 'Encuentro bloqueado'
            : point.status === 'completed'
              ? 'Revisar encuentro'
              : 'Conversar con Mara',
        disabled: point.status === 'locked',
        activityId: mara.actividad?.codigo,
        revision: point.status === 'completed',
        reviewActivities: obtenerEstadoServidor()
          .estado?.bloques.flatMap((b) => b.actividades)
          .filter((a) => /^act-tip-\d{2}$/.test(a.codigo) && a.estado === 'COMPLETADA')
          .map((a) => ({
            codigo: a.codigo,
            titulo: `Interacción ${Number(a.codigo.slice(-2))} · ${a.titulo}`,
          })),
      }
    }
    if (point.id === 'elena-result')
      return {
        title: point.title,
        region: 'Río de la ciudad',
        badge,
        meta: 'Tus intereses',
        type: 'Resultado',
        description: 'Elena reúne las pistas de tus encuentros con Mara.',
        requirement: point.status === 'locked' ? 'Completa los 14 encuentros con Mara.' : undefined,
        actionLabel: point.status === 'completed' ? 'Revisar resultado' : 'Conversar con Elena',
        disabled: point.status === 'locked',
        activityId: 'act-tip-final',
        revision: point.status === 'completed',
      }
    return {
      title: point.title,
      region: 'Ciudad',
      badge: 'Bloqueada',
      meta: 'Próximamente',
      type: challenges.some((c) => c.id === point.id) ? 'Desafío' : 'Central de casos',
      description: 'Disponible en una próxima iteración',
      requirement: 'Disponible en una próxima iteración',
      actionLabel: 'No disponible',
      disabled: true,
    }
  }
  const challenge = challenges.find((c) => c.id === point.id)
  const extra = additionalMissions.find((m) => m.id === point.id)
  if (extra)
    return {
      title: point.title,
      region: 'Un sendero del Camino',
      badge: point.status === 'completed' ? 'Completada · Adicional' : 'MISIÓN ADICIONAL · OPCIONAL',
      meta: `${activityById(extra.id)?.duracionEstimadaMin ?? 4} min`,
      type: 'Registro opcional',
      description: extra.descripcion,
      actionLabel: point.status === 'completed' ? 'Ver o modificar mis respuestas' : 'Emprender',
      disabled: false,
      activityId: extra.id,
      revision: point.status === 'completed',
    }
  if (challenge)
    return {
      title: point.title,
      region: challenge.ubicacion ?? 'Ciudad',
      badge:
        point.status === 'completed' ? 'Completada' : point.status === 'locked' ? 'Bloqueada' : 'Disponible',
      meta: 'A tu ritmo',
      type: 'Desafío',
      description: challenge.presentacionEnemigo,
      requirement: challengeRequirements(challenge, journey)
        .map((r) => `${r.completed ? '✓' : 'Pendiente:'} ${r.titulo}`)
        .join(' · '),
      actionLabel: point.status === 'completed' ? 'Practicar de nuevo' : 'Enfrentar al enemigo',
      disabled: point.status === 'locked',
      activityId: challenge.id,
      imageUrl: challenge.ilustracion,
    }
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
    const previous = index > 0 ? orderedMissions[index - 1] : undefined
    const outsideScope = !isWithinStudentDemo(point.specActivityId ?? '')
    const pending = pendingContent.has(point.specActivityId ?? '') && point.status !== 'completed'
    return {
      title: point.title,
      region: mission.region,
      badge: pending ? 'Contenido pendiente' : badge,
      meta: getMissionMeta(mission),
      type: getActivityType(mission),
      description: mission.description,
      requirement:
        point.status === 'locked'
          ? outsideScope
            ? 'Esta actividad aún no está disponible.'
            : pending
              ? 'Contenido pendiente de preparación.'
              : previous
                ? `Requisito: completa la actividad “${previous.title}”.`
                : 'Esta actividad aún no está disponible.'
          : undefined,
      actionLabel:
        point.status === 'locked'
          ? pending
            ? 'Contenido pendiente'
            : 'Actividad bloqueada'
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
    badge: point.id === 'forest-fire' ? getForestFireCaseStatus(adventure).badge : badge,
    meta: 'Caso vocacional',
    type: 'Central de casos',
    caseProgress: point.id === 'forest-fire',
    description: cityCase?.description ?? '',
    imageUrl: getExplorationImagePath(
      point.id === 'forest-fire' ? 'forest-fire-case-background.png' : 'exploration-case-background.png',
    ),
    actionLabel: point.id === 'forest-fire' ? getForestFireCaseStatus(adventure).actionLabel : 'Iniciar',
    disabled: !point.actionEnabled,
    href: appPaths.student.case(point.id),
  }
}
