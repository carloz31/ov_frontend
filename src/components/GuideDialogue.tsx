import { useEffect, useState } from 'react'
import { ArrowRight, CircleHelp, Compass, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function GuideDialogue({
  text,
  onContinue,
  continueLabel = 'Continuar',
  disabled = false,
  audience = 'student',
  buttonLabel = 'Abrir guía',
}: {
  text: string
  onContinue?: () => void
  continueLabel?: string
  disabled?: boolean
  audience?: 'student' | 'parent'
  buttonLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (!open) return
    setVisible(0)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(text.length)
      return
    }
    const timer = window.setInterval(
      () =>
        setVisible((value) => {
          if (value >= text.length) window.clearInterval(timer)
          return Math.min(value + 2, text.length)
        }),
      24,
    )
    return () => window.clearInterval(timer)
  }, [open, text])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const typing = visible < text.length
  function continueOrClose() {
    if (typing) {
      setVisible(text.length)
      return
    }
    if (disabled) return
    setOpen(false)
    onContinue?.()
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <button
        type="button"
        aria-label={buttonLabel}
        className="pointer-events-auto absolute bottom-5 right-5 grid size-12 place-items-center rounded-full border border-white/80 bg-[#fffdf4] text-[#497060] shadow-[0_12px_30px_rgb(41_70_57/22%)] transition-transform hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary sm:bottom-7 sm:right-7"
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="size-6" />
      </button>
      {open && (
        <div
          className="pointer-events-auto fixed inset-0 z-50 grid place-items-center bg-[#263b49]/35 p-4 backdrop-blur-[7px]"
          role="dialog"
          aria-modal="true"
          aria-label={audience === 'student' ? 'Orientación de Lumi' : 'Guía para familias'}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <section className="relative w-full max-w-xl rounded-3xl border border-white/70 bg-[#fffdf7] px-6 pb-6 pt-16 shadow-[0_24px_80px_rgb(31_49_58/30%)] sm:px-8 sm:pb-8">
            <button
              type="button"
              aria-label="Cerrar guía"
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-[#637681] hover:bg-[#edf1ee]"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </button>
            <div className="absolute left-1/2 top-0 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#f0d67e] bg-[#f8e7a8] shadow-lg">
              <svg role="img" aria-label="Lumi, tu compañero guía" viewBox="0 0 64 64" className="size-16">
                <path d="M12 52L16 20L30 30L48 15L54 52Z" fill="#c79052" />
                <path d="M17 31L29 39L47 28L44 51L31 59L19 48Z" fill="#fff4d8" />
                <circle cx="24" cy="41" r="3" fill="#324737" />
                <circle cx="40" cy="39" r="3" fill="#324737" />
                <path d="M29 46L35 46L32 50Z" fill="#324737" />
                <path d="M14 26L32 6L51 24Z" fill="#3f735c" />
                <path d="M10 27L54 22" stroke="#294c3c" strokeWidth="5" strokeLinecap="round" />
              </svg>
              <Compass className="absolute -bottom-1 -right-1 size-5 text-[#ad8541]" />
            </div>
            <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#5c7968]">
              {audience === 'student' ? 'Lumi · Tu compañero de viaje' : 'Guía para familias'}
            </p>
            <div className="mx-auto mb-5 h-1 w-24 rounded-full bg-[#67adba]" />
            <p className="min-h-24 text-sm leading-7 text-[#344b3e]" aria-hidden="true">
              {text.slice(0, visible)}
              {typing && <span className="ml-0.5">▍</span>}
            </p>
            <span className="sr-only">{text}</span>
            <div className="mt-6 flex justify-end">
              <Button disabled={!typing && disabled} onClick={continueOrClose}>
                {typing ? 'Mostrar todo' : onContinue ? continueLabel : 'Entendido'}
                <ArrowRight />
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export { GuideDialogue }
