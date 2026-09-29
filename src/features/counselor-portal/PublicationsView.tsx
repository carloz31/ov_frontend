import { CalendarDays, Eye, FilePlus2, MoreHorizontal, Pencil, Play, Star } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
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
import { InterviewDetail, ResourceDetail } from '@/features/occupation-exploration/AdventureResourcesView'
import type { AdventureNotice } from '@/features/occupation-exploration/types/AdventureTypes'
import { useCounselorPortal } from './CounselorPortalContext'
import type { Audience, Interview, Resource, ResourceType } from './types/CounselorPortalTypes'

type Tab = 'publications' | 'interviews'
const tabs: [Tab, string][] = [
  ['publications', 'Publicaciones'],
  ['interviews', 'Entrevistas'],
]
const audienceLabels: Record<Audience, string> = {
  ESTUDIANTES: 'Estudiantes',
  PADRES: 'Padres y apoderados',
  AMBOS: 'Ambos',
}

function PublicationsView() {
  const { state } = useCounselorPortal()
  const [params, setParams] = useSearchParams()
  const tab = (tabs.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'publications') as Tab
  const tagId = params.get('tag') ?? 'all'
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Resource>()
  const [selectedResource, setSelectedResource] = useState<Resource>()
  const [selectedInterview, setSelectedInterview] = useState<Interview>()
  const resources = state.resources
    .filter((item) => tagId === 'all' || item.tagIds.includes(tagId))
    .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))

  if (selectedResource)
    return <PublicationPreview resource={selectedResource} onBack={() => setSelectedResource(undefined)} />
  if (selectedInterview)
    return (
      <InterviewDetail
        backLabel="Entrevistas"
        onBack={() => setSelectedInterview(undefined)}
        onReact={() => undefined}
        onReport={() => undefined}
        readOnly
        video={{
          id: selectedInterview.id,
          title: selectedInterview.subject,
          alias: selectedInterview.authors.join(', '),
          url: selectedInterview.url,
          reflection: selectedInterview.reflection,
          createdAt: selectedInterview.date,
        }}
      />
    )

  const openNew = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (resource: Resource) => {
    setEditing(resource)
    setFormOpen(true)
  }
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        actions={
          tab === 'publications' ? (
            <Button onClick={openNew}>
              <FilePlus2 /> Nueva publicación
            </Button>
          ) : undefined
        }
        description="Publica enlaces, eventos y avisos para la comunidad; revisa y destaca entrevistas de estudiantes."
        eyebrow="Contenido"
        title="Publicaciones"
      />
      <div className="flex flex-wrap items-center gap-2 border-b">
        {tabs.map(([id, label]) => (
          <button
            className={`border-b-2 px-4 py-3 text-sm font-semibold ${tab === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            key={id}
            onClick={() => setParams({ tab: id })}
            type="button"
          >
            {label}
          </button>
        ))}
        {tab === 'publications' && (
          <select
            aria-label="Filtrar por tag"
            className="mb-2 ml-auto h-9 rounded-md border bg-card px-3 text-sm"
            onChange={(event) => {
              const next = new URLSearchParams(params)
              if (event.target.value === 'all') next.delete('tag')
              else next.set('tag', event.target.value)
              setParams(next)
            }}
            value={tagId}
          >
            <option value="all">Todos los tags</option>
            {state.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.code} · {tag.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {tab === 'publications' ? (
        <PublicationTable onEdit={openEdit} onView={setSelectedResource} resources={resources} />
      ) : (
        <InterviewTable onView={setSelectedInterview} />
      )}
      <PublicationForm
        initial={editing}
        key={`${editing?.id ?? 'new'}-${formOpen}`}
        onClose={() => setFormOpen(false)}
        open={formOpen}
      />
    </div>
  )
}

function PublicationTable({
  resources,
  onEdit,
  onView,
}: {
  resources: Resource[]
  onEdit: (resource: Resource) => void
  onView: (resource: Resource) => void
}) {
  const { state } = useCounselorPortal()
  return (
    <Card className="overflow-hidden">
      <Table className="min-w-[980px]">
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Audiencia</TableHead>
            <TableHead>Fecha de publicación</TableHead>
            <TableHead>Vistos</TableHead>
            <TableHead>Favoritos</TableHead>
            <TableHead className="w-24 text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((item) => {
            const tagNames = item.tagIds
              .map((id) => state.tags.find((tag) => tag.id === id)?.name)
              .filter(Boolean)
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <strong>{item.title}</strong>
                  <p className="max-w-sm truncate text-xs text-muted-foreground">{item.description}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    className={item.type === 'EVENTO' ? 'bg-[#e7eff8] text-[#426b86]' : undefined}
                    variant={item.type === 'EVENTO' ? 'secondary' : 'default'}
                  >
                    {item.type === 'EVENTO' ? 'Evento' : 'Publicación'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tagNames.slice(0, 2).map((name) => (
                      <Badge key={name} variant="outline">
                        {name}
                      </Badge>
                    ))}
                    {tagNames.length > 2 && <Badge variant="secondary">+{tagNames.length - 2} más</Badge>}
                  </div>
                </TableCell>
                <TableCell>{audienceLabels[item.audience]}</TableCell>
                <TableCell>{new Date(item.publicationDate).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>{item.viewCount}</TableCell>
                <TableCell>{item.favoriteCount}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-label={`Acciones para ${item.title}`} size="icon" variant="ghost">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(item)}>
                        <Eye /> Ver publicación
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(item)}>
                        <Pencil /> Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
          {!resources.length && (
            <TableRow>
              <TableCell className="p-8 text-center text-muted-foreground" colSpan={8}>
                No hay publicaciones con este filtro.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

function InterviewTable({ onView }: { onView: (interview: Interview) => void }) {
  const { state, dispatch } = useCounselorPortal()
  const [classroom, setClassroom] = useState('all')
  const interviews = state.interviews.filter((item) => classroom === 'all' || item.classroomId === classroom)
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          aria-label="Filtrar entrevistas por grado y sección"
          className="h-9 rounded-md border bg-card px-3 text-sm"
          onChange={(event) => setClassroom(event.target.value)}
          value={classroom}
        >
          <option value="all">Todos los grados y secciones</option>
          {state.classrooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>
      <Card className="overflow-hidden">
        <Table className="min-w-[820px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Autores</TableHead>
              <TableHead>Grado y sección</TableHead>
              <TableHead>Profesión u ocupación</TableHead>
              <TableHead>Fecha de publicación</TableHead>
              <TableHead>Comentarios</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.authors.slice(0, 3).join(', ')}</TableCell>
                <TableCell>{state.classrooms.find((room) => room.id === item.classroomId)?.name}</TableCell>
                <TableCell>{item.subject}</TableCell>
                <TableCell>{new Date(item.date).toLocaleDateString('es-PE')}</TableCell>
                <TableCell>{item.commentCount}</TableCell>
                <TableCell>
                  {item.featured ? (
                    <Badge>Destacada</Badge>
                  ) : (
                    <span className="text-muted-foreground">Sin destacar</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={`Acciones para entrevista de ${item.authors.join(', ')}`}
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onView(item)}>
                        <Play /> Ver entrevista
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => dispatch({ type: 'TOGGLE_INTERVIEW_FEATURED', interviewId: item.id })}
                      >
                        <Star /> {item.featured ? 'Quitar destaque' : 'Destacar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!interviews.length && (
              <TableRow>
                <TableCell className="p-8 text-center text-muted-foreground" colSpan={7}>
                  No hay entrevistas en este grado y sección.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

function PublicationPreview({ resource, onBack }: { resource: Resource; onBack: () => void }) {
  const item: AdventureNotice = {
    id: resource.id,
    title: resource.title,
    body: resource.description,
    date: (resource.event?.dateTime ?? resource.publicationDate).slice(0, 10),
    attendees: [],
    kind: resource.type === 'EVENTO' ? 'event' : 'publication',
  }
  return (
    <ResourceDetail
      item={item}
      metaOverride={{
        topic: resource.type === 'EVENTO' ? 'Evento' : 'Publicación',
        url: resource.url ?? '',
        organizer: resource.event?.organizer,
        modality: resource.event ? formatModality(resource.event.modality) : undefined,
      }}
      onBack={onBack}
      onEventOutcome={() => undefined}
      onExternal={() => resource.url && window.open(resource.url, '_blank', 'noopener,noreferrer')}
      onFavorite={() => undefined}
      past={Boolean(resource.event && new Date(resource.event.dateTime) < new Date())}
      previewMode
      saved={false}
      interested={false}
    />
  )
}

function PublicationForm({
  initial,
  onClose,
  open,
}: {
  initial?: Resource
  onClose: () => void
  open: boolean
}) {
  const { state, dispatch } = useCounselorPortal()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [type, setType] = useState<ResourceType>(initial?.type ?? 'PUBLICACION')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [tagIds, setTagIds] = useState<string[]>(initial?.tagIds ?? [])
  const [audience, setAudience] = useState<Audience>(initial?.audience ?? 'ESTUDIANTES')
  const [dateTime, setDateTime] = useState(initial?.event?.dateTime.slice(0, 16) ?? '')
  const [organizer, setOrganizer] = useState(initial?.event?.organizer ?? '')
  const [modality, setModality] = useState<'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA'>(
    initial?.event?.modality ?? 'PRESENCIAL',
  )
  const [costChoice, setCostChoice] = useState<'UNSPECIFIED' | 'FREE' | 'PAID'>(
    initial?.event?.hasCost === undefined ? 'UNSPECIFIED' : initial.event.hasCost ? 'PAID' : 'FREE',
  )
  const [attempted, setAttempted] = useState(false)
  const isEvent = type === 'EVENTO'
  const valid = Boolean(
    title.trim() &&
    description.trim() &&
    tagIds.length &&
    (!isEvent || (url.trim() && dateTime && organizer.trim())),
  )
  const submit = () => {
    setAttempted(true)
    if (!valid) return
    const resource: Resource = {
      id: initial?.id ?? crypto.randomUUID(),
      type,
      title: title.trim(),
      description: description.trim(),
      url: url.trim() || undefined,
      tagIds,
      audience,
      publicationDate: initial?.publicationDate ?? state.referenceDate,
      viewCount: initial?.viewCount ?? 0,
      favoriteCount: initial?.favoriteCount ?? 0,
      event: isEvent
        ? {
            dateTime: new Date(dateTime).toISOString(),
            organizer: organizer.trim(),
            modality,
            hasCost: costChoice === 'UNSPECIFIED' ? undefined : costChoice === 'PAID',
          }
        : undefined,
    }
    dispatch({ type: initial ? 'UPDATE_RESOURCE' : 'ADD_RESOURCE', resource })
    onClose()
  }
  return (
    <Dialog onOpenChange={(next) => !next && onClose()} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar publicación' : 'Nueva publicación'}</DialogTitle>
          <DialogDescription>
            La fecha de publicación se conserva y no es editable. Los cambios se muestran inmediatamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipo *">
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(event) => setType(event.target.value as ResourceType)}
              value={type}
            >
              <option value="PUBLICACION">Publicación</option>
              <option value="EVENTO">Evento</option>
            </select>
          </Field>
          <Field label="Audiencia *">
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              onChange={(event) => setAudience(event.target.value as Audience)}
              value={audience}
            >
              {Object.entries(audienceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Título *">
            <Input onChange={(event) => setTitle(event.target.value)} value={title} />
          </Field>
          <Field label={isEvent ? 'Enlace del evento *' : 'Enlace de la publicación'}>
            <Input onChange={(event) => setUrl(event.target.value)} type="url" value={url} />
          </Field>
          <Field className="sm:col-span-2" label="Descripción *">
            <textarea
              className="min-h-24 w-full rounded-xl border p-3 text-sm"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </Field>
          <Field className="sm:col-span-2" label="Tags *">
            <div className="flex flex-wrap gap-2">
              {state.tags.map((tag) => (
                <label
                  className="flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 text-xs"
                  key={tag.id}
                >
                  <input
                    checked={tagIds.includes(tag.id)}
                    onChange={() =>
                      setTagIds((current) =>
                        current.includes(tag.id)
                          ? current.filter((id) => id !== tag.id)
                          : [...current, tag.id],
                      )
                    }
                    type="checkbox"
                  />
                  {tag.code} · {tag.name}
                </label>
              ))}
            </div>
          </Field>
          {isEvent && (
            <>
              <Field label="Fecha y hora del evento *">
                <Input
                  onChange={(event) => setDateTime(event.target.value)}
                  type="datetime-local"
                  value={dateTime}
                />
              </Field>
              <Field label="Organizador *">
                <Input onChange={(event) => setOrganizer(event.target.value)} value={organizer} />
              </Field>
              <Field label="Modalidad *">
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  onChange={(event) => setModality(event.target.value as typeof modality)}
                  value={modality}
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </Field>
              <Field label="Costo (opcional)">
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  onChange={(event) => setCostChoice(event.target.value as typeof costChoice)}
                  value={costChoice}
                >
                  <option value="UNSPECIFIED">No especificar</option>
                  <option value="FREE">Sin costo</option>
                  <option value="PAID">Con costo</option>
                </select>
              </Field>
            </>
          )}
        </div>
        {attempted && !valid && (
          <p className="text-sm text-[var(--destructive)]">
            Completa los campos obligatorios antes de guardar.
          </p>
        )}
        <Button onClick={submit}>
          {isEvent ? <CalendarDays /> : <FilePlus2 />} {initial ? 'Guardar cambios' : 'Publicar ahora'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function formatModality(value: NonNullable<Resource['event']>['modality']) {
  return value === 'HIBRIDA' ? 'Híbrida' : value === 'VIRTUAL' ? 'Virtual' : 'Presencial'
}
function Field({
  children,
  className = '',
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <label className={`space-y-2 text-sm ${className}`}>
      <span className="font-medium">{label}</span>
      {children}
    </label>
  )
}

export { PublicationsView }
