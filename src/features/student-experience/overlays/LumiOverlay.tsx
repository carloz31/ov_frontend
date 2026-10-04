import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { CharacterAvatar } from '../player/CharacterAvatar'

export type LumiOverlayProps = {
  open: boolean
  steps: string[]
  onClose: () => void
  onFinish?: () => void
  finalLabel?: string
}

// Manual help for phase 1; progressive writing and the automatic queue arrive in phase 3.
export function LumiOverlay({ open, ...props }: LumiOverlayProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) props.onClose()
      }}
    >
      {open && <LumiDialogue {...props} />}
    </Dialog.Root>
  )
}

function LumiDialogue({
  steps,
  onClose,
  onFinish,
  finalLabel = 'Entendido',
}: Omit<LumiOverlayProps, 'open'>) {
  const [step, setStep] = useState(0)
  const primaryButton = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const last = step === steps.length - 1
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="sx-root sx-lumi-backdrop" />
      <Dialog.Content
        className="sx-root sx-glass sx-lumi-dialog"
        aria-label="Orientación de Lumi"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
          primaryButton.current?.focus()
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus.current?.focus()
        }}
      >
        <Dialog.Title className="sr-only">Orientación de Lumi</Dialog.Title>
        <button
          type="button"
          className="sx-icon-button sx-lumi-close"
          aria-label="Cerrar guía"
          onClick={onClose}
        >
          <X aria-hidden="true" size={18} />
        </button>
        <CharacterAvatar id="companero" size="lg" />
        {steps.length > 1 && (
          <p className="sx-lumi-step">
            Paso {step + 1} de {steps.length}
          </p>
        )}
        <Dialog.Description className="sx-lumi-text">{steps[step]}</Dialog.Description>
        <div className="sx-lumi-footer">
          {step > 0 && (
            <button type="button" className="sx-secondary-button" onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Anterior
            </button>
          )}
          <button
            ref={primaryButton}
            type="button"
            className="sx-primary-button"
            onClick={() => {
              if (last) {
                onFinish?.()
                onClose()
              } else setStep(step + 1)
            }}
          >
            {last ? finalLabel : 'Siguiente'}
            {!last && <ArrowRight size={16} />}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
