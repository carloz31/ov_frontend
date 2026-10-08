import { useEffect, useState } from 'react'
import { modoApi } from '@/config/env'
import { useEstadoServidor, consultarProgreso, mensajeErrorServidor } from '@/store/servidor/estadoServidor'
import { progresoCamino, textoRequisito } from '@/lib/servidor/adaptadores'

import { fieldMissions } from '@/data/content/adventure'
import type { AdventureState } from '@/types/adventure'

export function useCityRequirement(adventure: AdventureState) {
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
  return {
    requisito,
    error,
    setIntento,
    mostrarRequisito: modoApi,
    progreso: modoApi
      ? progresoCamino(servidor.estado).porcentaje
      : (fieldMissions.filter((item) => adventure.completedMissionIds.includes(item.id)).length /
          fieldMissions.length) *
        100,
  }
}
