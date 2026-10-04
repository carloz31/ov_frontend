import { useState } from 'react'
import { Link } from 'react-router'
import { useJourney } from '@/features/missions/store'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getCaminoPoints, getCiudadPoints, getPointDetails } from '../map/mapPoints'
import { getListedActivities, getPointMapHref } from '../map/navigation'

export function StudentActivitiesView() {
  const adventure = useAdventure()
  const journey = useJourney()
  const [completed, setCompleted] = useState(false)
  const points = getListedActivities(
    [...getCaminoPoints(adventure, journey), ...getCiudadPoints(adventure, journey)],
    completed,
  )
  return (
    <section className="sx-activities">
      <div className="sx-activities-tabs" role="group" aria-label="Estado de las actividades">
        <button type="button" aria-pressed={!completed} onClick={() => setCompleted(false)}>
          Disponibles
        </button>
        <button type="button" aria-pressed={completed} onClick={() => setCompleted(true)}>
          Realizadas
        </button>
      </div>
      <h2>{completed ? 'Actividades realizadas' : 'Actividades disponibles'}</h2>
      {points.length ? (
        <ul className="sx-activities-list">
          {points.map((point) => {
            const details = getPointDetails(point, adventure, journey)
            const Icon = point.icon
            return (
              <li key={point.id} className="sx-activity-summary">
                <Icon size={24} aria-hidden="true" />
                <div>
                  <h3>{point.title}</h3>
                  <p>
                    {point.zone === 'camino' ? 'Camino' : 'Ciudad'} · {details.type}
                  </p>
                  <span className="sx-drawer-badge" data-status={details.badge}>
                    {details.badge}
                  </span>
                </div>
                <Link className="sx-secondary-button" to={getPointMapHref(point)}>
                  Ver en el mapa<span className="sr-only">: {point.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>
          {completed ? 'Aún no has realizado actividades.' : 'No tienes actividades disponibles por ahora.'}
        </p>
      )}
    </section>
  )
}
