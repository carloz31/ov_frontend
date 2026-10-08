import { pedir } from './cliente'
import type {
  AvanceInstrumento,
  ItemPublico,
  RespuestasActividad,
  RespuestaServidor,
  ResultadoPublico,
} from '@/types/servidor'

export function obtenerItems(actividad: string): Promise<RespuestaServidor<ItemPublico[]>> {
  return pedir(`/actividades/${encodeURIComponent(actividad)}/items`)
}

export function obtenerRespuestas(
  cuenta: string,
  actividad: string,
): Promise<RespuestaServidor<RespuestasActividad>> {
  return pedir(
    `/cuentas/${encodeURIComponent(cuenta)}/actividades/${encodeURIComponent(actividad)}/respuestas`,
  )
}

export function obtenerAvance(cuenta: string): Promise<RespuestaServidor<AvanceInstrumento[]>> {
  return pedir(`/cuentas/${encodeURIComponent(cuenta)}/instrumentos`)
}

export function obtenerResultado(
  cuenta: string,
  instrumento: string,
): Promise<RespuestaServidor<ResultadoPublico>> {
  return pedir(
    `/cuentas/${encodeURIComponent(cuenta)}/instrumentos/${encodeURIComponent(instrumento)}/resultado`,
  )
}
