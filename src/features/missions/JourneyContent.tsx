import { useState } from 'react'
import { BookOpen, Check, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { catalog } from './content'
import type { BloqueContenido } from './model'
import { updateJourney, useJourney } from './store'

export function Character({
  id = 'companero',
  expression,
  small = false,
}: {
  id?: string
  expression?: string
  small?: boolean
}) {
  const person = catalog.personajes.find((person) => person.id === id)
  const url = (expression && person?.expresiones?.[expression]) || person?.avatarUrl
  const [failed, setFailed] = useState('')
  const name = id === 'companero' ? 'Lumi' : (person?.nombre ?? id)
  return (
    <div className={`journey-character ${small ? 'is-small' : ''}`}>
      <div className={`journey-avatar avatar-${id}`}>
        {url && failed !== url ? (
          <img src={url} alt={name} onError={() => setFailed(url)} />
        ) : (
          <CharacterPortrait id={id} expression={expression} />
        )}
      </div>
      <div>
        <strong>{name}</strong>
        <span>{person?.ubicacion ?? 'Tu compañero de travesía'}</span>
      </div>
    </div>
  )
}
function CharacterPortrait({ id, expression }: { id: string; expression?: string }) {
  const thoughtful = expression === 'dudoso' || expression === 'pensativo'
  const smiling = ['sonrie', 'contento', 'animado'].includes(expression ?? '')
  if (id === 'companero')
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="m40 9 10 20 21 11-21 10-10 21-10-21L9 40l21-11Z" fill="#c7a65a" />
        <circle cx="40" cy="40" r="17" fill="#fff0b6" />
        <circle cx="34" cy="38" r="2" fill="#6b623a" />
        <circle cx="46" cy="38" r="2" fill="#6b623a" />
        <path
          d={thoughtful ? 'M37 47h7' : 'M35 45q5 6 10 0'}
          fill="none"
          stroke="#6b623a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  const hair = id === 'mara' ? '#775342' : id === 'aurelio' ? '#ddd7bf' : '#414f48'
  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path
        d="M7 80q3-25 33-25t33 25"
        fill={id === 'mara' ? '#647f62' : id === 'aurelio' ? '#ae8057' : '#5a8586'}
      />
      <path d="M19 42V29Q19 6 41 10q23 1 22 25v26H17Z" fill={hair} />
      <rect x="33" y="48" width="15" height="17" rx="5" fill="#cf9b77" />
      <ellipse cx="40" cy="35" rx="20" ry="24" fill="#e7bc94" />
      <path d="M20 32Q12 8 40 9q27-1 23 22-16-3-24-16-5 14-19 17" fill={hair} />
      <path
        d={thoughtful ? 'm27 29 9-3m9 2 8 3' : 'M27 28h8m10 0h8'}
        stroke="#70513c"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="31" cy="35" r="2" fill="#4d4739" />
      <circle cx="49" cy="35" r="2" fill="#4d4739" />
      {id === 'aurelio' && <path d="M21 44q4 19 19 18 17-2 20-19-5 9-20 7-13 2-19-6" fill={hair} />}
      <path
        d={smiling ? 'M33 45q7 9 14 0' : thoughtful ? 'm35 48 11-2' : 'M35 46q5 3 10 0'}
        stroke="#976d55"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
export function ContentBlocks({ blocks }: { blocks: BloqueContenido[] }) {
  return (
    <div className="journey-reading">
      {blocks.map((block, i) => {
        switch (block.tipo) {
          case 'parrafo':
            return <p key={i}>{block.texto}</p>
          case 'lista': {
            const List = block.ordenada ? 'ol' : 'ul'
            return (
              <section key={i}>
                {block.titulo && <h3>{block.titulo}</h3>}
                <List>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </List>
              </section>
            )
          }
          case 'destacado':
            return (
              <aside key={i} className={`journey-highlight ${block.variante}`}>
                {block.texto}
              </aside>
            )
          case 'comparacion':
            return (
              <div key={i} className="journey-comparison">
                {[block.izquierda, block.derecha].map((side) => (
                  <section key={side.titulo}>
                    <h3>{side.titulo}</h3>
                    <p>{side.texto}</p>
                  </section>
                ))}
              </div>
            )
          case 'pasos':
            return (
              <section key={i}>
                {block.titulo && <h3>{block.titulo}</h3>}
                <ol className="journey-method">
                  {block.pasos.map((step, index) => (
                    <li key={index}>
                      <span>{index + 1}</span>
                      <div>
                        <h3>{step.titulo}</h3>
                        <p>{step.texto}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )
          case 'reflexion':
            return <blockquote key={i}>{block.texto}</blockquote>
          case 'fuente':
            return (
              <p key={i} className="journey-source">
                {block.url && /^https?:\/\//.test(block.url) ? (
                  <a href={block.url} target="_blank" rel="noreferrer">
                    {block.texto} <ExternalLink size={12} />
                  </a>
                ) : (
                  block.texto
                )}
              </p>
            )
        }
      })}
    </div>
  )
}
export function ResourceText({ text }: { text: string }) {
  return (
    <div className="journey-reading">
      {text.split('\n\n').map((part, i) => {
        if (part.startsWith('## ')) return <h3 key={i}>{part.slice(3)}</h3>
        if (part.startsWith('|')) {
          const rows = part.split('\n').filter((row) => !row.includes('|---'))
          return (
            <div key={i} className="journey-resource-table">
              <table>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      {row
                        .split('|')
                        .slice(1, -1)
                        .map((cell, col) =>
                          index === 0 ? <th key={col}>{cell.trim()}</th> : <td key={col}>{cell.trim()}</td>,
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {part
              .split(/\*\*(.*?)\*\*/g)
              .map((fragment, index) => (index % 2 ? <strong key={index}>{fragment}</strong> : fragment))}
          </p>
        )
      })}
    </div>
  )
}
export function ResourceCards({ ids }: { ids: string[] }) {
  const state = useJourney()
  return (
    <div className="space-y-3">
      {ids.map((id) => {
        const resource = catalog.recursos.find((resource) => resource.id === id)
        if (!resource) return null
        return (
          <details className="journey-resource" key={id}>
            <summary>
              <BookOpen size={17} />
              {resource.titulo.startsWith('[') ? 'Video: testimonios que rompen mitos' : resource.titulo}
            </summary>
            <div className="space-y-4 p-4">
              {resource.contenido && <ResourceText text={resource.contenido} />}
              {resource.fuente && <p className="journey-source">{resource.fuente}</p>}
              {resource.url && /^https?:\/\//.test(resource.url) && (
                <a className="journey-link" href={resource.url} target="_blank" rel="noreferrer">
                  Abrir recurso <ExternalLink size={14} />
                </a>
              )}
              {!resource.url && !resource.contenido && (
                <p>Este material estará disponible cuando lo prepare orientación.</p>
              )}
              {resource.guardableEnRecursos && (resource.url || resource.contenido) && (
                <Button
                  variant="outline"
                  disabled={state.resources.includes(id)}
                  onClick={() =>
                    updateJourney((current) => ({
                      ...current,
                      resources: [...new Set([...current.resources, id])],
                    }))
                  }
                >
                  {state.resources.includes(id) ? (
                    <>
                      <Check /> En tu mochila
                    </>
                  ) : (
                    'Guardar en Recursos'
                  )}
                </Button>
              )}
            </div>
          </details>
        )
      })}
    </div>
  )
}
export function JourneyResources() {
  const state = useJourney()
  if (!state.resources.length) return null
  return (
    <section className="journey-saved">
      <p className="journey-eyebrow">
        <Sparkles size={16} /> HALLAZGOS DE TU TRAVESÍA
      </p>
      <h2 className="mb-4 text-xl font-bold">Lo que llevas en la mochila</h2>
      <ResourceCards ids={state.resources} />
    </section>
  )
}
