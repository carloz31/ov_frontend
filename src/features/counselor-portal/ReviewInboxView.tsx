import { ExternalLink, EyeOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { appPaths } from '@/routes/paths'
import { getActivity, getPendingReviewRecords } from './CounselorPortalSelectors'
import { useCounselorPortal } from './CounselorPortalContext'

function ReviewInboxView() {
  const { state, dispatch } = useCounselorPortal()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const classroom = params.get('classroom') ?? 'all'
  const activity = params.get('activity') ?? 'all'
  const rows = useMemo(
    () =>
      getPendingReviewRecords(state).filter(
        (row) =>
          (classroom === 'all' || row.student.classroomId === classroom) &&
          (activity === 'all' || row.record.activityId === activity),
      ),
    [state, classroom, activity],
  )
  const selected = rows.find((row) => row.record.id === params.get('record')) ?? rows[0]
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    next.delete('record')
    setParams(next)
  }
  const accept = () =>
    selected &&
    dispatch({
      type: 'REVIEW_RECORD',
      studentId: selected.student.id,
      recordId: selected.record.id,
      status: 'ACEPTADO',
    })
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        description="Registros prioritarios observados y todavía sin atender."
        eyebrow="Intervención"
        title="Registros observados"
      />
      <div className="flex flex-wrap gap-3">
        <Filter
          label="Actividad"
          value={activity}
          onChange={(value) => setFilter('activity', value)}
          options={[
            ['all', 'Todas las actividades'],
            ...state.activities
              .filter((item) => item.type === 'REGISTRO' && item.participant === 'ESTUDIANTE')
              .map((item) => [item.id, `${item.code} · ${item.name}`] as [string, string]),
          ]}
        />
        <Filter
          label="Salón"
          value={classroom}
          onChange={(value) => setFilter('classroom', value)}
          options={[
            ['all', 'Todos los salones'],
            ...state.classrooms.map((item) => [item.id, item.name] as [string, string]),
          ]}
        />
        <Badge className="ml-auto" variant="warning">
          {rows.length} pendientes
        </Badge>
      </div>
      <div className="grid min-h-[600px] gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="overflow-hidden">
          <div className="divide-y">
            {rows.length ? (
              rows.map((row) => (
                <button
                  className={`w-full p-4 text-left hover:bg-muted/50 ${selected?.record.id === row.record.id ? 'bg-[var(--primary-soft)]' : ''}`}
                  key={row.record.id}
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.set('record', row.record.id)
                    setParams(next)
                  }}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-sm">{row.student.name}</strong>
                    <Badge variant="warning">Observado</Badge>
                  </div>
                  <p className="mt-1 text-xs font-medium">
                    {getActivity(state, row.record.activityId)?.code} ·{' '}
                    {getActivity(state, row.record.activityId)?.name}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {state.classrooms.find((item) => item.id === row.student.classroomId)?.name} ·{' '}
                    {new Date(row.record.date).toLocaleDateString('es-PE')}
                  </p>
                </button>
              ))
            ) : (
              <p className="p-6 text-sm text-muted-foreground">
                No hay registros observados con estos filtros.
              </p>
            )}
          </div>
        </Card>
        <Card className="p-6">
          {selected ? (
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-5">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {getActivity(state, selected.record.activityId)?.code}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {getActivity(state, selected.record.activityId)?.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.student.name} · versión {selected.record.version}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      navigate(appPaths.counselor.studentRecord(selected.student.id, selected.record.id))
                    }
                    variant="outline"
                  >
                    Abrir registro <ExternalLink />
                  </Button>
                  <Button
                    onClick={() => navigate(appPaths.counselor.student(selected.student.id))}
                    variant="ghost"
                  >
                    Abrir perfil
                  </Button>
                </div>
              </div>
              <div className="py-5">
                <h3 className="text-sm font-bold">Premisa</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {getActivity(state, selected.record.activityId)?.premise}
                </p>
                <h3 className="mt-5 text-sm font-bold">Ítems del registro</h3>
                <div className="mt-3 space-y-3">
                  {selected.record.items.map((item, index) => (
                    <div className="rounded-xl bg-muted p-4" key={item.id}>
                      <p className="text-xs font-semibold text-muted-foreground">
                        Ítem {index + 1} · {item.prompt}
                      </p>
                      <p className="mt-2 text-sm leading-6">{item.response || 'Sin respuesta'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-4">
                  <strong className="text-sm">Observado</strong>
                  <p className="mt-1 text-sm text-[#765421]">{selected.record.reviewReason}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 border-t pt-5">
                <Button onClick={() => setConfirmRemove(true)} variant="outline">
                  <EyeOff /> Quitar observación
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center text-sm text-muted-foreground">
              Selecciona un registro.
            </div>
          )}
        </Card>
      </div>
      <Dialog onOpenChange={setConfirmRemove} open={confirmRemove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitar observación</DialogTitle>
            <DialogDescription>
              ¿Estás segura de que deseas quitar la observación de este registro?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setConfirmRemove(false)} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                accept()
                setConfirmRemove(false)
              }}
            >
              Quitar observación
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Filter({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: [string, string][]
  value: string
}) {
  return (
    <select
      aria-label={label}
      className="h-9 rounded-md border bg-card px-3 text-sm"
      onChange={(event) => onChange(event.target.value)}
      value={value}
    >
      {options.map(([id, text]) => (
        <option key={id} value={id}>
          {text}
        </option>
      ))}
    </select>
  )
}
export { ReviewInboxView }
