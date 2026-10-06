import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { parentActivities } from './data/ParentPortalData'
import { evaluateQuestion, nextPendingNode } from '@/features/missions/logic'
import type { Actividad, NodoPregunta } from '@/features/missions/model'
import {
  answerParentQuestion,
  advanceParentActivity,
  parentActivityAvailable,
  retreatParentActivity,
  startParentActivity,
} from './missionLogic'
import { parentAccountId, updateParentJourney, useParentJourney, useParentJourneyError } from './missionStore'
import { ParentContent } from './components/ParentContent'
import { ParentResourceDialog } from './components/ParentResourceDialog'

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
    review ? activity.nodos[0]?.id : nextPendingNode(activity, state, false)?.id,
  )
  const [optionId, setOptionId] = useState<string>()
  const [resources, setResources] = useState<string[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const node = activity.nodos.find((entry) => entry.id === nodeId)
  const index = node ? activity.nodos.indexOf(node) : activity.nodos.length
  const steps = activity.nodos.filter((entry) => ['diapositiva', 'pregunta', 'eleccion'].includes(entry.tipo))
  const step = node
    ? activity.nodos
        .slice(0, index + 1)
        .filter((entry) => ['diapositiva', 'pregunta', 'eleccion'].includes(entry.tipo)).length
    : steps.length
  const selected =
    node?.tipo === 'eleccion' ? node.opciones.find((option) => option.id === optionId) : undefined
  const next = parentActivities.find(
    (entry) => entry.id === activity.siguienteSugerida && parentActivityAvailable(entry, state),
  )
  useEffect(() => {
    updateParentJourney((current) => startParentActivity(activity, current, parentAccountId))
  }, [activity])
  useEffect(() => {
    heading.current?.focus()
    heading.current?.scrollIntoView({ block: 'nearest' })
  }, [nodeId])
  function advance() {
    if (!node) return
    let changed = false
    const saved = updateParentJourney((current) => {
      const started = startParentActivity(activity, current, parentAccountId)
      const next = advanceParentActivity(activity, node.id, started, parentAccountId, optionId)
      changed = next !== started
      return next
    })
    if (saved && changed) {
      setNodeId(activity.nodos[index + 1]?.id)
      setOptionId(undefined)
    }
  }
  function back() {
    if (index <= 0) return
    let moved = false
    const saved = updateParentJourney((current) => {
      const next = retreatParentActivity(activity, node?.id ?? '$fin', current)
      moved = next !== current || current.progress[activity.id]?.estado === 'completada'
      return next
    })
    if (saved && moved) {
      setNodeId(activity.nodos[index - 1].id)
      setOptionId(undefined)
    }
  }
  return (
    <div className="parent-activity-player min-h-svh">
      <header className="parent-activity-topbar">
        <Button
          className="size-11 shrink-0 text-inherit hover:bg-white/10 hover:text-inherit"
          size="icon"
          aria-label="Salir de la actividad"
          onClick={() => navigate(appPaths.parent.activities)}
          variant="ghost"
        >
          <X aria-hidden />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-xs opacity-80">{review ? 'Repaso' : 'Actividad informativa'}</p>
          <h1 className="mt-1 text-sm font-bold leading-snug sm:text-base">{activity.titulo}</h1>
        </div>
        <div className="parent-activity-progress">
          <span className="text-xs">
            Paso {Math.max(1, step)} de {steps.length}
          </span>
          <Progress
            aria-label="Avance de la actividad"
            className="mt-2 bg-white/20"
            value={(step / steps.length) * 100}
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl min-w-0 px-5 py-8 sm:px-10 lg:py-10">
        {error && (
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
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {node?.tipo === 'diapositiva'
              ? (node.etiqueta ?? 'Información')
              : node?.tipo === 'pregunta'
                ? 'Para comprobar'
                : node?.tipo === 'eleccion'
                  ? 'Para conversar'
                  : node
                    ? 'Información'
                    : 'Actividad completada'}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-3 scroll-mt-28 text-2xl font-bold outline-none sm:text-3xl"
          >
            {node?.tipo === 'diapositiva'
              ? node.titulo
              : node?.tipo === 'pregunta'
                ? node.enunciado
                : node?.tipo === 'eleccion'
                  ? node.enunciado
                  : node
                    ? 'Para continuar'
                    : 'Lo que se lleva'}
          </h2>
          {node?.tipo === 'diapositiva' && (
            <div className="mt-6">
              <ParentContent blocks={node.bloques} />
              {!!node.recursoIds?.length && (
                <Button
                  variant="outline"
                  className="mt-6 min-h-11"
                  onClick={() => setResources(node.recursoIds ?? [])}
                >
                  <BookOpen /> Ver ficha
                </Button>
              )}
            </div>
          )}
          {node?.tipo === 'dialogo' && <p className="mt-5 leading-8">{node.texto}</p>}
          {node?.tipo === 'pregunta' && (
            <ParentQuestion
              key={node.id}
              activity={activity}
              node={node}
              review={review}
              onContinue={advance}
              onBack={back}
              backDisabled={index <= 0}
            />
          )}
          {node?.tipo === 'eleccion' && (
            <div className="mt-5 space-y-4">
              {node.nota && <p className="text-sm text-muted-foreground">{node.nota}</p>}
              <div className="grid gap-3">
                {node.opciones.map((option) => (
                  <Button
                    key={option.id}
                    variant={optionId === option.id ? 'default' : 'outline'}
                    className="h-auto min-h-11 justify-start whitespace-normal text-left"
                    aria-pressed={optionId === option.id}
                    onClick={() => setOptionId(option.id)}
                  >
                    {option.texto}
                  </Button>
                ))}
              </div>
              {selected && (
                <div role="status" className="rounded-xl bg-[var(--primary-soft)] p-4">
                  {selected.reaccion?.map((reaction) => (
                    <p key={reaction.id} className="leading-7">
                      {reaction.texto}
                    </p>
                  )) ?? <p>Puede continuar.</p>}
                </div>
              )}
            </div>
          )}
          {node && node.tipo !== 'pregunta' && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <PreviousButton onClick={back} disabled={index <= 0} />
              <Button className="min-h-11" disabled={node.tipo === 'eleccion' && !selected} onClick={advance}>
                Continuar <ArrowRight />
              </Button>
            </div>
          )}
          {!node && (
            <div className="mt-6 space-y-6">
              <CheckCircle2 className="size-10 text-primary" aria-hidden />
              <p className="leading-8">{activity.recompensa?.mensajeFin}</p>
              {!!activity.recompensa?.recursoIds?.length && (
                <section>
                  <h3 className="font-bold">Material de consulta</h3>
                  <Button
                    variant="outline"
                    className="mt-3 min-h-11"
                    onClick={() => setResources(activity.recompensa?.recursoIds ?? [])}
                  >
                    <BookOpen /> Ver ficha
                  </Button>
                </section>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <PreviousButton onClick={back} disabled={index <= 0} />
                <Button
                  className="h-auto min-h-11 whitespace-normal"
                  onClick={() =>
                    navigate(next ? appPaths.parent.activity(next.id) : appPaths.parent.activities)
                  }
                >
                  {next ? next.titulo : 'Mis actividades'} <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
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
function ParentQuestion({
  activity,
  node,
  review,
  onContinue,
  onBack,
  backDisabled,
}: {
  activity: Actividad
  node: NodoPregunta
  review: boolean
  onContinue: () => void
  onBack: () => void
  backDisabled: boolean
}) {
  const state = useParentJourney()
  const attempts = state.attempts.filter(
    (attempt) => attempt.actividadId === activity.id && attempt.nodoId === node.id,
  )
  const feedbackPanel = useRef<HTMLDivElement>(null)
  const answerOptions = useRef<HTMLFieldSetElement>(null)
  const hadFeedback = useRef(false)
  const last = review ? undefined : attempts.at(-1)
  const [selected, setSelected] = useState<string[]>(last?.opcionIds ?? [])
  const [feedback, setFeedback] = useState(() =>
    last
      ? evaluateQuestion(
          node,
          last.opcionIds,
          attempts.slice(0, -1).filter((attempt) => !attempt.correcta).length,
        )
      : undefined,
  )
  useEffect(() => {
    if (feedback) feedbackPanel.current?.focus()
    else if (hadFeedback.current) answerOptions.current?.focus()
    hadFeedback.current = !!feedback
  }, [feedback])
  function check() {
    const result = evaluateQuestion(node, selected, attempts.filter((attempt) => !attempt.correcta).length)
    if (
      updateParentJourney((current) =>
        answerParentQuestion(
          activity,
          node,
          selected,
          startParentActivity(activity, current, parentAccountId),
          parentAccountId,
        ),
      )
    )
      setFeedback(result)
  }
  return (
    <div className="mt-6 space-y-5">
      <fieldset ref={answerOptions} tabIndex={-1} className="space-y-3 outline-none">
        <legend className="sr-only">
          {node.formato === 'opcion_multiple'
            ? 'Marque todas las respuestas que correspondan'
            : 'Seleccione una respuesta'}
        </legend>
        {node.opciones.map((option) => (
          <label
            className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-4"
            key={option.id}
          >
            <input
              className="mt-1 size-4 shrink-0 accent-primary"
              name={node.id}
              type={node.formato === 'opcion_multiple' ? 'checkbox' : 'radio'}
              checked={selected.includes(option.id)}
              disabled={!!feedback}
              onChange={() =>
                setSelected(
                  node.formato === 'opcion_multiple'
                    ? selected.includes(option.id)
                      ? selected.filter((id) => id !== option.id)
                      : [...selected, option.id]
                    : [option.id],
                )
              }
            />
            <span>{option.texto}</span>
          </label>
        ))}
      </fieldset>
      {!feedback ? (
        <div className="flex items-center justify-between gap-3">
          <PreviousButton onClick={onBack} disabled={backDisabled} />
          <Button className="min-h-11" disabled={!selected.length} onClick={check}>
            Comprobar
          </Button>
        </div>
      ) : (
        <div ref={feedbackPanel} tabIndex={-1} className="space-y-4 outline-none" role="status">
          <div className="rounded-xl border p-4">
            <p className="font-semibold">
              {feedback.correct
                ? 'Respuesta correcta'
                : feedback.revealed
                  ? 'Revise la respuesta'
                  : 'Puede volver a intentarlo'}
            </p>
            {node.opciones
              .filter((option) => selected.includes(option.id))
              .map((option) => (
                <p key={option.id} className="mt-2 leading-7">
                  {option.retroalimentacion}
                </p>
              ))}
          </div>
          {feedback.hint && (
            <aside className="rounded-xl bg-[var(--primary-soft)] p-4">
              <h3 className="font-bold">Pista</h3>
              <p className="mt-2 leading-7">{feedback.hint.texto}</p>
            </aside>
          )}
          {feedback.revealed && (
            <div className="rounded-xl border p-4">
              <h3 className="font-bold">Respuestas correctas</h3>
              {node.opciones
                .filter((option) => option.correcta)
                .map((option) => (
                  <p key={option.id} className="mt-2">
                    {option.texto}
                  </p>
                ))}
            </div>
          )}
          {feedback.canContinue && (
            <aside className="rounded-xl bg-[var(--primary-soft)] p-4">
              <h3 className="font-bold">Para recordar</h3>
              <p className="mt-2 leading-7">{node.explicacion}</p>
            </aside>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PreviousButton onClick={onBack} disabled={backDisabled} />
            <Button
              className="min-h-11"
              onClick={() =>
                feedback.canContinue ? onContinue() : (setFeedback(undefined), setSelected([]))
              }
            >
              {feedback.canContinue ? 'Continuar' : 'Volver a intentarlo'} <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
function PreviousButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <Button variant="outline" className="min-h-11" onClick={onClick} disabled={disabled}>
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
