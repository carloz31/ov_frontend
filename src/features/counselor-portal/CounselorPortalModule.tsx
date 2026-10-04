import { BookOpenCheck, LayoutDashboard, Megaphone, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppShell, type AppNavigationGroup } from '@/components/layout/AppShell'
import { appPaths } from '@/routes/paths'
import { CounselorPortalProvider } from './CounselorPortalState'
import { counselorProfile } from './data/CounselorPortalData'
import type { CounselorView } from './types/CounselorPortalTypes'

const labels: Record<CounselorView, string> = {
  home: 'Inicio',
  students: 'Estudiantes',
  reviews: 'Registros observados',
  publications: 'Publicaciones',
  priorities: 'Prioritarios',
  settings: 'Configuración',
}

function CounselorPortalModule() {
  const navigate = useNavigate()
  const location = useLocation()
  const view = getView(location.pathname)
  const navigationGroups = useMemo<AppNavigationGroup[]>(
    () => [
      {
        label: 'Panel de la orientadora',
        items: [
          {
            id: 'home',
            icon: LayoutDashboard,
            label: 'Inicio',
            onSelect: () => navigate(appPaths.counselor.home),
          },
          {
            id: 'students',
            icon: Users,
            label: 'Estudiantes',
            onSelect: () => navigate(appPaths.counselor.students),
          },
          {
            id: 'publications',
            icon: Megaphone,
            label: 'Publicaciones',
            onSelect: () => navigate(appPaths.counselor.publications),
          },
          {
            id: 'priorities',
            icon: BookOpenCheck,
            label: 'Prioritarios',
            onSelect: () => navigate(appPaths.counselor.priorities),
          },
        ],
      },
    ],
    [navigate],
  )
  return (
    <CounselorPortalProvider>
      <AppShell
        theme="staff"
        activeItemId={view}
        navigationGroups={navigationGroups}
        onLogout={() => navigate(appPaths.home)}
        onOpenProfile={() => navigate(appPaths.counselor.settings)}
        title={labels[view]}
        userName={counselorProfile.name}
        userRole={counselorProfile.role}
      >
        <Outlet />
      </AppShell>
    </CounselorPortalProvider>
  )
}

function getView(pathname: string): CounselorView {
  if (pathname === '/counselor/students/priorities') return 'priorities'
  const section = pathname.split('/')[2]
  if (section === 'students') return 'students'
  if (section === 'reviews') return 'reviews'
  if (section === 'publications') return 'publications'
  if (section === 'priorities') return 'priorities'
  if (section === 'settings') return 'settings'
  return 'home'
}

export { CounselorPortalModule }
