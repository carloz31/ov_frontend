import { Check, Signpost } from 'lucide-react'
import { mapPosition } from './geometry'
import type { StudentMapPoint } from './mapPoints'

export function BlockSign({ points }: { points: StudentMapPoint[] }) {
  const blocks = [...new Set(points.flatMap((point) => (point.bloque === undefined ? [] : [point.bloque])))]
  return (
    <>
      {blocks.map((block) => {
        const missions = points.filter((point) => point.bloque === block)
        const position = mapPosition(missions[0])
        const Icon = missions.every((point) => point.status === 'completed') ? Check : Signpost
        return (
          <span
            key={block}
            className="sx-block-sign"
            style={{ left: position.x - 90, top: position.y - 110 }}
          >
            <Icon size={22} aria-hidden="true" />
            Tramo {block}
          </span>
        )
      })}
    </>
  )
}
