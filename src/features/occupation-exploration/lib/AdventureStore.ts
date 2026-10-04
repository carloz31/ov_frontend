import { useSyncExternalStore } from 'react'
import { cityCases, fieldMissions } from '../data/AdventureData'
import { journalDemoEntries, readinessDemoCheckIns } from '../data/JournalData'
import type { AdventureState } from '../types/AdventureTypes'
import { normalizeLumiRegistrations, trackLumiEntries } from './LumiFriendship'

const storageKey = 'ov.student-adventure.v1'
// Temporary prototype review mode: every section is reachable while progress remains truthful.
export const prototypeAllUnlocked = true
export function createInitialAdventure(): AdventureState {
  return {
    version: 1,
    completedMissionIds: [],
    parentCompletedActivityIds: [],
    bookmarks: ['first-steps', 'career-route-forum'],
    journal: journalDemoEntries.map((entry) => ({ ...entry, topicTags: [...entry.topicTags] })),
    lumiRegistrations: [],
    readinessCheckIns: readinessDemoCheckIns.map((checkIn) => ({ ...checkIn })),
    readinessScale: 10,
    journalOnboardingSeen: false,
    activityResponses: {},
    activityUploads: {},
    reflectionDrafts: {},
    missionProgress: {},
    questionnaire: { block: 0, answers: {}, openAnswers: {}, review: {} },
    crewInvitations: [],
    reports: [],
    solvedCaseIds: [],
    research: { step: 0, careerId: '', invitees: [], answers: ['', '', ''], videoUrl: '', reflection: '' },
    videos: [],
    reactions: [],
    interviewModeration: {},
    notices: [],
    conversations: [],
    familyGift: {},
    visits: [],
    eventAttendance: {},
  }
}
function readState(): AdventureState {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || 'null')
    if (parsed?.version !== 1) return createInitialAdventure()
    const initial = createInitialAdventure()
    for (const key of Object.keys(initial) as (keyof AdventureState)[]) {
      if (key === 'lumiRegistrations') continue
      if (Array.isArray(initial[key]) && parsed[key] !== undefined && !Array.isArray(parsed[key]))
        return initial
    }
    if (
      parsed.questionnaire &&
      (!Number.isInteger(parsed.questionnaire.block) ||
        parsed.questionnaire.block < 0 ||
        parsed.questionnaire.block > 1)
    )
      return initial
    if (
      parsed.research &&
      (!Number.isInteger(parsed.research.step) ||
        parsed.research.step < 0 ||
        parsed.research.step > 3 ||
        !Array.isArray(parsed.research.answers))
    )
      return initial
    const journalById = new Map(initial.journal.map((entry) => [entry.id, entry]))
    ;(parsed.journal ?? []).forEach((entry: AdventureState['journal'][number]) =>
      journalById.set(entry.id, {
        ...entry,
        topicTags: Array.isArray(entry.topicTags) ? entry.topicTags : [],
      }),
    )
    const checkInsById = new Map(initial.readinessCheckIns.map((checkIn) => [checkIn.id, checkIn]))
    ;(parsed.readinessCheckIns ?? []).forEach((checkIn: AdventureState['readinessCheckIns'][number]) =>
      checkInsById.set(checkIn.id, {
        ...checkIn,
        value: (parsed.readinessScale === 10
          ? checkIn.value
          : Math.min(10, checkIn.value * 2)) as AdventureState['readinessCheckIns'][number]['value'],
      }),
    )
    return {
      ...initial,
      ...parsed,
      journal: [...journalById.values()],
      lumiRegistrations: normalizeLumiRegistrations(
        (Array.isArray(parsed.lumiRegistrations) ? parsed.lumiRegistrations : undefined) ??
          [...journalById.values()]
            .filter((entry) => !entry.id.startsWith('demo-'))
            .map((entry) => ({ entryId: entry.id, createdAt: entry.createdAt })),
      ),
      readinessCheckIns: [...checkInsById.values()],
      readinessScale: 10,
      interviewModeration: parsed.interviewModeration && typeof parsed.interviewModeration === 'object' && !Array.isArray(parsed.interviewModeration) ? parsed.interviewModeration : {},
      questionnaire: { ...initial.questionnaire, ...parsed.questionnaire },
      research: { ...initial.research, ...parsed.research },
    }
  } catch {
    return createInitialAdventure()
  }
}
let state = readState()
let storageError = false
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) {
    state = readState()
    listeners.forEach((listener) => listener())
  }
})
export function updateAdventure(update: (current: AdventureState) => AdventureState) {
  const next = update(state)
  state = {
    ...next,
    lumiRegistrations: trackLumiEntries(state.lumiRegistrations, state.journal, next.journal),
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
    storageError = false
  } catch {
    storageError = true
  }
  listeners.forEach((listener) => listener())
}
export function useAdventure() {
  return useSyncExternalStore(subscribe, () => state)
}
export function useAdventureStorageError() {
  return useSyncExternalStore(subscribe, () => storageError)
}
export function isCityUnlocked(value: AdventureState) {
  return fieldMissions.every((mission) => value.completedMissionIds.includes(mission.id))
}
export function isFamilyUnlocked(value: AdventureState) {
  return isCityUnlocked(value)
}
export function canAccessCity(value: AdventureState) {
  return prototypeAllUnlocked || isCityUnlocked(value)
}
export function canAccessFamilyConversations(value: AdventureState) {
  return prototypeAllUnlocked || isFamilyUnlocked(value)
}
export function getTravelerLevel(value: AdventureState) {
  const levels = [
    {
      number: 1,
      label: 'Observador del horizonte',
      description:
        'Estás aprendiendo a mirar tus intereses y preguntas como pistas, sin apresurarte a elegir un destino.',
      nextStep: 'Completa tres Misiones de Campo para reunir tus primeras pistas.',
    },
    {
      number: 2,
      label: 'Recolector de pistas',
      description:
        'Ya reconoces señales sobre lo que disfrutas, lo que haces bien y los retos que despiertan tu curiosidad.',
      nextStep: 'Completa las Misiones de Campo para abrir la ciudad de posibilidades.',
    },
    {
      number: 3,
      label: 'Cartógrafo de posibilidades',
      description:
        'Tu mapa personal empieza a tomar forma. Ahora puedes contrastarlo con profesiones y situaciones del mundo real.',
      nextStep: 'Resuelve un caso o investiga una profesión para poner a prueba tus ideas.',
    },
    {
      number: 4,
      label: 'Explorador de la ciudad',
      description:
        'Estás probando tus habilidades en escenarios concretos y reemplazando suposiciones por experiencias.',
      nextStep:
        'Completa los casos, una investigación y una conversación familiar para integrar tus hallazgos.',
    },
    {
      number: 5,
      label: 'Autor de su rumbo',
      description:
        'Has reunido autoconocimiento, experiencias y otras miradas. Tu rumbo puede cambiar, pero ahora sabes cómo volver a construirlo.',
      nextStep: 'Sigue revisando tu pasaporte: cada nueva experiencia puede enriquecer tu decisión.',
    },
  ] as const
  const allCasesSolved = cityCases.every((item) => value.solvedCaseIds.includes(item.id))
  const hasCompletedConversation = value.conversations.some((item) => item.completedAt)
  const hasPublishedResearch = value.videos.length > 0
  const completedFieldMissions = value.completedMissionIds.filter((id) => id !== 'welcome').length

  if (allCasesSolved && hasPublishedResearch && hasCompletedConversation) return levels[4]
  if (value.solvedCaseIds.length > 0 || hasPublishedResearch) return levels[3]
  if (isCityUnlocked(value)) return levels[2]
  if (completedFieldMissions >= 3) return levels[1]
  return levels[0]
}
export function completeMission(id: string) {
  updateAdventure((current) => {
    const index = fieldMissions.findIndex((mission) => mission.id === id)
    if (
      index < 0 ||
      (!prototypeAllUnlocked &&
        fieldMissions.slice(0, index).some((mission) => !current.completedMissionIds.includes(mission.id)))
    )
      return current
    return { ...current, completedMissionIds: [...new Set([...current.completedMissionIds, id])] }
  })
}
export function completeCase(id: string) {
  updateAdventure((current) =>
    canAccessCity(current) && cityCases.some((item) => item.id === id)
      ? { ...current, solvedCaseIds: [...new Set([...current.solvedCaseIds, id])] }
      : current,
  )
}
export function currentWeek(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function safeVideoUrl(raw: string) {
  try {
    const url = new URL(raw)
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
