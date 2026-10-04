import { mapPosition, canvasSize, type MapSize } from './geometry'
import type { StudentMapPoint } from './mapPoints'

export function MapPath({ points, mapSize = canvasSize }: { points: StudentMapPoint[]; mapSize?: MapSize }) {
  return (
    <svg aria-hidden="true" className="sx-map-path" viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}>
      {points.slice(1).map((point, index) => {
        const previous = points[index]
        const start = mapPosition(previous, mapSize)
        const end = mapPosition(point, mapSize)
        const done = previous.status === 'completed' && point.status === 'completed'
        const frontier = previous.status === 'completed' && point.status === 'available'
        return (
          <line
            key={`${previous.id}-${point.id}`}
            data-map-segment={done ? 'completed' : frontier ? 'frontier' : 'pending'}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            fill="none"
            stroke={done ? 'var(--success)' : frontier ? 'var(--sx-lumi)' : 'var(--sx-path)'}
            strokeWidth={done || frontier ? 8 : 7}
            strokeDasharray={done ? undefined : '18 22'}
            strokeLinecap="round"
            opacity={done ? 0.85 : frontier ? 1 : 0.75}
          />
        )
      })}
    </svg>
  )
}
