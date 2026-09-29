import { useState } from 'react'
import { Building2, ClipboardList, Flame, KeyRound, Play, Search, UsersRound } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { AdventureMap } from '@/components/AdventureMap'
import { GuideDialogue } from '@/components/GuideDialogue'
import { MapPointDrawer } from '@/components/MapPointDrawer'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { appPaths } from '@/routes/paths'
import { cityCases, fieldMissions } from './data/AdventureData'
import { canAccessCity, useAdventure } from './lib/AdventureStore'
import { getExplorationImagePath } from './lib/ExplorationAssets'
import { getActivityPrompt } from './data/JournalData'
import { AdventureModeSwitch } from './components/AdventureModeSwitch'
import { JournalEntryCard } from './components/JournalEntryCard'
import { activityById } from '../missions/content'
import { JourneyPlayer } from '../missions/JourneyPlayer'
import { useJourney } from '../missions/store'
import '../missions/journey.css'

function CityGate() {
  const state = useAdventure()
  const navigate = useNavigate()
  return (
    <div className="adventure-page grid min-h-full place-items-center p-6">
      <div className="adventure-card max-w-xl p-8 text-center">
        <KeyRound className="mx-auto mb-5 size-14 text-[#a88643]" />
        <p className="adventure-eyebrow justify-center">CAPÍTULO 02 · LA CIUDAD</p>
        <h1 className="my-4 text-3xl font-bold">Una llave, mil posibilidades</h1>
        <p className="leading-7 text-muted-foreground">
          La ciudad abrirá sus puertas cuando completes todas las Misiones de Campo. Allí podrás ayudar a sus
          habitantes e investigar profesiones.
        </p>
        <Progress
          className="my-6"
          value={
            (fieldMissions.filter((item) => state.completedMissionIds.includes(item.id)).length /
              fieldMissions.length) *
            100
          }
        />
        <Button onClick={() => navigate(appPaths.student.missions)}>Continuar mi recorrido</Button>
      </div>
    </div>
  )
}
function CityMapView() {
  const state = useAdventure()
  const journey = useJourney()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string>()
  const selected = cityCases.find((item) => item.id === selectedId)
  const researchSelected = selectedId === 'research'
  const testSelected = selectedId === 'mara-test'
  const testActivity = activityById('act-tip-01')
  const testCompleted = journey.progress['act-tip-01']?.estado === 'completada'
  const testJournalPrompt =
    testActivity?.promptDiario ?? getActivityPrompt('act-tip-01', state.readinessCheckIns)
  const satisfaction = Math.round(
    (cityCases.filter((item) => state.solvedCaseIds.includes(item.id)).length / cityCases.length) * 100,
  )
  if (!canAccessCity(state)) return <CityGate />
  if (testActivity && params.get('actividad') === testActivity.id)
    return (
      <JourneyPlayer
        activity={testActivity}
        direct={params.get('modo') === 'directa'}
        onClose={() => setParams({})}
        onNext={() => setParams({})}
      />
    )
  return (
    <div className="adventure-page relative h-full min-h-0">
      <h1 className="sr-only">Aventura · Ciudad</h1>
      <AdventureMap
        variant="open"
        backgroundImage="/images/adventure/city-map.jpeg"
        label="Central de Casos · Llamados de la ciudad"
        progress={{
          icon: <UsersRound className="size-4" />,
          label: 'Satisfacción de las personas',
          value: satisfaction,
        }}
        points={[
          ...cityCases.map((item) => ({
            ...item,
            subtitle: state.solvedCaseIds.includes(item.id)
              ? 'La comunidad te agradece'
              : 'Un llamado de auxilio',
            icon: item.id === 'forest-fire' ? <Flame /> : <Building2 />,
            status: state.solvedCaseIds.includes(item.id) ? ('completed' as const) : ('available' as const),
          })),
          {
            id: 'research',
            title: 'Estación de investigación',
            subtitle: 'Conoce una carrera de cerca',
            x: 980,
            y: 140,
            icon: <Search />,
            status: 'available',
          },
          {
            id: 'mara-test',
            title: 'Una vuelta por el molino',
            subtitle: testCompleted ? 'Test · Primera interacción completada' : 'Test · Interacción 1 de 14',
            x: 875,
            y: 530,
            icon: <ClipboardList />,
            status: testCompleted ? ('completed' as const) : ('available' as const),
          },
        ]}
        onSelect={setSelectedId}
      />
      <AdventureModeSwitch />
      <GuideDialogue text="Cada llamado es una oportunidad para descubrir cómo distintas profesiones se complementan. También puedes visitar la estación de investigación para conocer una carrera de cerca." />
      <MapPointDrawer
        open={Boolean(selected || researchSelected || testSelected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(undefined)
        }}
        eyebrow={
          researchSelected
            ? 'Estación de investigación'
            : testSelected
              ? 'Molino de la ciudad'
              : 'Llamado de la ciudad'
        }
        badge={
          testSelected
            ? testCompleted
              ? 'Completada'
              : 'Test'
            : selected && state.solvedCaseIds.includes(selected.id)
              ? 'Caso resuelto'
              : 'Disponible'
        }
        meta={
          researchSelected
            ? 'Exploración libre'
            : testSelected
              ? 'Interacción 1 de 14 · 4 min'
              : 'Caso vocacional'
        }
        title={
          researchSelected
            ? 'Misión de investigación'
            : testSelected
              ? 'Una vuelta por el molino'
              : (selected?.title ?? '')
        }
        description={
          researchSelected
            ? 'Elige una carrera, invita hasta dos compañeros y prepara una guía de preguntas para conocer cómo se vive realmente esa profesión.'
            : testSelected
              ? 'Conversa con Mara y responde siete preguntas del Test de Intereses Profesionales. No hay respuestas correctas o incorrectas.'
              : (selected?.description ?? '')
        }
        imageUrl={
          selected
            ? getExplorationImagePath(
                selected.id === 'forest-fire'
                  ? 'forest-fire-case-background.png'
                  : 'exploration-case-background.png',
              )
            : undefined
        }
        visual={
          researchSelected ? (
            <span className="grid size-20 place-items-center rounded-full border-4 border-[#98c9d4] bg-[#dff4f5] text-[#46717c] shadow-[0_8px_0_#72adba]">
              <Search className="size-10" />
            </span>
          ) : testSelected ? (
            <span className="grid size-20 place-items-center rounded-full border-4 border-[#b8c9a8] bg-[#eaf0df] text-[#52725b] shadow-[0_8px_0_#91aa7c]">
              <ClipboardList className="size-10" />
            </span>
          ) : undefined
        }
        footer={
          researchSelected ? (
            <Button className="w-full" size="lg" onClick={() => navigate(appPaths.student.research)}>
              <Play /> Iniciar
            </Button>
          ) : testSelected ? (
            <div className="space-y-4">
              <JournalEntryCard
                completed={testCompleted}
                prompt={testJournalPrompt}
                onOpen={() => {
                  const query = new URLSearchParams({
                    activity: 'act-tip-01',
                    title: testActivity?.titulo ?? 'Una vuelta por el molino',
                    prompt: testJournalPrompt,
                  })
                  navigate(`${appPaths.student.journal}?${query}`)
                }}
              />
              <Button className="w-full" size="lg" onClick={() => setParams({ actividad: 'act-tip-01' })}>
                <Play /> {testCompleted ? 'Ver resumen' : 'Iniciar test'}
              </Button>
            </div>
          ) : selected ? (
            <Button
              className="w-full"
              size="lg"
              disabled={selected.id !== 'forest-fire'}
              onClick={() => navigate(appPaths.student.case(selected.id))}
            >
              <Play /> Iniciar
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
export { CityMapView, CityGate }
