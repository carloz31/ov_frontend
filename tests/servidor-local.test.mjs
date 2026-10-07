import assert from 'node:assert/strict'
import test from 'node:test'
import { fixtureServidor, elementos, esperar } from './servidor-ayudas.mjs'

test('local mantiene claves, finalización y recomendaciones sin consultar al servidor ni usar adaptadores', async () => {
  const app = fixtureServidor({ api: false })
  const adaptadores = app.load('src/features/servidor/adaptadores.ts')
  for (const key of Object.keys(adaptadores))
    adaptadores[key] = () => {
      throw Error('El modo local usó un adaptador del servidor')
    }
  const store = app.load('src/features/missions/store.ts'),
    adventure = app.load('src/features/occupation-exploration/lib/AdventureStore.ts')
  const activity = app.load('src/features/missions/content.ts').activityById('mission-welcome')
  // DATO DE PRUEBA: comprobación aprobada del contenido real antes del último diálogo.
  store.updateJourney((s) => ({
    ...s,
    attempts: activity.nodos
      .filter((n) => n.tipo === 'pregunta')
      .map((n) => ({
        estudianteId: 'est-prototipo',
        actividadId: activity.id,
        nodoId: n.id,
        opcionIds: n.opciones.filter((o) => o.correcta).map((o) => o.id),
        correcta: true,
        revelada: false,
        numeroIntento: 1,
        respondidaEn: '2026-10-07T12:00:00Z',
      })),
  }))
  store.updateJourney((s) => ({
    ...s,
    progress: {
      [activity.id]: {
        estudianteId: 'est-prototipo',
        actividadId: activity.id,
        estado: 'en_curso',
        nodoActualId: activity.nodos.at(-1).id,
      },
    },
  }))
  const { StudentActivityPlayer } = app.load(
    'src/features/student-experience/player/StudentActivityPlayer.tsx',
  )
  const player = app.mount(StudentActivityPlayer, { activity, onClose() {} })
  const scene = elementos(player.render(), (e) => e.type?.name === 'DialogueBox')[0]
  scene.props.onContinue()
  await esperar()
  assert.equal(store.getJourneySnapshot().progress[activity.id].estado, 'completada')
  assert.equal(store.getJourneySnapshot().rewards.length, 1)
  assert.ok(elementos(player.render(), (e) => e.type?.name === 'FinishScreen').length)
  const mapa = app.load('src/features/student-experience/map/mapPoints.ts')
  const points = mapa.getCaminoPoints(adventure.useAdventure(), store.getJourneySnapshot())
  assert.equal(mapa.getRecommendedPoint(points).specActivityId, 'enc-mitos')
  assert.ok(app.local.has('ov.missions.v2'))
  assert.equal(app.local.has('ov.missions.v2.api'), false)
  assert.equal(app.requests.length, 0)
  player.unmount()
})
