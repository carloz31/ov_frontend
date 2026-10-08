import { Navigate, useNavigate, useParams } from 'react-router'
import { appPaths } from '@/routes/paths'
import { ExplorationCaseIntroView } from './ExplorationCaseIntroView'
import { ForestFireCaseView } from './ForestFireCaseView'
import { canAccessCity, useAdventure } from './lib/AdventureStore'

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
        navigate(appPaths.student.exploration)
      }}
    />
  )
}

export { ExplorationCaseIntroPage, ForestFireCasePage }
