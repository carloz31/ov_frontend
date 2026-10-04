import { type ReactNode } from 'react'
import { ArrowLeft, ChevronRight, CircleHelp } from 'lucide-react'
import { Link } from 'react-router'
import { appPaths } from '@/routes/paths'
import { guideSteps } from '../guide-texts'
import { useStudentOverlays } from '../overlays/overlay-context'
import { useStudentUi } from '../ui-state'
import { getStudentViewLabel, type StudentView } from '../views'
import { StudentUserMenu } from './StudentUserMenu'

export function StudentModuleLayout({ view, children }: { view: StudentView; children: ReactNode }) {
  const ui = useStudentUi()
  const { openGuide } = useStudentOverlays()
  return (
    <div className="sx-module">
      <header className="sx-module-header">
        <Link
          className="sx-back-to-map"
          to={ui.lastMap === 'central' ? appPaths.student.exploration : appPaths.student.missions}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          <span>Volver al mapa</span>
        </Link>
        <span aria-hidden="true" className="sx-module-separator" />
        <h1 className="sx-module-title">
          {getStudentViewLabel(view)}
          {view === 'journal-signals' && (
            <>
              <ChevronRight aria-hidden="true" size={16} />
              <span>Señales</span>
            </>
          )}
        </h1>
        {view === 'profile-decisions' && (
          <nav className="sx-module-tabs" aria-label="Secciones de mi perfil">
            <Link to={appPaths.student.profile}>Información general</Link>
            <Link to={appPaths.student.decisions} aria-current="page">
              Mi decisión
            </Link>
          </nav>
        )}
        <div className="sx-module-actions">
          <button
            type="button"
            className="sx-icon-button"
            aria-label="Abrir guía"
            onClick={() => openGuide(guideSteps[view])}
          >
            <CircleHelp aria-hidden="true" size={20} />
          </button>
          <StudentUserMenu />
        </div>
      </header>
      <div className="sx-module-content">{children}</div>
    </div>
  )
}
