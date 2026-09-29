import { useEffect, useRef, type ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/Sidebar'
import { AppSidebar } from './AppSidebar'
import { AppTopBar } from './AppTopBar'
import type { AppNavigationGroup } from './navigation'

type AppShellProps = {
  activeItemId: string
  children: ReactNode
  navigationGroups: AppNavigationGroup[]
  onLogout?: () => void
  onOpenProfile?: () => void
  title: string
  userName?: string
  userRole?: string
}

function AppShell({
  activeItemId,
  children,
  navigationGroups,
  onLogout,
  onOpenProfile,
  title,
  userName,
  userRole,
}: AppShellProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [activeItemId])
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar
        activeItemId={activeItemId}
        groups={navigationGroups}
        onLogout={onLogout}
        onOpenProfile={onOpenProfile}
        userName={userName}
        userRole={userRole}
      />
      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
        <AppTopBar title={title} />
        <div
          ref={contentRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [&>*]:!mx-0 [&>*]:!max-w-none [&>*]:!w-full"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export { AppShell }
export type { AppNavigationGroup } from './navigation'
