import { Parchment } from '@/components/student/Parchment'
import type { DimensionPagina } from '../types'

export function InterestCode({ dimensiones, empate }: { dimensiones: DimensionPagina[]; empate: boolean }) {
  return (
    <Parchment className="sx-d-result-panel" aria-labelledby="codigo-interes">
      <h2 id="codigo-interes">Tu código de interés</h2>
      <div className="sx-d-result-code">
        {dimensiones.map((d, i) => (
          <div key={d.code}>
            <span className="sx-d-result-circle">{d.code}</span>
            <h3>{d.name}</h3>
            <p>{['Más fuerte', 'Segundo', 'Tercero'][i]}</p>
          </div>
        ))}
      </div>
      <ul>
        {dimensiones.map((d) => (
          <li key={d.code}>{d.description}</li>
        ))}
      </ul>
      {empate && (
        <p className="sx-d-result-note">
          Algunos de tus intereses quedaron empatados; el orden entre ellos no indica preferencia.
        </p>
      )}
    </Parchment>
  )
}
