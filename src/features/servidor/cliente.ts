import { urlApi } from './config'
import type { DetalleError, RespuestaServidor } from './tipos'

export async function pedir<T>(ruta: string, cuerpo?: unknown): Promise<RespuestaServidor<T>> {
  let respuesta: Response
  try {
    respuesta = await fetch(
      `${urlApi}${ruta}`,
      cuerpo === undefined
        ? undefined
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cuerpo),
          },
    )
  } catch {
    return { tipo: 'sin_conexion' }
  }
  let datos: unknown
  try {
    datos = await respuesta.json()
  } catch {
    return { tipo: 'http', estado: respuesta.status, detalle: 'Respuesta del servidor no válida.' }
  }
  if (respuesta.ok) return { tipo: 'ok', datos: datos as T }
  const detalle = datos && typeof datos === 'object' && 'detail' in datos ? datos.detail : datos
  if (respuesta.status === 409)
    return {
      tipo: 'bloqueado',
      detalle:
        typeof detalle === 'object' && detalle !== null
          ? (detalle as DetalleError)
          : { mensaje: String(detalle) },
    }
  return { tipo: 'http', estado: respuesta.status, detalle }
}
