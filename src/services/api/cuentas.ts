import { pedir } from './cliente'
import type {
  CuentaResumen,
  DesbloqueoLegible,
  DesbloqueosMarcados,
  EstadoCuenta,
  ProgresoObjetivo,
  RespuestaServidor,
  TipoObjetivo,
} from '@/types/servidor'

export function listarCuentas(): Promise<RespuestaServidor<CuentaResumen[]>> {
  return pedir('/cuentas')
}

export function obtenerEstado(cuenta: string): Promise<RespuestaServidor<EstadoCuenta>> {
  return pedir(`/cuentas/${encodeURIComponent(cuenta)}/estado`)
}

export function obtenerProgreso(
  cuenta: string,
  tipo: TipoObjetivo,
  codigo: string,
): Promise<RespuestaServidor<ProgresoObjetivo>> {
  return pedir(`/cuentas/${encodeURIComponent(cuenta)}/progreso/${tipo}/${encodeURIComponent(codigo)}`)
}

export function obtenerDesbloqueosNoVistos(cuenta: string): Promise<RespuestaServidor<DesbloqueoLegible[]>> {
  return pedir(`/cuentas/${encodeURIComponent(cuenta)}/desbloqueos?solo_no_vistos=true`)
}

export function marcarDesbloqueosVistos(cuenta: string): Promise<RespuestaServidor<DesbloqueosMarcados>> {
  return pedir(`/cuentas/${encodeURIComponent(cuenta)}/desbloqueos/marcar-vistos`, {})
}
