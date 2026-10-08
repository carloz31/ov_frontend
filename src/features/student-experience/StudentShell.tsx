import { useEffect } from 'react'
import { modoApi } from '@/config/env'
import { ingresar } from '@/store/servidor/operaciones'
import { mensajeErrorServidor, refrescar, useEstadoServidor } from '@/store/servidor/estadoServidor'
import { Outlet, useLocation } from 'react-router'
import { useJourney } from '@/store/journeyStore'
import { useOccupationExplorationContext } from '@/context/occupationExplorationContext'
import {
  completeMission,
  useAdventure,
  useAdventureStorageError,
} from '@/store/adventureStore'
import { updateDiscovery } from '@/store/discoveryStore'
import { recordBadgeFirstSeenAt } from './profile/passport'
import { getMissionsToSync } from './map/mapPoints'
import { StudentModuleLayout } from './modules/StudentModuleLayout'
import { OverlayQueue } from './overlays/OverlayQueue'
import { seedStudentUnlocks } from './overlays/unlocks'
import { updateStudentUi } from '@/store/studentUiStore'
import { getStudentView } from '@/lib/studentViews'
import '@/styles/student/adventure.css'
import '@/styles/student/student-experience.css'
import '@/styles/student/reflection.css'

export function StudentShell() {
  const location = useLocation()
  const context = useOccupationExplorationContext()
  const adventure = useAdventure()
  const servidor = useEstadoServidor()
  const journey = useJourney()
  const { completedMissionIds } = adventure
  const { progress } = journey
  const storageError = useAdventureStorageError()
  const view = getStudentView(location.pathname)
  const isMap = view === 'missions' || view === 'central'
  const activityOpen = new URLSearchParams(location.search).has('actividad')

  useEffect(() => {
    if (modoApi) void ingresar()
  }, [])

  useEffect(() => {
    if (modoApi) return
    getMissionsToSync({ completedMissionIds }, { progress }).forEach((id) => completeMission(id))
  }, [progress, completedMissionIds])

  useEffect(() => {
    if (modoApi) return
    // Existing v2 completions belong to the initial seed, after their legacy synchronization.
    if (getMissionsToSync(adventure, journey).length) return
    updateStudentUi((current) => seedStudentUnlocks(current, adventure, journey))
  }, [adventure, journey])

  useEffect(() => {
    if (
      (view === 'missions' || view === 'central') &&
      new URLSearchParams(location.search).has('actividad')
    ) {
      updateStudentUi((current) => (current.lastMap === view ? current : { ...current, lastMap: view }))
    }
  }, [view, location.search])

  useEffect(() => {
    if (modoApi) return
    updateDiscovery((current) => recordBadgeFirstSeenAt(current, adventure, undefined, journey))
  }, [adventure, journey])

  const outlet = <Outlet context={context} />
  if (modoApi && !servidor.estado)
    return (
      <div className="sx-root sx-shell">
        <section className="sx-glass sx-player-card" aria-live="polite">
          <h1>Tu aventura</h1>
          {servidor.error ? (
            <>
              <p role="alert">{mensajeErrorServidor(servidor.error)}</p>
              <button
                className="sx-primary-button"
                type="button"
                disabled={servidor.cargando}
                onClick={() => void ingresar()}
              >
                Reintentar
              </button>
            </>
          ) : (
            <p role="status">Consultando tu camino en el servidor…</p>
          )}
        </section>
      </div>
    )
  return (
    <div className="sx-root sx-shell">
      {modoApi && servidor.error && (
        <p className="sx-storage-warning" role="alert">
          {mensajeErrorServidor(servidor.error)}{' '}
          <button type="button" disabled={servidor.cargando} onClick={() => void refrescar()}>
            Reintentar consulta
          </button>
        </p>
      )}
      {storageError && (
        <p role="alert" className="sx-storage-warning">
          No se pudo guardar el avance en este navegador. Evita cerrar la página hasta liberar espacio o
          permitir el almacenamiento.
        </p>
      )}
      <OverlayQueue view={view} activityOpen={activityOpen}>
        {isMap ? (
          outlet
        ) : (
          <StudentModuleLayout key={view} view={view}>
            {outlet}
          </StudentModuleLayout>
        )}
      </OverlayQueue>
    </div>
  )
}
