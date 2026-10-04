import { useRef, useState } from 'react'
import { ShieldCheck, Volume2, VolumeX, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import type { Actividad } from '@/features/missions/model'
import { updateStudentUi, useStudentUi } from '../ui-state'

export function PlayerTopBar({
  activity,
  finished,
  index,
  total,
  progress,
  onClose,
}: {
  activity: Actividad
  finished: boolean
  index: number
  total: number
  progress: number
  onClose: () => void
}) {
  const ui = useStudentUi()
  const [exitOpen, setExitOpen] = useState(false)
  const exitButton = useRef<HTMLButtonElement>(null)
  return (
    <>
      <header className="sx-player-topbar">
        <button
          ref={exitButton}
          type="button"
          className="sx-icon-button"
          aria-label="Salir de la actividad"
          onClick={() => setExitOpen(true)}
        >
          <X size={20} />
        </button>
        <div className="sx-player-heading">
          <span>
            {activity.ubicacion ??
              (activity.tipo === 'encuentro'
                ? 'Actividad informativa'
                : activity.tipo === 'registro'
                  ? 'Actividad de registro'
                  : 'Test')}
          </span>
          <strong>{finished ? 'Actividad completada' : activity.titulo}</strong>
        </div>
        <div className="sx-player-progress">
          <span>
            Paso {Math.min(index + 1, total)} de {total}
          </span>
          <div
            role="progressbar"
            aria-label="Avance de la actividad"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="sx-icon-button"
          aria-label={ui.soundOn ? 'Silenciar' : 'Activar sonido'}
          aria-pressed={ui.soundOn}
          onClick={() => updateStudentUi((current) => ({ ...current, soundOn: !current.soundOn }))}
        >
          {ui.soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </header>
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent
          className="sx-root sx-glass-dark sx-player-exit"
          aria-label="Salir de la actividad"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            exitButton.current?.focus()
          }}
        >
          <ShieldCheck className="sx-exit-icon" size={48} />
          <DialogTitle>¿Quieres volver al mapa?</DialogTitle>
          <DialogDescription>
            Tu avance ya está guardado. Podrás retomar la actividad desde este punto.
          </DialogDescription>
          <div className="sx-player-actions">
            <button type="button" className="sx-secondary-button" onClick={() => setExitOpen(false)}>
              Seguir en la actividad
            </button>
            <button type="button" className="sx-primary-button" onClick={onClose}>
              Volver al mapa
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
