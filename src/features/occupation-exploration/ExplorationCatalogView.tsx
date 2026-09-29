import { useMemo, useState, type ReactNode } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCog,
  Camera,
  ChefHat,
  GraduationCap,
  HeartPulse,
  Languages,
  MapPin,
  MessageSquareText,
  Palette,
  PenTool,
  Scale,
  Search,
  School,
  Shield,
  Sparkles,
  Star,
  TicketCheck,
  Volume2,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { OccupationDetailDialog } from './components/OccupationDetailDialog'
import { careerCatalog, institutionCatalog } from './data/ExplorationCatalogData'
import type { CareerCatalogItem, InstitutionCatalogItem } from './data/ExplorationCatalogData'
import { occupationCatalog } from './data/OccupationExplorationData'
import type { Occupation, OccupationProfile } from './types/OccupationExplorationTypes'

type CatalogSection = 'professions' | 'careers' | 'institutions'

type ExplorationCatalogScreenProps = {
  careerInterestIds: string[]
  institutionInterestIds: string[]
  onToggleCareerInterest: (careerId: string) => void
  onToggleInstitutionInterest: (institutionId: string) => void
  onToggleOccupationInterest: (occupationId: string) => void
  onSectionChange: (section: CatalogSection) => void
  profiles: OccupationProfile[]
  section: CatalogSection
}

const occupationIcons: Record<string, LucideIcon> = {
  'sound-technician': Volume2,
  electrician: Zap,
  'event-coordinator': CalendarCog,
  translator: Languages,
  'community-manager': MessageSquareText,
  'graphic-designer': Palette,
  'event-assistant': TicketCheck,
  'security-guard': Shield,
  paramedic: HeartPulse,
  photographer: Camera,
  lawyer: Scale,
  cook: ChefHat,
  illustrator: PenTool,
}

const sectionCopy: Record<
  CatalogSection,
  { description: string; label: string; placeholder: string; singularLabel: string; title: string }
> = {
  professions: {
    title: 'Catálogo de profesiones',
    label: 'profesiones',
    singularLabel: 'profesión',
    placeholder: 'Buscar una profesión por nombre',
    description: 'Conoce qué hacen distintos profesionales, dónde trabajan y qué habilidades utilizan.',
  },
  careers: {
    title: 'Catálogo de carreras',
    label: 'carreras',
    singularLabel: 'carrera',
    placeholder: 'Buscar una carrera por nombre',
    description: 'Explora rutas de formación y descubre los campos en los que podrías desarrollarte.',
  },
  institutions: {
    title: 'Instituciones educativas',
    label: 'instituciones',
    singularLabel: 'institución',
    placeholder: 'Buscar una institución por nombre',
    description: 'Compara tipos de instituciones y conoce las áreas de estudio que pueden ofrecer.',
  },
}

