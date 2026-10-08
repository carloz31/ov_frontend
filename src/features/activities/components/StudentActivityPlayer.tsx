import { useActivityCompletion } from '../hooks/useActivityCompletion'

import type { InstrumentoServidor } from './MaraInteractionPlayer'

import { studentId } from '@/lib/activities/logic'

import type { Actividad } from '@/types/activities'

import { DialogueBox } from './DialogueBox'
import { PlayerAmbient } from './PlayerAmbient'
import { PlayerTopBar } from './PlayerTopBar'
import { ResourceSheet } from './ResourceSheet'
import { FinishScreen } from './FinishScreen'
import { ChoiceNode } from './nodes/ChoiceNode'
import { SlideNode } from './nodes/SlideNode'
import { QuestionNode } from './nodes/QuestionNode'
import { ItemNode } from './nodes/ItemNode'
import { SubmissionNode } from './nodes/SubmissionNode'
import { MatrixNode } from './nodes/MatrixNode'
import { ResultNode } from './nodes/ResultNode'

export function StudentActivityPlayer({
  activity,
  imageUrl,
  direct = false,
  edit = false,
  instrumentoServidor,
  onClose,
}: {
  activity: Actividad
  imageUrl?: string
  direct?: boolean
  edit?: boolean
  instrumentoServidor?: InstrumentoServidor
  onClose: () => void
}) {
  const { pageRef, mode, nodes, index, progress, node, reaction, reactions, setReactions, matrix, previous,
    enviando, storageError, guardando, errorServidor, respuestaPendiente, itemResponse, soloLectura,
    advance, move, confirmacion, cierreServidor, openResources, itemServidor, item, itemOptions,
    valorServidor, existingItemAnswer, setErrorServidor, revisionInstrumento, resourceOpen, resourceIds, setResourceOpen,
    itemOcupado, itemSoloLectura, puedeTerminarEncuentro } = useActivityCompletion({ activity, direct, edit, instrumentoServidor, onClose })

  return (
    <div
      ref={pageRef}
      className={`fixed inset-0 z-40 sx-root sx-player location-${activity.id}`}
      data-ambient={mode}
    >
      <PlayerAmbient mode={mode} imageUrl={imageUrl} />
      <PlayerTopBar
        activity={activity}
        finished={!node && !reaction}
        index={index}
        total={nodes.length}
        progress={progress}
        nuevoMomento={node?.nuevoMomento}
        onClose={() => {
          if (!enviando.current) onClose()
        }}
      />
      {storageError && (
        <p className="sx-player-error" role="alert">
          {storageError}
        </p>
      )}
      {guardando && (
        <p className="sx-player-error" role="status">
          {respuestaPendiente.current
            ? 'Guardando la respuesta en el servidor…'
            : 'Guardando la actividad en el servidor…'}
        </p>
      )}
      {errorServidor && (
        <div className="sx-player-error" role="alert">
          <p>{errorServidor}</p>
          <button
            type="button"
            className="sx-primary-button"
            disabled={guardando}
            onClick={() =>
              respuestaPendiente.current
                ? itemResponse(respuestaPendiente.current.valor)
                : soloLectura && node?.tipo === 'item'
                  ? advance()
                  : move(undefined)
            }
          >
            {soloLectura && node?.tipo === 'item'
              ? 'Continuar la revisión'
              : `Reintentar${confirmacion.current || respuestaPendiente.current?.confirmada ? ' consulta' : ''}`}
          </button>
        </div>
      )}
      <main className="sx-player-stage">
        {reaction ? (
          <div className="sx-player-scene">
            <div className="sx-scene-space" />
            <DialogueBox
              key={reaction.id}
              speakerId={reaction.hablanteId}
              text={reaction.texto}
              hint="Escucha, a tu ritmo."
              onContinue={() => setReactions(reactions.slice(1))}
            />
          </div>
        ) : !node ? (
          <FinishScreen
            activity={activity}
            onClose={onClose}
            onResources={openResources}
            desbloqueosServidor={cierreServidor?.nuevos_desbloqueos}
            resultadosGenerados={cierreServidor?.resultados_generados}
          />
        ) : matrix ? (
          <MatrixNode
            activity={activity}
            onContinue={() => {
              const last = nodes.findLastIndex((node) => node.tipo === 'consigna')
              move(nodes[last + 1])
            }}
          />
        ) : node.tipo === 'dialogo' ? (
          <div className="sx-player-scene">
            <div className="sx-scene-space" />
            <DialogueBox
              key={node.id}
              speakerId={node.hablanteId}
              text={node.texto}
              hint="Una conversación, un paso más."
              onContinue={advance}
            />
          </div>
        ) : node.tipo === 'eleccion' ? (
          <ChoiceNode
            node={node}
            previous={previous?.tipo === 'dialogo' ? previous : undefined}
            onChoose={(option) =>
              move(
                nodes[index + 1],
                (current) =>
                  node.registrar
                    ? {
                        ...current,
                        choices: [
                          ...current.choices.filter(
                            (choice) => !(choice.actividadId === activity.id && choice.nodoId === node.id),
                          ),
                          {
                            estudianteId: studentId,
                            actividadId: activity.id,
                            nodoId: node.id,
                            opcionId: option.id,
                            respondidaEn: new Date().toISOString(),
                          },
                        ],
                      }
                    : current,
                option.reaccion,
              )
            }
          />
        ) : node.tipo === 'diapositiva' ? (
          <SlideNode node={node} onContinue={advance} onResources={openResources} />
        ) : node.tipo === 'pregunta' ? (
          <QuestionNode
            key={node.id}
            activity={activity}
            node={node}
            onContinue={advance}
            fresh={edit && activity.tipo === 'encuentro'}
            onResources={openResources}
          />
        ) : node.tipo === 'item' ? (
          <ItemNode
            key={node.id}
            node={node}
            text={itemServidor?.enunciado ?? item?.texto ?? 'Este ítem aún no está disponible.'}
            options={
              itemServidor
                ? itemServidor.escala.opciones.map((o) => ({ value: o.orden, text: o.etiqueta }))
                : itemOptions
            }
            existing={
              itemServidor
                ? valorServidor === undefined
                  ? undefined
                  : { valor: valorServidor }
                : existingItemAnswer
            }
            busy={itemOcupado}
            readOnly={itemSoloLectura}
            direct={direct}
            onAnswer={itemResponse}
            onContinue={() => {
              if (!guardando && !respuestaPendiente.current) {
                setErrorServidor('')
                advance()
              }
            }}
          />
        ) : node.tipo === 'consigna' ? (
          <div className="sx-card-stage">
            <section className="sx-glass sx-player-card sx-submission-card case-scrollbar">
              <SubmissionNode
                key={node.id}
                activity={activity}
                node={node}
                onSaved={advance}
                onKeep={advance}
                edit={edit}
              />
              {!node.obligatoria && (
                <button type="button" className="sx-secondary-button" onClick={advance}>
                  Dejar para después
                </button>
              )}
            </section>
          </div>
        ) : (
          <div className="sx-card-stage">
            <section className="sx-glass-dark sx-player-card sx-result-card case-scrollbar">
              <ResultNode activity={activity} instrumentId={node.instrumentoId} />
              {puedeTerminarEncuentro && (
                <button className="sx-primary-button" disabled={guardando} onClick={advance}>
                  {revisionInstrumento ? 'Volver a la ciudad' : 'Terminar encuentro'}
                </button>
              )}
            </section>
          </div>
        )}
      </main>
      <ResourceSheet open={resourceOpen} ids={resourceIds} onClose={() => setResourceOpen(false)} />
    </div>
  )
}
