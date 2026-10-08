import { useBackpack } from '@/features/backpack/hooks/useBackpack'

import { appPaths } from '@/routes/paths'

import { Backpack, BookOpen, Check, Compass, ExternalLink, FileText, Flame, Languages, LockKeyhole, MessageSquareQuote, Play, ScrollText, Search, Sparkles, Star, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { BackpackViewerFrame as DialogContent } from '@/features/backpack/components/BackpackViewerFrame'
import { ResourceText } from '@/features/activities/components/JourneyContent'

import { activities } from '@/data/activities/content'

import { resourceFileUrl, youtubeEmbedUrl, type TravelResource } from '@/features/backpack/lib/travelerResources'
import { studentResourceRequirement as resourceRequirement } from '@/features/backpack/lib/challengeResources'
import { cityCases } from '@/data/content/adventure'
import { DiscoveryStage } from '@/features/discovery/components/DiscoveryStage'
import { Parchment } from '@/components/student/Parchment'
import { TrailBar } from '@/components/student/TrailBar'
import { FavoriteButton } from '@/components/student/FavoriteButton'

import '@/styles/student/journey.css'
import '@/styles/student/resources.css'
import '@/features/backpack/styles/backpack.css'

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
const kinds = [
  { id: 'all', label: 'Todo' },
  { id: 'sheet', label: 'Fichas' },
  { id: 'testimonial', label: 'Testimonios' },
] as const

function StudentBackpackView() {
  const { adventure, journey, navigate, kind, tabs, query, setQuery, favoritesOnly, setFavoritesOnly,
    selected, setSelectedId, requisitoId, setRequisitoId, requisito, requisitoPendiente, errorRequisito,
    setIntentoRequisito, mostrarRequisito, isUnlocked, visible, sheets, voices, cityPoints,
    chooseKind, toggleFavorite, openResource, clear, consultarRequisito, marcarLeida } = useBackpack()

  return (
    <DiscoveryStage ambient="backpack">
      <header className="sx-d-header">
        <div>
          <p className="sx-d-eyebrow">Provisiones para tu aventura</p>
          <h1>Tu mochila de viaje</h1>
          <p>
            Cada paso deja una nueva pista. Reúne fichas y voces de la ciudad, y guarda las que quieras tener
            a mano cuando armes tus planes.
          </p>
        </div>
        <div className="sx-b-summary">
          <Backpack aria-hidden="true" size={40} />
          <div>
            <h2>Compartimentos</h2>
            <TrailBar
              label="Fichas"
              value={sheets.length ? (sheets.filter(isUnlocked).length / sheets.length) * 100 : 0}
              text={`${sheets.filter(isUnlocked).length} de ${sheets.length}`}
            />
            <TrailBar
              label="Voces de la ciudad"
              value={voices.length ? (voices.filter(isUnlocked).length / voices.length) * 100 : 0}
              text={`${voices.filter(isUnlocked).length} de ${voices.length}`}
              muted
            />
          </div>
        </div>
      </header>
      <section aria-label="Mi mochila">
        <div className="sx-b-controls">
          <div className="sx-b-tabs" role="tablist" aria-label="Tipo de recurso">
            {kinds.map((item, i) => (
              <button
                key={item.id}
                ref={(node) => {
                  tabs.current[i] = node
                }}
                type="button"
                id={`sx-backpack-tab-${item.id}`}
                role="tab"
                aria-selected={kind === item.id}
                tabIndex={kind === item.id ? 0 : -1}
                aria-controls="sx-backpack-compartments"
                onClick={() => chooseKind(item.id)}
                onKeyDown={(event) => {
                  let index = i
                  if (event.key === 'ArrowRight') index = (i + 1) % kinds.length
                  else if (event.key === 'ArrowLeft') index = (i + kinds.length - 1) % kinds.length
                  else if (event.key === 'Home') index = 0
                  else if (event.key === 'End') index = kinds.length - 1
                  else return
                  event.preventDefault()
                  chooseKind(kinds[index].id)
                  tabs.current[index]?.focus()
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="sx-b-search">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">Buscar recursos</span>
            <input
              className="sx-d-input"
              placeholder="Buscar en tu mochila…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            className="sx-d-action sx-d-action-ghost"
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
          >
            <Star aria-hidden="true" fill={favoritesOnly ? 'currentColor' : 'none'} />
            Mis favoritos
          </button>
        </div>
        <div
          id="sx-backpack-compartments"
          role="tabpanel"
          aria-labelledby={`sx-backpack-tab-${kind}`}
          className="sx-d-stack"
        >
          {(['sheet', 'testimonial'] as const)
            .filter((type) => kind === 'all' || kind === type)
            .map((type) => {
              const items = visible.filter((r) => r.kind === type)
              return (
                <Parchment
                  key={type}
                  className={`sx-b-compartment ${type === 'testimonial' ? 'sx-d-dark' : ''}`}
                  label={type === 'sheet' ? 'Compartimento de fichas' : 'Compartimento de testimonios'}
                  title={type === 'sheet' ? 'Lo que aprendiste en el camino' : 'Voces de la ciudad'}
                >
                  <div className="sx-b-compartment-heading">
                    <p>
                      {type === 'sheet'
                        ? 'Puedes abrirlas también desde las actividades, cuando las necesites.'
                        : 'Personas reales que cuentan cómo llegaron a lo que hacen. Cada llamado que atiendes en la Central de Casos te acerca a una.'}
                    </p>
                    <strong>
                      {items.length} {type === 'sheet' ? 'fichas' : 'voces'}
                    </strong>
                  </div>
                  <div className={`sx-b-grid sx-b-grid-${type}`}>
                    {items.map((resource) => (
                      <BackpackCard
                        key={resource.id}
                        resource={resource}
                        unlocked={isUnlocked(resource)}
                        saved={adventure.bookmarks.includes(resource.id)}
                        visited={adventure.visits.includes(resource.id)}
                        playable={
                          'caseId' in resource.requirement &&
                          !!cityPoints.find(
                            (p) =>
                              p.id ===
                              ('caseId' in resource.requirement ? resource.requirement.caseId : undefined),
                          )?.actionEnabled
                        }
                        onOpen={() => openResource(resource)}
                        onFavorite={() => toggleFavorite(resource.id)}
                        onRequirement={() =>
                          consultarRequisito(resource)
                        }
                      />
                    ))}
                    {type === 'testimonial' && !favoritesOnly && !query.trim() && (
                      <div className="sx-b-more">
                        <Sparkles aria-hidden="true" />
                        <h3>Más voces se suman a la ciudad</h3>
                        <p>Con cada nuevo llamado aparecerán otras historias.</p>
                      </div>
                    )}
                  </div>
                  {!items.length && (
                    <div className="sx-b-empty">
                      <p>
                        {favoritesOnly
                          ? `Aún no marcas ${type === 'sheet' ? 'fichas' : 'voces'} como favoritas. Toca la estrella para guardarlas aquí.`
                          : 'No encontramos recursos con estos filtros'}
                      </p>
                      <button className="sx-d-action sx-d-action-ghost" onClick={clear} type="button">
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </Parchment>
              )
            })}
        </div>
      </section>
      <p className="sx-b-footer">
        <Star aria-hidden="true" size={18} />
        Las estrellas son tuyas: guarda lo que quieras encontrar rápido cuando armes tus planes.
      </p>
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
              {selected.kind === 'sheet' && selected.content && (
                <Button
                  variant="outline"
                  disabled={(journey.readResourceIds ?? journey.resources).includes(selected.id)}
                  onClick={() =>
                    marcarLeida(selected)
                  }
                >
                  <Check size={18} />
                  {(journey.readResourceIds ?? journey.resources).includes(selected.id)
                    ? 'Ficha leída'
                    : 'Leí la ficha'}
                </Button>
              )}
            </div>
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
              {selected.source && (
                <p className="max-w-md text-xs leading-5 text-muted-foreground">Fuente: {selected.source}</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      {mostrarRequisito && (
        <Dialog
          open={!!requisitoId}
          onOpenChange={(open) => {
            if (!open) setRequisitoId(null)
          }}
        >
          <DialogContent className="resource-dialog max-w-xl">
            <DialogHeader>
              <DialogTitle>Cómo obtener esta ficha</DialogTitle>
              <DialogDescription>{requisito}</DialogDescription>
            </DialogHeader>
            {errorRequisito && (
              <button className="sx-secondary-button" onClick={() => setIntentoRequisito((i) => i + 1)}>
                Reintentar requisito
              </button>
            )}
            {!requisitoPendiente && (
              <button
                type="button"
                className="sx-primary-button"
                onClick={() => {
                  setRequisitoId(null)
                  navigate(appPaths.student.missions)
                }}
              >
                Volver al camino
              </button>
            )}
          </DialogContent>
        </Dialog>
      )}
    </DiscoveryStage>
  )
}

function BackpackCard({
  resource,
  unlocked,
  saved,
  visited,
  playable,
  onOpen,
  onFavorite,
  onRequirement,
}: {
  resource: TravelResource
  unlocked: boolean
  saved: boolean
  visited: boolean
  playable: boolean
  onOpen: () => void
  onFavorite: () => void
  onRequirement: () => void
}) {
  const Icon = resourceIcons[resource.icon],
    requirement = resourceRequirement(resource)
  const activity =
    'activityId' in resource.requirement
      ? activities.find(
          (a) =>
            a.id === ('activityId' in resource.requirement ? resource.requirement.activityId : undefined),
        )
      : undefined
  const call =
    'caseId' in resource.requirement
      ? cityCases.find(
          (c) => c.id === ('caseId' in resource.requirement ? resource.requirement.caseId : undefined),
        )
      : undefined
  const [name, role] = resource.author?.split(' · ') ?? []
  return (
    <article
      className={`sx-b-card ${resource.kind === 'sheet' ? 'sx-b-sheet' : 'sx-b-voice'} ${unlocked ? 'sx-b-unlocked' : 'sx-b-locked'}`}
      data-icon={resource.icon}
    >
      {unlocked && <FavoriteButton compact icon="star" selected={saved} onToggle={onFavorite} />}
      {resource.kind === 'sheet' ? (
        <>
          <div className="sx-b-object" aria-hidden="true">
            <div className="sx-b-scroll">
              <Icon size={32} />
            </div>
            {!unlocked && <LockKeyhole className="sx-b-object-lock" size={32} />}
          </div>
          {unlocked && !visited && <span className="sx-b-new">Nueva</span>}
          <h3>{resource.title}</h3>
          {unlocked ? (
            <>
              <p>{resource.summary}</p>
              <p className="sx-b-origin">
                Obtenida en{' '}
                <strong>
                  {activity?.titulo ??
                    ('activityId' in resource.requirement ? resource.requirement.activityId : 'el camino')}
                </strong>
              </p>
              <button type="button" className="sx-d-action sx-b-open-sheet" onClick={onOpen}>
                Abrir ficha
              </button>
            </>
          ) : (
            <>
              <p>
                <LockKeyhole aria-hidden="true" size={16} /> Bloqueado · {requirement.text}
              </p>
              <button type="button" className="sx-d-action sx-d-action-ghost" onClick={onRequirement}>
                {requirement.label}
              </button>
            </>
          )}
        </>
      ) : unlocked ? (
        <>
          <div className="sx-b-author">
            <span>
              {name
                ?.split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('') ?? 'VO'}
            </span>
            <div>
              <strong>{name}</strong>
              <p>{role}</p>
            </div>
          </div>
          <h3>{resource.title}</h3>
          <blockquote>“{resource.summary}”</blockquote>
          <p>
            Te la regaló el llamado <strong>{call?.title ?? 'de la ciudad'}</strong>
          </p>
          <button type="button" className="sx-d-action sx-d-action-gold" onClick={onOpen}>
            <Play aria-hidden="true" size={18} />
            Escuchar su historia
          </button>
        </>
      ) : (
        <>
          <div className="sx-b-voice-mist" aria-hidden="true">
            <span className="sx-b-silhouette" />
            <LockKeyhole size={56} />
          </div>
          <p className="sx-b-voice-label">Una voz por descubrir</p>
          <h3>{resource.title}</h3>
          <p>{resource.summary}</p>
          <div className="sx-b-requirement">{requirement.text}</div>
          {playable ? (
            <button type="button" className="sx-d-action sx-d-action-ghost" onClick={onRequirement}>
              Ir a la Central de Casos
            </button>
          ) : (
            <p className="sx-b-coming">Este llamado llega pronto</p>
          )}
        </>
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

export { StudentBackpackView }
