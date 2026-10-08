import { useEffect, useState } from 'react'
import { modoApi } from '@/config/env'
import {
  consultarItems,
  consultarProgreso,
  mensajeErrorServidor,
  useEstadoServidor,
} from '@/store/servidor/estadoServidor'
import { textoRequisito } from '@/lib/servidor/adaptadores'
import { actividadServidor } from '@/lib/servidor/adaptadores'

import type { JourneyState } from '@/types/activities'
import { canAccessCity } from '@/store/adventureStore'
import type { AdventureState } from '@/types/adventure'

import {
  getPointDetails,
  getRecommendedPoint,
  getZoneProgress,
  type PointDetails,
  type StudentMapPoint,
  type StudentZone,
} from '@/features/adventure/lib/mapPoints'

export function useMapScreen({
  zone,
  points,
  adventure,
  journey,
  selectedId,
}: {
  zone: StudentZone
  points: StudentMapPoint[]
  adventure: AdventureState
  journey: JourneyState
  selectedId?: string
}) {
  const servidor = useEstadoServidor()
  const [detalleServidor, setDetalleServidor] = useState<{
    clave: string
    requirement?: string
    description?: string
    error?: boolean
  }>()
  const [intentoRequisito, setIntentoRequisito] = useState(0)
  const cityOpen = canAccessCity(adventure)
  const locked = zone === 'central' && !cityOpen
  const recommended = getRecommendedPoint(points)
  const progress = getZoneProgress(zone, adventure, journey)
  const selected = points.find((point) => point.id === selectedId)
  const baseDetails = selected ? getPointDetails(selected, adventure, journey) : undefined
  const claveDetalle = `${servidor.estado?.cuenta.codigo}/${selected?.id}/${selected?.specActivityId}/${selected?.status}`
  const details =
    baseDetails && detalleServidor?.clave === claveDetalle
      ? { ...baseDetails, ...detalleServidor }
      : baseDetails
  const selectedPointId = selected?.id
  const selectedActivityId = selected?.specActivityId
  const selectedStatus = selected?.status
  const selectedZone = selected?.zone
  useEffect(() => {
    if (!modoApi || !selectedPointId) return
    let vigente = true
    const consultaRequisito =
      selectedStatus === 'locked' &&
      (selectedPointId === 'city' || !!actividadServidor(servidor.estado, selectedActivityId ?? ''))
    setDetalleServidor({
      clave: claveDetalle,
      ...(consultaRequisito ? { requirement: 'Consultando el requisito en el servidor…' } : {}),
    })
    void (async () => {
      const [requirement, items] = await Promise.all([
        consultaRequisito
          ? consultarProgreso(
              selectedPointId === 'city' ? 'BLOQUE' : 'ACTIVIDAD',
              selectedPointId === 'city' ? 'CIUDAD' : (selectedActivityId ?? ''),
            )
          : undefined,
        selectedPointId === 'mara-test' && selectedActivityId
          ? consultarItems(selectedActivityId)
          : undefined,
      ])
      if (!vigente) return
      setDetalleServidor({
        clave: claveDetalle,
        ...(requirement
          ? {
              requirement:
                requirement.tipo === 'ok'
                  ? textoRequisito(requirement.datos, servidor.estado)
                  : mensajeErrorServidor(requirement),
              error: requirement.tipo !== 'ok',
            }
          : {}),
        ...(items
          ? {
              description:
                items.tipo === 'ok'
                  ? `Conversa con Mara y responde ${items.datos.length} ítems en esta interacción. No hay respuestas correctas o incorrectas.`
                  : mensajeErrorServidor(items),
            }
          : {}),
      })
    })()
    return () => {
      vigente = false
    }
  }, [
    claveDetalle,
    servidor.estado,
    selectedPointId,
    selectedActivityId,
    selectedStatus,
    selectedZone,
    intentoRequisito,
  ])

  return {
    cityOpen,
    locked,
    recommended,
    progress,
    selected,
    details,
    selectedPointId,
    accionDisponible: (detail: PointDetails) => !(detail.disabled || (modoApi && servidor.error)),
    mostrarMisionesAdicionales: zone === 'missions' && !modoApi,
    reintentarRequisito:
      modoApi && detalleServidor?.clave === claveDetalle && detalleServidor.error
        ? () => setIntentoRequisito((i) => i + 1)
        : undefined,
  }
}
