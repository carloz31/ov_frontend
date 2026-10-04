import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { appPaths } from '@/routes/paths'
import { cityArrivalSteps, guideSteps } from '../guide-texts'
import { updateStudentUi, useStudentUi } from '../ui-state'
import type { StudentView } from '../views'
import { CheckInDialog } from './CheckInDialog'
import { getTodayCheckIn, localDateKey, saveTodayCheckIn, useCheckInDay } from './checkIn'
import { LumiOverlay } from './LumiOverlay'
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
  const ui = useStudentUi()
  const navigate = useNavigate()
  const today = useCheckInDay()
  const [arrivalDismissed, setArrivalDismissed] = useState(false)
  const [automatic, setAutomatic] = useState<AutomaticOverlay | null>(null)
  const [manual, setManual] = useState<ManualOverlay | null>(null)
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
  const context = useMemo(
    () => ({
      openGuide: (steps: string[]) => setManual({ kind: 'guide', steps }),
      openCheckIn: (onReturnFocus?: () => void) => setManual({ kind: 'signal', onReturnFocus }),
    }),
    [],
  )
  const active = activityOpen ? null : (manual ?? automatic)
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
    </StudentOverlayContext.Provider>
  )
}
