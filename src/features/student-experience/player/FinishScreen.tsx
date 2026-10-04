import { ArrowRight, BookOpen, KeyRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { catalog } from '@/features/missions/content'
import type { Actividad } from '@/features/missions/model'
import { useJourney } from '@/features/missions/store'
import { appPaths } from '@/routes/paths'
import { CharacterAvatar } from './CharacterAvatar'

export function FinishScreen({
  activity,
  nextActivity,
  onClose,
  onNext,
}: {
  activity: Actividad
  nextActivity?: Actividad
  onClose: () => void
  onNext: (id: string) => void
}) {
  const state = useJourney()
  const navigate = useNavigate()
  const piece = catalog.piezasLlave.find((piece) => piece.id === activity.recompensa?.piezaLlave)
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
          <CharacterAvatar id="companero" size="lg" />
        </div>
        <h2>
          {state.progress[activity.id]?.estado === 'completada'
            ? 'Este hallazgo viaja contigo.'
            : 'Tu avance queda guardado.'}
        </h2>
        <p>{activity.recompensa?.mensajeFin}</p>
        {(piece || sheets.length > 0) && (
          <section className="sx-finish-section">
            <h3>Lo que llevas contigo</h3>
            {piece && (
              <p className="sx-finish-reward">
                <KeyRound size={22} />
                {piece.nombre}
              </p>
            )}
            {sheets.map((resource) => (
              <div className="sx-finish-reward" key={resource.id}>
                <BookOpen size={22} />
                <span>
                  {resource.titulo}
                  <small>En tu mochila</small>
                </span>
              </div>
            ))}
          </section>
        )}
        {activity.promptDiario && (
          <section className="sx-finish-section">
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
          <h3>Lo que viene</h3>
          <div className="sx-player-actions">
            {nextActivity && (
              <button type="button" className="sx-primary-button" onClick={() => onNext(nextActivity.id)}>
                Seguir hacia {nextActivity.ubicacion ?? nextActivity.titulo}
                <ArrowRight size={18} />
              </button>
            )}
            {activity.siguienteSugerida === 'act-07' && (
              <button type="button" className="sx-primary-button" onClick={() => onNext('act-07')}>
                Revisar mis propias creencias
                <ArrowRight size={18} />
              </button>
            )}
            <button type="button" className="sx-secondary-button" onClick={onClose}>
              Volver al mapa
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
