import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'

const nativeRequire = createRequire(import.meta.url)
const cache = new Map()
const context = vm.createContext({
  console,
  Date,
  URL,
  Map,
  Set,
  crypto,
  window: { addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} },
})
function load(file) {
  if (cache.has(file)) return cache.get(file)
  if (file.endsWith('.json')) return JSON.parse(readFileSync(file, 'utf8'))
  const exports = {}
  cache.set(file, exports)
  const source = readFileSync(file, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/'")
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const require = (specifier) => {
    if (specifier.endsWith('.css')) return {}
    // Supply a deterministic snapshot for static rendering, without mounting subscriptions.
    if (specifier === 'react') return { ...React, useSyncExternalStore: (_, snapshot) => snapshot() }
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return nativeRequire(specifier)
    const base = specifier.startsWith('@/')
      ? path.resolve('src', specifier.slice(2))
      : path.resolve(path.dirname(file), specifier)
    const resolved = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(candidate))
    return load(resolved)
  }
  vm.runInContext(`(function(require, exports) { ${js}\n})`, context, { filename: file })(require, exports)
  return exports
}
const store = load(path.resolve('src/features/occupation-exploration/lib/AdventureStore.ts'))
const { fieldMissions } = load(path.resolve('src/features/occupation-exploration/data/AdventureData.ts'))
const { familyConversationDemoData, familyConversationTopics } = load(
  path.resolve('src/features/family-conversations/FamilyConversationData.ts'),
)
const { AdventureMap } = load(path.resolve('src/components/AdventureMap.tsx'))
const { AppRoutes } = load(path.resolve('src/routes/AppRoutes.tsx'))
function render(route, patch = {}) {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), ...patch }))
  return renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(AppRoutes)),
  )
}
test('all new student pages and related parent/counselor routes render', () => {
  for (const route of [
    '/student/missions',
    '/student/exploration',
    '/student/research',
    '/student/journal',
    '/student/journal/signal',
    '/student/community',
    '/student/resources',
    '/student/profile?section=passport',
    '/student/conversations',
    '/student/testimonials',
    '/student/profile',
    '/student/profile/decisions',
    '/parent/conversations',
    '/counselor/home',
    '/counselor/students',
    '/counselor/students/s1',
    '/counselor/students/s1?section=progress',
    '/counselor/students/s1?section=instruments',
    '/counselor/students/s1?section=interests',
    '/counselor/students/s1?section=records',
    '/counselor/students/s1?section=journal',
    '/counselor/students/s1?section=family',
    '/counselor/students/s1?section=data',
    '/counselor/students/s1/records/s1-act-02-v1',
    '/counselor/students/s1/family-records/act-p03-1',
    '/counselor/reviews',
    '/counselor/publications',
    '/counselor/priorities',
  ]) {
    assert.ok(render(route).length > 100, route)
  }
})
test('counselor v2 screens expose the revised controls and terminology', () => {
  const home = render('/counselor/home')
  assert.match(home, /Avance por bloque/)
  assert.doesNotMatch(home, /Atasco|Mejor/)

  const students = render('/counselor/students')
  assert.match(students, /En observaci.{1,3}n/)
  assert.match(students, /Acciones/)
  assert.doesNotMatch(students, />Alertas</)

  const publications = render('/counselor/publications')
  assert.match(publications, />Publicaciones</)
  assert.match(publications, />Entrevistas</)
  assert.doesNotMatch(publications, />Disponibilidad</)
  assert.doesNotMatch(publications, /Borrador/)

  const priorities = render('/counselor/priorities')
  assert.match(priorities, /Configuraci.{1,3}n de actividades/)
  assert.match(priorities, /Editar actividades/)
  assert.match(priorities, /type="checkbox"/)
  assert.doesNotMatch(priorities, />Prioritaria</)

  const instruments = render('/counselor/students/s1?section=instruments')
  assert.ok(instruments.indexOf('Tests de Me conozco') < instruments.indexOf('Cuestionario de entrada'))
  const journal = render('/counselor/students/s1?section=journal')
  assert.match(journal, /El contenido del diario es privado/)
  assert.match(journal, /Check-in de seguridad/)

  const interests = render('/counselor/students/s1?section=interests')
  assert.match(interests, /RIASEC/)
  assert.match(interests, /Ocupaciones de inter/)
  assert.match(interests, /Instituciones de inter/)
  assert.match(interests, /Acciones para Enfermer/)

  const family = render('/counselor/students/s1?section=family')
  assert.match(family, /Actividades del apoderado/)
  assert.match(family, /Registros/)
  assert.match(family, /Conversaciones/)
  assert.match(family, /Apoderado/)
  assert.match(render('/counselor/students/s3?section=family'), /No se ha registrado ning/)

  const familyRecord = render('/counselor/students/s1/family-records/act-p03-1')
  assert.match(familyRecord, /Pregunta para estudiante/)
  assert.match(familyRecord, /Pregunta para apoderado/)
  assert.match(familyRecord, /únicamente de consulta/)

  const progress = render('/counselor/students/s1?section=progress')
  assert.match(progress, /Por bloque/)
  assert.match(progress, /Por tipo/)
  assert.match(progress, /Registros prioritarios/)
  assert.match(progress, /Registros observados/)
  assert.match(progress, /ltimas 5 semanas/)
  assert.doesNotMatch(progress, />Registros<\/button>/)

  const record = render('/counselor/students/s1/records/s1-act-02-v1')
  assert.match(record, /tem 1/)
  assert.match(record, /Observar y sugerir rehacer/)
  assert.doesNotMatch(record, /Está bien/)

  const observedRecord = render('/counselor/students/s3/records/s3-act-06-v1')
  assert.match(observedRecord, /Quitar observación/)
  assert.doesNotMatch(observedRecord, /Observar y sugerir rehacer/)

  const data = render('/counselor/students/s1?section=data')
  assert.match(data, /Promoci/)
  assert.match(data, /Grado y secci/)
  assert.match(data, /Fecha de primer acceso/)
  assert.match(data, /Datos de apoderados/)
})
test('review mode renders every mission, city and research destination unlocked initially', () => {
  const html = render('/student/missions')
  assert.match(html, /El inicio del viaje/)
  assert.doesNotMatch(html, /Las huellas que traigo, bloqueado/)
  assert.doesNotMatch(html, /La llave de la ciudad, bloqueado/)
  assert.match(render('/student/exploration'), /Estación de investigación/)
  assert.match(render('/student/research'), /Selecciona una carrera/)
})
test('the city and research station render after the actual mission requirement', () => {
  const patch = { completedMissionIds: fieldMissions.map((item) => item.id) }
  assert.match(render('/student/exploration', patch), /Estación de investigación/)
  assert.match(render('/student/research', patch), /Selecciona una carrera/)
})
test('guide stays collapsed until its help button is activated', () => {
  const html = render('/student/missions')
  assert.match(html, /aria-label="Abrir guía"/)
  assert.doesNotMatch(html, /role="dialog"/)
})
test('student routes have no sidebar and modules have a return button and header help', () => {
  const routes = [
    '/student/missions',
    '/student/exploration',
    '/student/research',
    '/student/journal',
    '/student/journal/signal',
    '/student/community',
    '/student/resources',
    '/student/profile?section=passport',
    '/student/conversations',
    '/student/testimonials',
    '/student/catalog/professions',
    '/student/catalog/careers',
    '/student/catalog/institutions',
    '/student/profile',
    '/student/profile/decisions',
  ]
  for (const route of routes) {
    const html = render(route)
    assert.match(html, /aria-label="Abrir guía"/, route)
    assert.doesNotMatch(html, /data-sidebar="sidebar"/, route)
    if (route !== '/student/missions' && route !== '/student/exploration') {
      assert.match(html, /Volver al mapa/, route)
      assert.match(html, /sx-module-header/, route)
      assert.doesNotMatch(html, /pointer-events-none fixed inset-0/, route)
    }
    assert.doesNotMatch(html, /aria-label="Abrir guía" class="[^"]*w-full/, route)
  }
})
test('student shell returns to the last visited zone and preserves module navigation', () => {
  const ui = load(path.resolve('src/features/student-experience/ui-state.ts'))
  try {
    ui.updateStudentUi(current => ({ ...current, lastMap: 'central' }))
    const html = render('/student/catalog/careers')
    assert.match(html, /href="\/student\/exploration"[^>]*><[^>]*[\s\S]*?Volver al mapa/)
    assert.match(html, /Ingeniería Ambiental/)
    assert.match(html, /aria-label="Menú de Alex"/)
    assert.doesNotMatch(html, /role="dialog"/)
    ui.updateStudentUi(current => ({ ...current, lastMap: 'missions' }))
    assert.match(render('/student/research'), /href="\/student\/missions"/)
    assert.match(render('/student/profile/decisions'), /aria-label="Secciones de mi perfil"/)
    assert.doesNotMatch(render('/student/profile'), /class="sx-module-tabs"/)
  } finally {
    ui.updateStudentUi(() => ui.initialStudentUiState())
  }
})

