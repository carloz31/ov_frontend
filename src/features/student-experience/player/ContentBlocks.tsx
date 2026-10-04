import { ExternalLink } from 'lucide-react'
import type { BloqueContenido } from '@/features/missions/model'

export function ContentBlocks({ blocks }: { blocks: BloqueContenido[] }) {
  return (
    <div className="sx-content-reading">
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
              <aside key={i} className={`sx-content-highlight ${block.variante}`}>
                {block.texto}
              </aside>
            )
          case 'comparacion':
            return (
              <div key={i} className="sx-content-comparison">
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
                <ol className="sx-content-method">
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
              <p key={i} className="sx-content-source">
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
    <div className="sx-content-reading">
      {text.split('\n\n').map((part, i) => {
        if (part.startsWith('## ')) return <h3 key={i}>{part.slice(3)}</h3>
        if (part.startsWith('|')) {
          const rows = part.split('\n').filter((row) => !row.includes('|---'))
          return (
            <div key={i} className="sx-content-resource-table">
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
