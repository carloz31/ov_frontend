import { StatusBadge, AlertBadge } from '@/components/ui/Status'
import { ArrowDown, ArrowRight, ArrowUp, LockKeyhole, Mail } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { StaffMetric } from '@/components/staff/StaffPatterns'
import { prioritiesPath } from './navigation'
import { displayDate, questionnaireState } from './selectors'
import type { ActivityState, QuestionnaireApplication } from '@/types/studentProfile'

export function ActivityStatus({ state, label }: { state: ActivityState | 'unavailable'; label?: string }) {
  return <StatusBadge status={state}>{label}</StatusBadge>
}

export function TrendValue({ value }: { value: string }) {
  const up = value === 'En aumento'
  const down = value === 'En descenso'
  const Icon = up ? ArrowUp : down ? ArrowDown : ArrowRight
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium ${up ? 'bg-success-soft text-success-text' : 'bg-neutral-soft text-neutral-text'}`}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {value}
    </span>
  )
}

export function QuestionnaireStatus({ application }: { application: QuestionnaireApplication }) {
  if (application.result?.kind === 'comparison') {
    return (
      <span className="flex flex-wrap items-center gap-2">
        <ActivityStatus state="completed" label="Entrada completada" />
        <ActivityStatus
          state={application.result.exit ? 'completed' : 'not-started'}
          label={
            application.result.exit
              ? `Salida completada · ${displayDate(application.result.exitDate)}`
              : 'Salida pendiente'
          }
        />
      </span>
    )
  }
  return <ActivityStatus state={application.state} label={questionnaireState(application)} />
}

export function EmailContact({ email }: { email?: string }) {
  return email ? (
    <a
      href={`mailto:${email}`}
      className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Mail className="size-4 shrink-0" aria-hidden />
      <span className="min-w-0 [overflow-wrap:anywhere]">{email}</span>
    </a>
  ) : (
    <p className="text-sm text-muted-foreground">Sin correo registrado</p>
  )
}

export function CompactProgress({
  title,
  completed,
  total,
  unavailable = false,
  unit = 'actividades',
}: {
  title: string
  completed: number
  total: number
  unavailable?: boolean
  unit?: string
}) {
  const percent = total ? Math.round((completed / total) * 100) : 0
  return (
    <section className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {unavailable ? (
          <ActivityStatus state="unavailable" />
        ) : (
          <ActivityStatus
            state={total && completed === total ? 'completed' : completed ? 'in-progress' : 'not-started'}
            label={`${percent} %`}
          />
        )}
      </div>
      <Progress aria-label={title} value={percent} />
      <p className="text-sm text-muted-foreground">
        {completed} de {total} {unit}
      </p>
    </section>
  )
}

export function Panel({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <Card id={id} className="min-w-0 scroll-mt-6 rounded-xl p-4 sm:p-5">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </Card>
  )
}
export function ProgressIndicator({
  title,
  completed,
  total,
  percent,
  priority = false,
  returnTo,
}: {
  title: string
  completed: number
  total: number
  percent: number
  priority?: boolean
  returnTo?: string
}) {
  return (
    <StaffMetric
      label={title}
      primary={priority}
      value={total ? `${percent} %` : '—'}
      percent={total ? percent : undefined}
      detail={
        total
          ? `${completed} de ${total} actividades`
          : priority
            ? 'Aún no defines prioritarios'
            : 'Aún no hay actividades'
      }
    >
      {!total && priority && <PriorityLink returnTo={returnTo} />}
    </StaffMetric>
  )
}
export function PriorityLink({ returnTo }: { returnTo?: string }) {
  return (
    <Button
      asChild
      variant="link"
      className="min-h-11 h-auto max-w-full justify-start px-0 text-left whitespace-normal"
    >
      <Link to={`${prioritiesPath}${returnTo ? `?${new URLSearchParams({ returnTo })}` : ''}`}>
        Ver configuración de prioritarios
      </Link>
    </Button>
  )
}
export function ColoredProgress({
  value,
  tone = 'primary',
  label,
}: {
  value: number
  tone?: 'primary' | 'secondary' | 'baseline'
  label: string
}) {
  return <Progress intent="data" dataTone={tone} aria-label={label} value={value} />
}
export function Observations({
  underdeveloped,
  attention,
  counts = false,
}: {
  underdeveloped: number
  attention: number
  counts?: boolean
}) {
  return (
    <span className="flex flex-wrap gap-2">
      {underdeveloped > 0 && (
        <AlertBadge>
          {counts
            ? `${underdeveloped} ${underdeveloped === 1 ? 'poco desarrollada' : 'poco desarrolladas'}`
            : 'Poco desarrollada'}
        </AlertBadge>
      )}
      {attention > 0 && (
        <AlertBadge critical>
          {counts
            ? `${attention} ${attention === 1 ? 'requiere atención' : 'requieren atención'}`
            : 'Requiere atención'}
        </AlertBadge>
      )}
    </span>
  )
}
export function ChangeLabel({ value }: { value: string }) {
  const Icon = value === 'Subió' ? ArrowUp : value === 'Bajó' ? ArrowDown : ArrowRight
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Icon className="size-4 shrink-0" aria-hidden />
      {value}
    </span>
  )
}
export function EmptyMessage({
  children,
  unavailable = false,
}: {
  children: ReactNode
  unavailable?: boolean
}) {
  return (
    <p className="flex items-start gap-2 rounded-lg bg-muted/50 p-4 text-muted-foreground">
      {unavailable && <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden />}
      {children}
    </p>
  )
}
