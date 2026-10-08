import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { ArrowLeft, Check, GripVertical, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { forestFireProfessionals } from '@/data/content/forestFireCase'
import type { ForestFireProfessional } from '@/types/cases'
import { getOccupation } from '@/features/discovery/lib/catalogSelectors'
import { discoveryPaths } from '@/routes/discoveryPaths'

export function ProfessionalResume({ professional }: { professional: ForestFireProfessional }) {
  const occupation = getOccupation(professional.occupationId)
  return (
    <article className="ff-resume">
      <p className="ff-eyebrow">Hoja de vida · Contacto</p>
      <div className="ff-contact-heading">
        <span className="ff-initial">{professional.personName.charAt(0)}</span>
        <div>
          <h2>{professional.personName}</h2>
          <p>{occupation?.name ?? professional.name}</p>
        </div>
      </div>
      {occupation ? (
        <>
          {occupation.contentStatus === 'pending' && <p className="ff-preparing">Ficha en preparación</p>}
          <h3>Qué hacen</h3>
          <p>{occupation.whatTheyDo}</p>
          <h3>Conocimientos que usan</h3>
          <ul className="ff-tags">
            {occupation.knowledge.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Habilidades que necesitan</h3>
          <ul className="ff-tags">
            {occupation.skills.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <footer>
            <p>Datos del catálogo de ocupaciones</p>
            <p>{occupation.onetCode ? `O*NET ${occupation.onetCode}` : 'O*NET por completar'}</p>
            <a href={discoveryPaths.occupation(occupation.id)} target="_blank" rel="noopener noreferrer">
              Ver la ficha completa<span className="sr-only"> (abre otra pestaña)</span>
            </a>
          </footer>
        </>
      ) : (
        <p className="ff-preparing">Ficha en preparación</p>
      )}
    </article>
  )
}

export function ForestFireProfessionalPanel({
  initialProfessionalId,
  triggerLabel = 'Ver ficha',
}: {
  initialProfessionalId?: string
  triggerLabel?: string
}) {
  const professional =
    forestFireProfessionals.find((p) => p.id === initialProfessionalId) ?? forestFireProfessionals[0]
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="ff-secondary">{triggerLabel}</button>
      </DialogTrigger>
      <DialogContent className="ff-modal ff-responsive-modal">
        <DialogTitle className="sr-only">Hoja de vida de {professional.personName}</DialogTitle>
        <DialogDescription className="sr-only">Datos del catálogo de ocupaciones.</DialogDescription>
        <ProfessionalResume professional={professional} />
      </DialogContent>
    </Dialog>
  )
}

export function ProfessionalDirectory({
  selectedIds,
  budgetRemaining,
  problemTitle,
  onCall,
  onDragContact,
}: {
  selectedIds: string[]
  budgetRemaining: number
  problemTitle: string
  onCall: (id: string) => void
  onDragContact: (id?: string, overTeam?: boolean) => void
}) {
  const [resumeId, setResumeId] = useState<string>()
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && (window.matchMedia?.('(min-width: 1024px)').matches ?? false),
  )
  const resumeOpener = useRef<HTMLButtonElement | null>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  const drag = useRef<{ id: string; pointerId: number; x: number; y: number; moved: boolean } | undefined>(
    undefined,
  )
  const suppressClick = useRef(false)
  const [dragGhost, setDragGhost] = useState<{ id: string; x: number; y: number }>()
  const professional = forestFireProfessionals.find((p) => p.id === resumeId)
  const called = !!resumeId && selectedIds.includes(resumeId)
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    if (desktop && resumeId) backButton.current?.focus()
    else if (desktop && !resumeId) resumeOpener.current?.focus()
  }, [desktop, resumeId])
  function overTeam(x: number, y: number) {
    return !!document.elementFromPoint(x, y)?.closest('.ff-team-zone')
  }
  function startDrag(event: PointerEvent<HTMLElement>, id: string) {
    if (
      !desktop ||
      event.button !== 0 ||
      selectedIds.includes(id) ||
      budgetRemaining === 0 ||
      (event.target as HTMLElement).closest('button,a')
    )
      return
    event.preventDefault()
    drag.current = { id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveDrag(event: PointerEvent<HTMLElement>) {
    const origin = drag.current
    if (!origin || origin.pointerId !== event.pointerId) return
    origin.moved ||= Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 6
    if (origin.moved) {
      setDragGhost({ id: origin.id, x: event.clientX, y: event.clientY })
      onDragContact(origin.id, overTeam(event.clientX, event.clientY))
    }
  }
  function finishDrag(event: PointerEvent<HTMLElement>, cancelled = false) {
    const origin = drag.current
    if (!origin || origin.pointerId !== event.pointerId) return
    drag.current = undefined
    suppressClick.current = origin.moved
    if (!cancelled && origin.moved && budgetRemaining > 0 && overTeam(event.clientX, event.clientY))
      onCall(origin.id)
    setDragGhost(undefined)
    onDragContact(undefined)
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
  }
  const addButton = professional && (
    <button
      className="ff-primary ff-resume-add"
      disabled={called || budgetRemaining === 0}
      onClick={() => {
        onCall(professional.id)
        setResumeId(undefined)
      }}
    >
      {called ? 'Ya está en tu equipo' : `Agregar al equipo de «${problemTitle}»`}
    </button>
  )
  return (
    <aside className="ff-directory" aria-label="Contactos disponibles">
      <div className="ff-directory-heading">
        <div>
          <h2>
            <span className="ff-desktop-copy">Contactos disponibles</span>
            <span className="ff-mobile-copy">Contactos</span>
          </h2>
          <p className="ff-desktop-copy">Cada llamada usa 1 punto de presupuesto.</p>
          <p className="ff-mobile-copy">1 llamada = 1 punto</p>
        </div>
        <span className="ff-contact-count">{forestFireProfessionals.length}</span>
      </div>
      <div className="ff-directory-list" hidden={desktop && !!professional}>
        {forestFireProfessionals.map((p) => (
          <article
            key={p.id}
            className={`ff-contact ${selectedIds.includes(p.id) ? 'is-called' : ''}`}
            data-draggable={(desktop && !selectedIds.includes(p.id) && budgetRemaining > 0) || undefined}
            draggable={false}
            onPointerDown={(event) => startDrag(event, p.id)}
            onPointerMove={moveDrag}
            onPointerUp={(event) => finishDrag(event)}
            onPointerCancel={(event) => finishDrag(event, true)}
            onLostPointerCapture={() => {
              drag.current = undefined
              setDragGhost(undefined)
              onDragContact(undefined)
            }}
            onClickCapture={(event) => {
              if (suppressClick.current) {
                event.preventDefault()
                event.stopPropagation()
                suppressClick.current = false
              }
            }}
          >
            <GripVertical className="ff-contact-grip" size={18} aria-hidden="true" />
            <span className="ff-initial">{p.personName.charAt(0)}</span>
            <div className="ff-contact-name">
              <strong>{p.personName}</strong>
              <small>{getOccupation(p.occupationId)?.name ?? p.name}</small>
            </div>
            <button
              className="ff-resume-link"
              onClick={(event) => {
                resumeOpener.current = event.currentTarget
                setResumeId(p.id)
              }}
            >
              Hoja de vida<span className="sr-only"> de {p.personName}</span>
            </button>
            <button
              className="ff-contact-add"
              disabled={selectedIds.includes(p.id) || budgetRemaining === 0}
              aria-label={
                selectedIds.includes(p.id)
                  ? `${p.personName} ya está en tu equipo`
                  : `Agregar a ${p.personName} al equipo`
              }
              onClick={() => onCall(p.id)}
            >
              {selectedIds.includes(p.id) ? (
                <Check size={18} aria-hidden="true" />
              ) : (
                <Plus size={18} aria-hidden="true" />
              )}
            </button>
          </article>
        ))}
      </div>
      {desktop && professional && (
        <div
          className="ff-directory-resume"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setResumeId(undefined)
          }}
        >
          <button ref={backButton} className="ff-resume-back" onClick={() => setResumeId(undefined)}>
            <ArrowLeft size={18} />
            Contactos
          </button>
          <div className="ff-resume-scroll">
            <ProfessionalResume professional={professional} />
          </div>
          {addButton}
        </div>
      )}
      <Dialog
        open={!desktop && !!professional}
        onOpenChange={(open) => {
          if (!open) setResumeId(undefined)
        }}
      >
        <DialogContent
          className="ff-modal ff-bottom-sheet ff-resume-sheet"
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            resumeOpener.current?.focus()
          }}
        >
          <DialogTitle className="sr-only">Hoja de vida de {professional?.personName}</DialogTitle>
          <DialogDescription className="sr-only">Datos del catálogo de ocupaciones.</DialogDescription>
          {professional && (
            <div className="ff-resume-scroll">
              <ProfessionalResume professional={professional} />
            </div>
          )}
          {addButton}
        </DialogContent>
      </Dialog>
      {dragGhost && (
        <div
          className="ff-contact-ghost"
          aria-hidden="true"
          style={{ left: dragGhost.x + 12, top: dragGhost.y + 12 }}
        >
          {forestFireProfessionals.find((p) => p.id === dragGhost.id)?.personName}
        </div>
      )}
    </aside>
  )
}
