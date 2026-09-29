import { useMemo } from 'react'
import {
  FolderHeart,
  LibraryBig,
  MapPinned,
  MessageSquareQuote,
  BookOpen,
  Backpack,
  HeartHandshake,
} from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppShell, type AppNavigationGroup } from '@/components/layout/AppShell'
import { GuideDialogue } from '@/components/GuideDialogue'
import { appPaths } from '@/routes/paths'
import type { CatalogSection } from './ExplorationCatalogView'
import { useOccupationExplorationContext } from './OccupationExplorationContext'
import { getTravelerLevel, useAdventure, useAdventureStorageError } from './lib/AdventureStore'
import './adventure.css'

type CatalogView = `catalog-${CatalogSection}`
type ModuleView =
  | 'central'
  | 'missions'
  | 'profile-general'
  | 'profile-decisions'
  | 'testimonials'
  | 'research'
  | 'journal'
  | 'journal-signals'
  | 'community'
  | 'resources'
  | 'conversations'
  | CatalogView

const catalogPathBySection: Record<CatalogSection, string> = appPaths.student.catalog

function OccupationExplorationShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const context = useOccupationExplorationContext()
  const adventure = useAdventure()
  const storageError = useAdventureStorageError()
  const level = getTravelerLevel(adventure)
  const view = getViewFromPath(location.pathname)
  const guideText = getGuideText(view)
  const isMapView = view === 'central' || view === 'missions'
  const navigationGroups = useMemo<AppNavigationGroup[]>(
    () => [
      {
        label: 'Mi aventura',
        items: [
          {
            id: 'adventure',
            icon: MapPinned,
            label: 'Aventura',
            onSelect: () => navigate(appPaths.student.missions),
          },
          {
            id: 'journal',
            icon: BookOpen,
            label: 'Mi diario',
            onSelect: () => navigate(appPaths.student.journal),
          },
          {
            id: 'conversations',
            icon: HeartHandshake,
            label: 'En familia',
            onSelect: () => navigate(appPaths.student.conversations),
          },
          {
            id: 'resources',
            icon: Backpack,
            label: 'Recursos y novedades',
            onSelect: () => navigate(appPaths.student.resources),
          },
          {
            id: 'catalog',
            icon: LibraryBig,
            label: 'Catálogo',
            children: [
              {
                id: 'catalog-professions',
                label: 'Profesiones',
                onSelect: () => navigate(catalogPathBySection.professions),
              },
              {
                id: 'catalog-careers',
                label: 'Carreras',
                onSelect: () => navigate(catalogPathBySection.careers),
              },
              {
                id: 'catalog-institutions',
                label: 'Instituciones educativas',
                onSelect: () => navigate(catalogPathBySection.institutions),
              },
            ],
          },
          {
            id: 'testimonials',
            icon: MessageSquareQuote,
            label: 'Héroes de la ciudad',
            onSelect: () => navigate(appPaths.student.testimonials),
          },
          {
            id: 'profile',
            icon: FolderHeart,
            label: 'Mi perfil',
            children: [
              {
                id: 'profile-general',
                label: 'Información general',
                onSelect: () => navigate(appPaths.student.profile),
              },
              {
                id: 'profile-decisions',
                label: 'Mi decisión',
                onSelect: () => navigate(appPaths.student.decisions),
              },
            ],
          },
        ],
      },
    ],
    [navigate],
  )

  return (
    <AppShell
      activeItemId={
        view === 'central' || view === 'missions' || view === 'research'
          ? 'adventure'
          : view === 'journal-signals'
            ? 'journal'
            : view
      }
      navigationGroups={navigationGroups}
      onLogout={() => navigate(appPaths.home)}
      onOpenProfile={() => navigate(appPaths.student.profile)}
      title={getViewLabel(view)}
      userRole={`Niv. ${level.number} · ${level.label}`}
    >
      {storageError && (
        <p role="alert" className="border-b bg-amber-50 p-3 text-sm text-amber-900">
          No se pudo guardar el avance en este navegador. Evita cerrar la página hasta liberar espacio o
          permitir el almacenamiento.
        </p>
      )}
      <div className={isMapView ? 'h-full min-h-0' : guideText ? 'min-h-full bg-[#f6f5eb]' : 'min-h-full'}>
        <Outlet context={context} />
      </div>
      {guideText && <GuideDialogue key={view} text={guideText} />}
    </AppShell>
  )
}

