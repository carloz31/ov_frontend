import { KeyRound } from 'lucide-react'
import { modoApi } from '@/features/servidor/config'
import { useEstadoServidor } from '@/features/servidor/estadoServidor'
import { progresoCamino } from '@/features/servidor/adaptadores'
import { Link } from 'react-router'
import { Progress } from '@/components/ui/Progress'
import { fieldMissions } from '@/features/occupation-exploration/data/AdventureData'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'

export function CityLocked({ adventure }: { adventure: AdventureState }) {
  const servidor = useEstadoServidor()
  return (
    <div className="sx-city-mist">
      <section className="sx-glass sx-city-locked">
        <KeyRound size={56} />
        <p>Capítulo 2 · La ciudad</p>
        <h2>Una llave, mil posibilidades</h2>
        <p>
          La ciudad abrirá sus puertas cuando completes todas las Misiones de Campo. Allí podrás ayudar a sus
          habitantes e investigar profesiones.
        </p>
        <Progress
          aria-label="Camino hacia la ciudad"
          value={
            modoApi
              ? progresoCamino(servidor.estado).porcentaje
              : (fieldMissions.filter((item) => adventure.completedMissionIds.includes(item.id)).length /
                  fieldMissions.length) *
                100
          }
        />
        <Link className="sx-primary-button" to={appPaths.student.missions}>
          Continuar mi recorrido
        </Link>
      </section>
    </div>
  )
}
