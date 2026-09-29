import { useMemo, useState, type ReactNode } from 'react'
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeDollarSign,
  BookOpenCheck,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Compass,
  Map,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Users,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { careerCatalog } from '../data/ExplorationCatalogData'
import {
  createDecisionSheet,
  type DecisionBudget,
  type DecisionInfluence,
  type DecisionSheet,
  type DecisionTimelineEvent,
} from '../types/StudentDecisionTypes'

type Props = {
  sheets: DecisionSheet[]
  setSheets: React.Dispatch<React.SetStateAction<DecisionSheet[]>>
}

type MainView = 'sheets' | 'budgets' | 'timeline' | 'detail'
type SheetStep = 'motivation' | 'influence' | 'knowledge' | 'fit' | 'preparation' | 'budgets'
const preparationOptions = [
  'Academia',
  'Idiomas',
  'Ahorro',
  'Cursos de desarrollo personal',
  'Lee libros afines',
  'Investiga por su cuenta',
  'Conversa con profesionales',
  'Otra',
]

const stepDefinitions: { id: SheetStep; label: string; description: string; icon: LucideIcon }[] = [
  {
    id: 'motivation',
    label: 'Motivación',
    description: 'Explora desde cuándo y por qué esta posibilidad te interesa.',
    icon: Sparkles,
  },
  {
    id: 'influence',
    label: 'Influencia',
    description: 'Registra a las personas que influyeron en tu interés y cómo lo hicieron.',
    icon: Users,
  },
  {
    id: 'knowledge',
    label: 'Lo que sé hoy',
    description: 'Registra lo que conoces actualmente sobre la carrera y su trabajo cotidiano.',
    icon: BookOpenCheck,
  },
  {
    id: 'fit',
    label: 'Mi encaje',
    description: 'Conecta la carrera con tus habilidades, rasgos e intereses personales.',
    icon: Brain,
  },
  {
    id: 'preparation',
    label: 'Preparación',
    description: 'Identifica acciones que ya realizas para acercarte a esta posibilidad.',
    icon: CheckCircle2,
  },
  {
    id: 'budgets',
    label: 'Presupuestos',
    description: 'Compara escenarios de estudio según institución, ciudad, modalidad y costos.',
    icon: WalletCards,
  },
]

