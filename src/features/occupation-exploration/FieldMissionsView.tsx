import { useEffect, useRef, useState } from 'react'
import { BookOpen, ClipboardList, Feather, FileUp, KeyRound, Play } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { AdventureMap } from '@/components/AdventureMap'
import { GuideDialogue } from '@/components/GuideDialogue'
import { MapPointDrawer } from '@/components/MapPointDrawer'
import { Button } from '@/components/ui/Button'
import { appPaths } from '@/routes/paths'
import { activityById } from '../missions/content'
import { JourneyPlayer } from '../missions/JourneyPlayer'
import { useJourney } from '../missions/store'
import '../missions/journey.css'
import { AdventureModeSwitch } from './components/AdventureModeSwitch'
import { JournalEntryCard } from './components/JournalEntryCard'
import { fieldMissions, type FieldMission } from './data/AdventureData'
import { getActivityPrompt } from './data/JournalData'
import { canAccessCity, prototypeAllUnlocked, useAdventure } from './lib/AdventureStore'
import './adventure.css'

const specActivityByMission: Partial<Record<FieldMission['id'], string>> = {
  welcome: 'mission-welcome',
  story: 'mission-story',
  future: 'mission-future',
  beliefs: 'enc-mitos',
  compass: 'mission-compass',
  plan: 'act-06',
  expectations: 'mission-expectations',
  'next-step': 'mission-next-step',
}

