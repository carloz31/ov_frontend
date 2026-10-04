import { useState } from 'react'
import { Compass, Signal } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { getTodayCheckIn, useCheckInDay } from '../overlays/checkIn'
import { useStudentOverlays } from '../overlays/overlay-context'

function StudentSignalsView() {
  const state = useAdventure()
  const { openCheckIn } = useStudentOverlays()
  useCheckInDay()
  const today = getTodayCheckIn(state)
  const checkIns = [...state.readinessCheckIns]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-12)
  const [selectedId, setSelectedId] = useState(checkIns.at(-1)?.id)
  const selected = checkIns.find((checkIn) => checkIn.id === selectedId) ?? checkIns.at(-1)
  const points = checkIns.map((checkIn, index) => ({
    ...checkIn,
    x: checkIns.length === 1 ? 400 : 60 + (index / (checkIns.length - 1)) * 680,
    y: 240 - ((checkIn.value - 1) / 9) * 210,
  }))

  return (
    <div
      className="min-h-full bg-[#eef1ed] px-4 py-6 text-[#2b2a28] sm:px-8 sm:py-10"
      style={{ fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <main className="mx-auto max-w-6xl">
        <header className="mt-4">
          <p className="flex items-center gap-2 text-sm font-bold text-[#3e6259]">
            <Signal className="size-4" /> Tu recorrido
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Historial de señales</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c5a54]">
            Observa cómo ha cambiado tu seguridad vocacional. Pulsa cualquier punto para consultar tu señal de
            ese día.
          </p>
        </header>

        <section className="sx-signal-card mt-7 rounded-3xl border border-border bg-white/75 p-5">
          <div className="sx-signal-heading">
            <h2 className="flex items-center gap-2 font-bold">
              <Compass size={18} aria-hidden="true" /> Tu señal de hoy
            </h2>
            {today && (
              <p className="sx-panel-signal" aria-label={`${today.value} de 10`}>
                <strong>{today.value}</strong>
                <span>/10</span>
              </p>
            )}
          </div>
          <p className="mt-3 text-sm">¿Qué tan seguro te sientes hoy de tu próximo paso?</p>
          <Button className="mt-4" onClick={() => openCheckIn()}>
            {today ? 'Cambiar mi señal' : 'Registrar mi señal'}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Tu orientadora ve esta señal y su tendencia, nunca el texto de tu diario.
          </p>
        </section>

        <section className="mt-7 rounded-3xl border border-[#3e6259]/20 bg-white/75 p-4 shadow-[0_10px_30px_rgb(43_42_40/5%)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">Seguridad vocacional en el tiempo</h2>
            <Badge className="bg-[#3e6259]/10 text-[#3e6259]" variant="secondary">
              Escala del 1 al 10
            </Badge>
          </div>
          {points.length ? (
            <div className="mt-6 overflow-x-auto">
              <svg
                aria-label="Gráfico histórico de señales del 1 al 10"
                className="min-w-[680px]"
                role="img"
                viewBox="0 0 800 290"
              >
                {[1, 3, 5, 7, 10].map((value) => {
                  const y = 240 - ((value - 1) / 9) * 210
                  return (
                    <g key={value}>
                      <line x1="60" x2="740" y1={y} y2={y} stroke="#d7dfda" strokeWidth="1" />
                      <text fill="#65716c" fontSize="12" textAnchor="end" x="45" y={y + 4}>
                        {value}
                      </text>
                    </g>
                  )
                })}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                    stroke="#3e6259"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                )}
                {points.map((point) => {
                  const active = selected?.id === point.id
                  return (
                    <g key={point.id}>
                      <g
                        aria-label={`${new Date(point.createdAt).toLocaleDateString('es-PE')}: ${point.value} de 10`}
                        className="cursor-pointer outline-none"
                        onClick={() => setSelectedId(point.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') setSelectedId(point.id)
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <circle
                          cx={point.x}
                          cy={point.y}
                          fill={active ? '#4b4066' : '#3e6259'}
                          r={active ? 9 : 7}
                          stroke="white"
                          strokeWidth="3"
                        />
                      </g>
                      <text fill="#65716c" fontSize="11" textAnchor="middle" x={point.x} y="268">
                        {new Date(point.createdAt).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          ) : (
            <div className="py-14 text-center text-sm text-[#5c5a54]">
              Registra tu primera señal para comenzar el historial.
            </div>
          )}
        </section>

        {selected && (
          <p role="status" className="mt-5 text-sm text-muted-foreground">
            Señal seleccionada · {selected.value}/10 ·{' '}
            {new Date(selected.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
          </p>
        )}
      </main>
    </div>
  )
}

export { StudentSignalsView }