export function StudentDecisionSection({ sheets, setSheets }: Props) {
  const [view, setView] = useState<MainView>('sheets')
  const [selectedId, setSelectedId] = useState<string>()
  const [createOpen, setCreateOpen] = useState(false)
  const selectedSheet = sheets.find((sheet) => sheet.id === selectedId)
  const activeSheets = sheets.filter((sheet) => sheet.status !== 'archived')

  function updateSheet(id: string, updater: (sheet: DecisionSheet) => DecisionSheet) {
    setSheets((current) => current.map((sheet) => (sheet.id === id ? updater(sheet) : sheet)))
  }

  function openSheet(id: string) {
    setSelectedId(id)
    setView('detail')
  }

  function createSheet(careerId: string) {
    const career = careerCatalog.find((item) => item.id === careerId)
    if (!career || sheets.some((sheet) => sheet.sourceId === career.id)) return
    setSheets((current) => [...current, createDecisionSheet(career.name, career.id)])
    setCreateOpen(false)
  }

  function moveSheet(id: string, direction: -1 | 1) {
    setSheets((current) => {
      const active = current.filter((sheet) => sheet.status !== 'archived')
      const currentIndex = active.findIndex((sheet) => sheet.id === id)
      const nextIndex = currentIndex + direction
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= active.length) return current
      ;[active[currentIndex], active[nextIndex]] = [active[nextIndex], active[currentIndex]]
      const movedId = active[nextIndex].id
      return [...active, ...current.filter((sheet) => sheet.status === 'archived')].map((sheet) =>
        sheet.id === movedId
          ? { ...sheet, timeline: [...sheet.timeline, timelineEvent('favorite', 'Reordenaste tus opciones')] }
          : sheet,
      )
    })
  }

  if (view === 'detail' && selectedSheet) {
    return (
      <DecisionEditor
        onBack={() => setView('sheets')}
        onUpdate={(updater) => updateSheet(selectedSheet.id, updater)}
        sheet={selectedSheet}
      />
    )
  }

  return (
    <section aria-labelledby="decision-title">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Badge className="mb-3" variant="default">
            <Compass className="size-3.5" /> Tu camino vocacional
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight" id="decision-title">
            Mi decisión
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Explora posibilidades, ordénalas según lo que más te atrae hoy y construye escenarios reales para
            cada una.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HelpTooltip text="Cada ficha reúne lo que sabes, lo que te motiva y los presupuestos que construyas para una carrera. Puedes tener varias y cambiar su orden cuando quieras." />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus /> Nueva ficha
          </Button>
        </div>
      </div>

      <nav
        aria-label="Vistas de Mi decisión"
        className="mb-7 flex gap-1 overflow-x-auto rounded-2xl border bg-white p-1.5 shadow-sm"
      >
        <ViewTab
          active={view === 'sheets'}
          icon={Compass}
          label="Mis fichas"
          onClick={() => setView('sheets')}
        />
        <ViewTab
          active={view === 'budgets'}
          icon={WalletCards}
          label="Presupuestos"
          onClick={() => setView('budgets')}
        />
        <ViewTab
          active={view === 'timeline'}
          icon={Map}
          label="Mi recorrido"
          onClick={() => setView('timeline')}
        />
      </nav>

      {view === 'budgets' ? (
        <BudgetOverview onOpenSheet={openSheet} sheets={sheets} />
      ) : view === 'timeline' ? (
        <Timeline sheets={sheets} />
      ) : sheets.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sheets.map((sheet) => (
            <DecisionCard
              key={sheet.id}
              onArchive={() =>
                updateSheet(sheet.id, (current) => ({
                  ...current,
                  status: 'archived',
                  timeline: [...current.timeline, timelineEvent('archived')],
                }))
              }
              onMoveDown={() => moveSheet(sheet.id, 1)}
              onMoveUp={() => moveSheet(sheet.id, -1)}
              onOpen={() => openSheet(sheet.id)}
              onReactivate={() =>
                updateSheet(sheet.id, (current) => ({
                  ...current,
                  status: 'active',
                  timeline: [...current.timeline, timelineEvent('reactivated')],
                }))
              }
              primary={sheet.status !== 'archived' && activeSheets[0]?.id === sheet.id}
              sheet={sheet}
            />
          ))}
        </div>
      )}

      <CareerPicker
        existingSourceIds={sheets.map((sheet) => sheet.sourceId).filter(Boolean) as string[]}
        onCreate={createSheet}
        onOpenChange={setCreateOpen}
        open={createOpen}
      />
    </section>
  )
}

