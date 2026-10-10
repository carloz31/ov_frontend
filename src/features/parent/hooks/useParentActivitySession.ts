import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { catalog } from '@/data/activities/content'
import type { Actividad, IntentoPregunta } from '@/types/activities'

import { parentActivities } from '@/features/parent/data/parentPortal'
import { parentRoute } from '@/features/parent/lib/selectors'
import {
  advanceParentActivity,
  completedParentActivities,
  nextParentPendingNode,
  retreatParentActivity,
  startParentActivity,
} from '@/features/parent/lib/missionLogic'
import {
  parentAccountId,
  updateParentJourney,
  useParentJourney,
  useParentJourneyError,
} from '@/store/parentJourneyStore'

type PracticeAttempt = Pick<IntentoPregunta, 'opcionIds' | 'correcta' | 'revelada' | 'numeroIntento'>
export function useParentActivitySession(activity: Actividad, review: boolean) {
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
  return {
    activity,
    review,
    navigate,
    error,
    optionId,
    setOptionId,
    resources,
    setResources,
    practice,
    setPractice,
    entrance,
    celebrate,
    heading,
    resourceTrigger,
    node,
    index,
    steps,
    step,
    selected,
    summary,
    completedIds,
    route,
    summaryResources,
    advance,
    back,
  }
}
