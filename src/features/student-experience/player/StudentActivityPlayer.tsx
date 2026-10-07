import { useEffect, useMemo, useRef, useState } from 'react'
import { modoApi } from '@/features/servidor/config'
import { completarActividad } from '@/features/servidor/acciones'
import { actividadServidor, textoBloqueo } from '@/features/servidor/adaptadores'
import { mensajeErrorServidor, obtenerEstadoServidor } from '@/features/servidor/estadoServidor'
import type { RespuestaCompletarActividad } from '@/features/servidor/tipos'
import { catalog } from '@/features/missions/content'
import {
  applyCompletion,
  isActivityComplete,
  nextPendingNode,
  studentId,
  visibleNodes,
  type JourneyState,
} from '@/features/missions/logic'
import type { Actividad, Nodo, NodoDialogo } from '@/features/missions/model'
import { getJourneySnapshot, updateJourney, useJourney, useJourneyError } from '@/features/missions/store'
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
import { prepareActivity } from '../reflection/personalization'

export function StudentActivityPlayer({
  activity,
  imageUrl,
  direct = false,
  edit = false,
  onClose,
}: {
  activity: Actividad
  imageUrl?: string
  direct?: boolean
  edit?: boolean
  onClose: () => void
}) {
  const state = useJourney()
  useEffect(() => {
    void prepareActivity(activity)
  }, [activity])
  const storageError = useJourneyError()
  const nodes = useMemo(() => visibleNodes(activity, direct), [activity, direct])
  const pageRef = useRef<HTMLDivElement>(null)
  const [nodeId, setNodeId] = useState(() => {
    if (edit) return nodes[0]?.id
    if (modoApi && actividadServidor(obtenerEstadoServidor().estado, activity.id)?.estado === 'COMPLETADA')
      return undefined
    return nextPendingNode(activity, state, direct)?.id ?? (modoApi ? nodes.at(-1)?.id : undefined)
  })
  const enviando = useRef(false)
  const montado = useRef(true)
  const confirmacion = useRef<RespuestaCompletarActividad | undefined>(undefined)
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const [cierreServidor, setCierreServidor] = useState<RespuestaCompletarActividad>()
  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])
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
                estado: modoApi ? 'no_iniciada' : 'en_curso',
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
    if (modoApi || node?.tipo !== 'diapositiva') return
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
    if (enviando.current) return
    const saved = updateJourney((current) => {
      const changed = transform(current)
      const nextState: JourneyState = {
        ...changed,
        progress: {
          ...changed.progress,
          [activity.id]: {
            ...changed.progress[activity.id],
            estudianteId: studentId,
            actividadId: activity.id,
            estado: changed.progress[activity.id]?.estado ?? (modoApi ? 'no_iniciada' : 'en_curso'),
            nodoActualId: next?.id ?? (modoApi ? nodeId : '$fin'),
          },
        },
      }
      return modoApi ? nextState : applyCompletion(activity, nextState)
    })
    if (saved && modoApi && !next) {
      const actual = getJourneySnapshot()
      const candidato = {
        ...actual,
        progress: {
          ...actual.progress,
          [activity.id]: { ...actual.progress[activity.id], nodoActualId: '$fin' },
        },
      }
      if (!confirmacion.current && !isActivityComplete(activity, candidato)) {
        setErrorServidor('Completa las respuestas y comprobaciones pendientes antes de cerrar la actividad.')
        return
      }
      // Único punto que informa $fin, tanto la primera vez como al repetir.
      enviando.current = true
      setGuardando(true)
      setErrorServidor('')
      void (async () => {
        try {
          const respuesta = await completarActividad(activity.id, confirmacion.current)
          if (respuesta.tipo === 'guardado_sin_refrescar') confirmacion.current = respuesta.datos
          if (!montado.current) return
          if (respuesta.tipo === 'ok') {
            setCierreServidor(respuesta.datos)
            updateJourney((current) => ({
              ...current,
              progress: {
                ...current.progress,
                [activity.id]: { ...current.progress[activity.id], nodoActualId: '$fin' },
              },
            }))
            setNodeId(undefined)
            setReactions(response)
          } else if (respuesta.tipo === 'bloqueado')
            setErrorServidor(textoBloqueo(respuesta.detalle, obtenerEstadoServidor().estado))
          else if (respuesta.tipo === 'guardado_sin_refrescar')
            setErrorServidor(
              'La actividad se guardó, pero no se pudo actualizar el camino. Reintenta la consulta.',
            )
          else
            setErrorServidor(
              respuesta.tipo === 'sin_conexion'
                ? 'No se pudo guardar en el servidor'
                : mensajeErrorServidor(respuesta),
            )
        } catch {
          if (montado.current) setErrorServidor('No se pudo guardar en el servidor')
        } finally {
          enviando.current = false
          if (montado.current) setGuardando(false)
        }
      })()
      return
    }
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
            readResourceIds: [
              ...new Set([
                ...(current.readResourceIds ?? current.resources),
                ...(node.recursoIds ?? []).filter((id) =>
                  catalog.recursos.some((r) => r.id === id && r.tipo === 'ficha'),
                ),
              ]),
            ],
            resources: modoApi
              ? current.resources
              : [
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
        nuevoMomento={node?.nuevoMomento}
        onClose={() => {
          if (!enviando.current) onClose()
        }}
      />
      {storageError && (
        <p className="sx-player-error" role="alert">
          {storageError}
        </p>
      )}
      {guardando && (
        <p className="sx-player-error" role="status">
          Guardando la actividad en el servidor…
        </p>
      )}
      {errorServidor && (
        <div className="sx-player-error" role="alert">
          <p>{errorServidor}</p>
          <button
            type="button"
            className="sx-primary-button"
            disabled={guardando}
            onClick={() => move(undefined)}
          >
            Reintentar{confirmacion.current ? ' consulta' : ''}
          </button>
        </div>
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
            activity={activity}
            onClose={onClose}
            onResources={openResources}
            desbloqueosServidor={cierreServidor?.nuevos_desbloqueos}
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