function FieldMissionsView() {
  const state = useAdventure()
  const journey = useJourney()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [selectedPointId, setSelectedPointId] = useState<string>()
  const pageRef = useRef<HTMLDivElement>(null)
  const specActivity = activityById(params.get('actividad') ?? '')

  useEffect(() => {
    pageRef.current?.scrollIntoView({ block: 'start' })
  }, [specActivity?.id])

  const unlocked = canAccessCity(state)
  const missionComplete = (mission: FieldMission) => {
    const specId = specActivityByMission[mission.id]
    return specId
      ? journey.progress[specId]?.estado === 'completada'
      : state.completedMissionIds.includes(mission.id)
  }
  const completed = fieldMissions.filter(missionComplete).length
  const selectedMission = fieldMissions.find((mission) => mission.id === selectedPointId)
  const citySelected = selectedPointId === 'city'

  function closeActivity() {
    setParams({})
  }
  function openMission(mission: FieldMission) {
    const specId = specActivityByMission[mission.id]
    if (specId) setParams({ actividad: specId })
  }
  const selectedCompleted = selectedMission ? missionComplete(selectedMission) : false
  const selectedMissionIndex = selectedMission
    ? fieldMissions.findIndex((mission) => mission.id === selectedMission.id)
    : -1
  const selectedLocked =
    !!selectedMission &&
    !missionComplete(selectedMission) &&
    !prototypeAllUnlocked &&
    selectedMissionIndex > 0 &&
    !missionComplete(fieldMissions[selectedMissionIndex - 1])
  const requiredMission = selectedLocked ? fieldMissions[selectedMissionIndex - 1] : undefined
  const selectedSpec = selectedMission
    ? activityById(specActivityByMission[selectedMission.id] ?? '')
    : undefined
  const journalPrompt = selectedMission
    ? (selectedSpec?.promptDiario ??
      getActivityPrompt(selectedSpec?.id ?? selectedMission.id, state.readinessCheckIns))
    : undefined
  function openJournal() {
    if (!selectedMission || !journalPrompt) return
    const query = new URLSearchParams({
      activity: selectedSpec?.id ?? selectedMission.id,
      title: selectedMission.title,
      prompt: journalPrompt,
    })
    navigate(`${appPaths.student.journal}?${query}`)
  }

  if (specActivity)
    return (
      <JourneyPlayer
        key={specActivity.id}
        activity={specActivity}
        edit={params.get('revision') === '1'}
        onClose={closeActivity}
        onNext={(id) => {
          const next = activityById(id)
          if (next) setParams({ actividad: id })
          else closeActivity()
        }}
      />
    )

  return (
    <div ref={pageRef} className="adventure-page relative h-full min-h-0">
      <h1 className="sr-only">Aventura · Camino</h1>
      <AdventureMap
        variant="route"
        backgroundImage="/images/adventure/journey-map.jpeg"
        label="Aventura · Camino de misiones"
        progress={{
          icon: <KeyRound className="size-4" />,
          label: 'Nivel de recorrido',
          value: (completed / fieldMissions.length) * 100,
        }}
        points={[
          ...fieldMissions.map((mission, index) => ({
            ...mission,
            subtitle: `${getActivityType(mission)} · ${getMissionMeta(mission)}`,
            icon: getMissionIcon(mission),
            status: missionComplete(mission)
              ? ('completed' as const)
              : prototypeAllUnlocked || index === 0 || missionComplete(fieldMissions[index - 1])
                ? ('available' as const)
                : ('locked' as const),
          })),
          {
            id: 'city',
            title: 'La llave de la ciudad',
            subtitle: unlocked ? 'Entrar a la ciudad' : 'Destino al completar el camino',
            x: 950,
            y: 480,
            icon: <KeyRound />,
            status: unlocked ? 'available' : 'locked',
          },
        ]}
        onSelect={setSelectedPointId}
      />
      <AdventureModeSwitch />
      <MapPointDrawer
        open={Boolean(selectedMission || citySelected)}
        onOpenChange={(open) => {
          if (!open) setSelectedPointId(undefined)
        }}
        eyebrow={citySelected ? 'Meta del recorrido' : (selectedMission?.region ?? 'Misión de campo')}
        badge={
          selectedMission
            ? missionComplete(selectedMission)
              ? 'Completada'
              : selectedLocked
                ? 'Bloqueada'
                : getActivityType(selectedMission)
            : 'Disponible'
        }
        meta={citySelected ? 'Ciudad' : selectedMission ? getMissionMeta(selectedMission) : ''}
        title={citySelected ? 'La llave de la ciudad' : (selectedMission?.title ?? '')}
        description={
          citySelected
            ? 'Cambia a la ciudad para atender sus llamados, investigar carreras y encontrarte con nuevas actividades.'
            : selectedLocked
              ? `Requisito: completa la actividad “${requiredMission?.title}”.`
              : (selectedMission?.description ?? '')
        }
        visual={
          <span className="grid size-20 place-items-center rounded-full border-4 border-[#efcf70] bg-[#fff4bd] text-[#57725e] shadow-[0_8px_0_#d4a94b]">
            {citySelected ? (
              <KeyRound className="size-10" />
            ) : (
              selectedMission && getMissionIcon(selectedMission, true)
            )}
          </span>
        }
        footer={
          <div className="space-y-4">
            {selectedMission && (
              <JournalEntryCard completed={selectedCompleted} prompt={journalPrompt} onOpen={openJournal} />
            )}
            <Button
              className="w-full"
              size="lg"
              disabled={selectedLocked}
              onClick={() => {
                setSelectedPointId(undefined)
                if (citySelected) navigate(appPaths.student.exploration)
                else if (selectedMission) {
                  const completed = missionComplete(selectedMission)
                  const specId = specActivityByMission[selectedMission.id]
                  if (specId) setParams({ actividad: specId, ...(completed ? { revision: '1' } : {}) })
                  else openMission(selectedMission)
                }
              }}
            >
              <Play />{' '}
              {citySelected
                ? 'Ir a la ciudad'
                : selectedCompleted
                  ? getActivityType(selectedMission!) === 'Informativa'
                    ? 'Volver a realizar esta misión'
                    : 'Ver o modificar mis respuestas'
                  : selectedLocked
                    ? 'Actividad bloqueada'
                    : 'Iniciar actividad'}
            </Button>
          </div>
        }
      />
      <GuideDialogue text="Este es el camino de tu aventura. Antes de iniciar, cada ficha te indica si vas a leer y conversar, registrar una reflexión o responder un test. Puedes cambiar a la ciudad cuando quieras." />
    </div>
  )
}

function getActivityType(mission: FieldMission) {
  if (mission.id === 'beliefs' || mission.kind === 'information') return 'Informativa'
  if (mission.kind === 'questionnaire') return 'Test'
  return 'Registro'
}
function getMissionMeta(mission: FieldMission) {
  if (mission.kind === 'information') return '4 min'
  if (mission.kind === 'reflection') return 'A tu ritmo'
  if (mission.kind === 'deliverable') return '5 min'
  return '6 min'
}
function getMissionIcon(mission: FieldMission, large = false) {
  const className = large ? 'size-10' : undefined
  if (mission.kind === 'information') return <BookOpen className={className} />
  if (mission.kind === 'reflection') return <Feather className={className} />
  if (mission.kind === 'deliverable') return <FileUp className={className} />
  return <ClipboardList className={className} />
}
export { FieldMissionsView }