function ExplorationCatalogView({
  careerInterestIds,
  institutionInterestIds,
  onSectionChange,
  onToggleCareerInterest,
  onToggleInstitutionInterest,
  onToggleOccupationInterest,
  profiles,
  section,
}: ExplorationCatalogScreenProps) {
  const [query, setQuery] = useState('')
  const [detailOccupation, setDetailOccupation] = useState<Occupation>()
  const [detailCareer, setDetailCareer] = useState<CareerCatalogItem>()
  const [detailInstitution, setDetailInstitution] = useState<InstitutionCatalogItem>()
  const copy = sectionCopy[section]

  const filteredOccupations = useMemo(
    () => occupationCatalog.filter((item) => matchesName(item.name, query)),
    [query],
  )
  const filteredCareers = useMemo(
    () => careerCatalog.filter((item) => matchesName(item.name, query)),
    [query],
  )
  const filteredInstitutions = useMemo(
    () => institutionCatalog.filter((item) => matchesName(item.name, query)),
    [query],
  )

  const resultCount =
    section === 'professions'
      ? filteredOccupations.length
      : section === 'careers'
        ? filteredCareers.length
        : filteredInstitutions.length

  function changeSection(nextSection: CatalogSection) {
    setQuery('')
    onSectionChange(nextSection)
  }

  return (
    <div className="mx-auto max-w-[1220px] px-5 py-8 md:px-8 md:py-10">
      <section>
        <Badge className="mb-3" variant="default">
          <BookOpen className="size-3.5" /> Catálogo de orientación
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{copy.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{copy.description}</p>
      </section>

      <CatalogSectionNavigation activeSection={section} onChange={changeSection} />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label={copy.placeholder}
            className="h-12 w-full rounded-2xl border bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-primary/45 focus:ring-3 focus:ring-ring/20"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.placeholder}
            type="search"
            value={query}
          />
        </label>
        <p className="shrink-0 text-sm font-semibold text-muted-foreground">
          {resultCount} {resultCount === 1 ? copy.singularLabel : copy.label}
        </p>
      </div>

      {resultCount === 0 ? (
        <EmptyCatalogResult query={query} />
      ) : section === 'professions' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredOccupations.map((occupation) => {
            const profile = profiles.find((item) => item.occupationId === occupation.id)
            return (
              <OccupationCatalogCard
                key={occupation.id}
                occupation={occupation}
                onView={() => setDetailOccupation(occupation)}
                profile={profile}
              />
            )
          })}
        </div>
      ) : section === 'careers' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCareers.map((career) => (
            <CareerCatalogCard
              career={career}
              interested={careerInterestIds.includes(career.id)}
              key={career.id}
              onView={() => setDetailCareer(career)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredInstitutions.map((institution) => (
            <InstitutionCatalogCard
              institution={institution}
              interested={institutionInterestIds.includes(institution.id)}
              key={institution.id}
              onView={() => setDetailInstitution(institution)}
            />
          ))}
        </div>
      )}

      <OccupationDetailDialog
        interested={Boolean(
          detailOccupation &&
          profiles.find((profile) => profile.occupationId === detailOccupation.id)?.interested,
        )}
        occupation={detailOccupation}
        onClose={() => setDetailOccupation(undefined)}
        onToggleInterest={
          detailOccupation ? () => onToggleOccupationInterest(detailOccupation.id) : undefined
        }
      />
      <CareerDetailDialog
        career={detailCareer}
        interested={Boolean(detailCareer && careerInterestIds.includes(detailCareer.id))}
        onClose={() => setDetailCareer(undefined)}
        onToggleInterest={detailCareer ? () => onToggleCareerInterest(detailCareer.id) : undefined}
      />
      <InstitutionDetailDialog
        institution={detailInstitution}
        interested={Boolean(detailInstitution && institutionInterestIds.includes(detailInstitution.id))}
        onClose={() => setDetailInstitution(undefined)}
        onToggleInterest={
          detailInstitution ? () => onToggleInstitutionInterest(detailInstitution.id) : undefined
        }
      />
    </div>
  )
}

function CatalogSectionNavigation({
  activeSection,
  onChange,
}: {
  activeSection: CatalogSection
  onChange: (section: CatalogSection) => void
}) {
  const sections: { icon: LucideIcon; id: CatalogSection; label: string }[] = [
    { id: 'professions', label: 'Profesiones', icon: BriefcaseBusiness },
    { id: 'careers', label: 'Carreras', icon: GraduationCap },
    { id: 'institutions', label: 'Instituciones educativas', icon: School },
  ]

  return (
    <nav
      aria-label="Secciones del catálogo"
      className="my-8 grid gap-2 rounded-2xl border bg-white p-2 shadow-sm sm:grid-cols-3"
    >
      {sections.map(({ icon: Icon, id, label }) => (
        <button
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors',
            activeSection === id
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
          key={id}
          onClick={() => onChange(id)}
          type="button"
        >
          <Icon className="size-[18px]" /> {label}
        </button>
      ))}
    </nav>
  )
}

function OccupationCatalogCard({
  occupation,
  onView,
  profile,
}: {
  occupation: Occupation
  onView: () => void
  profile: OccupationProfile | undefined
}) {
  const Icon = occupationIcons[occupation.id] ?? BriefcaseBusiness
  const hasContact = profile?.discoveryState === 'unlocked' || profile?.discoveryState === 'explored'

  return (
    <Card className="relative overflow-hidden p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3 pr-10">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl text-white"
          style={{ background: occupation.color }}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-6">{occupation.name}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{occupation.sector}</p>
        </div>
      </div>
      <Button
        aria-label={`Ver ficha de ${occupation.name}`}
        className="absolute right-4 top-4"
        onClick={onView}
        size="icon"
        title={`Ver ficha de ${occupation.name}`}
        variant="ghost"
      >
        <BookOpen />
      </Button>
      <p className="mt-4 min-h-14 text-sm leading-6 text-muted-foreground">{occupation.shortDescription}</p>
      <div className="mt-4 flex min-h-8 flex-wrap gap-1 border-t pt-3">
        {hasContact ? (
          <Badge variant="success">
            <Sparkles className="size-3" /> Contacto conseguido
          </Badge>
        ) : (
          <Badge variant="outline">Aún sin contacto</Badge>
        )}
        {profile?.discoveryState === 'explored' && (
          <Badge variant="secondary">
            <BookOpen className="size-3" /> Explorada previamente
          </Badge>
        )}
        {profile?.interested && (
          <Badge variant="warning">
            <Star className="size-3 fill-current" /> Me interesa
          </Badge>
        )}
      </div>
    </Card>
  )
}

