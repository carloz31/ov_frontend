import { ArrowRight, BookOpen } from 'lucide-react'
import { modoApi } from '@/features/servidor/config'
import { actividadServidor, textosDesbloqueos } from '@/features/servidor/adaptadores'
import { obtenerEstadoServidor } from '@/features/servidor/estadoServidor'
import type { DesbloqueoNuevo } from '@/features/servidor/tipos'
import { useNavigate } from 'react-router'
import { catalog } from '@/features/missions/content'
import type { Actividad } from '@/features/missions/model'
import { useJourney } from '@/features/missions/store'
import { appPaths } from '@/routes/paths'
import { LumiMedallion } from './LumiMedallion'
import { RewardCard } from './RewardCard'
import { additionalMissions } from '../reflection/config'

export function FinishScreen({
  activity,
  onClose,
  onResources,
  desbloqueosServidor,
  resultadosGenerados,
}: {
  activity: Actividad
  onClose: () => void
  onResources?: (ids: string[]) => void
  desbloqueosServidor?: DesbloqueoNuevo[]
  resultadosGenerados?: { instrumento: string; aplicacion: string }[]
}) {
  const state = useJourney()
  const navigate = useNavigate()
  if (modoApi)
    return (
      <div className="sx-card-stage">
        <section className="sx-glass sx-player-card sx-finish-card case-scrollbar">
          <div className="sx-finish-avatar">
            <LumiMedallion celebration />
            <small>Lumi</small>
          </div>
          <h2>
            {actividadServidor(obtenerEstadoServidor().estado, activity.id)?.estado === 'COMPLETADA'
              ? 'Este hallazgo viaja contigo.'
              : 'Consultando tu avance.'}
          </h2>
          <p>Tu actividad quedó registrada en el servidor.</p>
          {activity.id === 'act-tip-14' &&
            resultadosGenerados?.some((r) => r.instrumento === 'TEST-RIASEC') && (
              <section className="sx-finish-section">
                <h3>Elena tiene algo que mostrarte</h3>
                <button className="sx-primary-button" onClick={() => navigate('/student/profile/helena')}>
                  Abrir el libro de Helena
                </button>
              </section>
            )}
          {textosDesbloqueos(desbloqueosServidor ?? []).length > 0 && (
            <section className="sx-finish-section">
              <h3>Lo que se abrió en tu camino</h3>
              <ul>
                {textosDesbloqueos(desbloqueosServidor ?? []).map((d) => (
                  <li key={`${d.tipo}:${d.codigo}`}>
                    <p>{d.texto}</p>
                    {d.tipo === 'FICHA' && (
                      <button
                        type="button"
                        className="sx-secondary-button"
                        onClick={() =>
                          navigate(`${appPaths.student.resources}?ficha=${encodeURIComponent(d.codigo)}`)
                        }
                      >
                        Ver ficha
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {desbloqueosServidor?.length === 0 && <p>No hay nuevos desbloqueos en esta repetición.</p>}
          {activity.promptDiario && (
            <section className="sx-finish-section">
              <h3>Una pregunta para tu diario</h3>
              <blockquote>{activity.promptDiario}</blockquote>
              <button
                type="button"
                className="sx-secondary-button"
                onClick={() =>
                  navigate(
                    `${appPaths.student.journal}?${new URLSearchParams({ activity: activity.id, title: activity.titulo, prompt: activity.promptDiario ?? '' })}`,
                  )
                }
              >
                <BookOpen size={18} />
                Escribir en mi diario
              </button>
            </section>
          )}
          <section className="sx-finish-section">
            <button type="button" className="sx-primary-button" onClick={onClose}>
              Continuar
              <ArrowRight size={18} />
            </button>
          </section>
        </section>
      </div>
    )
  const piece = catalog.piezasLlave.find((piece) => piece.id === activity.recompensa?.piezaLlave)
  const badge =
    state.progress[activity.id]?.estado === 'completada' &&
    additionalMissions.find((m) => m.id === activity.id)?.insignia
  const ids = [
    ...new Set([
      ...activity.nodos.flatMap((node) => (node.tipo === 'diapositiva' ? (node.recursoIds ?? []) : [])),
      ...(activity.recompensa?.recursoIds ?? []),
    ]),
  ]
  const sheets = catalog.recursos.filter(
    (resource) =>
      ids.includes(resource.id) && resource.tipo === 'ficha' && state.resources.includes(resource.id),
  )
  return (
    <div className="sx-card-stage">
      <section className="sx-glass sx-player-card sx-finish-card case-scrollbar">
        <div className="sx-finish-avatar">
          <LumiMedallion celebration />
          <small>Lumi</small>
        </div>
        <h2>
          {state.progress[activity.id]?.estado === 'completada'
            ? 'Este hallazgo viaja contigo.'
            : 'Tu avance queda guardado.'}
        </h2>
        {!activity.recompensa?.mensajeFin?.startsWith('Obtuviste:') && (
          <p>{activity.recompensa?.mensajeFin}</p>
        )}
        {(piece || badge || sheets.length > 0) && (
          <section className="sx-finish-section">
            <h3>Lo que llevas contigo</h3>
            {badge && (
              <RewardCard
                kind="badge"
                title={badge.nombre}
                onOpen={() => navigate(appPaths.student.passport)}
              />
            )}
            {piece && (
              <RewardCard
                kind="object"
                title={piece.nombre}
                progress={{
                  obtained: catalog.piezasLlave.filter((p) => state.pieces.includes(p.id)).length,
                  needed: catalog.piezasLlave.length,
                  place: 'la ciudad',
                }}
              />
            )}
            {sheets.map((resource, index) => (
              <RewardCard
                kind="sheet"
                key={resource.id}
                title={resource.titulo}
                index={index + (piece ? 1 : 0)}
                onOpen={() =>
                  onResources
                    ? onResources([resource.id])
                    : navigate(`${appPaths.student.resources}?ficha=${encodeURIComponent(resource.id)}`)
                }
              />
            ))}
          </section>
        )}
        {activity.promptDiario && (
          <section className="sx-finish-section">
            <h3>Nueva pregunta en tu diario</h3>
            <blockquote>{activity.promptDiario}</blockquote>
            <button
              type="button"
              className="sx-secondary-button"
              onClick={() =>
                navigate(
                  `${appPaths.student.journal}?${new URLSearchParams({ activity: activity.id, title: activity.titulo, prompt: activity.promptDiario ?? '' })}`,
                )
              }
            >
              <BookOpen size={18} />
              Escribir en mi diario
            </button>
          </section>
        )}
        <section className="sx-finish-section">
          <div className="sx-player-actions">
            <button type="button" className="sx-primary-button" onClick={onClose}>
              Continuar
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
        {activity.id === 'act-tip-01' && (
          <p className="sx-player-note">
            Has recorrido 1 de 14 encuentros. Las próximas voces de la aldea estarán disponibles cuando
            orientación las prepare.
          </p>
        )}
      </section>
    </div>
  )
}
