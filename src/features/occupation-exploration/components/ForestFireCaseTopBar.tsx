import { useState } from 'react'
import { Bell, CircleUserRound, SaveOff, ShieldCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'

type ForestFireCaseTopBarProps = {
  contextLabel?: string
  exitCancelLabel?: string
  exitConfirmLabel?: string
  exitDescription?: string
  exitMode?: 'discard' | 'saved'
  exitTitle?: string
  label: string
  onClose: () => void
  progress?: number
  userRole?: string
}

function ForestFireCaseTopBar({
  contextLabel = 'Incendio forestal',
  exitCancelLabel = 'Continuar con el caso',
  exitConfirmLabel = 'Salir sin guardar',
  exitDescription = 'El progreso de este caso no será guardado. Si sales, tendrás que comenzar nuevamente desde la primera fase.',
  exitMode = 'discard',
  exitTitle = '¿Seguro que quieres salir?',
  label,
  onClose,
  progress,
  userRole = 'Coordinación de respuesta',
}: ForestFireCaseTopBarProps) {
  const [exitDialogOpen, setExitDialogOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
        <div className="flex h-20 items-center justify-between px-5 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              aria-label="Salir de la actividad"
              onClick={() => setExitDialogOpen(true)}
              size="icon"
              variant="ghost"
            >
              <X />
            </Button>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">{contextLabel}</p>
              <p className="truncate font-semibold">{label}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button aria-label="Notificaciones" className="hidden sm:inline-flex" size="icon" variant="ghost">
              <Bell />
            </Button>
            <div className="hidden items-center gap-2 border-l pl-3 md:flex">
              <div className="grid size-9 place-items-center rounded-full bg-[var(--primary-soft)] text-primary">
                <CircleUserRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Alex</p>
                <p className="text-[11px] text-muted-foreground">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
        {progress !== undefined && <Progress className="h-1 rounded-none" value={progress} />}
      </header>

      <Dialog onOpenChange={setExitDialogOpen} open={exitDialogOpen}>
        <DialogContent className="max-w-lg" showCloseButton={false}>
          <DialogHeader className="text-center">
            <span
              className={
                exitMode === 'saved'
                  ? 'mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700'
                  : 'mx-auto grid size-14 place-items-center rounded-2xl bg-red-100 text-red-600'
              }
            >
              {exitMode === 'saved' ? <ShieldCheck className="size-6" /> : <SaveOff className="size-6" />}
            </span>
            <DialogTitle>{exitTitle}</DialogTitle>
            <DialogDescription>{exitDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => setExitDialogOpen(false)} variant="outline">
              {exitCancelLabel}
            </Button>
            <Button
              className={exitMode === 'discard' ? 'bg-red-600 hover:bg-red-700' : undefined}
              onClick={onClose}
            >
              {exitConfirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { ForestFireCaseTopBar }
