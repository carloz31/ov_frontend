import { useState } from 'react'
import {
  Backpack,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Crown,
  ExternalLink,
  FileText,
  Flag,
  Flame,
  Languages,
  Lightbulb,
  LockKeyhole,
  MessageSquareQuote,
  Play,
  ScrollText,
  Search,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { ResourceText } from '../missions/JourneyContent'
import { useJourney } from '../missions/store'
import { resourceDemoVideos, legendInterviews } from './data/AdventureData'
import { updateAdventure, useAdventure } from './lib/AdventureStore'
import {
  getTravelResources,
  isTravelResourceUnlocked,
  resourceFileUrl,
  resourceRequirement,
  youtubeEmbedUrl,
  type TravelResource,
} from './lib/TravelerResources'
import '../missions/journey.css'
import './resources.css'

type KindFilter = 'all' | 'sheet' | 'testimonial'
type StatusFilter = 'all' | 'unlocked' | 'locked'
const resourceIcons: Record<TravelResource['icon'], LucideIcon> = {
  compass: Compass,
  scroll: ScrollText,
  book: BookOpen,
  sparkles: Sparkles,
  quote: MessageSquareQuote,
  flame: Flame,
  languages: Languages,
}
const kindLabels = { sheet: 'Ficha', testimonial: 'Testimonio', interview: 'Entrevista' }
const reactions = ['Me enseñó algo que no sabía', 'Me dieron ganas de investigar más', 'Muy completa']


function AdventureResourcesView() {
  const adventure = useAdventure()
  const journey = useJourney()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'community' ? 'community' : 'backpack'
  const [communityTab, setCommunityTab] = useState<'classroom' | 'legends'>('classroom')
  const [kind, setKind] = useState<KindFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reporting, setReporting] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const resources = getTravelResources()
  const videoMap = new Map([...resourceDemoVideos, ...adventure.videos].map((video) => [video.id, video]))
  const videos = [...videoMap.values()].filter(
    (video) => !adventure.interviewModeration[video.id]?.hidden && !adventure.reports.some((report) => report.postId === video.id && report.status === 'hidden'),
  )
  const interviews: TravelResource[] = (
    communityTab === 'classroom'
      ? videos
      : [...videos.filter((video) => video.id === 'demo-industrial-design'), ...legendInterviews]
  ).filter((video) => !adventure.interviewModeration[video.id]?.hidden && !adventure.reports.some((report) => report.postId === video.id && report.status === 'hidden')).map((video) => ({
    id: video.id,
    title: video.title,
    summary: video.reflection,
    description: video.reflection,
    kind: 'interview',
    icon: 'quote',
    requirement: { anyCase: true },
    url: video.url,
    author: video.alias,
  }))
  const isUnlocked = (resource: TravelResource) => isTravelResourceUnlocked(resource, journey, adventure)
  const unlockedCount = resources.filter(isUnlocked).length
  const allEntries = [...resources, ...interviews]
  const selected = allEntries.find((item) => item.id === selectedId)
  const activeEntries = tab === 'backpack' ? resources : interviews
  const visible = activeEntries.filter(
    (item) =>
      (tab === 'community' || kind === 'all' || item.kind === kind) &&
      (status === 'all' || (status === 'unlocked') === isUnlocked(item)) &&
      (!favoritesOnly || (isUnlocked(item) && adventure.bookmarks.includes(item.id))) &&
      `${item.title} ${item.summary} ${item.author ?? ''}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  )

  function toggleFavorite(id: string) {
    const item = allEntries.find((entry) => entry.id === id)
    if (!item || !isUnlocked(item)) return
    updateAdventure((current) => ({
      ...current,
      bookmarks: current.bookmarks.includes(id)
        ? current.bookmarks.filter((saved) => saved !== id)
        : [...current.bookmarks, id],
    }))
  }

  function openResource(resource: TravelResource) {
    if (!isUnlocked(resource)) return
    setSelectedId(resource.id)
    updateAdventure((current) =>
      current.visits.includes(resource.id)
        ? current
        : { ...current, visits: [...current.visits, resource.id] },
    )
  }

  function react(id: string, label: string) {
    updateAdventure((current) => ({
      ...current,
      reactions: current.reactions.some((reaction) => reaction.videoId === id && reaction.kind === label)
        ? current.reactions.filter((reaction) => !(reaction.videoId === id && reaction.kind === label))
        : [
            ...current.reactions.filter((reaction) => reaction.videoId !== id),
            { videoId: id, kind: label, createdAt: new Date().toISOString() },
          ],
    }))
  }

  return (
    <div className="adventure-page resource-page min-h-full p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="resource-hero relative overflow-hidden rounded-3xl p-6 text-[#fff9e8] sm:p-8">
          <div className="relative z-10 flex flex-col justify-between gap-7 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#d9ca97]">
                <Compass className="size-3.5" /> PROVISIONES PARA TU AVENTURA
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Tu mochila de viaje</h1>
              <p className="mt-3 text-sm leading-6 text-[#fff9e8]/75">
                Cada paso deja una nueva pista. Reúne fichas y voces profesionales, y guarda lo que quieras
                llevar contigo.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2">
                  <Check className="size-3.5" /> {unlockedCount} de {resources.length} recursos desbloqueados
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-[#e2d3a5]">
                  <LockKeyhole className="size-3.5" /> {resources.length - unlockedCount} por descubrir
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="resource-backpack hidden shrink-0 sm:grid">
              <Backpack className="size-20 stroke-[1.25]" />
              <span className="resource-backpack-charm">
                <Sparkles className="size-5" />
              </span>
            </div>
          </div>
        </header>

        <div
          className="mt-7 flex border-b border-[#dcdcc9]"
          aria-label="Secciones de recursos"
          role="tablist"
        >
          {(
            [
              { id: 'backpack', label: 'Mi mochila', icon: Backpack },
              { id: 'community', label: 'Comunidad', icon: Users },
            ] as const
          ).map((item) => (
            <button
              type="button"
              role="tab"
              id={`resource-tab-${item.id}`}
              aria-controls="resource-panel"
              aria-selected={tab === item.id}
              key={item.id}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition-colors sm:px-6',
                tab === item.id
                  ? 'border-[#52775c] text-[#304b3d]'
                  : 'border-transparent text-muted-foreground hover:text-[#304b3d]',
              )}
              onClick={() => {
                setParams(item.id === 'community' ? { tab: 'community' } : {})
                setSelectedId(null)
              }}
            >
              <item.icon className="size-4" /> {item.label}
            </button>
          ))}
        </div>

        <section className="pt-6" id="resource-panel" role="tabpanel" aria-labelledby={`resource-tab-${tab}`}>
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="adventure-eyebrow">
                {tab === 'backpack' ? 'EL INVENTARIO DEL VIAJERO' : 'HISTORIAS COMPARTIDAS POR VIAJEROS'}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {tab === 'backpack' ? 'Tus hallazgos del camino' : 'Entrevistas de la comunidad'}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {tab === 'backpack'
                  ? 'Completa actividades para reunir fichas y misiones de Central de Casos para descubrir testimonios.'
                  : 'Completa una misión de Central de Casos para acceder a las entrevistas de tu salón y de otros viajeros.'}
              </p>
            </div>
            <label className="resource-search relative block sm:w-64 sm:shrink-0">
              <span className="sr-only">Buscar recursos</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="adventure-input pl-10"
                placeholder="Buscar en tu mochila…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex flex-wrap gap-1 rounded-xl border border-[#dedfce] bg-[#fffdf7] p-1"
              role="group"
              aria-label={tab === 'backpack' ? 'Tipo de recurso' : 'Origen de las entrevistas'}
            >
              {tab === 'backpack'
                ? (
                    [
                      { id: 'all', label: 'Todo', icon: Backpack },
                      { id: 'sheet', label: 'Fichas', icon: ScrollText },
                      { id: 'testimonial', label: 'Testimonios', icon: MessageSquareQuote },
                    ] as const
                  ).map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant={kind === item.id ? 'secondary' : 'ghost'}
                      aria-pressed={kind === item.id}
                      onClick={() => setKind(item.id)}
                    >
                      <item.icon className="size-3.5" /> {item.label}
                    </Button>
                  ))
                : (
                    [
                      { id: 'classroom', label: 'Mi salón', icon: Users },
                      { id: 'legends', label: 'Leyendas', icon: Crown },
                    ] as const
                  ).map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant={communityTab === item.id ? 'secondary' : 'ghost'}
                      aria-pressed={communityTab === item.id}
                      onClick={() => setCommunityTab(item.id)}
                    >
                      <item.icon className="size-3.5" /> {item.label}
                    </Button>
                  ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="sr-only" htmlFor="resource-status">
                Disponibilidad del recurso
              </label>
              <select
                id="resource-status"
                className="rounded-xl border border-[#dedfce] bg-[#fffdf7] px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
              >
                <option value="all">Todos los estados</option>
                <option value="unlocked">Desbloqueados</option>
                <option value="locked">Bloqueados</option>
              </select>
              <Button
                size="sm"
                variant={favoritesOnly ? 'secondary' : 'outline'}
                aria-pressed={favoritesOnly}
                onClick={() => setFavoritesOnly(!favoritesOnly)}
              >
                <Star className={favoritesOnly ? 'fill-current' : ''} /> Favoritos
              </Button>
            </div>
          </div>

          <div className="resource-inventory rounded-3xl border border-[#dedfce] p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6c7b64]">
              <span className="flex items-center gap-2">
                <Backpack className="size-3.5" />{' '}
                {tab === 'backpack' ? 'Compartimentos de tu mochila' : 'Voces de la comunidad'}
              </span>
              <span>
                {visible.length} {visible.length === 1 ? 'recurso' : 'recursos'}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  unlocked={isUnlocked(item)}
                  saved={adventure.bookmarks.includes(item.id)}
                  featured={adventure.interviewModeration[item.id]?.featured ?? item.id === 'demo-industrial-design'}
                  onOpen={() => openResource(item)}
                  onFavorite={() => toggleFavorite(item.id)}
                  onRequirement={() => navigate(resourceRequirement(item).url)}
                />
              ))}
            </div>
            {visible.length === 0 && (
              <div className="py-14 text-center">
                <Backpack className="mx-auto size-10 text-[#809477]" />
                <h3 className="mt-4 font-bold">
                  {favoritesOnly ? 'Aún no hay favoritos aquí' : 'No encontramos recursos con estos filtros'}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  {favoritesOnly
                    ? 'Cuando desbloquees un recurso, toca su estrella para tenerlo siempre a mano.'
                    : 'Prueba otra búsqueda o cambia el tipo de recurso y su disponibilidad.'}
                </p>
                <Button
                  className="mt-5"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setKind('all')
                    setStatus('all')
                    setFavoritesOnly(false)
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-[#8c7c48]" /> Las estrellas son tuyas. Guarda
            tus recursos favoritos para encontrarlos más rápido.
          </p>
        </section>
      </div>

      <Dialog
        open={Boolean(selected && isUnlocked(selected))}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
      >
        {selected && isUnlocked(selected) && (
          <DialogContent className="resource-dialog max-w-4xl bg-[#fffdf7] p-0 md:p-0">
            <DialogHeader className="mb-0 border-b border-[#e4e0cb] p-6 pr-16 sm:p-7 sm:pr-16">
              <Badge className="mb-2 w-fit" variant="success">
                <Check className="size-3" /> {kindLabels[selected.kind]}{' '}
                {selected.kind === 'testimonial' ? 'desbloqueado' : 'desbloqueada'}
              </Badge>
              <DialogTitle className="text-[#304b3d]">{selected.title}</DialogTitle>
              {selected.author && (
                <p className="text-xs font-semibold text-[#7c805d]">
                  {selected.kind === 'interview' ? 'Compartido por ' : ''}
                  {selected.author}
                </p>
              )}
              <DialogDescription>{selected.description}</DialogDescription>
            </DialogHeader>
            <div className="p-6 sm:p-7">
              <ResourceContent resource={selected} />
            </div>
            {selected.kind === 'interview' && (
              <div className="space-y-3 border-t border-[#e4e0cb] px-6 py-5">
                <p className="text-sm font-bold">¿Qué te dejó esta entrevista?</p>
                <div className="flex flex-wrap gap-2">
                  {reactions.map((reaction) => (
                    <Button
                      key={reaction}
                      variant="outline"
                      size="sm"
                      aria-pressed={adventure.reactions.some(
                        (item) => item.videoId === selected.id && item.kind === reaction,
                      )}
                      onClick={() => react(selected.id, reaction)}
                    >
                      {adventure.reactions.some(
                        (item) => item.videoId === selected.id && item.kind === reaction,
                      ) && <Check />}
                      {reaction}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e0cb] bg-[#f4f3e8] px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                aria-pressed={adventure.bookmarks.includes(selected.id)}
                onClick={() => toggleFavorite(selected.id)}
              >
                <Star
                  className={adventure.bookmarks.includes(selected.id) ? 'fill-current text-[#aa7d26]' : ''}
                />
                {adventure.bookmarks.includes(selected.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              </Button>
              {selected.kind === 'interview' && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={adventure.reports.some((report) => report.postId === selected.id)}
                  onClick={() => {
                    setReporting(selected.id)
                    setReason('')
                    setReportMessage('')
                  }}
                >
                  <Flag />{' '}
                  {adventure.reports.some((report) => report.postId === selected.id)
                    ? 'Reportado'
                    : 'Reportar entrevista'}
                </Button>
              )}
              {selected.source && (
                <p className="max-w-md text-xs leading-5 text-muted-foreground">Fuente: {selected.source}</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      <Dialog
        open={Boolean(reporting)}
        onOpenChange={(open) => {
          if (!open) setReporting(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reportar entrevista</DialogTitle>
            <DialogDescription>La orientadora recibirá el reporte para revisarlo.</DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-semibold">
            Motivo
            <select
              className="adventure-input mt-2"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            >
              <option value="">Selecciona un motivo</option>
              {['Contenido incómodo', 'Información sensible', 'No se ve bien', 'Falta de consentimiento'].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Detalles (opcional)
            <textarea
              className="adventure-input mt-2 min-h-24"
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
            />
          </label>
          <Button
            className="mt-4"
            disabled={!reason}
            onClick={() => {
              if (!reporting || !reason || adventure.reports.some((report) => report.postId === reporting))
                return
              updateAdventure((current) => ({
                ...current,
                reports: [
                  ...current.reports,
                  {
                    id: crypto.randomUUID(),
                    postId: reporting,
                    body: reportMessage.trim(),
                    reason: reason.trim(),
                    status: reason === 'Falta de consentimiento' ? 'hidden' : 'pending',
                    createdAt: new Date().toISOString(),
                  },
                ],
              }))
              setReporting(null)
            }}
          >
            Enviar reporte
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ResourceCard({
  resource,
  unlocked,
  saved,
  featured,
  onOpen,
  onFavorite,
  onRequirement,
}: {
  resource: TravelResource
  unlocked: boolean
  saved: boolean
  featured: boolean
  onOpen: () => void
  onFavorite: () => void
  onRequirement: () => void
}) {
  const Icon = resourceIcons[resource.icon]
  const requirement = resourceRequirement(resource)
  return (
    <article
      className={cn(
        'resource-slot relative flex flex-col overflow-hidden rounded-2xl border',
        unlocked ? 'resource-slot-unlocked' : 'resource-slot-locked',
      )}
    >
      <button
        className="resource-open flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#52775c] disabled:cursor-default"
        type="button"
        disabled={!unlocked}
        onClick={onOpen}
        aria-label={
          unlocked
            ? `Abrir ${kindLabels[resource.kind].toLowerCase()}: ${resource.title}`
            : `${resource.title}. Bloqueado. ${requirement.text}`
        }
      >
        {featured && resource.kind === 'interview' && <Badge className="mx-3 mt-3 w-fit" variant="secondary"><Star className="size-3.5" /> Destacada</Badge>}
        <div
          className={cn(
            'resource-object-stage relative grid h-36 w-full place-items-center',
            resource.kind !== 'sheet' && 'resource-object-stage-video',
          )}
        >
          <span className="absolute left-3 top-3 text-[9px] font-bold uppercase tracking-[0.13em] text-[#7d795b]">
            {kindLabels[resource.kind]}
          </span>
          <span
            className={cn(
              'resource-object',
              !unlocked && 'resource-object-locked',
              resource.kind !== 'sheet' && 'resource-object-video',
            )}
          >
            {unlocked ? (
              <Icon className="size-9 stroke-[1.5]" />
            ) : (
              <LockKeyhole className="size-7 stroke-[1.5]" />
            )}
          </span>
          {unlocked && resource.kind !== 'sheet' && (
            <span
              aria-hidden="true"
              className="absolute bottom-4 right-4 grid size-6 place-items-center rounded-full bg-[#52775c] text-white"
            >
              <Play className="size-3 fill-current" />
            </span>
          )}
        </div>
        <div className="w-full px-4 pb-3 pt-4">
          <p
            className={cn(
              'mb-2 flex items-center gap-1.5 text-[10px] font-bold',
              unlocked ? 'text-[#557e60]' : 'text-[#8d8771]',
            )}
          >
            {unlocked ? <Check className="size-3" /> : <LockKeyhole className="size-3" />}
            {unlocked ? 'Desbloqueado' : 'Bloqueado'}
          </p>
          <h3 className="break-words text-sm font-bold leading-5">{resource.title}</h3>
          <p className={cn('mt-2 text-xs leading-5 text-muted-foreground', unlocked && 'line-clamp-3')}>
            {unlocked ? resource.summary : requirement.text}
          </p>
        </div>
      </button>
      <div className="mt-auto px-4 pb-4">
        {unlocked ? (
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-bold text-[#52775c] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onOpen}
          >
            {resource.kind === 'sheet'
              ? 'Ver ficha completa'
              : resource.kind === 'interview'
                ? 'Ver entrevista'
                : 'Ver testimonio'}
            <ChevronRight className="size-3.5" />
          </button>
        ) : (
          <button
            type="button"
            className="text-left text-[11px] font-semibold text-[#7c7359] underline decoration-[#b9b097] underline-offset-4 hover:text-[#304b3d]"
            onClick={onRequirement}
          >
            {requirement.label}
          </button>
        )}
      </div>
      {unlocked && (
        <button
          className={cn(
            'absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            saved ? 'bg-[#f8e8ad] text-[#936a1c]' : 'bg-white/60 text-[#8b8b71] hover:bg-[#f8e8ad]',
          )}
          type="button"
          title={saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-label={`${saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}: ${resource.title}`}
          aria-pressed={saved}
          onClick={onFavorite}
        >
          <Star className={cn('size-4', saved && 'fill-current')} />
        </button>
      )}
    </article>
  )
}

function ResourceContent({ resource }: { resource: TravelResource }) {
  const videoUrl = youtubeEmbedUrl(resource.url)
  const fileUrl = resourceFileUrl(resource.url)
  const isPdf = fileUrl && (resource.fileFormat === 'pdf' || /\.pdf(?:[?#]|$)/i.test(fileUrl))
  const placeholderUrl = fileUrl && /^https:\/\/example\.com(?:\/|$)/.test(fileUrl)
  return (
    <div className="space-y-5">
      {resource.kind === 'sheet' ? (
        <>
          {resource.content && <ResourceText text={resource.content} />}
          {isPdf && (
            <iframe
              src={fileUrl}
              title={`PDF: ${resource.title}`}
              className="h-[55vh] w-full rounded-xl border bg-white"
            />
          )}
          {fileUrl && (
            <Button asChild variant="outline">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                <FileText />
                {isPdf
                  ? 'Abrir PDF en otra pestaña'
                  : resource.fileFormat === 'archivo'
                    ? 'Abrir archivo'
                    : 'Abrir fuente del recurso'}
                <ExternalLink />
              </a>
            </Button>
          )}
          {!resource.content && !fileUrl && (
            <p className="rounded-xl bg-[#f4f3e8] p-4 text-sm">
              El contenido de esta ficha estará disponible próximamente.
            </p>
          )}
        </>
      ) : (
        <>
          {videoUrl ? (
            <div className="aspect-video overflow-hidden rounded-2xl bg-black">
              <iframe
                className="size-full"
                src={videoUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-[#d9dbc8] bg-[#f0f1e4] p-6 text-center">
              <div>
                <MessageSquareQuote className="mx-auto size-10 text-[#809477]" />
                <p className="mt-4 text-sm font-semibold">
                  {!fileUrl || placeholderUrl
                    ? 'El video de esta entrevista está pendiente'
                    : 'Esta entrevista se abre desde su enlace original'}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {!fileUrl || placeholderUrl
                    ? 'Puedes leer el resumen compartido mientras se incorpora su enlace.'
                    : 'Abre el enlace para visualizar el contenido compartido.'}
                </p>
              </div>
            </div>
          )}
          {fileUrl && !placeholderUrl && (
            <Button asChild variant="outline">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                {videoUrl ? 'Ver en YouTube' : 'Abrir entrevista'}
                <ExternalLink />
              </a>
            </Button>
          )}
        </>
      )}
    </div>
  )
}

export { AdventureResourcesView }
