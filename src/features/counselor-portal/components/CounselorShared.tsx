import { Eye, TrendingDown, TrendingUp, TriangleAlert, CircleCheck } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/Utils'
import { alertLabels } from '../CounselorPortalSelectors'
import type { AlertCode, TrafficLight } from '../types/CounselorPortalTypes'

const trafficLabels: Record<TrafficLight, string> = {
  priority: 'Prioritario',
  attention: 'Atención',
  'on-track': 'En ruta',
}

export function TrafficBadge({ status }: { status: TrafficLight }) {
  return (
    <Badge
      className={cn(
        status === 'priority' && 'bg-warning-soft text-warning-text',
        status === 'attention' && 'bg-warning-soft text-warning-text',
      )}
      variant={status === 'on-track' ? 'neutral' : 'aviso'}
    >
      {status === 'on-track' ? (
        <CircleCheck className="size-3.5" aria-hidden />
      ) : (
        <TriangleAlert className="size-3.5" aria-hidden />
      )}
      {trafficLabels[status]}
    </Badge>
  )
}

export function AlertChips({ alerts, compact = false }: { alerts: AlertCode[]; compact?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1">
      {alerts.map((alert) => (
        <Badge key={alert} title={alertLabels[alert]} variant="aviso">
          {compact ? alert : alertLabels[alert]}
        </Badge>
      ))}
    </div>
  )
}

export function WatchIcon({ active }: { active: boolean }) {
  return <Eye className={cn('size-4', active ? 'text-primary' : 'text-muted-foreground')} />
}

export function Delta({ value }: { value?: number }) {
  if (value === undefined) return <span className="text-muted-foreground">—</span>
  if (Math.abs(value) < 0.05) return <span className="text-muted-foreground">= 0.0</span>
  const UpIcon = value > 0 ? TrendingUp : TrendingDown
  return (
    <span className={cn('inline-flex items-center gap-1 font-semibold', 'text-muted-foreground')}>
      <UpIcon className="size-4" /> {Math.abs(value).toFixed(1)}
    </span>
  )
}

type ChartDatum = { label: string } & Record<string, string | number>
type ChartSeries = { key: string; label: string; color: string }

export function CounselorLineChart({
  data,
  label,
  series,
  domain,
  lowAreaMax,
  markers = [],
}: {
  data: ChartDatum[]
  label: string
  series: ChartSeries[]
  domain: [number, number]
  lowAreaMax?: number
  markers?: { value: string; label: string }[]
}) {
  if (!data.length) return <p className="text-sm text-muted-foreground">Todavía no hay datos.</p>
  return (
    <div aria-label={label} className="h-64 w-full" role="img">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart accessibilityLayer data={data} margin={{ left: 0, right: 16, top: 18, bottom: 0 }}>
          <CartesianGrid stroke="var(--data-grid)" strokeDasharray="3 3" vertical={false} />
          {lowAreaMax !== undefined && (
            <ReferenceArea fill="var(--muted)" fillOpacity={0.8} y1={domain[0]} y2={lowAreaMax} />
          )}
          {markers.map((marker) => (
            <ReferenceLine
              key={`${marker.value}-${marker.label}`}
              label={{ value: marker.label, fill: 'var(--muted-foreground)', fontSize: 11 }}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              x={marker.value}
            />
          ))}
          <XAxis axisLine={false} dataKey="label" fontSize={11} tickLine={false} />
          <YAxis axisLine={false} domain={domain} fontSize={11} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{ borderRadius: 12, borderColor: 'var(--border)', background: 'var(--card)' }}
          />
          {series.length > 1 && (
            <Legend formatter={(value) => <span className="text-foreground">{value}</span>} />
          )}
          {series.map((item) => (
            <Line
              activeDot={{ r: 5 }}
              dataKey={item.key}
              dot={{ r: 3 }}
              key={item.key}
              name={item.label}
              stroke={item.color}
              strokeWidth={2.5}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
