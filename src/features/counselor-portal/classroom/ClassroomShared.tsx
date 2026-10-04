import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { CardIcon } from '@/components/ui/Status'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import type { interestTop } from './selectors'

const stateColors = ['bg-data-primary', 'bg-data-secondary', 'bg-neutral-soft']
export function SegmentBar({
  labels,
  values,
  colors = stateColors,
  legend = true,
}: {
  labels: string[]
  values: number[]
  colors?: string[]
  legend?: boolean
}) {
  const total = values.reduce((sum, value) => sum + value, 0)
  return (
    <div className="space-y-3">
      <div
        className="flex h-1.5 overflow-hidden rounded-full bg-neutral-soft"
        role="img"
        aria-label={labels.map((label, i) => `${label}: ${values[i]}`).join(', ')}
      >
        {total > 0 &&
          values.map((value, i) => (
            <span key={labels[i]} className={colors[i]} style={{ width: `${(value / total) * 100}%` }} />
          ))}
      </div>
      {legend && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {labels.map((label, i) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-full border border-border ${colors[i]}`} aria-hidden />
              {label}: <strong>{values[i]}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
export function StateLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {['Completado', 'En progreso', 'No iniciado'].map((label, i) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <span className={`size-2 rounded-full border border-border ${stateColors[i]}`} aria-hidden />
          {label}
        </span>
      ))}
    </div>
  )
}
export function StateCounts({
  completed,
  progress,
  pending,
}: {
  completed: number
  progress: number
  pending: number
}) {
  return (
    <span
      className="shrink-0 text-xs"
      aria-label={`${completed} completados, ${progress} en progreso, ${pending} no iniciados`}
    >
      <span className="font-semibold text-data-primary">{completed}</span> · <span>{progress}</span> ·{' '}
      <span className="text-muted-foreground">{pending}</span>
    </span>
  )
}
export function StateBar({
  completed,
  progress,
  pending,
}: {
  completed: number
  progress: number
  pending: number
}) {
  return (
    <SegmentBar
      labels={['Completado', 'En progreso', 'No iniciado']}
      values={[completed, progress, pending]}
      legend={false}
    />
  )
}
export function ClassroomMetric({
  icon,
  label,
  value,
  note,
  percent,
}: {
  icon: LucideIcon
  label: string
  value: string
  note?: string
  percent: number | null
}) {
  const bounded = Math.min(100, Math.max(0, percent ?? 0))
  return (
    <Card className="flex min-h-28 min-w-0 items-center gap-3 rounded-xl p-4">
      <CardIcon icon={icon} className="size-9 [&_svg]:size-4" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold leading-7">{value}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
      <svg viewBox="0 0 40 40" className="size-10 shrink-0 -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--neutral-soft)" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="var(--data-primary)"
          strokeWidth="4"
          strokeDasharray={`${bounded * 1.0053} 100.53`}
          strokeLinecap="round"
        />
      </svg>
    </Card>
  )
}
export function InterestTable({
  rows,
  total,
  institutions = false,
}: {
  rows: ReturnType<typeof interestTop>
  total: number
  institutions?: boolean
}) {
  if (!rows.length)
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay {institutions ? 'instituciones' : 'carreras'} en planes o favoritas.
      </p>
    )
  return (
    <Table className="table-fixed text-sm [&_th]:h-10 [&_th]:px-1 [&_th]:font-semibold [&_td]:px-1 [&_td]:py-3 [&_th:first-child]:pl-0 [&_td:first-child]:pl-0 [&_th:last-child]:pr-0 [&_td:last-child]:pr-0">
      <TableHeader>
        <TableRow>
          <TableHead className="w-5">
            <span className="sr-only">Posición</span>#
          </TableHead>
          <TableHead>{institutions ? 'Institución' : 'Carrera'}</TableHead>
          <TableHead className={institutions ? 'w-14 text-center' : 'w-20 text-center'}>En planes</TableHead>
          <TableHead className="w-14 text-center">Favorita</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={row.id}>
            <TableCell className="text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="break-words">
              <span title={row.name} aria-label={row.name}>
                {row.shortName ?? row.name}
              </span>
            </TableCell>
            <TableCell className="relative text-center">
              <span
                className="absolute inset-y-2 left-0 rounded bg-primary-soft"
                style={{ width: `${total ? (row.plans / total) * 100 : 0}%` }}
                aria-hidden
              />
              <span className="relative">
                {row.plans}
                {row.planA !== undefined && (
                  <span className="block mt-1 text-xs leading-4 text-muted-foreground">
                    ({row.planA} plan A)
                  </span>
                )}
              </span>
            </TableCell>
            <TableCell className="text-center">{row.favorites}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
