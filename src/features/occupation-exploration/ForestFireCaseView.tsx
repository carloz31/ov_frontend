import { useMemo, useRef, useState, type PointerEvent } from 'react'
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  GripVertical,
  HelpCircle,
  MapPinned,
  MessageCircle,
  MousePointer2,
  Plus,
  RadioTower,
  RotateCcw,
  Search,
  Star,
  TriangleAlert,
  WalletCards,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { forestFirePhases, forestFireProfessionals, forestFireWordCloud } from './data/ForestFireCaseData'
import {
  FOREST_FIRE_BUDGET_LIMIT,
  FOREST_FIRE_OPTIMAL_BUDGET,
  getBudgetEvaluation,
  getBudgetSpent,
  getPhaseSatisfaction,
  getProblemSatisfaction,
  getTotalSatisfaction,
} from './lib/ForestFireCaseLogic'
import { ForestFireProfessionalPanel } from './components/ForestFireProfessionalPanel'
import { ForestFireCaseTopBar } from './components/ForestFireCaseTopBar'
import { OccupationDetailDialog } from './components/OccupationDetailDialog'
import { occupationCatalog } from './data/OccupationExplorationData'
import type {
  ForestFireAssignments,
  ForestFireCommunityMessage,
  ForestFirePhase,
  ForestFireProblem,
  ForestFireProfessional,
} from './types/ForestFireCaseTypes'
import type { Occupation } from './types/OccupationExplorationTypes'

type ForestFireScreen =
  'phase-intro' | 'workspace' | 'result' | 'game-over' | 'extra-question' | 'word-cloud' | 'report'

type DraggedProfessional = {
  clientX: number
  clientY: number
  professionalId: string
  problemId?: string
}

function createInitialAssignments(): ForestFireAssignments {
  return Object.fromEntries(
    forestFirePhases.map((phase) => [
      phase.id,
      Object.fromEntries(phase.problems.map((problem) => [problem.id, []])),
    ]),
  )
}

