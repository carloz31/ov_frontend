import { useSyncExternalStore } from 'react'
import { configurarJourneyServidor, hidratarJourneyServidor } from '../journeyStore'
import {
  configurarAdventureServidor,
  hidratarAdventureServidor,
} from '../adventureStore'
import { baseRoute } from '@/data/activities/reflectionConfig'
import {
  actividadServidor,
  ciudadDisponible,
  misionesCompletadas,
  proyectarJourney,
  avisosServidor,
  claveDesbloqueo,
} from '@/lib/servidor/adaptadores'
import * as apiCuentas from '@/services/api/cuentas'
import * as apiInstrumentos from '@/services/api/instrumentos'
import { modoApi } from '@/config/env'
import { cuentaActiva } from './cuenta'
import type {
  DesbloqueoLegible,
  ErrorServidor,
  EstadoCuenta,
  RespuestaServidor,
  TipoObjetivo,
  ResultadoPublico,
  DesbloqueoNuevo,
} from '@/types/servidor'

type AlmacenServidor = {
  estado: EstadoCuenta | null
  cargando: boolean
  error: ErrorServidor | null
  noVistos: DesbloqueoLegible[]
  desbloqueosAccion: DesbloqueoNuevo[]
  avisosMostrados: string[]
  errorAvisos: ErrorServidor | null
  procesandoAvisos: boolean
  marcadoAvisos: string[] | null
  fechasInsignias: Record<string, string>
  resultadoRiasec: ResultadoPublico | null
  estadoResultado: 'sin_cargar' | 'cargando' | 'pendiente' | 'listo' | 'error'
  errorResultado: ErrorServidor | null
}
let almacen: AlmacenServidor = {
  estado: null,
  cargando: false,
  error: null,
  noVistos: [],
  desbloqueosAccion: [],
  avisosMostrados: [],
  errorAvisos: null,
  procesandoAvisos: false,
  marcadoAvisos: null,
  fechasInsignias: {},
  resultadoRiasec: null,
  estadoResultado: 'sin_cargar',
  errorResultado: null,
}
let revision = 0
let revisionCuenta = 0
let revisionResultado = 0
let consultaResultado: {
  cuenta: string | null
  sesion: number
  promesa: Promise<RespuestaServidor<ResultadoPublico | null>>
} | null = null
export const sesionServidor = () => revisionCuenta
const oyentes = new Set<() => void>()
function publicar(cambios: Partial<AlmacenServidor>) {
  almacen = { ...almacen, ...cambios }
  oyentes.forEach((oyente) => oyente())
}
export const obtenerEstadoServidor = () => almacen
export const useEstadoServidor = () =>
  useSyncExternalStore((oyente) => {
    oyentes.add(oyente)
    return () => {
      oyentes.delete(oyente)
    }
  }, obtenerEstadoServidor)

