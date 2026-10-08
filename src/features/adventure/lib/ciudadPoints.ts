import type { JourneyState } from '@/types/activities'
import { modoApi } from '@/config/env'
import { obtenerEstadoServidor } from '@/store/servidor/estadoServidor'
import { actividadServidor, estadoPunto, interaccionMara } from '@/lib/servidor/adaptadores'
import { BookOpen, Building2, ClipboardList, Swords } from 'lucide-react'
import { challenges } from '@/data/content/challenges'
import { canStartChallenge } from '@/lib/challenges'
import { cityCases } from '@/data/content/adventure'
import type { AdventureState } from '@/types/adventure'
import type { StudentMapPoint } from './mapPoints'
export function getCiudadPoints(adventure: AdventureState, journey: JourneyState): StudentMapPoint[] {
  if (modoApi) {
    const mara = interaccionMara(obtenerEstadoServidor().estado)
    return [
      ...cityCases.map((c): StudentMapPoint => ({
        id: c.id,
        title: c.title,
        x: c.x,
        y: c.y,
        zone: 'ciudad',
        subtitle: 'Disponible en una próxima iteración',
        icon: Building2,
        status: 'locked',
        actionEnabled: false,
      })),
      {
        id: 'mara-test',
        title: mara.actividad?.titulo ?? 'Una vuelta por el molino',
        subtitle: `Test · Interacción ${mara.numero} de 14`,
        x: 875,
        y: 530,
        zone: 'ciudad',
        icon: ClipboardList,
        specActivityId: mara.actividad?.codigo,
        status: estadoPunto(mara.actividad),
        actionEnabled: true,
      },
      {
        id: 'elena-result',
        title: 'Las pistas que hablan de ti',
        subtitle: 'Encuentro con Elena',
        x: 1030,
        y: 610,
        zone: 'ciudad',
        icon: BookOpen,
        specActivityId: 'act-tip-final',
        status: estadoPunto(actividadServidor(obtenerEstadoServidor().estado, 'act-tip-final')),
        actionEnabled:
          estadoPunto(actividadServidor(obtenerEstadoServidor().estado, 'act-tip-final')) !== 'locked',
      },
      ...challenges.map((c, i): StudentMapPoint => ({
        id: c.id,
        title: c.titulo,
        subtitle: 'Disponible en una próxima iteración',
        x: 710 + i * 90,
        y: 365,
        zone: 'ciudad',
        icon: Swords,
        status: 'locked',
        actionEnabled: false,
      })),
    ]
  }
  const testCompleted = journey.progress['act-tip-01']?.estado === 'completada'
  const points: StudentMapPoint[] = [
    ...cityCases.map((item): StudentMapPoint => ({
      id: item.id,
      title: item.title,
      x: item.x,
      y: item.y,
      zone: 'ciudad',
      subtitle: adventure.solvedCaseIds.includes(item.id)
        ? 'La comunidad te agradece'
        : 'Un llamado de auxilio',
      icon: Building2,
      status: adventure.solvedCaseIds.includes(item.id)
        ? 'completed'
        : item.id === 'forest-fire'
          ? 'available'
          : 'locked',
      actionEnabled: item.id === 'forest-fire',
    })),
    {
      id: 'mara-test',
      title: 'Una vuelta por el molino',
      subtitle: testCompleted ? 'Test · Primera interacción completada' : 'Test · Interacción 1 de 14',
      x: 875,
      y: 530,
      icon: ClipboardList,
      status: testCompleted ? 'completed' : 'available',
      zone: 'ciudad',
      specActivityId: 'act-tip-01',
      actionEnabled: true,
    },
    ...challenges.map((c, i): StudentMapPoint => ({
      id: c.id,
      title: c.titulo,
      subtitle: `Desafío · ${c.nombre}`,
      x: 710 + i * 90,
      y: 365,
      zone: 'ciudad',
      icon: Swords,
      specActivityId: c.id,
      bloque: c.bloque,
      status:
        journey.progress[c.id]?.estado === 'completada'
          ? 'completed'
          : canStartChallenge(c, journey)
            ? 'available'
            : 'locked',
      actionEnabled: true,
    })),
  ]
  return points
}
