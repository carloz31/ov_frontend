import type { JourneyState } from '@/types/activities'
import { modoApi } from '@/config/env'
import { obtenerEstadoServidor } from '@/store/servidor/sesion'
import { progresoCamino } from '@/lib/servidor/adaptadores'
import { type LucideIcon } from 'lucide-react'
import { cityCases, fieldMissions } from '@/data/content/adventure'
import { canAccessCity } from '@/store/adventureStore'
import { lumiDayKey } from '@/lib/lumiFriendship'
import type { AdventureState } from '@/types/adventure'
import { missionComplete } from './missionSync'
export type StudentMapPoint = {
  id: string
  title: string
  subtitle: string
  x: number
  y: number
  icon: LucideIcon
  status: 'locked' | 'available' | 'completed'
  zone: 'camino' | 'ciudad'
  specActivityId?: string
  bloque?: number
  actionEnabled: boolean
  additional?: boolean
  originId?: string
  revealing?: boolean
  revealQueued?: boolean
}

export type StudentZone = 'missions' | 'central'

export function getZoneProgress(zone: StudentZone, adventure: AdventureState, journey: JourneyState) {
  if (modoApi) {
    const estado = obtenerEstadoServidor().actividades.datos
    const ciudad = estado?.find((b) => b.codigo === 'CIUDAD')?.actividades ?? []
    return zone === 'missions'
      ? { label: 'Nivel de recorrido', value: progresoCamino(estado).porcentaje }
      : {
          label: 'Recorrido por la ciudad',
          value: ciudad.length
            ? (ciudad.filter((a) => a.estado === 'COMPLETADA').length / ciudad.length) * 100
            : 0,
        }
  }
  return zone === 'missions'
    ? {
        label: 'Nivel de recorrido',
        value:
          (fieldMissions.filter((mission) => missionComplete(mission, adventure, journey)).length /
            fieldMissions.length) *
          100,
      }
    : {
        label: 'Afinidad con la ciudad',
        value: Math.round(
          (cityCases.filter((item) => adventure.solvedCaseIds.includes(item.id)).length / cityCases.length) *
            100,
        ),
      }
}

export function getRecommendedPoint(points: StudentMapPoint[]) {
  if (points[0]?.zone === 'camino')
    return (
      points.find((point) => !point.additional && point.id !== 'city' && point.status === 'available') ??
      points.find((point) => point.id === 'city' && point.status === 'available')
    )
  return points.find(
    (point) => point.status === 'available' && (point.actionEnabled || (modoApi && point.id === 'mara-test')),
  )
}

export function getReturnGreeting(adventure: AdventureState, point?: StudentMapPoint, now = new Date()) {
  if (!point) return undefined
  const today = lumiDayKey(now)
  const previous = adventure.visits
    .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day) && day < today)
    .sort()
    .at(-1)
  if (!previous || (Date.parse(today) - Date.parse(previous)) / 86400000 < 3) return undefined
  return `¡Qué bueno verte de nuevo! Te espera ${point.title}.${!canAccessCity(adventure) ? ' La ciudad sigue esperándote al final del camino.' : ''}`
}