test('completed v2 missions synchronize in field order without duplicates or mutations', () => {
  const { getMissionsToSync, specActivityByMission } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const adventure = store.createInitialAdventure()
  adventure.completedMissionIds = ['welcome', 'story']
  const journey = journeyLogic.initialJourney()
  for (const mission of [...fieldMissions].reverse()) {
    const activityId = specActivityByMission[mission.id]
    journey.progress[activityId] = { actividadId: activityId, estado: 'completada' }
  }
  journey.progress['unrelated-activity'] = { actividadId: 'unrelated-activity', estado: 'completada' }
  journey.progress['mission-future'].estado = 'en_curso'
  const before = JSON.stringify({ adventure, journey })
  const missing = getMissionsToSync(adventure, journey)
  assert.deepEqual(Array.from(missing), Array.from(fieldMissions).filter(mission => !['welcome', 'story', 'future'].includes(mission.id)).map(mission => mission.id))
  assert.equal(JSON.stringify({ adventure, journey }), before)
  adventure.completedMissionIds.push(...missing)
  assert.equal(getMissionsToSync(adventure, journey).length, 0)
  journey.progress['mission-future'].estado = 'completada'
  assert.deepEqual(Array.from(getMissionsToSync(adventure, journey)), ['future'])
})

test('student presentation preferences validate storage, survive failures and refresh across tabs', () => {
  const file = path.resolve('src/features/student-experience/ui-state.ts')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const { studentViews } = load(path.resolve('src/features/student-experience/views.ts'))
  let raw = '{broken'
  let failRead = false
  let failWrite = false
  let lastKey
  let storageListener
  let notifications = 0
  const isolated = vm.createContext({
    window: { addEventListener: (name, listener) => { assert.equal(name, 'storage'); storageListener = listener } },
    localStorage: {
      getItem: key => { assert.equal(key, 'ov.student-ui.v1'); if (failRead) throw new Error('blocked'); return raw },
      setItem: (key, value) => { lastKey = key; if (failWrite) throw new Error('full'); raw = value },
    },
  })
  const exports = {}
  const require = name => {
    if (name === 'react') return { useSyncExternalStore: (subscribe, snapshot) => { subscribe(() => notifications++); return snapshot() } }
    if (name === './views') return { studentViews }
    throw new Error(`Unexpected import: ${name}`)
  }
  vm.runInContext(`(function(require,exports){${js}\n})`, isolated)(require, exports)
  assert.equal(exports.useStudentUi().lastMap, 'missions')
  exports.updateStudentUi(current => ({ ...current, lastMap: 'central', panelCollapsed: true, soundOn: false }))
  assert.equal(lastKey, 'ov.student-ui.v1')
  assert.equal(JSON.parse(raw).lastMap, 'central')
  assert.equal(notifications, 1)
  raw = JSON.stringify({ version: 1, lastMap: 'central', panelCollapsed: true, soundOn: false, introsSeen: { research: true, unknown: true, journal: 'true' }, seenUnlockIds: ['city', 'city', 123], announcedBadgeCodes: ['I1'], checkInPromptDismissedOn: '2026-10-03' })
  storageListener({ key: 'other-key' })
  assert.equal(notifications, 1)
  storageListener({ key: 'ov.student-ui.v1' })
  const hydrated = exports.useStudentUi()
  assert.equal(hydrated.lastMap, 'central')
  assert.equal(hydrated.panelCollapsed, true)
  assert.equal(hydrated.soundOn, false)
  assert.equal(JSON.stringify(hydrated.introsSeen), '{"research":true}')
  assert.equal(JSON.stringify(hydrated.seenUnlockIds), '["city"]')
  assert.equal(hydrated.checkInPromptDismissedOn, '2026-10-03')
  failWrite = true
  exports.updateStudentUi(current => ({ ...current, lastMap: 'missions' }))
  assert.equal(exports.useStudentUi().lastMap, 'missions')
  assert.equal(JSON.parse(raw).lastMap, 'central')
  raw = '{"version":2,"lastMap":"central"}'
  storageListener({ key: null })
  assert.equal(exports.useStudentUi().lastMap, 'missions')
  failRead = true
  storageListener({ key: 'ov.student-ui.v1' })
  assert.equal(exports.useStudentUi().soundOn, true)
})

