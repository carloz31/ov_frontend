import { Navigate, useNavigate, useParams } from 'react-router'
import { appPaths } from '@/routes/paths'
import { ExplorationCaseIntroView } from './ExplorationCaseIntroView'
import { ExplorationCatalogView, type CatalogSection } from './ExplorationCatalogView'
import { CityMapView } from './CityMapView'
import { ExplorationProfileView } from './ExplorationProfileView'
import { FieldMissionsView } from './FieldMissionsView'
import { ForestFireCaseView } from './ForestFireCaseView'
import { useOccupationExplorationContext } from './OccupationExplorationContext'
import { TestimonialsView } from './TestimonialsView'
import { canAccessCity, completeCase, prototypeAllUnlocked, useAdventure } from './lib/AdventureStore'
import { professionalTestimonials } from './data/OccupationExplorationData'
import { cityCases } from './data/AdventureData'

function ExplorationHomePage() {
  return <CityMapView />
}

function FieldMissionsPage() {
  return <FieldMissionsView />
}

function ExplorationCatalogPage({ section }: { section: CatalogSection }) {
  const navigate = useNavigate()
  const {
    careerInterestIds,
    institutionInterestIds,
    profiles,
    toggleCareerInterest,
    toggleInstitutionInterest,
    toggleOccupationInterest,
  } = useOccupationExplorationContext()

  return (
    <ExplorationCatalogView
      careerInterestIds={careerInterestIds}
      institutionInterestIds={institutionInterestIds}
      onSectionChange={(nextSection) => navigate(appPaths.student.catalog[nextSection])}
      onToggleCareerInterest={toggleCareerInterest}
      onToggleInstitutionInterest={toggleInstitutionInterest}
      onToggleOccupationInterest={toggleOccupationInterest}
      profiles={profiles}
      section={section}
    />
  )
}

function ExplorationProfilePage({ view }: { view: 'general' | 'decision' }) {
  const navigate = useNavigate()
  const {
    achievementIds,
    careerInterestIds,
    decisionSheets,
    institutionInterestIds,
    profiles,
    setDecisionSheets,
  } = useOccupationExplorationContext()

  return (
    <ExplorationProfileView
      achievementIds={achievementIds}
      careerInterestIds={careerInterestIds}
      decisionSheets={decisionSheets}
      institutionInterestIds={institutionInterestIds}
      onOpenCatalogSection={(section) => navigate(appPaths.student.catalog[section])}
      profiles={profiles}
      setDecisionSheets={setDecisionSheets}
      view={view}
    />
  )
}

function TestimonialsPage() {
  const state = useAdventure()
  const satisfaction = state.solvedCaseIds.length / cityCases.length
  return (
    <TestimonialsView
      unlockedTestimonialIds={
        prototypeAllUnlocked
          ? professionalTestimonials.map((item) => item.id)
          : canAccessCity(state)
            ? professionalTestimonials
                .filter((_, index) => satisfaction >= (index + 1) / professionalTestimonials.length)
                .map((item) => item.id)
            : []
      }
    />
  )
}

function ExplorationCaseIntroPage() {
  const navigate = useNavigate()
  const { caseId = 'forest-fire' } = useParams()
  const state = useAdventure()
  if (!canAccessCity(state)) return <Navigate replace to={appPaths.student.missions} />
  if (caseId !== 'forest-fire') return <Navigate replace to={appPaths.student.exploration} />

  return (
    <ExplorationCaseIntroView
      onClose={() => navigate(appPaths.student.exploration)}
      onStart={() => navigate(appPaths.student.casePlay(caseId))}
    />
  )
}

function ForestFireCasePage() {
  const navigate = useNavigate()
  const { caseId } = useParams()
  const state = useAdventure()
  if (!canAccessCity(state)) return <Navigate replace to={appPaths.student.missions} />
  if (caseId !== 'forest-fire') return <Navigate replace to={appPaths.student.exploration} />

  return (
    <ForestFireCaseView
      onClose={() => navigate(appPaths.student.exploration)}
      onComplete={() => {
        completeCase('forest-fire')
        navigate(appPaths.student.exploration)
      }}
    />
  )
}

export {
  ExplorationCaseIntroPage,
  ExplorationCatalogPage,
  ExplorationHomePage,
  ExplorationProfilePage,
  FieldMissionsPage,
  ForestFireCasePage,
  TestimonialsPage,
}
