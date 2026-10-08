import { useEffect } from 'react'
import { Link } from 'react-router'
import { modoApi } from '@/config/env'
import { areasRiasec } from '@/lib/servidor/adaptadores'
import {
  cargarResultadoRiasec,
  mensajeErrorServidor,
  useEstadoServidor,
} from '@/store/servidor/estadoServidor'
import { catalog, tipActivityIds } from '@/data/activities/content'
import { calculateResult, applyCompletion } from '@/lib/activities/logic'
import type { Actividad } from '@/types/activities'
import { updateJourney, useJourney } from '@/store/journeyStore'
import { CharacterAvatar } from '@/components/student/CharacterAvatar'

export function ResultNode({ activity, instrumentId }: { activity: Actividad; instrumentId: string }) {
  const state = useJourney()
  const servidor = useEstadoServidor()
  const instrument = catalog.instrumentos.find((item) => item.id === instrumentId)
  const result = state.results.find((result) => result.instrumentoId === instrumentId)
  useEffect(() => {
    if (modoApi || !instrument || result) return
    const calculated = calculateResult(instrument, state, tipActivityIds)
    if (calculated)
      updateJourney((current) =>
        applyCompletion(activity, { ...current, results: [...current.results, calculated] }),
      )
  }, [activity, instrument, result, state])
  if (modoApi)
    return (
      <>
        <CharacterAvatar id="elena" size="md" />
        <h2 className="sx-result-title">Las pistas que hablan de ti</h2>
        {servidor.estadoResultado === 'error' ? (
          <>
            <p role="alert">{mensajeErrorServidor(servidor.errorResultado)}</p>
            <button className="sx-secondary-button" onClick={() => void cargarResultadoRiasec()}>
              Reintentar consulta
            </button>
          </>
        ) : !servidor.resultadoRiasec ? (
          <p>Elena te espera al completar los 14 encuentros con Mara.</p>
        ) : servidor.resultadoRiasec.perfil_plano ? (
          <>
            <p>Tus respuestas todavía no distinguen un interés. Puedes revisar tus encuentros con Mara.</p>
            <Link className="sx-secondary-button" to="/student/exploration?punto=mara-test">
              Revisar mis encuentros
            </Link>
          </>
        ) : (
          <>
            {areasRiasec(servidor.resultadoRiasec).map((d) => (
              <p key={d.codigo}>
                <strong>{d.nombre}</strong>: {d.porcentaje}%
              </p>
            ))}
            <p>
              Estos intereses describen actividades que despiertan tu curiosidad, sin calificar tus
              capacidades.
            </p>
            <Link className="sx-secondary-button" to="/student/profile/helena">
              Abrir el libro de Helena
            </Link>
          </>
        )}
      </>
    )
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
