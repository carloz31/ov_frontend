import type { JourneyState } from '../missions/logic'
import type { Actividad } from '../missions/model'
import type { HelenaPage } from '../student-experience/profile/helenaPages'
import type { StudentDiscoveryState } from '../student-experience/discovery/discoveryStore'
import type {
  ActividadEstado,
  DesbloqueoNuevo,
  DetalleError,
  EstadoCuenta,
  ProgresoObjetivo,
  TipoObjetivo,
  ItemPublico,
  RespuestaPublica,
  ResultadoPublico,
  CoincidenciaPublica,
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

// DATO DE PRUEBA: saludos para los encuentros 02–14, mientras se prepara su narrativa.
const saludosMara = [
  '¡Qué bueno verte otra vez! Acompáñame un rato y conversemos sobre lo que te gusta hacer.',
  '¡Hola de nuevo! Hoy tengo otras ideas para conocerte un poco más.',
  '¡Llegaste! Sigamos descubriendo qué actividades despiertan tu curiosidad.',
]
export function construirInteraccionMara(
  actividad: ActividadEstado,
  items: ItemPublico[],
  saludoInicial: string,
): Actividad {
  const numero = Number(actividad.codigo.slice(-2))
  return {
    id: actividad.codigo,
    tipo: 'instrumento',
    titulo: actividad.titulo,
    subtitulo: `Interacción ${numero} de 14 · Test de intereses`,
    bloque: 2,
    orden: numero,
    obligatoria: true,
    requisitos: [],
    duracionEstimadaMin: 4,
    personajeIds: ['mara'],
    nodos: [
      {
        id: `${actividad.codigo}-saludo`,
        tipo: 'dialogo',
        hablanteId: 'mara',
        texto: numero === 1 ? saludoInicial : saludosMara[(numero - 2) % 3],
      },
      ...[...items]
        .sort((a, b) => a.orden - b.orden)
        .map((item) => ({
          id: `${actividad.codigo}-${item.codigo}`,
          tipo: 'item' as const,
          instrumentoId: item.instrumento,
          itemId: item.codigo,
          hablanteId: 'mara',
          etiqueta: 'Para conocerte mejor:',
        })),
      // DATO DE PRUEBA: despedida común de las interacciones RIASEC.
      {
        id: `${actividad.codigo}-despedida`,
        tipo: 'dialogo',
        hablanteId: 'mara',
        texto:
          'Gracias por compartir estas pistas conmigo. Seguiremos conversando en nuestro próximo encuentro.',
      },
    ],
  }
}
export function inicioInteraccionMara(
  actividad: Actividad,
  respuestas: RespuestaPublica[],
  revision = false,
) {
  const items = actividad.nodos.filter((n) => n.tipo === 'item')
  if (revision) return items[0]?.id ?? actividad.nodos[0]?.id
  if (!respuestas.length) return actividad.nodos[0]?.id
  return items.find((n) => !respuestas.some((r) => r.item === n.itemId))?.id ?? actividad.nodos.at(-1)?.id
}
export function areasRiasec(resultado: ResultadoPublico | null) {
  if (!resultado || resultado.perfil_plano) return []
  return [...(resultado.codigo_interes?.codigo ?? '')].slice(0, 3).flatMap((codigo) => {
    const dimension = resultado.dimensiones.find((d) => d.codigo === codigo)
    return dimension ? [dimension] : []
  })
}
export function coincidenciasRiasec(resultado: ResultadoPublico | null) {
  return !resultado || resultado.perfil_plano
    ? []
    : [...(resultado.coincidencias ?? [])].sort((a, b) => a.posicion - b.posicion)
}
export const textoAjuste = (ajuste: CoincidenciaPublica['ajuste']) =>
  ({ BEST_FIT: 'Mejor ajuste', GREAT_FIT: 'Gran ajuste', GOOD_FIT: 'Buen ajuste' })[ajuste]
export function paginaInteresesServidor(
  estado: EstadoCuenta | null,
  resultado: ResultadoPublico | null,
  discovery: StudentDiscoveryState,
): HelenaPage {
  const revelado =
    !!estado &&
    !!resultado &&
    discovery.revealedPagesApi?.[estado.cuenta.codigo]?.[resultado.calculado_en]?.includes('intereses')
  return {
    id: 'intereses',
    numeral: 'I',
    title: 'Lo que te atrae hacer',
    subtitle: 'Tus intereses',
    required: true,
    state: !resultado ? 'sealed' : revelado ? 'revealed' : 'ready',
    missions: {
      done:
        estado?.bloques
          .flatMap((b) => b.actividades)
          .filter((a) => /^act-tip-\d{2}$/.test(a.codigo) && a.estado === 'COMPLETADA').length ?? 0,
      total: 14,
    },
    demo: false,
    teaser: 'Esta página aún guarda pistas sobre lo que te atrae hacer.',
    activityHref: `/student/exploration?actividad=${interaccionMara(estado).actividad?.codigo ?? 'act-tip-01'}`,
    perfilPlano: resultado?.perfil_plano,
    result: revelado
      ? {
          source: 'real',
          areas: areasRiasec(resultado).map((d) => ({
            code: d.codigo,
            name: d.nombre,
            score: d.porcentaje,
            description: `Te atraen actividades vinculadas con ${d.nombre.toLocaleLowerCase()}.`,
          })),
        }
      : undefined,
  }
}
