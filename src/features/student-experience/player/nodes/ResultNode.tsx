import { useEffect } from 'react'
import { catalog, tipActivityIds } from '@/features/missions/content'
import { calculateResult, applyCompletion } from '@/features/missions/logic'
import type { Actividad } from '@/features/missions/model'
import { updateJourney, useJourney } from '@/features/missions/store'
import { CharacterAvatar } from '../CharacterAvatar'

export function ResultNode({ activity, instrumentId }: { activity: Actividad; instrumentId: string }) {
  const state = useJourney()
  const instrument = catalog.instrumentos.find((item) => item.id === instrumentId)
  const result = state.results.find((result) => result.instrumentoId === instrumentId)
  useEffect(() => {
    if (!instrument || result) return
    const calculated = calculateResult(instrument, state, tipActivityIds)
    if (calculated)
      updateJourney((current) =>
        applyCompletion(activity, { ...current, results: [...current.results, calculated] }),
      )
  }, [activity, instrument, result, state])
  return (
    <>
      <CharacterAvatar id="elena" size="md" />
      <h2 className="sx-result-title">Las pistas que hablan de ti</h2>
      {result ? (
        result.puntajes.map((score) => (
          <p key={score.dimensionId}>
            {instrument?.clave.dimensiones.find((dim) => dim.id === score.dimensionId)?.nombre}:{' '}
            {score.puntaje}
          </p>
        ))
      ) : (
        <p>
          Elena te espera al completar los 14 encuentros y cuando esté disponible la clave oficial del
          instrumento.
        </p>
      )}
    </>
  )
}
