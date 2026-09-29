import { AdventureAchievementsView } from './AdventureAchievementsView'
import { getAchievementGroups } from './lib/AdventureAchievements'
import { useAdventure } from './lib/AdventureStore'
import { useSearchParams } from 'react-router'
import {
  Award,
  BriefcaseBusiness,
  GraduationCap,
  School,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/Utils'
import { StudentDecisionSection } from './components/StudentDecisionSection'
import { JournalResurfacing } from './components/JournalResurfacing'
import { careerCatalog, institutionCatalog } from './data/ExplorationCatalogData'
import { occupationCatalog } from './data/OccupationExplorationData'
import type { CatalogSection } from './ExplorationCatalogView'
import type { OccupationProfile } from './types/OccupationExplorationTypes'
import type { DecisionSheet } from './types/StudentDecisionTypes'

type ProfileSection = 'work-world' | 'passport'

type ExplorationProfileScreenProps = {
  achievementIds: string[]
  careerInterestIds: string[]
  decisionSheets: DecisionSheet[]
  institutionInterestIds: string[]
  onOpenCatalogSection: (section: CatalogSection) => void
  profiles: OccupationProfile[]
  setDecisionSheets: React.Dispatch<React.SetStateAction<DecisionSheet[]>>
  view: 'general' | 'decision'
}

function ExplorationProfileView({
  careerInterestIds,
  decisionSheets,
  institutionInterestIds,
  onOpenCatalogSection,
  profiles,
  setDecisionSheets,
  view,
}: ExplorationProfileScreenProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeSection: ProfileSection = searchParams.get('section') === 'passport' ? 'passport' : 'work-world'
  const setActiveSection = (section: ProfileSection) =>
    setSearchParams(section === 'passport' ? { section: 'passport' } : {}, { replace: true })
  const interestedOccupationIds = profiles
    .filter((profile) => profile.interested)
    .map((profile) => profile.occupationId)
  const interestedOccupations = occupationCatalog.filter((item) => interestedOccupationIds.includes(item.id))
  const interestedCareers = careerCatalog.filter((item) => careerInterestIds.includes(item.id))
  const interestedInstitutions = institutionCatalog.filter((item) => institutionInterestIds.includes(item.id))
  const totalInterests =
    interestedOccupations.length + interestedCareers.length + interestedInstitutions.length
  const adventure = useAdventure()
  const unlockedAchievements = getAchievementGroups(adventure)
    .flatMap((group) => group.items)
    .filter((item) => item.done).length

  if (view === 'decision') {
    return (
      <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-10">
        <JournalResurfacing />
        <StudentDecisionSection sheets={decisionSheets} setSheets={setDecisionSheets} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8 md:py-10">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3" variant="default">
            <Sparkles className="size-3.5" /> Tu espacio personal
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mi perfil</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Reúne las opciones que te interesan y las historias de tu pasaporte durante tu proceso de
            orientación vocacional.
          </p>
        </div>
        <AchievementSummary count={unlockedAchievements} onOpen={() => setActiveSection('passport')} />
      </section>

      <nav aria-label="Secciones de mi perfil" className="my-8 flex gap-2 border-b">
        <ProfileTab
          active={activeSection === 'work-world'}
          label="Mundo laboral"
          onClick={() => setActiveSection('work-world')}
        />
        <ProfileTab
          active={activeSection === 'passport'}
          count={unlockedAchievements}
          label="Mi pasaporte"
          onClick={() => setActiveSection('passport')}
        />
      </nav>

      {activeSection === 'work-world' ? (
        <section aria-labelledby="work-world-title">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold" id="work-world-title">
                Lo que me interesa
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Tu selección personal para comparar y seguir explorando.
              </p>
            </div>
            <Badge variant="warning">
              <Star className="size-3 fill-current" /> {totalInterests}{' '}
              {totalInterests === 1 ? 'interés guardado' : 'intereses guardados'}
            </Badge>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <InterestCollection
              emptyMessage="Todavía no guardaste ninguna profesión."
              icon={BriefcaseBusiness}
              items={interestedOccupations.map((item) => ({
                id: item.id,
                label: item.sector,
                name: item.name,
              }))}
              onExplore={() => onOpenCatalogSection('professions')}
              title="Profesiones"
            />
            <InterestCollection
              emptyMessage="Todavía no guardaste ninguna carrera."
              icon={GraduationCap}
              items={interestedCareers.map((item) => ({ id: item.id, label: item.area, name: item.name }))}
              onExplore={() => onOpenCatalogSection('careers')}
              title="Carreras"
            />
            <InterestCollection
              emptyMessage="Todavía no guardaste ninguna institución."
              icon={School}
              items={interestedInstitutions.map((item) => ({
                id: item.id,
                label: item.type,
                name: item.name,
              }))}
              onExplore={() => onOpenCatalogSection('institutions')}
              title="Instituciones educativas"
            />
          </div>
        </section>
      ) : (
        <AdventureAchievementsView />
      )}
    </div>
  )
}

function AchievementSummary({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <button
      className="group flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25 md:w-[300px]"
      onClick={onOpen}
      type="button"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff2cf] text-[#a76618]">
        <Award className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-black leading-none">{count}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">insignias en mi pasaporte</p>
      </div>
      <span
        aria-hidden
        className="text-lg text-muted-foreground transition-transform group-hover:translate-x-1"
      >
        →
      </span>
    </button>
  )
}

function ProfileTab({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean
  count?: number
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={cn(
        'relative flex items-center gap-2 px-4 py-3 text-sm font-bold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/25',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            active ? 'bg-[var(--primary-soft)] text-primary' : 'bg-muted',
          )}
        >
          {count}
        </span>
      )}
      {active && <span className="absolute inset-x-2 bottom-[-1px] h-0.5 rounded-full bg-primary" />}
    </button>
  )
}

function InterestCollection({
  emptyMessage,
  icon: Icon,
  items,
  onExplore,
  title,
}: {
  emptyMessage: string
  icon: LucideIcon
  items: { id: string; label: string; name: string }[]
  onExplore: () => void
  title: string
}) {
  return (
    <Card className="flex min-h-72 flex-col p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-primary">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{items.length} guardadas</p>
          </div>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="mt-5 space-y-2">
          {items.map((item) => (
            <div className="rounded-xl border bg-muted/55 p-3" key={item.id}>
              <p className="text-sm font-bold">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid flex-1 place-items-center py-8 text-center">
          <div>
            <Star className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      )}
      <Button className="mt-auto w-full" onClick={onExplore} size="sm" variant="outline">
        Explorar catálogo
      </Button>
    </Card>
  )
}

export { ExplorationProfileView }
