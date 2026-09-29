import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { Check, LockKeyhole } from 'lucide-react'
import { cn } from '@/lib/Utils'

type MapPoint = {
  id: string
  title: string
  subtitle?: string
  x: number
  y: number
  icon: ReactNode
  status?: 'locked' | 'available' | 'completed'
}

type MapProgress = {
  icon: ReactNode
  label: string
  value: number
}

const logicalCanvasSize = { width: 1080, height: 660 }
const canvasSize = { width: 2700, height: 1519 }
const minScale = 0.55

function mapPosition(point: Pick<MapPoint, 'x' | 'y'>) {
  return {
    x: (point.x / logicalCanvasSize.width) * canvasSize.width,
    y: (point.y / logicalCanvasSize.height) * canvasSize.height,
  }
}

function clampTransform(next: { x: number; y: number; scale: number }, bounds: DOMRect) {
  const imageWidth = canvasSize.width * next.scale
  const imageHeight = canvasSize.height * next.scale
  const minX = imageWidth > bounds.width ? bounds.width - imageWidth : (bounds.width - imageWidth) / 2
  const maxX = imageWidth > bounds.width ? 0 : minX
  const minY = imageHeight > bounds.height ? bounds.height - imageHeight : (bounds.height - imageHeight) / 2
  const maxY = imageHeight > bounds.height ? 0 : minY
  return {
    ...next,
    x: Math.min(maxX, Math.max(minX, next.x)),
    y: Math.min(maxY, Math.max(minY, next.y)),
  }
}

/** Shared canvas. Dragging pans while its initial scale fits all destinations in the viewport. */
function AdventureMap({
  points,
  variant,
  onSelect,
  label,
  progress,
  backgroundImage,
}: {
  points: MapPoint[]
  variant: 'route' | 'open'
  onSelect: (id: string) => void
  label: string
  progress: MapProgress
  backgroundImage: string
}) {
  const viewport = useRef<HTMLDivElement>(null)
  const drag = useRef<
    { pointerId: number; x: number; y: number; originX: number; originY: number } | undefined
  >(undefined)
  const [dragging, setDragging] = useState(false)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 })

  const centerMap = useCallback(() => {
    const bounds = viewport.current?.getBoundingClientRect()
    if (!bounds) return
    const fitScale = Math.min(
      (bounds.width - 64) / canvasSize.width,
      (bounds.height - 64) / canvasSize.height,
    )
    const scale = Math.min(0.9, Math.max(minScale, fitScale * 1.55))
    setTransform(
      clampTransform(
        {
          scale,
          x: (bounds.width - canvasSize.width * scale) / 2,
          y: (bounds.height - canvasSize.height * scale) / 2,
        },
        bounds,
      ),
    )
  }, [])

  useEffect(() => {
    centerMap()
    const observer = new ResizeObserver(centerMap)
    if (viewport.current) observer.observe(viewport.current)
    return () => observer.disconnect()
  }, [centerMap])

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button,input')) return
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: transform.x,
      originY: transform.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = drag.current
    if (!origin || origin.pointerId !== event.pointerId) return
    const bounds = viewport.current?.getBoundingClientRect()
    if (!bounds) return
    setTransform((current) =>
      clampTransform(
        {
          ...current,
          x: origin.originX + event.clientX - origin.x,
          y: origin.originY + event.clientY - origin.y,
        },
        bounds,
      ),
    )
  }

  function stopDragging() {
    drag.current = undefined
    setDragging(false)
  }

  return (
    <section
      className="adventure-map relative h-full min-h-0 overflow-hidden bg-[#dcebf1]"
      aria-label={label}
    >
      <div
        ref={viewport}
        className={cn(
          'relative h-full min-h-[420px] touch-none select-none overflow-hidden',
          dragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onLostPointerCapture={stopDragging}
      >
        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
          }}
        >
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-65"
            draggable={false}
            src={backgroundImage}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-[#182d22]/15" />
          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          >
            {variant === 'route' && (
              <polyline
                points={points
                  .map(mapPosition)
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
                fill="none"
                stroke="#fff8dc"
                strokeWidth="8"
                strokeDasharray="18 22"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_2px_2px_rgb(54_63_42/70%)]"
              />
            )}
          </svg>
          {points.map((point) => {
            const position = mapPosition(point)
            return (
              <button
                key={point.id}
                type="button"
                onClick={() => onSelect(point.id)}
                className={cn(
                  'group absolute flex w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-2xl p-2 text-center focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary',
                  point.status === 'locked' && 'opacity-65',
                )}
                style={{ left: position.x, top: position.y }}
                aria-disabled={point.status === 'locked'}
                aria-label={`${point.title}${point.status === 'locked' ? ', bloqueado' : point.status === 'completed' ? ', completado' : ''}`}
              >
                <span
                  className={cn(
                    'relative grid h-16 w-32 place-items-center rounded-[50%] border border-white/80 bg-[#adb5ba] text-[#4b5960] shadow-[0_12px_0_#899399,0_18px_18px_rgb(72_85_91/18%)] transition-transform group-hover:-translate-y-1',
                    point.status === 'available' &&
                      'bg-[#378fd0] text-white shadow-[0_12px_0_#226fa9,0_18px_18px_rgb(24_94_146/25%)]',
                    point.status === 'completed' &&
                      'bg-[#46b96d] text-white shadow-[0_12px_0_#278d4f,0_18px_18px_rgb(31_126_67/25%)]',
                  )}
                >
                  {point.status === 'locked' ? (
                    <LockKeyhole className="size-6" />
                  ) : point.status === 'completed' ? (
                    <Check className="size-7" />
                  ) : (
                    point.icon
                  )}
                </span>
                <span className="rounded-xl bg-white/80 px-3 py-1.5 text-xs font-bold text-[#294656] shadow-sm backdrop-blur-sm">
                  {point.title}
                  <span className="mt-0.5 block text-[10px] font-normal text-[#5c7581]">
                    {point.subtitle}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="pointer-events-none absolute bottom-4 left-4 z-30 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#40594d] shadow-md backdrop-blur">
          Arrastra el mapa para explorar
        </p>
        <div className="absolute right-4 top-4 z-30 max-w-[calc(100%-2rem)] sm:right-6 sm:top-6">
          <div className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/80 bg-white/95 px-2.5 py-1 shadow-lg backdrop-blur sm:min-h-14 sm:gap-3 sm:px-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#e9f0e5] text-[#4f775f] sm:size-8 sm:rounded-xl">
              {progress.icon}
            </span>
            <span className="hidden max-w-28 text-[10px] font-bold uppercase leading-4 tracking-[0.08em] text-[#667982] sm:block">
              {progress.label}
            </span>
            <CircularMapProgress label={progress.label} value={progress.value} />
          </div>
        </div>
      </div>
    </section>
  )
}

function CircularMapProgress({ label, value }: { label: string; value: number }) {
  const normalized = Math.min(100, Math.max(0, value))
  const radius = 18
  const circumference = 2 * Math.PI * radius
  return (
    <span
      className="relative grid size-10 shrink-0 place-items-center sm:size-11"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
    >
      <svg aria-hidden="true" className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="#dce6e3" strokeWidth="5" />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#65a879"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (normalized / 100) * circumference}
        />
      </svg>
      <strong className="relative text-[10px] tabular-nums text-[#3e5660]">{Math.round(normalized)}%</strong>
    </span>
  )
}

export { AdventureMap }
export type { MapPoint, MapProgress }
