import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { parentChildren } from './data/ParentPortalData'

function ParentChildrenView() {
  const navigate = useNavigate()
  const { childId } = useParams()
  const child = parentChildren.find((item) => item.id === childId) ?? parentChildren[0]
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        description="Observa avances sin convertirlos en una calificación."
        eyebrow="Seguimiento familiar"
        title="Proceso de tus hijos"
      />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {parentChildren.map((item) => (
          <button
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${item.id === child.id ? 'border-primary bg-[var(--primary-soft)]' : 'bg-card hover:border-primary/40'}`}
            key={item.id}
            onClick={() => navigate(appPaths.parent.child(item.id))}
            type="button"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-white font-bold text-primary">
              {item.initials}
            </span>
            <span>
              <strong className="block text-sm">{item.name}</strong>
              <span className="text-xs text-muted-foreground">{item.grade}</span>
            </span>
          </button>
        ))}
      </div>
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <div className="bg-[linear-gradient(120deg,var(--primary-soft),white)] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                {child.initials}
              </div>
              <div>
                <h2 className="text-xl font-bold">{child.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {child.grade} · {child.school}
                </p>
              </div>
            </div>
            <div className="min-w-48">
              <div className="flex justify-between text-xs">
                <span>Recorrido completado</span>
                <strong>{child.progress}%</strong>
              </div>
              <Progress className="mt-2 h-2.5" value={child.progress} />
            </div>
          </div>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.2fr] sm:p-8">
          <div className="space-y-4">
            <Info label="Perfil de intereses" value={child.hollandProfile} />
            <Info label="Forma de aprender" value={child.learningStyle} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Intereses destacados
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {child.interests.map((interest) => (
                  <Badge key={interest}>{interest}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-bold">
              <Sparkles className="size-4 text-primary" /> Hitos del proceso
            </h3>
            <div className="mt-4 space-y-3">
              {child.milestones.map((milestone) => (
                <div className="flex items-center gap-3 rounded-xl border p-3" key={milestone.label}>
                  {milestone.completed ? (
                    <CheckCircle2 className="size-5 text-[var(--success)]" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">{milestone.label}</span>
                  <Badge className="ml-auto" variant={milestone.completed ? 'success' : 'outline'}>
                    {milestone.completed ? 'Completado' : 'En camino'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  )
}

export { ParentChildrenView }