test('adventure keeps the original mission route and switches between path and city', () => {
  const missions = render('/student/missions')
  assert.match(missions, /Nivel de recorrido/)
  assert.match(missions, /El inicio del viaje/)
  assert.match(missions, /Informativa · 4 min/)
  assert.match(missions, /Test · 6 min/)
  assert.match(missions, /Cambiar zona de la aventura/)
  for (const label of ['Alejar mapa', 'Acercar mapa', 'Centrar mapa']) assert.match(missions, new RegExp(`aria-label="${label}"`))
  assert.doesNotMatch(missions, /Arrastra el lienzo para explorar/)
  const city = render('/student/exploration')
  assert.match(city, /Satisfacción de las personas/)
  assert.match(city, /Una vuelta por el molino/)
  assert.match(city, /Test · Interacción 1 de 14/)
  assert.match(city, /Cambiar zona de la aventura/)
  const source = readFileSync(path.resolve('src/components/AdventureMap.tsx'), 'utf8')
  assert.doesNotMatch(source, /onWheel|preventDefault/)
})
test('immersive maps expose the panel, recommendations and one block sign', () => {
  const missions = render('/student/missions')
  for (const label of ['Siguiente paso', 'Tu señal de hoy', 'Accesos rápidos', 'Tramo 1']) assert.match(missions, new RegExp(label))
  assert.equal((missions.match(/Tramo 1/g) ?? []).length, 1)
  assert.match(missions, /aria-label="Plegar panel"/)
  assert.match(missions, /aria-label="Abrir panel"/)
  assert.match(missions, /aria-label="Silenciar" aria-pressed="true"/)
  assert.match(missions, /data-recommended="true"/)
  assert.match(render('/student/exploration'), /Satisfacción de las personas/)
})

