import { useMemo, useSyncExternalStore } from 'react'
import { configuredCatalog, prioritySettingsStore } from './PrioritySettings'

export function usePrioritySettings() {
  return useSyncExternalStore(
    prioritySettingsStore.subscribe,
    prioritySettingsStore.getSnapshot,
    prioritySettingsStore.getSnapshot,
  )
}
export function usePriorityCatalog() {
  const settings = usePrioritySettings()
  return useMemo(() => configuredCatalog(settings), [settings])
}
