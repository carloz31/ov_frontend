import { useState } from 'react'
import { Award, Bell, BookOpen, Building2, HeartHandshake, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useJourney } from '@/features/missions/store'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { updateStudentUi, useStudentUi } from '../ui-state'
import { getUnlocks, markUnlocksSeen, orderUnlocks } from './unlocks'

export function NoveltiesMenu({ glass = false }: { glass?: boolean }) {
  const ui = useStudentUi()
  const items = getUnlocks(useAdventure(), useJourney())
  const ordered = orderUnlocks(items, ui)
  const [open, setOpen] = useState(false)
  const unread = ui.initialized ? items.filter((item) => !ui.seenUnlockIds.includes(item.id)).length : 0
  const icons = {
    badge: Award,
    ficha: BookOpen,
    heroe: UserRound,
    ciudad: Building2,
    familia: HeartHandshake,
  }
  const markRead = () => updateStudentUi((current) => markUnlocksSeen(current, items))
  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next && open) markRead()
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`sx-icon-button sx-novelties-bell ${glass ? 'sx-glass' : ''}`}
          aria-label="Novedades"
          aria-describedby={unread > 0 ? 'sx-novelties-unread' : undefined}
        >
          <Bell size={20} aria-hidden="true" />
          {unread > 0 && (
            <span className="sx-novelties-count" aria-hidden="true">
              {unread}
            </span>
          )}
          {unread > 0 && (
            <span id="sx-novelties-unread" className="sr-only">
              {unread} novedades sin ver
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        className="sx-root sx-novelties-menu case-scrollbar"
        aria-label="Novedades de tu aventura"
      >
        <h2 className="sx-novelties-title">Novedades</h2>
        {ordered.length ? (
          ordered.map((item) => {
            const Icon = icons[item.kind]
            const unseen = ui.initialized && !ui.seenUnlockIds.includes(item.id)
            return (
              <DropdownMenuItem key={item.id} asChild onSelect={markRead}>
                <Link className="sx-novelty" to={item.href}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{item.title}</span>
                  {unseen && <span className="sx-novelty-dot" aria-hidden="true" />}
                  {unseen && <span className="sr-only">Sin ver</span>}
                </Link>
              </DropdownMenuItem>
            )
          })
        ) : (
          <p className="sx-novelties-empty">
            Aún no hay novedades. Cada misión que completes puede traer una.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
