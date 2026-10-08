import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { appPaths } from '@/routes/paths'
import { Parchment } from '@/components/student/Parchment'
export function AtlasNavigation({ section }: { section: 'careers' | 'professions' | 'institutions' }) {
  const label = { careers: 'Carreras', professions: 'Ocupaciones', institutions: 'Instituciones' }[section]
  return (
    <div>
      <Link className="sx-d-back" to={appPaths.student.catalog[section]}>
        <ArrowLeft aria-hidden="true" />
        {label}
      </Link>
      <p className="sx-d-atlas-breadcrumb">Catálogo · {label}</p>
    </div>
  )
}
export function MissingAtlasPage() {
  return (
    <Parchment title="No encontramos esta página del atlas.">
      <Link className="sx-d-action" to={appPaths.student.catalog.professions}>
        Volver al catálogo
      </Link>
    </Parchment>
  )
}
