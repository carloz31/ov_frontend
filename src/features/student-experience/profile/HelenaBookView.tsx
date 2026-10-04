import { DiscoverySheetContent as SheetContent } from '../discovery/DiscoverySheetContent'
import { useReturnFocus } from '../discovery/useReturnFocus'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { LockKeyhole, Eye, BookOpen, Brain, Users } from 'lucide-react'
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet'
import { useJourney } from '@/features/missions/store'
import { appPaths } from '@/routes/paths'
import { useDiscovery, updateDiscovery } from '../discovery/discoveryStore'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '../discovery/Parchment'
import { Seal } from '../discovery/Seal'
import { TrailBar } from '../discovery/TrailBar'
import type { InstrumentPageId } from '../discovery/discoveryStore'
import { getHelenaPages } from './helenaPages'

export function HelenaBookView() {
  const focus = useReturnFocus()
  const pages = getHelenaPages(useJourney(), useDiscovery())
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
                Demostración ·{' '}
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
                  onClick={() => {
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
                        </div>
                      ))}
                    </div>
                    <p>{p.result?.areas[0]?.description}</p>
                    <Link className="sx-d-action" to={`${appPaths.student.catalog.professions}?afines=1`}>
                      Ocupaciones afines
                    </Link>
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
                        to="/student/exploration?actividad=act-tip-01&modo=directa"
                      >
                        Qué significa
                      </Link>
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
