import { Eye, EyeOff, MoreHorizontal, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { useAdventure, updateAdventure } from '@/store/adventureStore'
import { InterviewDetail } from './components/ResourcePreviews'
import { interviewDetails, reactionOptions } from './data/InterviewDetails'
import { useCounselorPortal } from './CounselorPortalContext'
import { getPublishedInterviews, moderateInterview } from './InterviewSelectors'
import type { Interview } from './types/CounselorPortalTypes'

function PublicationsView() {
  const { state } = useCounselorPortal()
  const adventure = useAdventure()
  const [params, setParams] = useSearchParams()
  const { interviewId } = useParams()
  const navigate = useNavigate()
  const [confirmHide, setConfirmHide] = useState(false)
  const salon = state.classrooms.some((item) => item.id === params.get('salon'))
    ? params.get('salon')!
    : 'all'
  const query = salon === 'all' ? '' : `?salon=${encodeURIComponent(salon)}`
  const listUrl = `/counselor/publications${query}`
  const interviews = getPublishedInterviews(state.interviews, adventure)
  const visible = interviews.filter((item) => salon === 'all' || item.classroomId === salon)
  const classroom = (item: Interview) => {
    const room = state.classrooms.find((room) => room.id === item.classroomId)
    return room ? `${room.grade.split(' ')[0]} ${room.section}` : 'Sin asignar'
  }
  const profession = (item: Interview) => interviewDetails[item.videoId ?? item.id]?.career ?? item.subject
  const videoId = (item: Interview) => item.videoId ?? item.id
  const reports = (item: Interview) => adventure.reports.filter((report) => report.postId === videoId(item))
  const comments = (item: Interview) =>
    interviewDetails[videoId(item)]?.comments.filter((comment) => comment.text).length ?? 0
  const date = (item: Interview) => new Date(item.date).toLocaleDateString('es-PE')
  const status = (item: Interview) => (
    <div className="flex flex-wrap justify-center gap-2">
      {reports(item).length > 0 && <Badge variant="aviso">Reportado</Badge>}
      {item.hidden ? (
        <Badge variant="secondary">Ocultada</Badge>
      ) : item.featured ? (
        <Badge variant="secondary">Destacada</Badge>
      ) : (
        <Badge variant="outline">Sin destacar</Badge>
      )}
    </div>
  )
  const openButton = (item: Interview) => (
    <Button asChild variant="outline" className="min-h-11 whitespace-normal">
      <Link to={`/counselor/publications/interviews/${encodeURIComponent(item.id)}${query}`}>
        <Eye className="size-4 shrink-0" /> Ver entrevista
      </Link>
    </Button>
  )

  if (interviewId) {
    const item = interviews.find((item) => item.id === interviewId || videoId(item) === interviewId)
    if (!item)
      return (
        <div className="space-y-4 p-4 sm:p-8">
          <h1 className="text-2xl font-bold">Entrevista no encontrada</h1>
          <p>Esta entrevista no está disponible.</p>
          <Button asChild variant="outline">
            <Link to={listUrl}>Volver a Publicaciones</Link>
          </Button>
        </div>
      )
    const id = videoId(item)
    const reactionCounts = reactionOptions.map((option) => ({
      kind: option.label,
      count:
        (interviewDetails[id]?.comments.filter((comment) => comment.reaction === option.label).length ?? 0) +
        adventure.reactions.filter((reaction) => reaction.videoId === id && reaction.kind === option.label)
          .length,
    }))
    return (
      <div className="min-w-0">
        <InterviewDetail
          readOnly
          backLabel="Publicaciones"
          onBack={() => navigate(listUrl)}
          onReact={() => undefined}
          onReport={() => undefined}
          communityReactions={reactionCounts}
          video={{
            id,
            title: item.subject,
            alias: item.authors.filter(Boolean).join(', '),
            url: item.url,
            reflection: item.reflection,
            createdAt: item.date,
          }}
          actions={
            <div className="w-full space-y-3">
              {item.featured && (
                <div
                  className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-4"
                  role="status"
                >
                  <Star className="mt-0.5 size-6 shrink-0 fill-primary text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-foreground">Entrevista destacada</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Se muestra como destacada en la comunidad de estudiantes.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {reports(item).length > 0 && <Badge variant="aviso">Reportado</Badge>}
                {item.hidden ? (
                  <Badge variant="secondary">Entrevista ocultada</Badge>
                ) : (
                  <Button
                    variant={item.featured ? 'outline' : 'default'}
                    className="min-h-11"
                    onClick={() =>
                      updateAdventure((current) => moderateInterview(current, id, 'feature', !item.featured))
                    }
                  >
                    <Star className="size-4" />
                    {item.featured ? 'Quitar destaque' : 'Destacar entrevista'}
                  </Button>
                )}
                {!item.hidden && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="ml-auto min-h-11 min-w-11"
                        aria-label="Más acciones de la entrevista"
                      >
                        <MoreHorizontal className="size-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-w-[calc(100vw-2rem)]">
                      <DropdownMenuItem
                        className="min-h-11 items-start gap-3 whitespace-normal"
                        onSelect={() => setConfirmHide(true)}
                      >
                        <EyeOff className="mt-0.5 size-4 shrink-0" />
                        <span>
                          <span className="block">Ocultar entrevista</span>
                          <span className="mt-1 block max-w-60 text-xs leading-5 text-muted-foreground">
                            Retirarla de la comunidad si contiene contenido indebido.
                          </span>
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          }
        />
        {reports(item).length > 0 && (
          <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-8">
            <Card className="space-y-4 p-6">
              <h2 className="font-bold">Reportes recibidos · {reports(item).length}</h2>
              {reports(item).map((report) => (
                <div key={report.id} className="rounded-xl border p-4">
                  <h3 className="font-semibold">{report.reason}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                    {report.body || 'Sin comentarios adicionales.'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleDateString('es-PE')}
                  </p>
                </div>
              ))}
            </Card>
          </div>
        )}
        <Dialog open={confirmHide} onOpenChange={setConfirmHide}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Ocultar esta entrevista?</DialogTitle>
              <DialogDescription>
                Dejará de aparecer para los estudiantes y se retirará su destaque. Seguirá disponible para la
                orientadora. La gestión para desbloquearla se realiza fuera de la plataforma.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="outline" className="min-h-11" onClick={() => setConfirmHide(false)}>
                Cancelar
              </Button>
              <Button
                className="min-h-11"
                onClick={() => {
                  updateAdventure((current) => moderateInterview(current, id, 'hide'))
                  setConfirmHide(false)
                }}
              >
                Confirmar y ocultar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const headers = [
    'Autores',
    'Salón',
    'Profesión u ocupación',
    'Fecha de publicación',
    'Comentarios',
    'Estado',
    'Acciones',
  ]
  return (
    <div className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Publicaciones"
        eyebrow="Contenido"
        description="Revisa las entrevistas publicadas por tus estudiantes, sus reacciones y reportes."
      />
      <Select value={salon} onValueChange={(value) => setParams(value === 'all' ? {} : { salon: value })}>
        <SelectTrigger aria-label="Filtrar entrevistas por salón" className="min-h-11 w-full bg-card sm:w-64">
          <SelectValue>
            {salon === 'all' ? 'Todos los salones' : state.classrooms.find((room) => room.id === salon)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los salones</SelectItem>
          {state.classrooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              {room.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Card className="overflow-hidden rounded-xl">
        {!visible.length ? (
          <p className="p-6 text-muted-foreground">No hay entrevistas en este salón.</p>
        ) : (
          <>
            <div className="hidden xl:block">
              <Table className="table-fixed text-base [&_th:first-child]:pl-2.5 [&_td:first-child]:pl-2.5 [&_th:last-child]:pr-2.5 [&_td:last-child]:pr-2.5">
                <TableHeader className="bg-muted">
                  <TableRow className="hover:bg-transparent">
                    {headers.map((header, index) => (
                      <TableHead
                        key={header}
                        scope="col"
                        className={`px-2.5 py-2.5 text-base font-semibold whitespace-normal text-muted-foreground ${index >= 3 ? 'text-center' : ''} ${index === 0 ? 'w-[20%]' : index === 1 ? 'w-[8%]' : index === 2 ? 'w-[20%]' : index === 6 ? 'w-[16%]' : 'w-[12%]'}`}
                      >
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((item) => (
                    <TableRow key={item.id} className="hover:bg-transparent">
                      <TableCell className="px-2.5 py-3 whitespace-normal break-words">
                        {item.authors.filter(Boolean).join(', ')}
                      </TableCell>
                      <TableCell className="px-2.5 py-3 whitespace-normal">{classroom(item)}</TableCell>
                      <TableCell className="px-2.5 py-3 whitespace-normal break-words">
                        {profession(item)}
                      </TableCell>
                      <TableCell className="px-2.5 py-3 text-center">{date(item)}</TableCell>
                      <TableCell className="px-2.5 py-3 text-center">{comments(item)}</TableCell>
                      <TableCell className="px-2.5 py-3">{status(item)}</TableCell>
                      <TableCell className="px-2.5 py-3 text-center">{openButton(item)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-3 p-3 xl:hidden">
              {visible.map((item) => (
                <Card key={item.id} className="min-w-0 space-y-4 p-4">
                  <h2 className="font-semibold break-words">{item.subject}</h2>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Autores</dt>
                    <dd className="min-w-0 break-words">{item.authors.filter(Boolean).join(', ')}</dd>
                    <dt className="text-muted-foreground">Profesión</dt>
                    <dd className="min-w-0 break-words">{profession(item)}</dd>
                    <dt className="text-muted-foreground">Salón</dt>
                    <dd>{classroom(item)}</dd>
                    <dt className="text-muted-foreground">Publicación</dt>
                    <dd>{date(item)}</dd>
                    <dt className="text-muted-foreground">Comentarios</dt>
                    <dd>{comments(item)}</dd>
                  </dl>
                  {status(item)}
                  {openButton(item)}
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
export { PublicationsView }