test('new map canvases draw segments only on the path, with completion and frontier styles', () => {
  const { MapCanvas } = load(path.resolve('src/features/student-experience/map/MapCanvas.tsx'))
  const { getCaminoPoints } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const journey = journeyLogic.initialJourney()
  journey.progress['mission-welcome'] = { estado: 'completada' }
  journey.progress['mission-story'] = { estado: 'completada' }
  const points = getCaminoPoints(store.createInitialAdventure(), journey)
  const props = { points, panelOpen: false, onSelect() {}, onScaleChange() {}, backgroundImage: '/images/adventure/journey-map.jpeg', label: 'Mapa de prueba' }
  const route = renderToStaticMarkup(React.createElement(MapCanvas, { ...props, variant: 'route' }))
  const city = renderToStaticMarkup(React.createElement(MapCanvas, { ...props, variant: 'open' }))
  assert.equal((route.match(/data-map-segment=/g) ?? []).length, points.length - 1)
  assert.match(route, /data-map-segment="completed"[^>]*stroke="var\(--success\)"/)
  assert.match(route, /data-map-segment="frontier"[^>]*stroke="var\(--sx-lumi\)"[^>]*stroke-dasharray="18 22"/)
  assert.match(route, /stroke-dasharray="18 22"/)
  assert.doesNotMatch(city, /data-map-segment=|sx-map-path|sx-block-sign/)
  assert.match(route, /sx-node-completed[^>]*[\s\S]*?lucide-book-open/)
})

