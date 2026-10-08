import { useCallback, useEffect, useRef, useState } from 'react'
import { modoApi } from '@/config/env'
import {
  consultarItems,
  consultarProgreso,
  mensajeErrorServidor,
  useEstadoServidor,
} from '@/store/servidor/estadoServidor'
import { textoRequisito } from '@/lib/servidor/adaptadores'
import { actividadServidor } from '@/lib/servidor/adaptadores'
import { ChevronLeft, ChevronRight, PanelLeftOpen } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/Sheet'
import type { JourneyState } from '@/types/activities'
import { canAccessCity } from '@/store/adventureStore'
import type { AdventureState } from '@/types/adventure'
import { appPaths } from '@/routes/paths'
import { StudentUserMenu } from '../modules/StudentUserMenu'
import { StudentBrand } from '@/components/student/StudentBrand'
import { NoveltiesMenu } from '../overlays/NoveltiesMenu'
import { useStudentOverlays } from '../overlays/overlay-context'
import { guideSteps } from '@/data/content/guideTexts'
import { updateStudentUi, useStudentUi } from '@/store/studentUiStore'
import { ActivityDrawer } from './ActivityDrawer'
import { AdventurePanel, CollapsedAdventurePanel } from './AdventurePanel'
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
import { initialScale } from './geometry'
import { AdditionalReveal } from '../reflection/AdditionalReveal'

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
  const servidor = useEstadoServidor()
  const [detalleServidor, setDetalleServidor] = useState<{
    clave: string
    requirement?: string
    description?: string
    error?: boolean
  }>()
  const [intentoRequisito, setIntentoRequisito] = useState(0)
  const ui = useStudentUi()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const canvas = useRef<MapCanvasHandle>(null)
  const frameAdditional = useCallback((ids: string[]) => {
    canvas.current?.framePoints(ids)
  }, [])
  const returnPoint = useRef<string | undefined>(undefined)
  const mobilePanelButton = useRef<HTMLButtonElement>(null)
  const selectedId = params.get('punto') ?? undefined
  const [scale, setScale] = useState(initialScale)
  const [minimumScale, setMinimumScale] = useState(0)
  const { openGuide, openCheckIn, announcementBlocked } = useStudentOverlays()
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
  const baseDetails = selected ? getPointDetails(selected, adventure, journey) : undefined
  const claveDetalle = `${servidor.estado?.cuenta.codigo}/${selected?.id}/${selected?.specActivityId}/${selected?.status}`
  const details =
    baseDetails && detalleServidor?.clave === claveDetalle
      ? { ...baseDetails, ...detalleServidor }
      : baseDetails
  const selectedPointId = selected?.id
  const selectedActivityId = selected?.specActivityId
  const selectedStatus = selected?.status
  const selectedZone = selected?.zone
  useEffect(() => {
    if (!modoApi || !selectedPointId) return
    let vigente = true
    const consultaRequisito =
      selectedStatus === 'locked' &&
      (selectedPointId === 'city' || !!actividadServidor(servidor.estado, selectedActivityId ?? ''))
    setDetalleServidor({
      clave: claveDetalle,
      ...(consultaRequisito ? { requirement: 'Consultando el requisito en el servidor…' } : {}),
    })
    void (async () => {
      const [requirement, items] = await Promise.all([
        consultaRequisito
          ? consultarProgreso(
              selectedPointId === 'city' ? 'BLOQUE' : 'ACTIVIDAD',
              selectedPointId === 'city' ? 'CIUDAD' : (selectedActivityId ?? ''),
            )
          : undefined,
        selectedPointId === 'mara-test' && selectedActivityId
          ? consultarItems(selectedActivityId)
          : undefined,
      ])
      if (!vigente) return
      setDetalleServidor({
        clave: claveDetalle,
        ...(requirement
          ? {
              requirement:
                requirement.tipo === 'ok'
                  ? textoRequisito(requirement.datos, servidor.estado)
                  : mensajeErrorServidor(requirement),
              error: requirement.tipo !== 'ok',
            }
          : {}),
        ...(items
          ? {
              description:
                items.tipo === 'ok'
                  ? `Conversa con Mara y responde ${items.datos.length} ítems en esta interacción. No hay respuestas correctas o incorrectas.`
                  : mensajeErrorServidor(items),
            }
          : {}),
      })
    })()
    return () => {
      vigente = false
    }
  }, [
    claveDetalle,
    servidor.estado,
    selectedPointId,
    selectedActivityId,
    selectedStatus,
    selectedZone,
    intentoRequisito,
  ])
  useEffect(() => {
    if (selectedPointId) {
      returnPoint.current = selectedPointId
      canvas.current?.focusPoint(selectedPointId)
    }
  }, [selectedPointId])
  function closePoint() {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('punto')
        return next
      },
      { replace: true },
    )
  }
  function selectPoint(id: string) {
    setMobilePanelOpen(false)
    canvas.current?.focusPoint(id)
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set('punto', id)
      next.delete('actividad')
      next.delete('revision')
      return next
    })
  }
  function action(detail: PointDetails) {
    if (detail.disabled || (modoApi && servidor.error)) return
    if (detail.href) navigate(detail.href)
    else if (detail.activityId)
      setParams({ actividad: detail.activityId, ...(detail.revision ? { revision: '1' } : {}) })
  }
  function journal(detail: PointDetails) {
    if (!detail.journal) return
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
        <StudentBrand />
        <NoveltiesMenu />
        <StudentUserMenu />
      </header>
      <div className="sx-map-stage" data-panel-open={!mobile && !ui.panelCollapsed}>
        <MapCanvas
          ref={canvas}
          points={points}
          variant={zone === 'missions' ? 'route' : 'open'}
          panelOpen={!mobile && !ui.panelCollapsed}
          panelInset={mobile ? 0 : ui.panelCollapsed ? 72 : 304}
          selectedId={selectedId}
          recommendedId={recommended?.id}
          onSelect={selectPoint}
          onScaleChange={setScale}
          onMinimumScaleChange={setMinimumScale}
          locked={locked}
          label={
            zone === 'missions' ? 'Aventura · Camino de misiones' : 'Central de Casos · Llamados de la ciudad'
          }
          backgroundImage={
            zone === 'missions' ? '/images/adventure/journey-map.png' : '/images/adventure/city-map.png'
          }
        />
        {locked && <CityLocked adventure={adventure} />}
        {zone === 'missions' && !modoApi && (
          <AdditionalReveal
            onFrame={frameAdditional}
            onSelect={selectPoint}
            enabled={!announcementBlocked && !selectedId && !mobilePanelOpen}
          />
        )}
        <aside
          className="sx-glass sx-adventure-panel"
          data-collapsed={ui.panelCollapsed}
          aria-label="Panel de aventura"
          inert={mobile ? true : undefined}
        >
          {ui.panelCollapsed && (
            <CollapsedAdventurePanel
              progress={progress.value}
              recommended={recommended}
              onSelect={(id) => (locked ? navigate(appPaths.student.missions) : selectPoint(id))}
            />
          )}
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
          minimumScale={minimumScale}
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
        onClose={closePoint}
        onAction={action}
        onJournal={journal}
        onRetryRequirement={
          modoApi && detalleServidor?.clave === claveDetalle && detalleServidor.error
            ? () => setIntentoRequisito((i) => i + 1)
            : undefined
        }
        onFallbackFocus={() => {
          if (mobile) mobilePanelButton.current?.focus()
          else canvas.current?.focusNode(returnPoint.current)
        }}
      />
      <ZoneTransition zone={zone} />
    </div>
  )
}
