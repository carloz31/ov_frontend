import { catalog } from '@/features/missions/content'
import type { JourneyState } from '@/features/missions/logic'
import { getAchievementGroups } from '@/features/occupation-exploration/lib/AdventureAchievements'
import { isCityUnlocked, isFamilyUnlocked } from '@/features/occupation-exploration/lib/AdventureStore'
import {
  getTravelResources,
  isTravelResourceUnlocked,
} from '@/features/occupation-exploration/lib/TravelerResources'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import type { StudentDiscoveryState } from '../discovery/discoveryStore'
import type { StudentUiState } from '../ui-state'

export type UnlockItem = {
  id: string
  kind: 'badge' | 'ficha' | 'heroe' | 'ciudad' | 'familia' | 'plan'
  title: string
  description?: string
  href: string
}

export function getEarnedBadges(adventure: AdventureState) {
  return getAchievementGroups(adventure)
    .flatMap((group) => group.items)
    .filter((badge) => badge.done)
}

export function getUnlocks(
  adventure: AdventureState,
  journey: JourneyState,
  discovery?: StudentDiscoveryState,
): UnlockItem[] {
  return [
    ...(discovery?.revealedPages ?? []).map((id): UnlockItem => ({
      id: `plans:${id}`,
      kind: 'plan',
      title: 'Revisa tus planes',
      description: `Página de ${id} descifrada. Un nuevo descubrimiento puede abrir otra ruta.`,
      href: appPaths.student.decisions,
    })),
    ...getEarnedBadges(adventure).map((badge): UnlockItem => ({
      id: `badge:${badge.code}`,
      kind: 'badge',
      title: badge.title,
      href: appPaths.student.passport,
    })),
    ...[...new Set(journey.resources)].flatMap((id) => {
      const resource = catalog.recursos.find((resource) => resource.id === id)
      return resource
        ? [
            {
              id: `ficha:${id}`,
              kind: 'ficha' as const,
              title: resource.titulo,
              href: appPaths.student.resources,
            },
          ]
        : []
    }),
    ...getTravelResources()
      .filter(
        (resource) =>
          resource.kind === 'testimonial' && isTravelResourceUnlocked(resource, journey, adventure),
      )
      .map((resource): UnlockItem => ({
        id: `heroe:${resource.id}`,
        kind: 'heroe',
        title: resource.title,
        href: appPaths.student.testimonials,
      })),
    ...(isCityUnlocked(adventure)
      ? [
          {
            id: 'ciudad',
            kind: 'ciudad' as const,
            title: 'La ciudad te espera',
            href: appPaths.student.exploration,
          },
        ]
      : []),
    ...(isFamilyUnlocked(adventure)
      ? [
          {
            id: 'familia',
            kind: 'familia' as const,
            title: 'Conversaciones en familia',
            href: appPaths.student.conversations,
          },
        ]
      : []),
  ]
}

export function seedStudentUnlocks(
  ui: StudentUiState,
  adventure: AdventureState,
  journey: JourneyState,
): StudentUiState {
  if (ui.initialized) return ui
  return {
    ...ui,
    initialized: true,
    seenUnlockIds: [
      ...new Set([...ui.seenUnlockIds, ...getUnlocks(adventure, journey).map((item) => item.id)]),
    ],
    announcedBadgeCodes: [
      ...new Set([...ui.announcedBadgeCodes, ...getEarnedBadges(adventure).map((badge) => badge.code)]),
    ],
  }
}

export function orderUnlocks(items: UnlockItem[], ui: StudentUiState) {
  const seen = new Set(ui.seenUnlockIds)
  return [...items].sort((a, b) => Number(seen.has(a.id)) - Number(seen.has(b.id)))
}

export function markUnlocksSeen(ui: StudentUiState, items: UnlockItem[]): StudentUiState {
  const ids = items.map((item) => item.id)
  if (ids.every((id) => ui.seenUnlockIds.includes(id))) return ui
  return { ...ui, seenUnlockIds: [...new Set([...ui.seenUnlockIds, ...ids])] }
}

export function markBadgeAnnounced(ui: StudentUiState, code: string): StudentUiState {
  return ui.announcedBadgeCodes.includes(code)
    ? ui
    : { ...ui, announcedBadgeCodes: [...ui.announcedBadgeCodes, code] }
}

export function getNextBadge(
  adventure: AdventureState,
  ui: StudentUiState,
  activityOpen: boolean,
  overlayOpen: boolean,
) {
  if (!ui.initialized || activityOpen || overlayOpen) return undefined
  return getEarnedBadges(adventure).find((badge) => !ui.announcedBadgeCodes.includes(badge.code))
}
