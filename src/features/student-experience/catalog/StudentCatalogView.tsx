import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Search, GraduationCap, BriefcaseBusiness, School } from 'lucide-react'
import { useOccupationExplorationContext } from '@/features/occupation-exploration/OccupationExplorationContext'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { FavoriteButton } from '../discovery/FavoriteButton'
import { Seal } from '../discovery/Seal'
import { useDiscovery } from '../discovery/discoveryStore'
import { discoveryPaths } from '../paths'
import {
  careerDetails,
  occupationDetails,
  institutionDetails,
  dimensionNames,
  institutionTypeNames,
} from './catalogDetails'
import { getFamily, isAffine, matchesName } from './catalogSelectors'
const sectionCopy = {
  professions: {
    title: 'Catálogo de profesiones',
    description: 'Conoce qué hacen distintos profesionales, dónde trabajan y qué habilidades utilizan.',
    placeholder: 'Buscar una profesión por nombre',
  },
  careers: {
    title: 'Catálogo de carreras',
    description: 'Explora rutas de formación y descubre los campos en los que podrías desarrollarte.',
    placeholder: 'Buscar una carrera por nombre',
  },
  institutions: {
    title: 'Instituciones educativas',
    description: 'Compara tipos de instituciones y conoce las áreas de estudio que pueden ofrecer.',
    placeholder: 'Buscar una institución por nombre',
  },
}
export function StudentCatalogView({ section }: { section: 'professions' | 'careers' | 'institutions' }) {
  const context = useOccupationExplorationContext(),
    discovery = useDiscovery(),
    [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const copy = sectionCopy[section]
  const obtained = (id: string) =>
    context.profiles.some((p) => p.occupationId === id && p.discoveryState !== 'unused')
  const obtainedCount = occupationDetails.filter((o) => obtained(o.id)).length
  const occupations = occupationDetails
    .filter((o) => matchesName(o.name, query))
    .sort((a, b) =>
      params.get('afines') === '1'
        ? Number(!!isAffine(b.id, discovery.revealedPages)) -
          Number(!!isAffine(a.id, discovery.revealedPages))
        : 0,
    )
  const careers = careerDetails.filter((c) => matchesName(c.name, query)),
    institutions = institutionDetails.filter((i) => matchesName(i.name, query))
  const empty =
    section === 'professions'
      ? !occupations.length
      : section === 'careers'
        ? !careers.length
        : !institutions.length
  return (
    <DiscoveryStage ambient="atlas">
      <header className="sx-d-header">
        <div>
          <p className="sx-d-eyebrow">Atlas del mundo exterior</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        {section === 'professions' && (
          <div className="sx-d-exploration-summary">
            <span className="sx-d-eyebrow">Tu exploración</span>
            <strong>
              {obtainedCount} {obtainedCount === 1 ? 'ocupación descubierta' : 'ocupaciones descubiertas'}
            </strong>
          </div>
        )}
      </header>
      <label className="sx-d-search-row sx-d-actions">
        <Search aria-hidden="true" />
        <span className="sr-only">{copy.placeholder}</span>
        <input
          className="sx-d-input"
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="sx-d-columns">
        {section === 'careers' &&
          careers.map((c) => (
            <article className="sx-d-parchment sx-d-atlas-card" key={c.id}>
              <FavoriteButton
                compact
                selected={context.careerInterestIds.includes(c.id)}
                onToggle={() => context.toggleCareerInterest(c.id)}
              />
              <Link to={discoveryPaths.career(c.id)} className="sx-d-card-link">
                <GraduationCap aria-hidden="true" />
                <h2>{c.name}</h2>
                <p className="sx-d-eyebrow">{getFamily(c.familyId)?.name}</p>
                <span className="sx-d-tag">{c.durationYears} años</span>
                <p className="sx-d-clamp-two">{c.description}</p>
              </Link>
            </article>
          ))}
        {section === 'professions' &&
          occupations.map((o) => (
            <article className="sx-d-parchment sx-d-atlas-card" key={o.id}>
              <FavoriteButton
                compact
                selected={context.profiles.some((p) => p.occupationId === o.id && p.interested)}
                onToggle={() => context.toggleOccupationInterest(o.id)}
              />
              <Link to={discoveryPaths.occupation(o.id)} className="sx-d-card-link">
                <BriefcaseBusiness aria-hidden="true" />
                <h2>{o.name}</h2>
                <div className="sx-d-seal-row">
                  {o.highPoints.map((d) => (
                    <span key={d} title={dimensionNames[d]}>
                      <Seal state="revealed">{d}</Seal>
                    </span>
                  ))}
                </div>
                <p className="sx-d-clamp-two">{o.whatTheyDo}</p>
                {obtained(o.id) && <span className="sx-d-tag">Ícono obtenido</span>}
                {params.get('afines') === '1' && isAffine(o.id, discovery.revealedPages) && (
                  <p>Afín a tu perfil · Demostración</p>
                )}
                <small>Perfil de intereses de demostración</small>
              </Link>
            </article>
          ))}
        {section === 'institutions' &&
          institutions.map((i) => (
            <article className="sx-d-parchment sx-d-atlas-card" key={i.id}>
              <FavoriteButton
                compact
                selected={context.institutionInterestIds.includes(i.id)}
                onToggle={() => context.toggleInstitutionInterest(i.id)}
              />
              <Link to={discoveryPaths.institution(i.id)} className="sx-d-card-link">
                <School aria-hidden="true" />
                <h2>{i.name}</h2>
                <p>
                  {institutionTypeNames[i.type]} · {i.management === 'PUBLICA' ? 'Pública' : 'Privada'}
                </p>
                <p>
                  {i.location.department} · {i.careerIds.length} carreras
                </p>
                <small>Institución ficticia · Demostración</small>
              </Link>
            </article>
          ))}
        {empty && (
          <section className="sx-d-parchment">
            <h2>No encontramos resultados</h2>
            <p>No hay resultados que coincidan con tu búsqueda. Prueba con otro nombre.</p>
          </section>
        )}
      </div>
    </DiscoveryStage>
  )
}
