import { useMemo } from 'react'
import { BookOpenCheck, Compass, LayoutDashboard, UsersRound } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppShell, type AppNavigationGroup } from '@/components/layout/AppShell'
import { appPaths } from '@/routes/paths'
import { parentChildren, parentProfile } from './data/ParentPortalData'
import type { ParentPortalContext } from './ParentPortalContext'
import { updateAdventure, useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'

function ParentPortalModule() {
  const navigate = useNavigate()
  const location = useLocation()
  const { parentCompletedActivityIds: completedActivityIds } = useAdventure()
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
            label: 'Actividades',
            onSelect: () => navigate(appPaths.parent.activities),
          },
          {
            id: 'conversations',
            icon: UsersRound,
            label: 'Conversaciones',
            onSelect: () => navigate(appPaths.parent.conversations),
          },
          {
            id: 'children',
            icon: UsersRound,
            label: 'Mis hijos',
            onSelect: () => navigate(appPaths.parent.child(parentChildren[0].id)),
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

  const completeActivity = (activityId: string) => {
    updateAdventure((current) => ({
      ...current,
      parentCompletedActivityIds: [...new Set([...current.parentCompletedActivityIds, activityId])],
    }))
  }

  return (
    <AppShell
      activeItemId={routeState.activeItemId}
      navigationGroups={navigationGroups}
      onLogout={() => navigate(appPaths.home)}
      onOpenProfile={() => navigate(appPaths.parent.overview)}
      title={routeState.title}
      userName={parentProfile.name}
      userRole={parentProfile.relationship}
    >
      <Outlet context={{ completeActivity, completedActivityIds } satisfies ParentPortalContext} />
    </AppShell>
  )
}

function getParentRouteState(pathname: string) {
  if (pathname.includes('/conversations'))
    return { activeItemId: 'conversations', title: 'Conversaciones en familia' }
  if (pathname.includes('/activities')) {
    return { activeItemId: 'activities', title: 'Actividades para familias' }
  }
  if (pathname.includes('/children')) return { activeItemId: 'children', title: 'Mis hijos' }
  if (pathname.includes('/careers')) return { activeItemId: 'careers', title: 'Explorar opciones' }
  return { activeItemId: 'overview', title: 'Inicio' }
}

export { ParentPortalModule }
