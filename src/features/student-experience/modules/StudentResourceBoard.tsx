import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  CircleCheck,
  CircleDotDashed,
  ExternalLink,
  Crown,
  FileText,
  Flag,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Play,
  Search,
  Send,
  Sparkles,
  Star,
  ThumbsUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { resourceDemoVideos, legendInterviews } from '@/features/occupation-exploration/data/AdventureData'
import {
  safeVideoUrl,
  updateAdventure,
  useAdventure,
} from '@/features/occupation-exploration/lib/AdventureStore'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import { useJourney } from '@/features/missions/store'
import { isTravelResourceUnlocked } from '@/features/occupation-exploration/lib/TravelerResources'
import '@/features/missions/journey.css'

const reactionOptions = [
  { label: 'Me enseñó algo que no sabía', prompt: '¿Qué fue?', icon: Lightbulb },
  { label: 'Me dieron ganas de investigar más', prompt: '¿Qué te gustaría investigar?', icon: Sparkles },
  { label: 'Muy completa', prompt: '¿Qué fue lo más completo?', icon: ThumbsUp },
]
const interviewDetails: Record<
  string,
  {
    career: string
    path: string
    professional: string
    duration: string
    summary: string
    comments: { author: string; reaction: string; text?: string }[]
  }
> = {
  'demo-environmental-engineering': {
    career: 'Ingeniería Ambiental',
    path: 'Universitaria',
    professional: 'María R.',
    duration: '8 min',
    summary: 'Conversamos sobre el monitoreo de ríos, el análisis de datos y el trabajo con comunidades.',
    comments: [
      {
        author: 'Nova',
        reaction: 'Me enseñó algo que no sabía',
        text: 'No imaginaba que se pudiera trabajar tanto fuera de la oficina.',
      },
      { author: 'Cedro', reaction: 'Muy completa' },
    ],
  },
  'demo-industrial-design': {
    career: 'Diseño Industrial',
    path: 'Universitaria',
    professional: 'Lucía P.',
    duration: '7 min',
    summary: 'Una mirada al proceso de diseñar productos: observar, prototipar, probar y mejorar.',
    comments: [
      {
        author: 'Brisa',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Quiero saber qué programas y materiales usan.',
      },
      { author: 'Quilla', reaction: 'Muy completa' },
    ],
  },
  'demo-culinary-arts': {
    career: 'Artes Culinarias',
    path: 'Técnica',
    professional: 'Carla M.',
    duration: '6 min',
    summary: 'Una chef comparte cómo combina técnica, creatividad y coordinación para crear experiencias.',
    comments: [
      {
        author: 'Río',
        reaction: 'Me enseñó algo que no sabía',
        text: 'Me sorprendió todo lo que se planifica antes de cocinar.',
      },
    ],
  },
  'demo-electrical-tech': {
    career: 'Electricidad Industrial',
    path: 'Técnica',
    professional: 'Jorge A.',
    duration: '9 min',
    summary: 'Conocimos el trabajo de diagnóstico, instalación y seguridad en distintos espacios.',
    comments: [
      {
        author: 'Nova',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Me gustaría conocer las especialidades que existen.',
      },
      { author: 'Cedro', reaction: 'Muy completa' },
    ],
  },
  'legend-community-health': {
    career: 'Enfermería',
    path: 'Universitaria',
    professional: 'Elena C.',
    duration: '8 min',
    summary: 'Una conversación sobre cuidado, prevención y trabajo cercano con las familias.',
    comments: [
      {
        author: 'Luna',
        reaction: 'Me enseñó algo que no sabía',
        text: 'No sabía cuánto trabajo preventivo se hace fuera del hospital.',
      },
      { author: 'Tilo', reaction: 'Muy completa' },
    ],
  },
  'legend-animation': {
    career: 'Animación Digital',
    path: 'Técnica',
    professional: 'Diego S.',
    duration: '7 min',
    summary: 'Un recorrido por la creación de personajes, la narrativa y el trabajo colaborativo.',
    comments: [
      {
        author: 'Mar',
        reaction: 'Me dieron ganas de investigar más',
        text: 'Quiero conocer cómo se construye un portafolio.',
      },
    ],
  },
}
const legendIds = new Set(['demo-industrial-design', 'legend-community-health', 'legend-animation'])
const legendVideos: AdventureState['videos'] = legendInterviews