test('student point calculations preserve progress, recommendations and every drawer action', () => {
  const { getCaminoPoints, getCiudadPoints, getZoneProgress, getRecommendedPoint, getPointDetails } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const adventure = store.createInitialAdventure()
  const journey = journeyLogic.initialJourney()
  adventure.completedMissionIds = []
  adventure.solvedCaseIds = ['forest-fire', 'river-mystery']
  const points = getCaminoPoints(adventure, journey)
  assert.equal(getZoneProgress('missions', adventure, journey).value, 0)
  assert.equal(getZoneProgress('central', adventure, journey).value, 33)
  assert.equal(getRecommendedPoint(points).id, 'welcome')
  const welcome = points.find(point => point.id === 'welcome')
  assert.equal(getPointDetails(welcome, adventure, journey).actionLabel, 'Iniciar actividad')
  journey.progress['mission-welcome'] = { estado: 'en_curso' }
  assert.equal(getPointDetails(welcome, adventure, journey).actionLabel, 'Continuar actividad')
  assert.equal(getPointDetails(welcome, adventure, journey).badge, 'En progreso')
  journey.progress['mission-welcome'].estado = 'completada'
  const completed = getCaminoPoints(adventure, journey)
  const replay = getPointDetails(completed[0], adventure, journey)
  assert.equal(replay.actionLabel, 'Volver a realizar esta misión')
  assert.equal(replay.revision, true)
  assert.equal(replay.journal.completed, true)
  assert.equal(getZoneProgress('missions', adventure, journey).value, 12.5)
  assert.equal(getRecommendedPoint(completed).id, 'story')
  const locked = getPointDetails({ ...completed[1], status: 'locked' }, adventure, journey)
  assert.equal(locked.actionLabel, 'Actividad bloqueada')
  assert.equal(locked.disabled, true)
  assert.match(locked.requirement, /El inicio del viaje/)
  const review = getPointDetails({ ...completed[1], status: 'completed' }, adventure, journey)
  assert.equal(review.actionLabel, 'Ver o modificar mis respuestas')
  assert.equal(getPointDetails(points.at(-1), adventure, journey).href, '/student/exploration')
  const city = getCiudadPoints(adventure, journey)
  assert.equal(getRecommendedPoint(city).id, 'research')
  assert.equal(getPointDetails(city.find(point => point.id === 'research'), adventure, journey).href, '/student/research')
  const fire = getPointDetails(city.find(point => point.id === 'forest-fire'), adventure, journey)
  assert.equal(fire.href, '/student/cases/forest-fire')
  assert.equal(fire.disabled, false)
  assert.equal(getPointDetails(city.find(point => point.id === 'river-mystery'), adventure, journey).disabled, true)
  const mill = city.find(point => point.id === 'mara-test')
  assert.equal(getPointDetails(mill, adventure, journey).actionLabel, 'Iniciar test')
  assert.equal(getPointDetails({ ...mill, status: 'completed' }, adventure, journey).actionLabel, 'Ver resumen')
  assert.equal(getRecommendedPoint(completed.map(point => ({ ...point, status: point.id === 'city' ? 'available' : 'completed' }))).id, 'city')
})

test('map zoom preserves its cursor anchor, respects bounds and focuses beside the open panel', () => {
  const { minScale, maxScale, clampTransform, zoomTransform, focusTransform, visibleCenter, mapPosition } = load(path.resolve('src/features/student-experience/map/geometry.ts'))
  const bounds = { width: 1280, height: 752 }
  const current = { x: -400, y: -200, scale: .8 }
  const cursor = { x: 700, y: 320 }
  const zoomed = zoomTransform(current, .88, cursor, bounds)
  assert.ok(Math.abs((cursor.x - current.x) / current.scale - (cursor.x - zoomed.x) / zoomed.scale) < .00001)
  assert.ok(Math.abs((cursor.y - current.y) / current.scale - (cursor.y - zoomed.y) / zoomed.scale) < .00001)
  assert.equal(zoomTransform(current, 99, cursor, bounds).scale, maxScale)
  assert.equal(zoomTransform(current, .01, cursor, bounds).scale, minScale)
  const clamped = clampTransform({ x: 9999, y: -9999, scale: .8 }, bounds, true)
  assert.equal(clamped.x, 304)
  assert.equal(clamped.y, bounds.height - 1519 * .8)
  const point = { x: 590, y: 290 }
  const position = mapPosition(point)
  const focused = focusTransform(current, point, bounds, true)
  assert.ok(Math.abs(focused.x + position.x * focused.scale - visibleCenter(bounds, true).x) < .00001)
  assert.ok(Math.abs(focused.y + position.y * focused.scale - bounds.height / 2) < .00001)
  const source = readFileSync(path.resolve('src/features/student-experience/map/MapCanvas.tsx'), 'utf8')
  assert.match(source, /addEventListener\('wheel', wheel, \{ passive: false \}\)/)
  assert.match(source, /removeEventListener\('wheel', wheel\)/)
})

