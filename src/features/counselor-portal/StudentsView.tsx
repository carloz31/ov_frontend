import { Eye, EyeOff, Minus, MoreHorizontal, Search, TrendingDown, TrendingUp, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { appPaths } from '@/routes/paths'
import {
  formatRelative,
  getAlerts,
  getCurrentActivity,
  getPriorityProgress,
  getTrafficLight,
} from './CounselorPortalSelectors'
import { useCounselorPortal } from './CounselorPortalContext'
import { TrafficBadge } from './components/CounselorShared'
import type { Student, TrafficLight } from './types/CounselorPortalTypes'

const blockNames: Record<string, string> = {
  B0: 'Punto de partida',
  B1: 'Me conozco',
  B2: 'Exploro mi entorno',
  B3: 'Exploro posibilidades',
  B4: 'Contrasto opciones',
  B5: 'Mi siguiente decisión',
}
const safetyColors: Record<number, string> = {
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-amber-600',
  4: 'text-lime-600',
  5: 'text-green-600',
}

function StudentsView() {
  const { state, dispatch } = useCounselorPortal()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [observing, setObserving] = useState<Student>()
  const [reason, setReason] = useState('')
  const filter = (name: string) => params.get(name) ?? 'all'
  const updateFilter = (name: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(name)
    else next.set(name, value)
    setParams(next)
  }
  const rows = state.students
    .map((student) => {
      const alerts = getAlerts(state, student)
      return {
        student,
        traffic: getTrafficLight(alerts),
        progress: getPriorityProgress(state, student),
        current: getCurrentActivity(state, student),
        observed: state.watchlist.some((entry) => entry.studentId === student.id),
      }
    })
    .filter((row) => {
      const normalized = `${row.student.name} ${row.student.code}`.toLowerCase()
      return (
        normalized.includes(query.toLowerCase()) &&
        (filter('classroom') === 'all' || row.student.classroomId === filter('classroom')) &&
        (filter('traffic') === 'all' || row.traffic === filter('traffic')) &&
        (filter('observation') === 'all' || (filter('observation') === 'yes') === row.observed) &&
        (filter('block') === 'all' || row.current?.block === filter('block')) &&
        (filter('guardian') === 'all' ||
          (filter('guardian') === 'registered') === Boolean(row.student.guardian))
      )
    })
    .sort((a, b) => trafficRank(a.traffic) - trafficRank(b.traffic))

  const openObservation = (student: Student) => {
    setReason('')
    setObserving(student)
  }
  const saveObservation = () => {
    if (!observing) return
    dispatch({ type: 'TOGGLE_WATCHLIST', studentId: observing.id, reason: reason.trim() || undefined })
    setObserving(undefined)
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        description="Filtra la cohorte y abre un perfil cuando necesites profundizar."
        eyebrow="Seguimiento"
        title="Estudiantes"
      />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar estudiante o código..."
            value={query}
          />
        </div>
        <Filter
          label="Salón"
          value={filter('classroom')}
          onChange={(value) => updateFilter('classroom', value)}
          options={[
            ['all', 'Todos los salones'],
            ...state.classrooms.map((item) => [item.id, item.name] as [string, string]),
          ]}
        />
        <Filter
          label="Estado"
          value={filter('traffic')}
          onChange={(value) => updateFilter('traffic', value)}
          options={[
            ['all', 'Todos los estados'],
            ['priority', 'Prioritario'],
            ['attention', 'Atención'],
            ['on-track', 'En ruta'],
          ]}
        />
        <Filter
          label="Observación"
          value={filter('observation')}
          onChange={(value) => updateFilter('observation', value)}
          options={[
            ['all', 'Todos'],
            ['yes', 'En observación'],
            ['no', 'Sin observación'],
          ]}
        />
        <Filter
          label="Familia"
          value={filter('guardian')}
          onChange={(value) => updateFilter('guardian', value)}
          options={[
            ['all', 'Toda familia'],
            ['registered', 'Registrada'],
            ['missing', 'Sin registro'],
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Filter
          label="Bloque"
          value={filter('block')}
          onChange={(value) => updateFilter('block', value)}
          options={[
            ['all', 'Todos los bloques'],
            ...['B0', 'B1', 'B2', 'B3', 'B4', 'B5'].map((item) => [item, item] as [string, string]),
          ]}
        />
        {(params.size > 0 || query) && (
          <Button
            onClick={() => {
              setParams({})
              setQuery('')
            }}
            variant="ghost"
          >
            Limpiar filtros
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} resultados</span>
      </div>
      <Card className="overflow-hidden shadow-[var(--shadow-card)]">
        <Table className="min-w-[980px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Bloque actual</TableHead>
              <TableHead>Avance</TableHead>
              <TableHead>Seguridad</TableHead>
              <TableHead>Apoderados</TableHead>
              <TableHead>En observación</TableHead>
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ student, traffic, progress, current, observed }) => {
              const checks = [...student.checkIns].sort((a, b) => a.date.localeCompare(b.date))
              const latest = checks.at(-1)
              const previous = checks.at(-2)
              const guardianCount = (student.guardian ? 1 : 0) + (student.additionalGuardians?.length ?? 0)
              const TrendIcon =
                !latest || !previous
                  ? Minus
                  : latest.value > previous.value
                    ? TrendingUp
                    : latest.value < previous.value
                      ? TrendingDown
                      : Minus
              const trendLabel =
                !latest || !previous
                  ? 'Sin tendencia'
                  : latest.value > previous.value
                    ? 'Subiendo'
                    : latest.value < previous.value
                      ? 'Bajando'
                      : 'Estable'
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    <strong>{student.name}</strong>
                    <p className="text-xs text-muted-foreground">
                      {state.classrooms.find((item) => item.id === student.classroomId)?.name} ·{' '}
                      {formatRelative(student.lastAccess, state.referenceDate)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <TrafficBadge status={traffic} />
                  </TableCell>
                  <TableCell>
                    <strong>{current?.block ?? '—'}</strong>
                    <p className="text-xs text-muted-foreground">
                      {current ? blockNames[current.block] : 'Ruta completada'}
                    </p>
                  </TableCell>
                  <TableCell className="text-lg font-bold text-primary">{progress.percent}%</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 text-lg font-bold ${latest ? safetyColors[latest.value] : 'text-muted-foreground'}`}
                    >
                      {latest?.value ?? '—'}{' '}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        (<TrendIcon className="size-3.5" aria-hidden />{' '}
                        <span className="sr-only">{trendLabel}</span>)
                      </span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={guardianCount ? 'secondary' : 'outline'}>
                      {guardianCount === 0
                        ? 'Ninguno'
                        : `${guardianCount} ${guardianCount === 1 ? 'registrado' : 'registrados'}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {observed ? <Badge className="bg-red-50 text-red-700">Sí</Badge> : null}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-label={`Acciones para ${student.name}`} size="icon" variant="ghost">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => navigate(appPaths.counselor.student(student.id))}>
                          <UserRound /> Ver perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            observed
                              ? dispatch({ type: 'TOGGLE_WATCHLIST', studentId: student.id })
                              : openObservation(student)
                          }
                        >
                          {observed ? (
                            <>
                              <EyeOff /> Quitar de observación
                            </>
                          ) : (
                            <>
                              <Eye /> Agregar a observación
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
      <Dialog onOpenChange={(open) => !open && setObserving(undefined)} open={Boolean(observing)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar a observación</DialogTitle>
            <DialogDescription>
              Registra, si lo deseas, por qué quieres dar seguimiento a {observing?.name}.
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-medium" htmlFor="observation-reason">
            Motivo de observación
          </label>
          <textarea
            className="min-h-28 w-full rounded-xl border bg-background p-3 text-sm"
            id="observation-reason"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ej. conversar sobre seguridad vocacional..."
            value={reason}
          />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setObserving(undefined)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={saveObservation}>Registrar observación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function trafficRank(value: TrafficLight) {
  return value === 'priority' ? 0 : value === 'attention' ? 1 : 2
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
      className="h-9 min-w-36 rounded-md border bg-card px-3 text-sm"
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

export { StudentsView }
