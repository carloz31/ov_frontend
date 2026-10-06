import {
  Award,
  ArrowRight,
  BookOpenCheck,
  Check,
  LockKeyhole,
  MessageCircleHeart,
  Circle,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CardIcon } from '@/components/ui/Status'
import { Progress } from '@/components/ui/Progress'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { appPaths } from '@/routes/paths'
import { parentActivities, parentChildren, parentProfile, conversationChildId } from './data/ParentPortalData'
import { parentMotivation } from './data/ParentMotivation'
import { useParentPortalContext } from './ParentPortalContext'
import {
  completeFamilyResult,
  conversationSummary,
  familySharedIds,
  parentResultUrl,
  parentRoute,
  selectedFamilyChild,
} from './selectors'
import { activities, questionnaires, studentProfiles } from '@/features/counselor-portal/profile/data'
import { displayDate, generalProgress } from '@/features/counselor-portal/profile/selectors'
import { QuestionnaireBars } from '@/features/counselor-portal/profile/Questionnaires'
import { usePrioritySettings } from '@/features/counselor-portal/priorities/usePrioritySettings'
import {
  canAccessFamilyConversations,
  useAdventure,
} from '@/features/occupation-exploration/lib/AdventureStore'
import {
  familyConversationTopics,
  familyConversationDemoData,
} from '@/features/family-conversations/FamilyConversationData'

