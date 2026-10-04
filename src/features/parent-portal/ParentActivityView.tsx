import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { parentActivities, parentChildren } from './data/ParentPortalData'
import { useParentPortalContext } from './ParentPortalContext'
import { GuideDialogue } from '@/components/GuideDialogue'
import { updateAdventure } from '@/features/occupation-exploration/lib/AdventureStore'

function ParentActivityView() {
  const navigate = useNavigate()
  const { activityId } = useParams()
  const { completeActivity } = useParentPortalContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [writtenResponses, setWrittenResponses] = useState<Record<number, string>>({})
  const activity = parentActivities.find(
    (item) =>
      item.id === activityId && (!item.childId || parentChildren.some((child) => child.id === item.childId)),
  )

  if (!activity) return <NavigateToActivities />

  const step = activity.steps[currentStep]
  const isLast = currentStep === activity.steps.length - 1
  const progress = Math.round(((currentStep + 1) / activity.steps.length) * 100)
  const finishActivity = () => {
    if (activity.id === 'role') {
      const commitment = writtenResponses[activity.steps.length - 1]?.trim()
      if (commitment) {
        updateAdventure((current) => ({
          ...current,
          familyGift: { ...current.familyGift, parentCommitment: commitment },
        }))
      }
    }
    completeActivity(activity.id)
    navigate(appPaths.parent.activities)
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 p-4 sm:p-6 lg:grid-cols-[260px_1fr] lg:p-8">
      <aside className="rounded-2xl border bg-card p-5 lg:self-start">
        <Button className="-ml-3 mb-5" onClick={() => navigate(appPaths.parent.activities)} variant="ghost">
          <ArrowLeft /> Volver
        </Button>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Actividad para familias</p>
        <h1 className="mt-2 font-bold leading-snug">{activity.title}</h1>
        <div className="mt-6 flex justify-between text-xs">
          <span>
            Paso {currentStep + 1} de {activity.steps.length}
          </span>
          <strong>{progress}%</strong>
        </div>
        <Progress className="mt-2" value={progress} />
      </aside>
      <Card className="min-h-[480px] p-6 shadow-[var(--shadow-card)] sm:p-10">
        <div className="mx-auto flex h-full max-w-2xl flex-col">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Reflexión {currentStep + 1}
          </span>
          <h2 className="mt-3 text-2xl font-bold">{step.title}</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">{step.body}</p>
          {step.prompt && (
            <div className="mt-7 rounded-2xl bg-[var(--primary-soft)] p-5">
              <p className="font-semibold">{step.prompt}</p>
              {step.options ? (
                <div className="mt-4 space-y-2">
                  {step.options.map((option) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-card p-3 text-sm"
                      key={option}
                    >
                      <input name="parent-option" type="radio" /> {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  className="mt-4 min-h-24 w-full resize-none rounded-xl border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Escribe aquí si deseas guardar una idea..."
                  value={writtenResponses[currentStep] ?? ''}
                  onChange={(event) =>
                    setWrittenResponses((current) => ({ ...current, [currentStep]: event.target.value }))
                  }
                />
              )}
            </div>
          )}
          <div className="mt-auto flex justify-end pt-8">
            <Button
              onClick={
                isLast
                  ? finishActivity
                  : () => setCurrentStep((current) => Math.min(current + 1, activity.steps.length - 1))
              }
            >
              {isLast ? (
                <>
                  <CheckCircle2 /> Finalizar actividad
                </>
              ) : (
                <>
                  Continuar <ArrowRight />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
      <GuideDialogue audience="parent" text={step.body} />
    </div>
  )
}

function NavigateToActivities() {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-80 place-items-center p-8 text-center">
      <div>
        <h1 className="text-xl font-bold">Actividad no encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">La actividad solicitada no existe.</p>
        <Button className="mt-4" onClick={() => navigate(appPaths.parent.activities)}>
          Volver a actividades
        </Button>
      </div>
    </div>
  )
}

export { ParentActivityView }
