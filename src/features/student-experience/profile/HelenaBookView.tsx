import { DiscoverySheetContent as SheetContent } from '../discovery/DiscoverySheetContent'
import { useReturnFocus } from '../discovery/useReturnFocus'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { LockKeyhole, Eye, BookOpen, Brain, Users } from 'lucide-react'
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet'
import { useJourney } from '@/features/missions/store'
import { appPaths } from '@/routes/paths'
import {
  useDiscovery,
  updateDiscovery,
  revelarPaginaApi,
  paginasReveladasApi,
} from '../discovery/discoveryStore'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '../discovery/Parchment'
import { Seal } from '../discovery/Seal'
import { TrailBar } from '../discovery/TrailBar'
import type { InstrumentPageId } from '../discovery/discoveryStore'
import { getHelenaPages, getHelenaPagesApi } from './helenaPages'
import { modoApi } from '@/features/servidor/config'
import {
  cargarResultadoRiasec,
  consultarAvanceInstrumentos,
  consultarProgreso,
  mensajeErrorServidor,
  useEstadoServidor,
} from '@/features/servidor/estadoServidor'
import { ciudadDisponible, textoRequisito, paginaInteresesServidor } from '@/features/servidor/adaptadores'
import { discoveryPaths } from '../paths'
import { occupationDetails } from '../catalog/catalogDetails'

export function HelenaBookView() {
  const focus = useReturnFocus()
  const journey = useJourney(),
    discovery = useDiscovery(),
    servidor = useEstadoServidor()
  const pages = modoApi
    ? getHelenaPagesApi(
        paginaInteresesServidor(servidor.estado, servidor.resultadoRiasec, discovery),
        paginasReveladasApi(
          discovery,
          servidor.estado?.cuenta.codigo,
          servidor.resultadoRiasec?.calculado_en,
        ),
      )
    : getHelenaPages(journey, discovery)
  const [requisito, setRequisito] = useState('Consultando el avance de tus encuentros…')
  const [errorConsulta, setErrorConsulta] = useState('')
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    if (!modoApi) return
    let vigente = true
    void (async () => {
      const resultado = await cargarResultadoRiasec()
      if (!vigente) return
      if (resultado.tipo !== 'ok') {
        setErrorConsulta(mensajeErrorServidor(resultado))
        return
      }
      if (resultado.datos) {
        setErrorConsulta('')
        return
      }
      if (!ciudadDisponible(servidor.estado)) {
        const progreso = await consultarProgreso('BLOQUE', 'CIUDAD')
        if (!vigente) return
        if (progreso.tipo === 'ok') {
          setRequisito(textoRequisito(progreso.datos, servidor.estado))
          setErrorConsulta('')
        } else setErrorConsulta(mensajeErrorServidor(progreso))
      } else {
        const avance = await consultarAvanceInstrumentos()
        if (!vigente) return
        if (avance.tipo !== 'ok') {
          setErrorConsulta(mensajeErrorServidor(avance))
          return
        }
        const aplicacion = avance.datos
          .find((i) => i.instrumento === 'TEST-RIASEC')
          ?.aplicaciones.find((a) => a.aplicacion === 'APL-RIASEC')
        const primera = aplicacion?.actividades.faltantes[0]
        setRequisito(
          primera
            ? `Conversa con Mara: interacción ${Number(primera.slice(-2))} de 14.`
            : 'Elena está preparando tu resultado.',
        )
        setErrorConsulta('')
      }
    })()
    return () => {
      vigente = false
    }
  }, [servidor.estado, intento])
  const [meaning, setMeaning] = useState(false)
  const [opening, setOpening] = useState<InstrumentPageId>()
  useEffect(() => {
    if (!opening) return
    const timer = setTimeout(() => setOpening(undefined), 400)
    return () => clearTimeout(timer)
  }, [opening])
  return (
    <DiscoveryStage ambient="profile">
      <header className="sx-d-header">
        <div>
          <h1>El libro de Helena</h1>
          <p>Lo que Helena va descubriendo de ti</p>
        </div>
        <div>
          <strong>{pages.filter((p) => p.state === 'revealed').length} de 3 páginas descifradas</strong>
          <div className="sx-d-seal-row">
            {pages.map((p) => (
              <Seal key={p.id} state={p.state}>
                {p.numeral}
              </Seal>
            ))}
          </div>
        </div>
      </header>
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
                {modoApi ? 'Disponible en una próxima iteración · ' : 'Demostración · '}
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
                {modoApi && p.id === 'intereses' && (
                  <>
                    {errorConsulta || servidor.errorResultado ? (
                      <>
                        <p role="alert">{errorConsulta || mensajeErrorServidor(servidor.errorResultado)}</p>
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
                  disabled={modoApi && !servidor.resultadoRiasec}
                  onClick={() => {
                    if (modoApi) {
                      if (!servidor.resultadoRiasec || !servidor.estado) return
                      revelarPaginaApi(
                        servidor.estado.cuenta.codigo,
                        servidor.resultadoRiasec.calculado_en,
                        p.id,
                      )
                      setOpening(p.id)
                      return
                    }
                    setOpening(p.id)
                    updateDiscovery((s) =>
                      s.revealedPages.includes(p.id)
                        ? s
                        : { ...s, revealedPages: [...s.revealedPages, p.id] },
                    )
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
                          {modoApi && <span>{a.score}%</span>}
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
                      <Link
                        className="sx-d-action sx-d-action-ghost"
                        to={
                          modoApi
                            ? '/student/exploration?actividad=act-tip-final&revision=1'
                            : '/student/exploration?actividad=act-tip-01&modo=directa'
                        }
                      >
                        Qué significa
                      </Link>
                    )}
                    {modoApi &&
                      !p.perfilPlano &&
                      !!servidor.resultadoRiasec?.carreras_recomendadas?.length && (
                        <section>
                          <h3>Carreras que conducen a ellas</h3>
                          <ul>
                            {servidor.resultadoRiasec.carreras_recomendadas.map((c) => (
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
      <p className="sx-d-privacy">
        <Eye aria-hidden="true" />
        Tu libro lo ven tú y tu orientadora. Tu apoderado solo ve las páginas que ella habilite.
      </p>
      <Sheet open={meaning} onOpenChange={setMeaning}>
        <SheetContent {...focus} className="sx-root sx-d-sheet">
          <SheetHeader>
            <SheetTitle>
              <BookOpen aria-hidden="true" />
              Qué significa este ejemplo
            </SheetTitle>
            <SheetDescription>
              Demostración: estos intereses no se calcularon a partir de tus respuestas.
            </SheetDescription>
          </SheetHeader>
          <p>
            <Users aria-hidden="true" />
            Los intereses describen actividades que podrían despertar curiosidad. No califican tu capacidad ni
            tu valor.
          </p>
          <p>
            El ejemplo reúne Social, Investigador y Artístico. La afinidad que verás en el atlas también es de
            demostración.
          </p>
        </SheetContent>
      </Sheet>
    </DiscoveryStage>
  )
}
