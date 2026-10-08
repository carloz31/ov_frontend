import { LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { desarrollo, modoApi } from '@/config/env'
import { reiniciarDatosDePrueba } from '@/store/servidor/operaciones'
import { mensajeErrorServidor, useEstadoServidor } from '@/store/servidor/estadoServidor'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { useNavigate } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { appPaths } from '@/routes/paths'

export function StudentUserMenu() {
  const servidor = useEstadoServidor()
  const nombre = modoApi ? (servidor.estado?.cuenta.nombre ?? 'Estudiante') : 'Alex'
  const navigate = useNavigate()
  const [confirmar, setConfirmar] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState('')
  async function reiniciar() {
    if (ocupado) return
    setOcupado(true)
    setError('')
    try {
      const respuesta = await reiniciarDatosDePrueba()
      if (respuesta.tipo === 'ok') window.location.reload()
      else setError(mensajeErrorServidor(respuesta))
    } catch {
      setError('No se pudo limpiar el almacenamiento del navegador. Vuelve a intentarlo.')
    } finally {
      setOcupado(false)
    }
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="sx-user-menu" aria-label={`Menú de ${nombre}`}>
            <span className="sx-user-avatar" aria-hidden="true">
              {modoApi ? nombre.slice(0, 2).toUpperCase() : 'AL'}
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
          {modoApi && desarrollo && (
            <DropdownMenuItem onSelect={() => setConfirmar(true)}>Reiniciar datos de prueba</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={confirmar}
        onOpenChange={(open) => {
          if (!ocupado) setConfirmar(open)
        }}
      >
        <DialogContent className="sx-root sx-glass-dark sx-player-exit">
          <DialogTitle>¿Reiniciar los datos de prueba?</DialogTitle>
          <DialogDescription>
            Se borrará el progreso de las cuentas de prueba del servidor y las copias de este navegador en
            modo API.
          </DialogDescription>
          {error && <p role="alert">{error}</p>}
          <div className="sx-player-actions">
            <button
              type="button"
              className="sx-secondary-button"
              disabled={ocupado}
              onClick={() => setConfirmar(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="sx-primary-button"
              disabled={ocupado}
              onClick={() => void reiniciar()}
            >
              {ocupado ? 'Reiniciando…' : 'Reiniciar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
