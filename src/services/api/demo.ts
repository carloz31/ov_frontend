import { pedir } from './cliente'
import type { RespuestaServidor } from '@/types/servidor'

export function reiniciar(): Promise<RespuestaServidor<{ mensaje: string }>> {
  return pedir('/demo/reiniciar', {})
}
