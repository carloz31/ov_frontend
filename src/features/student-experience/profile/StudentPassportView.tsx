import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Award, Check, Eye, LockKeyhole, Target } from 'lucide-react'
import { useJourney } from '@/store/journeyStore'
import { getTravelerLevel, useAdventure } from '@/store/adventureStore'
import { appPaths } from '@/routes/paths'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '@/components/student/Parchment'
import { useDiscovery } from '@/store/discoveryStore'
import { PassportBadgeDialog } from './PassportBadgeDialog'
import { achievementIcons, getProfileBadges, getStudentAchievementGroups, travelerTitles } from './passport'
import './passport.css'
import { modoApi } from '@/config/env'
import { useEstadoServidor } from '@/store/servidor/estadoServidor'
import { insigniasServidor, insigniasOcultasPendientes } from '@/lib/servidor/adaptadores'
import { getAchievementPresentations } from '@/features/discovery/lib/achievements'

export function StudentPassportView() {
  const servidor = useEstadoServidor()
  const gruposApi = modoApi ? insigniasServidor(servidor.estado, getAchievementPresentations()) : undefined
  const api = gruposApi ? { grupos: gruposApi, cuenta: servidor.estado?.cuenta.codigo ?? '' } : undefined
  const adventure = useAdventure(),
    discovery = useDiscovery(),
    journey = useJourney(),
    groups = getStudentAchievementGroups(adventure, journey, gruposApi),
    level = modoApi
      ? getTravelerLevel(adventure, servidor.estado?.nivel_actual ?? null)
      : getTravelerLevel(adventure)
  const [selectedCode, setSelectedCode] = useState<string>()
  const all = groups.flatMap((g) => g.items),
    earned = all.filter((b) => b.done),
    visible = getProfileBadges(adventure, discovery, journey, api)
  const groupIndex = groups.findIndex((g) => g.items.some((b) => b.code === selectedCode)),
    group = groups[groupIndex],
    selected = group?.items.find((b) => b.code === selectedCode)
  return (
    <DiscoveryStage ambient="profile">
      <div className="sx-p-passport">
        <Link className="sx-d-back" to={appPaths.student.profile}>
          <ArrowLeft aria-hidden="true" />
          Mi perfil
        </Link>
        <header className="sx-d-header" id="nivel">
          <div>
            <h1>Pasaporte vocacional</h1>
            <p>
              Cada sello cuenta una parte de tu viaje. Pulsa una insignia para descubrir la historia que
              guarda.
            </p>
          </div>
          <span className="sx-p-total">
            <Award aria-hidden="true" />
            {earned.length} de {modoApi ? (servidor.estado?.insignias.length ?? 0) : all.length} insignias
          </span>
        </header>
        {level ? (
          <Parchment className="sx-d-dark sx-p-level">
            <div className="sx-p-level-summary">
              <span className="sx-level-medallion sx-p-level-seal">
                <span>NIVEL</span>
                <strong>{String(level.number).padStart(2, '0')}</strong>
              </span>
              <div>
                <p className="sx-d-eyebrow">Nivel {level.number} de 5 · tu título de viajero</p>
                <h2>{level.label}</h2>
                <p>{level.description}</p>
              </div>
              <div className="sx-p-next-title">
                <Target aria-hidden="true" />
                <strong>
                  {level.number === 5
                    ? 'Llegaste al último título del viaje'
                    : `Para ser ${travelerTitles[level.number]}`}
                </strong>
                <p>{level.nextStep}</p>
              </div>
            </div>
            <ol className="sx-p-title-trail" aria-label="Camino de los títulos">
              {(modoApi
                ? (servidor.estado?.niveles.map((n) => ({
                    numero: n.numero,
                    titulo: n.titulo,
                    obtenido: n.estado === 'OBTENIDO',
                  })) ?? [])
                : travelerTitles.map((titulo, i) => ({
                    numero: i + 1,
                    titulo,
                    obtenido: i + 1 < level.number,
                  }))
              ).map(({ numero, titulo, obtenido }) => (
                <li
                  key={numero}
                  data-state={numero === level.number ? 'current' : obtenido ? 'earned' : 'pending'}
                >
                  <span aria-hidden="true">
                    {obtenido && numero !== level.number ? <Check size={24} /> : numero}
                  </span>
                  <strong>{titulo}</strong>
                  <small>
                    {numero === level.number
                      ? 'Tu título actual'
                      : obtenido
                        ? 'Alcanzado'
                        : numero === level.number + 1
                          ? 'Siguiente'
                          : 'Más adelante'}
                  </small>
                </li>
              ))}
            </ol>
          </Parchment>
        ) : (
          <p>No hay un nivel disponible en el servidor.</p>
        )}
        {modoApi && insigniasOcultasPendientes(servidor.estado) > 0 && (
          <p>{`${insigniasOcultasPendientes(servidor.estado)} insignias quedan por descubrir.`}</p>
        )}
        <div className="sx-d-stack">
          {groups.map((g, index) => (
            <Parchment key={g.title} className="sx-p-group">
              <div className="sx-p-group-heading" data-group={index % 3}>
                <div>
                  <p className="sx-d-eyebrow">Grupo {['I', 'II', 'III'][index] ?? index + 1}</p>
                  <h2>{g.title}</h2>
                  <p>{g.description}</p>
                </div>
                <strong>
                  {g.items.filter((b) => b.done).length} de {g.items.length}
                </strong>
              </div>
              <div className="sx-p-badge-grid">
                {g.items.map((b) => {
                  const Icon = achievementIcons[b.icon],
                    hidden = 'hidden' in b && b.hidden && !b.done
                  return (
                    <button
                      key={b.code}
                      type="button"
                      className="sx-p-badge"
                      data-earned={b.done}
                      data-group={index % 3}
                      aria-label={`${hidden ? 'Insignia oculta' : b.title}, ${b.done ? 'obtenida' : 'por descubrir'}`}
                      onClick={() => setSelectedCode(b.code)}
                    >
                      <span className="sx-p-badge-seal" aria-hidden="true">
                        {hidden ? '?' : <Icon size={24} />}{' '}
                        {!b.done && <LockKeyhole className="sx-p-lock" size={20} />}{' '}
                        {visible.some((v) => v.code === b.code) && <Eye className="sx-p-eye" size={20} />}
                      </span>
                      <span className="sx-p-badge-code">{b.code}</span>
                      <strong>{hidden ? '?' : b.title}</strong>
                    </button>
                  )
                })}
              </div>
            </Parchment>
          ))}
        </div>
        <PassportBadgeDialog
          badge={selected}
          group={group?.title ?? ''}
          groupIndex={groupIndex}
          onClose={() => setSelectedCode(undefined)}
        />
      </div>
    </DiscoveryStage>
  )
}
