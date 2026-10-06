import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, KeyRound, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ForestFireCaseTopBar } from '../occupation-exploration/components/ForestFireCaseTopBar'
import { activities, catalog, tipActivityIds } from './content'
import {
  applyCompletion,
  calculateResult,
  evaluateQuestion,
  nextPendingNode,
  studentId,
  visibleNodes,
  type JourneyState,
} from './logic'
import type { Actividad, Nodo, NodoDialogo, NodoPregunta } from './model'
import { updateJourney, useJourney, useJourneyError } from './store'
import { Character, ContentBlocks, ResourceCards } from './JourneyContent'
import { JourneyMatrix, SubmissionForm } from './JourneyRecord'

function Question({
  activity,
  node,
  onContinue,
  fresh = false,
}: {
  activity: Actividad
  node: NodoPregunta
  onContinue: () => void
  fresh?: boolean
}) {
  const state = useJourney()
  const prior = state.attempts.filter(
    (attempt) => attempt.actividadId === activity.id && attempt.nodoId === node.id,
  )
  const last = fresh ? undefined : prior.at(-1)
  const [selected, setSelected] = useState<string[]>(last?.opcionIds ?? [])
  const [feedback, setFeedback] = useState(
    last ? evaluateQuestion(node, last.opcionIds, prior.length - 1) : undefined,
  )
  function answer(ids: string[]) {
    const outcome = evaluateQuestion(node, ids, prior.filter((attempt) => !attempt.correcta).length)
    if (
      updateJourney((current) => ({
        ...current,
        attempts: [
          ...current.attempts,
          {
            estudianteId: studentId,
            actividadId: activity.id,
            nodoId: node.id,
            opcionIds: ids,
            correcta: outcome.correct,
            revelada: outcome.revealed,
            numeroIntento: prior.length + 1,
            respondidaEn: new Date().toISOString(),
          },
        ],
      }))
    ) {
      setSelected(ids)
      setFeedback(outcome)
    }
  }
  return (
    <>
      <Character id={node.hablanteId} />
      <h2 className="journey-prompt">{node.enunciado}</h2>
      <div className="journey-options">
        {node.opciones.map((option) => {
          const isSelected = selected.includes(option.id)
          const isCorrectAnswer = feedback?.correct && isSelected
          const isIncorrectAnswer = feedback && !feedback.correct && isSelected
          const isRevealedAnswer = feedback?.revealed && option.correcta
          return (
            <button
              key={option.id}
              disabled={!!feedback}
              className={`journey-option ${isSelected && !feedback ? 'is-selected' : ''} ${isCorrectAnswer ? 'is-correct' : ''} ${isIncorrectAnswer ? 'is-incorrect' : ''} ${isRevealedAnswer ? 'is-revealed' : ''}`}
              aria-pressed={selected.includes(option.id)}
              onClick={() =>
                node.formato === 'opcion_multiple'
                  ? setSelected(
                      selected.includes(option.id)
                        ? selected.filter((id) => id !== option.id)
                        : [...selected, option.id],
                    )
                  : answer([option.id])
              }
            >
              <span className="journey-option-marker">
                {isCorrectAnswer || isRevealedAnswer ? '✓' : isIncorrectAnswer ? '×' : isSelected ? '●' : '○'}
              </span>
              {option.texto}
            </button>
          )
        })}
      </div>
      {!feedback && node.formato === 'opcion_multiple' && (
        <Button disabled={!selected.length} onClick={() => answer(selected)}>
          Confirmar selección
        </Button>
      )}
      {feedback && (
        <div className={`journey-feedback ${feedback.correct ? 'is-correct' : 'is-incorrect'}`} role="status">
          {node.opciones
            .filter((option) => selected.includes(option.id))
            .map((option) => (
              <p key={option.id}>{option.retroalimentacion}</p>
            ))}
          {feedback.canContinue && <p className="mt-4 font-medium">{node.explicacion}</p>}
          {feedback.hint && (
            <div className="mt-5">
              <Character id={feedback.hint.hablanteId} small />
              <p className="mt-2">{feedback.hint.texto}</p>
            </div>
          )}
          <Button
            className={`mt-5 ${!feedback.canContinue ? 'journey-retry-button' : ''}`}
            onClick={() => (feedback.canContinue ? onContinue() : (setFeedback(undefined), setSelected([])))}
          >
            {feedback.canContinue ? 'Continuar el camino' : 'Volver a intentarlo'}
            <ArrowRight />
          </Button>
        </div>
      )}
    </>
  )
}

