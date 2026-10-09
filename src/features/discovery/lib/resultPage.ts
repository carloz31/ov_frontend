import type { HelenaDimension, HelenaResult, TipoResultadoHelena } from '@/types/profile'
import type { ResumenResultado } from '../types'

export function ordenarDimensiones<T extends HelenaDimension>(dimensiones: T[]): T[] {
  return [...dimensiones].sort((a, b) => b.score - a.score)
}
export function dimensionesDestacadas<T extends HelenaDimension>(dimensiones: T[]): T[] {
  const maximo = Math.max(...dimensiones.map((d) => d.score))
  return dimensiones.filter((d) => d.score === maximo)
}
export function ordenarCarreras<T extends { via: unknown[] }>(carreras: T[]): T[] {
  return [...carreras].sort((a, b) => b.via.length - a.via.length)
}
export function filtrarPorAjuste<T extends { ajuste: string }>(ocupaciones: T[], ajuste: string): T[] {
  return ajuste === 'Todas' ? ocupaciones : ocupaciones.filter((o) => o.ajuste === ajuste)
}
export function resumirResultado(
  tipoResultado: TipoResultadoHelena,
  resultado: HelenaResult,
  opciones: { perfilPlano?: boolean; hayEmpate?: boolean; ejemplos?: Record<string, string> } = {},
): ResumenResultado {
  const dimensiones = (resultado.dimensiones ?? resultado.areas).map((d) => ({
    ...d,
    ejemplos: opciones.ejemplos?.[d.code],
  }))
  const coincidencias = tipoResultado === 'COINCIDENCIAS'
  const perfilPlano = coincidencias && !!opciones.perfilPlano
  const principales = perfilPlano
    ? []
    : coincidencias
      ? resultado.areas
      : (resultado.destacadas ?? dimensionesDestacadas(dimensiones))
  return {
    tipoResultado,
    dimensiones,
    ordenadas: ordenarDimensiones(dimensiones),
    protagonistas: principales.map((d) => ({ ...d, ejemplos: opciones.ejemplos?.[d.code] })),
    perfilPlano,
    hayEmpate: !!opciones.hayEmpate,
    secciones: {
      ocupaciones: coincidencias && !perfilPlano,
      carreras: coincidencias && !perfilPlano,
      siguientesPasos: !coincidencias,
    },
  }
}
