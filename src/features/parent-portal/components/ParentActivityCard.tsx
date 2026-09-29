import { CheckCircle2, Circle, Clock3, Play } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ParentActivity } from '../types/ParentPortalTypes'

type ParentActivityCardProps = {
  activity: ParentActivity
  completed: boolean
  onStart: (activity: ParentActivity) => void
}

function ParentActivityCard({ activity, completed, onStart }: ParentActivityCardProps) {
  return (
    <Card className="flex flex-col gap-4 p-5 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
      <div
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${completed ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--primary-soft)] text-primary'}`}
      >
        {completed ? <CheckCircle2 /> : <Circle />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold">{activity.title}</h3>
          {completed && <Badge variant="success">Completada</Badge>}
        </div>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{activity.description}</p>
        <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" /> {activity.duration} min
        </span>
      </div>
      <Button
        className="shrink-0"
        onClick={() => onStart(activity)}
        variant={completed ? 'outline' : 'default'}
      >
        <Play /> {completed ? 'Repasar' : 'Comenzar'}
      </Button>
    </Card>
  )
}

export { ParentActivityCard }
