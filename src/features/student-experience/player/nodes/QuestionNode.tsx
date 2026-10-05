import { useState } from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'
import { catalog } from '@/features/missions/content'
import { evaluateQuestion, studentId } from '@/features/missions/logic'
import type { Actividad, NodoPregunta } from '@/features/missions/model'
import { updateJourney, useJourney } from '@/features/missions/store'
import { DialogueBox } from '../DialogueBox'
import { InlineDialogue } from '../InlineDialogue'

export function QuestionNode({
  activity,
  node,
  onContinue,
  fresh = false,
  onResources,
}: {
  activity: Actividad
  node: NodoPregunta
  onContinue: () => void
  fresh?: boolean
  onResources: (ids: string[]) => void
}) {
  const state = useJourney()
  const prior = state.attempts.filter(
    (attempt) => attempt.actividadId === activity.id && attempt.nodoId === node.id,
  )
  const last = fresh ? undefined : prior.at(-1)
  const [selected, setSelected] = useState<string[]>(last?.opcionIds ?? [])
  const [feedback, setFeedback] = useState(
    last ? evaluateQuestion(node, last.opcionIds, prior.length - 1) : undefined,
  )
  function answer(ids: string[]) {
    const outcome = evaluateQuestion(node, ids, prior.filter((attempt) => !attempt.correcta).length)
    if (
      updateJourney((current) => ({
        ...current,
        attempts: [
          ...current.attempts,
          {
            estudianteId: studentId,
            actividadId: activity.id,
            nodoId: node.id,
            opcionIds: ids,
            correcta: outcome.correct,
            revelada: outcome.revealed,
            numeroIntento: prior.length + 1,
            respondidaEn: new Date().toISOString(),
          },
        ],
      }))
    ) {
      setSelected(ids)
      setFeedback(outcome)
    }
  }
  const sheets = [
    ...new Set(
      activity.nodos.flatMap((node) => (node.tipo === 'diapositiva' ? (node.recursoIds ?? []) : [])),
    ),
  ].filter((id) => catalog.recursos.some((resource) => resource.id === id && resource.tipo === 'ficha'))
  const grid = node.opciones.length > 2 && node.opciones.every((option) => option.texto.length < 60)
  return (
    <div className="sx-player-scene">
      <div className="sx-scene-space">
        <section
          className={`sx-glass-dark sx-scene-panel ${feedback ? `sx-question-feedback ${feedback.correct ? 'is-correct' : 'is-incorrect'}` : ''}`}
        >
          <h2>{node.enunciado}</h2>
          {!feedback && (
            <p className="sx-player-response-instruction">
              {node.formato === 'opcion_multiple'
                ? 'Selecciona una o más respuestas.'
                : 'Selecciona una respuesta.'}
            </p>
          )}
          {!feedback ? (
            <>
              <div className={`sx-player-options sx-question-options ${grid ? 'sx-question-grid' : ''}`}>
                {node.opciones.map((option) => (
                  <button
                    type="button"
                    key={option.id}
                    className={`sx-player-option ${selected.includes(option.id) ? 'is-selected' : ''}`}
                    aria-pressed={selected.includes(option.id)}
                    onClick={() =>
                      node.formato === 'opcion_multiple'
                        ? setSelected(
                            selected.includes(option.id)
                              ? selected.filter((id) => id !== option.id)
                              : [...selected, option.id],
                          )
                        : answer([option.id])
                    }
                  >
                    <span className="sx-option-marker" aria-hidden="true">
                      {selected.includes(option.id) ? '●' : '○'}
                    </span>
                    <span className="sx-question-option-text">{option.texto}</span>
                  </button>
                ))}
              </div>
              {node.formato === 'opcion_multiple' && (
                <button
                  type="button"
                  className="sx-primary-button"
                  disabled={!selected.length}
                  onClick={() => answer(selected)}
                >
                  Confirmar selección
                </button>
              )}
            </>
          ) : (
            <div role="status">
              {node.opciones
                .filter((option) => selected.includes(option.id))
                .map((option) => (
                  <p key={option.id}>
                    <span className="sx-option-marker" aria-hidden="true">
                      {feedback.correct ? '✓' : '×'}
                    </span>
                    {option.retroalimentacion}
                  </p>
                ))}
              {feedback.revealed &&
                node.opciones
                  .filter((option) => option.correcta)
                  .map((option) => (
                    <p className="sx-player-option is-revealed" key={option.id}>
                      ✓ {option.texto}
                    </p>
                  ))}
              {feedback.canContinue && <p className="sx-question-explanation">{node.explicacion}</p>}
              {feedback.hint && (
                <InlineDialogue speakerId={feedback.hint.hablanteId} text={feedback.hint.texto} />
              )}
              <div className="sx-player-actions">
                {!feedback.correct && sheets.length > 0 && (
                  <button type="button" className="sx-secondary-button" onClick={() => onResources(sheets)}>
                    <BookOpen size={18} />
                    Ver ficha
                  </button>
                )}
                <button
                  type="button"
                  className="sx-primary-button"
                  onClick={() =>
                    feedback.canContinue ? onContinue() : (setFeedback(undefined), setSelected([]))
                  }
                >
                  {feedback.canContinue ? 'Continuar el camino' : 'Volver a intentarlo'}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
      <DialogueBox speakerId={node.hablanteId} text={node.enunciado} />
    </div>
  )
}
