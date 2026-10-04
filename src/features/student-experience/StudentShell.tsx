import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useJourney } from '@/features/missions/store'
import { useOccupationExplorationContext } from '@/features/occupation-exploration/OccupationExplorationContext'
import {
  completeMission,
  useAdventure,
  useAdventureStorageError,
} from '@/features/occupation-exploration/lib/AdventureStore'
import { getMissionsToSync } from './map/mapPoints'
import { StudentModuleLayout } from './modules/StudentModuleLayout'
import { updateStudentUi } from './ui-state'
import { getStudentView } from './views'
import '@/features/occupation-exploration/adventure.css'
import './student-experience.css'

export function StudentShell() {
  const location = useLocation()
  const context = useOccupationExplorationContext()
  const { completedMissionIds } = useAdventure()
  const { progress } = useJourney()
  const storageError = useAdventureStorageError()
  const view = getStudentView(location.pathname)
  const isMap = view === 'missions' || view === 'central'

  useEffect(() => {
    getMissionsToSync({ completedMissionIds }, { progress }).forEach((id) => completeMission(id))
  }, [progress, completedMissionIds])

  useEffect(() => {
    if (view === 'missions' || view === 'central') {
      updateStudentUi((current) => (current.lastMap === view ? current : { ...current, lastMap: view }))
    }
  }, [view])

  const outlet = <Outlet context={context} />
  return (
    <div className="sx-root sx-shell">
      {storageError && (
        <p role="alert" className="sx-storage-warning">
          No se pudo guardar el avance en este navegador. Evita cerrar la página hasta liberar espacio o
          permitir el almacenamiento.
        </p>
      )}
      {isMap ? (
        outlet
      ) : (
        <StudentModuleLayout key={view} view={view}>
          {outlet}
        </StudentModuleLayout>
      )}
    </div>
  )
}