test('real access conditions lock successive missions and expose the city gate without changing review mode', () => {
  const file = path.resolve('src/features/student-experience/map/mapPoints.ts')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  const require = name => {
    if (name === '@/features/occupation-exploration/lib/AdventureStore') return { ...store, prototypeAllUnlocked: false, canAccessCity: store.isCityUnlocked }
    if (!name.startsWith('@/')) return nativeRequire(name)
    return load(path.resolve('src', `${name.slice(2)}.ts`))
  }
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(require, exports)
  const adventure = store.createInitialAdventure()
  adventure.completedMissionIds = []
  const journey = journeyLogic.initialJourney()
  const locked = exports.getCaminoPoints(adventure, journey)
  assert.equal(locked[0].status, 'available')
  assert.ok(locked.slice(1).every(point => point.status === 'locked'))
  assert.match(exports.getPointDetails(locked[1], adventure, journey).requirement, /El inicio del viaje/)
  journey.progress['mission-welcome'] = { estado: 'completada' }
  const advanced = exports.getCaminoPoints(adventure, journey)
  assert.equal(advanced[0].status, 'completed')
  assert.equal(advanced[1].status, 'available')
  assert.equal(advanced[2].status, 'locked')
  assert.match(exports.getReturnGreeting({ ...adventure, visits: ['2026-09-29'] }, advanced[1], new Date('2026-10-03T17:00:00Z')), /La ciudad sigue esperándote al final del camino\./)
  const { CityLocked } = load(path.resolve('src/features/student-experience/map/CityLocked.tsx'))
  const gate = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(CityLocked, { adventure })))
  assert.match(gate, /Capítulo 2 · La ciudad/)
  assert.match(gate, /Una llave, mil posibilidades/)
  assert.match(gate, /Continuar mi recorrido/)
  const { ZoneSwitch } = load(path.resolve('src/features/student-experience/map/ZoneSwitch.tsx'))
  const switcher = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(ZoneSwitch, { zone: 'missions', cityOpen: false, onCityLocked() {} })))
  assert.match(switcher, /aria-disabled="true"/)
  assert.equal(store.prototypeAllUnlocked, true)
})

test('new activity drawer composes shared primitives without embedded case questions', () => {
  const source = readFileSync(path.resolve('src/features/student-experience/map/ActivityDrawer.tsx'), 'utf8')
  assert.match(source, /from '@\/components\/ui\/drawer'/)
  assert.match(source, /<DrawerClose asChild>/)
  assert.match(source, /aria-label="Cerrar ficha"/)
  assert.match(source, /overflow-x-hidden/)
  assert.doesNotMatch(source, /type="checkbox"|Confirmar equipo/)
})

test('return greeting uses the previous Lima visit and never reproaches absences', () => {
  const { getReturnGreeting, getCaminoPoints } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const adventure = store.createInitialAdventure()
  const point = getCaminoPoints(adventure, journeyLogic.initialJourney())[0]
  const now = new Date('2026-10-03T17:00:00Z')
  adventure.visits = ['2026-09-28', '2026-09-30', '2026-10-03']
  assert.match(getReturnGreeting(adventure, point, now), /¡Qué bueno verte de nuevo! Te espera El inicio del viaje\./)
  adventure.visits.push('2026-10-02')
  assert.equal(getReturnGreeting(adventure, point, now), undefined)
  assert.equal(getReturnGreeting(adventure, undefined, now), undefined)
})

