import { ArrowRight, BookOpenCheck, CalendarClock, HeartHandshake, MessageCircleMore } from 'lucide-react'
import { useNavigate } from 'react-router'
import { MetricCard } from '@/components/MetricCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { parentChildren, parentProfile } from './data/ParentPortalData'
import { useParentPortalContext } from './ParentPortalContext'

function ParentOverviewView() {
  const navigate = useNavigate()
  const { completedActivityIds } = useParentPortalContext()

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,var(--primary),#7f75eb)] p-6 text-primary-foreground shadow-[var(--shadow-card)] sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-4 bg-white/15 text-white">Portal de familias</Badge>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Hola, {parentProfile.firstName}. Tu presencia también orienta.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
            Encuentra conversaciones, actividades y señales de avance para acompañar con confianza, sin
            decidir por ellos.
          </p>
          <Button
            className="mt-6 bg-white text-primary hover:bg-white/90"
            onClick={() => navigate(appPaths.parent.activities)}
          >
            Continuar actividades <ArrowRight />
          </Button>
        </div>
        <HeartHandshake className="absolute -bottom-10 right-3 size-48 text-white/10 sm:right-12 sm:size-56" />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={BookOpenCheck}
          label="Actividades completadas"
          value={`${completedActivityIds.length} de 3`}
        />
        <MetricCard icon={MessageCircleMore} label="Conversación sugerida" value="1 esta semana" />
        <MetricCard icon={CalendarClock} label="Próximo hito" value="Revisión en 5 días" />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Avance de tus hijos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Un vistazo general para saber dónde acompañar.
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {parentChildren.map((child) => (
            <Card className="p-5 shadow-[var(--shadow-card)]" key={child.id}>
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] font-bold text-primary">
                  {child.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold">{child.name}</h3>
                      <p className="text-xs text-muted-foreground">{child.grade}</p>
                    </div>
                    <Badge variant="success">{child.progress}%</Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Progress className="h-2.5" value={child.progress} />
                    <span className="text-xs font-semibold">{child.progress}%</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Último avance: <span className="font-medium text-foreground">{child.lastActivity}</span>
                  </p>
                  <Button
                    className="mt-4 px-0"
                    onClick={() => navigate(appPaths.parent.child(child.id))}
                    variant="link"
                  >
                    Ver su proceso <ArrowRight />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export { ParentOverviewView }
