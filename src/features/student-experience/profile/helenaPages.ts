import { catalog, tipActivityIds } from '@/features/missions/content'
import { calculateResult, type JourneyState } from '@/features/missions/logic'
import type { InstrumentPageId, StudentDiscoveryState } from '../discovery/discoveryStore'

export type HelenaPageState = 'sealed' | 'ready' | 'revealed'
export type HelenaResult = {
  source: 'real' | 'demo'
  areas: { code: string; name: string; score: number; description: string }[]
}
export type HelenaPage = {
  id: InstrumentPageId
  numeral: 'I' | 'II' | 'III'
  title: string
  subtitle: string
  required: boolean
  state: HelenaPageState
  missions: { done: number; total: number }
  teaser: string
  activityHref?: string
  result?: HelenaResult
  demo: boolean
}
export function getHelenaPageState(complete: boolean, revealed: boolean): HelenaPageState {
  return !complete ? 'sealed' : revealed ? 'revealed' : 'ready'
}

// Demostraciones: se reemplazan cuando existan las 14 interacciones y los instrumentos completos.
export const demoInterests: HelenaResult = {
  source: 'demo',
  areas: [
    {
      code: 'S',
      name: 'Social',
      score: 78,
      description:
        'En este ejemplo, despierta curiosidad acompañar a otras personas y compartir conocimientos.',
    },
    {
      code: 'I',
      name: 'Investigador',
      score: 72,
      description: 'Explorar preguntas, observar y comprender cómo funcionan las cosas.',
    },
    {
      code: 'A',
      name: 'Artístico',
      score: 66,
      description: 'Expresar ideas y explorar distintas formas de crear.',
    },
  ],
}
const demoIntelligences: HelenaResult = {
  source: 'demo',
  areas: [
    {
      code: 'L',
      name: 'Lingüística',
      score: 75,
      description: 'Explorar ideas mediante palabras, relatos y conversaciones.',
    },
    {
      code: 'P',
      name: 'Interpersonal',
      score: 75,
      description: 'Aprender con otras personas y comprender sus puntos de vista.',
    },
  ],
}
export function getHelenaPages(journey: JourneyState, discovery: StudentDiscoveryState): HelenaPage[] {
  const done = tipActivityIds.filter((id) => journey.progress[id]?.estado === 'completada').length
  const instrument = catalog.instrumentos.find((i) => i.id === 'tip')
  const validReal = (candidate: (typeof journey.results)[number] | undefined) =>
    !!instrument &&
    !!candidate &&
    done === 14 &&
    instrument.clave.dimensiones.length > 0 &&
    candidate.puntajes.length === instrument.clave.dimensiones.length &&
    new Set(candidate.puntajes.map((score) => score.dimensionId)).size === candidate.puntajes.length &&
    candidate.puntajes.every(
      (score) =>
        Number.isFinite(score.puntaje) &&
        instrument.clave.dimensiones.some(
          (dimension) => dimension.id === score.dimensionId && !dimension.nombre.includes('['),
        ),
    )
  const stored = journey.results.find((result) => result.instrumentoId === 'tip' && validReal(result))
  const calculated = stored
    ? undefined
    : instrument
      ? calculateResult(instrument, journey, tipActivityIds)
      : undefined
  const raw = stored ?? (validReal(calculated) ? calculated : undefined)
  const valid = !!raw
  const real: HelenaResult | undefined = valid
    ? {
        source: 'real',
        areas: raw!.puntajes
          .map((s) => {
            const name = instrument!.clave.dimensiones.find((d) => d.id === s.dimensionId)!.nombre
            return {
              code: name[0],
              name,
              score: s.puntaje,
              description: `Te atraen actividades vinculadas con ${name.toLocaleLowerCase()}.`,
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3),
      }
    : undefined
  const result = real ?? demoInterests
  const firstComplete = journey.progress['act-tip-01']?.estado === 'completada'
  const pages = [
    {
      id: 'intereses' as const,
      numeral: 'I' as const,
      title: 'Lo que te atrae hacer',
      subtitle: 'Tus intereses',
      required: true,
      missions: { done, total: 14 },
      complete: !!real || firstComplete,
      demo: !real,
      result,
      teaser: 'Esta página aún guarda pistas sobre lo que te atrae hacer.',
      activityHref: '/student/exploration?actividad=act-tip-01',
    },
    {
      id: 'inteligencias' as const,
      numeral: 'II' as const,
      title: 'Tus formas de ser inteligente',
      subtitle: 'Tus inteligencias',
      required: false,
      missions: { done: 1, total: 1 },
      complete: true,
      demo: true,
      result: demoIntelligences,
      teaser: 'Esta página guarda formas de aprender y resolver.',
    },
    {
      id: 'habilidades' as const,
      numeral: 'III' as const,
      title: 'Cómo te relacionas',
      subtitle: 'Tus habilidades sociales',
      required: true,
      missions: { done: 2, total: 4 },
      complete: false,
      demo: true,
      result: {
        source: 'demo' as const,
        areas: [
          {
            code: 'E',
            name: 'Escucha',
            score: 65,
            description: 'Encontrar espacio para la mirada de otras personas.',
          },
        ],
      },
      teaser: 'Esta página aún guarda algo sobre cómo te relacionas con los demás.',
    },
  ]
  return pages.map(({ complete, ...p }) => {
    const state = getHelenaPageState(complete, discovery.revealedPages.includes(p.id))
    return { ...p, state, result: state === 'revealed' ? p.result : undefined }
  })
}
