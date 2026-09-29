import { useSyncExternalStore } from 'react'
import { initialJourney, type JourneyState } from './logic'

const key = 'ov.missions.v2'
function read(): JourneyState {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? 'null')
    const empty = initialJourney()
    if (value?.version !== 2) return empty
    for (const name of Object.keys(empty)) {
      if (Array.isArray(empty[name as keyof JourneyState]) && !Array.isArray(value[name])) return empty
    }
    if (
      !value.progress ||
      !value.drafts ||
      typeof value.progress !== 'object' ||
      typeof value.drafts !== 'object'
    )
      return empty
    return { ...empty, ...value }
  } catch {
    return initialJourney()
  }
}
let state = read()
let storageError = ''
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function updateJourney(update: (current: JourneyState) => JourneyState) {
  const next = update(state)
  try {
    localStorage.setItem(key, JSON.stringify(next))
    state = next
    storageError = ''
  } catch {
    storageError = 'No se pudo guardar. Libera espacio o permite el almacenamiento y vuelve a intentarlo.'
  }
  listeners.forEach((listener) => listener())
  return !storageError
}
export const useJourney = () => useSyncExternalStore(subscribe, () => state)
export const useJourneyError = () => useSyncExternalStore(subscribe, () => storageError)
window.addEventListener('storage', (event: StorageEvent) => {
  if (event.key === key || event.key === null) {
    state = read()
    listeners.forEach((listener) => listener())
  }
})

async function fileDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('ov.mission-files', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('No se pudo abrir el almacenamiento de archivos.'))
  })
}
export async function saveFiles(files: File[], ids: string[]) {
  const db = await fileDatabase()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('files', 'readwrite')
      files.forEach((file, i) => transaction.objectStore('files').put(file, ids[i]))
      transaction.oncomplete = () => resolve()
      transaction.onerror = transaction.onabort = () =>
        reject(new Error('No se pudo guardar el archivo. Revisa el espacio disponible.'))
    })
  } finally {
    db.close()
  }
}
export async function downloadFile(id: string, name: string) {
  const db = await fileDatabase()
  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const request = db.transaction('files').objectStore('files').get(id)
      request.onsuccess = () =>
        request.result
          ? resolve(request.result)
          : reject(new Error('Este archivo ya no está en este navegador.'))
      request.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = name
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } finally {
    db.close()
  }
}
