import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  ArrowDown,
  Check,
  CheckCircle2,
  LockKeyhole,
  Minus,
  Star,
  TriangleAlert,
  X,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { forestFirePhases, forestFireProfessionals } from '@/data/content/forestFireCase'
import { professionalTestimonials } from '@/data/catalog/occupations'
import { ForestFireCaseHeader } from './components/ForestFireCaseHeader'
import { ListenScreen } from './components/ForestFireScene'
import { ForestFireProfessionalPanel, ProfessionalDirectory } from './components/ForestFireProfessionalPanel'
import { LumiMedallion } from '@/components/student/LumiMedallion'
import { getOccupation } from '@/features/student-experience/catalog/catalogSelectors'
import { discoveryPaths } from '@/features/student-experience/paths'
import { finishForestFireAttempt } from '@/features/cases/lib/forestFireCaseOutcome'
import { useAdventure, useAdventureStorageError } from '@/store/adventureStore'
import { useExplorationError } from '@/store/explorationStore'
import {
  FOREST_FIRE_BUDGET_LIMIT,
  FOREST_FIRE_MAX_SATISFACTION,
  FOREST_FIRE_PASS_SCORE,
  SHOW_EXTRA_PROFESSIONAL,
  canOpenPhaseStep,
  createInitialAssignments,
  getBudgetSpent,
  getPhaseSatisfaction,
  getProblemSatisfaction,
  getTotalSatisfaction,
  toggleAssignment,
} from '@/features/cases/lib/forestFireCaseLogic'
import type { ForestFireAssignments, ForestFirePhase } from '@/types/cases'
import { ExtraProfessionalQuestionScreen, ProfessionalWordCloudScreen } from './ForestFireExtraScreens'
import './forest-fire.css'
import './forest-fire-workspace.css'

type Screen =
  'phase-intro' | 'workspace' | 'result' | 'game-over' | 'report' | 'extra-question' | 'word-cloud'

