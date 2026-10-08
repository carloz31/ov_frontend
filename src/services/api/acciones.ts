import { pedir } from './cliente'
import type {
  RespuestaAccion,
  RespuestaCompletarActividad,
  RespuestaItemEntrada,
  RespuestaItemsGuardados,
  RespuestaServidor,
} from '@/types/servidor'

export function ingresar(cuenta: string): Promise<RespuestaServidor<RespuestaAccion>> {
  return pedir('/acciones/ingresar', { cuenta })
}

export function completarActividad(
  cuenta: string,
  actividad: string,
): Promise<RespuestaServidor<RespuestaCompletarActividad>> {
  return pedir('/acciones/completar-actividad', { cuenta, actividad })
}

export function responderItems(
  cuenta: string,
  actividad: string,
  respuestas: RespuestaItemEntrada[],
): Promise<RespuestaServidor<RespuestaItemsGuardados>> {
  return pedir('/acciones/responder-items', { cuenta, actividad, respuestas })
}