function CareerPicker({
  existingSourceIds,
  onCreate,
  onOpenChange,
  open,
}: {
  existingSourceIds: string[]
  onCreate: (careerId: string) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const [query, setQuery] = useState('')
  const matches = careerCatalog.filter((career) =>
    `${career.name} ${career.area}`.toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <Dialog
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery('')
      }}
      open={open}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear una ficha de decisión</DialogTitle>
          <DialogDescription>
            Busca y selecciona una carrera del catálogo. Después podrás explorarla a tu propio ritmo.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            className="h-11 w-full rounded-xl border bg-white pl-10 pr-3 outline-none focus:ring-3 focus:ring-ring/25"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por carrera o área..."
            value={query}
          />
        </div>
        <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {matches.map((career) => {
            const exists = existingSourceIds.includes(career.id)
            return (
              <button
                className="flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:border-primary/35 hover:bg-[var(--primary-soft)]/35 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={exists}
                key={career.id}
                onClick={() => onCreate(career.id)}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary-soft)] text-primary">
                  <BookOpenCheck className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{career.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {career.area} · {career.duration}
                  </span>
                </span>
                {exists ? (
                  <Badge variant="secondary">
                    <Check /> Ya creada
                  </Badge>
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </button>
            )
          })}
          {matches.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No encontramos una carrera con esa búsqueda.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DecisionCard({
  sheet,
  primary,
  onOpen,
  onMoveUp,
  onMoveDown,
  onArchive,
  onReactivate,
}: {
  sheet: DecisionSheet
  primary: boolean
  onOpen: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onArchive: () => void
  onReactivate: () => void
}) {
  const archived = sheet.status === 'archived'
  const progress = completedSections(sheet)
  return (
    <Card
      className={cn(
        'group flex min-h-72 flex-col overflow-hidden shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-lg',
        primary && 'border-[#e5b94d] ring-1 ring-[#f4d987]',
        archived && 'border-dashed bg-muted/40 opacity-75',
      )}
    >
      <div
        className={cn(
          'h-1.5',
          primary ? 'bg-[#e5b94d]' : archived ? 'bg-muted-foreground/25' : 'bg-primary/70',
        )}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Badge variant={primary ? 'warning' : archived ? 'outline' : 'secondary'}>
            {primary ? 'Opción principal' : archived ? 'Pausada' : 'Activa'}
          </Badge>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
            {progress}/{stepDefinitions.length}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-bold">{sheet.name}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {sheet.budgets.length
            ? `${sheet.budgets.length} ${sheet.budgets.length === 1 ? 'presupuesto creado' : 'presupuestos creados'}`
            : 'Aún sin presupuestos'}
        </p>
        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(progress / stepDefinitions.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {progress === stepDefinitions.length
              ? 'Exploración completa'
              : `${stepDefinitions.length - progress} secciones por explorar`}
          </p>
        </div>
        <div className="mt-auto flex gap-1 pt-6">
          <Button className="flex-1" onClick={onOpen} size="sm">
            Continuar
          </Button>
          {archived ? (
            <Button aria-label="Reactivar ficha" onClick={onReactivate} size="sm" variant="outline">
              <RotateCcw />
            </Button>
          ) : (
            <>
              <Button aria-label="Subir prioridad" onClick={onMoveUp} size="sm" variant="ghost">
                <ArrowUp />
              </Button>
              <Button aria-label="Bajar prioridad" onClick={onMoveDown} size="sm" variant="ghost">
                <ArrowDown />
              </Button>
              <Button aria-label="Pausar ficha" onClick={onArchive} size="sm" variant="ghost">
                <Archive />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

function DecisionEditor({
  sheet,
  onBack,
  onUpdate,
}: {
  sheet: DecisionSheet
  onBack: () => void
  onUpdate: (updater: (sheet: DecisionSheet) => DecisionSheet) => void
}) {
  const [step, setStep] = useState<SheetStep>('motivation')
  function setField<K extends keyof DecisionSheet>(key: K, value: DecisionSheet[K]) {
    onUpdate((current) => ({ ...current, [key]: value }))
  }
  return (
    <section>
      <Button onClick={onBack} size="sm" variant="ghost">
        <ArrowLeft /> Volver a mis fichas
      </Button>
      <div className="mt-5 rounded-3xl bg-gradient-to-br from-[#37315c] to-[#5b50ba] p-6 text-white shadow-[var(--shadow-card)] sm:p-8">
        <Badge className="bg-white/12 text-white" variant="outline">
          Ficha de decisión
        </Badge>
        <h2 className="mt-4 text-3xl font-bold">{sheet.name}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          No necesitas completar todo hoy. Cada respuesta guarda una pieza útil para tu decisión.
        </p>
      </div>
      <div className="my-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stepDefinitions.map((item) => (
          <StepButton
            active={step === item.id}
            complete={isStepComplete(sheet, item.id)}
            item={item}
            key={item.id}
            onClick={() => setStep(item.id)}
          />
        ))}
      </div>
      {step === 'motivation' && (
        <SectionPanel definition={stepDefinitions[0]}>
          <SelectField
            label="Desde cuándo me interesa"
            onChange={(value) => setField('interestedSince', value)}
            options={['6-10 años', '11-13 años', '14-16 años', '17+', 'Recién ahora']}
            value={sheet.interestedSince}
          />
          <TextArea
            label="Por qué me interesa"
            onChange={(value) => setField('motivation', value)}
            value={sheet.motivation}
          />
          <SelectField
            label="Qué tan buena opción siento que es para mí"
            onChange={(value) => setField('optionQuality', value)}
            options={['Muy buena opción', 'Buena opción', 'Una posibilidad por explorar', 'Aún no lo sé']}
            value={sheet.optionQuality}
          />
        </SectionPanel>
      )}
      {step === 'influence' && (
        <SectionPanel definition={stepDefinitions[1]}>
          <ToggleField
            label="Nadie influyó en mi interés por esta carrera"
            onChange={(value) => {
              setField('noInfluence', value)
              if (value) setField('influences', [])
            }}
            value={sheet.noInfluence ?? false}
          />
          {!sheet.noInfluence && (
            <InfluenceList
              onChange={(value) => setField('influences', value)}
              values={sheet.influences}
            />
          )}
        </SectionPanel>
      )}
      {step === 'knowledge' && (
        <SectionPanel definition={stepDefinitions[2]}>
          <SelectField
            label="Cuánto conozco de esta carrera"
            onChange={(value) => setField('knowledge', value)}
            options={['Bastante', 'Regular', 'Poco', 'Nada']}
            value={sheet.knowledge}
          />
          <TextArea
            label="Con mis palabras, ¿cómo es el día a día de esta carrera?"
            onChange={(value) => setField('dailyWork', value)}
            placeholder="Resume las tareas, responsabilidades y ambientes de trabajo que conoces."
            value={sheet.dailyWork}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <EvidenceBlock
              checked={sheet.interviewed}
              findings={sheet.interviewFindings}
              findingsLabel="¿Qué aprendí de la entrevista?"
              label="Realicé una entrevista"
              onCheckedChange={(value) => setField('interviewed', value)}
              onFindingsChange={(value) => setField('interviewFindings', value)}
            />
            <EvidenceBlock
              checked={sheet.researched}
              findings={sheet.researchFindings}
              findingsLabel="¿Qué aprendí de la investigación?"
              label="Realicé una investigación"
              onCheckedChange={(value) => setField('researched', value)}
              onFindingsChange={(value) => setField('researchFindings', value)}
            />
          </div>
        </SectionPanel>
      )}
      {step === 'fit' && (
        <SectionPanel definition={stepDefinitions[3]}>
          <SelectField
            label="¿Mis capacidades y rasgos van de acuerdo?"
            onChange={(value) => setField('fit', value)}
            options={['Sí, bastante', 'Sí, lo suficiente', 'Un poco', 'No']}
            value={sheet.fit}
          />
          <TextField
            label="Resultado de autoconocimiento que conecta"
            onChange={(value) => setField('selfKnowledge', value)}
            placeholder="Ej. Disfruto resolver problemas complejos"
            value={sheet.selfKnowledge}
          />
          <TextArea
            label="Mis fortalezas para esta carrera"
            onChange={(value) => setField('strengths', value)}
            placeholder="Ej. Soy perseverante, disfruto investigar y se me facilita trabajar en equipo."
            value={sheet.strengths ?? ''}
          />
          <TextArea
            label="Lo que podría dificultarme esta carrera"
            onChange={(value) => setField('challenges', value)}
            placeholder="Ej. Necesito reforzar matemáticas o aprender a organizar mejor mi tiempo."
            value={sheet.challenges ?? ''}
          />
        </SectionPanel>
      )}
      {step === 'preparation' && (
        <SectionPanel definition={stepDefinitions[4]}>
          <div className="rounded-2xl bg-[var(--primary-soft)] p-4 text-sm font-semibold text-primary">
            Ya realizas {sheet.preparation.length + (sheet.customPreparation?.length ?? 0)} acciones para
            acercarte a esta carrera.
          </div>
          <CheckGroup
            label="Acciones que ya realizo"
            onChange={(value) => setField('preparation', value)}
            options={preparationOptions}
            values={sheet.preparation}
          />
          <EditableActionList
            onChange={(value) => setField('customPreparation', value)}
            values={sheet.customPreparation ?? []}
          />
        </SectionPanel>
      )}
      {step === 'budgets' && (
        <BudgetEditor
          budgets={sheet.budgets}
          definition={stepDefinitions[5]}
          onChange={(value) => setField('budgets', value)}
        />
      )}
    </section>
  )
}

function BudgetEditor({
  budgets,
  definition,
  onChange,
}: {
  budgets: DecisionBudget[]
  definition: (typeof stepDefinitions)[number]
  onChange: (budgets: DecisionBudget[]) => void
}) {
  const [expandedId, setExpandedId] = useState<string>()
  function addBudget() {
    const budget = emptyBudget(budgets.length + 1)
    onChange([...budgets, budget])
    setExpandedId(budget.id)
  }
  function updateBudget<K extends keyof DecisionBudget>(id: string, key: K, value: DecisionBudget[K]) {
    onChange(budgets.map((budget) => (budget.id === id ? { ...budget, [key]: value } : budget)))
  }
  return (
    <SectionPanel
      definition={definition}
      action={
        <Button onClick={addBudget} size="sm">
          <Plus /> Nuevo presupuesto
        </Button>
      }
    >
      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/35 px-6 py-10 text-center">
          <WalletCards className="mx-auto size-9 text-primary" />
          <h4 className="mt-3 font-bold">Construye tu primer escenario</h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Puedes crear alternativas para distintas instituciones, ciudades o modalidades y compararlas
            después.
          </p>
          <Button className="mt-5" onClick={addBudget} size="sm">
            <Plus /> Crear presupuesto
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const expanded = expandedId === budget.id
            return (
              <Card className="overflow-hidden shadow-sm" key={budget.id}>
                <button
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40"
                  onClick={() => setExpandedId(expanded ? undefined : budget.id)}
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-primary">
                    <BadgeDollarSign className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{budget.label || 'Presupuesto sin nombre'}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {budget.name || 'Institución por definir'} · {budget.city || 'Ciudad por definir'}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-black text-primary">
                      {formatMoney(calculateBudget(budget))}
                    </span>
                    <span className="text-xs text-muted-foreground">total estimado</span>
                  </span>
                  <ChevronRight className={cn('size-4 transition-transform', expanded && 'rotate-90')} />
                </button>
                {expanded && (
                  <div className="border-t bg-[#fbfbfd] p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label="Nombre del presupuesto"
                        onChange={(value) => updateBudget(budget.id, 'label', value)}
                        placeholder="Ej. Estudiar en Lima"
                        value={budget.label}
                      />
                      <TextField
                        label="Institución"
                        onChange={(value) => updateBudget(budget.id, 'name', value)}
                        value={budget.name}
                      />
                      <SelectField
                        label="Modalidad"
                        onChange={(value) =>
                          updateBudget(budget.id, 'modality', value as DecisionBudget['modality'])
                        }
                        options={['public', 'private']}
                        value={budget.modality}
                      />
                      <TextField
                        label="Ciudad"
                        onChange={(value) => updateBudget(budget.id, 'city', value)}
                        value={budget.city}
                      />
                      <TextField
                        label="Duración en años"
                        onChange={(value) => updateBudget(budget.id, 'duration', value)}
                        type="number"
                        value={budget.duration}
                      />
                      <SelectField
                        label="Vivienda"
                        onChange={(value) =>
                          updateBudget(budget.id, 'housing', value as DecisionBudget['housing'])
                        }
                        options={['own', 'rent']}
                        value={budget.housing}
                      />
                      <MoneyField
                        label="Matrícula por ciclo"
                        onChange={(value) => updateBudget(budget.id, 'enrollmentCost', value)}
                        value={budget.enrollmentCost}
                      />
                      <MoneyField
                        label="Pensión por ciclo"
                        onChange={(value) => updateBudget(budget.id, 'tuitionCost', value)}
                        value={budget.tuitionCost}
                      />
                      <MoneyField
                        label="Materiales por ciclo"
                        onChange={(value) => updateBudget(budget.id, 'materialsCost', value)}
                        value={budget.materialsCost}
                      />
                      <MoneyField
                        label="Costo de vida mensual"
                        onChange={(value) => updateBudget(budget.id, 'monthlyLivingCost', value)}
                        value={budget.monthlyLivingCost}
                      />
                      <SelectField
                        label="Academia preuniversitaria"
                        onChange={(value) => updateBudget(budget.id, 'academyMonths', value)}
                        options={['0', '6', '12', '24']}
                        value={budget.academyMonths}
                      />
                      <MoneyField
                        label="Costo mensual de academia"
                        onChange={(value) => updateBudget(budget.id, 'academyCost', value)}
                        value={budget.academyCost}
                      />
                    </div>
                    <div className="mt-4">
                      <ToggleField
                        label="Tengo una beca"
                        onChange={(value) => updateBudget(budget.id, 'scholarship', value)}
                        value={budget.scholarship}
                      />
                      {budget.scholarship && (
                        <div className="mt-4">
                          <TextArea
                            label="Qué cubre la beca"
                            onChange={(value) => updateBudget(budget.id, 'scholarshipNote', value)}
                            value={budget.scholarshipNote}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl bg-[#37315c] p-4 text-white sm:flex-row sm:items-center">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                          Costo total estimado
                        </p>
                        <p className="mt-1 text-2xl font-black">{formatMoney(calculateBudget(budget))}</p>
                      </div>
                      <Button
                        className="text-white hover:bg-white/10"
                        onClick={() => onChange(budgets.filter((item) => item.id !== budget.id))}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 /> Quitar presupuesto
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </SectionPanel>
  )
}

function BudgetOverview({
  sheets,
  onOpenSheet,
}: {
  sheets: DecisionSheet[]
  onOpenSheet: (id: string) => void
}) {
  const rows = sheets
    .filter((sheet) => sheet.status !== 'archived')
    .flatMap((sheet) => sheet.budgets.map((budget) => ({ budget, sheet })))
  if (!rows.length)
    return (
      <Card className="grid min-h-72 place-items-center border-dashed p-8 text-center">
        <div>
          <WalletCards className="mx-auto size-10 text-primary" />
          <h3 className="mt-4 text-lg font-bold">Aún no tienes presupuestos</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Abre una ficha y crea escenarios para comparar instituciones, ciudades y costos.
          </p>
        </div>
      </Card>
    )
  return (
    <div>
      <div className="mb-5">
        <h3 className="text-xl font-bold">Todos mis presupuestos</h3>
        <p className="mt-1 text-sm text-muted-foreground">Compara tus escenarios sin duplicar información.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map(({ budget, sheet }) => (
          <Card className="p-5 shadow-[var(--shadow-card)]" key={budget.id}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--primary-soft)] text-primary">
                <Building2 className="size-5" />
              </span>
              <Badge variant="secondary">{sheet.name}</Badge>
            </div>
            <h4 className="mt-4 text-lg font-bold">{budget.label || 'Presupuesto sin nombre'}</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {budget.name || 'Institución por definir'} · {budget.city || 'Ciudad por definir'}
            </p>
            <p className="mt-5 text-2xl font-black text-primary">{formatMoney(calculateBudget(budget))}</p>
            <p className="text-xs text-muted-foreground">Costo total estimado</p>
            <Button className="mt-5 w-full" onClick={() => onOpenSheet(sheet.id)} size="sm" variant="outline">
              Modificar presupuesto <ChevronRight />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Timeline({ sheets }: { sheets: DecisionSheet[] }) {
  const events = useMemo(
    () =>
      sheets
        .flatMap((sheet) => sheet.timeline.map((event) => ({ ...event, name: sheet.name })))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sheets],
  )
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Card className="flex items-center gap-4 p-4" key={event.id}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary-soft)] text-primary">
            <Map className="size-4" />
          </span>
          <div>
            <p className="font-semibold">
              {timelineLabel(event)} {event.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(new Date(event.date))}
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}

function StepButton({
  item,
  active,
  complete,
  onClick,
}: {
  item: (typeof stepDefinitions)[number]
  active: boolean
  complete: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      className={cn(
        'flex items-center gap-3 rounded-2xl border bg-white p-3 text-left transition-all',
        active && 'border-primary bg-[var(--primary-soft)] shadow-sm',
        !active && 'hover:border-primary/30 hover:bg-muted/40',
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-xl',
          complete
            ? 'bg-[var(--success-soft)] text-[var(--success)]'
            : active
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-bold">{item.label}</span>
      {complete && <Check className="size-4 text-[var(--success)]" />}
      <HelpTooltip text={item.description} />
    </button>
  )
}
function SectionPanel({
  definition,
  action,
  children,
}: {
  definition: (typeof stepDefinitions)[number]
  action?: ReactNode
  children: ReactNode
}) {
  const Icon = definition.icon
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)]">
      <div className="flex flex-col justify-between gap-4 border-b bg-muted/30 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[var(--primary-soft)] text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{definition.label}</h3>
              <HelpTooltip text={definition.description} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </Card>
  )
}
function ViewTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        'flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors',
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      onClick={onClick}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}
function HelpTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex" onClick={(event) => event.stopPropagation()}>
      <button
        aria-label="Más información"
        className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary"
        type="button"
      >
        <CircleHelp className="size-4" />
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-30 hidden w-64 rounded-xl bg-[#29263f] p-3 text-left text-xs font-medium leading-5 text-white shadow-xl group-focus-within:block group-hover:block">
        {text}
      </span>
    </span>
  )
}
function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className="mt-2 h-11 w-full rounded-xl border bg-white px-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/15"
        min={type === 'number' ? '0' : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  )
}
function MoneyField({ label, value, onChange }: Omit<Parameters<typeof TextField>[0], 'type'>) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">S/</span>
        <input
          className="h-11 w-full rounded-xl border bg-white pl-9 pr-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/15"
          min="0"
          onChange={(event) => onChange(event.target.value)}
          type="number"
          value={value}
        />
      </span>
    </label>
  )
}
function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <textarea
        className="mt-2 min-h-24 w-full resize-y rounded-xl border bg-white p-3 font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/15"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}
function InfluenceList({
  values,
  onChange,
}: {
  values: DecisionInfluence[]
  onChange: (values: DecisionInfluence[]) => void
}) {
  function addInfluence() {
    onChange([...values, { id: crypto.randomUUID(), person: '', description: '' }])
  }

  function updateInfluence(id: string, field: 'person' | 'description', value: string) {
    onChange(values.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold">Personas que influyeron</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Agrega una persona y explica brevemente cómo influyó en tu interés.
          </p>
        </div>
        <Button onClick={addInfluence} size="sm" type="button" variant="outline">
          <Plus /> Agregar persona
        </Button>
      </div>
      {values.length === 0 ? (
        <button
          className="mt-4 grid min-h-28 w-full place-items-center rounded-2xl border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-[var(--primary-soft)]/30 hover:text-primary"
          onClick={addInfluence}
          type="button"
        >
          <span>
            <Users className="mx-auto mb-2 size-5" />
            Agrega a la primera persona
          </span>
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          {values.map((influence, index) => (
            <div className="rounded-2xl border bg-white p-4" key={influence.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-primary">Persona {index + 1}</p>
                <Button
                  aria-label={`Eliminar persona ${index + 1}`}
                  onClick={() => onChange(values.filter((item) => item.id !== influence.id))}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 />
                </Button>
              </div>
              <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <TextField
                  label="Nombre o vínculo"
                  onChange={(value) => updateInfluence(influence.id, 'person', value)}
                  placeholder="Ej. Mi tía Ana, profesora de ciencias"
                  value={influence.person}
                />
                <TextArea
                  label="¿Cómo influyó?"
                  onChange={(value) => updateInfluence(influence.id, 'description', value)}
                  placeholder="Ej. Me contó cómo usa la ciencia para resolver problemas reales."
                  value={influence.description}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function EvidenceBlock({
  checked,
  findings,
  findingsLabel,
  label,
  onCheckedChange,
  onFindingsChange,
}: {
  checked: boolean
  findings: string
  findingsLabel: string
  label: string
  onCheckedChange: (value: boolean) => void
  onFindingsChange: (value: string) => void
}) {
  return (
    <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
      <ToggleField label={label} onChange={onCheckedChange} value={checked} />
      {checked && (
        <TextArea
          label={findingsLabel}
          onChange={onFindingsChange}
          placeholder="Escribe un resumen breve con tus propias palabras."
          value={findings}
        />
      )}
    </div>
  )
}
function EditableActionList({
  values,
  onChange,
}: {
  values: string[]
  onChange: (values: string[]) => void
}) {
  const [draft, setDraft] = useState('')

  function addAction() {
    const action = draft.trim()
    if (!action || values.some((value) => value.toLowerCase() === action.toLowerCase())) return
    onChange([...values, action])
    setDraft('')
  }

  return (
    <div>
      <p className="text-sm font-semibold">Otras acciones que realizo</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        Agrega cualquier preparación personal que no aparezca en la lista anterior.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          className="h-11 min-w-0 flex-1 rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-3 focus:ring-ring/15"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addAction()
            }
          }}
          placeholder="Ej. Practico dibujo técnico cada semana"
          value={draft}
        />
        <Button disabled={!draft.trim()} onClick={addAction} type="button" variant="outline">
          <Plus /> Agregar
        </Button>
      </div>
      {values.length > 0 && (
        <ul className="mt-3 space-y-2">
          {values.map((value) => (
            <li className="flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2" key={value}>
              <span className="text-sm">{value}</span>
              <Button
                aria-label={`Eliminar ${value}`}
                onClick={() => onChange(values.filter((item) => item !== value))}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: T[]
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <select
        className="mt-2 h-11 w-full rounded-xl border bg-white px-3 font-normal outline-none focus:border-primary focus:ring-3 focus:ring-ring/15"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        <option value="">Aún no lo tengo claro</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'public'
              ? 'Pública'
              : option === 'private'
                ? 'Privada'
                : option === 'own'
                  ? 'Vivienda propia'
                  : option === 'rent'
                    ? 'Alquiler'
                    : option === '0'
                      ? 'No'
                      : option}
          </option>
        ))}
      </select>
    </label>
  )
}
function CheckGroup({
  label,
  options,
  values,
  onChange,
}: {
  label: string
  options: string[]
  values: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors',
              values.includes(option) && 'border-primary/35 bg-[var(--primary-soft)]/50',
            )}
            key={option}
          >
            <input
              checked={values.includes(option)}
              className="size-4 accent-[var(--primary)]"
              onChange={() =>
                onChange(
                  values.includes(option) ? values.filter((item) => item !== option) : [...values, option],
                )
              }
              type="checkbox"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border bg-white p-4 text-sm font-semibold">
      <span>{label}</span>
      <input
        checked={value}
        className="size-5 accent-[var(--primary)]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="grid min-h-80 place-items-center border-dashed bg-white/60 p-8 text-center">
      <div>
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--primary-soft)] text-primary">
          <Compass className="size-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold">Empieza con una posibilidad</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Selecciona una carrera del catálogo para crear tu primera ficha. No significa que sea una decisión
          definitiva.
        </p>
        <Button className="mt-5" onClick={onCreate}>
          <Plus /> Crear mi primera ficha
        </Button>
      </div>
    </Card>
  )
}

function emptyBudget(index: number): DecisionBudget {
  return {
    id: crypto.randomUUID(),
    label: `Presupuesto ${index}`,
    name: '',
    modality: '',
    city: '',
    duration: '',
    housing: 'own',
    enrollmentCost: '',
    tuitionCost: '',
    materialsCost: '',
    monthlyLivingCost: '',
    academyMonths: '0',
    academyCost: '',
    scholarship: false,
    scholarshipNote: '',
  }
}
function calculateBudget(budget: DecisionBudget) {
  const years = Number(budget.duration) || 0
  const cycles = years * 2
  return (
    (Number(budget.enrollmentCost) + Number(budget.tuitionCost) + Number(budget.materialsCost)) * cycles +
    Number(budget.monthlyLivingCost) * years * 12 +
    Number(budget.academyCost) * (Number(budget.academyMonths) || 0)
  )
}
function formatMoney(amount: number) {
  return amount
    ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(
        amount,
      )
    : 'Por estimar'
}
function completedSections(sheet: DecisionSheet) {
  return stepDefinitions.filter((step) => isStepComplete(sheet, step.id)).length
}
function isStepComplete(sheet: DecisionSheet, step: SheetStep) {
  if (step === 'motivation')
    return Boolean(sheet.interestedSince || sheet.motivation || sheet.optionQuality)
  if (step === 'influence')
    return Boolean(
      sheet.noInfluence ||
        sheet.influences.some((influence) => influence.person.trim() && influence.description.trim()),
    )
  if (step === 'knowledge')
    return Boolean(sheet.knowledge || sheet.dailyWork || sheet.interviewed || sheet.researched)
  if (step === 'fit')
    return Boolean(sheet.fit || sheet.selfKnowledge || sheet.strengths || sheet.challenges)
  if (step === 'preparation')
    return Boolean(sheet.preparation.length || sheet.customPreparation?.length)
  if (step === 'budgets') return Boolean(sheet.budgets.length)
  return false
}
function timelineEvent(type: DecisionTimelineEvent['type'], detail?: string): DecisionTimelineEvent {
  return { id: crypto.randomUUID(), type, detail, date: new Date().toISOString() }
}
function timelineLabel(event: DecisionTimelineEvent) {
  const labels: Record<DecisionTimelineEvent['type'], string> = {
    created: 'Creaste la ficha de',
    certainty: 'Actualizaste tu valoración de',
    favorite: 'Cambiaste la prioridad de',
    archived: 'Pausaste la ficha de',
    reactivated: 'Reactivaste la ficha de',
    reconfirmed: 'Revisaste',
  }
  return labels[event.type]
}
