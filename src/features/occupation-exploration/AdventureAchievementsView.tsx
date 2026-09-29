import { useState } from 'react'
import {
  ArrowRight,
  Check,
  Compass,
  Flame,
  KeyRound,
  LockKeyhole,
  Map,
  MessageCircleHeart,
  Send,
  ShieldCheck,
  Sparkles,
  Telescope,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { cn } from '@/lib/Utils'
import { getAchievementGroups, type Achievement, type AchievementIcon } from './lib/AdventureAchievements'
import { getTravelerLevel, useAdventure } from './lib/AdventureStore'

const groupIcons = { compass: Compass, users: UsersRound, key: KeyRound }
const achievementIcons: Record<AchievementIcon, LucideIcon> = {
  campfire: Flame,
  compass: Compass,
  key: KeyRound,
  message: MessageCircleHeart,
  people: Users,
  send: Send,
  shield: ShieldCheck,
  sparkles: Sparkles,
  telescope: Telescope,
}

function AdventureAchievementsView() {
  const state = useAdventure()
  const level = getTravelerLevel(state)
  const groups = getAchievementGroups(state)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const achievements = groups.flatMap((group) => group.items)
  const completed = achievements.filter((item) => item.done).length

  return (
    <section aria-labelledby="passport-title" className="space-y-6 pb-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#58735c]">
          <Trophy className="size-4" /> Pasaporte vocacional
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl" id="passport-title">
          Las huellas de mi recorrido
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Aquí no coleccionas puntos: guardas pruebas de las preguntas, conversaciones y experiencias que te
          ayudan a construir tu propio rumbo.
        </p>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#263f3b] p-5 text-white shadow-[0_24px_60px_rgba(37,62,58,0.2)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-16 size-56 rounded-full border-[34px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-52 rounded-full bg-[#dbb766]/10 blur-2xl" />
        <div className="relative grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="relative mx-auto grid size-32 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 sm:size-40">
            <span className="absolute inset-3 rounded-full border border-dashed border-[#f0cf7a]/60" />
            <Compass className="size-14 text-[#f3d27b] sm:size-16" strokeWidth={1.6} />
            <span className="absolute -bottom-1 rounded-full border-4 border-[#263f3b] bg-[#f3d27b] px-3 py-1 text-sm font-black text-[#263f3b]">
              {level.number}/5
            </span>
          </div>

          <div>
            <Badge className="border-white/15 bg-white/10 text-white">Nivel {level.number} de 5</Badge>
            <h3 className="mt-3 text-2xl font-black sm:text-3xl">{level.label}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{level.description}</p>

            <div aria-label={`Nivel ${level.number} de 5`} className="mt-6 flex max-w-xl items-center">
              {[1, 2, 3, 4, 5].map((step, index) => (
                <div className="flex flex-1 items-center last:flex-none" key={step}>
                  <span
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-black transition-colors',
                      step < level.number && 'border-[#f3d27b] bg-[#f3d27b] text-[#263f3b]',
                      step === level.number && 'border-white bg-white text-[#263f3b] ring-4 ring-white/10',
                      step > level.number && 'border-white/25 bg-white/5 text-white/55',
                    )}
                  >
                    {step < level.number ? <Check className="size-4" /> : step}
                  </span>
                  {index < 4 && (
                    <span
                      className={cn(
                        'mx-1 h-0.5 min-w-2 flex-1 rounded-full',
                        step < level.number ? 'bg-[#f3d27b]' : 'bg-white/15',
                      )}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-3 rounded-2xl border border-white/10 bg-black/10 p-3.5">
              <Map className="mt-0.5 size-5 shrink-0 text-[#f3d27b]" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#f3d27b]">Próximo capítulo</p>
                <p className="mt-1 text-sm leading-5 text-white/75">{level.nextStep}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h3 className="text-xl font-black">Mi colección de insignias</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pulsa una insignia para descubrir la historia que guarda.
          </p>
        </div>
        <Badge className="w-fit" variant="warning">
          {completed} de {achievements.length} conseguidas
        </Badge>
      </div>

      <div className="space-y-5">
        {groups.map((group) => {
          const GroupIcon = groupIcons[group.icon]
          const groupCompleted = group.items.filter((item) => item.done).length
          return (
            <section
              className="overflow-hidden rounded-3xl border bg-white shadow-[var(--shadow-card)]"
              key={group.title}
            >
              <header className="flex items-start gap-3 border-b bg-[#f6f4ea] p-4 sm:items-center sm:p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#dfe9d8] text-[#527057]">
                  <GroupIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-black">{group.title}</h4>
                    <span className="text-xs font-bold text-muted-foreground">
                      {groupCompleted}/{group.items.length}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{group.description}</p>
                </div>
              </header>

              <div className="divide-y">
                {group.items.map((item) => {
                  const Icon = achievementIcons[item.icon]
                  return (
                    <button
                      aria-label={`Ver insignia ${item.code}: ${item.title}`}
                      className="group flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[#faf9f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:gap-4 sm:px-5"
                      key={item.code}
                      onClick={() => setSelectedAchievement(item)}
                      type="button"
                    >
                      <span
                        className={cn(
                          'relative grid size-14 shrink-0 place-items-center rounded-2xl border',
                          item.done
                            ? 'border-[#c7dcbf] bg-[#e8f2e3] text-[#4a7453]'
                            : 'border-dashed bg-muted/45 text-muted-foreground',
                        )}
                      >
                        <Icon className="size-6" />
                        {item.done && (
                          <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#4f7958] text-white ring-2 ring-white">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#263f3b] px-2 py-0.5 text-[11px] font-black tracking-wider text-white">
                            {item.code}
                          </span>
                          <span className="font-black text-foreground">{item.title}</span>
                        </span>
                        <span className="mt-1.5 block text-xs leading-5 text-muted-foreground sm:text-sm">
                          {item.done ? item.message : item.description}
                        </span>
                      </span>
                      <span className="hidden items-center gap-2 text-xs font-bold text-[#527057] sm:flex">
                        Ver historia{' '}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <AchievementDetail
        achievement={selectedAchievement}
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
      />
    </section>
  )
}

function AchievementDetail({
  achievement,
  onOpenChange,
}: {
  achievement: Achievement | null
  onOpenChange: (open: boolean) => void
}) {
  if (!achievement) return null
  const Icon = achievementIcons[achievement.icon]

  return (
    <Dialog onOpenChange={onOpenChange} open>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <div
          className={cn(
            'relative grid min-h-48 place-items-center overflow-hidden px-8 py-10',
            achievement.done ? 'bg-[#e8f2e3]' : 'bg-[#f1f1ec]',
          )}
        >
          <span className="absolute -right-10 -top-14 size-44 rounded-full border-[28px] border-white/35" />
          <span
            className={cn(
              'relative grid size-28 place-items-center rounded-[2rem] border-2 shadow-lg',
              achievement.done
                ? 'border-[#bdd5b5] bg-white text-[#4a7453]'
                : 'border-dashed border-[#b7b9af] bg-white/70 text-[#8d9087]',
            )}
          >
            <Icon className="size-12" strokeWidth={1.6} />
            <span className="absolute -bottom-3 rounded-full bg-[#263f3b] px-3 py-1 text-xs font-black tracking-wider text-white">
              {achievement.code}
            </span>
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <DialogHeader>
            <div>
              <Badge variant={achievement.done ? 'success' : 'secondary'}>
                {achievement.done ? (
                  <>
                    <Check className="size-3.5" /> Conquistada
                  </>
                ) : (
                  <>
                    <LockKeyhole className="size-3.5" /> Por descubrir
                  </>
                )}
              </Badge>
            </div>
            <DialogTitle>{achievement.title}</DialogTitle>
            <DialogDescription>{achievement.message}</DialogDescription>
          </DialogHeader>

          <blockquote className="rounded-2xl border-l-4 border-[#d5ae57] bg-[#fff8e7] p-4 text-sm font-semibold leading-6 text-[#66532a]">
            “{achievement.metaphor}”
          </blockquote>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {achievement.done ? 'Cómo la conseguiste' : 'Cómo conseguirla'}
              </p>
              <p className="mt-1.5 text-sm leading-6">{achievement.description}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Lo que dice de tu recorrido
              </p>
              <p className="mt-1.5 text-sm leading-6">{achievement.vocationalMeaning}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AdventureAchievementsView }
