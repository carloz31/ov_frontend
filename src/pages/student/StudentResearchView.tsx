import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Crown, LockKeyhole, Check, Search } from 'lucide-react'
import { occupationCatalog } from '@/data/catalog/occupations'
import { updateAdventure, useAdventure } from '@/store/adventureStore'
import { useJourney } from '@/store/journeyStore'
import { appPaths } from '@/routes/paths'
import { discoveryPaths } from '@/routes/discoveryPaths'
import { useDiscovery, updateDiscovery } from '@/store/discoveryStore'
import { DiscoveryStage } from '@/features/discovery/components/DiscoveryStage'
import { Parchment } from '@/components/student/Parchment'
import { CollectionSlot } from '@/components/student/CollectionSlot'
import { GuideSheet } from '@/features/discovery/components/research/GuideSheet'
import { AlliesSheet } from '@/features/discovery/components/research/AlliesSheet'
import { PublishDialog } from '@/features/discovery/components/research/PublishDialog'
import { InterviewCard } from '@/features/discovery/components/research/InterviewCard'
import { InterviewDetail } from '@/features/discovery/components/research/InterviewDetail'
import { ReportDialog } from '@/features/discovery/components/research/ReportDialog'
import { getAllies } from '@/data/content/research'
import { getClassroomInterviews, getLegendInterviews, interviewVisible, researchUnlocked } from '@/features/discovery/lib/research'

