import { Link, useParams } from 'react-router'
import { Sparkles } from 'lucide-react'
import { useOccupationExplorationContext } from '@/features/occupation-exploration/OccupationExplorationContext'
import { useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '../discovery/Parchment'
import { FavoriteButton } from '../discovery/FavoriteButton'
import { Seal } from '../discovery/Seal'
import { TrailBar } from '../discovery/TrailBar'
import { useDiscovery } from '../discovery/discoveryStore'
import { discoveryPaths } from '../paths'
import { appPaths } from '@/routes/paths'
import { getOccupation, careersOfOccupation, getFamily, isAffine } from './catalogSelectors'
import { dimensionNames, type RiasecDimension } from './catalogDetails'
import { AtlasNavigation, MissingAtlasPage } from './AtlasNavigation'
import { getClassroomInterviews } from '../research/research'
import { demoOccupationByVideo } from '../research/researchData'
import { CatalogRevisitNotice, UnexpectedPlace } from './UnexpectedPlace'
import { useCatalogVisit } from './useCatalogVisit'
export function OccupationDetailView() {
  const { occupationId = '' } = useParams(),
    context = useOccupationExplorationContext(),
    discovery = useDiscovery(),
    adventure = useAdventure()
  const occupation = getOccupation(occupationId)
  useCatalogVisit('occupation', occupation?.id)
  if (!occupation)
    return (
      <DiscoveryStage ambient="atlas">
        <MissingAtlasPage />
      </DiscoveryStage>
    )
  const profile = context.profiles.find((p) => p.occupationId === occupation.id),
    affinity = isAffine(occupation.id, discovery.revealedPages)
  const careers = careersOfOccupation(occupation.id)
  const videos = getClassroomInterviews(adventure).filter(
    (v) =>
      (discovery.publishedResearch.find((r) => r.videoId === v.id)?.occupationId ??
        demoOccupationByVideo[v.id]) === occupation.id,
  )
  return (
    <DiscoveryStage ambient="atlas">
      <AtlasNavigation section="professions" />
      <CatalogRevisitNotice />
      <Parchment className="sx-d-dark">
        <div className="sx-d-header">
          <div>
            <p className="sx-d-eyebrow">
              Ocupación · {occupation.onetCode ? `O*NET ${occupation.onetCode}` : 'O*NET por incorporar'}
            </p>
            <h1 className="sx-d-detail-title" tabIndex={-1}>
              {occupation.name}
            </h1>
            <p>{occupation.highPoints.map((d) => dimensionNames[d]).join(' · ')}</p>
            {profile && profile.discoveryState !== 'unused' && (
              <span className="sx-d-tag">Ícono obtenido en la Central de Casos</span>
            )}
          </div>
          <FavoriteButton
            selected={!!profile?.interested}
            onToggle={() => context.toggleOccupationInterest(occupation.id)}
          />
        </div>
      </Parchment>
      <div className="sx-d-detail-grid">
        <main className="sx-d-stack">
          <Parchment title="Qué hacen">
            <p>{occupation.whatTheyDo}</p>
          </Parchment>
          <Parchment title="Conocimientos que usan">
            {occupation.contentStatus !== 'pending' && <p>Ordenados por importancia.</p>}
            <div className="sx-d-tags">
              {occupation.knowledge.map((s) => (
                <span className="sx-d-tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <small>
              {occupation.contentStatus === 'pending'
                ? 'Ficha en preparación desde O*NET.'
                : 'Selección de conocimientos de demostración.'}
            </small>
          </Parchment>
          <Parchment title="Habilidades que necesitan">
            <div className="sx-d-tags">
              {occupation.skills.map((s) => (
                <span className="sx-d-tag" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </Parchment>
          <Parchment title="A qué tipo de persona le suele atraer">
            {occupation.contentStatus === 'pending' ? (
              <p>[Perfil de intereses: por completar desde O*NET]</p>
            ) : (
              <>
                <p className="sx-d-demo">Perfil RIASEC de demostración · No es una ficha O*NET validada.</p>
                <div className="sx-d-seal-row">
                  {occupation.highPoints.map((d) => (
                    <Seal key={d} state="revealed">
                      {d}
                    </Seal>
                  ))}
                </div>
                <p>
                  Su código de interés es {occupation.highPoints.map((d) => dimensionNames[d]).join(' · ')}:
                  los tres intereses que más pesan en esta ocupación.
                </p>
                {(Object.keys(dimensionNames) as RiasecDimension[]).map((d) => (
                  <TrailBar
                    key={d}
                    label={dimensionNames[d]}
                    value={occupation.interestScores[d]}
                    muted={!occupation.highPoints.includes(d)}
                  />
                ))}
              </>
            )}
          </Parchment>
        </main>
        <aside className="sx-d-stack">
          {affinity && (
            <Parchment title="Afinidad contigo" className="sx-d-affinity">
              <Sparkles aria-hidden="true" />
              <h3>{affinity}</h3>
              <p>Según lo que Helena descifró de tus intereses</p>
              <small>Afinidad de demostración. No se calculó a partir de tus respuestas.</small>
            </Parchment>
          )}
          {careers.length > 0 && (
            <Parchment title="Carreras que conducen a ella">
              <p>Las carreras del Perú que forman para esta ocupación.</p>
              <small>Relaciones educativas de demostración.</small>
              {careers.map((c) => (
                <Link key={c.id} className="sx-d-related" to={discoveryPaths.career(c.id)}>
                  <strong>{c.name}</strong>
                  <small>
                    {getFamily(c.familyId)?.name} · {c.durationYears} años
                  </small>
                </Link>
              ))}
            </Parchment>
          )}
          <Parchment title="Entrevistas de tu salón">
            {videos.length ? (
              videos.map((v) => (
                <Link
                  key={v.id}
                  className="sx-d-related"
                  to={`${appPaths.student.research}?entrevista=${encodeURIComponent(v.id)}`}
                >
                  <strong>{v.title}</strong>
                  <small>
                    Por {v.alias}
                    {!discovery.publishedResearch.some((r) => r.videoId === v.id) &&
                      ' · Relación de demostración'}
                  </small>
                </Link>
              ))
            ) : (
              <>
                <p>Nadie de tu salón la ha investigado todavía.</p>
                <Link
                  className="sx-d-action"
                  to={`${discoveryPaths.researchGuide}?occupationId=${encodeURIComponent(occupation.id)}`}
                >
                  Investigarla
                </Link>
              </>
            )}
          </Parchment>
        </aside>
      </div>
      <UnexpectedPlace kind="occupation" currentId={occupation.id} />
    </DiscoveryStage>
  )
}
