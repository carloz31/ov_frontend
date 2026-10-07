import type { JourneyState } from '../missions/logic'
import type {
  ActividadEstado,
  DesbloqueoNuevo,
  DetalleError,
  EstadoCuenta,
  ProgresoObjetivo,
  TipoObjetivo,
} from './tipos'

export const actividadServidor = (estado: EstadoCuenta | null, codigo: string): ActividadEstado | undefined =>
  estado?.bloques.flatMap((b) => b.actividades).find((a) => a.codigo === codigo)
export const ciudadDisponible = (estado: EstadoCuenta | null) =>
  estado?.bloques.some((b) => b.codigo === 'CIUDAD' && b.estado === 'DISPONIBLE') === true
export const fichaDisponible = (estado: EstadoCuenta | null, codigo: string) =>
  estado?.fichas.some((f) => f.codigo === codigo && f.estado === 'DISPONIBLE') === true
export const estadoPunto = (actividad?: ActividadEstado): 'locked' | 'available' | 'completed' =>
  actividad?.estado === 'COMPLETADA'
    ? 'completed'
    : actividad?.estado === 'DISPONIBLE' || actividad?.estado === 'EN_CURSO'
      ? 'available'
      : 'locked'
export function siguienteActividad(estado: EstadoCuenta | null, bloque = 'CAMINO') {
  return estado?.bloques
    .find((b) => b.codigo === bloque)
    ?.actividades.find((a) => a.estado === 'DISPONIBLE' || a.estado === 'EN_CURSO')
}
export function progresoCamino(estado: EstadoCuenta | null) {
  const actividades = estado?.bloques.find((b) => b.codigo === 'CAMINO')?.actividades ?? []
  const completadas = actividades.filter((a) => a.estado === 'COMPLETADA').length
  return {
    completadas,
    total: actividades.length,
    porcentaje: actividades.length ? (completadas / actividades.length) * 100 : 0,
  }
}
export function interaccionMara(estado: EstadoCuenta | null) {
  const actividades =
    estado?.bloques
      .find((b) => b.codigo === 'CIUDAD')
      ?.actividades.filter((a) => /^act-tip-\d{2}$/.test(a.codigo)) ?? []
  const actividad = actividades.find((a) => a.estado !== 'COMPLETADA') ?? actividades.at(-1)
  return { actividad, numero: actividad ? Number(actividad.codigo.slice(-2)) : 1, total: actividades.length }
}
export function proyectarJourney(estado: EstadoCuenta, actual: JourneyState): JourneyState {
  const progress = { ...actual.progress }
  for (const actividad of estado.bloques.flatMap((b) => b.actividades)) {
    const anterior = progress[actividad.codigo]
    progress[actividad.codigo] = {
      ...anterior,
      estudianteId: estado.cuenta.codigo,
      actividadId: actividad.codigo,
      estado:
        actividad.estado === 'COMPLETADA'
          ? 'completada'
          : actividad.estado === 'EN_CURSO'
            ? 'en_curso'
            : 'no_iniciada',
    }
    if (actividad.estado !== 'COMPLETADA') delete progress[actividad.codigo].completadaEn
  }
  // Las actividades ausentes del servidor nunca conservan una finalización autoritativa.
  for (const codigo of Object.keys(progress)) {
    if (!actividadServidor(estado, codigo))
      progress[codigo] = { ...progress[codigo], estado: 'no_iniciada', completadaEn: undefined }
  }
  return { ...actual, progress }
}
export function misionesCompletadas(estado: EstadoCuenta, ruta: readonly (readonly [string, string])[]) {
  return ruta
    .filter(([, codigo]) => actividadServidor(estado, codigo)?.estado === 'COMPLETADA')
    .map(([id]) => id)
}
export function textoRequisito(progreso: ProgresoObjetivo, estado: EstadoCuenta | null) {
  if (progreso.objetivo.tipo === 'BLOQUE' && progreso.objetivo.codigo === 'CIUDAD') {
    return `Completa todas las misiones del camino (${progresoCamino(estado).completadas} de 9).`
  }
  const condicion = progreso.reglas
    .filter((r) => !r.cumplida)
    .flatMap((r) => r.condiciones)
    .find((c) => !c.cumplida)
  if (condicion?.tipo_evento === 'COMPLETA_ACTIVIDAD' && condicion.referencia) {
    return `Requisito: completa “${actividadServidor(estado, condicion.referencia)?.titulo ?? condicion.referencia}”.`
  }
  return progreso.disponible ? 'Requisito cumplido.' : 'El requisito de esta actividad aún está pendiente.'
}
export function textoBloqueo(detalle: DetalleError, estado: EstadoCuenta | null) {
  if (detalle.progreso) return textoRequisito(detalle.progreso, estado)
  if (detalle.items_faltantes?.length)
    return `Faltan ${detalle.items_faltantes.length} ítems por responder: ${detalle.items_faltantes.join(', ')}.`
  return detalle.mensaje ?? 'La actividad sigue bloqueada.'
}
export function textosDesbloqueos(desbloqueos: DesbloqueoNuevo[]) {
  return desbloqueos.flatMap<{ codigo: string; tipo: TipoObjetivo; texto: string }>((d) => {
    const nombre = d.objetivo.nombre
    switch (d.tipo_objetivo) {
      case 'ACTIVIDAD':
        return [{ codigo: d.objetivo.codigo, tipo: d.tipo_objetivo, texto: `Se abrió: ${nombre}` }]
      case 'FICHA':
        return [
          { codigo: d.objetivo.codigo, tipo: d.tipo_objetivo, texto: `Nueva ficha en tu mochila: ${nombre}` },
        ]
      case 'INSIGNIA':
        return [{ codigo: d.objetivo.codigo, tipo: d.tipo_objetivo, texto: `Nueva insignia: ${nombre}` }]
      case 'NIVEL':
        return [{ codigo: d.objetivo.codigo, tipo: d.tipo_objetivo, texto: `Subiste a ${nombre}` }]
      case 'BLOQUE':
        return d.objetivo.codigo === 'CIUDAD'
          ? [{ codigo: d.objetivo.codigo, tipo: d.tipo_objetivo, texto: 'La ciudad te espera' }]
          : []
      default:
        return []
    }
  })
}
