import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Compass, PanelLeftOpen } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/Sheet'
import type { JourneyState } from '@/features/missions/logic'
import { canAccessCity } from '@/features/occupation-exploration/lib/AdventureStore'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import { StudentUserMenu } from '../modules/StudentUserMenu'
import { useStudentOverlays } from '../overlays/overlay-context'
import { guideSteps } from '../guide-texts'
import { updateStudentUi, useStudentUi } from '../ui-state'
import { ActivityDrawer } from './ActivityDrawer'
import { AdventurePanel } from './AdventurePanel'
import { CityLocked } from './CityLocked'
import { MapCanvas, type MapCanvasHandle } from './MapCanvas'
import { MapControls } from './MapControls'
import {
  getPointDetails,
  getRecommendedPoint,
  getZoneProgress,
  type PointDetails,
  type StudentMapPoint,
  type StudentZone,
} from './mapPoints'
import { ZoneSwitch } from './ZoneSwitch'
import { ZoneTransition } from './ZoneTransition'
import { ZoomControls } from './ZoomControls'

export function MapScreenLayout({
  zone,
  points,
  adventure,
  journey,
}: {
  zone: StudentZone
  points: StudentMapPoint[]
  adventure: AdventureState
  journey: JourneyState
}) {
  const ui = useStudentUi()
  const navigate = useNavigate()
  const [, setParams] = useSearchParams()
  const canvas = useRef<MapCanvasHandle>(null)
  const mobilePanelButton = useRef<HTMLButtonElement>(null)
  const [selectedId, setSelectedId] = useState<string>()
  const [scale, setScale] = useState(0.8)
  const { openGuide, openCheckIn } = useStudentOverlays()
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => {
      setMobile(query.matches)
      if (!query.matches) setMobilePanelOpen(false)
    }
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const cityOpen = canAccessCity(adventure)
  const locked = zone === 'central' && !cityOpen
  const recommended = getRecommendedPoint(points)
  const progress = getZoneProgress(zone, adventure, journey)
  const selected = points.find((point) => point.id === selectedId)
  const details = selected ? getPointDetails(selected, adventure, journey) : undefined
  function selectPoint(id: string) {
    setMobilePanelOpen(false)
    canvas.current?.focusPoint(id)
    setSelectedId(id)
  }
  function action(detail: PointDetails) {
    setSelectedId(undefined)
    if (detail.href) navigate(detail.href)
    else if (detail.activityId)
      setParams({ actividad: detail.activityId, ...(detail.revision ? { revision: '1' } : {}) })
  }
  function journal(detail: PointDetails) {
    if (!detail.journal) return
    setSelectedId(undefined)
    const query = new URLSearchParams({
      activity: detail.journal.activityId,
      title: detail.journal.title,
      prompt: detail.journal.prompt,
    })
    navigate(`${appPaths.student.journal}?${query}`)
  }
  const panel = (
    <AdventurePanel
      adventure={adventure}
      points={points}
      recommended={recommended}
      progress={progress}
      onCheckIn={() => {
        setMobilePanelOpen(false)
        openCheckIn(mobile ? () => mobilePanelButton.current?.focus() : undefined)
      }}
      onSelect={(id) => {
        if (locked) navigate(appPaths.student.missions)
        else selectPoint(id)
      }}
    />
  )
  return (
    <div className={`sx-map-screen sx-zone-${zone}`}>
      <h1 className="sr-only">Aventura · {zone === 'missions' ? 'Camino' : 'Ciudad'}</h1>
      <header className="sx-map-header">
        <div className="sx-map-brand">
          <span>
            <Compass size={20} />
          </span>
          <div>
            <span>Orientación</span>
            <strong>Explora</strong>
          </div>
        </div>
        <StudentUserMenu />
      </header>
      <div className="sx-map-stage" data-panel-open={!mobile && !ui.panelCollapsed}>
        <MapCanvas
          ref={canvas}
          points={points}
          variant={zone === 'missions' ? 'route' : 'open'}
          panelOpen={!mobile && !ui.panelCollapsed}
          selectedId={selectedId}
          recommendedId={recommended?.id}
          onSelect={selectPoint}
          onScaleChange={setScale}
          locked={locked}
          label={
            zone === 'missions' ? 'Aventura · Camino de misiones' : 'Central de Casos · Llamados de la ciudad'
          }
          backgroundImage={
            zone === 'missions' ? '/images/adventure/journey-map.jpeg' : '/images/adventure/city-map.jpeg'
          }
        />
        {locked && <CityLocked adventure={adventure} />}
        <aside
          className="sx-glass sx-adventure-panel"
          data-collapsed={ui.panelCollapsed}
          aria-label="Panel de aventura"
          inert={mobile ? true : undefined}
        >
          <div className="sx-panel-scroll" inert={ui.panelCollapsed ? true : undefined}>
            {panel}
          </div>
          <button
            type="button"
            className="sx-panel-toggle"
            aria-label={ui.panelCollapsed ? 'Desplegar panel' : 'Plegar panel'}
            onClick={() =>
              updateStudentUi((current) => ({ ...current, panelCollapsed: !current.panelCollapsed }))
            }
          >
            {ui.panelCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </aside>
        <ZoneSwitch
          zone={zone}
          cityOpen={cityOpen}
          onCityLocked={() =>
            zone === 'missions' ? selectPoint('city') : navigate(appPaths.student.missions)
          }
        />
        <MapControls onHelp={() => openGuide(guideSteps[zone])} />
        <ZoomControls
          scale={scale}
          onZoom={(factor) => canvas.current?.zoom(factor)}
          onScale={(value) => canvas.current?.setScale(value)}
          onCenter={() => canvas.current?.centerMap()}
        />
        <button
          type="button"
          className="sx-glass sx-mobile-panel-open"
          ref={mobilePanelButton}
          aria-label="Abrir panel"
          onClick={() => setMobilePanelOpen(true)}
        >
          <PanelLeftOpen size={20} />
        </button>
      </div>
      <Sheet open={mobilePanelOpen} onOpenChange={setMobilePanelOpen}>
        <SheetContent
          side="bottom"
          className="sx-root sx-mobile-panel"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            mobilePanelButton.current?.focus()
          }}
        >
          <SheetTitle className="sr-only">Panel de aventura</SheetTitle>
          <SheetDescription className="sr-only">Tu progreso y los accesos de tu aventura.</SheetDescription>
          {panel}
        </SheetContent>
      </Sheet>
      <ActivityDrawer
        point={selected}
        details={details}
        onClose={() => setSelectedId(undefined)}
        onAction={action}
        onJournal={journal}
        onFallbackFocus={() => mobilePanelButton.current?.focus()}
      />
      <ZoneTransition zone={zone} />
    </div>
  )
}