export function prepararAlmacenesApi(cuenta = cuentaActiva() ?? 'est-ana') {
  if (!modoApi) return
  configurarJourneyServidor(cuenta)
  configurarAdventureServidor(cuenta, () => ciudadDisponible(almacen.estado))
}
export function limpiarEstadoServidor() {
  revision++
  revisionCuenta++
  revisionResultado++
  consultaResultado = null
  publicar({
    estado: null,
    error: null,
    cargando: false,
    noVistos: [],
    desbloqueosAccion: [],
    avisosMostrados: [],
    errorAvisos: null,
    procesandoAvisos: false,
    marcadoAvisos: null,
    fechasInsignias: {},
    resultadoRiasec: null,
    estadoResultado: 'sin_cargar',
    errorResultado: null,
  })
}
export function informarErrorServidor(error: ErrorServidor) {
  publicar({ cargando: false, error })
}
export async function refrescar(): Promise<RespuestaServidor<EstadoCuenta>> {
  const cuenta = cuentaActiva()
  if (!modoApi || !cuenta)
    return { tipo: 'http', estado: 400, detalle: 'No hay una cuenta de servidor activa.' }
  const turno = ++revision
  publicar({ cargando: true, error: null })
  const respuesta = await apiCuentas.obtenerEstado(cuenta)
  if (turno !== revision || cuenta !== cuentaActiva())
    return { tipo: 'http', estado: 409, detalle: 'La cuenta activa cambió durante la consulta.' }
  if (respuesta.tipo !== 'ok') {
    publicar({ cargando: false, error: respuesta })
    return respuesta
  }
  prepararAlmacenesApi(cuenta)
  publicar({ estado: respuesta.datos })
  hidratarJourneyServidor((actual) => proyectarJourney(respuesta.datos, actual))
  hidratarAdventureServidor(misionesCompletadas(respuesta.datos, baseRoute))
  const noVistos = await consultarNoVistos()
  if (turno !== revision || cuenta !== cuentaActiva())
    return { tipo: 'http', estado: 409, detalle: 'La cuenta activa cambió durante la consulta.' }
  publicar({
    cargando: false,
    noVistos: noVistos.tipo === 'ok' ? noVistos.datos : almacen.noVistos,
    error: noVistos.tipo === 'ok' ? null : noVistos,
  })
  if (noVistos.tipo !== 'ok') return noVistos
  const final = actividadServidor(respuesta.datos, 'act-tip-final')
  if (final && final.estado !== 'BLOQUEADA') {
    const resultado = await cargarResultadoRiasec()
    if (turno !== revision || cuenta !== cuentaActiva()) return cambioCuenta()
    if (resultado.tipo !== 'ok') return resultado
  } else publicar({ resultadoRiasec: null, estadoResultado: 'pendiente', errorResultado: null })
  return respuesta
}
const cambioCuenta = (): ErrorServidor => ({
  tipo: 'http',
  estado: 409,
  detalle: 'La cuenta activa cambió durante la consulta.',
})
async function consultarCuenta<T>(
  consulta: (cuenta: string) => Promise<RespuestaServidor<T>>,
): Promise<RespuestaServidor<T>> {
  const cuenta = cuentaActiva(),
    sesion = revisionCuenta
  if (!modoApi || !cuenta)
    return { tipo: 'http', estado: 400, detalle: 'No hay una cuenta de servidor activa.' }
  const respuesta = await consulta(cuenta)
  return cuenta === cuentaActiva() && sesion === revisionCuenta ? respuesta : cambioCuenta()
}
export function consultarRespuestas(actividad: string) {
  return consultarCuenta((cuenta) => apiInstrumentos.obtenerRespuestas(cuenta, actividad))
}
export function consultarAvanceInstrumentos() {
  return consultarCuenta(apiInstrumentos.obtenerAvance)
}
export async function cargarResultadoRiasec(): Promise<RespuestaServidor<ResultadoPublico | null>> {
  const cuenta = cuentaActiva(),
    sesion = revisionCuenta
  if (consultaResultado?.cuenta === cuenta && consultaResultado.sesion === sesion)
    return consultaResultado.promesa
  const consulta = { cuenta, sesion, promesa: consultarResultadoRiasec() }
  consultaResultado = consulta
  try {
    return await consulta.promesa
  } finally {
    if (consultaResultado === consulta) consultaResultado = null
  }
}
async function consultarResultadoRiasec(): Promise<RespuestaServidor<ResultadoPublico | null>> {
  if (!modoApi) return { tipo: 'http', estado: 400, detalle: 'El servidor no se usa en modo local.' }
  const turno = ++revisionResultado
  publicar({ estadoResultado: 'cargando', errorResultado: null })
  const respuesta = await consultarCuenta((cuenta) => apiInstrumentos.obtenerResultado(cuenta, 'TEST-RIASEC'))
  if (turno !== revisionResultado) return cambioCuenta()
  if (respuesta.tipo === 'ok') {
    publicar({ resultadoRiasec: respuesta.datos, estadoResultado: 'listo', errorResultado: null })
    return respuesta
  }
  if (respuesta.tipo === 'bloqueado' && respuesta.detalle.avance) {
    publicar({ resultadoRiasec: null, estadoResultado: 'pendiente', errorResultado: null })
    return { tipo: 'ok', datos: null }
  }
  publicar({ resultadoRiasec: null, estadoResultado: 'error', errorResultado: respuesta })
  return respuesta
}
export function consultarProgreso(tipo: TipoObjetivo, codigo: string) {
  return consultarCuenta((cuenta) => apiCuentas.obtenerProgreso(cuenta, tipo, codigo))
}

export function incorporarDesbloqueos(desbloqueos: DesbloqueoNuevo[]) {
  const todos = new Map(almacen.desbloqueosAccion.map((d) => [claveDesbloqueo(d), d]))
  desbloqueos.forEach((d) => todos.set(claveDesbloqueo(d), d))
  publicar({ desbloqueosAccion: [...todos.values()] })
}
export function avisosPendientes() {
  return avisosServidor([...almacen.noVistos, ...almacen.desbloqueosAccion]).filter(
    (a) => !almacen.avisosMostrados.includes(a.id),
  )
}
export function mostrarAviso(id: string) {
  if (!almacen.avisosMostrados.includes(id)) publicar({ avisosMostrados: [...almacen.avisosMostrados, id] })
}
export function estadoLoteAvisos(
  cambios: Partial<Pick<AlmacenServidor, 'errorAvisos' | 'procesandoAvisos' | 'marcadoAvisos'>>,
) {
  publicar(cambios)
}
export function terminarAvisosMarcados(ids: string[]) {
  publicar({
    desbloqueosAccion: almacen.desbloqueosAccion.filter((d) => !ids.includes(claveDesbloqueo(d))),
    avisosMostrados: almacen.avisosMostrados.filter((id) => !ids.includes(id)),
    marcadoAvisos: null,
  })
}
export async function consultarNoVistos() {
  const respuesta = await consultarCuenta(apiCuentas.obtenerDesbloqueosNoVistos)
  if (respuesta.tipo === 'ok') {
    const fechas = { ...almacen.fechasInsignias }
    respuesta.datos
      .filter((d) => d.tipo_objetivo === 'INSIGNIA')
      .forEach((d) => {
        fechas[d.objetivo.codigo] = d.fecha_hora
      })
    publicar({ noVistos: respuesta.datos, fechasInsignias: fechas })
  }
  return respuesta
}
export function consultarItems(actividad: string) {
  return apiInstrumentos.obtenerItems(actividad)
}
export function mensajeErrorServidor(error: ErrorServidor | null) {
  if (!error) return ''
  if (error.tipo === 'sin_conexion') return 'No se pudo conectar con el servidor. Vuelve a intentarlo.'
  if (error.tipo === 'bloqueado') return error.detalle.mensaje ?? 'La acción no está disponible.'
  const detalle = error.detalle
  return typeof detalle === 'string'
    ? detalle
    : detalle && typeof detalle === 'object' && 'mensaje' in detalle
      ? String(detalle.mensaje)
      : `No se pudo consultar el servidor (${error.estado}).`
}
