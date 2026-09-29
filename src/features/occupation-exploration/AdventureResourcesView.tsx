import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CircleCheck,
  CircleDotDashed,
  CircleHelp,
  Clock3,
  ExternalLink,
  Crown,
  Compass,
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
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { resourceDemoNotices, resourceDemoVideos } from './data/AdventureData'
import { safeVideoUrl, updateAdventure, useAdventure } from './lib/AdventureStore'
import type { AdventureNotice, AdventureState } from './types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import { ResourceText } from '../missions/JourneyContent'
import { catalog } from '../missions/content'
import type { Recurso } from '../missions/model'
import { useJourney } from '../missions/store'
import '../missions/journey.css'

type Tab = 'discoveries' | 'posts' | 'events' | 'community'
type ResourceMeta = {
  topic: string
  minutes: number
  url: string
  organizer?: string
  modality?: string
  content?: string[]
}
const metadata: Record<string, ResourceMeta> = {
  'changing-work': {
    topic: 'Mundo laboral',
    minutes: 4,
    url: 'https://www.ilo.org/es/temas/empleo',
    content: [
      'El mundo del trabajo cambia, pero no todas las novedades significan que una profesión desaparece. Muchas veces cambian las herramientas, las tareas y los equipos con los que se trabaja.',
      'Lee esta publicación pensando en una pregunta: ¿qué habilidades te gustaría seguir desarrollando sin importar la ruta que elijas? La curiosidad, la comunicación y aprender a aprender aparecen una y otra vez.',
    ],
  },
  'ask-before-choosing': {
    topic: 'Decisiones',
    minutes: 3,
    url: 'https://www.minedu.gob.pe/',
    content: [
      'Elegir no es adivinar el futuro; es hacer buenas preguntas y reunir pistas. Una conversación, una visita o una entrevista pueden mostrarte aspectos que no aparecen en un nombre de carrera.',
      'Puedes anotar las preguntas que más te sirvan y llevarlas a tu siguiente conversación con alguien que trabaje en un área que te interese.',
    ],
  },
  'scholarships-update': {
    topic: 'Formación',
    minutes: 2,
    url: 'https://www.pronabec.gob.pe/',
    content: [
      'Aparecieron nuevas sesiones informativas para entender las alternativas de financiamiento. No necesitas decidir nada hoy: esta es una oportunidad para conocer requisitos, fechas y fuentes confiables.',
      'Si algo no se entiende, anota la pregunta y llévala a orientación o a la sesión informativa.',
    ],
  },
  'future-fair': {
    topic: 'Exploración',
    minutes: 2,
    url: 'https://www.gob.pe/minedu',
    organizer: 'Red local de orientación',
    modality: 'Presencial · ingreso libre',
    content: [
      'En esta feria podrás conversar con instituciones, profesionales y estudiantes. No tienes que llegar con una decisión tomada: llegar con curiosidad y dos o tres preguntas es suficiente.',
      'Te recomendamos recorrer más de un stand y comparar lo que escuchas. A veces una pregunta nueva vale más que una respuesta rápida.',
    ],
  },
  'career-route-forum': {
    topic: 'Decisiones',
    minutes: 2,
    url: 'https://www.gob.pe/minedu',
    organizer: 'Orientación vocacional del colegio',
    modality: 'Presencial · actividad realizada',
    content: [
      'En este foro, egresados y estudiantes compartieron cómo fueron tomando decisiones al terminar el colegio. Hubo rutas universitarias, técnicas y experiencias de emprendimiento.',
      'La idea no era encontrar una ruta correcta para todas las personas, sino escuchar qué preguntas, apoyos y experiencias ayudaron a cada participante.',
    ],
  },
  'science-lab-visit': {
    topic: 'Ciencia',
    minutes: 2,
    url: 'https://www.gob.pe/minedu',
    organizer: 'Centro de ciencias aplicadas',
    modality: 'Presencial · actividad realizada',
    content: [
      'La visita mostró experiencias prácticas de química, biología y tecnología. Las estaciones estuvieron abiertas para que cada estudiante pudiera hacer preguntas a los equipos del laboratorio.',
      'Aunque no hayas marcado interés antes, puedes registrar si asististe y lo que descubriste.',
    ],
  },
  'design-open-house': {
    topic: 'Creatividad',
    minutes: 2,
    url: 'https://www.gob.pe/minedu',
    organizer: 'Instituto de Diseño del Sur',
    modality: 'Presencial · cupos limitados',
    content: [
      'Visita los talleres y prueba pequeñas experiencias de animación, diseño y desarrollo web. Conocer los espacios y conversar con estudiantes ayuda a imaginar cómo podría ser aprender allí.',
      'Recuerda preguntar por proyectos reales, cursos iniciales y las diferentes especialidades que ofrece la institución.',
    ],
  },
  'financial-aid-workshop': {
    topic: 'Formación',
    minutes: 2,
    url: 'https://www.pronabec.gob.pe/',
    organizer: 'Equipo de orientación y Pronabec',
    modality: 'Híbrido · gratuito',
    content: [
      'Este taller explica con ejemplos cómo se organizan las becas, los requisitos y los cronogramas. Puedes asistir aunque todavía estés explorando alternativas de estudio.',
      'Trae preguntas sobre fechas, documentos y las opciones que podrían acompañar tu propia ruta de formación.',
    ],
  },
}
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
const legendVideos: AdventureState['videos'] = [
  {
    id: 'legend-community-health',
    title: 'Cuidar también es prevenir y escuchar',
    alias: 'Luna y Tilo · Salón 2025',
    url: 'https://example.com/salud-comunitaria',
    reflection:
      'Entrevistaron a una enfermera comunitaria y descubrieron que su trabajo conecta educación, prevención y acompañamiento a las familias.',
    createdAt: '2025-11-18T16:00:00.000Z',
  },
  {
    id: 'legend-animation',
    title: 'De una idea a un personaje en movimiento',
    alias: 'Mar · Salón 2024',
    url: 'https://example.com/animacion-digital',
    reflection:
      'Conversaron con un animador digital sobre creatividad, práctica constante y la importancia de construir proyectos en equipo.',
    createdAt: '2024-10-09T17:00:00.000Z',
  },
]

