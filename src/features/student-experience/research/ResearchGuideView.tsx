import { DiscoverySheetContent as SheetContent } from '@/components/student/DiscoverySheetContent'
import { useReturnFocus } from '@/hooks/useReturnFocus'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, ClipboardCheck, X, Search } from 'lucide-react'
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { occupationCatalog } from '@/data/catalog/occupations'
import { useOccupationExplorationContext } from '@/context/occupationExplorationContext'
import { useAdventure } from '@/store/adventureStore'
import { useJourney } from '@/store/journeyStore'
import { appPaths } from '@/routes/paths'
import { useDiscovery, updateDiscovery } from '@/store/discoveryStore'
import type { ResearchInProgress } from '@/types/discovery'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '@/components/student/Parchment'
import { GuideSheet } from './GuideSheet'
import { suggestedQuestions } from '@/data/content/research'
import { researchUnlocked } from './research'
export function ResearchGuideView() {
  const focus = useReturnFocus()
  const replacementFocus = useReturnFocus()
  const discovery = useDiscovery(),
    context = useOccupationExplorationContext()
  const [params, setParams] = useSearchParams()
  const [picker, setPicker] = useState(false),
    [query, setQuery] = useState(''),
    [question, setQuestion] = useState(''),
    [guide, setGuide] = useState(false),
    [replacement, setReplacement] = useState<string>()
  const unlocked = researchUnlocked(useAdventure(), useJourney())
  const research: ResearchInProgress = discovery.research ?? {
    occupationId: '',
    before: '',
    ownQuestions: [],
    guideStep: 0,
  }
  const step = research.guideReadyAt ? 2 : (research.guideStep ?? 0)
  const guidePage = useRef<HTMLDivElement>(null)
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current === step) return
    previousStep.current = step
    guidePage.current?.closest('.sx-module-content')?.scrollTo({ top: 0, behavior: 'instant' })
    const heading = guidePage.current?.querySelector<HTMLElement>('h1,h2')
    heading?.setAttribute('tabindex', '-1')
    heading?.focus({ preventScroll: true })
  }, [step])
  const occupation = occupationCatalog.find((o) => o.id === research.occupationId)
  function patch(value: Partial<ResearchInProgress>) {
    updateDiscovery((s) => ({
      ...s,
      research: { ...(s.research ?? { occupationId: '', before: '', ownQuestions: [] }), ...value },
    }))
  }
  function choose(id: string) {
    if (id === research.occupationId) return
    if (
      research.occupationId &&
      (research.before.trim() || research.ownQuestions.length || research.guideReadyAt)
    )
      setReplacement(id)
    else patch({ occupationId: id })
    setPicker(false)
  }
  useEffect(() => {
    const id = params.get('occupationId')
    if (!unlocked || !id || !occupationCatalog.some((o) => o.id === id)) return
    if (
      discovery.research?.occupationId &&
      discovery.research.occupationId !== id &&
      (discovery.research.before.trim() ||
        discovery.research.ownQuestions.length ||
        discovery.research.guideReadyAt)
    )
      setReplacement(id)
    else
      updateDiscovery((s) => ({
        ...s,
        research: { ...(s.research ?? { before: '', ownQuestions: [] }), occupationId: id },
      }))
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('occupationId')
        return next
      },
      { replace: true },
    )
  }, [params, setParams, unlocked, discovery.research])
  const favoriteIds = context.profiles.filter((p) => p.interested).map((p) => p.occupationId)
  const choices = occupationCatalog
    .filter((o) =>
      o.name
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(
          query
            .toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim(),
        ),
    )
    .sort((a, b) => Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id)))
  function addQuestion() {
    const text = question.trim()
    if (text.length < 5) return
    patch({ ownQuestions: [...research.ownQuestions, text] })
    setQuestion('')
  }
  if (!unlocked)
    return (
      <DiscoveryStage ambient="research">
        <Parchment title="Las investigaciones se abren al resolver tu primer caso en la Central de Casos.">
          <Link className="sx-d-action" to={appPaths.student.exploration}>
            Ir a la ciudad
          </Link>
        </Parchment>
      </DiscoveryStage>
    )
  return (
    <DiscoveryStage ambient="research">
      <Link className="sx-d-back" to={appPaths.student.research}>
        <ArrowLeft />
        Volver a investigaciones
      </Link>
      <ol className="sx-d-guide-steps">
        {['Lo que pienso', 'Mis preguntas', 'Lista'].map((label, i) => (
          <li key={label} aria-current={step === i ? 'step' : undefined} data-done={step > i}>
            {label}
          </li>
        ))}
      </ol>
      <div className="sx-d-guide-page" ref={guidePage}>
        <Parchment
          label={step === 0 ? 'Lo que pienso' : step === 1 ? 'Mis preguntas' : 'Lista'}
          title={step === 0 ? 'Antes de la entrevista' : step === 1 ? 'Mi lista de preguntas' : undefined}
        >
          {step === 0 ? (
            <>
              <p className="sx-d-eyebrow">Vas a entrevistar a</p>
              <div className="sx-d-quote sx-d-row">
                <strong>{occupation?.name ?? 'Elige a quién entrevistarás'}</strong>
                <button
                  type="button"
                  className="sx-d-action sx-d-action-ghost"
                  onClick={() => setPicker(true)}
                >
                  {occupation ? 'Cambiar ocupación' : 'Elegir ocupación'}
                </button>
              </div>
              <label className="sx-d-field">
                Antes de conversar con esta persona, ¿qué crees que hace en su trabajo y qué esperas
                descubrir?
                <textarea
                  className="sx-d-input"
                  rows={6}
                  placeholder="Escribe lo que piensas hoy. No hay respuestas incorrectas."
                  value={research.before}
                  onChange={(e) => patch({ before: e.target.value })}
                />
              </label>
              <p>
                Esto queda guardado tal cual. Después de la entrevista podrás compararlo con lo que
                descubriste.
              </p>
              <button
                type="button"
                className="sx-d-action sx-d-action-gold"
                disabled={!occupation || research.before.trim().length < 20}
                onClick={() => patch({ guideStep: 1 })}
              >
                Seguir con las preguntas
              </button>
            </>
          ) : step === 1 ? (
            <>
              <strong>{3 + research.ownQuestions.length} preguntas</strong>
              <h3>Sugeridas por Lumi</h3>
              <ol className="sx-d-questions">
                {suggestedQuestions.map((q, i) => (
                  <li data-suggested key={q}>
                    <span>{i + 1}</span>
                    {q}
                  </li>
                ))}
              </ol>
              <h3>Mis preguntas</h3>
              {!research.ownQuestions.length && (
                <p>Aún no agregas preguntas propias. ¿Qué te gustaría saber que no esté arriba?</p>
              )}
              <ol className="sx-d-questions">
                {research.ownQuestions.map((q, i) => (
                  <li key={`${i}-${q}`}>
                    <span>{i + 4}</span>
                    {q}
                    <button
                      type="button"
                      className="sx-d-icon"
                      aria-label="Quitar pregunta"
                      onClick={() =>
                        patch({ ownQuestions: research.ownQuestions.filter((_q, index) => index !== i) })
                      }
                    >
                      <X />
                    </button>
                  </li>
                ))}
              </ol>
              <label className="sx-d-field">
                Escribe una pregunta que quieras hacer
                <input
                  className="sx-d-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                      e.preventDefault()
                      addQuestion()
                    }
                  }}
                />
              </label>
              <button
                type="button"
                className="sx-d-action sx-d-action-ghost"
                disabled={question.trim().length < 5}
                onClick={addQuestion}
              >
                Agregar
              </button>
              <div className="sx-d-actions">
                <button
                  type="button"
                  className="sx-d-action sx-d-action-ghost"
                  onClick={() => patch({ guideStep: 0 })}
                >
                  Volver
                </button>
                <button
                  type="button"
                  className="sx-d-action sx-d-action-gold"
                  disabled={!research.ownQuestions.length}
                  onClick={() => patch({ guideReadyAt: new Date().toISOString(), guideStep: 2 })}
                >
                  Terminar mi guion
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="sx-d-guide-ready">
                <ClipboardCheck aria-hidden="true" />
              </div>
              <h1>Tu guía de entrevista está lista</h1>
              <p>
                {occupation?.name} · {3 + research.ownQuestions.length} preguntas
              </p>
              <ol className="sx-d-questions">
                <li>
                  Busca a alguien que ejerza esta ocupación: un familiar, un conocido o alguien que te
                  recomienden.
                </li>
                <li>Haz la entrevista con tu guía y grábala en video, con su permiso.</li>
                <li>Vuelve a Investigaciones para publicarla con un resumen y el enlace al video.</li>
              </ol>
              <button type="button" className="sx-d-action sx-d-action-gold" onClick={() => setGuide(true)}>
                Ver mi guion completo
              </button>
              <Link className="sx-d-action" to={appPaths.student.research}>
                Ir a Investigaciones
              </Link>
            </>
          )}
        </Parchment>
        {step === 0 && (
          <details className="sx-d-question-preview">
            <summary>Preguntas que llevarás a la entrevista</summary>
            <ul>
              {suggestedQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
      <Sheet open={picker} onOpenChange={setPicker}>
        <SheetContent {...focus} className="sx-root sx-d-sheet">
          <SheetHeader>
            <SheetTitle>Elegir ocupación</SheetTitle>
            <SheetDescription>Tus favoritas aparecen primero.</SheetDescription>
          </SheetHeader>
          <label className="sx-d-field">
            <Search aria-hidden="true" />
            Buscar ocupación
            <input className="sx-d-input" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <div className="sx-d-stack">
            {choices.map((o) => (
              <button
                type="button"
                key={o.id}
                className="sx-d-action sx-d-action-ghost"
                onClick={() => choose(o.id)}
              >
                {o.name}
                {favoriteIds.includes(o.id) && ' · Favorita'}
              </button>
            ))}
          </div>
          {!choices.length && <p>No encontramos una ocupación con ese nombre.</p>}
        </SheetContent>
      </Sheet>
      <GuideSheet research={research} open={guide} onOpenChange={setGuide} />
      <Dialog
        open={!!replacement}
        onOpenChange={(open) => {
          if (!open) setReplacement(undefined)
        }}
      >
        <DialogContent {...replacementFocus} className="sx-root sx-d-dialog">
          <DialogHeader>
            <DialogTitle>¿Cambiar de ocupación?</DialogTitle>
            <DialogDescription>
              Ya tienes un guion guardado. Reemplazarlo borra ese guion y su borrador de publicación; tus
              entrevistas publicadas se conservan.
            </DialogDescription>
          </DialogHeader>
          <div className="sx-d-actions">
            <button
              type="button"
              className="sx-d-action sx-d-action-ghost"
              onClick={() => setReplacement(undefined)}
            >
              Conservar mi guion
            </button>
            <button
              type="button"
              className="sx-d-action"
              onClick={() => {
                updateDiscovery((s) => ({
                  ...s,
                  research: { occupationId: replacement!, before: '', ownQuestions: [], guideStep: 0 },
                }))
                setReplacement(undefined)
              }}
            >
              Reemplazar mi guion
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DiscoveryStage>
  )
}
