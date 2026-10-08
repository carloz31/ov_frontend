import { KeyRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { modoApi } from '@/features/servidor/config'
import {
  useEstadoServidor,
  consultarProgreso,
  mensajeErrorServidor,
} from '@/features/servidor/estadoServidor'
import { progresoCamino, textoRequisito } from '@/features/servidor/adaptadores'
import { Link } from 'react-router'
import { Progress } from '@/components/ui/Progress'
import { fieldMissions } from '@/features/occupation-exploration/data/AdventureData'
import type { AdventureState } from '@/features/occupation-exploration/types/AdventureTypes'
import { appPaths } from '@/routes/paths'

export function CityLocked({ adventure }: { adventure: AdventureState }) {
  const servidor = useEstadoServidor()
  const [requisito, setRequisito] = useState('Consultando el requisito en el servidor…')
  const [error, setError] = useState(false)
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    if (!modoApi) return
    let vigente = true
    setRequisito('Consultando el requisito en el servidor…')
    setError(false)
    void consultarProgreso('BLOQUE', 'CIUDAD').then((r) => {
      if (!vigente) return
      setError(r.tipo !== 'ok')
      setRequisito(r.tipo === 'ok' ? textoRequisito(r.datos, servidor.estado) : mensajeErrorServidor(r))
    })
    return () => {
      vigente = false
    }
  }, [servidor.estado, intento])
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
        {modoApi && <p role={error ? 'alert' : 'status'}>{requisito}</p>}
        {modoApi && error && (
          <button className="sx-secondary-button" onClick={() => setIntento((i) => i + 1)}>
            Reintentar requisito
          </button>
        )}
        <Link className="sx-primary-button" to={appPaths.student.missions}>
          Continuar mi recorrido
        </Link>
      </section>
    </div>
  )
}