function ParentOverviewView() {
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.scrollIntoView({ block: 'start' })
  }, [])
  const { completedActivityIds } = useParentPortalContext()
  const state = useAdventure()
  const settings = usePrioritySettings()
  const [params, setParams] = useSearchParams()
  const child = selectedFamilyChild(parentChildren, params.get('child'))
  useEffect(() => {
    if (child && params.get('child') !== child.id) {
      const next = new URLSearchParams(params)
      next.set('child', child.id)
      setParams(next, { replace: true })
    }
  }, [child, params, setParams])
  const route = parentRoute(parentActivities, parentChildren, completedActivityIds)
  const shared = questionnaires.filter((q) => familySharedIds(settings).includes(q.id))
  const conversation = conversationSummary(
    familyConversationTopics,
    familyConversationDemoData,
    state.conversations,
    canAccessFamilyConversations(state),
  )
  const student = studentProfiles.find((s) => s.id === child?.id)
  const progress = student ? generalProgress(student, activities) : null
  return (
    <main ref={mainRef} className="min-w-0 space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Tu recorrido en familia
        </p>
        <h1 className="text-3xl font-bold">Hola, {parentProfile.firstName}</h1>
        <p className="text-muted-foreground">{parentMotivation('greeting')}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CardIcon icon={route.complete ? Award : BookOpenCheck} />
            <h2 className="text-lg font-bold">Mis actividades</h2>
            <Badge variant={route.complete ? 'success' : 'default'} className="ml-auto">
              {route.complete ? 'Ruta completada' : 'Tu ruta'}
            </Badge>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative size-20 shrink-0">
              <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden>
                <circle cx="40" cy="40" r="33" fill="none" stroke="var(--neutral-soft)" strokeWidth="6" />
                <circle
                  cx="40"
                  cy="40"
                  r="33"
                  fill="none"
                  stroke={route.complete ? 'var(--success)' : 'var(--primary)'}
                  strokeWidth="6"
                  strokeDasharray={`${route.percent * 2.0735} 207.35`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 grid place-items-center text-lg font-bold">
                {Math.round(route.percent)} %
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {route.completed} de {route.total} actividades
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {route.complete ? 'Tu logro de acompañamiento' : 'Tu próximo paso de acompañamiento'}
              </p>
            </div>
          </div>
          {route.complete ? (
            <div className="flex items-center gap-4 rounded-xl border bg-primary-soft p-4">
              <Award className="size-10 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-xs text-muted-foreground">Diploma de tu recorrido</p>
                <h3 className="font-bold">Conozco mi rol</h3>
                <p className="mt-1 text-sm">Completaste tu ruta</p>
              </div>
            </div>
          ) : (
            <ol className="flex flex-wrap items-center gap-3" aria-label="Pasos de tu ruta">
              {route.assigned.map((activity, index) => (
                <li key={activity.id} className="flex items-center gap-2 text-xs">
                  <span
                    className={`grid size-8 place-items-center rounded-full ${completedActivityIds.includes(activity.id) ? 'bg-success-soft text-success-text' : route.next?.id === activity.id ? 'bg-primary-soft font-bold text-primary ring-1 ring-primary' : 'bg-neutral-soft text-muted-foreground'}`}
                  >
                    {completedActivityIds.includes(activity.id) ? (
                      <Check className="size-4" aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="sr-only">
                    {activity.titulo}:{' '}
                    {completedActivityIds.includes(activity.id) ? 'Completada' : 'Pendiente'}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-auto space-y-3">
            {!route.complete && route.next && <p className="text-sm font-semibold">{route.next.titulo}</p>}
            <Button
              asChild
              variant={route.complete ? 'outline' : 'default'}
              className="min-h-11 h-auto max-w-full whitespace-normal"
            >
              <Link
                to={
                  route.complete || !route.next
                    ? appPaths.parent.activities
                    : appPaths.parent.activity(route.next.id)
                }
              >
                {route.complete ? 'Repasar mis actividades' : 'Continuar'}
                <ArrowRight className="shrink-0" aria-hidden />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">{parentMotivation('activities')}</p>
          </div>
        </Card>
        <Card className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <CardIcon icon={MessageCircleHeart} />
            <h2 className="text-lg font-bold">Conversaciones</h2>
          </div>
          {conversation.available ? (
            <>
              <p className="text-2xl font-bold">
                {conversation.completed} {conversation.completed === 1 ? 'conversada' : 'conversadas'},{' '}
                {conversation.pending} {conversation.pending === 1 ? 'pendiente' : 'pendientes'}
              </p>
              {parentChildren.length > 1 &&
                parentChildren.map((item) => (
                  <p key={item.id} className="text-sm">
                    Con {item.name.split(' ')[0]}:{' '}
                    {item.id === conversationChildId
                      ? `${conversation.completed} conversadas, ${conversation.pending} pendientes`
                      : 'Aún no hay conversaciones disponibles'}
                  </p>
                ))}
              <div className="space-y-3 rounded-xl bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-success-text" aria-hidden />
                  Conversadas: {conversation.completed}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Circle className="size-4 text-primary" aria-hidden />
                  Por conversar: {conversation.pending}
                </div>
                <Progress
                  value={(conversation.completed / conversation.available) * 100}
                  aria-label="Avance de conversaciones"
                />
              </div>
              <div className="mt-auto space-y-3">
                <Button
                  asChild
                  variant={conversation.pending ? 'default' : 'outline'}
                  className="min-h-11 h-auto whitespace-normal"
                >
                  <Link to={appPaths.parent.conversations}>
                    {conversation.pending
                      ? 'Seguir con las conversaciones'
                      : 'Revisar nuestras conversaciones'}
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground">{parentMotivation('conversations')}</p>
              </div>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Las conversaciones se habilitarán a medida que {student?.nombres ?? 'tu hijo'} avance en su
              recorrido.
            </p>
          )}
        </Card>
      </div>
      <section className="space-y-5" aria-labelledby="family-children">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="family-children" className="text-xl font-bold">
            Mis hijos
          </h2>
          {parentChildren.length > 1 && child && (
            <Tabs
              value={child.id}
              onValueChange={(id) => {
                const next = new URLSearchParams(params)
                next.set('child', id)
                setParams(next)
              }}
            >
              <TabsList className="h-auto flex-wrap">
                {parentChildren.map((item) => (
                  <TabsTrigger key={item.id} value={item.id} className="min-h-11">
                    {item.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
        {child && student && progress ? (
          <Card className="space-y-6 p-5 sm:p-6">
            <header className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft font-bold text-primary">
                  {child.initials}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold">{child.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Salón: {student.salon}</p>
                </div>
              </div>
              <div className="w-full space-y-2 sm:w-72">
                <div className="flex justify-between gap-2 text-sm">
                  <span>Avance de su recorrido</span>
                  <strong>{progress.percent} %</strong>
                </div>
                <Progress
                  intent="data"
                  value={progress.percent}
                  aria-label="Avance general de su recorrido"
                />
              </div>
            </header>
            <div className="space-y-5 border-t pt-6">
              <h3 className="text-lg font-bold">Resultados de sus cuestionarios</h3>
              <p className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed">
                Estos resultados son exploratorios. Sirven para conversar con {student.nombres} sobre lo que
                le gusta y en lo que destaca, no para decidir qué debe estudiar.
              </p>
              {!shared.length ? (
                <p className="text-sm text-muted-foreground">
                  Por ahora no hay resultados compartidos con las familias.
                </p>
              ) : !route.complete ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border p-4">
                    <LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                    <p className="text-sm">
                      Podrás ver los resultados de {student.nombres} cuando completes tus actividades.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="min-h-11">
                    <Link to={appPaths.parent.activities}>Ir a mis actividades</Link>
                  </Button>
                  <p className="text-sm font-semibold">Cuestionarios que se compartirán</p>
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {shared.map((definition) => (
                      <li key={definition.id}>{definition.name}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {shared.map((definition) => {
                    const application = student.questionnaires.find(
                      (q) => q.questionnaireId === definition.id,
                    )
                    const ready = completeFamilyResult(application)
                    return (
                      <AccordionItem key={definition.id} value={definition.id}>
                        <AccordionTrigger className="min-h-11">
                          <span className="space-y-2">
                            <span className="block font-semibold">{definition.name}</span>
                            <Badge variant={ready ? 'success' : 'neutral'} className="font-normal">
                              {ready
                                ? `Completado · ${displayDate(application?.completedAt)}`
                                : 'Aún no lo completa'}
                            </Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          {ready && application?.result ? (
                            <div className="space-y-5">
                              <QuestionnaireBars
                                definition={definition}
                                result={application.result}
                                audience="parent"
                                childName={student.nombres}
                              />
                              <Button asChild variant="outline" className="min-h-11">
                                <Link to={parentResultUrl(child.id, definition.id)}>
                                  Ver resultado completo
                                </Link>
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Aún no lo completa.</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              )}
            </div>
          </Card>
        ) : (
          <p className="text-muted-foreground">No hay hijos asociados a esta cuenta.</p>
        )}
      </section>
    </main>
  )
}
export { ParentOverviewView }