export function ResearchRoute() {
  return <StudentResearchView />
}
export function StudentResearchView() {
  const state = useAdventure(),
    discovery = useDiscovery(),
    navigate = useNavigate(),
    [params, setParams] = useSearchParams()
  const unlocked = researchUnlocked(state, useJourney()),
    research = discovery.research
  const [tab, setTab] = useState<'classroom' | 'mine'>('classroom'),
    [legends, setLegends] = useState(false),
    [guide, setGuide] = useState(false),
    [allies, setAllies] = useState(false),
    [publish, setPublish] = useState(false),
    [reporting, setReporting] = useState<string>(),
    [query, setQuery] = useState(''),
    [favoritesOnly, setFavoritesOnly] = useState(false)
  const videos = legends ? getLegendInterviews(state) : getClassroomInterviews(state)
  const isOwn = (id: string, alias: string) =>
    discovery.publishedResearch.some((p) => p.videoId === id) || alias.split(/ y |, /).includes('Alex')
  const selectedId = params.get('entrevista')
  const selected = [...getClassroomInterviews(state), ...getLegendInterviews(state)].find(
    (v) => v.id === selectedId && interviewVisible(v, state),
  )
  const visibleSelectedId = selected?.id
  useEffect(() => {
    if (unlocked && visibleSelectedId)
      updateAdventure((current) =>
        current.visits.includes(visibleSelectedId)
          ? current
          : { ...current, visits: [...current.visits, visibleSelectedId] },
      )
  }, [unlocked, visibleSelectedId])
  const visible = videos.filter(
    (v) =>
      (legends || tab === 'classroom' || isOwn(v.id, v.alias)) &&
      (!favoritesOnly || state.bookmarks.includes(v.id)) &&
      v.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )
  const occupation = occupationCatalog.find((o) => o.id === research?.occupationId)
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
  return (
    <DiscoveryStage ambient="research">
      {selected && unlocked ? (
        <InterviewDetail
          key={selected.id}
          video={selected}
          own={isOwn(selected.id, selected.alias)}
          featured={
            state.interviewModeration[selected.id]?.featured ?? selected.id === 'demo-industrial-design'
          }
          reported={state.reports.some((r) => r.postId === selected.id)}
          onBack={() => {
            setParams(
              (current) => {
                const next = new URLSearchParams(current)
                next.delete('entrevista')
                return next
              },
              { replace: true },
            )
          }}
          onReport={() => setReporting(selected.id)}
        />
      ) : (
        <>
          <header className="sx-d-header">
            <div>
              <h1>{legends ? 'Salón de Leyendas' : 'Investigaciones'}</h1>
              <p>
                {legends
                  ? 'Entrevistas que siguen inspirando nuevos viajes'
                  : 'Entrevistas a profesionales hechas por tu salón'}
              </p>
            </div>
            {unlocked && (
              <div className="sx-d-actions">
                {research?.publishedVideoId ? (
                  <button
                    type="button"
                    className="sx-d-action sx-d-action-gold"
                    onClick={() => {
                      updateDiscovery((s) => ({ ...s, research: undefined }))
                      navigate(discoveryPaths.researchGuide)
                    }}
                  >
                    Iniciar otra investigación
                  </button>
                ) : research?.guideReadyAt ? (
                  <>
                    <button
                      type="button"
                      className="sx-d-action sx-d-action-ghost"
                      onClick={() => setAllies(true)}
                    >
                      Aliados · {getAllies(research.occupationId).length}
                    </button>
                    <button
                      type="button"
                      className="sx-d-action sx-d-action-gold"
                      onClick={() => setGuide(true)}
                    >
                      Ver mi guion
                    </button>
                  </>
                ) : (
                  <Link className="sx-d-action sx-d-action-gold" to={discoveryPaths.researchGuide}>
                    {research ? 'Continuar mi guion' : 'Iniciar investigación'}
                  </Link>
                )}
              </div>
            )}
          </header>
          {!unlocked ? (
            <Parchment title="Las investigaciones se abren al resolver tu primer caso en la Central de Casos.">
              <LockKeyhole size={52} aria-hidden="true" />
              <Link className="sx-d-action" to={appPaths.student.exploration}>
                Ir a la ciudad
              </Link>
            </Parchment>
          ) : research?.publishedVideoId ? (
            <Parchment className="sx-d-published" title="Tu entrevista ya está en el salón">
              <Check size={76} aria-hidden="true" />
              <p>
                {research.publication?.coauthors.length
                  ? `La publicaste junto a ${research.publication.coauthors.join(' y ')}. `
                  : ''}
                Tus compañeros ya pueden verla y reaccionar.
              </p>
              <button
                type="button"
                className="sx-d-action"
                onClick={() => {
                  setTab('mine')
                  setLegends(false)
                }}
              >
                Ver en Mis investigaciones
              </button>
            </Parchment>
          ) : (
            research?.guideReadyAt && (
              <Parchment
                className="sx-d-highlight"
                label="Tu investigación en curso"
                title={occupation?.name}
              >
                <div className="sx-d-research-progress">
                  <CollectionSlot icon={<Check />}>
                    Guion listo · {3 + research.ownQuestions.length} preguntas
                  </CollectionSlot>
                  <CollectionSlot collected={false}>
                    Realizar la entrevista · Fuera de la plataforma
                  </CollectionSlot>
                  <CollectionSlot collected={false}>Publicar · Resumen y enlace al video</CollectionSlot>
                </div>
                <p>¿Ya conversaste con esa persona? Comparte lo que descubriste con tu salón.</p>
                <button
                  type="button"
                  className="sx-d-action sx-d-action-gold sx-d-pulsing"
                  onClick={() => setPublish(true)}
                >
                  Publicar mi entrevista
                </button>
              </Parchment>
            )
          )}
          <div className="sx-d-header sx-d-community-nav">
            <div className="sx-d-tabs" role="tablist" aria-label="Origen de investigaciones">
              {(['classroom', 'mine'] as const).map((value, index) => (
                <button
                  type="button"
                  key={value}
                  id={`sx-research-tab-${value}`}
                  role="tab"
                  aria-controls="sx-research-panel"
                  aria-selected={!legends && tab === value}
                  tabIndex={tab === value ? 0 : -1}
                  onClick={() => {
                    setTab(value)
                    setLegends(false)
                  }}
                  onKeyDown={(e) => {
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
                    e.preventDefault()
                    const next = e.key === 'Home' ? 0 : e.key === 'End' ? 1 : 1 - index
                    setTab(next === 0 ? 'classroom' : 'mine')
                    setLegends(false)
                    e.currentTarget.parentElement
                      ?.querySelectorAll<HTMLButtonElement>('[role=tab]')
                      [next]?.focus()
                  }}
                >
                  {value === 'classroom' ? 'De mi salón' : 'Mis investigaciones'}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="sx-d-legend-button"
              aria-pressed={legends}
              onClick={() => setLegends((v) => !v)}
            >
              <Crown aria-hidden="true" />
              {legends ? 'Volver a mi salón' : 'Salón de Leyendas'}
            </button>
          </div>
          <div className="sx-d-actions sx-d-search-row">
            <label>
              <Search aria-hidden="true" />
              <span className="sr-only">Buscar por título</span>
              <input
                className="sx-d-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título..."
              />
            </label>
            <button
              type="button"
              className="sx-d-action sx-d-action-ghost"
              aria-pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              Favoritos
            </button>
          </div>
          <div
            id="sx-research-panel"
            role="tabpanel"
            aria-labelledby={`sx-research-tab-${tab}`}
            className={`sx-d-two ${legends ? 'sx-d-legends' : ''}`}
          >
            {visible.map((video) => (
              <InterviewCard
                key={video.id}
                video={video}
                own={isOwn(video.id, video.alias)}
                unlocked={unlocked}
                onOpen={() => {
                  if (!unlocked) {
                    navigate(appPaths.student.exploration)
                    return
                  }
                  markSeen(video.id)
                  setParams((current) => {
                    const next = new URLSearchParams(current)
                    next.set('entrevista', video.id)
                    return next
                  })
                }}
                onBookmark={() => toggleBookmark(video.id)}
              />
            ))}
            {!visible.length && (
              <Parchment>
                <p>
                  {tab === 'mine' && !legends
                    ? 'Cuando publiques tu primera entrevista, aquí verás lo que tus compañeros aprendieron con ella.'
                    : 'No hay investigaciones que coincidan con tu búsqueda o favoritos.'}
                </p>
              </Parchment>
            )}
          </div>
        </>
      )}
      {research?.guideReadyAt && (
        <>
          <GuideSheet research={research} open={guide} onOpenChange={setGuide} />
          <AlliesSheet
            occupationId={research.occupationId}
            occupationName={occupation?.name ?? ''}
            open={allies}
            onOpenChange={setAllies}
          />
          {publish && <PublishDialog research={research} onClose={() => setPublish(false)} />}
        </>
      )}
      {reporting && <ReportDialog videoId={reporting} onClose={() => setReporting(undefined)} />}
    </DiscoveryStage>
  )
}
