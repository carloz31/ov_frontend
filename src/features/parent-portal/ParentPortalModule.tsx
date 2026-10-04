import { useMemo } from 'react'
import { BookOpenCheck, Compass, LayoutDashboard, UsersRound } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { AppShell, type AppNavigationGroup } from '@/components/layout/AppShell'
import { appPaths } from '@/routes/paths'
import { parentActivities, parentChildren, parentProfile } from './data/ParentPortalData'
import { parentRoute } from './selectors'
import type { ParentPortalContext } from './ParentPortalContext'
import { updateAdventure, useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'

function ParentPortalModule() {
  const navigate = useNavigate()
  const location = useLocation()
  const { parentCompletedActivityIds: completedActivityIds } = useAdventure()
  const assignedIds = new Set(
    parentRoute(parentActivities, parentChildren, completedActivityIds).assigned.map(
      (activity) => activity.id,
    ),
  )
  const assignedCompletedIds = [...new Set(completedActivityIds)].filter((id) => assignedIds.has(id))
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

  const completeActivity = (activityId: string) => {
    if (!assignedIds.has(activityId)) return
    updateAdventure((current) => ({
      ...current,
      parentCompletedActivityIds: [...new Set([...current.parentCompletedActivityIds, activityId])],
    }))
  }

  return (
    <AppShell
      theme="staff"
      activeItemId={routeState.activeItemId}
      navigationGroups={navigationGroups}
      onLogout={() => navigate(appPaths.home)}
      onOpenProfile={() => navigate(appPaths.parent.overview)}
      title={routeState.title}
      userName={parentProfile.name}
      userRole={parentProfile.relationship}
    >
      <Outlet
        context={
          { completeActivity, completedActivityIds: assignedCompletedIds } satisfies ParentPortalContext
        }
      />
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
