import { Link } from 'react-router'
import {
  Backpack,
  BookOpen,
  ChevronRight,
  Compass,
  FolderHeart,
  HeartHandshake,
  LibraryBig,
  LockKeyhole,
  PenLine,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react'
import {
  canAccessFamilyConversations,
  getTravelerLevel,
} from '@/features/occupation-exploration/lib/AdventureStore'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import { getReturnGreeting, type StudentMapPoint } from './mapPoints'
import { getListedActivities, studentActivitiesPath } from './navigation'
import { getTodayCheckIn, useCheckInDay } from '../overlays/checkIn'

export function AdventurePanel({
  adventure,
  points,
  recommended,
  progress,
  onSelect,
  onCheckIn,
}: {
  adventure: AdventureState
  points: StudentMapPoint[]
  recommended?: StudentMapPoint
  progress: { label: string; value: number }
  onSelect: (id: string) => void
  onCheckIn: () => void
}) {
  const level = getTravelerLevel(adventure)
  const visible = getListedActivities(points, false).slice(0, 4)
  const greeting = getReturnGreeting(adventure, recommended)
  useCheckInDay()
  const signal = getTodayCheckIn(adventure)
  const percentage = Math.min(100, Math.max(0, progress.value))
  const circumference = 2 * Math.PI * 40
  return (
    <div className="sx-panel-content">
      <div className="sx-panel-user">
        <span className="sx-panel-avatar" aria-hidden="true">
          AL
        </span>
        <div>
          <span>¡Qué bueno verte!</span>
          <strong>Alex</strong>
        </div>
      </div>
      <div className="sx-panel-level" aria-label={`Nivel ${level.number}: ${level.label}`}>
        <span className="sx-level-medallion" aria-hidden="true">
          <span>NIVEL</span>
          <strong>{String(level.number).padStart(2, '0')}</strong>
        </span>
        <span className="sx-level-rank">
          <strong>{level.label}</strong>
        </span>
      </div>
      <section className="sx-panel-progress">
        <span
          className="sx-progress-ring"
          role="progressbar"
          aria-label={progress.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <svg viewBox="0 0 96 96" aria-hidden="true">
            <circle cx={48} cy={48} r={40} fill="none" stroke="var(--border)" strokeWidth={7} />
            <circle
              cx={48}
              cy={48}
              r={40}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percentage / 100)}
            />
          </svg>
          <strong>{Math.round(percentage)}%</strong>
        </span>
        <h2>{progress.label}</h2>
      </section>
      <section className="sx-panel-section">
        {greeting && (
          <p className="sx-panel-return">
            <strong>Lumi</strong>
            {greeting}
          </p>
        )}
        {recommended ? (
          <button type="button" className="sx-next-step" onClick={() => onSelect(recommended.id)}>
            <span>
              <span className="sx-next-label">
                <Target size={16} aria-hidden="true" />
                Siguiente paso
              </span>
              <strong>{recommended.title}</strong>
            </span>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        ) : (
          <>
            <h2>Siguiente paso</h2>
            <p className="sx-panel-subtitle">No hay actividades por realizar en esta zona por ahora.</p>
          </>
        )}
      </section>
      <section className="sx-panel-section sx-signal-card">
        <div className="sx-signal-heading">
          <h2>
            <Compass size={18} aria-hidden="true" />
            Tu señal de hoy
          </h2>
          {signal && (
            <p className="sx-panel-signal" aria-label={`${signal.value} de 10`}>
              <strong>{signal.value}</strong>
              <span>/10</span>
            </p>
          )}
        </div>
        {!signal && <p className="sx-panel-subtitle">¿Qué tan seguro te sientes hoy de tu próximo paso?</p>}
        <div className="sx-signal-actions">
          <button type="button" className="sx-signal-edit" onClick={onCheckIn}>
            <PenLine size={14} aria-hidden="true" />
            {signal ? 'Cambiar' : 'Registrar mi señal'}
          </button>
          <Link className="sx-signal-history" to={appPaths.student.signals}>
            <TrendingUp size={14} aria-hidden="true" />
            Ver evolución
          </Link>
        </div>
      </section>
      <section className="sx-panel-section">
        <h2>Accesos rápidos</h2>
        <nav className="sx-quick-links" aria-label="Accesos rápidos">
          <Link to={appPaths.student.profile}>
            <FolderHeart size={18} />
            <span>Mi perfil</span>
          </Link>
          <Link to={appPaths.student.journal}>
            <BookOpen size={18} />
            <span>Mi diario</span>
          </Link>
          <Link to={appPaths.student.conversations}>
            <HeartHandshake size={18} />
            <span>
              En familia
              {!canAccessFamilyConversations(adventure) && <small>Se abre al llegar a la ciudad</small>}
            </span>
            {!canAccessFamilyConversations(adventure) && <LockKeyhole size={14} />}
          </Link>
          <Link to={appPaths.student.resources}>
            <Backpack size={18} />
            <span>Recursos</span>
          </Link>
          <Link to="/student/investigations">
            <Search size={18} />
            <span>Investigaciones</span>
          </Link>
          <Link to={appPaths.student.catalog.professions}>
            <LibraryBig size={18} />
            <span>Información</span>
          </Link>
        </nav>
      </section>
      <section className="sx-panel-section">
        <h2>Actividades disponibles</h2>
        {visible.length ? (
          <>
            <div className="sx-available-list">
              {visible.map((point) => (
                <button type="button" key={point.id} onClick={() => onSelect(point.id)}>
                  <span>
                    <strong>{point.title}</strong>
                    <small>{point.subtitle}</small>
                  </span>
                  <span className="sx-available-dot" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="sx-panel-subtitle">No hay actividades por realizar en esta zona por ahora.</p>
        )}
        <Link className="sx-panel-link" to={studentActivitiesPath}>
          Ver más
        </Link>
      </section>
    </div>
  )
}
