import { useNavigate } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { ParentActivityCard } from './components/ParentActivityCard'
import { parentActivities } from './data/ParentPortalData'
import { useParentPortalContext } from './ParentPortalContext'

function ParentActivitiesView() {
  const navigate = useNavigate()
  const { completedActivityIds } = useParentPortalContext()
  const percentage = Math.round((completedActivityIds.length / parentActivities.length) * 100)
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
        description="Ideas breves para reflexionar y conversar en casa."
        eyebrow="Acompañamiento activo"
        title="Actividades para familias"
      />

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Para comprender el proceso</h2>
          <p className="text-sm text-muted-foreground">Contenido común para toda la familia.</p>
        </div>
        {parentActivities
          .filter((activity) => activity.category === 'informational')
          .map((activity) => (
            <ParentActivityCard
              activity={activity}
              completed={completedActivityIds.includes(activity.id)}
              key={activity.id}
              onStart={() => navigate(appPaths.parent.activity(activity.id))}
            />
          ))}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-bold">Para cada hijo o hija</h2>
          <p className="text-sm text-muted-foreground">
            Responde pensando en su historia y momento particular.
          </p>
        </div>
        {parentActivities
          .filter((activity) => activity.category === 'child')
          .map((activity) => (
            <ParentActivityCard
              activity={activity}
              completed={completedActivityIds.includes(activity.id)}
              key={activity.id}
              onStart={() => navigate(appPaths.parent.activity(activity.id))}
            />
          ))}
      </section>
    </div>
  )
}

export { ParentActivitiesView }
