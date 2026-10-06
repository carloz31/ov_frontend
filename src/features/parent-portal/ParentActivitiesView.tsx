import { useState } from 'react'
import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { ParentActivityCard } from './components/ParentActivityCard'
import { ParentResourceDialog } from './components/ParentResourceDialog'
import { parentRoute } from './selectors'
import { parentActivities, parentChildren } from './data/ParentPortalData'
import { useParentPortalContext } from './ParentPortalContext'
import { useParentJourney } from './missionStore'
import { parentActivityAvailable } from './missionLogic'

function ParentActivitiesView() {
  const navigate = useNavigate()
  const { completedActivityIds } = useParentPortalContext()
  const state = useParentJourney()
  const [resources, setResources] = useState<string[]>([])
  const route = parentRoute(parentActivities, parentChildren, completedActivityIds)
  const percentage = Math.round(route.percent)
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        actions={
          <div className="min-w-52 rounded-2xl border bg-card p-4">
            <div className="flex justify-between text-xs">
              <span>Progreso general</span>
              <strong>{percentage}%</strong>
            </div>
            <Progress className="mt-2" value={percentage} />
          </div>
        }
        description="Información para acompañar y conversar en casa."
        eyebrow="Acompañamiento activo"
        title="Actividades para familias"
      />
      <section className="space-y-3" aria-label="Ruta de actividades">
        <div>
          <h2 className="font-bold">Para comprender el proceso</h2>
          <p className="text-sm text-muted-foreground">Contenido común para toda la familia.</p>
        </div>
        {route.assigned.map((activity) => (
          <ParentActivityCard
            activity={activity}
            completed={completedActivityIds.includes(activity.id)}
            inProgress={state.progress[activity.id]?.estado === 'en_curso'}
            locked={!parentActivityAvailable(activity, state)}
            key={activity.id}
            onStart={() =>
              navigate(
                `${appPaths.parent.activity(activity.id)}${completedActivityIds.includes(activity.id) ? '?repasar=1' : ''}`,
              )
            }
            onResources={setResources}
          />
        ))}
      </section>
      <ParentResourceDialog
        ids={resources}
        open={resources.length > 0}
        onOpenChange={(open) => {
          if (!open) setResources([])
        }}
      />
    </div>
  )
}
export { ParentActivitiesView }
