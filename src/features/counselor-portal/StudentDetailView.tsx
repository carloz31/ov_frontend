import {
  AlertTriangle,
  ArrowLeft,
  CircleCheck,
  CircleHelp,
  CircleX,
  ChevronDown,
  ChevronRight,
  Eye,
  LockKeyhole,
  Minus,
  MoreHorizontal,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { appPaths } from '@/routes/paths'
import { studentProfiles } from './profile/data'
import { StudentProfileView } from './profile/StudentProfileView'
import {
  formatRelative,
  getActivity,
  getAlertExplanation,
  getAlerts,
  getCardParts,
  getFamilyActivityRows,
  getInterestCounts,
  getInterestTimeline,
  getPendingReviewRecords,
  getPriorityActivities,
  getPriorityProgress,
  getStudentTagRows,
  getTrafficLight,
  latestRecords,
} from './CounselorPortalSelectors'
import { useCounselorPortal } from './CounselorPortalContext'
import { AlertChips, CounselorLineChart, Delta, TrafficBadge, WatchIcon } from './components/CounselorShared'
import type {
  ActivityType,
  CareerCardPart,
  Interest,
  Student,
  StudentRecord,
} from './types/CounselorPortalTypes'

const sections = [
  ['summary', 'Resumen'],
  ['progress', 'Progreso'],
  ['instruments', 'Instrumentos'],
  ['interests', 'Intereses'],
  ['journal', 'Diario'],
  ['family', 'Familia'],
  ['data', 'Datos'],
] as const

function StudentDetailView() {
  const { state, dispatch } = useCounselorPortal()
  const navigate = useNavigate()
  const { studentId } = useParams()
  const [params, setParams] = useSearchParams()
  const student = state.students.find((item) => item.id === studentId)
  const [observationOpen, setObservationOpen] = useState(false)
  const [removeObservationOpen, setRemoveObservationOpen] = useState(false)
  const [observationReason, setObservationReason] = useState('')
  const exampleStudent = studentProfiles.find((item) => item.id === studentId)
  if (exampleStudent) return <StudentProfileView student={exampleStudent} />
  if (!student)
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center">
        <div>
          <h1 className="text-xl font-bold">Estudiante no encontrado</h1>
          <Button className="mt-4" onClick={() => navigate(appPaths.counselor.students)}>
            Volver a estudiantes
          </Button>
        </div>
      </div>
    )
  const requestedSection = params.get('section') === 'records' ? 'progress' : params.get('section')
  const section = sections.some(([id]) => id === requestedSection) ? requestedSection! : 'summary'
  const alerts = getAlerts(state, student)
  const traffic = getTrafficLight(alerts)
  const watched = state.watchlist.some((entry) => entry.studentId === student.id)
  const classroom = state.classrooms.find((item) => item.id === student.classroomId)
  const allStudentActivities = state.activities.filter((activity) => activity.participant === 'ESTUDIANTE')
  const totalCompleted = allStudentActivities.filter((activity) =>
    activity.type === 'CASO'
      ? student.completedCaseIds.includes(activity.id)
      : student.progress.some((entry) => entry.activityId === activity.id && entry.status === 'COMPLETADA'),
  ).length
  const totalPercent = allStudentActivities.length
    ? Math.round((totalCompleted / allStudentActivities.length) * 100)
    : 100
  const daysSinceAccess = Math.max(
    0,
    Math.floor(
      (new Date(state.referenceDate).getTime() - new Date(student.lastAccess).getTime()) / 86_400_000,
    ),
  )
  const toggleObservation = () => (watched ? setRemoveObservationOpen(true) : setObservationOpen(true))
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <Button className="px-0" onClick={() => navigate(appPaths.counselor.students)} variant="link">
        <ArrowLeft /> Volver a estudiantes
      </Button>
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <div className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(18rem,1.7fr)_minmax(9rem,.75fr)_minmax(10rem,.8fr)_minmax(9rem,.75fr)] lg:items-start">
            <div className="flex min-w-0 gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-lg font-bold text-primary">
                {student.name
                  .split(' ')
                  .filter(Boolean)
                  .map((part) => part[0])
                  .filter((_, index, initials) => index === 0 || index === initials.length - 1)
                  .join('')}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold">{student.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{classroom?.name}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{student.code}</p>
              </div>
            </div>
            <HeaderDatum label="Estado">
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="size-2 rounded-full bg-primary" />
                Cuenta activa
              </span>
            </HeaderDatum>
            <HeaderDatum label="Progreso">
              <div className="flex items-center gap-3">
                <div className="h-2 w-full max-w-36 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${totalPercent}%`,
                      backgroundColor: totalPercent === 100 ? 'var(--success)' : 'var(--primary)',
                    }}
                  />
                </div>
                <strong className={progressPercentColor(totalPercent)}>{totalPercent}%</strong>
              </div>
            </HeaderDatum>
            <HeaderDatum label="Último acceso">
              <span className="font-medium">
                {daysSinceAccess === 0
                  ? 'Hoy'
                  : `Hace ${daysSinceAccess} ${daysSinceAccess === 1 ? 'día' : 'días'}`}
              </span>
            </HeaderDatum>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
            <TrafficBadge status={traffic} />
            <AlertChips alerts={alerts} compact />
            <span className="ml-auto inline-flex items-center gap-2 text-sm font-medium">
              <WatchIcon active={watched} /> {watched ? 'En observación' : 'Sin observación'}
            </span>
            <Button onClick={toggleObservation} variant={watched ? 'outline' : 'default'}>
              {watched ? 'Quitar de observados' : 'Agregar a observados'}
            </Button>
          </div>
        </div>
        <div className="flex overflow-x-auto border-t px-2">
          {sections.map(([id, label]) => (
            <button
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${section === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
              key={id}
              onClick={() => setParams({ section: id })}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </Card>
      {section === 'summary' && <Summary stateStudent={student} />}
      {section === 'progress' && <ProgressSection student={student} />}
      {section === 'instruments' && <InstrumentsSection student={student} />}
      {section === 'interests' && <InterestsSection student={student} />}
      {section === 'journal' && <JournalSection student={student} />}
      {section === 'family' && <FamilySection student={student} />}
      {section === 'data' && <DataSection student={student} />}
      <Dialog onOpenChange={setObservationOpen} open={observationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar a observación</DialogTitle>
            <DialogDescription>
              Indica el motivo por el que deseas realizar un seguimiento más cercano de este estudiante.
            </DialogDescription>
          </DialogHeader>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Motivo</span>
            <textarea
              className="min-h-28 w-full rounded-xl border bg-background p-3"
              onChange={(event) => setObservationReason(event.target.value)}
              placeholder="Escribe el motivo de observación..."
              value={observationReason}
            />
          </label>
          <Button
            onClick={() => {
              dispatch({
                type: 'TOGGLE_WATCHLIST',
                studentId: student.id,
                reason: observationReason.trim() || undefined,
              })
              setObservationReason('')
              setObservationOpen(false)
            }}
          >
            Registrar observación
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setRemoveObservationOpen} open={removeObservationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitar de observados</DialogTitle>
            <DialogDescription>
              ¿Estás segura de que deseas quitar a {student.name} de la lista de observación?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setRemoveObservationOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: 'TOGGLE_WATCHLIST', studentId: student.id })
                setRemoveObservationOpen(false)
              }}
            >
              Quitar de observados
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HeaderDatum({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function progressPercentColor(_percent: number) {
  return 'text-base text-foreground'
}

function Summary({ stateStudent: student }: { stateStudent: Student }) {
  const { state } = useCounselorPortal()
  const navigate = useNavigate()
  const alerts = getAlerts(state, student)
  const tagRows = getStudentTagRows(state, student)
    .sort((a, b) => (a.exit ?? a.entry ?? 6) - (b.exit ?? b.entry ?? 6))
    .slice(0, 3)
  const interestCounts = getInterestCounts(student)
  const pending = getPendingReviewRecords(state, student).length
  const familyRows = getFamilyActivityRows(state, student)
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="font-bold">Alertas explicadas</h2>
        <div className="mt-4 space-y-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <div
                className="flex gap-3 rounded-xl border border-border bg-warning-soft p-4 text-warning-text"
                key={alert}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-warning-soft text-warning-text">
                  <AlertTriangle className="size-4" />
                </span>
                <p className="self-center text-sm leading-6">
                  <strong>{alert}:</strong> {getAlertExplanation(state, student, alert)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay alertas activas.</p>
          )}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Temas a reforzar</h2>
        <div className="mt-4 space-y-3">
          {tagRows.map((row) => (
            <button
              className="flex w-full items-center justify-between rounded-xl border p-3 text-left hover:bg-muted/30"
              key={row.tag.id}
              onClick={() =>
                navigate(`${appPaths.counselor.publications}?tab=publications&tag=${row.tag.id}`)
              }
              type="button"
            >
              <span>
                <strong className="text-sm">
                  {row.tag.code} · {row.tag.name}
                </strong>
                <span className="block text-xs text-muted-foreground">Ver recursos relacionados</span>
              </span>
              <strong>{(row.exit ?? row.entry)?.toFixed(1) ?? '—'}</strong>
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Intereses</h2>
        <p className="mt-3 text-3xl font-bold text-primary">
          {interestCounts.careers + interestCounts.occupations + interestCounts.institutions}
        </p>
        <p className="text-sm text-muted-foreground">
          carreras, ocupaciones e instituciones · {interestCounts.careers - interestCounts.completeCards}{' '}
          fichas de carrera incompletas
        </p>
      </Card>
      <Card className="p-5">
        <h2 className="font-bold">Seguimiento inmediato</h2>
        <p className="mt-3 text-sm">
          Registros pendientes: <strong>{pending}</strong>
        </p>
        <p className="mt-2 text-sm">
          Familia:{' '}
          <strong>
            {student.guardian
              ? `${student.guardian.name} · ${familyRows.filter((item) => item.status === 'COMPLETADA').length}/${familyRows.filter((item) => item.activatedAt).length} actividades`
              : 'Apoderado sin registrar'}
          </strong>
        </p>
      </Card>
    </div>
  )
}

function ProgressSection({ student }: { student: Student }) {
  const { state } = useCounselorPortal()
  const navigate = useNavigate()
  const [groupBy, setGroupBy] = useState<'block' | 'type'>('type')
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const progress = getPriorityProgress(state, student)
  const activities = state.activities
    .filter((item) => item.participant === 'ESTUDIANTE')
    .sort((a, b) => a.order - b.order)
  const records = latestRecords(student)
  const observedCount = records.filter((record) => record.preliminaryReview === 'OBSERVADO').length
  const completions = [
    ...student.progress.flatMap((item) => (item.completedAt ? [item.completedAt] : [])),
    ...Object.values(student.completedCaseDates),
  ]
  const weeks = completions.reduce<Record<number, number>>((acc, completedAt) => {
    const days = Math.max(
      0,
      Math.floor((new Date(state.referenceDate).getTime() - new Date(completedAt).getTime()) / 86_400_000),
    )
    const week = Math.floor(days / 7)
    if (week < 5) acc[week] = (acc[week] ?? 0) + 1
    return acc
  }, {})
  const groups = activities.reduce<Record<string, typeof activities>>((acc, activity) => {
    const key = groupBy === 'block' ? activity.block : activityTypeLabel(activity.type)
    ;(acc[key] ??= []).push(activity)
    return acc
  }, {})
  const orderedGroups = Object.entries(groups).sort(([groupA], [groupB]) => {
    if (groupBy === 'block') return (groups[groupA][0]?.order ?? 0) - (groups[groupB][0]?.order ?? 0)
    const typeOrder = ['Registros', 'Instrumentos', 'Informativas', 'Casos']
    return typeOrder.indexOf(groupA) - typeOrder.indexOf(groupB)
  })
  const completedCount = activities.filter((activity) =>
    activity.type === 'CASO'
      ? student.completedCaseIds.includes(activity.id)
      : student.progress.some((item) => item.activityId === activity.id && item.status === 'COMPLETADA'),
  ).length
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Actividades</h2>
            <p className="text-sm text-muted-foreground">
              Consulta el avance y abre las respuestas de registro.
            </p>
          </div>
          <div className="flex rounded-xl border p-1">
            <Button
              onClick={() => setGroupBy('block')}
              size="sm"
              variant={groupBy === 'block' ? 'default' : 'ghost'}
            >
              Por bloque
            </Button>
            <Button
              onClick={() => setGroupBy('type')}
              size="sm"
              variant={groupBy === 'type' ? 'default' : 'ghost'}
            >
              Por tipo
            </Button>
          </div>
        </div>
        {orderedGroups.map(([group, rows]) => {
          const groupCompleted = rows.filter((activity) =>
            activity.type === 'CASO'
              ? student.completedCaseIds.includes(activity.id)
              : student.progress.some(
                  (item) => item.activityId === activity.id && item.status === 'COMPLETADA',
                ),
          ).length
          const collapsed = collapsedGroups.has(group)
          return (
            <Card className="overflow-hidden" key={group}>
              <button
                aria-expanded={!collapsed}
                className="flex w-full items-center justify-between gap-4 border-b bg-muted/40 px-6 py-4 text-left"
                onClick={() =>
                  setCollapsedGroups((current) => {
                    const next = new Set(current)
                    if (next.has(group)) next.delete(group)
                    else next.add(group)
                    return next
                  })
                }
                type="button"
              >
                <span>
                  <span className="block font-bold">{group}</span>
                  <span className="text-xs text-muted-foreground">
                    {groupCompleted} de {rows.length} actividades completadas
                  </span>
                </span>
                {collapsed ? <ChevronRight className="size-5" /> : <ChevronDown className="size-5" />}
              </button>
              {!collapsed && (
                <div className="divide-y">
                  {rows.map((activity) => {
                    const progressRow = student.progress.find((item) => item.activityId === activity.id)
                    const record = records.find((item) => item.activityId === activity.id)
                    const complete =
                      activity.type === 'CASO'
                        ? student.completedCaseIds.includes(activity.id)
                        : progressRow?.status === 'COMPLETADA'
                    const completedAt =
                      activity.type === 'CASO'
                        ? student.completedCaseDates[activity.id]
                        : progressRow?.completedAt
                    const observed = Boolean(record && record.preliminaryReview === 'OBSERVADO')
                    return (
                      <div className="flex flex-wrap items-center gap-4 px-6 py-4" key={activity.id}>
                        <span
                          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-success-soft text-success-text' : 'bg-muted text-muted-foreground'}`}
                        >
                          {complete ? <CircleCheck className="size-4" /> : <Minus className="size-4" />}
                        </span>
                        <div className="min-w-52 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm">
                              {activity.code} · {activity.name}
                            </strong>
                            {activity.type === 'REGISTRO' && observed && (
                              <span
                                aria-label="Registro observado"
                                title="Registro observado"
                                className="inline-flex size-5 items-center justify-center rounded-full bg-primary-soft text-primary"
                              >
                                <CircleHelp className="size-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activity.type === 'TEST'
                              ? `Instrumento: ${activity.name}`
                              : activityTypeLabel(activity.type)}{' '}
                            ·{' '}
                            {complete && completedAt
                              ? `Completada ${new Date(completedAt).toLocaleDateString('es-PE')}`
                              : 'No completada'}
                          </p>
                        </div>
                        {activity.type === 'REGISTRO' && record && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label={`Acciones para ${activity.name}`}
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() =>
                                  navigate(appPaths.counselor.studentRecord(student.id, record.id))
                                }
                              >
                                <Eye /> Ver respuesta
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
      <aside className="space-y-5 lg:sticky lg:top-4">
        <Card className="grid grid-cols-3 gap-2 p-4">
          <CircleMetric
            completed={completedCount}
            label="Avance total"
            percent={activities.length ? Math.round((completedCount / activities.length) * 100) : 100}
            total={activities.length}
          />
          <CircleMetric
            completed={progress.completed}
            label="Registros prioritarios"
            percent={progress.percent}
            total={progress.total}
          />
          <div className="flex min-w-0 flex-col items-center text-center">
            <div className="grid size-16 place-items-center rounded-full border-8 border-border text-xl font-bold text-primary">
              {observedCount}
            </div>
            <p className="mt-2 text-[11px] font-semibold leading-tight">Registros observados</p>
            <p className="mt-1 text-[10px] leading-tight text-muted-foreground">requieren seguimiento</p>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold">Ritmo semanal</h3>
          <p className="text-xs text-muted-foreground">Actividades completadas en las últimas 5 semanas.</p>
          <div className="mt-5 flex h-48 items-end gap-3">
            {Array.from({ length: 5 }, (_, index) => 4 - index).map((week) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={week}>
                <strong className="text-xs">{weeks[week] ?? 0}</strong>
                <div
                  className="w-full rounded-t-lg bg-primary"
                  style={{ height: `${Math.max(8, (weeks[week] ?? 0) * 26)}px` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {week === 0 ? 'Actual' : `-${week}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </aside>
    </div>
  )
}

function CircleMetric({
  completed,
  label,
  percent,
  total,
  unit = 'act. completadas',
}: {
  completed: number
  label: string
  percent: number
  total: number
  unit?: string
}) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative grid size-16 place-items-center">
        <svg className="absolute inset-0 size-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
          <circle cx="32" cy="32" r="28" fill="none" stroke="var(--track)" strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={percent === 100 ? 'var(--success)' : 'var(--primary)'}
            strokeWidth="6"
            strokeDasharray={`${percent * 1.7593} 175.93`}
          />
        </svg>
        <strong className="text-sm">{percent}%</strong>
      </div>
      <p className="mt-2 text-[11px] font-semibold leading-tight">{label}</p>
      <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
        {completed} de {total} {unit}
      </p>
    </div>
  )
}

function activityTypeLabel(type: ActivityType) {
  return type === 'CASO'
    ? 'Casos'
    : type === 'TEST'
      ? 'Instrumentos'
      : type === 'REGISTRO'
        ? 'Registros'
        : 'Informativas'
}

function InstrumentsSection({ student }: { student: Student }) {
  const { state } = useCounselorPortal()
  const rows = getStudentTagRows(state, student)
  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-3 font-bold">Tests de Me conozco</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {student.testResults.map((test) => (
            <Card className="p-5" key={test.name}>
              <h3 className="font-bold">{test.name}</h3>
              <p className="mt-3 text-lg font-semibold text-primary">{test.summary}</p>
              <ul className="mt-3 list-inside list-disc text-sm text-muted-foreground">
                {test.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
      <Card className="p-5">
        <h2 className="font-bold">Cuestionario de entrada</h2>
        <div className="mt-4 space-y-3">
          {student.entranceAnswers.map((item) => (
            <div className="rounded-xl bg-muted/50 p-3" key={item.question}>
              <p className="text-xs font-semibold text-muted-foreground">{item.question}</p>
              <p className="mt-1 text-sm">{item.answer}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <div className="border-b p-5">
          <h2 className="font-bold">Autopercepción · entrada vs. salida</h2>
        </div>
        <table className="w-full min-w-[650px] text-left text-sm [&_td:last-child]:pr-8 [&_th:last-child]:pr-8">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Tema</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Variación</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.tag.id}>
                <td className="p-4">
                  <details>
                    <summary className="cursor-pointer font-medium">
                      {row.tag.code} · {row.tag.name}
                    </summary>
                    <div className="mt-3 space-y-2">
                      {state.perceptionItems
                        .filter((item) => item.tagIds.includes(row.tag.id))
                        .map((item) => {
                          const entry = student.perceptions.find((app) => app.moment === 'ENTRADA')?.answers[
                            item.id
                          ]
                          const exit = student.perceptions.find((app) => app.moment === 'SALIDA')?.answers[
                            item.id
                          ]
                          return (
                            <p className="text-xs font-normal text-muted-foreground" key={item.id}>
                              {item.statement} · {entry ?? '—'} → {exit ?? '—'}{' '}
                              {item.direction === 'NEUTRA' && <Badge variant="outline">Sin dirección</Badge>}
                            </p>
                          )
                        })}
                    </div>
                  </details>
                </td>
                <td>{row.entry?.toFixed(1) ?? '—'}</td>
                <td>{row.exit?.toFixed(1) ?? '—'}</td>
                <td>
                  <Delta value={row.delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function InterestsSection({ student }: { student: Student }) {
  const timeline = getInterestTimeline(student)
  const careers = student.interests.filter((item) => item.type === 'CARRERA' && item.status === 'ACTIVO')
  const occupations = student.interests.filter(
    (item) => item.type === 'OCUPACION' && item.status === 'ACTIVO',
  )
  const [selectedCareer, setSelectedCareer] = useState<Interest>()
  const max = Math.max(
    1,
    ...timeline.map((item) => Math.max(item.careers, item.occupations, item.institutions)),
  )
  const chartData = timeline.map((item) => ({
    label: new Date(item.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    careers: item.careers,
    occupations: item.occupations,
    institutions: item.institutions,
  }))
  const markers = ['act-12', 'act-17'].flatMap((activityId) => {
    const completedAt = student.progress.find((item) => item.activityId === activityId)?.completedAt
    return completedAt
      ? [
          {
            value: new Date(completedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
            label: activityId === 'act-12' ? 'ACT-12' : 'ACT-17',
          },
        ]
      : []
  })
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="font-bold">Evolución de intereses</h2>
        <p className="text-xs text-muted-foreground">
          Carreras, ocupaciones e instituciones agregadas durante el proceso.
        </p>
        <div className="mt-4">
          <CounselorLineChart
            data={chartData}
            domain={[0, max + 1]}
            label="Evolución de intereses"
            markers={markers}
            series={[
              { key: 'careers', label: 'Carreras', color: 'var(--primary)' },
              { key: 'occupations', label: 'Ocupaciones', color: 'var(--data-secondary)' },
              { key: 'institutions', label: 'Instituciones', color: 'var(--data-baseline)' },
            ]}
          />
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <div className="border-b p-5">
          <h2 className="font-bold">Carreras de interés</h2>
        </div>
        <table className="w-full min-w-[980px] text-left text-sm [&_td:first-child]:pl-6 [&_td:last-child]:pr-8 [&_th:first-child]:pl-6 [&_th:last-child]:pr-8">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Nombre</th>
              <th>Fecha agregada</th>
              <th>Código RIASEC</th>
              <th>Match RIASEC</th>
              <th>Motivación</th>
              <th>Influencias</th>
              <th>Conocimiento</th>
              <th>Preparación</th>
              <th>Presupuesto</th>
              <th className="w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {careers.map((interest) => (
              <CareerRow interest={interest} key={interest.id} onView={setSelectedCareer} />
            ))}
          </tbody>
        </table>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="overflow-x-auto">
          <div className="border-b p-5">
            <h2 className="font-bold">Ocupaciones de interés</h2>
          </div>
          <table className="w-full text-left text-sm [&_td:last-child]:pr-6 [&_th:last-child]:pr-6">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Nombre</th>
                <th>Fecha agregada</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {occupations.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td>{new Date(item.addedAt).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="overflow-x-auto">
          <div className="border-b p-5">
            <h2 className="font-bold">Instituciones de interés</h2>
          </div>
          <table className="w-full text-left text-sm [&_td:last-child]:pr-6 [&_th:last-child]:pr-6">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Nombre</th>
                <th>Tipo</th>
                <th>Fecha agregada</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {student.institutions.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td>{institutionTypeLabel(item.type)}</td>
                  <td>{new Date(item.addedAt).toLocaleDateString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
      <Sheet onOpenChange={(open) => !open && setSelectedCareer(undefined)} open={Boolean(selectedCareer)}>
        <SheetContent className="overflow-y-auto" side="responsive">
          <SheetHeader>
            <SheetTitle>{selectedCareer?.name}</SheetTitle>
            <SheetDescription>Ficha de carrera construida por el estudiante.</SheetDescription>
          </SheetHeader>
          {selectedCareer && (
            <div className="mt-6 grid gap-4">
              <Detail label="Motivación" value={selectedCareer.card?.motivation} />
              <Detail
                label="Influencias"
                value={selectedCareer.card?.influences
                  .map((item) => `${item.person}: ${item.description}`)
                  .join('; ')}
              />
              <Detail label="Lo que conoce" value={selectedCareer.card?.knowledge} />
              <Detail label="Preparación" value={selectedCareer.card?.preparations.join(', ')} />
              <Detail
                label="Presupuestos"
                value={selectedCareer.card?.budgets
                  .map(
                    (item) =>
                      `${item.institution}, ${item.duration}, S/ ${item.totalCost.toLocaleString('es-PE')}`,
                  )
                  .join('; ')}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CareerRow({ interest, onView }: { interest: Interest; onView: (interest: Interest) => void }) {
  const parts = getCardParts(interest)
  const partKeys: CareerCardPart[] = ['motivation', 'influences', 'knowledge', 'preparations', 'budgets']
  const match =
    interest.riasecMatch === 'GREAT'
      ? ['Excelente', 'neutral']
      : interest.riasecMatch === 'GOOD'
        ? ['Bueno', 'neutral']
        : ['Bajo', 'outline']
  return (
    <tr>
      <td className="p-4 font-medium">{interest.name}</td>
      <td>{new Date(interest.addedAt).toLocaleDateString('es-PE')}</td>
      <td>
        <Badge variant="outline">{interest.riasecCode ?? '—'}</Badge>
      </td>
      <td>
        <Badge variant={match[1] as 'default' | 'neutral' | 'outline'}>{match[0]}</Badge>
      </td>
      {parts.map((done, index) => (
        <td key={partKeys[index]}>
          <CardPartStatus
            complete={done}
            partial={interest.partialCardParts?.includes(partKeys[index]) ?? false}
          />
        </td>
      ))}
      <td className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label={`Acciones para ${interest.name}`} size="icon" variant="ghost">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onView(interest)}>
              <Eye /> Ver ficha
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

function CardPartStatus({ complete, partial }: { complete: boolean; partial: boolean }) {
  if (partial)
    return (
      <span
        aria-label="En progreso"
        className="inline-flex size-6 items-center justify-center rounded-full bg-primary-soft text-primary"
      >
        <Minus className="size-4" />
      </span>
    )
  if (complete)
    return (
      <span
        aria-label="Completa"
        className="inline-flex size-6 items-center justify-center rounded-full bg-success-soft text-success-text"
      >
        <CircleCheck className="size-4" />
      </span>
    )
  return (
    <span
      aria-label="Sin completar"
      className="inline-flex size-6 items-center justify-center rounded-full bg-neutral-soft text-neutral-text"
    >
      <CircleX className="size-4" />
    </span>
  )
}

function institutionTypeLabel(type: Student['institutions'][number]['type']) {
  return type === 'UNIVERSIDAD'
    ? 'Universidad'
    : type === 'INSTITUTO'
      ? 'Instituto'
      : type === 'FUERZAS_ARMADAS'
        ? 'Fuerzas Armadas'
        : 'Policía'
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || 'Pendiente'}</p>
    </div>
  )
}

export function RecordsSection({ student }: { student: Student }) {
  const { state, dispatch } = useCounselorPortal()
  const priorityIds = new Set(getPriorityActivities(state).map((item) => item.id))
  const records = latestRecords(student).filter((record) => priorityIds.has(record.activityId))
  const [selected, setSelected] = useState<StudentRecord>()
  const [redoRecord, setRedoRecord] = useState<StudentRecord>()
  const [comment, setComment] = useState('')
  const act = (record: StudentRecord, status: 'ACEPTADO' | 'REHACER_SUGERIDO', note?: string) =>
    dispatch({ type: 'REVIEW_RECORD', studentId: student.id, recordId: record.id, status, comment: note })
  return (
    <>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm [&_td:last-child]:pr-8 [&_th:last-child]:pr-8">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Actividad</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Observación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((record) => {
              const activity = getActivity(state, record.activityId)
              return (
                <tr key={record.id}>
                  <td className="p-4 font-medium">
                    {activity?.code} · {activity?.name}
                  </td>
                  <td>
                    <Badge
                      variant={
                        record.reviewStatus === 'SIN_ATENDER'
                          ? 'warning'
                          : record.reviewStatus === 'REHACER_SUGERIDO'
                            ? 'default'
                            : 'success'
                      }
                    >
                      {record.reviewStatus.replaceAll('_', ' ')}
                    </Badge>
                  </td>
                  <td>{new Date(record.date).toLocaleDateString('es-PE')}</td>
                  <td>
                    <Badge variant={record.preliminaryReview === 'ADECUADO' ? 'outline' : 'warning'}>
                      {record.preliminaryReview === 'OBSERVADO' ? 'Observado' : 'Sin observaciones'}
                      {record.reviewReason ? ` · ${record.reviewReason}` : ''}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button onClick={() => setSelected(record)} size="sm" variant="outline">
                        Ver
                      </Button>
                      {record.reviewStatus === 'SIN_ATENDER' && (
                        <>
                          <Button onClick={() => setRedoRecord(record)} size="sm">
                            Sugerir rehacer
                          </Button>
                          <Button onClick={() => act(record, 'ACEPTADO')} size="sm" variant="ghost">
                            Está bien
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
      <Sheet onOpenChange={(open) => !open && setSelected(undefined)} open={Boolean(selected)}>
        <SheetContent className="overflow-y-auto" side="responsive">
          <SheetHeader>
            <SheetTitle>{getActivity(state, selected?.activityId ?? '')?.name}</SheetTitle>
            <SheetDescription>Premisa, entregable y versiones del registro.</SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold">Premisa</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {getActivity(state, selected.activityId)?.premise}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold">Entregable · versión {selected.version}</h3>
                <p className="mt-2 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">
                  {selected.text || selected.fileName || 'Sin contenido'}
                </p>
              </div>
              {student.records
                .filter((item) => item.activityId === selected.activityId)
                .map((version) => (
                  <Badge key={version.id} variant="outline">
                    Versión {version.version} · {new Date(version.date).toLocaleDateString('es-PE')}
                  </Badge>
                ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Dialog onOpenChange={(open) => !open && setRedoRecord(undefined)} open={Boolean(redoRecord)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sugerir rehacer</DialogTitle>
            <DialogDescription>
              El comentario es opcional. El prototipo registrará la solicitud como notificada.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-28 w-full rounded-xl border bg-background p-3 text-sm"
            onChange={(event) => setComment(event.target.value)}
            placeholder="Explica qué podría revisar..."
            value={comment}
          />
          <Button
            onClick={() => {
              if (redoRecord) act(redoRecord, 'REHACER_SUGERIDO', comment.trim() || undefined)
              setRedoRecord(undefined)
              setComment('')
            }}
          >
            Confirmar sugerencia
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

function JournalSection({ student }: { student: Student }) {
  const { state } = useCounselorPortal()
  const points = [...student.checkIns].sort((a, b) => a.date.localeCompare(b.date))
  const chartData = points.map((item) => ({
    label: new Date(item.date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
    safety: item.value,
  }))
  const weeklyAverage = student.diaryUsage.weekly.length
    ? student.diaryUsage.weekly.reduce((a, b) => a + b, 0) / student.diaryUsage.weekly.length
    : 0
  return (
    <div className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <div className="space-y-4">
        <Card className="flex gap-3 p-5">
          <LockKeyhole className="size-5 shrink-0 text-primary" />
          <div>
            <h2 className="font-bold">El contenido del diario es privado del estudiante.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La orientadora solo puede consultar indicadores agregados y check-ins. Esta vista nunca recibe
              el texto ni los tags de las entradas.
            </p>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Entradas totales" value={student.diaryUsage.total} />
          <Stat
            label="Espontáneas / prompt"
            value={`${student.diaryUsage.spontaneous} / ${student.diaryUsage.prompted}`}
          />
          <Stat
            label="Última entrada"
            value={
              student.diaryUsage.lastEntry
                ? formatRelative(student.diaryUsage.lastEntry, state.referenceDate)
                : 'Sin entradas'
            }
          />
          <Stat label="Frecuencia semanal" value={`${weeklyAverage.toFixed(1)} prom.`} />
        </div>
      </div>
      <Card className="p-5">
        <h2 className="font-bold">Check-in de seguridad · escala 1 a 5</h2>
        <p className="text-xs text-muted-foreground">
          Cada registro corresponde a una fecha y hora específica. Los valores iguales o menores a 2 aparecen
          sobre el área sombreada.
        </p>
        <div className="mt-4">
          <CounselorLineChart
            data={chartData}
            domain={[1, 5]}
            label="Seguridad vocacional en el tiempo"
            lowAreaMax={2}
            series={[{ key: 'safety', label: 'Seguridad', color: 'var(--primary)' }]}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {points.map((item) => (
            <Badge key={item.id} variant="neutral">
              {new Date(item.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
              {item.value}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  )
}

function FamilySection({ student }: { student: Student }) {
  const { state } = useCounselorPortal()
  const navigate = useNavigate()
  const familyRows = getFamilyActivityRows(state, student)
  const guardians = [...(student.guardian ? [student.guardian] : []), ...(student.additionalGuardians ?? [])]
  const [guardianIndex, setGuardianIndex] = useState(0)
  if (!guardians.length)
    return (
      <Card className="grid min-h-72 place-items-center p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold">No se ha registrado ningún apoderado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Las métricas y actividades familiares aparecerán cuando se registre uno.
          </p>
        </div>
      </Card>
    )
  const guardian = guardians[Math.min(guardianIndex, guardians.length - 1)]
  const completed = familyRows.filter((item) => item.status === 'COMPLETADA').length
  const completedConversations = student.familyConversations.filter(
    (item) => item.studentRecord && item.guardianLetter,
  ).length
  const totalFamilyActivities = familyRows.length + student.familyConversations.length
  const completedFamilyActivities = completed + completedConversations
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto border-b">
          {guardians.map((item, index) => (
            <button
              className={`whitespace-nowrap border-b-2 px-5 py-4 text-sm font-semibold ${guardianIndex === index ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
              key={`${item.email}-${index}`}
              onClick={() => setGuardianIndex(index)}
              type="button"
            >
              {item.name} ({item.relationship.toLocaleLowerCase('es-PE')})
            </button>
          ))}
        </div>
        <div className="grid items-center gap-5 p-5 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <StatInline label="Apoderado" value={guardian.name} />
            <div className="mt-3">
              <StatInline
                label="Último acceso"
                value={formatRelative(guardian.lastAccess, state.referenceDate)}
              />
            </div>
          </div>
          <CircleMetric
            completed={completedFamilyActivities}
            label="Actividades familiares"
            percent={
              totalFamilyActivities
                ? Math.round((completedFamilyActivities / totalFamilyActivities) * 100)
                : 100
            }
            total={totalFamilyActivities}
            unit="actividades completadas"
          />
          <CircleMetric
            completed={completedConversations}
            label="Conversaciones"
            percent={
              student.familyConversations.length
                ? Math.round((completedConversations / student.familyConversations.length) * 100)
                : 100
            }
            total={student.familyConversations.length}
            unit="conversaciones terminadas"
          />
        </div>
      </Card>
      <div className="space-y-5">
        <h2 className="text-lg font-bold">Actividades del apoderado</h2>
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 px-6 py-4">
            <h3 className="font-bold">Informativas</h3>
            <p className="text-xs text-muted-foreground">
              {completed} de {familyRows.length} actividades completadas
            </p>
          </div>
          <div className="divide-y">
            {familyRows.map((item) => {
              const activity = getActivity(state, item.activityId)
              const complete = item.status === 'COMPLETADA'
              return (
                <div className="flex items-center gap-4 px-6 py-4" key={item.activityId}>
                  <CompletionMark complete={complete} />
                  <div className="min-w-0 flex-1">
                    <strong className="text-sm">
                      {activity?.code} · {activity?.name}
                    </strong>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {complete && item.completedAt
                        ? `Completada ${new Date(item.completedAt).toLocaleDateString('es-PE')}`
                        : 'No completada'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 px-6 py-4">
            <h3 className="font-bold">Registros</h3>
            <p className="text-xs text-muted-foreground">
              {completedConversations} de {student.familyConversations.length} actividades completadas
            </p>
          </div>
          <div className="divide-y">
            {student.familyConversations.map((item) => {
              const activity = getActivity(state, item.activityId)
              const complete = Boolean(item.studentRecord && item.guardianLetter)
              return (
                <div className="flex items-center gap-4 px-6 py-4" key={item.activityId}>
                  <CompletionMark complete={complete} />
                  <div className="min-w-0 flex-1">
                    <strong className="text-sm">
                      {activity?.code} · {activity?.name}
                    </strong>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {complete && item.completedAt
                        ? `Completada ${new Date(item.completedAt).toLocaleDateString('es-PE')}`
                        : 'No completada'}
                    </p>
                  </div>
                  <FamilyAction
                    onView={() => navigate(appPaths.counselor.familyRecord(student.id, item.activityId))}
                  />
                </div>
              )
            })}
          </div>
        </Card>
      </div>
      <Card className="overflow-x-auto">
        <div className="border-b p-5">
          <h2 className="font-bold">Conversaciones</h2>
        </div>
        <table className="w-full min-w-[900px] text-left text-sm [&_td:last-child]:pr-8 [&_th:last-child]:pr-8">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="p-4">Título del tema</th>
              <th>Bloque</th>
              <th>Estudiante</th>
              <th>Apoderado</th>
              <th>Conversado</th>
              <th className="w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {student.familyConversations.map((item, index) => {
              const activity = getActivity(state, item.activityId)
              const studentDone = Boolean(item.studentRecord)
              const guardianDone = Boolean(item.guardianLetter)
              return (
                <tr key={item.activityId}>
                  <td className="p-4 font-medium">{activity?.name ?? `Conversación ${index + 1}`}</td>
                  <td>{activity?.block ?? 'Familia'}</td>
                  <td>
                    <CompletionMark complete={studentDone} />
                  </td>
                  <td>
                    <CompletionMark complete={guardianDone} />
                  </td>
                  <td>
                    <CompletionMark complete={studentDone && guardianDone} />
                  </td>
                  <td className="text-center">
                    <FamilyAction
                      onView={() => navigate(appPaths.counselor.familyRecord(student.id, item.activityId))}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

function CompletionMark({ complete }: { complete: boolean }) {
  return (
    <span
      aria-label={complete ? 'Completada' : 'No completada'}
      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-success-soft text-success-text' : 'bg-muted text-muted-foreground'}`}
      title={complete ? 'Completada' : 'No completada'}
    >
      {complete ? <CircleCheck className="size-4" /> : <Minus className="size-4" />}
    </span>
  )
}
function FamilyAction({ onView }: { onView: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label="Acciones" size="icon" variant="ghost">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onView}>
          <Eye /> Ver detalle
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function DataSection({ student }: { student: Student }) {
  const { state } = useCounselorPortal()
  const watch = state.watchlist.find((entry) => entry.studentId === student.id)
  const classroom = state.classrooms.find((item) => item.id === student.classroomId)
  const guardians = [...(student.guardian ? [student.guardian] : []), ...(student.additionalGuardians ?? [])]
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)]">
      <div className="space-y-5">
        <Card className="p-6">
          <h2 className="font-bold">Datos del estudiante</h2>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <DataItem label="Nombres y apellidos" value={student.name} />
            <DataItem label="Código" value={student.code} />
            <DataItem label="Promoción" value={classroom?.promotion} />
            <DataItem
              label="Grado y sección"
              value={classroom ? `${classroom.grade} · ${classroom.section}` : undefined}
            />
            <DataItem label="Correo" value={student.email} />
            <DataItem label="Teléfono" value={student.phone} />
            <DataItem
              label="Fecha de primer acceso"
              value={new Date(student.firstAccess).toLocaleString('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
            <DataItem
              label="Último acceso"
              value={new Date(student.lastAccess).toLocaleString('es-PE', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
          </dl>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Datos de apoderados</h2>
            <Badge variant={guardians.length ? 'secondary' : 'outline'}>
              {guardians.length === 0
                ? 'Ninguno'
                : `${guardians.length} ${guardians.length === 1 ? 'registrado' : 'registrados'}`}
            </Badge>
          </div>
          {guardians.length ? (
            <div className="mt-5 space-y-4">
              {guardians.map((guardian, index) => (
                <section className="rounded-xl border p-4" key={`${guardian.email}-${index}`}>
                  <h3 className="font-semibold">Apoderado {index + 1}</h3>
                  <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                    <DataItem label="Nombres y apellidos" value={guardian.name} />
                    <DataItem label="Parentesco" value={guardian.relationship} />
                    <DataItem label="Correo" value={guardian.email} />
                    <DataItem label="Teléfono" value={guardian.phone} />
                    <DataItem
                      label="Fecha de primer acceso"
                      value={new Date(guardian.firstAccess).toLocaleString('es-PE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    />
                    <DataItem
                      label="Último acceso"
                      value={new Date(guardian.lastAccess).toLocaleString('es-PE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    />
                  </dl>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-muted/50 p-5 text-sm text-muted-foreground">
              No se ha registrado ningún apoderado.
            </p>
          )}
        </Card>
      </div>
      <Card className="p-6 lg:sticky lg:top-4">
        <h2 className="font-bold">Observación</h2>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">En observación</span>
          <Badge
            className={watch ? 'bg-warning-soft text-warning-text' : undefined}
            variant={watch ? 'secondary' : 'outline'}
          >
            {watch ? 'Sí' : 'No'}
          </Badge>
        </div>
        {watch && (
          <div className="mt-5 border-t pt-5">
            <p className="text-sm font-semibold">Motivo</p>
            <p className="mt-2 rounded-xl bg-muted/50 p-4 text-sm leading-6">
              {watch.reason || 'Sin motivo registrado.'}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              En observación desde {new Date(watch.date).toLocaleDateString('es-PE')}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value ?? '—'}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </Card>
  )
}

export { StudentDetailView }
