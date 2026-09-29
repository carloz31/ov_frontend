import { Building2, MapPinned } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { appPaths } from '@/routes/paths'

function AdventureModeSwitch() {
  const navigate = useNavigate()
  const location = useLocation()
  const city = location.pathname === appPaths.student.exploration
  return (
    <nav
      aria-label="Cambiar zona de la aventura"
      className="absolute left-4 top-4 z-30 flex rounded-2xl border border-white/80 bg-white/95 p-1 shadow-lg backdrop-blur sm:left-6 sm:top-6"
    >
      <button
        type="button"
        aria-current={!city ? 'page' : undefined}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${!city ? 'bg-[#e7efe1] text-[#355b43]' : 'text-[#687982] hover:bg-muted'}`}
        onClick={() => navigate(appPaths.student.missions)}
      >
        <MapPinned className="size-4" /> Camino
      </button>
      <button
        type="button"
        aria-current={city ? 'page' : undefined}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${city ? 'bg-[#e2eef2] text-[#365f6c]' : 'text-[#687982] hover:bg-muted'}`}
        onClick={() => navigate(appPaths.student.exploration)}
      >
        <Building2 className="size-4" /> Ciudad
      </button>
    </nav>
  )
}
export { AdventureModeSwitch }
