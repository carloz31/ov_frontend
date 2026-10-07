import { useSyncExternalStore } from 'react'
import { configurarJourneyServidor, hidratarJourneyServidor } from '../missions/store'
import {
  configurarAdventureServidor,
  hidratarAdventureServidor,
} from '../occupation-exploration/lib/AdventureStore'
import { baseRoute } from '../student-experience/reflection/config'
import { actividadServidor, ciudadDisponible, misionesCompletadas, proyectarJourney } from './adaptadores'
import { pedir } from './cliente'
import { modoApi } from './config'
import { cuentaActiva } from './cuenta'
import type {
  DesbloqueoLegible,
  ErrorServidor,
  EstadoCuenta,
  ItemPublico,
  ProgresoObjetivo,
  RespuestaServidor,
  TipoObjetivo,
  RespuestasActividad,
  AvanceInstrumento,
  ResultadoPublico,
} from './tipos'

type AlmacenServidor = {
  estado: EstadoCuenta | null
  cargando: boolean
  error: ErrorServidor | null
  noVistos: DesbloqueoLegible[]
  resultadoRiasec: ResultadoPublico | null
  estadoResultado: 'sin_cargar' | 'cargando' | 'pendiente' | 'listo' | 'error'
  errorResultado: ErrorServidor | null
}
let almacen: AlmacenServidor = {
  estado: null,
  cargando: false,
  error: null,
  noVistos: [],
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
  const respuesta = await pedir<EstadoCuenta>(`/cuentas/${encodeURIComponent(cuenta)}/estado`)
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
  const noVistos = await pedir<DesbloqueoLegible[]>(
    `/cuentas/${encodeURIComponent(cuenta)}/desbloqueos?solo_no_vistos=true`,
  )
  if (turno !== revision || cuenta !== cuentaActiva())
    return { tipo: 'http', estado: 409, detalle: 'La cuenta activa cambió durante la consulta.' }
  publicar({
    cargando: false,
    noVistos: noVistos.tipo === 'ok' ? noVistos.datos : almacen.noVistos,
    error: noVistos.tipo === 'ok' ? null : noVistos,
  })
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
async function consultarCuenta<T>(ruta: string): Promise<RespuestaServidor<T>> {
  const cuenta = cuentaActiva(),
    sesion = revisionCuenta
  if (!modoApi || !cuenta)
    return { tipo: 'http', estado: 400, detalle: 'No hay una cuenta de servidor activa.' }
  const respuesta = await pedir<T>(`/cuentas/${encodeURIComponent(cuenta)}${ruta}`)
  return cuenta === cuentaActiva() && sesion === revisionCuenta ? respuesta : cambioCuenta()
}
export function consultarRespuestas(actividad: string) {
  return consultarCuenta<RespuestasActividad>(`/actividades/${encodeURIComponent(actividad)}/respuestas`)
}
export function consultarAvanceInstrumentos() {
  return consultarCuenta<AvanceInstrumento[]>('/instrumentos')
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
  const respuesta = await consultarCuenta<ResultadoPublico>('/instrumentos/TEST-RIASEC/resultado')
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
  return pedir<ProgresoObjetivo>(
    `/cuentas/${encodeURIComponent(cuentaActiva() ?? '')}/progreso/${tipo}/${encodeURIComponent(codigo)}`,
  )
}
export function consultarItems(actividad: string) {
  return pedir<ItemPublico[]>(`/actividades/${encodeURIComponent(actividad)}/items`)
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