export function JourneyPlayer({
  activity,
  direct = false,
  edit = false,
  onClose,
  onNext,
}: {
  activity: Actividad
  direct?: boolean
  edit?: boolean
  onClose: () => void
  onNext: (id: string) => void
}) {
  const state = useJourney()
  const storageError = useJourneyError()
  const nodes = useMemo(() => visibleNodes(activity, direct), [activity, direct])
  const pageRef = useRef<HTMLDivElement>(null)
  const [nodeId, setNodeId] = useState(() =>
    edit ? nodes[0]?.id : nextPendingNode(activity, state, direct)?.id,
  )
  const [reactions, setReactions] = useState<NodoDialogo[]>([])
  const [resourceOpen, setResourceOpen] = useState(false)
  const node = nodes.find((node) => node.id === nodeId)
  const index = node ? nodes.indexOf(node) : nodes.length
  const matrix = activity.plantilla?.tipo === 'matriz' && node?.tipo === 'consigna'
  const reaction = reactions[0]
  useEffect(() => {
    updateJourney((current) =>
      current.progress[activity.id]
        ? current
        : {
            ...current,
            progress: {
              ...current.progress,
              [activity.id]: {
                estudianteId: studentId,
                actividadId: activity.id,
                estado: 'en_curso',
                iniciadaEn: new Date().toISOString(),
                nodoActualId: nodes[0]?.id,
              },
            },
          },
    )
  }, [activity.id, nodes])
  useEffect(() => {
    pageRef.current?.scrollIntoView({ block: 'start' })
    setResourceOpen(false)
  }, [nodeId])
  useEffect(() => {
    if (node?.tipo !== 'diapositiva') return
    const sheets = (node.recursoIds ?? []).filter((id) =>
      catalog.recursos.some(
        (resource) => resource.id === id && resource.tipo === 'ficha' && resource.guardableEnRecursos,
      ),
    )
    if (sheets.some((id) => !state.resources.includes(id)))
      updateJourney((current) => ({ ...current, resources: [...new Set([...current.resources, ...sheets])] }))
  }, [node, state.resources])

  function move(
    next: Nodo | undefined,
    transform: (current: JourneyState) => JourneyState = (current) => current,
    response: NodoDialogo[] = [],
  ) {
    const saved = updateJourney((current) => {
      const changed = transform(current)
      return applyCompletion(activity, {
        ...changed,
        progress: {
          ...changed.progress,
          [activity.id]: {
            ...changed.progress[activity.id],
            estudianteId: studentId,
            actividadId: activity.id,
            estado: changed.progress[activity.id]?.estado ?? 'en_curso',
            nodoActualId: next?.id ?? '$fin',
          },
        },
      })
    })
    if (saved) {
      setNodeId(next?.id)
      setReactions(response)
    }
  }
  function advance() {
    move(nodes[index + 1], (current) =>
      node?.tipo === 'diapositiva'
        ? {
            ...current,
            resources: [
              ...new Set([
                ...current.resources,
                ...(node.recursoIds ?? []).filter((id) =>
                  catalog.recursos.some(
                    (resource) =>
                      resource.id === id && resource.tipo === 'ficha' && resource.guardableEnRecursos,
                  ),
                ),
              ]),
            ],
          }
        : current,
    )
  }
  function itemResponse(value: string | number) {
    if (node?.tipo !== 'item') return
    move(
      nodes[index + 1],
      (current) => ({
        ...current,
        items: [
          ...current.items.filter(
            (answer) =>
              !(
                answer.instrumentoId === node.instrumentoId &&
                answer.itemId === node.itemId &&
                answer.aplicacion === 'unica'
              ),
          ),
          {
            estudianteId: studentId,
            instrumentoId: node.instrumentoId,
            itemId: node.itemId,
            aplicacion: 'unica',
            valor: value,
            actividadId: activity.id,
            respondidaEn: new Date().toISOString(),
          },
        ],
      }),
      direct ? [] : (node.reacciones?.[String(value)] ?? []),
    )
  }
  const item =
    node?.tipo === 'item'
      ? catalog.instrumentos
          .find((instrument) => instrument.id === node.instrumentoId)
          ?.items.find((item) => item.id === node.itemId)
      : undefined
  const existingItemAnswer =
    node?.tipo === 'item'
      ? state.items.find(
          (answer) =>
            answer.instrumentoId === node.instrumentoId &&
            answer.itemId === node.itemId &&
            answer.aplicacion === 'unica',
        )
      : undefined
  const itemOptions =
    item?.formato.tipo === 'si_no'
      ? Object.entries(item.formato.etiquetas).map(([value, text]) => ({ value, text }))
      : item?.formato.tipo === 'likert'
        ? Array.from({ length: item.formato.puntos }, (_, i) => ({
            value: i + 1,
            text: item.formato.tipo === 'likert' ? (item.formato.etiquetas[i] ?? String(i + 1)) : '',
          }))
        : item?.formato.tipo === 'opcion_unica'
          ? item.formato.opciones.map((option) => ({ value: option.valor, text: option.texto }))
          : []
  const nextActivity = activities.find((next) => next.id === activity.siguienteSugerida)
  const progress = node ? ((index + 1) / nodes.length) * 100 : 100
  return (
    <div
      ref={pageRef}
      className={`fixed inset-0 z-40 min-h-svh overflow-hidden bg-[#edf1e7] text-[#243d33] location-${activity.id}`}
    >
      <ForestFireCaseTopBar
        contextLabel={activity.ubicacion ?? getActivityTypeLabel(activity)}
        exitCancelLabel="Seguir en la actividad"
        exitConfirmLabel="Volver al mapa"
        exitDescription="Tu avance ya está guardado. Podrás retomar la actividad desde este punto."
        exitMode="saved"
        exitTitle="¿Quieres volver al mapa?"
        label={node ? activity.titulo : 'Actividad completada'}
        onClose={onClose}
        progress={progress}
        userRole="Explorador en actividad"
      />
      <div className="mission-player-scroll h-[calc(100svh-5.25rem)] overflow-y-auto">
        {storageError && (
          <p className="journey-error" role="alert">
            {storageError}
          </p>
        )}
        <main className="mission-player-shell mx-auto min-h-full max-w-[1080px] px-4 py-5 lg:px-7 lg:py-7">
          <section
            className={`relative min-h-[620px] min-w-0 overflow-hidden rounded-[30px] border border-white/80 bg-[#f9f8f1] p-5 shadow-[0_24px_80px_rgb(48_75_61/14%)] sm:p-8 ${matrix && !reaction ? 'lg:col-span-1' : ''}`}
          >
            <div
              aria-hidden="true"
              className="mission-player-scenery absolute inset-x-0 top-0 h-32 opacity-40"
            />
            <div className="relative z-10 mx-auto mt-20 max-w-4xl rounded-[26px] border border-[#d8dece] bg-[#fffdf8] p-5 shadow-[0_20px_50px_rgb(45_70_57/13%)] sm:p-7">
              {reaction ? (
                <>
                  <Character key={reaction.id} id={reaction.hablanteId} expression={reaction.expresion} />
                  <p className="journey-dialogue">{reaction.texto}</p>
                  <div className="journey-actions">
                    <span>Escucha, a tu ritmo.</span>
                    <Button onClick={() => setReactions(reactions.slice(1))}>
                      Continuar
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              ) : !node ? (
                <div className="journey-finish">
                  <div className="journey-finish-icon">
                    <Sparkles />
                  </div>
                  <p className="journey-eyebrow">UNA NUEVA HUELLA EN EL CAMINO</p>
                  <h2>
                    {state.progress[activity.id]?.estado === 'completada'
                      ? 'Este hallazgo viaja contigo.'
                      : 'Tu avance queda guardado.'}
                  </h2>
                  <p>{activity.recompensa?.mensajeFin}</p>
                  {activity.recompensa?.piezaLlave && (
                    <p className="journey-reward">
                      <KeyRound />
                      {
                        catalog.piezasLlave.find((piece) => piece.id === activity.recompensa?.piezaLlave)
                          ?.nombre
                      }
                    </p>
                  )}
                  {activity.promptDiario && <blockquote>{activity.promptDiario}</blockquote>}
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button variant="outline" onClick={onClose}>
                      Volver a la travesía
                    </Button>
                    {nextActivity && (
                      <Button onClick={() => onNext(nextActivity.id)}>
                        Seguir hacia {nextActivity.ubicacion ?? nextActivity.titulo}
                        <ArrowRight />
                      </Button>
                    )}
                    {!nextActivity && activity.siguienteSugerida === 'act-07' && (
                      <Button onClick={() => onNext('act-07')}>
                        Revisar mis propias creencias
                        <ArrowRight />
                      </Button>
                    )}
                  </div>
                  {activity.id === 'act-tip-01' && (
                    <p className="mt-6 text-sm text-muted-foreground">
                      Has recorrido 1 de 14 encuentros. Las próximas voces de la aldea estarán disponibles
                      cuando orientación las prepare.
                    </p>
                  )}
                </div>
              ) : matrix ? (
                <JourneyMatrix
                  activity={activity}
                  onContinue={() => {
                    const last = nodes.findLastIndex((node) => node.tipo === 'consigna')
                    move(nodes[last + 1])
                  }}
                />
              ) : node.tipo === 'dialogo' ? (
                <>
                  <Character key={node.id} id={node.hablanteId} expression={node.expresion} />
                  <p className="journey-dialogue">{node.texto}</p>
                  <div className="journey-actions">
                    <span>Una conversación, un paso más.</span>
                    <Button onClick={advance}>
                      Continuar
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              ) : node.tipo === 'eleccion' ? (
                <>
                  <p className="journey-eyebrow">TU VOZ TAMBIÉN CUENTA</p>
                  <h2 className="journey-prompt">¿Qué le dirías?</h2>
                  <div className="journey-options">
                    {node.opciones.map((option) => (
                      <button
                        key={option.id}
                        className="journey-option"
                        onClick={() =>
                          move(
                            nodes[index + 1],
                            (current) =>
                              node.registrar
                                ? {
                                    ...current,
                                    choices: [
                                      ...current.choices.filter(
                                        (choice) =>
                                          !(choice.actividadId === activity.id && choice.nodoId === node.id),
                                      ),
                                      {
                                        estudianteId: studentId,
                                        actividadId: activity.id,
                                        nodoId: node.id,
                                        opcionId: option.id,
                                        respondidaEn: new Date().toISOString(),
                                      },
                                    ],
                                  }
                                : current,
                            option.reaccion,
                          )
                        }
                      >
                        {option.texto}
                        <ArrowRight size={18} />
                      </button>
                    ))}
                  </div>
                </>
              ) : node.tipo === 'diapositiva' ? (
                <>
                  <div className="journey-slide-heading">
                    <p className="journey-eyebrow">UNA PISTA PARA TU CAMINO</p>
                    {node.presentadorId && <Character id={node.presentadorId} small />}
                  </div>
                  <h2 className="journey-prompt">{node.titulo}</h2>
                  <ContentBlocks blocks={node.bloques} />
                  {node.mediaUrl && (
                    <img src={node.mediaUrl} alt={node.titulo} className="mt-4 max-w-full rounded-xl" />
                  )}
                  <div className="journey-actions">
                    {node.recursoIds?.length ? (
                      <Button variant="outline" onClick={() => setResourceOpen(!resourceOpen)}>
                        Profundizar
                      </Button>
                    ) : (
                      <span>Detente el tiempo que necesites.</span>
                    )}
                    <Button onClick={advance}>
                      Entendido
                      <ArrowRight />
                    </Button>
                  </div>
                  {resourceOpen && (
                    <div className="mt-5">
                      <ResourceCards ids={node.recursoIds ?? []} />
                    </div>
                  )}
                </>
              ) : node.tipo === 'pregunta' ? (
                <Question
                  key={node.id}
                  activity={activity}
                  node={node}
                  onContinue={advance}
                  fresh={edit && activity.tipo === 'encuentro'}
                />
              ) : node.tipo === 'item' ? (
                <>
                  {!direct && <Character id={node.hablanteId} />}
                  <p className="journey-eyebrow mt-6">{node.etiqueta ?? 'Para conocerte mejor:'}</p>
                  <h2 className="journey-prompt">{item?.texto ?? 'Este ítem aún no está disponible.'}</h2>
                  <div className="journey-options item-options">
                    {itemOptions.map((option) => (
                      <button
                        className={`journey-option ${existingItemAnswer?.valor === option.value ? 'is-selected' : ''}`}
                        key={option.value}
                        onClick={() => itemResponse(option.value)}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hay respuestas correctas o incorrectas. Elige lo que se parezca a ti.
                  </p>
                  {existingItemAnswer && (
                    <Button className="mt-4" variant="outline" onClick={advance}>
                      Mantener mi respuesta y continuar <ArrowRight />
                    </Button>
                  )}
                </>
              ) : node.tipo === 'consigna' ? (
                <>
                  {node.hablanteId && <Character id={node.hablanteId} />}
                  <div className="mt-6">
                    <SubmissionForm
                      key={node.id}
                      activity={activity}
                      node={node}
                      onSaved={advance}
                      onKeep={advance}
                    />
                  </div>
                  {!node.obligatoria && (
                    <Button className="mt-3" variant="ghost" onClick={advance}>
                      Dejar para después
                    </Button>
                  )}
                </>
              ) : (
                <ResultReveal activity={activity} instrumentId={node.instrumentoId} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function getActivityTypeLabel(activity: Actividad) {
  if (activity.tipo === 'encuentro') return 'Actividad informativa'
  if (activity.tipo === 'registro') return 'Actividad de registro'
  return 'Test'
}
function ResultReveal({ activity, instrumentId }: { activity: Actividad; instrumentId: string }) {
  const state = useJourney()
  const instrument = catalog.instrumentos.find((item) => item.id === instrumentId)
  const result = state.results.find((result) => result.instrumentoId === instrumentId)
  useEffect(() => {
    if (!instrument || result) return
    const calculated = calculateResult(instrument, state, tipActivityIds)
    if (calculated)
      updateJourney((current) =>
        applyCompletion(activity, { ...current, results: [...current.results, calculated] }),
      )
  }, [activity, instrument, result, state])
  return (
    <>
      <Character id="elena" />
      <h2 className="journey-prompt">Las pistas que hablan de ti</h2>
      {result ? (
        result.puntajes.map((score) => (
          <p key={score.dimensionId}>
            {instrument?.clave.dimensiones.find((dim) => dim.id === score.dimensionId)?.nombre}:{' '}
            {score.puntaje}
          </p>
        ))
      ) : (
        <p>
          Elena te espera al completar los 14 encuentros y cuando esté disponible la clave oficial del
          instrumento.
        </p>
      )}
    </>
  )
}
