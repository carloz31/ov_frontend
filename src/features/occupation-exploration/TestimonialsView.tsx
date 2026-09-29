import { useState } from 'react'
import { BriefcaseBusiness, ExternalLink, LockKeyhole, MessageSquareQuote, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ExplorationProgressSummary } from './components/ExplorationProgressSummary'
import { occupationCatalog, professionalTestimonials } from './data/OccupationExplorationData'
import type { ProfessionalTestimonial } from './types/OccupationExplorationTypes'

function TestimonialsView({ unlockedTestimonialIds }: { unlockedTestimonialIds: string[] }) {
  const [selectedTestimonial, setSelectedTestimonial] = useState<ProfessionalTestimonial>()
  const unlockedCount = professionalTestimonials.filter((item) =>
    unlockedTestimonialIds.includes(item.id),
  ).length

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-8 md:px-8 md:py-10">
      <section className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3" variant="default">
            <MessageSquareQuote className="size-3.5" /> Voces profesionales
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Héroes de la ciudad</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Conoce cómo viven su trabajo personas de distintas profesiones. Nuevos testimonios se desbloquean
            al alcanzar el 50% y el 100% de satisfacción de la población en Central de Casos.
          </p>
        </div>
        <ExplorationProgressSummary
          className="w-full shrink-0 md:w-[350px]"
          completed={unlockedCount}
          icon={MessageSquareQuote}
          itemLabel="testimonios"
          remainingLabel="por descubrir"
          total={professionalTestimonials.length}
        />
      </section>
      <div className="space-y-5">
        {professionalTestimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            onSelect={() => setSelectedTestimonial(testimonial)}
            testimonial={testimonial}
            unlocked={unlockedTestimonialIds.includes(testimonial.id)}
          />
        ))}
      </div>
      <VideoTestimonialDialog
        onClose={() => setSelectedTestimonial(undefined)}
        testimonial={selectedTestimonial}
      />
    </div>
  )
}

function VideoTestimonialDialog({
  onClose,
  testimonial,
}: {
  onClose: () => void
  testimonial: ProfessionalTestimonial | undefined
}) {
  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={Boolean(testimonial)}>
      {testimonial && (
        <DialogContent className="max-w-4xl overflow-hidden p-0 md:p-0">
          <DialogHeader className="mb-0 p-6 pb-5 pr-14">
            <Badge className="w-fit" variant="success">
              Testimonio desbloqueado
            </Badge>
            <DialogTitle>{testimonial.personName}</DialogTitle>
            <DialogDescription>
              {testimonial.currentRole} · {testimonial.yearsExperience} años de experiencia
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full"
              src={testimonial.youtubeEmbedUrl}
              title={`Testimonio de ${testimonial.personName}`}
            />
          </div>
          <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">“{testimonial.summary}”</p>
            <Button asChild className="shrink-0" variant="outline">
              <a href={testimonial.youtubeUrl} rel="noreferrer" target="_blank">
                Ver en YouTube <ExternalLink />
              </a>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

function TestimonialCard({
  onSelect,
  testimonial,
  unlocked,
}: {
  onSelect: () => void
  testimonial: ProfessionalTestimonial
  unlocked: boolean
}) {
  const occupation = occupationCatalog.find((item) => item.id === testimonial.occupationId)
  if (!unlocked)
    return (
      <Card className="flex items-center gap-4 border-dashed bg-[#f3f2f6] p-5 opacity-80">
        <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-white text-muted-foreground">
          <LockKeyhole className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <Badge variant="outline">Bloqueado</Badge>
          <h2 className="mt-2 text-lg font-bold">Testimonio de {occupation?.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Alcanza el {testimonial.id === professionalTestimonials[0].id ? '50' : '100'}% de satisfacción en
            Central de Casos.
          </p>
        </div>
      </Card>
    )
  return (
    <Card
      aria-label={`Ver testimonio de ${testimonial.personName}`}
      className="cursor-pointer overflow-hidden border-primary/20 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="grid gap-0 md:grid-cols-[230px_1fr]">
        <div className="bg-[#343151] p-6 text-white">
          <span
            className="grid size-14 place-items-center rounded-2xl text-white"
            style={{ background: occupation?.color }}
          >
            <BriefcaseBusiness className="size-6" />
          </span>
          <Badge className="mt-5 bg-white/10 text-white" variant="outline">
            Testimonio desbloqueado
          </Badge>
          <h2 className="mt-3 text-2xl font-bold">{testimonial.personName}</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">{testimonial.currentRole}</p>
          <p className="mt-4 text-xs text-white/45">{testimonial.yearsExperience} años de experiencia</p>
        </div>
        <div className="p-6 sm:p-8">
          <MessageSquareQuote className="size-7 text-primary" />
          <blockquote className="mt-3 text-xl font-bold leading-8">“{testimonial.summary}”</blockquote>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{testimonial.story}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {testimonial.highlights.map((highlight) => (
              <Badge key={highlight} variant="secondary">
                {highlight}
              </Badge>
            ))}
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
            <PlayCircle className="size-4" /> Ver testimonio en video
          </span>
        </div>
      </div>
    </Card>
  )
}

export { TestimonialsView }
