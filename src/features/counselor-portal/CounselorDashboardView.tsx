import { Activity, AlertTriangle, ArrowRight, Eye, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { MetricCard } from '@/components/MetricCard'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import {
  formatRelative,
  getAlerts,
  getBlockProgress,
  getCohortTagRows,
  getPendingReviewRecords,
  getPriorityProgress,
  getTrafficLight,
} from './CounselorPortalSelectors'
import { useCounselorPortal } from './CounselorPortalContext'
import { AlertChips, Delta, TrafficBadge } from './components/CounselorShared'

function CounselorDashboardView() {
  const { state } = useCounselorPortal()
  const navigate = useNavigate()
  const [classroomId, setClassroomId] = useState('all')
  const students = state.students.filter((student) => classroomId === 'all' || student.classroomId === classroomId)
  const rows = students.map((student) => {
    const alerts = getAlerts(state, student)
    return { student, alerts, traffic: getTrafficLight(alerts), progress: getPriorityProgress(state, student) }
  })
  const priorityOrder = { priority: 0, attention: 1, 'on-track': 2 }
  const priority = rows
    .filter((row) => row.traffic !== 'on-track')
    .sort((a, b) => priorityOrder[a.traffic] - priorityOrder[b.traffic] || b.alerts.length - a.alerts.length)
    .slice(0, 8)
  const active = students.filter((student) => formatRelative(student.lastAccess, state.referenceDate) === 'Hoy' || new Date(state.referenceDate).getTime() - new Date(student.lastAccess).getTime() < 7 * 86_400_000).length
  const average = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.progress.percent, 0) / rows.length) : 0
  const watchlist = state.watchlist.filter((entry) => students.some((student) => student.id === entry.studentId))
  const blockRows = getBlockProgress(state, students)
  const freeActivities = state.activities.filter((activity) => activity.type === 'CASO')
  const freePercent = freeActivities.length && students.length
    ? Math.round(students.reduce((sum, student) => sum + student.completedCaseIds.length, 0) / (freeActivities.length * students.length) * 100)
    : 0
  const tagRows = getCohortTagRows(state, classroomId)
  const pendingReviews = getPendingReviewRecords(state).filter(({ student }) => classroomId === 'all' || student.classroomId === classroomId)
  const missingGuardians = students.filter((student) => !student.guardian).length
  const counts = rows.reduce((acc, row) => ({ ...acc, [row.traffic]: acc[row.traffic] + 1 }), { priority: 0, attention: 0, 'on-track': 0 })

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        actions={
          <select aria-label="Filtrar por salón" className="h-10 rounded-xl border bg-card px-3 text-sm outline-none" onChange={(event) => setClassroomId(event.target.value)} value={classroomId}>
            <option value="all">Todos los salones</option>
            {state.classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
          </select>
        }
        description="Identifica rápidamente a quién intervenir y por qué."
        eyebrow="Panel de la orientadora"
        title="Hola, Patricia"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label="Activos (7 días)" note={`${active} de ${students.length} estudiantes`} value={String(active)} />
        <MetricCard icon={Activity} label="Avance prioritario" note="Promedio de la cohorte" value={`${average}%`} />
        <MetricCard icon={AlertTriangle} label="Semáforo" note={`🔴 ${counts.priority} · 🟡 ${counts.attention} · 🟢 ${counts['on-track']}`} tone="warning" value={String(counts.priority + counts.attention)} />
        <MetricCard icon={Eye} label="En observación" note="Seguimiento elegido por ti" value={String(watchlist.length)} />
      </div>

      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <div><h2 className="font-bold">Alertas prioritarias</h2><p className="text-xs text-muted-foreground">Máximo ocho estudiantes que requieren atención.</p></div>
          <Button onClick={() => navigate(`${appPaths.counselor.students}?traffic=priority`)} variant="outline">Ver todas <ArrowRight /></Button>
        </div>
        <div className="divide-y">
          {priority.length ? priority.map(({ student, alerts, traffic }) => (
            <button className="flex w-full flex-wrap items-center gap-4 p-4 text-left hover:bg-muted/30 sm:px-5" key={student.id} onClick={() => navigate(appPaths.counselor.student(student.id))} type="button">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--primary-soft)] font-bold text-primary">{student.name.split(' ').map((part) => part[0]).join('')}</div>
              <div className="min-w-48 flex-1"><p className="text-sm font-semibold">{student.name}</p><p className="text-xs text-muted-foreground">{state.classrooms.find((item) => item.id === student.classroomId)?.name} · {formatRelative(student.lastAccess, state.referenceDate)}</p></div>
              <TrafficBadge status={traffic} /><AlertChips alerts={alerts} compact />
            </button>
          )) : <p className="p-6 text-sm text-muted-foreground">No hay alertas activas para este salón.</p>}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-bold">En observación</h2><p className="text-xs text-muted-foreground">Estudiantes que decidiste observar.</p>
          <div className="mt-4 space-y-3">
            {watchlist.slice(0, 5).map((entry) => {
              const student = state.students.find((item) => item.id === entry.studentId)
              if (!student) return null
              const alerts = getAlerts(state, student)
              return <button className="w-full rounded-xl border p-3 text-left hover:bg-muted/30" key={entry.studentId} onClick={() => navigate(appPaths.counselor.student(entry.studentId))} type="button"><div className="flex items-center justify-between gap-2"><strong className="text-sm">👁 {student.name}</strong><TrafficBadge status={getTrafficLight(alerts)} /></div><p className="mt-1 text-xs text-muted-foreground">{entry.reason || 'Sin motivo registrado'} · {formatRelative(student.lastAccess, state.referenceDate)}</p></button>
            })}
          </div>
          {watchlist.length > 5 && <Button className="mt-4 w-full" onClick={() => navigate(`${appPaths.counselor.students}?observation=yes`)} variant="outline">Ver todos</Button>}
        </Card>
        <Card className="p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-bold">Avance por bloque</h2><p className="text-xs text-muted-foreground">Solo actividades de registro prioritarias.</p>
          <div className="mt-5 space-y-4">
            {blockRows.map((row) => <div key={row.block}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">{row.block}</span><strong>{row.percent}%</strong></div><Progress className="h-3" value={row.percent} /></div>)}
            <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">Actividades libres</span><strong>{freePercent}%</strong></div><Progress className="h-3" value={freePercent}/></div>
          </div>
        </Card>
      </div>

      <Card className="overflow-x-auto shadow-[var(--shadow-card)]">
        <div className="border-b p-5"><h2 className="font-bold">Autopercepción de la cohorte</h2><p className="text-xs text-muted-foreground">Diagnóstico de entrada e impacto cuando existe una salida.</p></div>
        <table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b bg-muted/40 text-xs text-muted-foreground"><tr><th className="p-4">Tema</th><th>Entrada</th><th>Salida</th><th>Variación</th></tr></thead><tbody className="divide-y">
          {tagRows.map((row) => <tr className="cursor-pointer hover:bg-muted/30" key={row.tag.id} onClick={() => navigate(`${appPaths.counselor.publications}?tag=${row.tag.id}`)}><td className="p-4 font-medium">{row.tag.code} · {row.tag.name}</td><td>{row.entry?.toFixed(1) ?? '—'}</td><td>{row.exit?.toFixed(1) ?? 'Aún no disponible'}</td><td><Delta value={row.delta} /></td></tr>)}
        </tbody></table>
      </Card>

      <Card className="flex flex-wrap items-center gap-3 p-5 text-sm">
        <button className="font-semibold text-primary" onClick={() => navigate(appPaths.counselor.reviews)} type="button">Registros observados: {pendingReviews.length} pendientes →</button>
        <span className="text-muted-foreground">·</span>
        <button className="font-semibold text-primary" onClick={() => navigate(`${appPaths.counselor.students}?guardian=missing`)} type="button">Apoderados sin registro: {missingGuardians} →</button>
        <Badge className="ml-auto" variant="outline">Datos calculados al consultar</Badge>
      </Card>
    </div>
  )
}

export { CounselorDashboardView }
