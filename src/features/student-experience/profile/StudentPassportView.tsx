import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, Award, Check, Eye, LockKeyhole, Target } from 'lucide-react'
import { useJourney } from '@/features/missions/store'
import { getTravelerLevel, useAdventure } from '@/features/occupation-exploration/lib/AdventureStore'
import { appPaths } from '@/routes/paths'
import { DiscoveryStage } from '../discovery/DiscoveryStage'
import { Parchment } from '../discovery/Parchment'
import { useDiscovery } from '../discovery/discoveryStore'
import { PassportBadgeDialog } from './PassportBadgeDialog'
import { achievementIcons, getProfileBadges, getStudentAchievementGroups, travelerTitles } from './passport'
import './passport.css'

export function StudentPassportView() {
  const adventure = useAdventure(),
    discovery = useDiscovery(),
    journey = useJourney(),
    groups = getStudentAchievementGroups(adventure, journey),
    level = getTravelerLevel(adventure)
  const [selectedCode, setSelectedCode] = useState<string>()
  const all = groups.flatMap((g) => g.items),
    earned = all.filter((b) => b.done),
    visible = getProfileBadges(adventure, discovery, journey)
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
        <header className="sx-d-header">
          <div>
            <h1>Pasaporte vocacional</h1>
            <p>
              Cada sello cuenta una parte de tu viaje. Pulsa una insignia para descubrir la historia que
              guarda.
            </p>
          </div>
          <span className="sx-p-total">
            <Award aria-hidden="true" />
            {earned.length} de {all.length} insignias
          </span>
        </header>
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
            {travelerTitles.map((title, i) => (
              <li
                key={title}
                data-state={i + 1 < level.number ? 'earned' : i + 1 === level.number ? 'current' : 'pending'}
              >
                <span aria-hidden="true">{i + 1 < level.number ? <Check size={24} /> : i + 1}</span>
                <strong>{title}</strong>
                <small>
                  {i + 1 < level.number
                    ? 'Alcanzado'
                    : i + 1 === level.number
                      ? 'Tu título actual'
                      : i === level.number
                        ? 'Siguiente'
                        : 'Más adelante'}
                </small>
              </li>
            ))}
          </ol>
        </Parchment>
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
