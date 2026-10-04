import { isIso, isRecord, isStrings, persistentStore } from './persistentStore'

export type InstrumentPageId = 'intereses' | 'inteligencias' | 'habilidades'
export type ResearchPublication = {
  interviewee: string
  summary: string
  change: string
  videoUrl: string
  coauthors: string[]
}
export type ResearchInProgress = {
  occupationId: string
  before: string
  ownQuestions: string[]
  guideStep?: 0 | 1 | 2
  guideReadyAt?: string
  publication?: ResearchPublication
  publishedVideoId?: string
}
export type InterviewReaction = { learned?: { text: string; createdAt: string }; liked?: string }
export type StudentDiscoveryState = {
  version: 1
  revealedPages: InstrumentPageId[]
  planOrder: string[]
  research?: ResearchInProgress
  publishedResearch: {
    videoId: string
    occupationId: string
    coauthors: string[]
    change: string
    interviewee?: string
  }[]
  reactions: Record<string, InterviewReaction>
  viewedCareerIds: string[]
}
export const initialDiscoveryState = (): StudentDiscoveryState => ({
  version: 1,
  revealedPages: [],
  planOrder: [],
  publishedResearch: [],
  reactions: {},
  viewedCareerIds: [],
})
const text = (v: unknown) => typeof v === 'string'
const optionalIso = (v: unknown) => v === undefined || isIso(v)
export function validPublication(v: unknown): v is ResearchPublication {
  return (
    isRecord(v) &&
    ['interviewee', 'summary', 'change', 'videoUrl'].every((key) => text(v[key])) &&
    isStrings(v.coauthors)
  )
}
export function validDiscoveryState(v: unknown): v is StudentDiscoveryState {
  if (
    !isRecord(v) ||
    v.version !== 1 ||
    !isStrings(v.revealedPages) ||
    !v.revealedPages.every((id) => ['intereses', 'inteligencias', 'habilidades'].includes(id)) ||
    !isStrings(v.planOrder) ||
    !isStrings(v.viewedCareerIds) ||
    !Array.isArray(v.publishedResearch) ||
    !isRecord(v.reactions)
  )
    return false
  if (v.research !== undefined) {
    const r = v.research
    if (
      !isRecord(r) ||
      !text(r.occupationId) ||
      !text(r.before) ||
      !isStrings(r.ownQuestions) ||
      (r.guideStep !== undefined && !(typeof r.guideStep === 'number' && [0, 1, 2].includes(r.guideStep))) ||
      !optionalIso(r.guideReadyAt) ||
      (r.publishedVideoId !== undefined && !text(r.publishedVideoId)) ||
      (r.publication !== undefined && !validPublication(r.publication))
    )
      return false
  }
  return (
    v.publishedResearch.every(
      (r) =>
        isRecord(r) &&
        text(r.videoId) &&
        text(r.occupationId) &&
        text(r.change) &&
        isStrings(r.coauthors) &&
        (r.interviewee === undefined || text(r.interviewee)),
    ) &&
    Object.values(v.reactions).every(
      (r) =>
        isRecord(r) &&
        optionalIso(r.liked) &&
        (r.learned === undefined ||
          (isRecord(r.learned) && text(r.learned.text) && isIso(r.learned.createdAt))),
    )
  )
}
const store = persistentStore('ov.student-discovery.v1', initialDiscoveryState, validDiscoveryState)
export const useDiscovery = store.useState
export const useDiscoveryError = store.useError
export const updateDiscovery = store.update
export const getDiscovery = store.getSnapshot
