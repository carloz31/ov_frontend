import { Parchment } from '@/components/student/Parchment'
import type { DimensionPagina } from '../types'

export function HighlightedDimensions({ dimensiones }: { dimensiones: DimensionPagina[] }) {
  return (
    <Parchment className="sx-d-result-panel" aria-labelledby="inteligencias-destacadas">
      <h2 id="inteligencias-destacadas">
        {dimensiones.length > 1 ? 'Tus inteligencias más desarrolladas' : 'Tu inteligencia más desarrollada'}
      </h2>
      <div className="sx-d-result-grid">
        {dimensiones.map((d) => (
          <article className="sx-d-result-card sx-d-result-highlight" key={d.code}>
            <span className="sx-d-result-circle">{d.score}%</span>
            <h3>{d.name}</h3>
            <p>{d.description}</p>
            {d.ejemplos && <p>Suele notarse cuando {d.ejemplos}</p>}
          </article>
        ))}
      </div>
      {dimensiones.length > 1 && (
        <p className="sx-d-result-note">
          {dimensiones.length === 2 ? 'Dos inteligencias quedaron' : 'Varias inteligencias quedaron'} en el
          mismo nivel. No hace falta elegir entre ellas: juntas describen cómo te gusta aprender y resolver.
        </p>
      )}
    </Parchment>
  )
}