function ForestFireCaseView({ onClose, onComplete }: { onClose: () => void; onComplete?: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [screen, setScreen] = useState<ForestFireScreen>('workspace')
  const [assignments, setAssignments] = useState<ForestFireAssignments>(createInitialAssignments)
  const [extraProfessionalId, setExtraProfessionalId] = useState('')
  const [extraReason, setExtraReason] = useState('')
  const currentPhase = forestFirePhases[phaseIndex]
  const budgetSpent = useMemo(() => getBudgetSpent(assignments), [assignments])
  const budgetRemaining = FOREST_FIRE_BUDGET_LIMIT - budgetSpent

  function toggleProfessional(problemId: string, professionalId: string) {
    setAssignments((current) => {
      const selectedIds = current[currentPhase.id][problemId]
      if (!selectedIds.includes(professionalId) && getBudgetSpent(current) >= FOREST_FIRE_BUDGET_LIMIT)
        return current
      const nextSelectedIds = selectedIds.includes(professionalId)
        ? selectedIds.filter((id) => id !== professionalId)
        : [...selectedIds, professionalId]

      return {
        ...current,
        [currentPhase.id]: {
          ...current[currentPhase.id],
          [problemId]: nextSelectedIds,
        },
      }
    })
  }

  function advanceAfterResult() {
    if (phaseIndex < forestFirePhases.length - 1) {
      if (budgetRemaining < 1) {
        setScreen('game-over')
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setPhaseIndex((current) => current + 1)
      setScreen('phase-intro')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setScreen('extra-question')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function restartCase() {
    setPhaseIndex(0)
    setAssignments(createInitialAssignments())
    setExtraProfessionalId('')
    setExtraReason('')
    setScreen('phase-intro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ForestFireCaseTopBar
        label={
          isFinalScreen(screen)
            ? 'Cierre del caso'
            : `Fase ${currentPhase.number} de 3 · ${currentPhase.name}`
        }
        onClose={onClose}
        progress={isFinalScreen(screen) ? undefined : (currentPhase.number / forestFirePhases.length) * 100}
      />
      <main
        className={cn(
          screen === 'phase-intro' ||
            screen === 'workspace' ||
            screen === 'result' ||
            screen === 'game-over' ||
            screen === 'extra-question' ||
            screen === 'word-cloud' ||
            screen === 'report'
            ? ''
            : 'mx-auto max-w-[1180px] px-5 py-7 md:px-8 md:py-9',
        )}
      >
        {screen === 'phase-intro' && (
          <PhaseIntroScreen onContinue={() => setScreen('workspace')} phase={currentPhase} />
        )}
        {screen === 'workspace' && (
          <PhaseWorkspaceScreen
            assignments={assignments[currentPhase.id]}
            budgetLimit={FOREST_FIRE_BUDGET_LIMIT}
            budgetRemaining={budgetRemaining}
            onConfirm={() => setScreen('result')}
            onToggle={toggleProfessional}
            phase={currentPhase}
          />
        )}
        {screen === 'result' && (
          <PhaseResultScreen
            assignments={assignments[currentPhase.id]}
            budgetLimit={FOREST_FIRE_BUDGET_LIMIT}
            budgetRemaining={budgetRemaining}
            budgetSpent={budgetSpent}
            finalPhase={phaseIndex === forestFirePhases.length - 1}
            onContinue={advanceAfterResult}
            phase={currentPhase}
          />
        )}
        {screen === 'game-over' && <BudgetGameOverScreen onRestart={restartCase} phase={currentPhase} />}
        {screen === 'extra-question' && (
          <FinalPhaseBackground>
            <ExtraProfessionalQuestionScreen
              onReasonChange={setExtraReason}
              onSelectProfessional={setExtraProfessionalId}
              onSubmit={() => setScreen('word-cloud')}
              reason={extraReason}
              selectedProfessionalId={extraProfessionalId}
            />
          </FinalPhaseBackground>
        )}
        {screen === 'word-cloud' && (
          <FinalPhaseBackground>
            <ProfessionalWordCloudScreen
              onContinue={() => setScreen('report')}
              reason={extraReason}
              selectedProfessionalId={extraProfessionalId}
            />
          </FinalPhaseBackground>
        )}
        {screen === 'report' && (
          <FinalPhaseBackground>
            <FinalReportScreen
              answer={extraReason}
              assignments={assignments}
              onFinish={onComplete ?? onClose}
              selectedProfessionalId={extraProfessionalId}
            />
          </FinalPhaseBackground>
        )}
      </main>
    </div>
  )
}

function isFinalScreen(screen: ForestFireScreen) {
  return (
    screen === 'game-over' || screen === 'extra-question' || screen === 'word-cloud' || screen === 'report'
  )
}

function PhaseIntroScreen({ onContinue, phase }: { onContinue: () => void; phase: ForestFirePhase }) {
  return (
    <section className="relative min-h-[calc(100vh-5.25rem)] overflow-hidden bg-[#171522]">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        src={phase.backgroundImage}
        style={{ objectPosition: phase.backgroundPosition }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#111522]/78 via-[#171622]/28 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#11121d]/82 via-transparent to-[#10121c]/15"
      />
      <div className="absolute inset-0 grid place-items-center p-5 md:p-12">
        <div className="w-full max-w-3xl rounded-[28px] border border-white/25 bg-[#191725]/80 p-7 text-center text-white shadow-[0_28px_80px_rgb(0_0_0/38%)] backdrop-blur-xl md:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#ff855f] shadow-lg shadow-orange-950/25">
            <Flame className="size-7" />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/55">Siguiente etapa</p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-[0.045em] sm:text-5xl">
            Fase {phase.number}: {phase.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/72">{phase.subtitle}</p>
          <Button className="mt-7 bg-white text-[#3a355f] hover:bg-white/90" onClick={onContinue} size="lg">
            Comenzar fase <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  )
}

function PhaseWorkspaceScreen({
  assignments,
  budgetLimit,
  budgetRemaining,
  onConfirm,
  onToggle,
  phase,
}: {
  assignments: Record<string, string[]>
  budgetLimit: number
  budgetRemaining: number
  onConfirm: () => void
  onToggle: (problemId: string, professionalId: string) => void
  phase: ForestFirePhase
}) {
  const [selectedMessage, setSelectedMessage] = useState<ForestFireCommunityMessage>()
  const [readMessageIds, setReadMessageIds] = useState<string[]>([])
  const [activeProfessionalId, setActiveProfessionalId] = useState<string>()
  const [draggedProfessional, setDraggedProfessional] = useState<DraggedProfessional>()
  const [budgetWarning, setBudgetWarning] = useState(false)
  const [teamDialog, setTeamDialog] = useState<'incomplete' | 'confirm'>()
  const professionalDockRef = useRef<HTMLDivElement>(null)
  const incompleteProblems = phase.problems.filter((problem) => assignments[problem.id].length === 0)
  const phaseAssignmentCount = Object.values(assignments).reduce(
    (total, professionalIds) => total + professionalIds.length,
    0,
  )

  function openAlert(message: ForestFireCommunityMessage) {
    setSelectedMessage(message)
    setReadMessageIds((current) => (current.includes(message.id) ? current : [...current, message.id]))
  }

  function assignProfessional(problemId: string, professionalId: string) {
    if (!assignments[problemId].includes(professionalId)) {
      if (budgetRemaining < 1) {
        setBudgetWarning(true)
        return
      }
      setBudgetWarning(false)
      onToggle(problemId, professionalId)
    }
  }

  function getProblemIdAtPoint(clientX: number, clientY: number) {
    const dropTarget = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-problem-id]')
    return dropTarget?.dataset.problemId
  }

  function moveProfessional(professionalId: string, clientX: number, clientY: number) {
    setDraggedProfessional({
      clientX,
      clientY,
      professionalId,
      problemId: getProblemIdAtPoint(clientX, clientY),
    })
  }

  function dropProfessional(professionalId: string, clientX: number, clientY: number) {
    setDraggedProfessional(undefined)
    const problemId = getProblemIdAtPoint(clientX, clientY)
    if (problemId) assignProfessional(problemId, professionalId)
  }

  function scrollProfessionalDock(direction: 'previous' | 'next') {
    professionalDockRef.current?.scrollBy({
      behavior: 'smooth',
      left: direction === 'next' ? 540 : -540,
    })
  }

  function requestTeamConfirmation() {
    setTeamDialog(incompleteProblems.length > 0 ? 'incomplete' : 'confirm')
  }

  function confirmTeam() {
    setTeamDialog(undefined)
    onConfirm()
  }

  return (
    <section className="min-h-[calc(100vh-5.25rem)] bg-[#111522] lg:h-[calc(100vh-5.25rem)] lg:overflow-hidden">
      <div className="grid min-h-[calc(100vh-5.25rem)] lg:h-full lg:min-h-0 lg:grid-cols-[370px_minmax(0,1fr)]">
        <aside className="case-scrollbar relative z-20 border-r border-white/10 bg-[#141522] p-5 text-white shadow-[18px_0_50px_rgb(0_0_0/22%)] md:p-6 lg:h-full lg:overflow-y-auto">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-[#ff8d65] text-white shadow-lg shadow-orange-950/20">
                <MapPinned className="size-5" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/38">
                  Mapa del caso · Fase {phase.number}
                </p>
                <h1 className="mt-0.5 text-xl font-black">{phase.name}</h1>
              </div>
            </div>
            <Badge className="border-white/10 bg-white/7 text-white/58" variant="outline">
              {readMessageIds.length}/4
            </Badge>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">
                  Pistas del escenario
                </p>
                <p className="mt-1 text-sm text-white/58">Abre las señales para reconstruir lo que ocurre.</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {phase.messages.map((message, index) => {
                const read = readMessageIds.includes(message.id)
                return (
                  <button
                    className={cn(
                      'group w-full rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9a2ff]',
                      read
                        ? 'border-white/10 bg-white/6 hover:bg-white/9'
                        : 'border-[#ff9b70]/35 bg-[#ff8d65]/10 hover:border-[#ff9b70]/65 hover:bg-[#ff8d65]/15',
                    )}
                    key={message.id}
                    onClick={() => openAlert(message)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.13em] text-white/42">
                        <RadioTower className="size-3.5" /> Pista {String(index + 1).padStart(2, '0')}
                      </span>
                      {read ? (
                        <Check className="size-4 text-emerald-300" />
                      ) : (
                        <Badge className="bg-[#ff8d65] text-white" variant="warning">
                          Nuevo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-bold text-white/90">
                      {read ? message.speaker : 'Señal sin revisar'}
                    </p>
                    <p
                      className={cn(
                        'mt-1 overflow-hidden text-xs leading-5',
                        read ? 'max-h-10 text-white/44' : 'text-white/32',
                      )}
                    >
                      {read ? message.message : 'Pulsa para escuchar el mensaje y añadirlo a tu análisis.'}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#7f77e6]/22 bg-[#6f66da]/10 p-4 text-xs leading-5 text-white/55">
            <HelpCircle className="mb-2 size-4 text-[#aaa4ff]" />
            Las pistas orientan tu análisis, pero no revelan qué profesión debes elegir.
          </div>
        </aside>

        <div className="relative min-h-[980px] overflow-hidden lg:h-full lg:min-h-0">
          <img
            alt="Escenario del caso de incendio forestal"
            className="absolute inset-0 size-full object-cover"
            src={phase.backgroundImage}
            style={{ objectPosition: phase.backgroundPosition }}
          />

          <div className="absolute left-5 top-5 z-10 rounded-2xl border border-white/55 bg-white/92 px-4 py-3 text-[#29283a] shadow-[0_16px_45px_rgb(0_0_0/20%)] backdrop-blur-sm md:left-7 md:top-7">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#817b8a]">
              Escenario visible
            </p>
            <p className="mt-0.5 text-sm font-bold">Ubica los problemas sobre el mapa</p>
          </div>

          <div className="absolute right-5 top-5 z-20 flex items-center gap-2 md:right-7 md:top-7">
            <div
              className={cn(
                'rounded-2xl border px-4 py-3 shadow-[0_16px_45px_rgb(0_0_0/20%)] backdrop-blur-sm',
                budgetRemaining > 0
                  ? 'border-white/55 bg-white/92 text-[#29283a]'
                  : 'border-red-200 bg-red-50/95 text-red-700',
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] opacity-55">Presupuesto</p>
              <p className="mt-0.5 flex items-center gap-2 text-sm font-black">
                <WalletCards className="size-4" /> {budgetRemaining} / {budgetLimit}
              </p>
            </div>
            <Button
              className="h-auto min-h-14 rounded-2xl bg-[#ff875f] px-5 shadow-[0_16px_45px_rgb(0_0_0/20%)] hover:bg-[#f47550]"
              onClick={requestTeamConfirmation}
            >
              <span className="text-left">
                <span className="block text-sm font-black">Confirmar equipo</span>
                <span className="block text-[10px] font-medium text-white/70">Revisar y continuar</span>
              </span>
              <Check />
            </Button>
          </div>

          <div className="absolute inset-x-5 top-28 z-10 grid gap-4 pb-[290px] lg:inset-0 lg:block lg:pb-0">
            {phase.problems.map((problem, index) => (
              <MapProblemNode
                activeProfessionalId={activeProfessionalId}
                budgetRemaining={budgetRemaining}
                dragActive={Boolean(draggedProfessional)}
                dragHovered={draggedProfessional?.problemId === problem.id}
                key={problem.id}
                number={index + 1}
                onAssign={(professionalId) => assignProfessional(problem.id, professionalId)}
                onRemove={(professionalId) => {
                  setBudgetWarning(false)
                  onToggle(problem.id, professionalId)
                }}
                positionClassName={index === 0 ? 'lg:left-[5%] lg:top-[18%]' : 'lg:right-[5%] lg:top-[18%]'}
                problem={problem}
                selectedIds={assignments[problem.id]}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/12 bg-[#141522]/96 p-4 text-white shadow-[0_-18px_55px_rgb(0_0_0/28%)] backdrop-blur-xl md:p-5">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <GripVertical className="size-5 text-[#ff9b70]" />
                <div>
                  <p className="text-sm font-black">Profesionales disponibles</p>
                  <p className="text-xs text-white/42">
                    Cada asignación consume 1 punto. Te quedan{' '}
                    <strong className={cn(budgetRemaining > 0 ? 'text-white' : 'text-red-300')}>
                      {budgetRemaining}
                    </strong>{' '}
                    de {budgetLimit}.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ForestFireProfessionalPanel triggerLabel="Guía profesional" />
                <div className="flex items-center rounded-xl border border-white/12 bg-white/7 p-1">
                  <Button
                    aria-label="Ver profesiones anteriores"
                    className="text-white hover:bg-white/12 hover:text-white"
                    onClick={() => scrollProfessionalDock('previous')}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronLeft />
                  </Button>
                  <span className="px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/42">
                    Desplazar
                  </span>
                  <Button
                    aria-label="Ver más profesiones"
                    className="text-white hover:bg-white/12 hover:text-white"
                    onClick={() => scrollProfessionalDock('next')}
                    size="icon"
                    variant="ghost"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
            </div>
            {budgetWarning && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-400/12 px-3 py-2 text-xs font-semibold text-red-200">
                <TriangleAlert className="size-4" />
                Presupuesto agotado. Retira una asignación antes de añadir otra.
              </div>
            )}
            <div
              className="case-scrollbar-hidden flex snap-x gap-3 overflow-x-auto pb-2"
              ref={professionalDockRef}
            >
              {forestFireProfessionals.map((professional) => {
                const assignedCount = Object.values(assignments).filter((ids) =>
                  ids.includes(professional.id),
                ).length
                return (
                  <ProfessionalDockCard
                    active={activeProfessionalId === professional.id}
                    assignedCount={assignedCount}
                    dragging={draggedProfessional?.professionalId === professional.id}
                    key={professional.id}
                    onDragCancel={() => setDraggedProfessional(undefined)}
                    onDragMove={(clientX, clientY) => moveProfessional(professional.id, clientX, clientY)}
                    onDrop={(clientX, clientY) => dropProfessional(professional.id, clientX, clientY)}
                    onDragStart={(clientX, clientY) => moveProfessional(professional.id, clientX, clientY)}
                    onSelect={() =>
                      setActiveProfessionalId((current) =>
                        current === professional.id ? undefined : professional.id,
                      )
                    }
                    professional={professional}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
      {draggedProfessional && (
        <ProfessionalDragPreview
          clientX={draggedProfessional.clientX}
          clientY={draggedProfessional.clientY}
          professional={forestFireProfessionals.find(
            (professional) => professional.id === draggedProfessional.professionalId,
          )!}
        />
      )}
      <AlertMessageDialog message={selectedMessage} onClose={() => setSelectedMessage(undefined)} />
      <Dialog onOpenChange={(open) => !open && setTeamDialog(undefined)} open={Boolean(teamDialog)}>
        <DialogContent className="max-w-lg" showCloseButton={false}>
          {teamDialog === 'incomplete' ? (
            <>
              <DialogHeader className="text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                  <TriangleAlert className="size-6" />
                </span>
                <DialogTitle>Aún falta completar el mapa</DialogTitle>
                <DialogDescription>
                  Para continuar debes asignar como mínimo un profesional a cada problema de esta fase.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800/60">
                  Problemas pendientes
                </p>
                <ul className="mt-3 space-y-2">
                  {incompleteProblems.map((problem) => (
                    <li
                      className="flex items-center gap-2 text-sm font-semibold text-amber-950"
                      key={problem.id}
                    >
                      <span className="size-2 rounded-full bg-amber-500" />
                      {problem.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setTeamDialog(undefined)}>Volver al mapa</Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="size-6" />
                </span>
                <DialogTitle>¿Confirmar este equipo?</DialogTitle>
                <DialogDescription>
                  Al continuar verás el resultado de la fase y ya no podrás modificar estas asignaciones.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border bg-muted/35 p-4 text-center">
                  <p className="text-2xl font-black">{phaseAssignmentCount}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Asignaciones</p>
                </div>
                <div className="rounded-2xl border bg-muted/35 p-4 text-center">
                  <p className="text-2xl font-black">{budgetRemaining}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Presupuesto restante</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                <Button onClick={() => setTeamDialog(undefined)} variant="outline">
                  Seguir revisando
                </Button>
                <Button className="bg-[#ff875f] hover:bg-[#f47550]" onClick={confirmTeam}>
                  Sí, continuar <ArrowRight />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function AlertMessageDialog({
  message,
  onClose,
}: {
  message: ForestFireCommunityMessage | undefined
  onClose: () => void
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={Boolean(message)}>
      {message && (
        <DialogContent
          className="max-w-2xl overflow-hidden border-[#4b4965] bg-[#151622] p-0 text-white"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          showCloseButton={false}
        >
          <div className="border-b border-white/10 bg-[#1d1d2e] px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="relative grid size-11 place-items-center rounded-xl bg-[#ff966c]/16 text-[#ffae88]">
                <RadioTower className="size-5" />
                <span className="absolute right-1 top-1 size-2 rounded-full bg-[#ff8d65] shadow-[0_0_9px_rgb(255_141_101/90%)]" />
              </span>
              <DialogHeader className="mb-0 pr-0">
                <DialogTitle className="text-lg">Transmisión recibida</DialogTitle>
                <DialogDescription className="text-white/40">
                  Canal comunitario · señal registrada
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{message.speaker}</p>
                <p className="mt-0.5 text-xs text-white/42">{message.context}</p>
              </div>
              <Badge className="border-white/10 bg-white/7 text-white/55" variant="outline">
                Audio transcrito
              </Badge>
            </div>
            <div className="relative rounded-2xl border border-white/10 bg-[#29283f] p-5 md:p-6">
              <span className="absolute -left-2 top-6 size-4 rotate-45 border-b border-l border-white/10 bg-[#29283f]" />
              <p className="text-lg font-semibold leading-8 text-white/90">“{message.message}”</p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button className="bg-[#ff875f] hover:bg-[#f47550]" onClick={onClose}>
                Registrar pista <Check />
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

function MapProblemNode({
  activeProfessionalId,
  budgetRemaining,
  dragActive,
  dragHovered,
  number,
  onAssign,
  onRemove,
  positionClassName,
  problem,
  selectedIds,
}: {
  activeProfessionalId: string | undefined
  budgetRemaining: number
  dragActive: boolean
  dragHovered: boolean
  number: number
  onAssign: (professionalId: string) => void
  onRemove: (professionalId: string) => void
  positionClassName: string
  problem: ForestFireProblem
  selectedIds: string[]
}) {
  const selectedProfessionals = selectedIds
    .map((id) => forestFireProfessionals.find((professional) => professional.id === id))
    .filter((professional) => professional !== undefined)
  const activeProfessional = forestFireProfessionals.find(
    (professional) => professional.id === activeProfessionalId,
  )

  return (
    <article
      aria-label={`Problema ${number}: ${problem.title}. Zona para asignar profesionales.`}
      className={cn(
        'relative rounded-3xl border border-white/75 bg-[#fbf8ef]/96 p-4 text-[#29283a] shadow-[0_20px_55px_rgb(0_0_0/28%)] backdrop-blur-sm transition-transform lg:absolute lg:w-[370px]',
        dragActive && 'ring-2 ring-[#a9a2ff]/70 ring-offset-2 ring-offset-transparent',
        dragHovered && 'scale-[1.025] border-[#ff875f] ring-4 ring-[#ff875f]/60',
        positionClassName,
      )}
      data-problem-id={problem.id}
    >
      <span
        aria-hidden="true"
        className="absolute -left-3 top-7 grid size-7 place-items-center rounded-full border-4 border-white bg-[#ff875f] text-[10px] font-black text-white shadow-lg"
      >
        {number}
      </span>
      <div className="flex items-start justify-between gap-3 border-b border-[#ded8ca] pb-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8a8390]">
            Problema localizado
          </p>
          <h2 className="mt-1 text-lg font-black">{problem.title}</h2>
        </div>
        <Badge
          className={cn(
            selectedIds.length > 0
              ? 'bg-[var(--success-soft)] text-[var(--success)]'
              : 'bg-[#ece8dd] text-[#77717e]',
          )}
          variant="secondary"
        >
          {selectedIds.length} asignados
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#696472]">{problem.detail}</p>

      <div className="mt-3 min-h-16 rounded-2xl border border-dashed border-[#c9c2b5] bg-white/58 p-3">
        {selectedProfessionals.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedProfessionals.map((professional) => (
              <button
                className="group flex items-center gap-2 rounded-xl bg-[#e3f4eb] px-2.5 py-2 text-left text-xs font-bold text-[#28775c] hover:bg-[#d5eddf] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#32a67b]/35"
                key={professional.id}
                onClick={() => onRemove(professional.id)}
                type="button"
              >
                <span className="grid size-6 place-items-center rounded-lg bg-white/80 text-[10px]">
                  {professional.personName
                    .split(' ')
                    .map((part) => part.charAt(0))
                    .join('')}
                </span>
                <span className="max-w-32 truncate">{professional.name}</span>
                <X className="size-3 opacity-45 group-hover:opacity-90" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center gap-2 text-xs leading-5 text-[#898391]">
            <MousePointer2 className="size-4 shrink-0 text-[#655bd8]" />
            Arrastra aquí una carta profesional.
          </div>
        )}
      </div>

      {activeProfessional ? (
        <Button
          className="mt-3 w-full"
          disabled={selectedIds.includes(activeProfessional.id) || budgetRemaining < 1}
          onClick={() => onAssign(activeProfessional.id)}
          size="sm"
        >
          {selectedIds.includes(activeProfessional.id)
            ? `${activeProfessional.name} ya está asignado`
            : budgetRemaining < 1
              ? 'Presupuesto agotado'
              : `Asignar a ${activeProfessional.name} · −1`}
        </Button>
      ) : (
        <p className="mt-3 text-center text-[11px] font-semibold text-[#8a8390]">
          También puedes seleccionar una carta en la barra inferior.
        </p>
      )}
    </article>
  )
}

function ProfessionalDockCard({
  active,
  assignedCount,
  dragging,
  onDragCancel,
  onDragMove,
  onDragStart,
  onDrop,
  onSelect,
  professional,
}: {
  active: boolean
  assignedCount: number
  dragging: boolean
  onDragCancel: () => void
  onDragMove: (clientX: number, clientY: number) => void
  onDragStart: (clientX: number, clientY: number) => void
  onDrop: (clientX: number, clientY: number) => void
  onSelect: () => void
  professional: ForestFireProfessional
}) {
  const draggingPointerId = useRef<number | undefined>(undefined)
  const pointerStart = useRef<{ clientX: number; clientY: number } | undefined>(undefined)
  const dragStarted = useRef(false)
  const suppressClick = useRef(false)

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-no-card-drag]')) return
    draggingPointerId.current = event.pointerId
    pointerStart.current = { clientX: event.clientX, clientY: event.clientY }
    dragStarted.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (draggingPointerId.current !== event.pointerId || !pointerStart.current) return
    const distance = Math.hypot(
      event.clientX - pointerStart.current.clientX,
      event.clientY - pointerStart.current.clientY,
    )
    if (!dragStarted.current && distance < 6) return
    if (!dragStarted.current) {
      dragStarted.current = true
      onDragStart(event.clientX, event.clientY)
    } else {
      onDragMove(event.clientX, event.clientY)
    }
    event.preventDefault()
  }

  function finishDrag(event: PointerEvent<HTMLElement>, dropped: boolean) {
    if (draggingPointerId.current !== event.pointerId) return
    const wasDragging = dragStarted.current
    draggingPointerId.current = undefined
    pointerStart.current = undefined
    dragStarted.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!wasDragging) return
    suppressClick.current = true
    window.setTimeout(() => {
      suppressClick.current = false
    }, 0)
    if (dropped) onDrop(event.clientX, event.clientY)
    else onDragCancel()
  }

  return (
    <article
      className={cn(
        'w-[250px] shrink-0 snap-start rounded-2xl border p-3 transition-all select-none touch-none',
        dragging
          ? 'scale-[1.02] border-[#ff9b70] bg-white/16 shadow-[0_0_0_3px_rgb(255_155_112/18%)]'
          : active
            ? 'border-[#9b94ff] bg-[#6d64d8]/24 shadow-[0_0_0_2px_rgb(155_148_255/12%)]'
            : 'border-white/12 bg-white/7 hover:border-white/25 hover:bg-white/10',
      )}
      onClickCapture={(event) => {
        if (!suppressClick.current) return
        suppressClick.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
      onLostPointerCapture={(event) => finishDrag(event, false)}
      onPointerCancel={(event) => finishDrag(event, false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishDrag(event, true)}
    >
      <div className="flex items-center justify-between gap-2">
        <GripVertical className="size-4 cursor-grab text-white/25" />
        {assignedCount > 0 ? (
          <Badge className="bg-emerald-400/16 text-emerald-200" variant="success">
            En {assignedCount} problema{assignedCount > 1 ? 's' : ''}
          </Badge>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/28">Disponible</span>
        )}
        <div data-no-card-drag onClick={(event) => event.stopPropagation()}>
          <ForestFireProfessionalPanel compact initialProfessionalId={professional.id} />
        </div>
      </div>
      <button
        aria-pressed={active}
        className="mt-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9a2ff]"
        onClick={onSelect}
        type="button"
      >
        <p className="truncate text-sm font-black text-white">{professional.name}</p>
        <p className="mt-0.5 truncate text-xs text-white/46">{professional.personName}</p>
        <div className="mt-3 flex gap-1.5 overflow-hidden">
          {professional.skills.slice(0, 2).map((skill) => (
            <span
              className="shrink-0 rounded-lg bg-black/18 px-2 py-1 text-[10px] font-semibold text-white/55"
              key={skill}
            >
              {skill}
            </span>
          ))}
        </div>
      </button>
    </article>
  )
}

function ProfessionalDragPreview({
  clientX,
  clientY,
  professional,
}: {
  clientX: number
  clientY: number
  professional: ForestFireProfessional
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-[100] w-[250px] -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-2xl border border-[#ffb08f] bg-[#24233b]/96 p-3 text-white opacity-95 shadow-[0_24px_70px_rgb(0_0_0/48%)] backdrop-blur-md"
      style={{ left: clientX, top: clientY }}
    >
      <div className="flex items-center gap-2 text-[#ffb08f]">
        <GripVertical className="size-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Arrastrando profesional</span>
      </div>
      <p className="mt-3 truncate text-sm font-black">{professional.name}</p>
      <p className="mt-0.5 truncate text-xs text-white/55">{professional.personName}</p>
      <div className="mt-3 flex gap-1.5 overflow-hidden">
        {professional.skills.slice(0, 2).map((skill) => (
          <span className="shrink-0 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold" key={skill}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

function PhaseResultScreen({
  assignments,
  budgetLimit,
  budgetRemaining,
  budgetSpent,
  finalPhase,
  onContinue,
  phase,
}: {
  assignments: Record<string, string[]>
  budgetLimit: number
  budgetRemaining: number
  budgetSpent: number
  finalPhase: boolean
  onContinue: () => void
  phase: ForestFirePhase
}) {
  const phaseSatisfaction = getPhaseSatisfaction(phase, assignments)
  const phaseOptimal = phase.problems.reduce(
    (total, problem) => total + problem.expectedProfessionalIds.length,
    0,
  )
  const phaseSpent = Object.values(assignments).reduce(
    (total, professionalIds) => total + professionalIds.length,
    0,
  )

  return (
    <section className="relative min-h-[calc(100vh-5.25rem)] overflow-hidden bg-[#111522]">
      <img
        alt=""
        aria-hidden="true"
        className="fixed inset-x-0 top-20 h-[calc(100vh-5rem)] w-full object-cover"
        src={phase.backgroundImage}
        style={{ objectPosition: phase.backgroundPosition }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 top-20 bg-gradient-to-b from-[#101522]/20 via-[#101522]/38 to-[#0b0e18]/84"
      />
      <div className="relative mx-auto max-w-[1120px] px-5 py-7 md:px-8 md:py-9">
        <div className="rounded-3xl border border-white/18 bg-[#171827]/84 p-6 text-white shadow-[0_28px_80px_rgb(0_0_0/32%)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <Badge className="border-white/12 bg-white/8 text-white/65" variant="outline">
                <Flame className="size-3.5" /> Fase {phase.number} resuelta
              </Badge>
              <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                Resultado de {phase.name.toLowerCase()}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/58">
                Revisa qué aportó cada persona y qué necesidades quedaron sin cubrir.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[390px]">
              <ResultMetric
                icon={<Star />}
                label="Satisfacción"
                value={`${phaseSatisfaction}/${phaseOptimal}`}
              />
              <ResultMetric icon={<WalletCards />} label="Gastado aquí" value={String(phaseSpent)} />
              <ResultMetric
                icon={<WalletCards />}
                label="Disponible"
                value={`${budgetRemaining}/${budgetLimit}`}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {phase.problems.map((problem) => {
            const selectedProfessionals = assignments[problem.id]
              .map((id) => forestFireProfessionals.find((professional) => professional.id === id))
              .filter((professional) => professional !== undefined)
            const missingNarratives = problem.expectedProfessionalIds
              .filter((id) => !assignments[problem.id].includes(id))
              .map((id) => problem.missingContributionNarratives[id])
              .filter(Boolean)
            const satisfaction = getProblemSatisfaction(problem, assignments[problem.id])
            return (
              <Card
                className="border-white/55 bg-white/95 p-5 shadow-[0_22px_60px_rgb(0_0_0/22%)] backdrop-blur-sm md:p-6"
                key={problem.id}
              >
                <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      Informe del problema
                    </p>
                    <h2 className="mt-1 text-xl font-black">{problem.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {problem.resultNarrative}
                    </p>
                  </div>
                  <Badge
                    variant={satisfaction === problem.expectedProfessionalIds.length ? 'success' : 'warning'}
                  >
                    <Star className="size-3.5" /> {satisfaction}/{problem.expectedProfessionalIds.length}{' '}
                    satisfacción
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedProfessionals.length > 0 ? (
                    selectedProfessionals.map((professional) => {
                      const contributed = problem.expectedProfessionalIds.includes(professional.id)
                      return (
                        <div
                          className={cn(
                            'flex items-start gap-3 rounded-2xl border p-4',
                            contributed ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50',
                          )}
                          key={professional.id}
                        >
                          <span
                            className={cn(
                              'grid size-10 shrink-0 place-items-center rounded-xl',
                              contributed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                            )}
                          >
                            {contributed ? <CheckCircle2 className="size-5" /> : <X className="size-5" />}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-black">{professional.personName}</p>
                              <Badge variant={contributed ? 'success' : 'outline'}>{professional.name}</Badge>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {contributed
                                ? problem.professionalContributions[professional.id]
                                : `${professional.personName} participó, pero su especialidad no respondía a la necesidad principal de este problema. Esta asignación gastó presupuesto y no sumó satisfacción.`}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed bg-muted/45 p-4 text-sm text-muted-foreground">
                      No se asignó a ninguna persona a este problema.
                    </div>
                  )}
                </div>

                {missingNarratives.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.13em] text-amber-800">
                      Consecuencias observadas
                    </p>
                    <div className="mt-2 space-y-2">
                      {missingNarratives.map((narrative) => (
                        <p
                          className="flex items-start gap-2 text-sm leading-6 text-amber-900"
                          key={narrative}
                        >
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                          {narrative}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-amber-800/70">
                      Revisa las funciones que quedaron sin atender antes de volver a intentarlo.
                    </p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/18 bg-[#171827]/88 p-4 text-white shadow-xl backdrop-blur-xl sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold">
              Presupuesto acumulado: {budgetSpent} de {budgetLimit}
            </p>
            <p className="mt-1 text-xs text-white/45">El presupuesto no se recupera entre fases.</p>
          </div>
          <Button className="bg-[#ff875f] hover:bg-[#f47550]" onClick={onContinue} size="lg">
            {finalPhase ? 'Ver informe de cierre' : `Avanzar a la Fase ${phase.number + 1}`} <ArrowRight />
          </Button>
        </div>
      </div>
    </section>
  )
}

function BudgetGameOverScreen({ onRestart, phase }: { onRestart: () => void; phase: ForestFirePhase }) {
  return (
    <section className="relative grid min-h-[calc(100vh-5.25rem)] place-items-center overflow-hidden bg-[#111522] p-5">
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
        src={phase.backgroundImage}
        style={{ objectPosition: phase.backgroundPosition }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#111522]/62" />
      <Card className="relative max-w-2xl border-red-200 bg-white/96 p-7 text-center shadow-[0_30px_90px_rgb(0_0_0/35%)] backdrop-blur-xl md:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-red-100 text-red-600">
          <TriangleAlert className="size-8" />
        </span>
        <Badge className="mt-5 bg-red-100 text-red-700" variant="warning">
          Presupuesto insuficiente
        </Badge>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.035em]">No puedes iniciar la siguiente fase</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Utilizaste todo el presupuesto disponible. Para continuar necesitas conservar al menos 1 punto que
          permita asignar a una persona en la siguiente fase.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Revisa las pistas, evita asignaciones que no aportan y vuelve a intentarlo desde la Fase 1.
        </p>
        <Button className="mt-7" onClick={onRestart} size="lg">
          <RotateCcw /> Volver a intentarlo desde el inicio
        </Button>
      </Card>
    </section>
  )
}

function FinalPhaseBackground({ children }: { children: React.ReactNode }) {
  const finalPhase = forestFirePhases[forestFirePhases.length - 1]
  return (
    <section className="relative min-h-[calc(100vh-5.25rem)] overflow-hidden bg-[#111522]">
      <img
        alt=""
        aria-hidden="true"
        className="fixed inset-x-0 top-20 h-[calc(100vh-5rem)] w-full object-cover"
        src={finalPhase.backgroundImage}
        style={{ objectPosition: finalPhase.backgroundPosition }}
      />
      <div
        aria-hidden="true"
        className="fixed inset-x-0 bottom-0 top-20 bg-gradient-to-b from-[#101522]/32 via-[#101522]/46 to-[#0b0e18]/82"
      />
      <div className="relative mx-auto max-w-[1180px] px-5 py-7 md:px-8 md:py-9">{children}</div>
    </section>
  )
}

function FinalReportScreen({
  answer,
  assignments,
  onFinish,
  selectedProfessionalId,
}: {
  answer: string
  assignments: ForestFireAssignments
  onFinish: () => void
  selectedProfessionalId: string
}) {
  const totalAssignments = useMemo(() => getBudgetSpent(assignments), [assignments])
  const missionSatisfaction = useMemo(() => getTotalSatisfaction(assignments), [assignments])
  const budgetBonus = totalAssignments === FOREST_FIRE_OPTIMAL_BUDGET ? 1 : 0
  const totalSatisfaction = missionSatisfaction + budgetBonus
  const selectedOccupation = occupationCatalog.find((occupation) => occupation.id === selectedProfessionalId)
  const budgetEvaluation = getBudgetEvaluation(totalAssignments)
  const budgetPercentage = Math.round((totalAssignments / FOREST_FIRE_OPTIMAL_BUDGET) * 100)
  const budgetPresentation = {
    'below-optimal': {
      className: 'border-slate-200 bg-slate-50 text-slate-700',
      label: 'Por debajo del presupuesto óptimo',
      detail:
        'Gastaste menos, pero revisa los puntos de satisfacción para comprobar si también cubriste todas las necesidades.',
    },
    optimal: {
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      label: 'Presupuesto óptimo',
      detail: 'Utilizaste exactamente los recursos necesarios para la respuesta completa.',
    },
    'slightly-high': {
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      label: 'Sobrecosto leve',
      detail: 'Gastaste un poco más que la respuesta óptima.',
    },
    high: {
      className: 'border-red-200 bg-red-50 text-red-800',
      label: 'Sobrecosto alto',
      detail: 'El gasto superó en más de 10% el presupuesto de la respuesta óptima.',
    },
  }[budgetEvaluation]

  return (
    <div>
      <ScreenHeading
        badge="Informe de cierre"
        description="La satisfacción reconoce las funciones profesionales bien cubiertas. El presupuesto muestra qué tan eficiente fue tu respuesta."
        inverse
        title="Resultado final del caso"
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-primary">
              <Star className="size-5" />
            </span>
            {budgetBonus > 0 && (
              <Badge variant="success">
                <Plus className="size-3" /> 1 punto por presupuesto óptimo
              </Badge>
            )}
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
            Puntos de satisfacción profesional
          </p>
          <p className="mt-1 text-4xl font-black">
            {totalSatisfaction}{' '}
            <span className="text-lg text-muted-foreground">/ {FOREST_FIRE_OPTIMAL_BUDGET + 1}</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Conseguiste {missionSatisfaction} puntos por las funciones profesionales cubiertas.{' '}
            {budgetBonus > 0
              ? 'Además, sumaste 1 punto extra por utilizar exactamente el presupuesto óptimo.'
              : `Para conseguir el punto adicional debías gastar exactamente ${FOREST_FIRE_OPTIMAL_BUDGET} puntos de presupuesto.`}
          </p>
        </Card>
        <Card className={cn('border p-6 shadow-[var(--shadow-card)]', budgetPresentation.className)}>
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/70">
              <WalletCards className="size-5" />
            </span>
            <Badge className="bg-white/70 text-current" variant="outline">
              {budgetPercentage}% del óptimo
            </Badge>
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] opacity-65">
            Presupuesto gastado
          </p>
          <p className="mt-1 text-4xl font-black">
            {totalAssignments} <span className="text-lg opacity-60">/ {FOREST_FIRE_BUDGET_LIMIT}</span>
          </p>
          <p className="mt-2 font-black">{budgetPresentation.label}</p>
          <p className="mt-1 text-sm leading-6 opacity-75">
            {budgetPresentation.detail} La respuesta óptima cuesta {FOREST_FIRE_OPTIMAL_BUDGET} puntos.
          </p>
        </Card>
      </div>

      {selectedOccupation && (
        <Card className="mb-6 border-primary/15 bg-white/96 p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-start gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
              style={{ background: selectedOccupation.color }}
            >
              {selectedOccupation.name.charAt(0)}
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                Tu aporte profesional adicional
              </p>
              <p className="mt-1 font-black">{selectedOccupation.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {forestFirePhases.map((phase) => {
          const phaseSpent = Object.values(assignments[phase.id]).reduce(
            (total, ids) => total + ids.length,
            0,
          )
          const phaseSatisfaction = getPhaseSatisfaction(phase, assignments[phase.id])
          const phaseOptimal = phase.problems.reduce(
            (total, problem) => total + problem.expectedProfessionalIds.length,
            0,
          )
          return (
            <Card className="p-5 shadow-[var(--shadow-card)]" key={phase.id}>
              <div className="flex items-center justify-between">
                <Badge variant={phase.number === 3 ? 'success' : 'default'}>Fase {phase.number}</Badge>
                <Badge variant={phaseSatisfaction === phaseOptimal ? 'success' : 'warning'}>
                  <Star className="size-3" /> {phaseSatisfaction}/{phaseOptimal}
                </Badge>
              </div>
              <h2 className="mt-3 text-xl font-bold">{phase.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {phaseSpent} {phaseSpent === 1 ? 'punto' : 'puntos'} de presupuesto utilizados
              </p>
              <div className="mt-4 space-y-4">
                {phase.problems.map((problem) => {
                  const selectedIds = assignments[phase.id][problem.id]
                  const problemSatisfaction = getProblemSatisfaction(problem, selectedIds)
                  return (
                    <div className="border-t pt-3 first:border-t-0 first:pt-0" key={problem.id}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold">{problem.title}</p>
                        <span
                          className={cn(
                            'text-xs font-black',
                            problemSatisfaction === problem.expectedProfessionalIds.length
                              ? 'text-[var(--success)]'
                              : 'text-[var(--warning)]',
                          )}
                        >
                          {problemSatisfaction}/{problem.expectedProfessionalIds.length}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {selectedIds.length}{' '}
                        {selectedIds.length === 1 ? 'asignación realizada' : 'asignaciones realizadas'}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
      <div className="mt-7 flex justify-end">
        <Button onClick={onFinish} size="lg">
          Finalizar caso <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

function ResultMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/7 p-3">
      <span className="text-[#ffab82] [&_svg]:size-4">{icon}</span>
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="text-[10px] text-white/42">{label}</p>
    </div>
  )
}

const FOREST_FIRE_ROLE_OCCUPATION_IDS = new Set([
  'firefighter',
  'meteorologist',
  'municipal-police',
  'paramedic',
  'medical-specialist',
  'veterinarian',
  'biologist',
  'environmental-engineer',
  'civil-engineer',
  'machinery-operator',
  'social-worker',
  'journalist',
])

const forestFireReflectionOccupations = occupationCatalog.filter(
  (occupation) => !FOREST_FIRE_ROLE_OCCUPATION_IDS.has(occupation.id),
)

function ExtraProfessionalQuestionScreen({
  onReasonChange,
  onSelectProfessional,
  onSubmit,
  reason,
  selectedProfessionalId,
}: {
  onReasonChange: (reason: string) => void
  onSelectProfessional: (professionalId: string) => void
  onSubmit: () => void
  reason: string
  selectedProfessionalId: string
}) {
  const [search, setSearch] = useState('')
  const [detailOccupation, setDetailOccupation] = useState<Occupation>()
  const normalizedSearch = search.trim().toLocaleLowerCase('es')
  const filteredOccupations = forestFireReflectionOccupations.filter(
    (occupation) =>
      !normalizedSearch ||
      [
        occupation.name,
        occupation.sector,
        occupation.shortDescription,
        occupation.contextualDescription,
        ...occupation.skills,
      ].some((value) => value.toLocaleLowerCase('es').includes(normalizedSearch)),
  )
  const selectedOccupation = occupationCatalog.find((occupation) => occupation.id === selectedProfessionalId)

  return (
    <div className="mx-auto max-w-5xl">
      <ScreenHeading
        badge="Reflexión abierta"
        description="Busca en el catálogo general una profesión distinta de las que ya tuvieron una función correcta en el caso."
        inverse
        title="¿Qué otra profesión podría haber ayudado y por qué?"
      />
      <Card className="p-6 shadow-[0_26px_75px_rgb(0_0_0/28%)] md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black">1. Busca y elige una profesión</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {forestFireReflectionOccupations.length} profesiones disponibles del catálogo general.
            </p>
          </div>
          <label className="relative block w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Buscar profesión</span>
            <input
              className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-ring/15"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, sector o habilidad..."
              type="search"
              value={search}
            />
          </label>
        </div>

        <div className="case-scrollbar mt-5 max-h-[430px] overflow-y-auto rounded-2xl border bg-muted/25 p-3">
          {filteredOccupations.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredOccupations.map((occupation) => {
                const selected = occupation.id === selectedProfessionalId
                return (
                  <article
                    className={cn(
                      'rounded-2xl border bg-white p-4 transition-colors',
                      selected ? 'border-primary ring-2 ring-primary/10' : 'hover:border-primary/30',
                    )}
                    key={occupation.id}
                  >
                    <button
                      aria-pressed={selected}
                      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                      onClick={() => onSelectProfessional(occupation.id)}
                      type="button"
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white"
                          style={{ background: occupation.color }}
                        >
                          {occupation.name.charAt(0)}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-black">{occupation.name}</span>
                          <span className="block text-xs text-muted-foreground">{occupation.sector}</span>
                        </span>
                        {selected && <CheckCircle2 className="ml-auto size-5 shrink-0 text-primary" />}
                      </span>
                      <span className="mt-3 block text-xs leading-5 text-muted-foreground">
                        {occupation.shortDescription}
                      </span>
                      <span className="mt-3 flex flex-wrap gap-1">
                        {occupation.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </span>
                    </button>
                    <Button
                      className="mt-3 w-full"
                      onClick={() => setDetailOccupation(occupation)}
                      size="sm"
                      variant="outline"
                    >
                      <BookOpen /> Ver ficha completa
                    </Button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="mx-auto size-7 text-muted-foreground" />
              <p className="mt-3 font-bold">No encontramos coincidencias</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Prueba con otra profesión, sector o habilidad.
              </p>
            </div>
          )}
        </div>

        {selectedOccupation && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-[var(--primary-soft)] p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                Profesión seleccionada
              </p>
              <p className="mt-1 font-black">{selectedOccupation.name}</p>
            </div>
            <Button onClick={() => setDetailOccupation(selectedOccupation)} size="sm" variant="outline">
              <BookOpen /> Revisar ficha
            </Button>
          </div>
        )}

        <label className="mt-6 block text-sm font-black" htmlFor="extra-professional-reason">
          2. Explica cómo habría ayudado
        </label>
        <textarea
          className="mt-2 min-h-36 w-full resize-y rounded-2xl border border-input bg-white p-4 text-sm leading-6 outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-ring/15"
          id="extra-professional-reason"
          onChange={(event) => onReasonChange(event.target.value)}
          placeholder="Describe en qué momento habría intervenido y qué habría aportado a la comunidad..."
          value={reason}
        />
        <div className="mt-6 flex justify-end">
          <Button
            disabled={!selectedProfessionalId || reason.trim().length < 10}
            onClick={onSubmit}
            size="lg"
          >
            Comparar con otras respuestas <MessageCircle />
          </Button>
        </div>
      </Card>
      <OccupationDetailDialog occupation={detailOccupation} onClose={() => setDetailOccupation(undefined)} />
    </div>
  )
}

function ProfessionalWordCloudScreen({
  onContinue,
  reason,
  selectedProfessionalId,
}: {
  onContinue: () => void
  reason: string
  selectedProfessionalId: string
}) {
  const [openProfessionalId, setOpenProfessionalId] = useState<string>()
  const cloudEntries = forestFireWordCloud.some((entry) => entry.occupationId === selectedProfessionalId)
    ? forestFireWordCloud
    : [...forestFireWordCloud, { occupationId: selectedProfessionalId, mentions: 0, comments: [] }]
  const selectedEntry = cloudEntries.find((entry) => entry.occupationId === openProfessionalId)
  const selectedProfessional = occupationCatalog.find((occupation) => occupation.id === openProfessionalId)
  const cloudColors = [
    'text-[#ff9a72]',
    'text-[#a9a2ff]',
    'text-[#61c7a5]',
    'text-[#78b9ef]',
    'text-[#f1c05c]',
  ]

  return (
    <div>
      <ScreenHeading
        badge="Voces de estudiantes"
        description="El tamaño de cada profesión representa cuántos estudiantes imaginaron un aporte para ella. Pulsa una para leer sus razones."
        inverse
        title="Así respondió la comunidad"
      />
      <Card className="border-white/18 bg-[#171827]/88 p-6 text-white shadow-[0_26px_75px_rgb(0_0_0/30%)] backdrop-blur-xl md:p-9">
        <div className="flex min-h-[360px] flex-wrap items-center justify-center gap-x-8 gap-y-6 rounded-3xl border border-white/10 bg-black/12 p-6 md:p-10">
          {cloudEntries.map((entry, index) => {
            const professional = occupationCatalog.find((item) => item.id === entry.occupationId)!
            const mentions = entry.mentions + (entry.occupationId === selectedProfessionalId ? 1 : 0)
            return (
              <button
                className={cn(
                  'rounded-2xl px-3 py-2 font-black leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                  cloudColors[index % cloudColors.length],
                  entry.occupationId === selectedProfessionalId && 'bg-white/10 ring-1 ring-white/20',
                )}
                key={entry.occupationId}
                onClick={() => setOpenProfessionalId(entry.occupationId)}
                style={{ fontSize: `${0.8 + mentions * 0.055}rem` }}
                type="button"
              >
                {professional.name}
                <span className="ml-1 align-top text-[10px] font-bold text-white/35">{mentions}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs leading-5 text-white/45">
            Tu selección aparece destacada y se suma a las respuestas del grupo.
          </p>
          <Button className="bg-[#ff875f] hover:bg-[#f47550]" onClick={onContinue} size="lg">
            Ver informe final <ArrowRight />
          </Button>
        </div>
      </Card>

      <Dialog
        onOpenChange={(open) => !open && setOpenProfessionalId(undefined)}
        open={Boolean(openProfessionalId)}
      >
        {selectedEntry && selectedProfessional && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <Badge className="mb-1" variant="default">
                <MessageCircle className="size-3.5" /> Comentarios de estudiantes
              </Badge>
              <DialogTitle>{selectedProfessional.name}</DialogTitle>
              <DialogDescription>
                {selectedEntry.mentions + (selectedProfessional.id === selectedProfessionalId ? 1 : 0)}{' '}
                estudiantes imaginaron un aporte para esta profesión.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {selectedProfessional.id === selectedProfessionalId && (
                <div className="rounded-2xl border border-primary/20 bg-[var(--primary-soft)] p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    Tu comentario
                  </p>
                  <p className="mt-2 text-sm leading-6">“{reason}”</p>
                </div>
              )}
              {selectedEntry.comments.map((comment, index) => (
                <div className="flex gap-3 rounded-2xl border bg-muted/35 p-4" key={comment}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-xs font-black text-primary shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-muted-foreground">“{comment}”</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setOpenProfessionalId(undefined)}>Cerrar comentarios</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function ScreenHeading({
  badge,
  description,
  inverse = false,
  title,
}: {
  badge: string
  description: string
  inverse?: boolean
  title: string
}) {
  return (
    <section className={cn('mb-7', inverse && 'text-white')}>
      <Badge
        className={cn('mb-3', inverse && 'border border-white/12 bg-white/10 text-white')}
        variant="default"
      >
        <Flame className="size-3.5" /> {badge}
      </Badge>
      <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">{title}</h1>
      <p
        className={cn(
          'mt-3 max-w-3xl text-base leading-7',
          inverse ? 'text-white/65' : 'text-muted-foreground',
        )}
      >
        {description}
      </p>
    </section>
  )
}

export { ForestFireCaseView }