function StudentResourceBoard() {
  const state = useAdventure()
  const journey = useJourney()
  const navigate = useNavigate()
  const [communityTab, setCommunityTab] = useState<'classroom' | 'legends'>('classroom')
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<AdventureState['videos'][number] | null>(null)
  const [reporting, setReporting] = useState<string | null>(null)
  const videos = useMemo(() => {
    const map = new Map<string, AdventureState['videos'][number]>(
      resourceDemoVideos.map((item) => [item.id, { ...item }]),
    )
    state.videos.forEach((item) => map.set(item.id, item))
    return [...map.values()]
      .filter(
        (video) =>
          !state.interviewModeration[video.id]?.hidden &&
          !state.reports.some((report) => report.postId === video.id && report.status === 'hidden'),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [state.reports, state.videos, state.interviewModeration])
  const matches = (title: string) => title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  const researchUnlocked = isTravelResourceUnlocked(
    {
      id: 'research-access',
      title: '',
      summary: '',
      description: '',
      kind: 'interview',
      icon: 'quote',
      requirement: { anyCase: true },
    },
    journey,
    state,
  )
  const communityVideos = (
    communityTab === 'classroom'
      ? videos
      : [...videos.filter((video) => legendIds.has(video.id)), ...legendVideos]
  ).filter(
    (video) =>
      !state.interviewModeration[video.id]?.hidden &&
      !state.reports.some((report) => report.postId === video.id && report.status === 'hidden'),
  )
  const visibleVideos = communityVideos.filter(
    (video) => (!favoritesOnly || state.bookmarks.includes(video.id)) && matches(video.title),
  )

  const toggleBookmark = (id: string) =>
    updateAdventure((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(id)
        ? current.bookmarks.filter((value) => value !== id)
        : [...current.bookmarks, id],
    }))
  const markSeen = (id: string) =>
    updateAdventure((current) =>
      current.visits.includes(id) ? current : { ...current, visits: [...current.visits, id] },
    )
  const react = (videoId: string, label: string) =>
    updateAdventure((current) => ({
      ...current,
      reactions: current.reactions.some((item) => item.videoId === videoId && item.kind === label)
        ? current.reactions.filter((item) => !(item.videoId === videoId && item.kind === label))
        : [
            ...current.reactions.filter((item) => item.videoId !== videoId),
            { videoId, kind: label, createdAt: new Date().toISOString() },
          ],
    }))
  if (
    selectedInterview &&
    researchUnlocked &&
    !state.interviewModeration[selectedInterview.id]?.hidden &&
    !state.reports.some((report) => report.postId === selectedInterview.id && report.status === 'hidden')
  ) {
    return (
      <>
        <InterviewDetail
          video={selectedInterview}
          reaction={state.reactions.find((item) => item.videoId === selectedInterview.id)}
          onBack={() => setSelectedInterview(null)}
          onReact={(option) => react(selectedInterview.id, option.label)}
          onReport={() => setReporting(selectedInterview.id)}
          reported={state.reports.some((report) => report.postId === selectedInterview.id)}
        />
        {reporting && <ReportModal videoId={reporting} onClose={() => setReporting(null)} />}
      </>
    )
  }
  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <header className="mb-6">
        <p className="adventure-eyebrow">PISTAS PARA SEGUIR EXPLORANDO</p>
        <h1 className="mt-2 text-3xl font-bold">Investigaciones de los viajeros</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Descubre las carreras a través de las entrevistas de tu salón y las historias de otros viajeros.
        </p>
      </header>
      <div className="mb-6 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm lg:flex-row lg:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-muted-foreground">
          <Search className="size-5" />
          <span className="sr-only">Buscar por título</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por título..."
          />
        </label>
        <div className="border-t p-2 lg:border-l lg:border-t-0">
          <Button
            size="sm"
            variant={favoritesOnly ? 'default' : 'ghost'}
            onClick={() => setFavoritesOnly((value) => !value)}
          >
            <Star className={favoritesOnly ? 'fill-current' : ''} />
            Favoritos
          </Button>
        </div>
      </div>
      {!researchUnlocked && (
        <p className="adventure-card p-6 text-sm text-muted-foreground">
          Completa una misión de Central de Casos para acceder a las investigaciones de tu salón y de otros
          viajeros.
        </p>
      )}
      <>
          <div
            className="mb-5 inline-flex rounded-xl border bg-white p-1"
            role="group"
            aria-label="Origen de investigaciones"
          >
            <Button
              size="sm"
              variant={communityTab === 'classroom' ? 'secondary' : 'ghost'}
              onClick={() => setCommunityTab('classroom')}
            >
              <Users />
              Mi salón
            </Button>
            <Button
              size="sm"
              variant={communityTab === 'legends' ? 'secondary' : 'ghost'}
              onClick={() => setCommunityTab('legends')}
            >
              <Crown />
              Leyendas
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {visibleVideos.map((video) => {
                const selected = state.reactions.find((item) => item.videoId === video.id)
                const legendaryView = communityTab === 'legends'
                return (
                  <article
                    key={video.id}
                    className={
                      'adventure-card flex h-full flex-col overflow-hidden p-0 ' +
                      (legendaryView
                        ? 'border-[#d8ad45] bg-[#fffdf5] shadow-[0_12px_35px_rgb(153_108_25/14%)]'
                        : '')
                    }
                  >
                    <div
                      className={
                        'grid h-28 place-items-center ' +
                        (legendaryView
                          ? 'bg-gradient-to-br from-[#6d4f28] via-[#b48335] to-[#f3d98b]'
                          : 'bg-gradient-to-br from-[#dcebdd] to-[#f8edd5]')
                      }
                    >
                      <Play className={'size-9 ' + (legendaryView ? 'text-white' : 'text-[#52775c]')} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                          <GraduationCap className="size-3.5" /> Entrevista
                        </Badge>
                        {legendIds.has(video.id) && (
                          <Badge
                            className={legendaryView ? 'bg-[#f4d77a] text-[#664711]' : ''}
                            variant="warning"
                          >
                            <Crown className="size-3.5" /> Leyenda
                          </Badge>
                        )}
                        <Badge
                          variant={
                            researchUnlocked && state.visits.includes(video.id) ? 'success' : 'outline'
                          }
                        >
                          {state.visits.includes(video.id) ? (
                            <CircleCheck className="size-3.5" />
                          ) : (
                            <CircleDotDashed className="size-3.5" />
                          )}
                          {!researchUnlocked
                            ? 'Bloqueado'
                            : state.visits.includes(video.id)
                              ? 'Visto'
                              : 'No visto'}
                        </Badge>
                        {(state.interviewModeration[video.id]?.featured ??
                          video.id === 'demo-industrial-design') && (
                          <Badge variant="secondary">
                            <Star className="size-3.5" /> Destacada
                          </Badge>
                        )}
                      </div>
                      <h2 className="mt-4 text-xl font-bold">{video.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Por {video.alias} · {interviewDetails[video.id]?.career ?? 'Entrevista profesional'}
                      </p>
                      <p className="my-4 line-clamp-3 text-sm leading-7">
                        {researchUnlocked
                          ? video.reflection
                          : 'Completa una misión de Central de Casos para descubrir esta investigación.'}
                      </p>
                      <div className="mt-auto">
                        {researchUnlocked && state.bookmarks.includes(video.id) && (
                          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#fff2bf] px-3 py-1.5 text-xs font-bold text-[#755414]">
                            <Star className="size-4 fill-current" />
                            Guardada en favoritos
                          </div>
                        )}
                        {researchUnlocked && selected && (
                          <p className="mb-4 text-xs font-medium text-[#52664b]">
                            <MessageCircle className="mr-1 inline size-4" />
                            Ya dejaste una reacción
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 border-t pt-4">
                        <Button
                          onClick={() => {
                            if (!researchUnlocked) {
                              navigate(appPaths.student.exploration)
                              return
                            }
                            markSeen(video.id)
                            setSelectedInterview(video)
                          }}
                        >
                          {researchUnlocked ? 'Ver entrevista' : 'Ir a Central de Casos'}
                        </Button>
                        {researchUnlocked && (
                          <Button variant="outline" onClick={() => toggleBookmark(video.id)}>
                            <Star className={state.bookmarks.includes(video.id) ? 'fill-current' : ''} />
                            {state.bookmarks.includes(video.id) ? 'Quitar favorito' : 'Agregar a favoritos'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            {!visibleVideos.length && (
              <div className="adventure-card col-span-full p-10 text-center text-sm text-muted-foreground">
                {communityVideos.length
                  ? 'No hay investigaciones que coincidan con tu búsqueda o favoritos.'
                  : 'Las investigaciones publicadas aparecerán aquí.'}
              </div>
            )}
          </div>
      </>
      {reporting && <ReportModal videoId={reporting} onClose={() => setReporting(null)} />}
    </div>
  )
}

function InterviewDetail({
  video,
  reaction,
  onBack,
  onReact,
  onReport,
  readOnly = false,
  backLabel = 'Investigaciones',
  reported = false,
}: {
  video: AdventureState['videos'][number]
  reaction?: AdventureState['reactions'][number]
  onBack: () => void
  onReact: (option: (typeof reactionOptions)[number]) => void
  onReport: () => void
  readOnly?: boolean
  backLabel?: string
  reported?: boolean
}) {
  const [comment, setComment] = useState('')
  const [selectedOption, setSelectedOption] = useState<(typeof reactionOptions)[number] | null>(null)
  const [myComments, setMyComments] = useState<{ reaction: string; text: string }[]>([])
  const detail = interviewDetails[video.id] ?? {
    career: video.title,
    path: 'Por definir',
    professional: 'Profesional entrevistado',
    duration: '5–10 min',
    summary: video.reflection,
    comments: [],
  }
  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft /> Volver a {backLabel}
      </Button>
      <div className="mx-auto mt-5 max-w-6xl">
        <div className="adventure-card overflow-hidden p-0">
          <div className="grid h-56 place-items-center bg-gradient-to-br from-[#dcebdd] to-[#f8edd5]">
            <Play className="size-16 text-[#52775c]" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                <GraduationCap className="size-3.5" /> {detail.career}
              </Badge>
              <Badge variant="outline">{detail.path}</Badge>
            </div>
            <h1 className="mt-5 text-3xl font-bold">{video.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Entrevista de {detail.duration} · Publicada por {video.alias}
            </p>
            <p className="mt-5 max-w-2xl leading-7">{video.reflection}</p>
            {safeVideoUrl(video.url) && (
              <Button className="mt-5" asChild>
                <a href={safeVideoUrl(video.url)!} target="_blank" rel="noreferrer">
                  Ver video completo <ExternalLink />
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className={`mt-5 grid gap-5 ${readOnly ? '' : 'lg:grid-cols-[1fr_1.55fr]'}`}>
          <aside className="adventure-card p-6">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-[#f9e7b3] text-[#9a6b1c]">
                <FileText className="size-5" />
              </div>
              <h2 className="font-bold">Ficha de la entrevista</h2>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="rounded-2xl bg-[#e5f0df] p-4">
                <dt className="flex items-center gap-2 font-semibold text-[#456547]">
                  <GraduationCap className="size-4" /> Carrera o profesión
                </dt>
                <dd className="mt-1 font-medium">{detail.career}</dd>
              </div>
              <div className="rounded-2xl bg-[#e3eff4] p-4">
                <dt className="flex items-center gap-2 font-semibold text-[#47717e]">
                  <UserRound className="size-4" /> Profesional entrevistado
                </dt>
                <dd className="mt-1 font-medium">{detail.professional}</dd>
              </div>
              <div className="rounded-2xl bg-[#f8e8dc] p-4">
                <dt className="flex items-center gap-2 font-semibold text-[#996342]">
                  <Users className="size-4" /> Quienes la realizaron
                </dt>
                <dd className="mt-1 font-medium">{video.alias}</dd>
              </div>
              <div className="rounded-2xl bg-[#eee9f8] p-4">
                <dt className="flex items-center gap-2 font-semibold text-[#6a5791]">
                  <Sparkles className="size-4" /> En pocas palabras
                </dt>
                <dd className="mt-1 leading-6">{detail.summary}</dd>
              </div>
            </dl>
          </aside>
          {!readOnly && (
            <section className="adventure-card p-6">
              <h2 className="font-bold">¿Qué te dejó esta entrevista?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reacciona como en una publicación y, si quieres, comparte una idea.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {reactionOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <Button
                      key={option.label}
                      className="h-auto justify-start whitespace-normal py-3 text-left"
                      variant={reaction?.kind === option.label ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedOption(option)
                        onReact(option)
                      }}
                    >
                      <Icon className="size-5" />
                      {option.label}
                    </Button>
                  )
                })}
              </div>
              {selectedOption && (
                <div className="mt-4 rounded-2xl border border-[#dce8db] bg-[#f5f8f1] p-4">
                  <label className="block text-sm font-semibold">
                    {selectedOption.prompt}
                    <textarea
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      className="adventure-input mt-2 min-h-24 bg-white"
                      placeholder="Escribe un poco más si quieres..."
                    />
                  </label>
                  <Button
                    className="mt-3"
                    disabled={!comment.trim()}
                    onClick={() => {
                      setMyComments((items) => [
                        ...items,
                        { reaction: selectedOption.label, text: comment.trim() },
                      ])
                      setComment('')
                    }}
                  >
                    <Send /> Publicar comentario
                  </Button>
                </div>
              )}
              <div className="mt-7 border-t pt-5">
                <h2 className="flex items-center gap-2 font-bold">
                  <MessageCircle className="size-5" /> Conversación sobre la investigación
                </h2>
                <div className="mt-4 space-y-3">
                  {[...detail.comments, ...myComments.map((item) => ({ author: 'Alex', ...item }))].map(
                    (item, index) => (
                      <div key={index} className="rounded-xl bg-[#f5f7f2] p-3 text-sm">
                        <p className="font-semibold">
                          {item.author}{' '}
                          <span className="font-normal text-muted-foreground">· {item.reaction}</span>
                        </p>
                        {item.text && <p className="mt-1 leading-6">{item.text}</p>}
                      </div>
                    ),
                  )}
                  {!detail.comments.length && !myComments.length && (
                    <p className="text-sm text-muted-foreground">
                      Aún no hay comentarios. Puedes abrir la conversación.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={onReport}
                  disabled={reported}
                >
                  <Flag /> {reported ? 'Reportado' : '¿Algo no está bien? Reportar'}
                </Button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
function ReportModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const reasons = ['Contenido incómodo', 'Información sensible', 'No se ve bien', 'Falta de consentimiento']
  const submit = () => {
    if (!reason) return
    updateAdventure((current) => ({
      ...current,
      reports: current.reports.some((report) => report.postId === videoId)
        ? current.reports
        : [
            ...current.reports,
            {
              id: crypto.randomUUID(),
              postId: videoId,
              body: message.trim(),
              reason,
              status: reason === 'Falta de consentimiento' ? 'hidden' : 'pending',
              createdAt: new Date().toISOString(),
            },
          ],
    }))
    onClose()
  }
  return (
    <Modal title="Reportar esta investigación" onClose={onClose}>
      <p className="mb-4 text-sm leading-6">
        Cuéntanos qué pasó. Si falta consentimiento, la entrevista se retirará provisionalmente.
      </p>
      <div className="flex flex-wrap gap-2">
        {reasons.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={reason === item ? 'default' : 'outline'}
            onClick={() => setReason(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      {reason && (
        <label className="mt-5 block text-sm font-semibold">
          ¿Quieres agregar más detalles?
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="adventure-input mt-2 min-h-24"
            placeholder="Este detalle ayudará a la orientadora a revisarlo."
          />
        </label>
      )}
      <Button className="mt-5" disabled={!reason} onClick={submit}>
        <Flag /> Enviar reporte
      </Button>
    </Modal>
  )
}
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="sx-root max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">Elige una opción para continuar.</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
export { StudentResourceBoard }