function AdventureResourcesView() {
  const state = useAdventure()
  const journey = useJourney()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('discoveries')
  const [communityTab, setCommunityTab] = useState<'classroom' | 'legends'>('classroom')
  const [topic, setTopic] = useState('Todos')
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [seenFilter, setSeenFilter] = useState<'all' | 'seen' | 'unseen'>('all')
  const [selectedInterview, setSelectedInterview] = useState<AdventureState['videos'][number] | null>(null)
  const [selectedResource, setSelectedResource] = useState<AdventureNotice | null>(null)
  const [selectedDiscovery, setSelectedDiscovery] = useState<Recurso | null>(null)
  const [readPrompt, setReadPrompt] = useState<AdventureNotice | null>(null)
  const [reporting, setReporting] = useState<string | null>(null)
  const notices = useMemo(() => {
    const map = new Map<string, AdventureNotice>(
      resourceDemoNotices.map((item) => [item.id, { ...item, attendees: [...item.attendees] }]),
    )
    state.notices.forEach((item) => map.set(item.id, item))
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date))
  }, [state.notices])
  const posts = notices.filter((item) => item.kind !== 'event')
  const events = notices.filter((item) => item.kind === 'event')
  const videos = useMemo(() => {
    const map = new Map<string, AdventureState['videos'][number]>(
      resourceDemoVideos.map((item) => [item.id, { ...item }]),
    )
    state.videos.forEach((item) => map.set(item.id, item))
    return [...map.values()]
      .filter(
        (video) => !state.reports.some((report) => report.postId === video.id && report.status === 'hidden'),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [state.reports, state.videos])
  const topics = ['Todos', ...new Set(posts.map((post) => metadata[post.id]?.topic ?? 'Actualidad'))]
  const matches = (title: string) => title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  const hasStatus = (id: string) =>
    seenFilter === 'all' || (seenFilter === 'seen') === state.visits.includes(id)
  const visiblePosts = posts.filter(
    (post) =>
      (topic === 'Todos' || (metadata[post.id]?.topic ?? 'Actualidad') === topic) &&
      (!favoritesOnly || state.bookmarks.includes(post.id)) &&
      hasStatus(post.id) &&
      matches(post.title),
  )
  const visibleEvents = events.filter(
    (event) =>
      (!favoritesOnly || state.bookmarks.includes(event.id)) && hasStatus(event.id) && matches(event.title),
  )
  const discoveries = journey.resources
    .map((id) => catalog.recursos.find((resource) => resource.id === id))
    .filter((resource): resource is Recurso => !!resource)
  const visibleDiscoveries = discoveries.filter(
    (resource) => (!favoritesOnly || state.bookmarks.includes(resource.id)) && matches(resource.titulo),
  )
  const suggestions = [...posts, ...events].filter((item) => !state.bookmarks.includes(item.id)).slice(0, 3)
  const communityVideos =
    communityTab === 'classroom'
      ? videos
      : [...videos.filter((video) => legendIds.has(video.id)), ...legendVideos]

  useEffect(() => {
    const onFocus = () => {
      const pending = sessionStorage.getItem('ov.pending-resource')
      if (!pending) return
      sessionStorage.removeItem('ov.pending-resource')
      const item = notices.find((notice) => notice.id === pending)
      if (item) setReadPrompt(item)
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [notices])
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
  const openResource = (item: AdventureNotice) => {
    const url = metadata[item.id]?.url
    if (!url) return
    sessionStorage.setItem('ov.pending-resource', item.id)
    markSeen(item.id)
    window.open(url, '_blank', 'noopener,noreferrer')
  }
  const eventPast = (item: AdventureNotice) => new Date(item.date + 'T23:59:59').getTime() < Date.now()
  const recordEventOutcome = (item: AdventureNotice, outcome: 'attended' | 'missed') => {
    updateAdventure((current) => ({
      ...current,
      eventAttendance: { ...current.eventAttendance, [item.id]: outcome },
      bookmarks:
        outcome === 'attended' && !current.bookmarks.includes(item.id)
          ? [...current.bookmarks, item.id]
          : current.bookmarks,
    }))
    navigate(appPaths.student.journal + '?event=' + encodeURIComponent(item.title) + '&outcome=' + outcome)
  }
  const react = (videoId: string, label: string) =>
    updateAdventure((current) => ({
      ...current,
      reactions: current.reactions.some((item) => item.videoId === videoId && item.kind === label)
        ? current.reactions.filter((item) => !(item.videoId === videoId && item.kind === label))
        : [...current.reactions, { videoId, kind: label, createdAt: new Date().toISOString() }],
    }))
  if (selectedInterview) {
    return (
      <>
        <InterviewDetail
          video={selectedInterview}
          reaction={state.reactions.find((item) => item.videoId === selectedInterview.id)}
          onBack={() => setSelectedInterview(null)}
          onReact={(option) => react(selectedInterview.id, option.label)}
          onReport={() => setReporting(selectedInterview.id)}
        />
        {reporting && <ReportModal videoId={reporting} onClose={() => setReporting(null)} />}
      </>
    )
  }
  if (selectedDiscovery) {
    return (
      <DiscoveryDetail
        resource={selectedDiscovery}
        saved={state.bookmarks.includes(selectedDiscovery.id)}
        onBack={() => setSelectedDiscovery(null)}
        onFavorite={() => toggleBookmark(selectedDiscovery.id)}
      />
    )
  }
  if (selectedResource) {
    const item = notices.find((notice) => notice.id === selectedResource.id) ?? selectedResource
    return (
      <>
        <ResourceDetail
          item={item}
          saved={state.bookmarks.includes(item.id)}
          past={eventPast(item)}
          interested={state.bookmarks.includes(item.id)}
          outcome={state.eventAttendance[item.id]}
          onBack={() => setSelectedResource(null)}
          onFavorite={() => toggleBookmark(item.id)}
          onExternal={() => openResource(item)}
          onEventOutcome={recordEventOutcome}
        />
        {readPrompt && (
          <FavoritePrompt
            item={readPrompt}
            onFavorite={() => {
              toggleBookmark(readPrompt.id)
              setReadPrompt(null)
            }}
            onClose={() => setReadPrompt(null)}
          />
        )}
      </>
    )
  }

  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <p className="adventure-eyebrow">PUBLICACIONES PARA SEGUIR EXPLORANDO</p>
      <h1 className="mt-2 text-3xl font-bold">Recursos y novedades</h1>
      <p className="mb-6 mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
        Tus descubrimientos de la aventura, lo que comparte tu orientadora, los eventos que puedes vivir y las
        entrevistas de la comunidad.
      </p>
      <section className="mb-8 rounded-3xl border border-[#dce8db] bg-[#eef5ea] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-5 text-[#557e60]" />
          <h2 className="font-bold">Te podría interesar</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                markSeen(item.id)
                setSelectedResource(item)
              }}
              className="rounded-2xl bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5"
            >
              <p className="text-xs font-semibold text-[#557e60]">
                {item.kind === 'event' ? 'Evento' : (metadata[item.id]?.topic ?? 'Publicación')}
              </p>
              <p className="mt-1 text-sm font-bold">{item.title}</p>
            </button>
          ))}
        </div>
      </section>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Secciones de recursos">
        {[
          { id: 'discoveries' as const, label: 'Descubrimientos', icon: Compass },
          { id: 'posts' as const, label: 'Publicaciones', icon: BookOpen },
          { id: 'events' as const, label: 'Eventos', icon: CalendarDays },
          { id: 'community' as const, label: 'Comunidad', icon: Users },
        ].map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? 'default' : 'outline'}
            onClick={() => setTab(item.id)}
          >
            <item.icon />
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="mb-6 flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm lg:flex-row lg:items-center">
        <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-muted-foreground">
          <Search className="size-5" />
          <span className="sr-only">Buscar por título</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar descubrimientos, publicaciones, eventos o entrevistas..."
          />
        </label>
        {tab !== 'discoveries' && (
          <div
            className="flex flex-wrap items-center gap-1 border-t p-2 lg:border-l lg:border-t-0"
            role="group"
            aria-label="Filtrar por estado de lectura"
          >
            {[
              { id: 'all' as const, label: 'Todos' },
              { id: 'unseen' as const, label: 'No vistos' },
              { id: 'seen' as const, label: 'Vistos' },
            ].map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={seenFilter === filter.id ? 'secondary' : 'ghost'}
                onClick={() => setSeenFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        )}
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
      {tab === 'discoveries' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleDiscoveries.map((resource) => (
            <DiscoveryCard
              key={resource.id}
              resource={resource}
              saved={state.bookmarks.includes(resource.id)}
              onOpen={setSelectedDiscovery}
              onSave={toggleBookmark}
            />
          ))}
          {!visibleDiscoveries.length && (
            <div className="adventure-card col-span-full p-10 text-center">
              <Compass className="mx-auto size-9 text-[#66806a]" />
              <h2 className="mt-4 font-bold">
                {discoveries.length
                  ? 'No encontramos descubrimientos con esos filtros'
                  : 'Tu mochila está lista'}
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {discoveries.length
                  ? 'Prueba otra búsqueda o muestra todos tus favoritos.'
                  : 'Las fichas y materiales que desbloquees durante la aventura aparecerán aquí.'}
              </p>
            </div>
          )}
        </div>
      )}
      {tab === 'posts' && (
        <>
          <div className="mb-5 flex flex-wrap gap-2" aria-label="Filtrar publicaciones por tema">
            {topics.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={topic === item ? 'secondary' : 'outline'}
                onClick={() => setTopic(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {visiblePosts.map((item) => (
              <PublicationCard
                key={item.id}
                item={item}
                saved={state.bookmarks.includes(item.id)}
                seen={state.visits.includes(item.id)}
                onOpen={(resource) => {
                  markSeen(resource.id)
                  setSelectedResource(resource)
                }}
                onSave={toggleBookmark}
              />
            ))}
          </div>
        </>
      )}
      {tab === 'events' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleEvents.map((item) => (
            <EventCard
              key={item.id}
              item={item}
              saved={state.bookmarks.includes(item.id)}
              seen={state.visits.includes(item.id)}
              past={eventPast(item)}
              outcome={state.eventAttendance[item.id]}
              onOpen={(resource) => {
                markSeen(resource.id)
                setSelectedResource(resource)
              }}
              onSave={toggleBookmark}
            />
          ))}
        </div>
      )}
      {tab === 'community' && (
        <>
          <div
            className="mb-5 inline-flex rounded-xl border bg-white p-1"
            role="group"
            aria-label="Secciones de comunidad"
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
            {communityVideos
              .filter(
                (video) =>
                  (!favoritesOnly || state.bookmarks.includes(video.id)) &&
                  hasStatus(video.id) &&
                  matches(video.title),
              )
              .map((video) => {
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
                        <Badge variant={state.visits.includes(video.id) ? 'success' : 'outline'}>
                          {state.visits.includes(video.id) ? (
                            <CircleCheck className="size-3.5" />
                          ) : (
                            <CircleDotDashed className="size-3.5" />
                          )}
                          {state.visits.includes(video.id) ? 'Visto' : 'No visto'}
                        </Badge>
                      </div>
                      <h2 className="mt-4 text-xl font-bold">{video.title}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Por {video.alias} · {interviewDetails[video.id]?.career ?? 'Entrevista profesional'}
                      </p>
                      <p className="my-4 line-clamp-3 text-sm leading-7">{video.reflection}</p>
                      <div className="mt-auto">
                        {state.bookmarks.includes(video.id) && (
                          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#fff2bf] px-3 py-1.5 text-xs font-bold text-[#755414]">
                            <Star className="size-4 fill-current" />
                            {(interviewDetails[video.id]?.comments.length ?? 0) + 2} personas la marcaron como
                            favorita
                          </div>
                        )}
                        {selected && (
                          <p className="mb-4 text-xs font-medium text-[#52664b]">
                            <MessageCircle className="mr-1 inline size-4" />
                            Ya dejaste una reacción
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 border-t pt-4">
                        <Button
                          onClick={() => {
                            markSeen(video.id)
                            setSelectedInterview(video)
                          }}
                        >
                          Ver entrevista
                        </Button>
                        <Button variant="outline" onClick={() => toggleBookmark(video.id)}>
                          <Star className={state.bookmarks.includes(video.id) ? 'fill-current' : ''} />
                          {state.bookmarks.includes(video.id) ? 'Quitar favorito' : 'Agregar a favoritos'}
                        </Button>
                      </div>
                    </div>
                  </article>
                )
              })}
            {!communityVideos.length && (
              <div className="adventure-card col-span-full p-10 text-center text-sm text-muted-foreground">
                Las entrevistas de la comunidad aparecerán aquí.
              </div>
            )}
          </div>
        </>
      )}
      {readPrompt && (
        <FavoritePrompt
          item={readPrompt}
          onFavorite={() => {
            toggleBookmark(readPrompt.id)
            setReadPrompt(null)
          }}
          onClose={() => setReadPrompt(null)}
        />
      )}
      {reporting && <ReportModal videoId={reporting} onClose={() => setReporting(null)} />}
    </div>
  )
}

