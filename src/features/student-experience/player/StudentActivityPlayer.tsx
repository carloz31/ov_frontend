import { useEffect, useMemo, useRef, useState } from 'react'
import { activities, catalog } from '@/features/missions/content'
import {
  applyCompletion,
  nextPendingNode,
  studentId,
  visibleNodes,
  type JourneyState,
} from '@/features/missions/logic'
import type { Actividad, Nodo, NodoDialogo } from '@/features/missions/model'
import { updateJourney, useJourney, useJourneyError } from '@/features/missions/store'
import { DialogueBox } from './DialogueBox'
import { PlayerAmbient } from './PlayerAmbient'
import { PlayerTopBar } from './PlayerTopBar'
import { ResourceSheet } from './ResourceSheet'
import { FinishScreen } from './FinishScreen'
import { ChoiceNode } from './nodes/ChoiceNode'
import { SlideNode } from './nodes/SlideNode'
import { QuestionNode } from './nodes/QuestionNode'
import { ItemNode } from './nodes/ItemNode'
import { SubmissionNode } from './nodes/SubmissionNode'
import { MatrixNode } from './nodes/MatrixNode'
import { ResultNode } from './nodes/ResultNode'

export function StudentActivityPlayer({
  activity,
  imageUrl,
  direct = false,
  edit = false,
  onClose,
  onNext,
  nextActivityOverride,
}: {
  activity: Actividad
  imageUrl?: string
  nextActivityOverride?: Actividad | null
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
  const [resourceIds, setResourceIds] = useState<string[]>([])
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
  const nextActivity =
    nextActivityOverride === undefined
      ? activities.find((next) => next.id === activity.siguienteSugerida)
      : (nextActivityOverride ?? undefined)
  const progress = node ? ((index + 1) / nodes.length) * 100 : 100
  function openResources(ids: string[]) {
    setResourceIds(ids)
    setResourceOpen(true)
  }
  const previous = nodes[index - 1]
  const mode = !reaction && (!node || matrix || node.tipo === 'consigna') ? 'sunrise' : 'night'
  return (
    <div
      ref={pageRef}
      className={`fixed inset-0 z-40 sx-root sx-player location-${activity.id}`}
      data-ambient={mode}
    >
      <PlayerAmbient mode={mode} imageUrl={imageUrl} />
      <PlayerTopBar
        activity={activity}
        finished={!node && !reaction}
        index={index}
        total={nodes.length}
        progress={progress}
        onClose={onClose}
      />
      {storageError && (
        <p className="sx-player-error" role="alert">
          {storageError}
        </p>
      )}
      <main className="sx-player-stage">
        {reaction ? (
          <div className="sx-player-scene">
            <div className="sx-scene-space" />
            <DialogueBox
              key={reaction.id}
              speakerId={reaction.hablanteId}
              text={reaction.texto}
              hint="Escucha, a tu ritmo."
              onContinue={() => setReactions(reactions.slice(1))}
            />
          </div>
        ) : !node ? (
          <FinishScreen
            allowLegacySuggestion={nextActivityOverride === undefined}
            activity={activity}
            nextActivity={nextActivity}
            onClose={onClose}
            onNext={onNext}
          />
        ) : matrix ? (
          <MatrixNode
            activity={activity}
            onContinue={() => {
              const last = nodes.findLastIndex((node) => node.tipo === 'consigna')
              move(nodes[last + 1])
            }}
          />
        ) : node.tipo === 'dialogo' ? (
          <div className="sx-player-scene">
            <div className="sx-scene-space" />
            <DialogueBox
              key={node.id}
              speakerId={node.hablanteId}
              text={node.texto}
              hint="Una conversación, un paso más."
              onContinue={advance}
            />
          </div>
        ) : node.tipo === 'eleccion' ? (
          <ChoiceNode
            node={node}
            previous={previous?.tipo === 'dialogo' ? previous : undefined}
            onChoose={(option) =>
              move(
                nodes[index + 1],
                (current) =>
                  node.registrar
                    ? {
                        ...current,
                        choices: [
                          ...current.choices.filter(
                            (choice) => !(choice.actividadId === activity.id && choice.nodoId === node.id),
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
          />
        ) : node.tipo === 'diapositiva' ? (
          <SlideNode node={node} onContinue={advance} onResources={openResources} />
        ) : node.tipo === 'pregunta' ? (
          <QuestionNode
            key={node.id}
            activity={activity}
            node={node}
            onContinue={advance}
            fresh={edit && activity.tipo === 'encuentro'}
            onResources={openResources}
          />
        ) : node.tipo === 'item' ? (
          <ItemNode
            key={node.id}
            node={node}
            text={item?.texto ?? 'Este ítem aún no está disponible.'}
            options={itemOptions}
            existing={existingItemAnswer}
            direct={direct}
            onAnswer={itemResponse}
            onContinue={advance}
          />
        ) : node.tipo === 'consigna' ? (
          <div className="sx-card-stage">
            <section className="sx-glass sx-player-card sx-submission-card case-scrollbar">
              <SubmissionNode
                key={node.id}
                activity={activity}
                node={node}
                onSaved={advance}
                onKeep={advance}
                edit={edit}
              />
              {!node.obligatoria && (
                <button type="button" className="sx-secondary-button" onClick={advance}>
                  Dejar para después
                </button>
              )}
            </section>
          </div>
        ) : (
          <div className="sx-card-stage">
            <section className="sx-glass-dark sx-player-card sx-result-card case-scrollbar">
              <ResultNode activity={activity} instrumentId={node.instrumentoId} />
            </section>
          </div>
        )}
      </main>
      <ResourceSheet open={resourceOpen} ids={resourceIds} onClose={() => setResourceOpen(false)} />
    </div>
  )
}
