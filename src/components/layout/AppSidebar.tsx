import { Compass } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/Sidebar'
import { AppNavMain } from './AppNavMain'
import { AppNavUser } from './AppNavUser'
import type { AppNavigationGroup } from './navigation'

type AppSidebarProps = {
  activeItemId: string
  groups: AppNavigationGroup[]
  onLogout?: () => void
  onOpenProfile?: () => void
  userName?: string
  userRole?: string
}

function AppSidebar({ activeItemId, groups, onLogout, onOpenProfile, userName, userRole }: AppSidebarProps) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12 rounded-xl" size="lg">
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Compass className="size-5" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Orientación
                </span>
                <span className="truncate text-base font-bold text-foreground">Explora</span>
              </div>
              <span className="sr-only">{state === 'collapsed' ? 'Explora' : 'Aplicación Explora'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AppNavMain activeItemId={activeItemId} groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <AppNavUser
          onLogout={onLogout}
          onOpenProfile={onOpenProfile}
          userName={userName}
          userRole={userRole}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export { AppSidebar }
