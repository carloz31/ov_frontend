import { useState } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Construction,
  ContactRound,
  Cross,
  HeartHandshake,
  Leaf,
  Newspaper,
  PawPrint,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
  Trees,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { forestFireProfessionals } from '../data/ForestFireCaseData'

const professionalIcons: Record<string, LucideIcon> = {
  firefighter: ShieldCheck,
  meteorologist: CloudSun,
  'municipal-police': ShieldCheck,
  paramedic: Cross,
  'medical-specialist': Stethoscope,
  veterinarian: PawPrint,
  biologist: Trees,
  'environmental-engineer': Leaf,
  'civil-engineer': Construction,
  'machinery-operator': Truck,
  'social-worker': HeartHandshake,
  journalist: Newspaper,
}

type ProfessionalAssignmentContext = {
  problemTitle: string
  selectedIds: string[]
  onToggle: (professionalId: string) => void
}

type ForestFireProfessionalPanelProps = {
  assignmentContext?: ProfessionalAssignmentContext
  compact?: boolean
  initialProfessionalId?: string
  triggerLabel?: string
}

function ForestFireProfessionalPanel({
  assignmentContext,
  compact = false,
  initialProfessionalId,
  triggerLabel = 'Abrir directorio',
}: ForestFireProfessionalPanelProps) {
  const initialIndex = forestFireProfessionals.findIndex(
    (professional) => professional.id === initialProfessionalId,
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0)
  const currentProfessional = forestFireProfessionals[currentIndex]
  const CurrentIcon = professionalIcons[currentProfessional.id] ?? BriefcaseBusiness
  const isAssigned = assignmentContext?.selectedIds.includes(currentProfessional.id) ?? false

  function showPreviousProfile() {
    setCurrentIndex(
      (current) => (current - 1 + forestFireProfessionals.length) % forestFireProfessionals.length,
    )
  }

  function showNextProfile() {
    setCurrentIndex((current) => (current + 1) % forestFireProfessionals.length)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          aria-label={
            initialProfessionalId
              ? `Ampliar ficha de ${currentProfessional.name}`
              : 'Abrir directorio de profesionales'
          }
          className={cn(!compact && 'border-white/20 bg-white/10 text-white hover:bg-white/18')}
          size={compact ? 'icon' : 'default'}
          variant="outline"
        >
          <BookOpen />
          <span className={compact ? 'sr-only' : ''}>
            {compact ? 'Directorio profesional' : triggerLabel}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[1080px] overflow-hidden border-[#4a4863] bg-[#12131e] p-3 text-white [&>button]:text-white/65 [&>button:hover]:bg-white/10 [&>button:hover]:text-white md:p-4">
        <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#232237] shadow-[inset_0_0_0_1px_rgb(255_255_255/3%)]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#1a1928] px-5 py-3 pr-14">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[#ff8c66] text-white">
                <ContactRound className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Terminal de contactos
                </p>
                <p className="text-sm font-bold">Directorio de respuesta</p>
              </div>
            </div>
            <span className="hidden items-center gap-2 text-xs text-emerald-300 sm:flex">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgb(52_211_153/85%)]" /> En
              línea
            </span>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>Directorio de profesionales</DialogTitle>
            <DialogDescription>
              Consulta hojas de vida y selecciona profesionales para responder a la emergencia.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/10 bg-[#1b1a2b] p-3 lg:block">
              <div className="mb-3 flex items-center justify-between px-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                  Guía de contactos
                </p>
                <Badge className="bg-white/8 text-white/60" variant="secondary">
                  {forestFireProfessionals.length}
                </Badge>
              </div>
              <div className="max-h-[500px] space-y-1 overflow-y-auto pr-1">
                {forestFireProfessionals.map((professional, index) => {
                  const Icon = professionalIcons[professional.id] ?? BriefcaseBusiness
                  const selected = assignmentContext?.selectedIds.includes(professional.id) ?? false
                  return (
                    <button
                      aria-current={index === currentIndex ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d96ff]',
                        index === currentIndex
                          ? 'bg-[#655bd8] text-white'
                          : 'text-white/68 hover:bg-white/7 hover:text-white',
                      )}
                      key={professional.id}
                      onClick={() => setCurrentIndex(index)}
                      type="button"
                    >
                      <span
                        className={cn(
                          'grid size-8 shrink-0 place-items-center rounded-lg',
                          index === currentIndex ? 'bg-white/16' : 'bg-white/7',
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{professional.personName}</span>
                        <span
                          className={cn(
                            'block truncate text-[11px]',
                            index === currentIndex ? 'text-white/65' : 'text-white/38',
                          )}
                        >
                          {professional.name}
                        </span>
                      </span>
                      {selected && (
                        <span aria-label="Asignado" className="size-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </aside>

            <div className="flex min-w-0 flex-col bg-[#d9d4c8] p-3 sm:p-5 md:p-7">
              <div className="mb-3 flex items-center justify-between text-[#686374] lg:hidden">
                <p className="text-xs font-bold uppercase tracking-[0.14em]">
                  Ficha {currentIndex + 1} de {forestFireProfessionals.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    aria-label="Ficha anterior"
                    className="border-[#bdb7ab] bg-[#eeeae0]"
                    onClick={showPreviousProfile}
                    size="icon"
                    variant="outline"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    aria-label="Ficha siguiente"
                    className="border-[#bdb7ab] bg-[#eeeae0]"
                    onClick={showNextProfile}
                    size="icon"
                    variant="outline"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>

              <article className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#c5bfb2] bg-[#fbf8ef] p-5 text-[#29283a] shadow-[0_18px_45px_rgb(48_43_36/18%)] sm:p-7 md:p-9">
                <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[#ff8c66]" />
                <div className="flex flex-col gap-5 border-b border-dashed border-[#ccc6b9] pb-6 sm:flex-row sm:items-center">
                  <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-[#e8e5ff] text-[#5c52ce] shadow-sm">
                    <CurrentIcon className="size-9" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8a8390]">
                      Hoja de vida · Contacto {String(currentIndex + 1).padStart(2, '0')}
                    </p>
                    <h2 className="mt-1 text-3xl font-black tracking-[-0.035em]">
                      {currentProfessional.personName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 font-bold text-[#6258d1]">
                      <BriefcaseBusiness className="size-4" /> {currentProfessional.name}
                    </p>
                  </div>
                </div>

                <div className="grid flex-1 gap-7 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)]">
                  <section>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8a8390]">
                      Perfil profesional
                    </p>
                    <p className="mt-3 text-[15px] leading-7 text-[#555160]">
                      {currentProfessional.description}
                    </p>
                  </section>
                  <section>
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#8a8390]">
                      Habilidades destacadas
                    </p>
                    <ul className="mt-3 space-y-2">
                      {currentProfessional.skills.map((skill) => (
                        <li
                          className="flex items-center gap-2 rounded-xl border border-[#d9d3c8] bg-white/70 px-3 py-2 text-sm font-semibold"
                          key={skill}
                        >
                          <span className="size-1.5 rounded-full bg-[#ff8c66]" /> {skill}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <footer className="flex flex-col-reverse justify-between gap-3 border-t border-dashed border-[#ccc6b9] pt-5 sm:flex-row sm:items-center">
                  <div className="hidden items-center gap-2 text-xs font-semibold text-[#77717e] lg:flex">
                    <Button
                      aria-label="Ficha anterior"
                      className="border-[#cbc5b8] bg-transparent"
                      onClick={showPreviousProfile}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronLeft />
                    </Button>
                    <span>
                      {currentIndex + 1} / {forestFireProfessionals.length}
                    </span>
                    <Button
                      aria-label="Ficha siguiente"
                      className="border-[#cbc5b8] bg-transparent"
                      onClick={showNextProfile}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                  {assignmentContext ? (
                    <Button
                      className={cn(isAssigned && 'bg-[#324f47] hover:bg-[#29443d]')}
                      onClick={() => assignmentContext.onToggle(currentProfessional.id)}
                    >
                      <PhoneCall />{' '}
                      {isAssigned
                        ? `Quitar de ${assignmentContext.problemTitle}`
                        : `Llamar para ${assignmentContext.problemTitle}`}
                    </Button>
                  ) : (
                    <p className="text-xs leading-5 text-[#77717e]">
                      Consulta el perfil; podrás llamar al contacto desde cada problema.
                    </p>
                  )}
                </footer>
              </article>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { ForestFireProfessionalPanel }
