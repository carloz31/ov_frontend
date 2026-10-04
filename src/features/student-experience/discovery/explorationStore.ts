import type { SetStateAction } from 'react'
import { mockOccupationProfiles } from '@/features/occupation-exploration/data/OccupationExplorationData'
import type { OccupationProfile } from '@/features/occupation-exploration/types/OccupationExplorationTypes'
import type { DecisionSheet } from '@/features/occupation-exploration/types/StudentDecisionTypes'
import { isIso, isRecord, isStrings, persistentStore } from './persistentStore'

export type StudentExplorationState = {
  version: 1
  profiles: OccupationProfile[]
  careerInterestIds: string[]
  institutionInterestIds: string[]
  decisionSheets: DecisionSheet[]
}
export const initialExplorationState = (): StudentExplorationState => ({
  version: 1,
  profiles: mockOccupationProfiles.map((p) => ({ ...p })),
  careerInterestIds: [],
  institutionInterestIds: [],
  decisionSheets: [],
})
export function validExplorationState(v: unknown): v is StudentExplorationState {
  return (
    isRecord(v) &&
    v.version === 1 &&
    isStrings(v.careerInterestIds) &&
    isStrings(v.institutionInterestIds) &&
    Array.isArray(v.profiles) &&
    v.profiles.every(
      (p) =>
        isRecord(p) &&
        typeof p.occupationId === 'string' &&
        ['unused', 'unlocked', 'explored'].includes(String(p.discoveryState)) &&
        typeof p.interested === 'boolean',
    ) &&
    Array.isArray(v.decisionSheets) &&
    v.decisionSheets.every((s) => {
      if (
        !isRecord(s) ||
        !['active', 'favorite', 'archived'].includes(String(s.status)) ||
        !isIso(s.createdAt) ||
        (s.sourceId !== undefined && typeof s.sourceId !== 'string')
      )
        return false
      if (
        ![
          'id',
          'name',
          'interestedSince',
          'motivation',
          'optionQuality',
          'knowledge',
          'dailyWork',
          'fit',
          'selfKnowledge',
          'selfKnowledgeNote',
          'strengths',
          'challenges',
          'interviewFindings',
          'researchFindings',
        ].every((key) => typeof s[key] === 'string')
      )
        return false
      return (
        ['noInfluence', 'interviewed', 'researched'].every((key) => typeof s[key] === 'boolean') &&
        isStrings(s.preparation) &&
        isStrings(s.customPreparation) &&
        Array.isArray(s.influences) &&
        s.influences.every(
          (i) => isRecord(i) && ['id', 'person', 'description'].every((key) => typeof i[key] === 'string'),
        ) &&
        Array.isArray(s.budgets) &&
        s.budgets.every(
          (b) =>
            isRecord(b) &&
            [
              'id',
              'label',
              'name',
              'modality',
              'city',
              'duration',
              'housing',
              'enrollmentCost',
              'tuitionCost',
              'materialsCost',
              'monthlyLivingCost',
              'academyMonths',
              'academyCost',
              'scholarshipNote',
            ].every((key) => typeof b[key] === 'string') &&
            typeof b.scholarship === 'boolean',
        ) &&
        Array.isArray(s.timeline) &&
        s.timeline.every(
          (e) =>
            isRecord(e) &&
            typeof e.id === 'string' &&
            isIso(e.date) &&
            ['created', 'certainty', 'favorite', 'archived', 'reactivated', 'reconfirmed'].includes(
              String(e.type),
            ),
        )
      )
    })
  )
}
const store = persistentStore('ov.student-exploration.v1', initialExplorationState, validExplorationState)
export const useExploration = store.useState
export const useExplorationError = store.useError
export const updateExploration = store.update
export const getExploration = store.getSnapshot
export function setDecisionSheets(action: SetStateAction<DecisionSheet[]>) {
  updateExploration((s) => ({
    ...s,
    decisionSheets: typeof action === 'function' ? action(s.decisionSheets) : action,
  }))
}
const toggle = (ids: string[], id: string) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id])
export const toggleCareerInterest = (id: string) =>
  updateExploration((s) => ({ ...s, careerInterestIds: toggle(s.careerInterestIds, id) }))
export const toggleInstitutionInterest = (id: string) =>
  updateExploration((s) => ({ ...s, institutionInterestIds: toggle(s.institutionInterestIds, id) }))
export function toggleOccupationInterest(id: string) {
  updateExploration((s) => ({
    ...s,
    profiles: s.profiles.some((p) => p.occupationId === id)
      ? s.profiles.map((p) => (p.occupationId === id ? { ...p, interested: !p.interested } : p))
      : [...s.profiles, { occupationId: id, interested: true, discoveryState: 'unused' }],
  }))
}
