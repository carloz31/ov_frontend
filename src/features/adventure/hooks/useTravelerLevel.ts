import { modoApi } from '@/config/env'
import { useEstadoServidor } from '@/store/servidor/estadoServidor'

import { getTravelerLevel } from '@/store/adventureStore'
import type { AdventureState } from '@/types/adventure'

export function useTravelerLevel(adventure: AdventureState) {
  const servidor = useEstadoServidor()
  const level = modoApi
    ? getTravelerLevel(adventure, servidor.estado?.nivel_actual ?? null)
    : getTravelerLevel(adventure)
  return {
    level,
    nombre: modoApi ? servidor.estado?.cuenta.nombre : 'Alex',
    progresoCiudad: modoApi ? 'interacción que completas.' : 'llamado que atiendes.',
  }
}
