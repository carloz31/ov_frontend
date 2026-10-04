import { useSyncExternalStore } from 'react'
import { studentViews, type StudentView } from './views'

export type StudentUiState = {
  version: 1
  panelCollapsed: boolean
  lastMap: 'missions' | 'central'
  soundOn: boolean
  introsSeen: Partial<Record<StudentView, true>>
  cityArrivalSeen: boolean
  checkInPromptDismissedOn?: string
  seenUnlockIds: string[]
  announcedBadgeCodes: string[]
  initialized: boolean
}

const storageKey = 'ov.student-ui.v1'

export function initialStudentUiState(): StudentUiState {
  return {
    version: 1,
    panelCollapsed: false,
    lastMap: 'missions',
    soundOn: true,
    introsSeen: {},
    cityArrivalSeen: false,
    seenUnlockIds: [],
    announcedBadgeCodes: [],
    initialized: false,
  }
}

function parseState(raw: string | null): StudentUiState {
  const fallback = initialStudentUiState()
  if (!raw) return fallback
  try {
    const value = JSON.parse(raw)
    if (!value || value.version !== 1) return fallback
    const stringList = (items: unknown): string[] =>
      Array.isArray(items)
        ? [...new Set(items.filter((item): item is string => typeof item === 'string'))]
        : []
    return {
      version: 1,
      panelCollapsed: typeof value.panelCollapsed === 'boolean' ? value.panelCollapsed : false,
      lastMap: value.lastMap === 'central' ? 'central' : 'missions',
      soundOn: typeof value.soundOn === 'boolean' ? value.soundOn : true,
      introsSeen: Object.fromEntries(
        studentViews.filter((view) => value.introsSeen?.[view] === true).map((view) => [view, true]),
      ),
      cityArrivalSeen: value.cityArrivalSeen === true,
      checkInPromptDismissedOn:
        typeof value.checkInPromptDismissedOn === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.checkInPromptDismissedOn)
          ? value.checkInPromptDismissedOn
          : undefined,
      seenUnlockIds: stringList(value.seenUnlockIds),
      announcedBadgeCodes: stringList(value.announcedBadgeCodes),
      initialized: value.initialized === true,
    }
  } catch {
    return fallback
  }
}

function readState(): StudentUiState {
  try {
    return parseState(localStorage.getItem(storageKey))
  } catch {
    return initialStudentUiState()
  }
}

let state = readState()
const listeners = new Set<() => void>()
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
function notify() {
  listeners.forEach((listener) => listener())
}

export function updateStudentUi(update: (current: StudentUiState) => StudentUiState) {
  const next = update(state)
  if (next === state) return
  state = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // Presentation preferences remain usable in memory when storage is unavailable.
  }
  notify()
}

export const useStudentUi = () => useSyncExternalStore(subscribe, () => state)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== storageKey && event.key !== null) return
    state = readState()
    notify()
  })
}