function getViewFromPath(pathname: string): ModuleView {
  const section = pathname.split('/')[2]
  if (pathname.endsWith('/journal/signal')) return 'journal-signals'
  if (['research', 'journal', 'community', 'resources', 'conversations'].includes(section))
    return section as ModuleView
  if (pathname.endsWith('/missions')) return 'missions'
  if (pathname.endsWith('/catalog/careers')) return 'catalog-careers'
  if (pathname.endsWith('/catalog/institutions')) return 'catalog-institutions'
  if (pathname.endsWith('/catalog/professions')) return 'catalog-professions'
  if (pathname.endsWith('/testimonials')) return 'testimonials'
  if (pathname.endsWith('/profile/decisions')) return 'profile-decisions'
  if (pathname.endsWith('/profile')) return 'profile-general'
  return 'central'
}

function getCatalogSection(view: ModuleView): CatalogSection | undefined {
  if (view === 'catalog-professions') return 'professions'
  if (view === 'catalog-careers') return 'careers'
  if (view === 'catalog-institutions') return 'institutions'
  return undefined
}

function getViewLabel(view: ModuleView) {
  const labels: Partial<Record<ModuleView, string>> = {
    research: 'Misión de investigación',
    journal: 'Mi diario',
    'journal-signals': 'Mi diario → Señales',
    community: 'Salón y Crew',
    resources: 'Recursos y novedades',
    conversations: 'En familia',
  }
  if (labels[view]) return labels[view]
  if (getCatalogSection(view)) return 'Catálogo'
  if (view === 'central' || view === 'missions') return 'Aventura'
  if (view === 'testimonials') return 'Héroes de la ciudad'
  if (view === 'profile-general' || view === 'profile-decisions') return 'Mi perfil'
  return 'Exploración'
}

function getGuideText(view: ModuleView) {
  const guides: Partial<Record<ModuleView, string>> = {
    journal:
      'Tu diario es completamente privado. Puedes escribir cuando quieras; tu orientadora solo verá la señal separada de seguridad vocacional cuando hagas un check-in.',
    'journal-signals':
      'Este historial reúne únicamente tus señales. Elige un punto para volver a las entradas privadas que escribiste ese mismo día.',
    community:
      'Algunos descubrimientos crecen al compartirlos. Invita a quienes quieras caminar contigo: tu Crew puede tener hasta tres viajeros, contigo incluido.',
    resources:
      'En este espacio puedes leer publicaciones de tu orientadora, revisar eventos y descubrir las entrevistas que comparte tu salón. Guarda lo que quieras volver a mirar.',
    testimonials:
      'Los héroes de esta ciudad también empezaron con preguntas. Ayuda a sus habitantes para descubrir sus historias y conocer de cerca sus profesiones.',
    'catalog-professions':
      'Explora las profesiones sin buscar una respuesta definitiva. Guarda las que despierten tu curiosidad y vuelve a compararlas cuando descubras nuevas pistas.',
    'catalog-careers':
      'Las carreras son caminos de formación. Revisa qué se aprende en cada una y guarda las opciones que quieras investigar con más calma.',
    'catalog-institutions':
      'Cada institución ofrece una experiencia distinta. Observa sus características y guarda las alternativas que podrían encajar con tu camino.',
    'profile-general':
      'Este espacio reúne los intereses y hallazgos que vas guardando. Úsalo para mirar cómo cambia tu exploración con el tiempo.',
    'profile-decisions':
      'Aquí puedes ordenar tus opciones y registrar qué información te falta. Una decisión se construye comparando, preguntando y volviendo a mirar.',
  }
  return guides[view]
}

export { OccupationExplorationShell }
