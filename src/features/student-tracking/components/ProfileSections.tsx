import { CardIcon, AlertBadge } from '@/components/ui/Status'
import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ClipboardList, Compass, HeartPulse, Search, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { activities, blocks, profileCatalog } from '@/data/demo/studentProfiles'
import { usePriorityCatalog } from '@/features/counselor/hooks/usePrioritySettings'
import {
  affinities,
  displayDate,
  favoriteRelations,
  generalProgress,
  normalizeSearch,
  observationCounts,
  planCompleteness,
  progress,
  progressGroups,
  signalSummary,
  securityLabel,
  questionnaireKey,
} from '../lib/selectors'
import { profileUrl, questionnaireUrl } from '../lib/navigation'
import {
  ActivityStatus,
  CompactProgress,
  EmailContact,
  EmptyMessage,
  Observations,
  Panel,
  PriorityLink,
  QuestionnaireStatus,
  TrendValue,
} from './ProfileShared'
import type { ProfilePlan, StudentProfile } from '@/types/studentProfile'

export function SummarySection({ student, returnTo }: { student: StudentProfile; returnTo: string }) {
  const { questionnaires } = usePriorityCatalog()
  const priority = questionnaires.filter((q) => q.priority)
  const records = progress(
    student,
    activities.filter((a) => a.kind === 'record'),
  )
  const observations = observationCounts(student)
  const signals = signalSummary(student)
  const planA = student.plans.find((plan) => plan.slot === 'A')
  return (
    <div className="space-y-4">
      <Panel title="Cuestionarios">
        {!priority.length && <EmptyMessage>Aún no marcas cuestionarios como prioritarios.</EmptyMessage>}
        <ul className="divide-y">
          {priority.map((definition) => {
            const application = student.questionnaires.find((q) => q.questionnaireId === definition.id)!
            return (
              <li
                key={definition.id}
                className="flex flex-col items-start gap-3 py-3 first:pt-0 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-semibold">{definition.name}</h3>
                  <QuestionnaireStatus application={application} />
                  {application.result &&
                    (application.result.kind !== 'comparison' || application.result.exit) && (
                      <p>{questionnaireKey(definition, application)}</p>
                    )}
                </div>
                {application.result && (
                  <Button variant="outline" className="min-h-11" asChild>
                    <Link to={questionnaireUrl(student.id, definition.id, returnTo)}>Ver resultado</Link>
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
        <Button asChild variant="outline" className="mt-3 min-h-11 h-auto whitespace-normal">
          <Link to={profileUrl(student.id, returnTo, 'questionnaires')}>Ver todos los cuestionarios</Link>
        </Button>
      </Panel>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
        <div className="min-w-0 space-y-4">
          <FamilySummary student={student} />
          <PlatformProgress student={student} />
        </div>
        <div className="min-w-0 space-y-4">
          <SummaryCard
            title="Opciones"
            icon={Compass}
            to={profileUrl(student.id, returnTo, 'options')}
            action="Ver opciones"
          >
            <p>
              <strong className="text-2xl">{student.plans.length}</strong>{' '}
              <span className="text-sm text-muted-foreground">planes registrados</span>
            </p>
            <p className="text-sm font-medium">
              {planA
                ? `Plan A: ${profileCatalog.careers.find((c) => c.id === planA.careerId)?.name}`
                : 'Plan A sin registrar'}
            </p>
          </SummaryCard>
          <SummaryCard
            title="Registros"
            icon={ClipboardList}
            to={profileUrl(student.id, returnTo, 'records')}
            action="Ver registros"
          >
            <p>
              <strong className="text-2xl">{records.completed}</strong>{' '}
              <span className="text-sm text-muted-foreground">
                de {records.total} actividades completadas
              </span>
            </p>
            {observations.underdeveloped || observations.attention ? (
              <Observations {...observations} counts />
            ) : (
              <p className="text-sm text-muted-foreground">Sin respuestas observadas</p>
            )}
          </SummaryCard>
          <SummaryCard
            title="Seguridad y check-in"
            icon={HeartPulse}
            to={profileUrl(student.id, returnTo, 'security')}
            action="Ver seguridad y diario"
          >
            {signals.latest ? (
              <>
                <p>
                  <strong className="text-2xl">{signals.latest.security}</strong>{' '}
                  <span className="text-sm text-muted-foreground">
                    de 10 · {securityLabel(signals.latest.security!)}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Último check-in: {displayDate(signals.latest.date)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no registra check-ins de seguridad.</p>
            )}
            <TrendValue value={signals.securityTrend} />
          </SummaryCard>
        </div>
      </div>
    </div>
  )
}
function SummaryCard({
  title,
  icon: Icon,
  to,
  action,
  children,
}: {
  title: string
  icon: LucideIcon
  to: string
  action: string
  children: ReactNode
}) {
  return (
    <Card className="min-w-0 space-y-4 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <CardIcon icon={Icon} />
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
      <Button
        asChild
        variant="outline"
        className="min-h-11 h-auto w-full justify-between gap-2 whitespace-normal text-left"
      >
        <Link to={to}>
          {action}
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </Link>
      </Button>
    </Card>
  )
}
function PlatformProgress({ student }: { student: StudentProfile }) {
  const [group, setGroup] = useState<'blocks' | 'types'>('blocks')
  const rows = progressGroups(student, activities, blocks, group)
  const total = generalProgress(student, activities)
  return (
    <Panel title="Detalle de avance" id="progress">
      <Tabs value={group} onValueChange={(value) => setGroup(value as 'blocks' | 'types')}>
        <TabsList aria-label="Agrupar avance" className="mb-4 flex w-full">
          <TabsTrigger value="blocks" className="min-w-0 flex-1 px-2 text-sm">
            Por bloque
          </TabsTrigger>
          <TabsTrigger value="types" className="min-w-0 flex-1 px-2 text-sm">
            Por tipo
          </TabsTrigger>
        </TabsList>
        <TabsContent value={group} className="mt-0 space-y-4">
          {rows.map((row) => (
            <CompactProgress key={row.id} {...row} />
          ))}
        </TabsContent>
      </Tabs>
      <div className="mt-5 rounded-lg border bg-muted p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-bold">Avance general</h3>
          <span className="text-xl font-bold">{total.percent} %</span>
        </div>
        <Progress aria-label="Avance general en detalle" value={total.percent} />
        <p className="mt-2 text-sm">
          {total.completed} de {total.total} actividades completadas
        </p>
      </div>
    </Panel>
  )
}
function FamilySummary({ student }: { student: StudentProfile }) {
  const guardian = student.guardian
  const completed = student.conversations.filter((c) => c.state === 'completed').length
  return (
    <Panel title="Familia" id="family">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          {guardian ? (
            <>
              <p className="font-medium">{guardian.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{guardian.relationship} · Apoderado</p>
              <EmailContact email={guardian.email} />
            </>
          ) : (
            <EmptyMessage>
              Sin apoderado registrado. La ruta familiar y las conversaciones necesitan un apoderado
              vinculado.
            </EmptyMessage>
          )}
        </div>
        <div className="space-y-3">
          {guardian && (
            <CompactProgress
              title="Actividades del apoderado"
              completed={guardian.completed}
              total={guardian.total}
            />
          )}
          <div className="border-t pt-3">
            <CompactProgress
              title="Conversaciones"
              completed={completed}
              total={student.conversations.length}
              unit="conversaciones completadas"
              unavailable={!guardian}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {student.conversations.filter((c) => c.state === 'pending').length} pendientes ·{' '}
              {student.conversations.filter((c) => c.state === 'unavailable').length} aún no disponibles
            </p>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export function RecordsSection({
  student,
  returnTo,
  attention = false,
}: {
  student: StudentProfile
  returnTo: string
  attention?: boolean
}) {
  const [filter, setFilter] = useState(attention ? 'all' : 'priority')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string[]>(
    attention
      ? activities
          .filter((a) => a.kind === 'record' && observationCounts(student, a.id).attention > 0)
          .map((a) => a.id)
      : [],
  )
  const configured = usePriorityCatalog()
  const all = configured.activities.filter((a) => a.kind === 'record')
  const priority = all.filter((a) => a.priority)
  const selected = filter === 'priority' ? priority : all
  const visible = selected.filter((a) => normalizeSearch(a.title).includes(normalizeSearch(query)))
  const started = student.activities.some(
    (entry) => all.some((a) => a.id === entry.activityId) && entry.state !== 'not-started',
  )
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Buscar actividad"
            placeholder="Buscar actividad"
            className="min-h-11 bg-card pl-10 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger
            aria-label="Mostrar registros"
            className="min-h-11 w-full gap-2 bg-card text-base sm:w-auto"
          >
            <span>
              Mostrar: <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Prioritarios ({priority.length})</SelectItem>
            <SelectItem value="all">Todos ({all.length})</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="space-y-3 rounded-xl p-4 text-sm">
        <p>
          <AlertBadge className="mr-2">Poco desarrollada</AlertBadge>
          La respuesta final quedó breve o no desarrolló lo que se pedía.
        </p>
        <p>
          <AlertBadge critical className="mr-2">
            Requiere atención
          </AlertBadge>
          La respuesta podría indicar algo que conviene conversar con el estudiante.
        </p>
      </Card>
      {!started && <EmptyMessage>Todavía no ha respondido actividades de registro.</EmptyMessage>}
      {filter === 'priority' && !priority.length ? (
        <Panel title="Registros">
          <EmptyMessage>Aún no marcas actividades de registro como prioritarias.</EmptyMessage>
          <Button className="mt-3 min-h-11" variant="outline" onClick={() => setFilter('all')}>
            Ver todos los registros
          </Button>
          <PriorityLink returnTo={returnTo} />
        </Panel>
      ) : !visible.length ? (
        <EmptyMessage>No hay actividades que coincidan con tu búsqueda.</EmptyMessage>
      ) : (
        <Accordion type="multiple" value={open} onValueChange={setOpen} className="space-y-3">
          {visible.map((activity) => {
            const entry = student.activities.find((a) => a.activityId === activity.id)!
            const observations = observationCounts(student, activity.id)
            return (
              <AccordionItem key={activity.id} value={activity.id}>
                <AccordionTrigger
                  aria-label={`Ver respuesta de ${activity.title}`}
                  className="flex-wrap sm:flex-nowrap"
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    <CardIcon icon={ClipboardList} />
                    <span className="min-w-0 space-y-2">
                      <span className="staff-list-heading block font-semibold">{activity.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        {blocks.find((b) => b.id === activity.blockId)?.name}
                      </span>
                      <ActivityStatus
                        state={entry.state}
                        label={
                          entry.state === 'completed'
                            ? 'Completada'
                            : entry.state === 'in-progress'
                              ? 'En progreso'
                              : 'No iniciada'
                        }
                      />
                      {entry.state !== 'not-started' && (
                        <span className="block text-sm text-muted-foreground">
                          {entry.state === 'completed' ? 'Completada' : 'Última modificación'}:{' '}
                          {displayDate(entry.completedAt ?? entry.updatedAt)}
                        </span>
                      )}
                      {observations.underdeveloped || observations.attention ? (
                        <Observations {...observations} counts />
                      ) : (
                        <span className="block text-sm text-muted-foreground">Sin observaciones</span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-primary">
                    {open.includes(activity.id) ? 'Ocultar respuesta' : 'Ver respuesta'}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                    {activity.items?.map((item) => {
                      const answer = entry.answers.find((a) => a.itemId === item.id)
                      return (
                        <section className="space-y-2" key={item.id}>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.prompt}</p>
                          {answer ? (
                            <>
                              <p className="rounded-lg bg-muted/50 p-3 leading-relaxed whitespace-pre-wrap">
                                {answer.text}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Última modificación: {displayDate(answer.date)}
                              </p>
                              <Observations
                                underdeveloped={Number(answer.underdeveloped)}
                                attention={Number(answer.attention)}
                              />
                            </>
                          ) : (
                            <EmptyMessage>Sin respuesta todavía</EmptyMessage>
                          )}
                        </section>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}

function PlanCard({ plan, student }: { plan: ProfilePlan; student: StudentProfile }) {
  const [open, setOpen] = useState(false)
  const affinity = affinities(student, profileCatalog)
  const percent = planCompleteness(plan)
  const institution = profileCatalog.institutions.find((i) => i.id === plan.budget?.institutionId)
  const money = (value: number | null) =>
    value === null
      ? 'Sin completar'
      : new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value)
  return (
    <Card className="min-w-0 rounded-xl p-4">
      <h3 className="text-lg font-bold">Plan {plan.slot}</h3>
      <p className="mt-2 font-medium">{profileCatalog.careers.find((c) => c.id === plan.careerId)?.name}</p>
      {institution && <p className="mt-2 text-muted-foreground">{institution.name}</p>}
      <div className="mt-4 space-y-2">
        <p>Completitud: {percent} %</p>
        <Progress aria-label={`Completitud del plan ${plan.slot}`} value={percent} />
        <p className="text-sm text-muted-foreground">Última actualización: {displayDate(plan.updatedAt)}</p>
        <p>{plan.actions.length} acciones de preparación</p>
        {affinity.careers.includes(plan.careerId) && (
          <Badge variant="secondary" className="whitespace-normal">
            Afín a su test de intereses
          </Badge>
        )}
      </div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="mt-4 min-h-11">
            {open ? 'Ocultar contenido' : 'Ver contenido'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-4 space-y-5 border-t pt-4">
            <section>
              <h4 className="font-semibold">Motivación</h4>
              <p className="mt-2 whitespace-pre-wrap">{plan.motivation || 'Sin completar'}</p>
            </section>
            {(
              [
                ['strengths', 'Fortalezas'],
                ['weaknesses', 'Debilidades'],
                ['opportunities', 'Oportunidades'],
                ['obstacles', 'Obstáculos'],
              ] as const
            ).map(([key, label]) => (
              <section key={key}>
                <h4 className="font-semibold">{label}</h4>
                <p className="mt-2 whitespace-pre-wrap">{plan.swot[key] || 'Sin completar'}</p>
              </section>
            ))}
            <section>
              <h4 className="font-semibold">Presupuesto</h4>
              {plan.budget ? (
                <dl className="mt-2 space-y-3">
                  {[
                    ['Institución', institution?.name ?? 'Sin completar'],
                    ['Pensión', money(plan.budget.tuition)],
                    ['Matrícula', money(plan.budget.enrollment)],
                    ['Vivienda', money(plan.budget.housing)],
                    ['Becas', plan.budget.scholarship || 'Sin completar'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-sm text-muted-foreground">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-2 text-muted-foreground">Sin completar</p>
              )}
            </section>
            <section>
              <h4 className="font-semibold">Acciones de preparación</h4>
              {plan.actions.length ? (
                <ul className="mt-2 space-y-3">
                  {plan.actions.map((action, i) => (
                    <li key={i}>
                      <p>{action.description || 'Sin completar'}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{displayDate(action.date)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-muted-foreground">Sin completar</p>
              )}
            </section>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
export function OptionsSection({ student }: { student: StudentProfile }) {
  const affinity = affinities(student, profileCatalog)
  const relations = favoriteRelations(student, profileCatalog)
  const initial = student.initialInterest
  const initialPlan = initial && student.plans.find((p) => p.careerId === initial.careerId)
  return (
    <div className="space-y-4">
      <Panel title="Sus planes">
        <div className="grid items-start gap-4 lg:grid-cols-3">
          {(['A', 'B', 'C'] as const).map((slot) => {
            const plan = student.plans.find((p) => p.slot === slot)
            return plan ? (
              <PlanCard key={slot} plan={plan} student={student} />
            ) : (
              <p key={slot} className="rounded-lg border border-dashed p-4 text-muted-foreground">
                Plan {slot} sin registrar
              </p>
            )
          })}
        </div>
      </Panel>
      <Panel title="Interés inicial">
        {initial ? (
          <div className="space-y-2">
            <p>
              Su primera opción fue {profileCatalog.careers.find((c) => c.id === initial.careerId)?.name} (
              {displayDate(initial.date)}).
            </p>
            <p className="text-muted-foreground">
              {initialPlan ? `Hoy es su Plan ${initialPlan.slot}` : 'Ya no está entre sus planes'}
            </p>
          </div>
        ) : (
          <EmptyMessage>Todavía no registra una primera opción de carrera.</EmptyMessage>
        )}
      </Panel>
      <Panel title="Favoritos">
        <p className="mb-4 text-muted-foreground">
          {affinity.available
            ? `${affinity.matched} de ${affinity.total} favoritos coinciden con su test de intereses`
            : 'Se mostrará cuando complete el test de intereses.'}
        </p>
        <div className="grid gap-5 lg:grid-cols-3">
          <section>
            <h3 className="mb-3 font-semibold">Carreras</h3>
            {student.favorites.careers.length ? (
              <ul className="space-y-3">
                {student.favorites.careers.map((id) => (
                  <li key={id} className="space-y-2 rounded-lg border p-3">
                    <p>{profileCatalog.careers.find((c) => c.id === id)?.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {affinity.careers.includes(id) && <Badge variant="secondary">Afín a su test</Badge>}
                      {relations.careers.includes(id) && (
                        <Badge variant="outline" className="whitespace-normal">
                          Relacionada con una ocupación favorita
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage>Todavía no marca carreras como favoritas.</EmptyMessage>
            )}
          </section>
          <section>
            <h3 className="mb-3 font-semibold">Ocupaciones</h3>
            {student.favorites.occupations.length ? (
              <ul className="space-y-3">
                {student.favorites.occupations.map((id) => (
                  <li key={id} className="space-y-2 rounded-lg border p-3">
                    <p>{profileCatalog.occupations.find((o) => o.id === id)?.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {affinity.occupations.includes(id) && <Badge variant="secondary">Afín a su test</Badge>}
                      {relations.occupations.includes(id) && (
                        <Badge variant="outline" className="whitespace-normal">
                          Relacionada con una carrera favorita
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage>Todavía no marca ocupaciones como favoritas.</EmptyMessage>
            )}
          </section>
          <section>
            <h3 className="mb-3 font-semibold">Instituciones</h3>
            {student.favorites.institutions.length ? (
              <ul className="space-y-3">
                {student.favorites.institutions.map((id) => (
                  <li key={id} className="space-y-2 rounded-lg border p-3">
                    <p>{profileCatalog.institutions.find((i) => i.id === id)?.name}</p>
                    {relations.institutions.includes(id) ? (
                      <Badge variant="outline" className="whitespace-normal">
                        Ofrece una de sus carreras favoritas o de sus planes
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No ofrece ninguna de sus carreras favoritas
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyMessage>Todavía no marca instituciones como favoritas.</EmptyMessage>
            )}
          </section>
        </div>
      </Panel>
    </div>
  )
}
