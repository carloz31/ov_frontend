import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useJourney } from '@/features/missions/store'
import { useOccupationExplorationContext } from '@/features/occupation-exploration/OccupationExplorationContext'
import {
  completeMission,
  useAdventure,
  useAdventureStorageError,
} from '@/features/occupation-exploration/lib/AdventureStore'
import { updateDiscovery } from './discovery/discoveryStore'
import { recordBadgeFirstSeenAt } from './profile/passport'
import { getMissionsToSync } from './map/mapPoints'
import { StudentModuleLayout } from './modules/StudentModuleLayout'
import { OverlayQueue } from './overlays/OverlayQueue'
import { seedStudentUnlocks } from './overlays/unlocks'
import { updateStudentUi } from './ui-state'
import { getStudentView } from './views'
import '@/features/occupation-exploration/adventure.css'
import './student-experience.css'
import './reflection/reflection.css'

export function StudentShell() {
  const location = useLocation()
  const context = useOccupationExplorationContext()
  const adventure = useAdventure()
  const journey = useJourney()
  const { completedMissionIds } = adventure
  const { progress } = journey
  const storageError = useAdventureStorageError()
  const view = getStudentView(location.pathname)
  const isMap = view === 'missions' || view === 'central'
  const activityOpen = new URLSearchParams(location.search).has('actividad')

  useEffect(() => {
    getMissionsToSync({ completedMissionIds }, { progress }).forEach((id) => completeMission(id))
  }, [progress, completedMissionIds])

  useEffect(() => {
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
    updateDiscovery((current) => recordBadgeFirstSeenAt(current, adventure, undefined, journey))
  }, [adventure, journey])

  const outlet = <Outlet context={context} />
  return (
    <div className="sx-root sx-shell">
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
