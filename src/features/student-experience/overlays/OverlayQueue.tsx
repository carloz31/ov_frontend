import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { modoApi } from '@/features/servidor/config'
import {
  avisosPendientes,
  mostrarAviso,
  useEstadoServidor,
  mensajeErrorServidor,
} from '@/features/servidor/estadoServidor'
import { marcarVistos } from '@/features/servidor/acciones'
import { UnlockToast } from './UnlockToast'
import { useNavigate } from 'react-router'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { useJourney } from '@/features/missions/store'
import { appPaths } from '@/routes/paths'
import { cityArrivalSteps, guideSteps } from '../guide-texts'
import { updateStudentUi, useStudentUi } from '../ui-state'
import type { StudentView } from '../views'
import { CheckInDialog } from './CheckInDialog'
import { getTodayCheckIn, localDateKey, saveTodayCheckIn, useCheckInDay } from './checkIn'
import { LumiOverlay } from './LumiOverlay'
import { BadgeToast } from './BadgeToast'
import { getNextBadge, markBadgeAnnounced } from './unlocks'
import { useReflections } from '../reflection/store'
import { isWithinStudentDemo } from '@/features/occupation-exploration/lib/StudentDemoScope'
import {
  getNextOverlay,
  StudentOverlayContext,
  type AutomaticOverlay,
  type ManualOverlay,
} from './overlay-context'

export function OverlayQueue({
  view,
  activityOpen,
  children,
}: {
  view: StudentView
  activityOpen: boolean
  children: ReactNode
}) {
  const adventure = useAdventure()
  const journey = useJourney()
  const ui = useStudentUi()
  const reflections = useReflections()
  const navigate = useNavigate()
  const today = useCheckInDay()
  const servidor = useEstadoServidor()
  const [avisosManual, setAvisosManual] = useState(false)
  useEffect(() => {
    setAvisosManual(false)
  }, [servidor.estado?.cuenta.codigo])
  const [arrivalDismissed, setArrivalDismissed] = useState(false)
  const [automatic, setAutomatic] = useState<AutomaticOverlay | null>(null)
  const [manual, setManual] = useState<ManualOverlay | null>(null)
  const [overlayAbierto, setOverlayAbierto] = useState(false)
  useEffect(() => {
    if (!modoApi) return
    // Los detalles y menús usan portales: su presencia bloquea el mismo
    // criterio de anuncios que recibe getNextBadge, también fuera del mapa.
    const actualizar = () =>
      setOverlayAbierto(!!document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]'))
    actualizar()
    const observer = new MutationObserver(actualizar)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['role', 'hidden', 'aria-hidden', 'data-state'],
    })
    return () => observer.disconnect()
  }, [])
  const next = getNextOverlay({ adventure, ui, view, activityOpen, arrivalDismissed })
  const nextKey =
    next?.kind === 'intro'
      ? `intro:${next.view}`
      : next?.kind === 'check-in'
        ? `check-in:${next.day}`
        : (next?.kind ?? '')
  useEffect(() => {
    // Opening only after mounting keeps static route rendering free of dialogs.
    setAutomatic(getNextOverlay({ adventure, ui, view, activityOpen, arrivalDismissed }))
  }, [adventure, ui, view, activityOpen, arrivalDismissed, today, nextKey])
  const active = activityOpen ? null : (manual ?? automatic)
  const announcementBlocked = activityOpen || overlayAbierto || !!active || !!next
  const context = useMemo(
    () => ({
      announcementBlocked,
      openServerNotices: () => setAvisosManual(true),
      openGuide: (steps: string[]) => setManual({ kind: 'guide', steps }),
      openCheckIn: (onReturnFocus?: () => void) => setManual({ kind: 'signal', onReturnFocus }),
    }),
    [announcementBlocked],
  )
  const additionalPending =
    !modoApi &&
    view === 'missions' &&
    (reflections.desbloqueos.some((d) => !d.visto && isWithinStudentDemo(d.actividadId)) ||
      (!!reflections.anuncioAdicional && isWithinStudentDemo(reflections.anuncioAdicional.actividadId)))
  const badge = modoApi
    ? undefined
    : getNextBadge(adventure, ui, activityOpen, announcementBlocked || additionalPending, journey)
  const habilitarAvisos =
    modoApi && !announcementBlocked && (view === 'missions' || view === 'central' || avisosManual)
  const aviso = habilitarAvisos && !servidor.errorAvisos ? avisosPendientes()[0] : undefined
  useEffect(() => {
    if (
      habilitarAvisos &&
      !aviso &&
      servidor.avisosMostrados.length &&
      !servidor.procesandoAvisos &&
      !servidor.errorAvisos
    ) {
      void marcarVistos().then((r) => {
        if (r.tipo === 'ok' && r.datos === 'terminado') setAvisosManual(false)
      })
    }
  }, [habilitarAvisos, aviso, servidor.avisosMostrados, servidor.procesandoAvisos, servidor.errorAvisos])
  const guide =
    active?.kind === 'guide'
      ? active.steps
      : active?.kind === 'intro'
        ? guideSteps[active.view]
        : active?.kind === 'arrival'
          ? cityArrivalSteps
          : null
  function closeGuide() {
    if (active?.kind === 'guide') {
      setManual(null)
      return
    }
    if (active?.kind === 'intro') {
      const closedView = active.view
      updateStudentUi((current) => ({
        ...current,
        introsSeen: { ...current.introsSeen, [closedView]: true },
      }))
    }
    // Closing arrival without finishing dismisses only this visit; the final action records it.
    if (active?.kind === 'arrival') setArrivalDismissed(true)
    setAutomatic(null)
  }
  function dismissSignal() {
    updateStudentUi((current) => ({ ...current, checkInPromptDismissedOn: localDateKey(new Date()) }))
    setManual(null)
    setAutomatic(null)
  }
  return (
    <StudentOverlayContext.Provider value={context}>
      {children}
      <LumiOverlay
        key={active?.kind === 'intro' ? `intro:${active.view}` : (active?.kind ?? 'closed')}
        open={!!guide}
        steps={guide ?? []}
        onClose={closeGuide}
        finalLabel={active?.kind === 'arrival' ? 'Entrar a la ciudad' : undefined}
        onFinish={
          active?.kind === 'arrival'
            ? () => {
                updateStudentUi((current) => ({ ...current, cityArrivalSeen: true }))
                navigate(appPaths.student.exploration)
              }
            : undefined
        }
      />
      <CheckInDialog
        key={today}
        open={active?.kind === 'signal' || active?.kind === 'check-in'}
        value={getTodayCheckIn(adventure)?.value}
        onReturnFocus={active?.kind === 'signal' ? active.onReturnFocus : undefined}
        onDismiss={dismissSignal}
        onSave={(value) => {
          saveTodayCheckIn(value)
          setManual(null)
          setAutomatic(null)
        }}
      />
      {badge && (
        <BadgeToast
          key={badge.code}
          badge={badge}
          onDismiss={() => updateStudentUi((current) => markBadgeAnnounced(current, badge.code))}
        />
      )}
      {aviso && <UnlockToast key={aviso.id} aviso={aviso} onDismiss={() => mostrarAviso(aviso.id)} />}
      {habilitarAvisos && servidor.errorAvisos && (
        <aside className="sx-root sx-glass sx-badge-toast" role="alert">
          <div>
            <p>{mensajeErrorServidor(servidor.errorAvisos)}</p>
            <button className="sx-primary-button" onClick={() => void marcarVistos()}>
              Reintentar avisos
            </button>
          </div>
        </aside>
      )}
    </StudentOverlayContext.Provider>
  )
}