export function ForestFireCaseView({
  onClose,
  onComplete,
}: {
  onClose: () => void
  onComplete?: () => void
}) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  // The separate case intro already introduces phase 1.
  const [screen, setScreen] = useState<Screen>('workspace')
  const [step, setStep] = useState(0)
  const [assignments, setAssignments] = useState(createInitialAssignments)
  const [heardByPhase, setHeardByPhase] = useState<Record<string, string[]>>({})
  const [visitedByPhase, setVisitedByPhase] = useState<Record<string, number[]>>({})
  const [helpSeenByPhase, setHelpSeenByPhase] = useState<Record<string, boolean>>({})
  const [dragContactId, setDragContactId] = useState<string>()
  const [dropHovered, setDropHovered] = useState(false)
  const [newIconIds, setNewIconIds] = useState<string[]>([])
  const [extraProfessionalId, setExtraProfessionalId] = useState('')
  const [extraReason, setExtraReason] = useState('')
  const finalized = useRef(false)
  const main = useRef<HTMLElement>(null)
  const phase = forestFirePhases[phaseIndex]
  const heard = heardByPhase[phase.id] ?? []
  const visited = visitedByPhase[phase.id] ?? [0]
  const remaining = FOREST_FIRE_BUDGET_LIMIT - getBudgetSpent(assignments)
  const phaseAssignments = assignments[phase.id]
  const labels = ['Escuchar', ...phase.problems.map((_, i) => `Problema ${i + 1}`), 'Revisar']
  const adventure = useAdventure()
  const storageError = useAdventureStorageError()
  const explorationError = useExplorationError()
  useEffect(() => {
    main.current?.querySelector<HTMLElement>('h1')?.focus()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [screen, step, phaseIndex])

  function goToStep(next: number) {
    if (!visited.includes(next) && !canOpenPhaseStep(phase, phaseAssignments, heard, next)) return
    setStep(next)
    setVisitedByPhase((current) => ({
      ...current,
      [phase.id]: [...new Set([...(current[phase.id] ?? [0]), next])],
    }))
  }
  function markHeard(ids: string[]) {
    setHeardByPhase((current) => ({
      ...current,
      [phase.id]: [...new Set([...(current[phase.id] ?? []), ...ids])],
    }))
  }
  function call(problemId: string, id: string) {
    setAssignments((current) =>
      current[phase.id][problemId].includes(id)
        ? current
        : toggleAssignment(current, phase.id, problemId, id),
    )
  }
  function restart() {
    finalized.current = false
    setPhaseIndex(0)
    setStep(0)
    setAssignments(createInitialAssignments())
    setHeardByPhase({})
    setVisitedByPhase({})
    setHelpSeenByPhase({})
    setDragContactId(undefined)
    setDropHovered(false)
    setNewIconIds([])
    setExtraProfessionalId('')
    setExtraReason('')
    setScreen('phase-intro')
  }
  function showReport() {
    if (!finalized.current) {
      finalized.current = true
      setNewIconIds(finishForestFireAttempt(assignments).newIconIds)
    }
    setScreen('report')
  }
  function advance() {
    if (phaseIndex < forestFirePhases.length - 1) {
      if (remaining < 1) {
        setScreen('game-over')
        return
      }
      setPhaseIndex((index) => index + 1)
      setStep(0)
      setScreen('phase-intro')
    } else if (SHOW_EXTRA_PROFESSIONAL) setScreen('extra-question')
    else showReport()
  }
  const complete = phase.problems.every((problem) => phaseAssignments[problem.id].length > 0)
  const isStepComplete = (index: number) =>
    index === 0
      ? phase.messages.every((m) => heard.includes(m.id))
      : index <= phase.problems.length && phaseAssignments[phase.problems[index - 1].id].length > 0
  return (
    <div
      className={`sx-root ff-case ff-play ${screen === 'workspace' ? 'ff-workspace-active' : ''}`}
      style={{
        backgroundImage: `url(${phase.backgroundImage})`,
        backgroundPosition: phase.backgroundPosition,
      }}
    >
      <ForestFireCaseHeader
        label={
          screen === 'report'
            ? 'Cierre del caso'
            : `Fase ${phase.number} de ${forestFirePhases.length} · ${phase.name}`
        }
        progress={(phase.number / forestFirePhases.length) * 100}
        budgetRemaining={remaining}
        finished={screen === 'report'}
        onClose={onClose}
      >
        {screen === 'workspace' && (
          <nav className="ff-steps" aria-label="Pasos de la fase">
            {labels.map((label, index) => (
              <button
                key={label}
                aria-current={step === index ? 'step' : undefined}
                data-complete={isStepComplete(index) || undefined}
                disabled={
                  !visited.includes(index) && !canOpenPhaseStep(phase, phaseAssignments, heard, index)
                }
                onClick={() => goToStep(index)}
              >
                <span aria-hidden="true">{isStepComplete(index) ? <Check size={14} /> : index + 1}</span>
                {label}
              </button>
            ))}
          </nav>
        )}
      </ForestFireCaseHeader>
      <main ref={main}>
        {screen === 'phase-intro' && (
          <section
            className="ff-intro"
            style={{
              backgroundImage: `url(${phase.backgroundImage})`,
              backgroundPosition: phase.backgroundPosition,
            }}
          >
            <div className="ff-dark">
              <LumiMedallion />
              <p className="ff-eyebrow">Siguiente etapa</p>
              <h1 tabIndex={-1}>
                Fase {phase.number}: {phase.name}
              </h1>
              <p>{phase.subtitle}</p>
              <button className="ff-primary" onClick={() => setScreen('workspace')}>
                Comenzar fase
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}
        {screen === 'workspace' && step === 0 && (
          <ListenScreen
            key={phase.id}
            phase={phase}
            heard={heard}
            helpSeen={!!helpSeenByPhase[phase.id]}
            onHelpSeen={() => setHelpSeenByPhase((current) => ({ ...current, [phase.id]: true }))}
            onHear={markHeard}
            onNext={() => goToStep(1)}
          />
        )}
        {screen === 'workspace' && step > 0 && step <= phase.problems.length && (
          <section className="ff-workspace" key={`${phase.id}-${step}`}>
            <div className="ff-problem-column">
              <article className="ff-problem-card ff-dark">
                <p className="ff-eyebrow">
                  Problema {step} de {phase.problems.length}
                </p>
                <h1 tabIndex={-1}>{phase.problems[step - 1].title}</h1>
                <p>{phase.problems[step - 1].detail}</p>
                <div className="ff-community-mobile">
                  <ClueList phase={phase} label="Pistas" />
                </div>
              </article>
              <div className="ff-community-desktop ff-dark">
                <div className="ff-community-heading">
                  <h2>Lo que dijo la comunidad</h2>
                  <ClueList phase={phase} label="Ver completo" />
                </div>
                <ul>
                  {phase.messages.map((message) => (
                    <li key={message.id}>
                      <strong>{message.speaker}:</strong> {message.summary}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`ff-team-zone ff-dark ${dragContactId ? 'is-dragging-contact' : ''} ${dropHovered ? 'is-drop-hovered' : ''}`}
              >
                <div className="ff-team-heading">
                  <h2>
                    Tu equipo<span className="ff-desktop-copy"> para este problema</span>
                  </h2>
                  <span>{phaseAssignments[phase.problems[step - 1].id].length} contactos</span>
                </div>
                {phaseAssignments[phase.problems[step - 1].id].length === 0 && (
                  <div className="ff-team-empty">
                    <div className="ff-desktop-copy">
                      <ArrowDown size={28} />
                      <strong>
                        {dropHovered && dragContactId
                          ? `Suelta para agregar a ${forestFireProfessionals.find((p) => p.id === dragContactId)?.personName}`
                          : 'Arrastra aquí a quien llamarías'}
                      </strong>
                      <p>
                        Revisa su hoja de vida en la lista de la derecha y suéltalo en este espacio. También
                        puedes usar el botón +.
                      </p>
                    </div>
                    <p className="ff-mobile-copy">Toca + en un contacto para sumarlo</p>
                  </div>
                )}
                <ul className="ff-team">
                  {phaseAssignments[phase.problems[step - 1].id].map((id) => {
                    const person = forestFireProfessionals.find((p) => p.id === id)!
                    return (
                      <li key={id}>
                        <span className="ff-initial">{person.personName.charAt(0)}</span>
                        <span>
                          <strong>{person.personName}</strong>
                          <small>{getOccupation(person.occupationId)?.name ?? person.name}</small>
                        </span>
                        <button
                          className="ff-icon-button"
                          aria-label={`Quitar a ${person.personName}`}
                          onClick={() =>
                            setAssignments((current) =>
                              toggleAssignment(current, phase.id, phase.problems[step - 1].id, id),
                            )
                          }
                        >
                          <X size={18} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
                {dropHovered && dragContactId && phaseAssignments[phase.problems[step - 1].id].length > 0 && (
                  <p className="ff-drop-label">
                    Suelta para agregar a{' '}
                    {forestFireProfessionals.find((p) => p.id === dragContactId)?.personName}
                  </p>
                )}
              </div>
              <StepActions
                onBack={() => goToStep(step - 1)}
                disabled={!phaseAssignments[phase.problems[step - 1].id].length}
                onNext={() => goToStep(step + 1)}
                label={step === phase.problems.length ? 'Revisar el equipo' : 'Siguiente problema'}
              />
            </div>
            <ProfessionalDirectory
              selectedIds={phaseAssignments[phase.problems[step - 1].id]}
              budgetRemaining={remaining}
              problemTitle={phase.problems[step - 1].title}
              onCall={(id) => call(phase.problems[step - 1].id, id)}
              onDragContact={(id, overTeam) => {
                setDragContactId(id)
                setDropHovered(!!id && !!overTeam)
              }}
            />
          </section>
        )}
        {screen === 'workspace' && step === phase.problems.length + 1 && (
          <section className="ff-content">
            <div className="ff-dark">
              <LumiMedallion />
              <p className="ff-eyebrow">Revisa tu equipo</p>
              <h1 tabIndex={-1}>¿Así enfrentarás la {phase.name.toLowerCase()}?</h1>
              <p>
                Usarás {Object.values(phaseAssignments).reduce((total, ids) => total + ids.length, 0)} puntos.
                {phaseIndex < forestFirePhases.length - 1 &&
                  ` Te quedarán ${remaining} para las fases siguientes.`}
              </p>
            </div>
            {phase.problems.map((problem, index) => (
              <article className="ff-light ff-review" key={problem.id}>
                <h2>{problem.title}</h2>
                <ul>
                  {phaseAssignments[problem.id].map((id) => {
                    const person = forestFireProfessionals.find((p) => p.id === id)!
                    return (
                      <li key={id}>
                        {person.personName} ({getOccupation(person.occupationId)?.name ?? person.name})
                      </li>
                    )
                  })}
                </ul>
                {!phaseAssignments[problem.id].length && <p>Este problema necesita al menos un contacto.</p>}
                <button
                  className="ff-secondary"
                  aria-label={`Cambiar equipo para ${problem.title}`}
                  onClick={() => goToStep(index + 1)}
                >
                  Cambiar
                </button>
              </article>
            ))}
            <StepActions
              onBack={() => goToStep(phase.problems.length)}
              disabled={!complete}
              onNext={() => {
                if (complete) setScreen('result')
              }}
              label="Confirmar equipo"
            />
          </section>
        )}
        {screen === 'result' && (
          <PhaseResultScreen
            phase={phase}
            assignments={phaseAssignments}
            remaining={remaining}
            onContinue={advance}
          />
        )}
        {screen === 'game-over' && (
          <section className="ff-intro" style={{ backgroundImage: `url(${phase.backgroundImage})` }}>
            <div className="ff-dark">
              <LumiMedallion />
              <h1 tabIndex={-1}>El presupuesto se agotó</h1>
              <p>
                Usaste los 16 puntos antes de completar todas las fases. Vuelve a intentarlo con un nuevo
                equipo.
              </p>
              <button className="ff-primary" onClick={restart}>
                Intentar de nuevo
              </button>
              <button className="ff-secondary" onClick={onClose}>
                Volver a la ciudad
              </button>
            </div>
          </section>
        )}
        {SHOW_EXTRA_PROFESSIONAL && screen === 'extra-question' && (
          <ExtraProfessionalQuestionScreen
            selectedProfessionalId={extraProfessionalId}
            reason={extraReason}
            onSelectProfessional={setExtraProfessionalId}
            onReasonChange={setExtraReason}
            onSubmit={() => setScreen('word-cloud')}
          />
        )}
        {SHOW_EXTRA_PROFESSIONAL && screen === 'word-cloud' && (
          <ProfessionalWordCloudScreen
            selectedProfessionalId={extraProfessionalId}
            reason={extraReason}
            onContinue={showReport}
          />
        )}
        {screen === 'report' && (
          <FinalReportScreen
            assignments={assignments}
            bestScore={adventure.caseBestScores['forest-fire'] ?? 0}
            newIconIds={newIconIds}
            onRestart={restart}
            onFinish={onComplete ?? onClose}
            extraReason={extraReason}
            extraProfessionalId={extraProfessionalId}
          />
        )}
        {screen === 'report' && (storageError || explorationError) && (
          <p className="ff-storage-warning" role="status">
            No se pudo guardar en este dispositivo. El resultado sigue disponible durante esta sesión.
          </p>
        )}
      </main>
    </div>
  )
}

function StepActions({
  onBack,
  onNext,
  disabled,
  label,
}: {
  onBack: () => void
  onNext: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <div className="ff-step-actions">
      <button className="ff-secondary" onClick={onBack}>
        Atrás
      </button>
      <button className="ff-primary" disabled={disabled} onClick={onNext}>
        {label}
        <ArrowRight size={18} />
      </button>
    </div>
  )
}

function ClueList({
  phase,
  label = 'Ver completo',
  onOpen,
}: {
  phase: ForestFirePhase
  label?: string
  onOpen?: () => void
}) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) onOpen?.()
      }}
    >
      <DialogTrigger asChild>
        <button className="ff-secondary">{label}</button>
      </DialogTrigger>
      <DialogContent className="ff-modal ff-responsive-modal">
        <DialogTitle>Lo que dijo la comunidad</DialogTitle>
        <DialogDescription>
          Las {phase.messages.length} pistas de la {phase.name.toLowerCase()}.
        </DialogDescription>
        <div className="ff-clue-list">
          {phase.messages.map((message, index) => (
            <article key={message.id}>
              <p className="ff-eyebrow">
                Pista {index + 1} de {phase.messages.length}
              </p>
              <h3>{message.speaker}</h3>
              <p>{message.context}</p>
              <blockquote>“{message.message}”</blockquote>
            </article>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SatisfactionBar({ score, bestScore }: { score: number; bestScore?: number }) {
  return (
    <div className="ff-satisfaction">
      <div className="ff-score-label">
        <strong>Satisfacción de la comunidad</strong>
        <span>
          {score} de {FOREST_FIRE_MAX_SATISFACTION} puntos
        </span>
      </div>
      <div
        className="ff-score-track"
        role="progressbar"
        aria-label="Satisfacción de la comunidad"
        aria-valuemin={0}
        aria-valuemax={FOREST_FIRE_MAX_SATISFACTION}
        aria-valuenow={score}
      >
        <div style={{ width: `${(score / FOREST_FIRE_MAX_SATISFACTION) * 100}%` }} />
        <i style={{ left: `${(FOREST_FIRE_PASS_SCORE / FOREST_FIRE_MAX_SATISFACTION) * 100}%` }} />
      </div>
      <p>Mínimo para superar: {FOREST_FIRE_PASS_SCORE}</p>
      {bestScore !== undefined && (
        <p>
          Tu mejor puntaje en este caso: {bestScore} de {FOREST_FIRE_MAX_SATISFACTION}.
        </p>
      )}
    </div>
  )
}

export function PhaseResultScreen({
  phase,
  assignments,
  remaining,
  onContinue,
}: {
  phase: ForestFirePhase
  assignments: Record<string, string[]>
  remaining: number
  onContinue: () => void
}) {
  const maximum = phase.problems.reduce((total, p) => total + p.expectedProfessionalIds.length, 0)
  const next = forestFirePhases.find((p) => p.number === phase.number + 1)
  return (
    <section className="ff-content">
      <div className="ff-dark ff-result-heading">
        <LumiMedallion />
        <p className="ff-eyebrow">Fase {phase.number} resuelta</p>
        <h1 tabIndex={-1}>Así respondió tu equipo a la {phase.name.toLowerCase()}</h1>
        <p>Revisa qué aportó cada persona y qué necesidades quedaron sin cubrir.</p>
        <strong>
          {getPhaseSatisfaction(phase, assignments)} de {maximum} puntos de satisfacción
        </strong>
      </div>
      {phase.problems.map((problem, index) => {
        const selected = assignments[problem.id] ?? []
        const satisfaction = getProblemSatisfaction(problem, selected)
        return (
          <article className="ff-light" key={problem.id}>
            <p className="ff-eyebrow">Problema {index + 1}</p>
            <h2>{problem.title}</h2>
            <div
              className="ff-stars"
              aria-label={`${satisfaction} de ${problem.expectedProfessionalIds.length}`}
            >
              {problem.expectedProfessionalIds.map((id, i) => (
                <Star key={id} aria-hidden="true" fill={i < satisfaction ? 'currentColor' : 'none'} />
              ))}
              <span>
                {satisfaction} de {problem.expectedProfessionalIds.length}
              </span>
            </div>
            <p>{problem.resultNarrative}</p>
            {selected.map((id) => {
              const person = forestFireProfessionals.find((p) => p.id === id)!
              const contributed = problem.expectedProfessionalIds.includes(id)
              return (
                <div key={id} className={`ff-contribution ${contributed ? 'is-helpful' : 'is-neutral'}`}>
                  {contributed ? <CheckCircle2 aria-hidden="true" /> : <Minus aria-hidden="true" />}
                  <div>
                    <strong>
                      {person.personName} ({getOccupation(person.occupationId)?.name ?? person.name})
                    </strong>
                    <p className="ff-eyebrow">{contributed ? 'Aportó' : 'No era su función aquí'}</p>
                    <p>
                      {contributed
                        ? problem.professionalContributions[id]
                        : 'Participó, pero su especialidad no respondía a la necesidad principal de este problema. Usó 1 punto de presupuesto.'}
                    </p>
                    {contributed && <ForestFireProfessionalPanel initialProfessionalId={id} />}
                  </div>
                </div>
              )
            })}
            {problem.expectedProfessionalIds
              .filter((id) => !selected.includes(id))
              .map((id) => (
                <div className="ff-contribution is-missing" key={id}>
                  <TriangleAlert aria-hidden="true" />
                  <div>
                    <strong>Quedó sin atender</strong>
                    <p>{problem.missingContributionNarratives[id]}</p>
                  </div>
                </div>
              ))}
          </article>
        )
      })}
      <div className="ff-dark ff-result-footer">
        {next && (
          <p>
            Te quedan {remaining} puntos de presupuesto para las fases{' '}
            {forestFirePhases
              .filter((p) => p.number > phase.number)
              .map((p) => p.number)
              .join(' y ')}
            .
          </p>
        )}
        <button className="ff-primary" onClick={onContinue}>
          {next ? `Ir a la fase ${next.number}: ${next.name}` : 'Ver el cierre del caso'}
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  )
}

export function FinalReportScreen({
  assignments,
  bestScore,
  newIconIds,
  onRestart,
  onFinish,
  extraReason,
  extraProfessionalId,
}: {
  assignments: ForestFireAssignments
  bestScore: number
  newIconIds: string[]
  onRestart: () => void
  onFinish: () => void
  extraReason: string
  extraProfessionalId: string
}) {
  const score = getTotalSatisfaction(assignments)
  const passed = score >= FOREST_FIRE_PASS_SCORE
  const testimonial = professionalTestimonials.find((t) => t.unlockCaseId === 'forest-fire')
  return (
    <section className="ff-content ff-report">
      <div className="ff-light ff-final-heading">
        <LumiMedallion celebration={passed} />
        <p>Lumi</p>
        <span className={`ff-status ${passed ? 'is-passed' : 'is-pending'}`}>
          {passed ? 'Caso superado' : 'Caso no superado todavía'}
        </span>
        <h1 tabIndex={-1}>
          {passed ? '¡La comunidad salió adelante!' : 'La comunidad aún necesita más ayuda'}
        </h1>
        <p>
          {passed
            ? `Reuniste un equipo que respondió a la mayoría de las necesidades.${score < FOREST_FIRE_MAX_SATISFACTION ? ` Algunas funciones quedaron sin cubrir: si quieres, intenta alcanzar los ${FOREST_FIRE_MAX_SATISFACTION} puntos.` : ''}`
            : 'Varias necesidades quedaron sin atender. Revisa las consecuencias de cada fase y vuelve con un nuevo equipo.'}
        </p>
        <SatisfactionBar score={score} bestScore={bestScore} />
      </div>
      <div className="ff-phase-summaries">
        {forestFirePhases.map((phase) => (
          <article className="ff-light" key={phase.id}>
            <h2>{phase.name}</h2>
            <strong>
              {getPhaseSatisfaction(phase, assignments[phase.id])} de{' '}
              {phase.problems.reduce((total, p) => total + p.expectedProfessionalIds.length, 0)}
            </strong>
            {phase.problems.map((problem) => (
              <div className="ff-summary-row" key={problem.id}>
                <span>{problem.title}</span>
                <strong>
                  {getProblemSatisfaction(problem, assignments[phase.id][problem.id])} de{' '}
                  {problem.expectedProfessionalIds.length}
                </strong>
              </div>
            ))}
          </article>
        ))}
      </div>
      {passed ? (
        <div className="ff-rewards">
          <h2>Lo que llevas contigo</h2>
          <div className="ff-light ff-reward">
            <p className="ff-eyebrow">Íconos de ocupación · {newIconIds.length} nuevos</p>
            {newIconIds.length ? (
              <ul>
                {newIconIds.map((id) => (
                  <li key={id}>
                    <a href={discoveryPaths.occupation(id)} target="_blank" rel="noopener noreferrer">
                      {getOccupation(id)?.name ?? id}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Ya tenías los íconos de las ocupaciones que aportaron en este intento.</p>
            )}
          </div>
          {testimonial && (
            <div className="ff-light ff-reward">
              <p className="ff-eyebrow">Testimonio desbloqueado</p>
              <h3>{testimonial.personName}</h3>
              <p>{testimonial.summary}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="ff-primary">Ver testimonio</button>
                </DialogTrigger>
                <DialogContent className="ff-modal">
                  <DialogTitle>{testimonial.personName}</DialogTitle>
                  <DialogDescription>{testimonial.currentRole}</DialogDescription>
                  <p>{testimonial.story}</p>
                  <a
                    className="ff-secondary"
                    href={testimonial.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver video del testimonio<span className="sr-only"> (abre otra pestaña)</span>
                  </a>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      ) : (
        <div className="ff-dark ff-locked">
          <LockKeyhole aria-hidden="true" />
          <h2>El testimonio y los íconos se desbloquean al superar el caso</h2>
          <p>
            Revisa en cada fase qué quedó sin atender y vuelve a intentarlo. Tu mejor puntaje queda guardado.
          </p>
        </div>
      )}
      {SHOW_EXTRA_PROFESSIONAL && extraProfessionalId && (
        <div className="ff-light">
          <h2>Tu aporte profesional adicional</h2>
          <p>{getOccupation(extraProfessionalId)?.name}</p>
          <p>{extraReason}</p>
        </div>
      )}
      <div className="ff-final-actions">
        {passed ? (
          <>
            <button className="ff-primary" onClick={onFinish}>
              Volver a la ciudad
            </button>
            {score < FOREST_FIRE_MAX_SATISFACTION && (
              <button className="ff-secondary" onClick={onRestart}>
                Intentar llegar a {FOREST_FIRE_MAX_SATISFACTION}
              </button>
            )}
          </>
        ) : (
          <>
            <button className="ff-primary" onClick={onRestart}>
              Intentar de nuevo
            </button>
            <button className="ff-secondary" onClick={onFinish}>
              Volver a la ciudad
            </button>
          </>
        )}
      </div>
    </section>
  )
}
