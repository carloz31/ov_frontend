import {
  getTravelResources,
  resourceRequirement,
  type TravelResource,
} from '@/features/occupation-exploration/lib/TravelerResources'
import { modoApi } from '@/features/servidor/config'
import { challenges, challengeRewards } from '../challenges/data'

export function getStudentTravelResources(): TravelResource[] {
  if (modoApi) return getTravelResources()
  return [
    ...getTravelResources(),
    ...challengeRewards.flatMap((r): TravelResource[] => {
      const challenge = challenges.find((c) => c.recompensa.recursoIds?.includes(r.id))
      return challenge
        ? [
            {
              id: r.id,
              title: r.titulo,
              kind: 'sheet',
              icon: 'sparkles',
              summary: 'La luz que reuniste al disipar un rumor.',
              description: `Obtenida al superar ${challenge.nombre}.`,
              requirement: { activityId: challenge.id },
              content: r.contenido,
              source: r.fuente,
            },
          ]
        : []
    }),
  ]
}
export function studentResourceRequirement(resource: TravelResource) {
  if (modoApi) return resourceRequirement(resource)
  const activityId = 'activityId' in resource.requirement ? resource.requirement.activityId : undefined
  const challenge = challenges.find((c) => c.id === activityId)
  return challenge
    ? {
        text: `Supera el desafío «${challenge.nombre}».`,
        url: `/student/exploration?punto=${challenge.id}`,
        label: 'Ir al desafío',
      }
    : resourceRequirement(resource)
}
