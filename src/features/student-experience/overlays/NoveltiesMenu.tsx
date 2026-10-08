import { useState } from 'react'
import { modoApi } from '@/config/env'
import { avisosPendientes, useEstadoServidor } from '@/store/servidor/estadoServidor'
import { useStudentOverlays } from './overlay-context'
import { Award, Bell, BookOpen, Building2, HeartHandshake, UserRound, X } from 'lucide-react'
import { useDiscovery } from '@/store/discoveryStore'
import { Link } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useJourney } from '@/store/journeyStore'
import { useAdventure } from '@/store/adventureStore'
import { updateStudentUi, useStudentUi } from '@/store/studentUiStore'
import { getUnlocks, markUnlocksSeen, orderUnlocks } from './unlocks'

export function NoveltiesMenu({ glass = false }: { glass?: boolean }) {
  const ui = useStudentUi()
  const adventure = useAdventure(),
    journey = useJourney(),
    discovery = useDiscovery()
  const items = modoApi ? [] : getUnlocks(adventure, journey, discovery)
  const ordered = ui.initialized
    ? orderUnlocks(items, ui).filter((item) => !ui.seenUnlockIds.includes(item.id))
    : []
  const [open, setOpen] = useState(false)
  if (modoApi) return <ServerNoveltiesMenu glass={glass} />
  const unread = ordered.length
  const titles = {
    badge: 'Nueva insignia disponible',
    ficha: 'Nueva ficha disponible',
    heroe: 'Nuevo héroe disponible',
    ciudad: 'Nueva ciudad disponible',
    familia: 'Nueva conversación familiar disponible',
    plan: 'Revisa tus planes',
    memory: 'Lumi recordó algo nuevo',
    nivel: 'Nuevo nivel',
  }
  const icons = {
    badge: Award,
    ficha: BookOpen,
    heroe: UserRound,
    ciudad: Building2,
    familia: HeartHandshake,
    plan: BookOpen,
    memory: BookOpen,
    nivel: Award,
  }
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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
        <div className="sx-novelties-header">
          <h2 className="sx-novelties-title">Novedades</h2>
          <DropdownMenuItem asChild onSelect={() => setOpen(false)}>
            <button type="button" className="sx-icon-button" aria-label="Cerrar novedades">
              <X size={18} aria-hidden="true" />
            </button>
          </DropdownMenuItem>
        </div>
        {ordered.length ? (
          ordered.map((item) => {
            const Icon = icons[item.kind]
            return (
              <DropdownMenuItem
                key={item.id}
                asChild
                onSelect={() => {
                  // A memory is read only when its text actually opens in the diary.
                  if (item.kind !== 'memory') updateStudentUi((current) => markUnlocksSeen(current, [item]))
                }}
              >
                <Link className="sx-novelty" to={item.href}>
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{titles[item.kind]}</strong>
                    <small>
                      {item.kind === 'plan' || item.kind === 'memory'
                        ? item.description
                        : `Se ha desbloqueado «${item.title}»`}
                    </small>
                  </span>
                  <span className="sx-novelty-dot" aria-hidden="true" />
                  <span className="sr-only">Sin ver</span>
                </Link>
              </DropdownMenuItem>
            )
          })
        ) : (
          <p className="sx-novelties-empty">No tienes novedades pendientes</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ServerNoveltiesMenu({ glass }: { glass: boolean }) {
  const [open, setOpen] = useState(false)
  const servidor = useEstadoServidor()
  const { openServerNotices } = useStudentOverlays()
  const pendientes = avisosPendientes().length
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`sx-icon-button sx-novelties-bell ${glass ? 'sx-glass' : ''}`}
          aria-label="Novedades"
        >
          <Bell size={20} />
          {pendientes > 0 && <span className="sx-novelties-count">{pendientes}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="sx-root sx-novelties-menu">
        <h2>Novedades</h2>
        {pendientes || servidor.errorAvisos ? (
          <DropdownMenuItem
            onSelect={() => {
              // Solo solicita el lote: OverlayQueue espera a que este menú
              // y cualquier otro overlay terminen de cerrarse.
              setOpen(false)
              openServerNotices()
            }}
          >
            Ver {pendientes} avisos pendientes{servidor.errorAvisos ? ' · Reintentar' : ''}
          </DropdownMenuItem>
        ) : (
          <p>No tienes novedades pendientes</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
