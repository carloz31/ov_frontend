import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/Utils'

type MetricTone = 'primary' | 'danger' | 'success' | 'warning'

type MetricCardProps = {
  icon: LucideIcon
  label: string
  note?: string
  tone?: MetricTone
  value: string
}

const toneClasses: Record<MetricTone, { accent: string; icon: string }> = {
  primary: { accent: 'bg-primary', icon: 'bg-[var(--primary-soft)] text-primary' },
  danger: { accent: 'bg-destructive', icon: 'bg-destructive/10 text-destructive' },
  success: { accent: 'bg-[var(--success)]', icon: 'bg-[var(--success-soft)] text-[var(--success)]' },
  warning: { accent: 'bg-[var(--warning)]', icon: 'bg-[var(--warning-soft)] text-[#9c611b]' },
}

function MetricCard({ icon: Icon, label, note, tone = 'primary', value }: MetricCardProps) {
  const colors = toneClasses[tone]

  return (
    <Card className="relative overflow-hidden p-5">
      <span className={cn('absolute inset-y-0 left-0 w-1', colors.accent)} />
      <div className="flex items-center gap-4">
        <div className={cn('flex size-11 items-center justify-center rounded-xl', colors.icon)}>
          <Icon />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs font-medium">{label}</p>
          {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
        </div>
      </div>
    </Card>
  )
}

export { MetricCard }
