import rawCatalog from './catalogo.json'
import mara from './instrumento_mara.json'
import map from './registro_linea_tiempo.json'
import myths from './encuentro_mitos.json'
import pregones from './registro_mis_pregones.json'
import parentRole from './pad_01_acompanar.json'
import parentInfo from './pad_02_informacion.json'
import { validateActivity } from '@/lib/activities/validation'
import type { Actividad, Instrumento, Personaje, Recurso } from '@/types/activities'
import { compassInstrument, standardActivities } from './standardActivities'
import { configureStudentActivities } from '@/data/activities/reflectionConfig'

export const catalog = rawCatalog as {
  personajes: Personaje[]
  recursos: Recurso[]
  instrumentos: Instrumento[]
  piezasLlave: { id: string; nombre: string; descripcion: string }[]
}
catalog.instrumentos.push(compassInstrument)
const allActivities = [
  ...standardActivities,
  map,
  myths,
  mara,
  pregones,
  parentRole,
  parentInfo,
] as Actividad[]
for (const activity of allActivities) validateActivity(activity)
export const activities = configureStudentActivities(
  allActivities.filter((activity) => (activity.audiencia ?? 'estudiante') === 'estudiante'),
)
for (const activity of activities) validateActivity(activity)
export const parentActivities = allActivities
  .filter((activity) => activity.audiencia === 'apoderado')
  .sort((a, b) => a.orden - b.orden)
export const tipActivityIds = Array.from(
  { length: 14 },
  (_, i) => `act-tip-${String(i + 1).padStart(2, '0')}`,
)
export const finalActivity: Actividad = {
  id: 'act-tip-final',
  tipo: 'instrumento',
  titulo: 'Las pistas que hablan de ti',
  bloque: 2,
  orden: 15,
  obligatoria: true,
  requisitos: tipActivityIds,
  ubicacion: 'Río',
  duracionEstimadaMin: 5,
  personajeIds: ['elena'],
  nodos: [{ id: 'tip-resultado', tipo: 'resultado', hablanteId: 'elena', instrumentoId: 'tip' }],
}
export const activityById = (id: string) => activities.find((activity) => activity.id === id)