test('the passport lives inside the profile with five narrative levels and grouped badges', () => {
  const html = render('/student/profile?section=passport')
  assert.match(html, /Pasaporte vocacional/)
  assert.match(html, /Nivel 1 de 5/)
  assert.match(html, /Observador del horizonte/)
  assert.match(html, /I1/)
  assert.match(html, /I9/)
  assert.match(html, /Pulsa una insignia para descubrir la historia que guarda/)
  const menu = render('/student/missions')
  assert.doesNotMatch(menu, />Mi pasaporte<\/span>/)
})
test('only field missions connect their map points with a route', () => {
  const props = {
    points: [],
    onSelect() {},
    label: 'Mapa de prueba',
    backgroundImage: '/images/adventure/test-map.jpeg',
    progress: { icon: React.createElement('span'), label: 'Progreso', value: 0 },
  }
  const missions = renderToStaticMarkup(React.createElement(AdventureMap, { ...props, variant: 'route' }))
  const cases = renderToStaticMarkup(React.createElement(AdventureMap, { ...props, variant: 'open' }))
  assert.match(missions, /<polyline[^>]+stroke-dasharray="18 22"/)
  assert.doesNotMatch(cases, /<polyline/)
  assert.match(missions, /test-map\.jpeg/)
})
test('map details use the shadcn drawer and expose a close button', () => {
  const source = readFileSync(path.resolve('src/components/MapPointDrawer.tsx'), 'utf8')
  assert.match(source, /from '@\/components\/ui\/drawer'/)
  assert.match(source, /<DrawerClose asChild>/)
  assert.match(source, /aria-label="Cerrar ficha"/)
  assert.match(source, /overflow-x-hidden/)
})
test('case drawers contain only the start action and no embedded questions', () => {
  const source = readFileSync(path.resolve('src/features/occupation-exploration/CityMapView.tsx'), 'utf8')
  assert.match(source, /<Play \/> Iniciar/)
  assert.doesNotMatch(source, /¿A quiénes convocarías\?|type="checkbox"|Confirmar equipo/)
})
test('family answer remains hidden until the student submits their own answer', () => {
  const patch = {
    conversations: [{ id: 'work-trends', parent: 'Respuesta reservada de familia' }],
  }
  assert.doesNotMatch(render('/student/conversations', patch), /Respuesta reservada de familia/)
  patch.conversations[0].student = 'Mi propia respuesta'
  const ready = render('/student/conversations', patch)
  assert.match(ready, /Listos para conversar/)
  assert.doesNotMatch(ready, /Respuesta reservada de familia/)
})
test('family dashboard has four personal states, progress and no streak or deadline mechanics', () => {
  const html = render('/parent/conversations')
  for (const label of ['Te toca responder', 'Esperando respuesta', 'Listos para conversar', 'Conversados']) {
    assert.match(html, new RegExp(label))
  }
  assert.match(html, /Un regalo para el final/)
  assert.match(html, /1 de 5 temas conversados/)
  assert.match(html, /Visualizar regalo/)
  assert.doesNotMatch(html, /racha|semanas en compañía|fecha límite|se vence/i)
})
test('student resources open with discoveries before posts and events', () => {
  const html = render('/student/resources')
  assert.match(html, /Descubrimientos/)
  assert.match(html, /Tu mochila está lista/)
  assert.match(html, /Publicaciones/)
  assert.match(html, /Eventos/)
  assert.ok(html.indexOf('Descubrimientos') < html.indexOf('Publicaciones'))
})
test('family demo data covers shared and role-specific questions', () => {
  assert.ok(familyConversationTopics.some((topic) => topic.prompts.student === topic.prompts.parent))
  assert.ok(familyConversationTopics.some((topic) => topic.prompts.student !== topic.prompts.parent))
  assert.deepEqual(
    [...familyConversationDemoData.map((item) => item.id)].sort(),
    ['shared-future', 'strengths', 'support', 'uncertainty'].sort(),
  )
})
test('journal entries never enter the classroom or crew feed', () => {
  const journal = ['una', 'dos', 'tres'].map((id) => ({
    id,
    title: `Título ${id}`,
    body: `Contenido privado ${id}`,
    kind: 'open',
    createdAt: new Date().toISOString(),
    topicTags: [],
  }))
  const html = render('/student/community', { journal })
  assert.doesNotMatch(html, /Contenido privado/)
})
test('the counselor sees readiness trends without diary text', () => {
  const html = render('/counselor/students/s1?section=journal', {
    journal: [
      {
        id: 'secret',
        title: 'Entrada privada',
        body: 'Este texto jamás debe aparecer para la orientadora',
        kind: 'open',
        createdAt: new Date().toISOString(),
        topicTags: ['privado'],
      },
    ],
    readinessCheckIns: [
      { id: 'one', createdAt: '2026-08-01T10:00:00.000Z', value: 2 },
      { id: 'two', createdAt: '2026-09-01T10:00:00.000Z', value: 2 },
    ],
  })
  assert.match(html, /Seguridad vocacional/)
  assert.match(html, /El contenido del diario es privado del estudiante/)
  assert.doesNotMatch(html, /Este texto jamás debe aparecer/)
})
test('journal home supports topics and keeps readiness separate from entries', () => {
  const html = render('/student/journal', { journalOnboardingSeen: true })
  assert.match(html, /Línea de tiempo/)
  assert.match(html, /Por tema/)
  assert.match(html, /Buscar por tema/)
  assert.match(html, /Solo tú puedes leer este espacio/)
  assert.match(html, /Tu señal de hoy/)
  assert.match(html, /Qué tan seguro te sientes hoy de tu próximo paso/i)
  assert.match(html, /Tema del día/)
  assert.match(html, /Pulsa aquí para registrarla/)
  assert.match(html, /Ver historial/)
  const source = readFileSync(
    path.resolve('src/features/occupation-exploration/components/PostActivityJournalSheet.tsx'),
    'utf8',
  )
  assert.match(source, /readinessCheckIns/)
  assert.match(source, /journal: entry/)
  assert.match(source, /Omitir por ahora/)
})
test('signal history uses a ten-point line chart and links points to private entries', () => {
  const html = render('/student/journal/signal', { journalOnboardingSeen: true })
  assert.match(html, /Mi diario/)
  assert.match(html, /Señales/)
  assert.match(html, /Historial de señales/)
  assert.match(html, /Escala del 1 al 10/)
  assert.match(html, /polyline/)
  assert.match(html, /Entradas del/)
  assert.match(html, /Solo tú puedes leerlas/)
  assert.ok((html.match(/de 10/g) ?? []).length >= 10)
  assert.match(html, /Todavía tengo dudas, pero decidí preparar tres preguntas para la feria/)
})
test('moderation hides reported content from the classroom feed', () => {
  const html = render('/student/community', {
    reports: [
      {
        id: 'r',
        postId: 'class-rio',
        body: 'report',
        reason: '',
        status: 'hidden',
        createdAt: new Date().toISOString(),
      },
    ],
  })
  assert.doesNotMatch(html, /Me gustaría conversar con alguien que trabaje cuidando la naturaleza/)
})

