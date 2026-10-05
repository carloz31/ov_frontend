import { BookOpenCheck, Gauge, NotebookPen, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AlertBadge } from '@/components/ui/Status'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { blocks, profileCatalog, studentProfiles } from './profile/data'
import { profileAlertLabels } from './profile/selectors'
import { usePriorityCatalog } from './priorities/usePrioritySettings'
import { classroomSummary } from './classroom/selectors'
import { useSelectedSalon } from './classroom/useSelectedSalon'
import {
  ClassroomMetric,
  InterestTable,
  SegmentBar,
  StateBar,
  StateCounts,
  StateLegend,
} from './classroom/ClassroomShared'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex min-w-0 flex-col gap-5 rounded-xl p-5 sm:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      {children}
    </Card>
  )
}
function ConfigurePriorities() {
  return (
    <Button asChild variant="outline" className="min-h-11 self-start">
      <Link to="/counselor/priorities">Configurar prioritarios</Link>
    </Button>
  )
}
const number = (value: number) => value.toLocaleString('es-ES', { maximumFractionDigits: 1 })
function CounselorDashboardView() {
  const { salon, setSalon, salons } = useSelectedSalon()
  const [params, setParams] = useSearchParams()
  const section = params.get('section') === 'interests' ? 'interests' : 'tracking'
  const setSection = (value: string) => {
    const next = new URLSearchParams(params)
    next.set('section', value)
    next.set('salon', salon)
    setParams(next)
  }
  const { activities, questionnaires } = usePriorityCatalog()
  const students = studentProfiles.filter((student) => salon === 'all' || student.salon === salon)
  const summary = classroomSummary(
    students,
    studentProfiles,
    activities,
    questionnaires,
    blocks,
    profileCatalog,
  )
  const listUrl = `/counselor/students?${new URLSearchParams({ salon })}`
  const ratio = (count: number) => (summary.total ? (count / summary.total) * 100 : 0)
  const questionRows = summary.questionnaires.filter((row) => row.definition.priority)
  const recordRows = summary.records.filter((row) => row.activity.priority)
  const descent = summary.security.trends.find((row) => row.label === 'En descenso')!.count
  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-bold">Inicio</h1>
          <span className="text-sm text-muted-foreground">{summary.total} estudiantes</span>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select value={salon} onValueChange={setSalon}>
            <SelectTrigger aria-label="Filtrar por salón" className="min-h-11 w-full bg-card sm:w-48">
              <SelectValue>{salon === 'all' ? 'Todos mis salones' : `Salón: ${salon}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos mis salones</SelectItem>
              {salons.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild variant="outline" className="min-h-11 whitespace-normal">
            <Link to={listUrl}>Ver estudiantes del salón</Link>
          </Button>
        </div>
      </header>
      <Tabs value={section} onValueChange={setSection} className="space-y-6">
        <TabsList aria-label="Vista del inicio" className="flex w-full items-stretch sm:w-fit">
          <TabsTrigger value="tracking" className="min-w-0 flex-1 text-sm whitespace-normal sm:flex-none">
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="interests" className="min-w-0 flex-1 text-sm whitespace-normal sm:flex-none">
            Intereses vocacionales
          </TabsTrigger>
        </TabsList>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ClassroomMetric
            icon={Gauge}
            label="Avance prioritario promedio"
            value={
              summary.average === null
                ? summary.priorityActivityCount
                  ? 'Sin datos'
                  : 'Sin prioritarios'
                : `${Math.round(summary.average)} %`
            }
            percent={summary.average}
          />
          <ClassroomMetric
            icon={BookOpenCheck}
            label="Estudiantes con cuestionarios completos"
            value={
              summary.questionnaireComplete === null
                ? 'Sin prioritarios'
                : `${summary.questionnaireComplete} de ${summary.total} estudiantes`
            }
            note="Todos los prioritarios"
            percent={summary.questionnaireComplete === null ? null : ratio(summary.questionnaireComplete)}
          />
          <ClassroomMetric
            icon={NotebookPen}
            label="Con planes"
            value={`${summary.withPlans} de ${summary.total}`}
            note={`${summary.plans.three} con sus tres planes`}
            percent={ratio(summary.withPlans)}
          />
          <ClassroomMetric
            icon={Users}
            label="Apoderados registrados"
            value={`${summary.family.registered} de ${summary.total}`}
            note={`${summary.family.completed} completaron su ruta`}
            percent={ratio(summary.family.registered)}
          />
        </div>
        <TabsContent value="tracking">
          <div className="grid min-w-0 items-stretch gap-6 lg:grid-cols-2">
            <Section title="Alertas">
              <p className="text-sm">
                <strong>
                  {summary.withAlerts} de {summary.total}
                </strong>{' '}
                con al menos una alerta
              </p>
              <div className="space-y-5">
                {summary.alerts.map((row) => (
                  <div
                    key={row.code}
                    className="relative flex min-h-10 items-center justify-between gap-3 rounded-md px-2 text-sm"
                  >
                    <span
                      className="absolute inset-y-1 left-0 rounded bg-primary-soft"
                      style={{ width: `${ratio(row.count)}%` }}
                      aria-hidden
                    />
                    <AlertBadge className="relative text-xs">{profileAlertLabels[row.code]}</AlertBadge>
                    <span className="relative shrink-0">
                      {row.count} · {Math.round(ratio(row.count))} %
                    </span>
                  </div>
                ))}
              </div>
              {!summary.alerts.length && (
                <p className="text-sm text-muted-foreground">
                  {summary.total
                    ? 'Ningún estudiante del salón tiene alertas.'
                    : 'Todavía no hay estudiantes en este salón.'}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Un estudiante puede presentar varias alertas.</p>
              <Button asChild variant="outline" className="mt-auto min-h-11 self-start whitespace-normal">
                <Link to={`${listUrl}&alertas=with`}>Ver estudiantes con alertas</Link>
              </Button>
            </Section>
            <Section title="Cuestionarios">
              {questionRows.length ? (
                <>
                  <StateLegend />
                  <div className="space-y-5">
                    {questionRows.slice(0, 5).map((row) => (
                      <div key={row.definition.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-3 text-sm">
                          <h3 className="font-semibold">{row.definition.name}</h3>
                          <StateCounts
                            completed={row.completed}
                            progress={row.progress}
                            pending={row.pending}
                          />
                        </div>
                        <StateBar completed={row.completed} progress={row.progress} pending={row.pending} />
                        {row.definition.kind === 'comparison' ? (
                          <p className="text-xs text-muted-foreground">
                            {row.entry
                              ? `Subieron: ${row.increased} de ${row.exit} con salida`
                              : 'Sin resultados'}
                            {row.entry > row.exit ? ` · ${row.entry - row.exit} con salida pendiente` : ''}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {row.frequent.slice(0, 2).map((dimension) => (
                              <Badge
                                key={dimension.id}
                                variant="secondary"
                                className="bg-primary-soft px-2 py-1 text-xs font-normal text-foreground"
                              >
                                {dimension.name}: {dimension.count}
                              </Badge>
                            ))}
                            {row.flat > 0 && (
                              <span className="text-xs text-muted-foreground">Perfil plano: {row.flat}</span>
                            )}
                            {!row.frequent.length && !row.flat && (
                              <span className="text-xs text-muted-foreground">Sin resultados</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {questionRows.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      y {questionRows.length - 5} cuestionarios más en el perfil de cada estudiante
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Sin cuestionarios prioritarios configurados.
                  </p>
                  <ConfigurePriorities />
                </>
              )}
            </Section>
            <Section title="Actividades de registro">
              {recordRows.length ? (
                <>
                  <StateLegend />
                  <div className="space-y-5">
                    {recordRows.slice(0, 4).map((row) => (
                      <div key={row.activity.id} className="space-y-2">
                        <div className="flex items-start justify-between gap-3 text-sm">
                          <h3 className="font-semibold">{row.activity.title}</h3>
                          <StateCounts
                            completed={row.completed}
                            progress={row.progress}
                            pending={row.pending}
                          />
                        </div>
                        <StateBar completed={row.completed} progress={row.progress} pending={row.pending} />
                      </div>
                    ))}
                  </div>
                  {recordRows.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      y {recordRows.length - 4} actividades más en el perfil de cada estudiante
                    </p>
                  )}
                  <div className="mt-auto space-y-3 border-t pt-4 text-sm">
                    <p>
                      Respuestas poco desarrolladas:{' '}
                      <strong>{summary.recordObservations.underdeveloped}</strong>
                    </p>
                    <AlertBadge critical={summary.recordObservations.attention > 0} className="text-xs">
                      Requiere atención: {summary.recordObservations.attention} estudiantes
                    </AlertBadge>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Sin actividades de registro prioritarias configuradas.
                  </p>
                  <ConfigurePriorities />
                </>
              )}
            </Section>
            <Section title="Seguridad y diario">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">Seguridad</h3>
                  <strong className="text-lg">
                    {summary.security.average === null
                      ? 'Sin datos'
                      : `${number(summary.security.average)} de 10`}
                  </strong>
                </div>
                <p className="text-xs text-muted-foreground">
                  Último check-in · {summary.security.base} estudiantes con datos
                </p>
                <SegmentBar
                  labels={summary.security.trends.map((row) => row.label)}
                  values={summary.security.trends.map((row) => row.count)}
                  colors={['bg-data-primary', 'bg-data-secondary', 'bg-neutral', 'bg-neutral-soft']}
                />
                <p className="text-xs">
                  <strong>{descent}</strong>{' '}
                  {descent === 1 ? 'estudiante en descenso' : 'estudiantes en descenso'}
                </p>
              </div>
              <div className="space-y-3 border-t pt-5">
                <div className="flex justify-between text-sm">
                  <h3 className="font-semibold">Diario</h3>
                  <strong>{summary.diary.total} entradas</strong>
                </div>
                <SegmentBar
                  labels={
                    summary.diary.unclassified
                      ? ['Guiadas', 'Pregunta del día', 'Libres', 'Sin tipo']
                      : ['Guiadas', 'Pregunta del día', 'Libres']
                  }
                  values={
                    summary.diary.unclassified
                      ? [
                          summary.diary.guided,
                          summary.diary.dailyPrompt,
                          summary.diary.free,
                          summary.diary.unclassified,
                        ]
                      : [summary.diary.guided, summary.diary.dailyPrompt, summary.diary.free]
                  }
                  colors={['bg-data-primary', 'bg-data-secondary', 'bg-neutral', 'bg-neutral-soft']}
                />
                {!summary.diary.total && (
                  <p className="text-xs text-muted-foreground">Todavía no hay entradas registradas.</p>
                )}
                {summary.diary.unclassified > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {summary.diary.unclassified} entradas sin tipo registrado.
                  </p>
                )}
              </div>
              <p className="mt-auto text-xs text-muted-foreground">
                Solo conteos. El contenido del diario es privado.
              </p>
            </Section>
          </div>
        </TabsContent>
        <TabsContent value="interests">
          <div className="grid min-w-0 items-stretch gap-6 lg:grid-cols-2">
            <Section title="Carreras de interés">
              <InterestTable rows={summary.interests.careers} total={summary.total} />
              <p className="mt-auto border-t pt-4 text-sm text-muted-foreground">
                Mantienen su interés inicial como plan A:{' '}
                <strong className="text-foreground">
                  {summary.plans.initialA} de {summary.total - summary.plans.noInitial}
                </strong>
              </p>
            </Section>
            <Section title="Instituciones de interés">
              <InterestTable rows={summary.interests.institutions} total={summary.total} institutions />
              <p className="mt-auto text-xs text-muted-foreground">
                Instituciones registradas en planes y favoritas. Datos de ejemplo del prototipo.
              </p>
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
export { CounselorDashboardView }