function resourceTypeLabel(resource: Recurso) {
  return {
    ficha: 'Ficha',
    lectura: 'Lectura',
    video: 'Video',
    enlace: 'Enlace',
    audio: 'Audio',
  }[resource.tipo]
}

function discoveryTitle(resource: Recurso) {
  return resource.titulo.startsWith('[') ? 'Video: testimonios que rompen mitos' : resource.titulo
}

function DiscoveryCard({
  resource,
  saved,
  onOpen,
  onSave,
}: {
  resource: Recurso
  saved: boolean
  onOpen: (resource: Recurso) => void
  onSave: (id: string) => void
}) {
  return (
    <article className="adventure-card flex h-full flex-col overflow-hidden p-0">
      <div className="grid h-28 place-items-center bg-gradient-to-br from-[#dcebdd] via-[#f5efd9] to-[#e2edf3]">
        <Compass className="size-9 text-[#55745b]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            <Sparkles className="size-3.5" /> {resourceTypeLabel(resource)} descubierta
          </Badge>
        </div>
        <h2 className="mt-4 text-xl font-bold">{discoveryTitle(resource)}</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          {resource.fuente ? `Fuente: ${resource.fuente}` : 'Hallazgo de tu aventura'}
        </p>
        <p className="my-4 line-clamp-3 text-sm leading-7">
          {resource.contenido
            ? resource.contenido.replace(/[#*|]/g, '').replace(/\n+/g, ' ').slice(0, 220)
            : 'Este material quedó disponible durante tu recorrido y puedes volver a consultarlo cuando quieras.'}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
          <Button onClick={() => onOpen(resource)}>Ver ficha completa</Button>
          <Button variant="outline" onClick={() => onSave(resource.id)}>
            <Star className={saved ? 'fill-current' : ''} />
            {saved ? 'Quitar favorito' : 'Agregar a favoritos'}
          </Button>
        </div>
      </div>
    </article>
  )
}

function DiscoveryDetail({
  resource,
  saved,
  onBack,
  onFavorite,
}: {
  resource: Recurso
  saved: boolean
  onBack: () => void
  onFavorite: () => void
}) {
  const external = resource.url && /^https?:\/\//.test(resource.url)
  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft /> Volver a Descubrimientos
      </Button>
      <article className="mx-auto mt-5 max-w-6xl">
        <header className="rounded-t-3xl bg-gradient-to-br from-[#dcebdd] via-[#f7f2df] to-[#e2eff4] p-7 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="secondary">
                <Sparkles className="size-3.5" /> {resourceTypeLabel(resource)} descubierta
              </Badge>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{discoveryTitle(resource)}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {resource.fuente ? `Fuente: ${resource.fuente}` : 'Desbloqueada durante tu aventura'}
              </p>
            </div>
            <Button variant="outline" onClick={onFavorite}>
              <Star className={saved ? 'fill-current' : ''} />
              {saved ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            </Button>
          </div>
        </header>
        <div className="rounded-b-3xl bg-white p-7 shadow-sm sm:p-10">
          {resource.contenido ? (
            <ResourceText text={resource.contenido} />
          ) : (
            <p className="text-sm leading-7 text-muted-foreground">
              {external
                ? 'Este descubrimiento está disponible en una fuente externa.'
                : 'Orientación está preparando el contenido completo de este material.'}
            </p>
          )}
          {external && (
            <Button className="mt-8" asChild>
              <a href={resource.url} target="_blank" rel="noreferrer">
                Abrir recurso original <ExternalLink />
              </a>
            </Button>
          )}
        </div>
      </article>
    </div>
  )
}

function PublicationCard({
  item,
  saved,
  seen,
  onOpen,
  onSave,
}: {
  item: AdventureNotice
  saved: boolean
  seen: boolean
  onOpen: (item: AdventureNotice) => void
  onSave: (id: string) => void
}) {
  const meta = metadata[item.id] ?? { topic: 'Actualidad', minutes: 3, url: '' }
  return (
    <article className="adventure-card flex h-full flex-col overflow-hidden p-0">
      <div className="grid h-28 place-items-center bg-gradient-to-br from-[#e4efdf] to-[#f6efd8]">
        <Lightbulb className="size-9 text-[#58785a]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{meta.topic} · Publicación</Badge>
          <Badge variant={seen ? 'success' : 'outline'}>
            {seen ? <CircleCheck className="size-3.5" /> : <CircleDotDashed className="size-3.5" />}
            {seen ? 'Visto' : 'No visto'}
          </Badge>
        </div>
        <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Por tu orientadora · {meta.minutes} min de lectura
        </p>
        <p className="my-4 line-clamp-3 text-sm leading-7">{item.body}</p>
        <div className="mt-auto">
          {saved && (
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#fff2bf] px-3 py-1.5 text-xs font-bold text-[#755414]">
              <Star className="size-4 fill-current" />3 personas lo marcaron como favorito
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button onClick={() => onOpen(item)}>Ver publicación</Button>
          <Button variant="outline" onClick={() => onSave(item.id)}>
            <Star className={saved ? 'fill-current' : ''} />
            {saved ? 'Quitar favorito' : 'Agregar a favoritos'}
          </Button>
        </div>
      </div>
    </article>
  )
}
function EventCard({
  item,
  saved,
  seen,
  past,
  outcome,
  onOpen,
  onSave,
}: {
  item: AdventureNotice
  saved: boolean
  seen: boolean
  past: boolean
  outcome?: 'attended' | 'missed'
  onOpen: (item: AdventureNotice) => void
  onSave: (id: string) => void
}) {
  const meta = metadata[item.id] ?? { topic: 'Evento', minutes: 2, url: '' }
  const status = !past
    ? { icon: Clock3, text: 'Aún no llega', variant: 'outline' as const }
    : outcome
      ? {
          icon: CircleCheck,
          text: outcome === 'attended' ? 'Asististe' : 'No asististe',
          variant: 'success' as const,
        }
      : saved
        ? { icon: CircleHelp, text: 'Confirma tu asistencia', variant: 'warning' as const }
        : { icon: CircleCheck, text: 'Evento finalizado', variant: 'secondary' as const }
  const StatusIcon = status.icon
  return (
    <article className="adventure-card flex h-full flex-col overflow-hidden p-0">
      <div className="grid h-28 place-items-center bg-gradient-to-br from-[#e2edf3] to-[#f5ead9]">
        <CalendarDays className="size-9 text-[#507789]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{meta.topic} · Evento</Badge>
          <Badge variant={seen ? 'success' : 'outline'}>
            {seen ? <CircleCheck className="size-3.5" /> : <CircleDotDashed className="size-3.5" />}
            {seen ? 'Visto' : 'No visto'}
          </Badge>
          <Badge variant={status.variant}>
            <StatusIcon className="size-3.5" />
            {status.text}
          </Badge>
        </div>
        <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {new Date(item.date + 'T12:00:00').toLocaleDateString('es-PE', { dateStyle: 'long' })} ·{' '}
          {meta.organizer ?? 'Orientación'}
        </p>
        <p className="my-4 line-clamp-3 text-sm leading-7">{item.body}</p>
        <div className="mt-auto">
          {saved && (
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#f8f1d9] px-3 py-1.5 text-xs font-bold text-[#765516]">
              <Users className="size-4" />
              {item.attendees.length} personas lo marcaron como interesante
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button onClick={() => onOpen(item)}>Ver evento</Button>
          {!past && (
            <Button variant="outline" onClick={() => onSave(item.id)}>
              <Star className={saved ? 'fill-current' : ''} />
              {saved ? 'Ya me interesa' : 'Me interesa'}
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
function ResourceDetail({
  item,
  saved,
  past,
  interested,
  outcome,
  onBack,
  onFavorite,
  onExternal,
  onEventOutcome,
  previewMode = false,
  metaOverride,
}: {
  item: AdventureNotice
  saved: boolean
  past: boolean
  interested: boolean
  outcome?: 'attended' | 'missed'
  onBack: () => void
  onFavorite: () => void
  onExternal: () => void
  onEventOutcome: (item: AdventureNotice, outcome: 'attended' | 'missed') => void
  previewMode?: boolean
  metaOverride?: Partial<ResourceMeta>
}) {
  const meta = { ...(metadata[item.id] ?? { topic: 'Actualidad', minutes: 3, url: '' }), ...metaOverride }
  const isEvent = item.kind === 'event'
  const content = meta.content ?? [item.body]
  return (
    <div className="adventure-page min-h-full p-4 sm:p-8">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft /> Volver a {isEvent ? 'Eventos' : 'Publicaciones'}
      </Button>
      <article className="mx-auto mt-5 max-w-6xl">
        <header className="rounded-t-3xl bg-gradient-to-br from-[#e3f0df] via-[#f7f2df] to-[#e2eff4] p-7 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="secondary">{meta.topic}</Badge>
              <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{item.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                {isEvent
                  ? 'Evento publicado por tu orientadora'
                  : meta.minutes + ' min de lectura · Publicado por tu orientadora'}
              </p>
            </div>
            {!previewMode && <Button variant="outline" onClick={onFavorite}>
              <Star className={saved ? 'fill-current' : ''} />
              {isEvent
                ? saved
                  ? 'Ya me interesa'
                  : 'Me interesa'
                : saved
                  ? 'En favoritos'
                  : 'Agregar a favoritos'}
            </Button>}
          </div>
          {isEvent && (
            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4">
                <b>Fecha</b>
                <br />
                {new Date(item.date + 'T12:00:00').toLocaleDateString('es-PE', { dateStyle: 'long' })}
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <b>Organiza</b>
                <br />
                {meta.organizer ?? 'Orientación'}
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <b>Modalidad</b>
                <br />
                {meta.modality ?? 'Consulta detalles'}
              </div>
            </div>
          )}
        </header>
        <div className={`grid gap-8 rounded-b-3xl bg-white p-7 shadow-sm sm:p-10 ${meta.url ? 'lg:grid-cols-[minmax(0,1fr)_18rem]' : ''}`}>
          <div className="space-y-5 text-[1.02rem] leading-8">
            {content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          {meta.url && <aside className="h-fit space-y-4">
            <div className="rounded-2xl border bg-[#fafbf8] p-5">
              <p className="text-sm font-semibold">Enlace principal</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Abre el recurso externo recomendado por tu orientadora.
              </p>
              <Button className="mt-4 w-full" onClick={onExternal}>
                Abrir recurso <ExternalLink />
              </Button>
            </div>
            {!previewMode && isEvent && past && !outcome && (
              <div className="rounded-2xl border border-[#ead79c] bg-[#fff9e7] p-5">
                <h2 className="font-bold">{interested ? '¿Asististe al evento?' : '¿Fuiste al evento?'}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {interested
                    ? 'Cuéntanos qué pasó para cerrar tu registro de interés.'
                    : 'Aunque no lo marcaras antes, puedes registrar tu experiencia si fuiste.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onEventOutcome(item, 'attended')}>
                    Sí, asistí
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEventOutcome(item, 'missed')}>
                    No asistí
                  </Button>
                </div>
              </div>
            )}
            {!previewMode && isEvent && outcome && (
              <div className="rounded-2xl bg-[#edf5e9] p-5 text-sm leading-6">
                <b>
                  {outcome === 'attended' ? 'Registraste que asististe.' : 'Registraste que no asististe.'}
                </b>
                <br />
                Tu respuesta quedó guardada.
              </div>
            )}
          </aside>}
        </div>
      </article>
    </div>
  )
}
function FavoritePrompt({
  item,
  onFavorite,
  onClose,
}: {
  item: AdventureNotice
  onFavorite: () => void
  onClose: () => void
}) {
  return (
    <Modal title="¿Quieres guardar este recurso como favorito?" onClose={onClose}>
      <p className="text-sm leading-6">
        Podrás encontrar “{item.title}” rápidamente desde el filtro de favoritos.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onFavorite}>
          <Star />
          Guardar como favorito
        </Button>
        <Button variant="outline" onClick={onClose}>
          Ahora no
        </Button>
      </div>
    </Modal>
  )
}
function InterviewDetail({
  video,
  reaction,
  onBack,
  onReact,
  onReport,
  readOnly = false,
  backLabel = 'Comunidad',
}: {
  video: AdventureState['videos'][number]
  reaction?: AdventureState['reactions'][number]
  onBack: () => void
  onReact: (option: (typeof reactionOptions)[number]) => void
  onReport: () => void
  readOnly?: boolean
  backLabel?: string
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
              <Badge variant="success">
                <Check className="size-3.5" /> Consentimiento confirmado
              </Badge>
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
          {!readOnly && <section className="adventure-card p-6">
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
                <MessageCircle className="size-5" /> Conversación de la comunidad
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
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={onReport}>
                <Flag /> ¿Algo no está bien? Reportar
              </Button>
            </div>
          </section>}
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
      reports: [
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
    <Modal title="Reportar esta publicación" onClose={onClose}>
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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <section className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-3 top-3"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <X />
        </Button>
        <h2 className="pr-8 text-xl font-bold">{title}</h2>
        <div className="mt-3">{children}</div>
      </section>
    </div>
  )
}
export { AdventureResourcesView, InterviewDetail, ResourceDetail }
