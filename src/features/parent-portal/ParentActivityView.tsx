import { ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { catalog } from '@/features/missions/content'
import type { Actividad, IntentoPregunta, NodoPregunta } from '@/features/missions/model'
import { appPaths } from '@/routes/paths'
import { parentActivities } from './data/ParentPortalData'
import { parentRoute } from './selectors'
import {
  answerParentQuestion,
  advanceParentActivity,
  completedParentActivities,
  evaluateParentQuestion,
  nextParentPendingNode,
  parentActivityAvailable,
  retreatParentActivity,
  startParentActivity,
} from './missionLogic'
import { parentAccountId, updateParentJourney, useParentJourney, useParentJourneyError } from './missionStore'
import { ParentContent } from './components/ParentContent'
import { ParentResourceDialog } from './components/ParentResourceDialog'

type PracticeAttempt = Pick<IntentoPregunta, 'opcionIds' | 'correcta' | 'revelada' | 'numeroIntento'>

function ParentActivityView() {
  const { activityId } = useParams()
  const [params] = useSearchParams()
  const state = useParentJourney()
  const activity = parentActivities.find((item) => item.id === activityId)
  if (!activity || !parentActivityAvailable(activity, state))
    return <ActivityUnavailable locked={!!activity} />
  return (
    <ParentActivitySession
      key={`${activity.id}/${params.get('repasar') ?? ''}`}
      activity={activity}
      review={params.get('repasar') === '1' && state.progress[activity.id]?.estado === 'completada'}
    />
  )
}
function ParentActivitySession({ activity, review }: { activity: Actividad; review: boolean }) {
  const navigate = useNavigate()
  const state = useParentJourney()
  const error = useParentJourneyError()
  const [nodeId, setNodeId] = useState(() =>
    review ? activity.nodos[0]?.id : nextParentPendingNode(activity, state)?.id,
  )
  const [optionId, setOptionId] = useState<string>()
  const [resources, setResources] = useState<string[]>([])
  const [practice, setPractice] = useState<Record<string, PracticeAttempt[]>>({})
  const [entrance, setEntrance] = useState({ transition: false, resource: true })
  const [celebrate, setCelebrate] = useState(false)
  const visited = useRef(new Set(nodeId ? [nodeId] : []))
  const heading = useRef<HTMLHeadingElement>(null)
  const resourceTrigger = useRef<HTMLButtonElement | null>(null)
  const node = activity.nodos.find((entry) => entry.id === nodeId)
  const index = node ? activity.nodos.indexOf(node) : activity.nodos.length
  const steps = activity.nodos.filter((entry) => ['diapositiva', 'pregunta', 'eleccion'].includes(entry.tipo))
  const step = Math.max(
    1,
    node
      ? activity.nodos
          .slice(0, index + 1)
          .filter((entry) => ['diapositiva', 'pregunta', 'eleccion'].includes(entry.tipo)).length
      : steps.length,
  )
  const selected =
    node?.tipo === 'eleccion' ? node.opciones.find((option) => option.id === optionId) : undefined
  const summary = node?.tipo === 'diapositiva' && node.etiqueta?.toLowerCase() === 'resumen'
  const completedIds = completedParentActivities(parentActivities, state)
  const route = parentRoute(parentActivities, [], completedIds)
  const summaryResources =
    node?.tipo === 'diapositiva'
      ? catalog.recursos.filter((resource) => node.recursoIds?.includes(resource.id))
      : []
  useEffect(() => {
    if (!review && !state.progress[activity.id])
      updateParentJourney((current) => startParentActivity(activity, current, parentAccountId))
  }, [activity, review, state.progress])
  useEffect(() => {
    heading.current?.focus()
    heading.current?.scrollIntoView({ block: 'nearest' })
  }, [nodeId])
  function showNext() {
    const nextId = activity.nodos[index + 1]?.id
    const firstVisit = !!nextId && !visited.current.has(nextId)
    if (nextId) visited.current.add(nextId)
    setEntrance({ transition: firstVisit, resource: firstVisit })
    setNodeId(nextId)
    setOptionId(undefined)
  }
  function advance() {
    if (!node) return
    if (review) {
      showNext()
      return
    }
    let changed = false
    const saved = updateParentJourney((current) => {
      const started = startParentActivity(activity, current, parentAccountId)
      const next = advanceParentActivity(activity, node.id, started, parentAccountId, optionId)
      changed = next !== started
      return next
    })
    if (saved && changed) {
      if (index === activity.nodos.length - 1) setCelebrate(true)
      showNext()
    }
  }
  function back() {
    if (index <= 0 || !node) return
    const showPrevious = () => {
      setEntrance({ transition: false, resource: false })
      setNodeId(activity.nodos[index - 1].id)
      setOptionId(undefined)
    }
    if (review) {
      showPrevious()
      return
    }
    let moved = false
    const saved = updateParentJourney((current) => {
      const next = retreatParentActivity(activity, node.id, current)
      moved = next !== current
      return next
    })
    if (saved && moved) showPrevious()
  }
  return (
    <div className="parent-activity-player min-h-svh">
      <header className="parent-activity-topbar">
        <Button
          className="parent-player-exit"
          size="icon"
          aria-label="Salir de la actividad"
          onClick={() => navigate(appPaths.parent.activities)}
          variant="ghost"
        >
          <X aria-hidden />
        </Button>
        <div className="parent-activity-heading">
          <p>{review ? 'Repaso' : 'Actividad informativa'}</p>
          <h1>{activity.titulo}</h1>
        </div>
        <span className="parent-activity-step">
          Paso {step} de {steps.length}
        </span>
        <div
          className="parent-activity-progress"
          role="progressbar"
          aria-label="Avance de la actividad"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step}
          aria-valuetext={`Paso ${step} de ${steps.length}`}
        >
          <span
            className="parent-progress-track"
            style={{ width: `${100 - (step / steps.length) * 100}%` }}
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-5 py-8 sm:px-10 lg:py-10">
        {!review && error && (
          <div role="alert" className="mb-5 rounded-xl border p-4">
            <p>{error}</p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() =>
                updateParentJourney((current) => startParentActivity(activity, current, parentAccountId))
              }
            >
              Reintentar guardado
            </Button>
          </div>
        )}
        {node ? (
          <div className="min-w-0">
            {node.transicion && (
              <div
                key={`transition-${node.id}`}
                className={`parent-transition ${entrance.transition ? 'parent-rise' : ''}`}
              >
                <CheckCircle2 size={22} aria-hidden />
                <p>{node.transicion}</p>
              </div>
            )}
            <p className="parent-section-label">
              {node.tipo === 'diapositiva'
                ? (node.etiqueta ?? 'Información')
                : node.tipo === 'pregunta'
                  ? 'Para comprobar'
                  : node.tipo === 'eleccion'
                    ? 'Para conversar'
                    : 'Información'}
            </p>
            <h2
              ref={heading}
              tabIndex={-1}
              className={`parent-step-title ${node.tipo === 'pregunta' ? 'parent-question-title' : ''}`}
            >
              {node.tipo === 'diapositiva'
                ? node.titulo
                : node.tipo === 'pregunta'
                  ? node.enunciado
                  : node.tipo === 'eleccion'
                    ? node.enunciado
                    : 'Para continuar'}
            </h2>
            {node.tipo === 'diapositiva' && (
              <div className="mt-6">
                <ParentContent
                  summary={summary}
                  blocks={summary ? node.bloques.filter((block) => block.tipo !== 'parrafo') : node.bloques}
                />
                {summary ? (
                  <>
                    {summaryResources.map((resource) => (
                      <Card
                        key={`${node.id}/${resource.id}`}
                        className={`parent-ficha-card ${entrance.resource ? 'parent-pop' : ''}`}
                      >
                        <span className="parent-ficha-icon" aria-hidden>
                          <BookOpen size={30} />
                        </span>
                        <div className="parent-ficha-copy">
                          <p className="parent-ficha-label">
                            {review
                              ? 'FICHA EN SU MATERIAL DE CONSULTA'
                              : 'NUEVA FICHA EN SU MATERIAL DE CONSULTA'}
                          </p>
                          <h3>{resource.titulo}</h3>
                          <p>Este resumen quedó guardado. Puede repasarlo cuando quiera.</p>
                        </div>
                        <Button
                          variant="outline"
                          className="parent-ficha-button"
                          onClick={(event) => {
                            resourceTrigger.current = event.currentTarget
                            setResources([resource.id])
                          }}
                        >
                          Abrir ficha
                        </Button>
                      </Card>
                    ))}
                    <div className="parent-summary-note">
                      <ParentContent blocks={node.bloques.filter((block) => block.tipo === 'parrafo')} />
                    </div>
                  </>
                ) : (
                  !!node.recursoIds?.length && (
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={(event) => {
                        resourceTrigger.current = event.currentTarget
                        setResources(node.recursoIds ?? [])
                      }}
                    >
                      <BookOpen /> Ver ficha
                    </Button>
                  )
                )}
              </div>
            )}
            {node.tipo === 'dialogo' && <p className="mt-5 leading-8">{node.texto}</p>}
            {node.tipo === 'pregunta' && (
              <ParentQuestion
                key={node.id}
                activity={activity}
                node={node}
                review={review}
                practiceAttempts={practice[node.id] ?? []}
                onPracticeAnswer={(selection) =>
                  setPractice((current) => {
                    const attempts = current[node.id] ?? []
                    const result = evaluateParentQuestion(node, selection, attempts.length)
                    return {
                      ...current,
                      [node.id]: [
                        ...attempts,
                        {
                          opcionIds: selection,
                          correcta: result.correct,
                          revelada: result.revealed,
                          numeroIntento: attempts.length + 1,
                        },
                      ],
                    }
                  })
                }
                onContinue={advance}
                onBack={back}
                backDisabled={index <= 0}
              />
            )}
            {node.tipo === 'eleccion' && (
              <div className="mt-5 space-y-4">
                {node.nota && <p className="parent-support-text">{node.nota}</p>}
                <div className="grid gap-3">
                  {node.opciones.map((option) => (
                    <Button
                      key={option.id}
                      variant={optionId === option.id ? 'default' : 'outline'}
                      className="parent-choice-button"
                      aria-pressed={optionId === option.id}
                      onClick={() => setOptionId(option.id)}
                    >
                      {option.texto}
                    </Button>
                  ))}
                </div>
                {selected && (
                  <div role="status" className="parent-transition">
                    {selected.reaccion?.map((reaction) => <p key={reaction.id}>{reaction.texto}</p>) ?? (
                      <p>Puede continuar.</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {node.tipo !== 'pregunta' && (
              <div className="parent-player-navigation">
                <PreviousButton onClick={back} disabled={index <= 0} />
                <Button disabled={node.tipo === 'eleccion' && !selected} onClick={advance}>
                  {index === activity.nodos.length - 1 ? 'Terminar actividad' : 'Continuar'}{' '}
                  <ArrowRight aria-hidden />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="parent-finish-card">
            {!review && (
              <div className="parent-finish-emblem" aria-hidden>
                <div className={`parent-finish-circle ${celebrate ? 'parent-pop' : ''}`}>
                  <svg
                    className={celebrate ? 'parent-draw' : ''}
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 24 21 33 36 15" />
                  </svg>
                </div>
                {celebrate &&
                  Array.from({ length: 14 }, (_, i) => {
                    const angle = (i * Math.PI * 2) / 14,
                      distance = [84, 102, 120][i % 3]
                    return (
                      <span
                        key={i}
                        className="parent-dot"
                        style={
                          {
                            '--dx': `${Math.round(Math.cos(angle) * distance)}px`,
                            '--dy': `${Math.round(Math.sin(angle) * distance)}px`,
                            width: `${8 + (i % 3) * 2}px`,
                            height: `${8 + (i % 3) * 2}px`,
                            background: [
                              '#FFC23D',
                              '#7C8CE0',
                              '#4CB782',
                              '#F28C5B',
                              '#9FB2FF',
                              '#FFD25C',
                              '#3949AB',
                            ][i % 7],
                            animationDelay: `${0.25 + (i % 4) * 0.05}s`,
                          } as CSSProperties
                        }
                      />
                    )
                  })}
              </div>
            )}
            <div className={celebrate && !review ? 'parent-rise' : undefined}>
              <h2 ref={heading} tabIndex={-1} className="parent-finish-title">
                {review ? 'Terminó el repaso' : '¡Actividad completada!'}
              </h2>
              <p className="mt-4">
                {review
                  ? `Repasó «${activity.titulo}». Puede volver a consultar su ficha cuando quiera.`
                  : `Terminó «${activity.titulo}». La ficha quedó guardada en su material de consulta.`}
              </p>
              {!review && (
                <>
                  <section className="parent-route-progress" aria-label="Avance hacia el diploma">
                    <p>Su avance hacia el diploma «Conozco mi rol»</p>
                    <strong>
                      {route.completed} de {route.total} actividades
                    </strong>
                    <div className="parent-route-segments" aria-hidden>
                      {route.assigned.map((entry) => (
                        <span key={entry.id} data-completed={completedIds.includes(entry.id)} />
                      ))}
                    </div>
                  </section>
                  {route.complete ? (
                    <section className="parent-next-card">
                      <Award size={36} aria-hidden />
                      <h3>Obtuvo su diploma «Conozco mi rol»</h3>
                      <Button onClick={() => navigate(`${appPaths.parent.overview}?diploma=1`)}>
                        Ver mi diploma en el inicio
                      </Button>
                    </section>
                  ) : (
                    route.next && (
                      <section className="parent-next-card">
                        <p className="parent-section-label">Siguiente actividad</p>
                        <h3>{route.next.titulo}</h3>
                        <p>{route.next.subtitulo}</p>
                        <Button onClick={() => navigate(appPaths.parent.activity(route.next!.id))}>
                          Empezar <ArrowRight aria-hidden />
                        </Button>
                      </section>
                    )
                  )}
                </>
              )}
              <div className="parent-finish-actions">
                {!!activity.recompensa?.recursoIds?.length && (
                  <Button
                    variant="outline"
                    onClick={(event) => {
                      resourceTrigger.current = event.currentTarget
                      setResources(activity.recompensa?.recursoIds ?? [])
                    }}
                  >
                    <BookOpen aria-hidden /> Abrir ficha
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate(appPaths.parent.overview)}>
                  Volver al inicio
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
      <ParentResourceDialog
        returnFocus={() => resourceTrigger.current?.focus()}
        ids={resources}
        open={resources.length > 0}
        onOpenChange={(open) => {
          if (!open) setResources([])
        }}
      />
    </div>
  )
}
function ParentQuestion({
  activity,
  node,
  review,
  practiceAttempts,
  onPracticeAnswer,
  onContinue,
  onBack,
  backDisabled,
}: {
  activity: Actividad
  node: NodoPregunta
  review: boolean
  practiceAttempts: PracticeAttempt[]
  onPracticeAnswer: (selected: string[]) => void
  onContinue: () => void
  onBack: () => void
  backDisabled: boolean
}) {
  const state = useParentJourney()
  const attempts = review
    ? practiceAttempts
    : state.attempts.filter((attempt) => attempt.actividadId === activity.id && attempt.nodoId === node.id)
  const feedbackTitle = useRef<HTMLHeadingElement>(null)
  const answerOptions = useRef<HTMLFieldSetElement>(null)
  const last = attempts.at(-1)
  const [selected, setSelected] = useState<string[]>(last?.opcionIds ?? [])
  const [retrying, setRetrying] = useState(false)
  const [feedback, setFeedback] = useState(() =>
    last ? evaluateParentQuestion(node, last.opcionIds, attempts.length - 1) : undefined,
  )
  const wrongIds = new Set(
    attempts.flatMap((attempt) =>
      attempt.opcionIds.filter((id) => node.opciones.some((option) => option.id === id && !option.correcta)),
    ),
  )
  useEffect(() => {
    if (feedback && !retrying) feedbackTitle.current?.focus()
    else if (retrying) answerOptions.current?.focus()
  }, [feedback, retrying])
  function check() {
    const result = evaluateParentQuestion(node, selected, attempts.length)
    if (review) {
      onPracticeAnswer(selected)
      setFeedback(result)
      setRetrying(false)
      return
    }
    let changed = false
    const saved = updateParentJourney((current) => {
      const next = answerParentQuestion(
        activity,
        node,
        selected,
        startParentActivity(activity, current, parentAccountId),
        parentAccountId,
      )
      changed = next !== current
      return next
    })
    if (saved && changed) {
      setFeedback(result)
      setRetrying(false)
    }
  }
  function retry() {
    setSelected(selected.filter((id) => !wrongIds.has(id)))
    setRetrying(true)
  }
  return (
    <div className="mt-6 space-y-5">
      <fieldset ref={answerOptions} tabIndex={-1} className="space-y-3 outline-none">
        <legend className="sr-only">
          {node.formato === 'opcion_multiple'
            ? 'Marque todas las respuestas que correspondan'
            : 'Seleccione una respuesta'}
        </legend>
        {node.opciones.map((option) => {
          const final = !!feedback?.canContinue
          const correct = final && option.correcta
          const wrong = wrongIds.has(option.id)
          const chosen = selected.includes(option.id)
          const tone = correct ? 'correct' : wrong ? 'wrong' : chosen ? 'selected' : final ? 'muted' : 'idle'
          return (
            <label className="parent-answer-option" data-tone={tone} key={option.id}>
              <input
                className="sr-only"
                name={node.id}
                type={node.formato === 'opcion_multiple' ? 'checkbox' : 'radio'}
                checked={chosen}
                disabled={(!!feedback && !retrying) || wrong}
                onChange={() =>
                  setSelected(
                    node.formato === 'opcion_multiple'
                      ? chosen
                        ? selected.filter((id) => id !== option.id)
                        : [...selected, option.id]
                      : [option.id],
                  )
                }
              />
              <span
                className={`parent-option-marker ${node.formato === 'opcion_multiple' ? 'parent-checkbox-marker' : ''}`}
                aria-hidden
              >
                {correct ? (
                  <Check size={19} />
                ) : wrong ? (
                  <X size={19} />
                ) : chosen ? (
                  node.formato === 'opcion_multiple' ? (
                    <Check size={16} />
                  ) : (
                    <span />
                  )
                ) : null}
              </span>
              <span className="parent-option-text">{option.texto}</span>
              {correct ? (
                <span className="parent-option-tag">
                  {chosen ? 'Su respuesta · Correcta' : 'Respuesta correcta'}
                </span>
              ) : wrong ? (
                <span className="parent-option-tag">Su respuesta</span>
              ) : null}
            </label>
          )
        })}
      </fieldset>
      {feedback && (
        <>
          <section
            className={`parent-question-feedback ${feedback.canContinue && feedback.correct ? 'parent-feedback-correct' : 'parent-feedback-hint'}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <h3 ref={feedbackTitle} tabIndex={-1}>
              {feedback.title}
            </h3>
            {feedback.explanations.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </section>
          {feedback.canContinue && (
            <aside className="parent-remember">
              <h3>Para recordar</h3>
              <p>{node.explicacion}</p>
            </aside>
          )}
        </>
      )}
      <div className="parent-player-navigation">
        <PreviousButton onClick={onBack} disabled={backDisabled} />
        {feedback?.canContinue ? (
          <Button onClick={onContinue}>
            Continuar <ArrowRight aria-hidden />
          </Button>
        ) : feedback && !retrying ? (
          <Button onClick={retry}>
            Volver a intentarlo <ArrowRight aria-hidden />
          </Button>
        ) : (
          <Button disabled={!selected.length} onClick={check}>
            Comprobar respuesta
          </Button>
        )}
      </div>
    </div>
  )
}
function PreviousButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled}>
      <ArrowLeft aria-hidden /> Anterior
    </Button>
  )
}
function ActivityUnavailable({ locked }: { locked: boolean }) {
  const navigate = useNavigate()
  return (
    <div className="grid min-h-80 place-items-center p-8 text-center">
      <div>
        <h1 className="text-xl font-bold">{locked ? 'Actividad bloqueada' : 'Actividad no encontrada'}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {locked ? 'Complete la actividad anterior para continuar.' : 'La actividad solicitada no existe.'}
        </p>
        <Button className="mt-4 min-h-11" onClick={() => navigate(appPaths.parent.activities)}>
          Mis actividades
        </Button>
      </div>
    </div>
  )
}
export { ParentActivityView }
