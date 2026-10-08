import { useMemo } from 'react'
import { BookOpenCheck, Compass, LayoutDashboard, UsersRound } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppShell, type AppNavigationGroup } from '@/components/layout/AppShell'
import { ThemeProvider } from '@/components/common/ThemeScope'
import { appPaths } from '@/routes/paths'
import { parentActivities, parentProfile } from '@/features/parent/data/parentPortal'
import type { ParentPortalContext } from '@/features/parent/context/parentPortalContext'
import { useParentJourney } from '@/features/parent/store/parentJourneyStore'
import { completedParentActivities } from '@/features/parent/lib/missionLogic'

function ParentPortalModule() {
  const navigate = useNavigate()
  const location = useLocation()
  const journey = useParentJourney()
  const completedActivityIds = completedParentActivities(parentActivities, journey)
  const routeState = getParentRouteState(location.pathname)
  const navigationGroups = useMemo<AppNavigationGroup[]>(
    () => [
      {
        label: 'Familia',
        items: [
          {
            id: 'overview',
            icon: LayoutDashboard,
            label: 'Inicio',
            onSelect: () => navigate(appPaths.parent.overview),
          },
          {
            id: 'activities',
            icon: BookOpenCheck,
            label: 'Mis actividades',
            onSelect: () => navigate(appPaths.parent.activities),
          },
          {
            id: 'conversations',
            icon: UsersRound,
            label: 'Conversaciones',
            onSelect: () => navigate(appPaths.parent.conversations),
          },
          {
            id: 'careers',
            icon: Compass,
            label: 'Explorar opciones',
            onSelect: () => navigate(appPaths.parent.careers),
          },
        ],
      },
    ],
    [navigate],
  )

  if (/^\/parent\/activities\/[^/]+\/?$/.test(location.pathname))
    return (
      <ThemeProvider theme="staff">
        <div className="theme-staff min-h-svh bg-background text-foreground" data-audience="parent">
          <Outlet context={{ completedActivityIds } satisfies ParentPortalContext} />
        </div>
      </ThemeProvider>
    )

  return (
    <AppShell
      theme="staff"
      audience="parent"
      activeItemId={routeState.activeItemId}
      navigationGroups={navigationGroups}
      onLogout={() => navigate(appPaths.home)}
      onOpenProfile={() => navigate(appPaths.parent.overview)}
      title={routeState.title}
      userName={parentProfile.name}
      userRole={parentProfile.relationship}
    >
      <Outlet context={{ completedActivityIds } satisfies ParentPortalContext} />
    </AppShell>
  )
}

function getParentRouteState(pathname: string) {
  if (pathname.includes('/conversations'))
    return { activeItemId: 'conversations', title: 'Conversaciones en familia' }
  if (pathname.includes('/activities')) {
    return { activeItemId: 'activities', title: 'Actividades para familias' }
  }
  if (pathname.includes('/children')) return { activeItemId: 'overview', title: 'Inicio' }
  if (pathname.includes('/careers')) return { activeItemId: 'careers', title: 'Explorar opciones' }
  return { activeItemId: 'overview', title: 'Inicio' }
}

export { ParentPortalModule }
