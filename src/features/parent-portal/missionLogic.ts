import {
  applyCompletion,
  evaluateQuestion,
  isActivityComplete,
  type JourneyState,
} from '@/features/missions/logic'
import type { Actividad, NodoPregunta } from '@/features/missions/model'

export function parentActivityAvailable(activity: Actividad, state: JourneyState) {
  return (
    activity.audiencia === 'apoderado' &&
    activity.requisitos.every((id) => state.progress[id]?.estado === 'completada')
  )
}
export function completedParentActivities(activities: Actividad[], state: JourneyState) {
  return activities
    .filter(
      (activity) =>
        state.progress[activity.id]?.estado === 'completada' && isActivityComplete(activity, state),
    )
    .map((activity) => activity.id)
}
export function startParentActivity(
  activity: Actividad,
  state: JourneyState,
  accountId: string,
): JourneyState {
  if (!parentActivityAvailable(activity, state) || state.progress[activity.id]) return state
  return {
    ...state,
    progress: {
      ...state.progress,
      [activity.id]: {
        estudianteId: accountId,
        actividadId: activity.id,
        estado: 'en_curso',
        iniciadaEn: new Date().toISOString(),
        nodoActualId: activity.nodos[0]?.id ?? '$fin',
      },
    },
  }
}
export function answerParentQuestion(
  activity: Actividad,
  node: NodoPregunta,
  selected: string[],
  state: JourneyState,
  accountId: string,
): JourneyState {
  if (
    !parentActivityAvailable(activity, state) ||
    !selected.length ||
    new Set(selected).size !== selected.length ||
    selected.some((id) => !node.opciones.some((option) => option.id === id)) ||
    (node.formato !== 'opcion_multiple' && selected.length !== 1)
  )
    return state
  const prior = state.attempts.filter(
    (attempt) => attempt.actividadId === activity.id && attempt.nodoId === node.id,
  )
  const result = evaluateQuestion(node, selected, prior.filter((attempt) => !attempt.correcta).length)
  return {
    ...state,
    attempts: [
      ...state.attempts,
      {
        estudianteId: accountId,
        actividadId: activity.id,
        nodoId: node.id,
        opcionIds: selected,
        correcta: result.correct,
        revelada: result.revealed,
        numeroIntento: prior.length + 1,
        respondidaEn: new Date().toISOString(),
      },
    ],
  }
}
export function retreatParentActivity(
  activity: Actividad,
  nodeId: string,
  state: JourneyState,
): JourneyState {
  if (!parentActivityAvailable(activity, state)) return state
  const index =
    nodeId === '$fin' ? activity.nodos.length : activity.nodos.findIndex((node) => node.id === nodeId)
  const progress = state.progress[activity.id]
  if (index <= 0 || !progress || progress.estado === 'completada' || progress.nodoActualId !== nodeId)
    return state
  return {
    ...state,
    progress: {
      ...state.progress,
      [activity.id]: { ...progress, nodoActualId: activity.nodos[index - 1].id },
    },
  }
}

export function advanceParentActivity(
  activity: Actividad,
  nodeId: string,
  state: JourneyState,
  accountId: string,
  optionId?: string,
): JourneyState {
  if (!parentActivityAvailable(activity, state)) return state
  const index = activity.nodos.findIndex((node) => node.id === nodeId)
  const node = activity.nodos[index]
  if (!node) return state
  const completed = state.progress[activity.id]?.estado === 'completada'
  if (!completed && state.progress[activity.id]?.nodoActualId !== nodeId) return state
  if (
    node.tipo === 'pregunta' &&
    node.bloqueante &&
    !state.attempts.some(
      (attempt) =>
        attempt.actividadId === activity.id &&
        attempt.nodoId === node.id &&
        (attempt.correcta || attempt.revelada),
    )
  )
    return state
  const option = node.tipo === 'eleccion' ? node.opciones.find((option) => option.id === optionId) : undefined
  if (node.tipo === 'eleccion' && !option) return state
  const next = {
    ...state,
    choices:
      node.tipo === 'eleccion' && node.registrar && option
        ? [
            ...state.choices,
            {
              estudianteId: accountId,
              actividadId: activity.id,
              nodoId: node.id,
              opcionId: option.id,
              respondidaEn: new Date().toISOString(),
            },
          ]
        : state.choices,
    progress: completed
      ? state.progress
      : {
          ...state.progress,
          [activity.id]: {
            ...state.progress[activity.id],
            estudianteId: accountId,
            actividadId: activity.id,
            estado: 'en_curso' as const,
            nodoActualId: activity.nodos[index + 1]?.id ?? '$fin',
          },
        },
  }
  return applyCompletion(activity, next, accountId)
}
