import { useEffect, useMemo, useRef, useState } from 'react'
import { modoApi } from '@/config/env'
import { completarActividad } from '@/store/servidor/operaciones'
import { actividadServidor, textoBloqueo } from '@/lib/servidor/adaptadores'
import { mensajeErrorServidor, obtenerEstadoServidor } from '@/store/servidor/estadoServidor'
import type { RespuestaCompletarActividad } from '@/types/servidor'
import type { InstrumentoServidor } from '@/features/activities/components/MaraInteractionPlayer'
import { catalog } from '@/data/activities/content'
import {
  applyCompletion,
  isActivityComplete,
  nextPendingNode,
  studentId,
  visibleNodes,
} from '@/lib/activities/logic'
import type { JourneyState } from '@/types/activities'
import type { Actividad, Nodo, NodoDialogo } from '@/types/activities'
import { getJourneySnapshot, updateJourney, useJourney, useJourneyError } from '@/store/journeyStore'

import { prepareActivity } from '@/features/activities/lib/reflection/personalization'

import { useInstrumentResponses } from './useInstrumentResponses'
export function useActivityCompletion({
  activity,
  direct = false,
  edit = false,
  instrumentoServidor,
  onClose,
}: {
  activity: Actividad
  direct?: boolean
  edit?: boolean
  instrumentoServidor?: InstrumentoServidor
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
    if (modoApi && instrumentoServidor) return instrumentoServidor.nodoInicialId
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
  const node = nodes.find((node) => node.id === nodeId)
  const index = node ? nodes.indexOf(node) : nodes.length
  const {
    respuestasConfirmadas,
    soloLectura,
    revisionInstrumento,
    respuestaPendiente,
    itemResponse,
    item,
    itemServidor,
    valorServidor,
    existingItemAnswer,
    itemOptions,
  } = useInstrumentResponses({
    activity,
    instrumentoServidor,
    direct,
    node,
    nodes,
    index,
    state,
    enviando,
    montado,
    setGuardando,
    setErrorServidor,
    move,
  })
  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])
  const [reactions, setReactions] = useState<NodoDialogo[]>([])
  const [resourceOpen, setResourceOpen] = useState(false)
  const [resourceIds, setResourceIds] = useState<string[]>([])
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
    if (modoApi && revisionInstrumento && !next) {
      onClose()
      return
    }
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
      const completa = instrumentoServidor
        ? instrumentoServidor.items.every((item) => respuestasConfirmadas.current[item.codigo] !== undefined)
        : isActivityComplete(activity, candidato)
      if (!confirmacion.current && !completa) {
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
  const progress = node ? ((index + 1) / nodes.length) * 100 : 100
  function openResources(ids: string[]) {
    setResourceIds(ids)
    setResourceOpen(true)
  }
  const previous = nodes[index - 1]
  const mode: 'sunrise' | 'night' = !reaction && (!node || matrix || node.tipo === 'consigna') ? 'sunrise' : 'night'
  return {
    pageRef,
    mode,
    nodes,
    index,
    progress,
    node,
    reaction,
    reactions,
    setReactions,
    matrix,
    previous,
    enviando,
    storageError,
    guardando,
    errorServidor,
    respuestaPendiente,
    itemResponse,
    soloLectura,
    advance,
    move,
    confirmacion,
    cierreServidor,
    openResources,
    itemServidor,
    item,
    itemOptions,
    valorServidor,
    existingItemAnswer,
    setErrorServidor,
    revisionInstrumento,
    resourceOpen,
    resourceIds,
    setResourceOpen,
    itemOcupado: modoApi && guardando,
    itemSoloLectura: modoApi && soloLectura,
    puedeTerminarEncuentro: modoApi && !!instrumentoServidor,
  }
}
