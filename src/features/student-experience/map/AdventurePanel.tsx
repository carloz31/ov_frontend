import { useState } from 'react'
import { Link } from 'react-router'
import {
  Backpack,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  FolderHeart,
  HeartHandshake,
  LibraryBig,
  LockKeyhole,
  MessageSquareQuote,
  Target,
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import {
  canAccessFamilyConversations,
  getTravelerLevel,
} from '@/features/occupation-exploration/lib/AdventureStore'
import { lumiDayKey } from '@/features/occupation-exploration/lib/LumiFriendship'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'
import { getReturnGreeting, type StudentMapPoint } from './mapPoints'

export function AdventurePanel({
  adventure,
  points,
  recommended,
  progress,
  onSelect,
}: {
  adventure: AdventureState
  points: StudentMapPoint[]
  recommended?: StudentMapPoint
  progress: { label: string; value: number }
  onSelect: (id: string) => void
}) {
  const [page, setPage] = useState(0)
  const level = getTravelerLevel(adventure)
  const available = points.filter((point) => point.status === 'available')
  const maxPage = Math.max(0, Math.ceil(available.length / 5) - 1)
  const currentPage = Math.min(page, maxPage)
  const visible = available.slice(currentPage * 5, currentPage * 5 + 5)
  const greeting = getReturnGreeting(adventure, recommended)
  const today = lumiDayKey(new Date())
  const signal = adventure.readinessCheckIns.find(
    (checkIn) =>
      checkIn.linkedActivityId === 'daily-check-in' &&
      Number.isFinite(Date.parse(checkIn.createdAt)) &&
      lumiDayKey(new Date(checkIn.createdAt)) === today,
  )
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
      <p className="sx-panel-level">
        Niv. {level.number} · {level.label}
      </p>
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
        <h2>
          <Target size={18} />
          Siguiente paso
        </h2>
        {greeting && (
          <p className="sx-panel-return">
            <strong>Lumi</strong>
            {greeting}
          </p>
        )}
        {recommended ? (
          <>
            <strong className="sx-panel-point-title">{recommended.title}</strong>
            <p className="sx-panel-subtitle">{recommended.subtitle}</p>
            <button type="button" className="sx-primary-button" onClick={() => onSelect(recommended.id)}>
              Ver misión
            </button>
          </>
        ) : (
          <p className="sx-panel-subtitle">No hay actividades por realizar en esta zona por ahora.</p>
        )}
      </section>
      <section className="sx-panel-section">
        <h2>
          <Compass size={18} />
          Tu señal de hoy
        </h2>
        {signal ? (
          <p className="sx-panel-signal">
            <strong>{signal.value}</strong> de 10
          </p>
        ) : (
          <p className="sx-panel-subtitle">¿Qué tan seguro te sientes hoy de tu próximo paso?</p>
        )}
        <Link className="sx-panel-link" to={appPaths.student.signals}>
          Ver evolución
        </Link>
      </section>
      <section className="sx-panel-section">
        <h2>Accesos rápidos</h2>
        <nav className="sx-quick-links" aria-label="Accesos rápidos">
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
            <span>Recursos y novedades</span>
          </Link>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button type="button">
                <LibraryBig size={18} />
                <span>Catálogo</span>
                <ChevronDown size={14} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to={appPaths.student.catalog.professions}>Profesiones</Link>
              <Link to={appPaths.student.catalog.careers}>Carreras</Link>
              <Link to={appPaths.student.catalog.institutions}>Instituciones educativas</Link>
            </CollapsibleContent>
          </Collapsible>
          <Link to={appPaths.student.testimonials}>
            <MessageSquareQuote size={18} />
            <span>Héroes de la ciudad</span>
          </Link>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <button type="button">
                <FolderHeart size={18} />
                <span>Mi perfil</span>
                <ChevronDown size={14} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to={appPaths.student.profile}>Información general</Link>
              <Link to={appPaths.student.decisions}>Mi decisión</Link>
            </CollapsibleContent>
          </Collapsible>
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
            <div className="sx-panel-pagination">
              <button
                type="button"
                className="sx-icon-button"
                aria-label="Actividades anteriores"
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                {currentPage * 5 + 1}–{Math.min(currentPage * 5 + 5, available.length)} de {available.length}
              </span>
              <button
                type="button"
                className="sx-icon-button"
                aria-label="Más actividades"
                disabled={currentPage === maxPage}
                onClick={() => setPage(currentPage + 1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </>
        ) : (
          <p className="sx-panel-subtitle">No hay actividades por realizar en esta zona por ahora.</p>
        )}
      </section>
    </div>
  )
}