function CareerCatalogCard({
  career,
  interested,
  onView,
}: {
  career: CareerCatalogItem
  interested: boolean
  onView: () => void
}) {
  return (
    <CatalogInformationCard
      description={career.description}
      icon={GraduationCap}
      interested={interested}
      label={career.area}
      name={career.name}
      onView={onView}
    />
  )
}

function InstitutionCatalogCard({
  institution,
  interested,
  onView,
}: {
  institution: InstitutionCatalogItem
  interested: boolean
  onView: () => void
}) {
  return (
    <CatalogInformationCard
      description={institution.description}
      icon={School}
      interested={interested}
      label={institution.type}
      name={institution.name}
      onView={onView}
    />
  )
}

function CatalogInformationCard({
  description,
  icon: Icon,
  interested,
  label,
  name,
  onView,
}: {
  description: string
  icon: LucideIcon
  interested: boolean
  label: string
  name: string
  onView: () => void
}) {
  return (
    <Card className="relative overflow-hidden p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-3 pr-10">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-soft)] text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold leading-6">{name}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </div>
      <Button
        aria-label={`Ver ficha de ${name}`}
        className="absolute right-4 top-4"
        onClick={onView}
        size="icon"
        title={`Ver ficha de ${name}`}
        variant="ghost"
      >
        <BookOpen />
      </Button>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      {interested && (
        <Badge className="mt-4" variant="warning">
          <Star className="size-3 fill-current" /> Me interesa
        </Badge>
      )}
    </Card>
  )
}

function CareerDetailDialog({
  career,
  interested,
  onClose,
  onToggleInterest,
}: {
  career: CareerCatalogItem | undefined
  interested: boolean
  onClose: () => void
  onToggleInterest?: () => void
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={Boolean(career)}>
      {career && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Badge className="w-fit" variant="secondary">
              {career.area}
            </Badge>
            <DialogTitle>{career.name}</DialogTitle>
            <DialogDescription>{career.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <CatalogDetailSection icon={GraduationCap} title="Duración referencial">
              {career.duration}
            </CatalogDetailSection>
            <CatalogDetailSection icon={BriefcaseBusiness} title="Campos de desarrollo">
              <BadgeList items={career.opportunities} />
            </CatalogDetailSection>
          </div>
          {onToggleInterest && <InterestButton interested={interested} onClick={onToggleInterest} />}
        </DialogContent>
      )}
    </Dialog>
  )
}

function InstitutionDetailDialog({
  institution,
  interested,
  onClose,
  onToggleInterest,
}: {
  institution: InstitutionCatalogItem | undefined
  interested: boolean
  onClose: () => void
  onToggleInterest?: () => void
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={Boolean(institution)}>
      {institution && (
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <Badge className="w-fit" variant="secondary">
              {institution.type}
            </Badge>
            <DialogTitle>{institution.name}</DialogTitle>
            <DialogDescription>{institution.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <CatalogDetailSection icon={MapPin} title="Disponibilidad referencial">
              {institution.location}
            </CatalogDetailSection>
            <CatalogDetailSection icon={Building2} title="Áreas de estudio">
              <BadgeList items={institution.studyAreas} />
            </CatalogDetailSection>
          </div>
          {onToggleInterest && <InterestButton interested={interested} onClick={onToggleInterest} />}
        </DialogContent>
      )}
    </Dialog>
  )
}

function InterestButton({ interested, onClick }: { interested: boolean; onClick: () => void }) {
  return (
    <div className="border-t pt-4">
      <Button className="w-full sm:w-auto" onClick={onClick} variant={interested ? 'secondary' : 'default'}>
        <Star className={interested ? 'fill-current' : undefined} />
        {interested ? 'Quitar de mis intereses' : 'Me interesa'}
      </Button>
    </div>
  )
}

function CatalogDetailSection({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode
  icon: LucideIcon
  title: string
}) {
  return (
    <section className="rounded-2xl bg-muted p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold">
        <Icon className="size-4 text-primary" />
        {title}
      </h3>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  )
}

function BadgeList({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item} variant="outline">
          {item}
        </Badge>
      ))}
    </span>
  )
}

function EmptyCatalogResult({ query }: { query: string }) {
  return (
    <div className="rounded-3xl border border-dashed bg-white px-6 py-14 text-center">
      <Search className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-4 font-bold">No encontramos resultados</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Prueba con otro nombre{query ? ` en lugar de “${query}”` : ''}.
      </p>
    </div>
  )
}

function matchesName(name: string, query: string) {
  const normalizedQuery = normalizeSearchText(query.trim())
  return normalizedQuery.length === 0 || normalizeSearchText(name).includes(normalizedQuery)
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
}

export { ExplorationCatalogView }
export type { CatalogSection }
