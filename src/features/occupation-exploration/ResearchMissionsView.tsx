import { Check, Search, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { appPaths } from '@/routes/paths'
import { classroomAliases } from './data/AdventureData'
import { careerCatalog } from './data/ExplorationCatalogData'
import { canAccessCity, safeVideoUrl, updateAdventure, useAdventure } from './lib/AdventureStore'
import type { ResearchDraft } from './types/AdventureTypes'
import { CityGate } from './CityMapView'

const steps = ['Elegir carrera', 'Invitar compañeros', 'Investigar', 'Registrar cierre']
const questions = [
  '¿Qué formación y recorrido necesita una persona para dedicarse a esta carrera?',
  '¿Cómo es su día a día y qué desafíos encuentra?',
  '¿Qué descubrimiento cambió o confirmó tu idea inicial?',
]
function ResearchMissionsView() {
  const state = useAdventure()
  const navigate = useNavigate()
  const draft = state.research
  const change = (patch: Partial<ResearchDraft>) =>
    updateAdventure((current) => ({ ...current, research: { ...current.research, ...patch } }))
  if (!canAccessCity(state)) return <CityGate />
  const valid =
    draft.step === 0
      ? Boolean(draft.careerId)
      : draft.step === 1
        ? true
        : draft.step === 2
          ? draft.answers.every((answer) => answer.trim())
          : Boolean(safeVideoUrl(draft.videoUrl) && draft.reflection.trim())
  function publish() {
    if (!valid || draft.publishedId) return
    const id = crypto.randomUUID()
    updateAdventure((current) => ({
      ...current,
      research: { ...current.research, publishedId: id },
      videos: [
        ...current.videos,
        {
          id,
          title: careerCatalog.find((item) => item.id === draft.careerId)?.name ?? 'Mi investigación',
          alias: 'Alex',
          url: safeVideoUrl(draft.videoUrl)!,
          reflection: draft.reflection.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    }))
  }
  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <Button variant="ghost" onClick={() => navigate(appPaths.student.exploration)}>
        <ArrowLeft /> Volver a la ciudad
      </Button>
      <div className="mx-auto mt-6 max-w-4xl">
        <p className="adventure-eyebrow">
          <Search className="size-4" /> ESTACIÓN DE INVESTIGACIÓN
        </p>
        <h1 className="mb-6 mt-2 text-3xl font-bold">Detrás de una carrera, una historia.</h1>
        <ol className="mb-6 grid gap-3 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step}
              className={`rounded-2xl border p-4 text-sm ${index === draft.step ? 'border-[#52775c] bg-[#e7eddd]' : 'bg-white/60'}`}
            >
              <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-white font-bold">
                {index < draft.step ? <Check className="size-4" /> : index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="adventure-card space-y-5 p-6 sm:p-8">
          {draft.publishedId ? (
            <>
              <Check className="size-10 text-emerald-600" />
              <h2 className="text-2xl font-bold">Tu entrevista ya está en el Salón</h2>
              <p>Otros viajeros podrán descubrirla y dejar una reacción guiada.</p>
              <Button onClick={() => navigate(`${appPaths.student.resources}?tab=community`)}>
                Ver entrevistas del Salón
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  change({
                    step: 0,
                    careerId: '',
                    invitees: [],
                    answers: ['', '', ''],
                    videoUrl: '',
                    reflection: '',
                    publishedId: undefined,
                  })
                }
              >
                Nueva investigación
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">{steps[draft.step]}</h2>
              {draft.step === 0 && (
                <label className="block text-sm">
                  ¿Qué carrera quieres conocer?
                  <select
                    className="adventure-input mt-3"
                    value={draft.careerId}
                    onChange={(event) => change({ careerId: event.target.value })}
                  >
                    <option value="">Selecciona una carrera</option>
                    {careerCatalog.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {draft.step === 1 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Puedes investigar por tu cuenta o invitar hasta 2 compañeros del salón. Estas invitaciones
                    son para esta misión; tu Crew se mantiene.
                  </p>
                  {classroomAliases.map((alias) => (
                    <label key={alias} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.invitees.includes(alias)}
                        disabled={draft.invitees.length >= 2 && !draft.invitees.includes(alias)}
                        onChange={() =>
                          change({
                            invitees: draft.invitees.includes(alias)
                              ? draft.invitees.filter((item) => item !== alias)
                              : [...draft.invitees, alias],
                          })
                        }
                      />
                      {alias}
                    </label>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Las invitaciones quedan registradas en este prototipo.
                  </p>
                </>
              )}
              {draft.step === 2 &&
                questions.map((question, index) => (
                  <label className="block text-sm font-semibold" key={question}>
                    {question}
                    <textarea
                      className="adventure-input mt-3 min-h-24"
                      value={draft.answers[index]}
                      onChange={(event) =>
                        change({
                          answers: draft.answers.map((answer, i) =>
                            i === index ? event.target.value : answer,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
              {draft.step === 3 && (
                <>
                  <p className="text-sm text-muted-foreground">
                    Puedes volver en otro momento para agregar el video y tu reflexión final.
                  </p>
                  <label className="block text-sm font-semibold">
                    Enlace del video
                    <input
                      type="url"
                      className="adventure-input mt-2"
                      placeholder="https://…"
                      value={draft.videoUrl}
                      onChange={(event) => change({ videoUrl: event.target.value })}
                    />
                  </label>
                  {draft.videoUrl && !safeVideoUrl(draft.videoUrl) && (
                    <p role="alert" className="text-sm text-red-700">
                      Usa un enlace HTTPS válido.
                    </p>
                  )}
                  <label className="block text-sm font-semibold">
                    ¿Qué te llevas de esta experiencia?
                    <textarea
                      className="adventure-input mt-2 min-h-28"
                      value={draft.reflection}
                      onChange={(event) => change({ reflection: event.target.value })}
                    />
                  </label>
                </>
              )}
              <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
                <Button
                  variant="outline"
                  onClick={() =>
                    draft.step > 0 ? change({ step: draft.step - 1 }) : navigate(appPaths.student.exploration)
                  }
                >
                  {draft.step > 0 ? 'Anterior' : 'Guardar y salir'}
                </Button>
                <Button
                  disabled={!valid}
                  onClick={() => (draft.step === 3 ? publish() : change({ step: draft.step + 1 }))}
                >
                  {draft.step === 3
                    ? 'Publicar en el aula'
                    : draft.step === 1 && !draft.invitees.length
                      ? 'Continuar por mi cuenta'
                      : 'Continuar'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Tu avance se guarda en este navegador. Puedes salir y retomarlo.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export { ResearchMissionsView }
