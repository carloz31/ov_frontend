import { LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { appPaths } from '@/routes/paths'

export function StudentUserMenu() {
  const navigate = useNavigate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="sx-user-menu" aria-label="Menú de Alex">
          <span className="sx-user-avatar" aria-hidden="true">
            AL
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="sx-root sx-user-dropdown">
        <DropdownMenuItem onSelect={() => navigate(appPaths.student.profile)}>
          <UserRound size={16} /> Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(appPaths.home)}>
          <LogOut size={16} /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
