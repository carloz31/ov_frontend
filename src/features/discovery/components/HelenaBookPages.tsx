import { useHelenaPages } from '@/features/discovery/hooks/useHelenaPages'
import { Link } from 'react-router'
import { LockKeyhole, Brain } from 'lucide-react'
import { appPaths } from '@/routes/paths'
import { Parchment } from '@/components/student/Parchment'
import { Seal } from '@/components/student/Seal'
import { TrailBar } from '@/components/student/TrailBar'
import { discoveryPaths } from '@/routes/discoveryPaths'
import { occupationDetails } from '@/features/discovery/lib/catalogDetails'
export function HelenaBookPages({ model }: { model: ReturnType<typeof useHelenaPages> }) {
  const {
    requisito,
    errorConsulta,
    setErrorConsulta,
    setIntento,
    setMeaning,
    opening,
    revelarPagina,
    errorResultado,
    pages,
  } = model
  return (
    <div className="sx-d-columns">
      {pages.map((p) => (
        <Parchment
          key={p.id}
          className={
            p.state === 'ready'
              ? 'sx-d-highlight'
              : p.state === 'sealed'
                ? 'sx-d-page-sealed'
                : 'sx-d-revealed'
          }
          label={`Página ${p.numeral} · ${p.state === 'sealed' ? 'sellada' : p.state === 'ready' ? 'lista para revelar' : 'descifrada'}`}
          title={p.title}
        >
          <span className="sx-d-tag">{p.required ? 'Para tu proyecto' : 'Opcional'}</span>
          <p>{p.subtitle}</p>
          {p.demo && (
            <p className="sx-d-demo">
              {p.etiquetaDemo}
              {p.id === 'intereses'
                ? 'Este ejemplo no es tu resultado personal.'
                : 'Este instrumento aún no está disponible.'}
            </p>
          )}
          {p.state === 'sealed' ? (
            <>
              <div className="sx-d-fog" aria-hidden="true">
                <div className="sx-d-fog-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <span key={n} />
                  ))}
                </div>
                <LockKeyhole />
              </div>
              <p>
                <em>{p.teaser}</em>
              </p>
              {p.mostrarRequisito && (
                <>
                  {errorConsulta || errorResultado ? (
                    <>
                      <p role="alert">{errorConsulta || errorResultado?.mensaje}</p>
                      <button
                        className="sx-d-action"
                        onClick={() => {
                          setErrorConsulta('')
                          setIntento((i) => i + 1)
                        }}
                      >
                        Reintentar consulta
                      </button>
                    </>
                  ) : (
                    <p>{requisito}</p>
                  )}
                </>
              )}
              <TrailBar
                label={`Misiones de Helena · ${p.missions.done} de ${p.missions.total}`}
                value={(p.missions.done / p.missions.total) * 100}
              />
              <Link className="sx-d-action" to={p.activityHref ?? appPaths.student.exploration}>
                Ir a la siguiente misión
              </Link>
            </>
          ) : p.state === 'ready' ? (
            <>
              <div className="sx-d-center">
                <Seal state="ready" large />
              </div>
              <p>
                {p.demo
                  ? 'Esta página de ejemplo está lista. Rompe el sello para conocer cómo se verá una revelación.'
                  : 'Completaste todas sus misiones. Helena terminó de leer esta página, pero quiere mostrártela ella misma.'}
              </p>
              {p.id === 'intereses' && p.demo && (
                <TrailBar
                  label="Interacciones reales completadas"
                  value={(p.missions.done / 14) * 100}
                  text={`${p.missions.done} de 14`}
                />
              )}
              <button
                type="button"
                className="sx-d-action sx-d-action-gold sx-d-full"
                disabled={p.revelacionBloqueada}
                onClick={() => {
                  revelarPagina(p.id)
                }}
              >
                Romper el sello
              </button>
            </>
          ) : (
            <div className="sx-d-revealed">
              {opening === p.id && (
                <div className="sx-d-breaking-seal" aria-hidden="true">
                  <Seal state="ready" large />
                </div>
              )}
              <p className="sx-d-eyebrow">Descifrada</p>
              {p.id === 'intereses' ? (
                <>
                  <div className="sx-d-result-seals">
                    {p.result?.areas.map((a) => (
                      <div key={a.code}>
                        <Seal state="revealed">{a.code}</Seal>
                        <strong>{a.name}</strong>
                        {p.mostrarPuntajes && <span>{a.score}%</span>}
                      </div>
                    ))}
                  </div>
                  <p>{p.result?.areas[0]?.description}</p>
                  {p.perfilPlano ? (
                    <>
                      <p>Tus respuestas todavía no distinguen un interés.</p>
                      <Link className="sx-d-action" to="/student/exploration?punto=mara-test">
                        Revisar mis encuentros con Mara
                      </Link>
                    </>
                  ) : (
                    <Link className="sx-d-action" to={`${appPaths.student.catalog.professions}?afines=1`}>
                      Ocupaciones afines
                    </Link>
                  )}
                  {p.demo ? (
                    <button
                      type="button"
                      className="sx-d-action sx-d-action-ghost"
                      onClick={() => setMeaning(true)}
                    >
                      Qué significa
                    </button>
                  ) : (
                    <Link className="sx-d-action sx-d-action-ghost" to={p.significadoHref}>
                      Qué significa
                    </Link>
                  )}
                  {!!p.carrerasRecomendadas?.length && (
                    <section>
                      <h3>Carreras que conducen a ellas</h3>
                      <ul>
                        {p.carrerasRecomendadas.map((c) => (
                          <li key={c.codigo}>
                            <Link className="sx-d-action" to={discoveryPaths.career(c.codigo)}>
                              {c.nombre}
                            </Link>
                            <p>
                              Por estas ocupaciones:{' '}
                              {c.via.map((o, indice) => (
                                <span key={o.codigo ?? o.titulo}>
                                  {indice > 0 && ', '}
                                  {o.codigo &&
                                  occupationDetails.some((detalle) => detalle.id === o.codigo) ? (
                                    <Link to={discoveryPaths.occupation(o.codigo)}>{o.titulo}</Link>
                                  ) : (
                                    o.titulo
                                  )}
                                </span>
                              ))}
                              .
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              ) : (
                <>
                  {p.result?.areas.map((a) => (
                    <div key={a.code} className="sx-d-row">
                      {p.id === 'inteligencias' ? (
                        <>
                          <Brain aria-hidden="true" />
                          <div>
                            <strong>{a.name}</strong>
                            <p>{a.description}</p>
                          </div>
                        </>
                      ) : (
                        <TrailBar label={a.name} value={a.score} />
                      )}
                    </div>
                  ))}
                  <p>
                    Destacan por igual. Ninguna es mejor que otra: describen cómo te gusta aprender y
                    resolver.
                  </p>
                </>
              )}
            </div>
          )}
        </Parchment>
      ))}
    </div>
  )
}
