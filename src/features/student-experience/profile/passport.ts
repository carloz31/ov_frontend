import {
  Compass,
  Flame,
  KeyRound,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Telescope,
  Users,
} from 'lucide-react'
import {
  getAchievementGroups,
  type Achievement,
} from '@/features/occupation-exploration/lib/AdventureAchievements'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import type { StudentDiscoveryState } from '../discovery/discoveryStore'
import { appPaths } from '@/routes/paths'
// Presentation names copied in order from getTravelerLevel in AdventureStore; calculations stay there.
export const travelerTitles = [
  'Observador del horizonte',
  'Recolector de pistas',
  'Cartógrafo de posibilidades',
  'Explorador de la ciudad',
  'Autor de su rumbo',
] as const
// Same correspondence as the existing AdventureAchievementsView.
export const achievementIcons = {
  campfire: Flame,
  compass: Compass,
  key: KeyRound,
  message: MessageCircle,
  people: Users,
  send: Send,
  shield: Shield,
  sparkles: Sparkles,
  telescope: Telescope,
}
export type PassportBadge = Achievement & { hidden?: boolean }
export const badgeDestinations: Record<string, { label: string; href: string }> = {
  I1: { label: 'Ir al camino', href: appPaths.student.missions },
  I2: { label: 'Ir al camino', href: appPaths.student.missions },
  I3: { label: 'Ir al camino', href: appPaths.student.missions },
  I4: { label: 'Ir a mi Crew', href: appPaths.student.community },
  I5: { label: 'Ir a mi Crew', href: appPaths.student.community },
  I6: { label: 'Ir a En familia', href: appPaths.student.conversations },
  I7: { label: 'Ir a la Central de Casos', href: appPaths.student.exploration },
  I8: { label: 'Ir a Investigaciones', href: appPaths.student.research },
  I9: { label: 'Ir a la Central de Casos', href: appPaths.student.exploration },
}
export function getProfileBadges(adventure: AdventureState, discovery: StudentDiscoveryState) {
  const earned = getAchievementGroups(adventure).flatMap((g, index) =>
    g.items.filter((b) => b.done).map((b) => ({ ...b, group: index })),
  )
  return discovery.profileBadgesConfigured
    ? discovery.profileBadges
        .flatMap((code) => {
          const badge = earned.find((b) => b.code === code)
          return badge ? [badge] : []
        })
        .slice(0, 3)
    : earned.slice(0, 3)
}
export function toggleProfileBadge(
  discovery: StudentDiscoveryState,
  adventure: AdventureState,
  code: string,
): StudentDiscoveryState {
  if (!getAchievementGroups(adventure).some((g) => g.items.some((b) => b.code === code && b.done)))
    return discovery
  const selected: string[] = getProfileBadges(adventure, discovery).map((b) => b.code)
  if (!selected.includes(code) && selected.length >= 3) return discovery
  return {
    ...discovery,
    profileBadgesConfigured: true,
    profileBadges: selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code],
  }
}
export function recordBadgeFirstSeenAt(
  discovery: StudentDiscoveryState,
  adventure: AdventureState,
  now = new Date().toISOString(),
): StudentDiscoveryState {
  const codes = getAchievementGroups(adventure).flatMap((g) =>
    g.items.filter((b) => b.done && !discovery.badgeFirstSeenAt[b.code]).map((b) => b.code),
  )
  return codes.length
    ? {
        ...discovery,
        badgeFirstSeenAt: {
          ...discovery.badgeFirstSeenAt,
          ...Object.fromEntries(codes.map((code) => [code, now])),
        },
      }
    : discovery
}
