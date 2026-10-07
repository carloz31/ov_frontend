import type { ReactNode } from 'react'
import { TriangleAlert, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/Utils'

export function StaffEntityHeader({
  title,
  initials,
  details,
  metrics,
  children,
  heading = 'h1',
  className,
}: {
  title: string
  initials: string
  details?: ReactNode
  metrics?: ReactNode
  children?: ReactNode
  heading?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  const Heading = heading
  return (
    <Card className={cn('staff-entity-header', className)}>
      <header className="staff-entity-row">
        <div className="staff-entity-identity">
          <span className="staff-entity-avatar" aria-hidden="true">
            {initials}
          </span>
          <div className="staff-entity-copy">
            <Heading>{title}</Heading>
            {details && <div className="staff-entity-details">{details}</div>}
          </div>
        </div>
        {metrics && <div className="staff-entity-metrics">{metrics}</div>}
      </header>
      {children && <div className="staff-entity-body">{children}</div>}
    </Card>
  )
}

export function StaffMetric({
  label,
  value,
  percent,
  detail,
  primary = false,
  children,
  icon: Icon,
}: {
  label: string
  value: ReactNode
  percent?: number
  detail?: ReactNode
  primary?: boolean
  children?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <section className="staff-metric" data-primary={primary}>
      <div className="staff-metric-heading">
        <h2>
          {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
          {label}
        </h2>
        <strong>{value}</strong>
      </div>
      {percent !== undefined && <Progress intent="data" value={percent} aria-label={label} />}
      {detail && <p className="staff-metric-detail">{detail}</p>}
      {children}
    </section>
  )
}

export function StaffAlertCard({
  title,
  children,
  className,
  actions,
}: {
  title: string
  children?: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <Card className={cn('staff-alert-card', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="staff-alert-heading">
          <span className="staff-alert-icon">
            <TriangleAlert aria-hidden="true" />
          </span>
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </Card>
  )
}