const journeyStore = load(path.resolve('src/features/missions/store.ts'))
const journeyLogic = load(path.resolve('src/features/missions/logic.ts'))
const journeyContent = load(path.resolve('src/features/missions/content.ts'))

test('every supplied mission node renders, including matrices, slides, questions and instrument items', () => {
  for (const activity of journeyContent.activities) {
    for (const node of activity.nodos) {
      journeyStore.updateJourney(() => ({
        ...journeyLogic.initialJourney(),
        progress: {
          'act-06': { estudianteId: 'est-prototipo', actividadId: 'act-06', estado: 'completada' },
          [activity.id]: {
            estudianteId: 'est-prototipo',
            actividadId: activity.id,
            estado: 'en_curso',
            nodoActualId: node.id,
          },
        },
      }))
      const route = activity.id === 'act-tip-01' ? '/student/exploration' : '/student/missions'
      const html = render(`${route}?actividad=${activity.id}`)
      assert.ok(html.includes(activity.titulo), `${activity.id}/${node.id}`)
      assert.match(html, /aria-label="Salir de la actividad"/)
      assert.match(html, /fixed inset-0 z-40/)
      if (node.tipo === 'item') assert.match(html, /No hay respuestas correctas o incorrectas/)
      if (node.tipo === 'diapositiva') assert.match(html, /Entendido/)
      if (node.tipo === 'consigna' && activity.plantilla?.tipo === 'matriz') {
        assert.match(html, /1 año después del colegio/)
        assert.match(html, /Quién quiero ser/)
        assert.match(html, /0 de 7 entregas necesarias guardadas/)
      }
    }
  }
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('direct instrument route starts on the official first item and omits Mara dialogue', () => {
  const html = render('/student/exploration?actividad=act-tip-01&modo=directa')
  assert.match(html, /Aceptarías trabajar escribiendo artículos/)
  assert.doesNotMatch(html, /Soy Mara/)
  assert.doesNotMatch(html, /¿Qué le dirías/)
})

test('journal links open a prompted activity entry directly', () => {
  const html = render(
    '/student/journal?activity=act-06&title=Mi+mapa+de+ruta&prompt=%C2%BFQu%C3%A9+cambi%C3%B3%3F',
  )
  assert.match(html, /¿Qué cambió\?/)
  assert.match(html, /Texto privado de la entrada/)
})

test('saved resources and counselor submissions appear in their respective destinations', () => {
  journeyStore.updateJourney(() => ({
    ...journeyLogic.initialJourney(),
    resources: ['ficha-mitos'],
    submissions: [
      {
        id: 'submission-1',
        estudianteId: 'est-prototipo',
        actividadId: 'enc-mitos',
        nodoId: 'e22',
        contenido: { tipo: 'texto', texto: 'Consejo de ejemplo compartido con orientación.' },
        version: 1,
        enviadoEn: '2026-09-26T12:00:00Z',
      },
    ],
  }))
  const resources = render('/student/resources')
  assert.match(resources, /Ficha: Mitos y realidades del futuro profesional/)
  assert.match(resources, /Ver ficha completa/)
  assert.match(resources, /Agregar a favoritos/)
  assert.doesNotMatch(resources, /No visto|Visto/)
  assert.match(render('/counselor/reviews'), /Registros observados/)
  assert.doesNotMatch(render('/parent/activities'), /Consejo de ejemplo compartido con orientación/)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})
