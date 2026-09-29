import { useState } from 'react'
import { activities } from './content'
import { downloadFile, useJourney } from './store'
import './journey.css'

export function JourneyReview() {
  const state = useJourney()
  const [error, setError] = useState('')
  const shared = state.submissions.filter((entry) => {
    const node = activities
      .find((activity) => activity.id === entry.actividadId)
      ?.nodos.find((node) => node.id === entry.nodoId)
    return node?.tipo === 'consigna' && node.visibilidad !== 'solo_estudiante'
  })
  return (
    <section className="rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold">Huellas de la travesía</h2>
      <p className="my-3 text-sm text-muted-foreground">
        Estudiante del prototipo · registros de este navegador. Las entregas privadas no se muestran.
      </p>
      {!shared.length && !state.attempts.length && (
        <p className="text-sm">Todavía no hay entregas ni retos respondidos.</p>
      )}
      {activities.map((activity) => {
        const submissions = shared.filter((entry) => entry.actividadId === activity.id)
        const attempts = state.attempts.filter((attempt) => attempt.actividadId === activity.id)
        if (!submissions.length && !attempts.length) return null
        return (
          <details className="mt-4 rounded-xl border p-4" key={activity.id}>
            <summary className="cursor-pointer font-semibold">
              {activity.titulo} ·{' '}
              {state.progress[activity.id]?.estado === 'completada' ? 'Completada' : 'En curso'}
            </summary>
            {submissions.map((entry) => {
              const node = activity.nodos.find((node) => node.id === entry.nodoId)
              return (
                <article key={entry.id} className="mt-4 rounded-xl bg-muted/40 p-4">
                  <h3 className="text-sm font-semibold">
                    {node?.tipo === 'consigna' ? (node.etiqueta ?? node.premisa) : entry.nodoId}
                  </h3>
                  <p className="mb-2 text-xs text-muted-foreground">
                    Versión {entry.version} · {new Date(entry.enviadoEn).toLocaleString('es-PE')}
                  </p>
                  {entry.contenido.tipo === 'texto' ? (
                    <p className="whitespace-pre-wrap text-sm">{entry.contenido.texto}</p>
                  ) : entry.contenido.tipo === 'opcion' ? (
                    <p>{entry.contenido.seleccion.join(', ')}</p>
                  ) : (
                    entry.contenido.archivos.map((file) => (
                      <button
                        className="journey-link"
                        key={file.id}
                        onClick={() => {
                          void downloadFile(file.id, file.nombre).catch((error) => setError(error.message))
                        }}
                      >
                        {file.nombre} · Descargar
                      </button>
                    ))
                  )}
                </article>
              )
            })}
            {attempts.length > 0 && (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="p-2">Concepto</th>
                      <th className="p-2">Intento</th>
                      <th className="p-2">Respuesta</th>
                      <th className="p-2">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => {
                      const question = activity.nodos.find((node) => node.id === attempt.nodoId)
                      return (
                        <tr className="border-t" key={`${attempt.nodoId}/${attempt.numeroIntento}`}>
                          <td className="p-2">
                            {question?.tipo === 'pregunta' ? question.enunciado : attempt.nodoId}
                          </td>
                          <td className="p-2">{attempt.numeroIntento}</td>
                          <td className="p-2">
                            {attempt.opcionIds
                              .map((id) =>
                                question?.tipo === 'pregunta'
                                  ? question.opciones.find((option) => option.id === id)?.texto
                                  : id,
                              )
                              .join('; ')}
                          </td>
                          <td className="p-2">
                            {attempt.correcta
                              ? 'Comprendido'
                              : attempt.revelada
                                ? 'Respuesta revelada'
                                : 'Con pista'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </details>
        )
      })}
      {error && (
        <p role="alert" className="mt-3 text-red-700">
          {error}
        </p>
      )}
    </section>
  )
}
