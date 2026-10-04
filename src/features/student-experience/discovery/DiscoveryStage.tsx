import type { ReactNode } from 'react'
import { CatalogNavigation } from '../catalog/CatalogNavigation'
import { useDiscoveryError } from './discoveryStore'
import { useExplorationError } from './explorationStore'
import './discovery.css'

export function DiscoveryStage({
  ambient,
  children,
}: {
  ambient: 'profile' | 'plans' | 'research' | 'atlas'
  children: ReactNode
}) {
  const discoveryError = useDiscoveryError()
  const explorationError = useExplorationError()
  return (
    <div className="sx-discovery" data-ambient={ambient}>
      <div className="sx-d-container">
        {ambient === 'atlas' && <CatalogNavigation />}
        {(discoveryError || explorationError) && (
          <p role="alert" className="sx-d-warning">
            No se pudo guardar en este navegador. Tus cambios siguen disponibles durante esta sesión; evita
            recargar hasta permitir el almacenamiento.
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
