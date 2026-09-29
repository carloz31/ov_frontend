import { useState } from 'react'
import { ArrowLeft, BookOpenText, LockKeyhole, Signal } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { appPaths } from '@/routes/paths'
import { useAdventure } from './lib/AdventureStore'

function JournalSignalsView() {
  const navigate = useNavigate()
  const state = useAdventure()
  const checkIns = [...state.readinessCheckIns]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-12)
  const [selectedId, setSelectedId] = useState(checkIns.at(-1)?.id)
  const selected = checkIns.find((checkIn) => checkIn.id === selectedId) ?? checkIns.at(-1)
  const selectedDate = selected ? localDateKey(new Date(selected.createdAt)) : undefined
  const entries = selectedDate
    ? state.journal.filter((entry) => localDateKey(new Date(entry.createdAt)) === selectedDate)
    : []
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
        <Button
          className="-ml-3 text-[#5c5a54]"
          onClick={() => navigate(appPaths.student.journal)}
          variant="ghost"
        >
          <ArrowLeft /> Volver a Mi diario
        </Button>
        <nav aria-label="Ruta actual" className="mt-5 flex items-center gap-2 text-sm text-[#5c5a54]">
          <button className="hover:text-[#4b4066]" onClick={() => navigate(appPaths.student.journal)}>
            Mi diario
          </button>
          <span aria-hidden="true">→</span>
          <strong className="text-[#2b2a28]">Señales</strong>
        </nav>
        <header className="mt-4">
          <p className="flex items-center gap-2 text-sm font-bold text-[#3e6259]">
            <Signal className="size-4" /> Tu recorrido
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Historial de señales</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5c5a54]">
            Observa cómo ha cambiado tu seguridad vocacional. Pulsa cualquier punto para recordar qué
            escribiste ese día.
          </p>
        </header>

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
              Registra tu primera señal desde Mi diario para comenzar el historial.
            </div>
          )}
        </section>

        {selected && (
          <section className="mt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#3e6259]">
                  Señal seleccionada · {selected.value}/10
                </p>
                <h2 className="mt-1 text-2xl font-bold">
                  Entradas del{' '}
                  {new Date(selected.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                </h2>
              </div>
              <Badge variant="outline">
                <LockKeyhole className="size-3.5" /> Solo tú puedes leerlas
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {entries.map((entry) => (
                <article
                  className="rounded-3xl border border-[#dad6c9] bg-white/75 p-5 sm:p-6"
                  key={entry.id}
                >
                  <div className="flex flex-wrap gap-2">
                    {entry.topicTags.map((tag) => (
                      <Badge className="bg-[#4b4066]/8 text-[#4b4066]" key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  {entry.promptShown && <h3 className="mt-4 font-bold leading-7">{entry.promptShown}</h3>}
                  <p className="mt-4 whitespace-pre-wrap font-serif leading-8 text-[#393734]">{entry.body}</p>
                </article>
              ))}
              {!entries.length && (
                <div className="rounded-3xl border border-dashed border-[#dad6c9] bg-white/45 p-8 text-center lg:col-span-2">
                  <BookOpenText className="mx-auto size-7 text-[#4b4066]" />
                  <p className="mt-3 text-sm text-[#5c5a54]">No registraste una entrada de diario ese día.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export { JournalSignalsView }
