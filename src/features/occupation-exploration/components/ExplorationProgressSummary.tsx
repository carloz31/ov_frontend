import { Target, type LucideIcon } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/Utils'

type ExplorationProgressSummaryProps = {
  className?: string
  completed: number
  icon?: LucideIcon
  itemLabel: string
  remainingLabel: string
  total: number
}

function ExplorationProgressSummary({
  className,
  completed,
  icon: Icon = Target,
  itemLabel,
  remainingLabel,
  total,
}: ExplorationProgressSummaryProps) {
  const progress = total > 0 ? (completed / total) * 100 : 0
  const remaining = Math.max(total - completed, 0)

  return (
    <div className={cn('rounded-2xl border bg-white/90 p-5 shadow-sm backdrop-blur', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Tu progreso</p>
          <p className="mt-1 text-2xl font-black tracking-tight">
            {completed} de {total} {itemLabel}
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
          <Icon className="size-5" />
        </span>
      </div>
      <Progress
        aria-label={`${completed} de ${total} ${itemLabel}`}
        className="mt-5 h-2.5 [&_[data-slot=progress-indicator]]:bg-[var(--success)]"
        value={progress}
      />
      <div className="mt-3 flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-[var(--success)]">{Math.round(progress)}% completado</span>
        <span className="text-muted-foreground">
          {remaining} {remainingLabel}
        </span>
      </div>
    </div>
  )
}

export { ExplorationProgressSummary }
