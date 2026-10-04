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
test('presentation locks pending path missions while prototype city and research stay accessible', () => {
  const html = render('/student/missions')
  assert.match(html, /El inicio del viaje/)
  assert.match(html, /Las huellas que traigo, bloqueado/)
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
  assert.match(missions, /Cambiar zona de la aventura/)
  for (const label of ['Alejar mapa', 'Acercar mapa', 'Centrar mapa']) assert.match(missions, new RegExp(`aria-label="${label}"`))
  assert.doesNotMatch(missions, /Arrastra .*para explorar/)
  const city = render('/student/exploration')
  assert.match(city, /Afinidad con la ciudad/)
  assert.match(city, /role="progressbar" aria-label="Afinidad con la ciudad"/)
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
  assert.match(render('/student/exploration'), /Afinidad con la ciudad/)
})

test('new map canvases draw segments only on the path, with completion and frontier styles', () => {
  const { MapCanvas } = load(path.resolve('src/features/student-experience/map/MapCanvas.tsx'))
  const { getCaminoPoints } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const journey = journeyLogic.initialJourney()
  journey.progress['mission-welcome'] = { estado: 'completada' }
  journey.progress['enc-mitos'] = { estado: 'completada' }
  const points = getCaminoPoints(store.createInitialAdventure(), journey)
  const props = { points, panelOpen: false, onSelect() {}, onScaleChange() {}, backgroundImage: '/images/adventure/journey-map.png', label: 'Mapa de prueba' }
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
  assert.equal(getRecommendedPoint(completed).id, 'beliefs')
  const locked = getPointDetails({ ...completed[1], status: 'locked' }, adventure, journey)
  assert.equal(locked.actionLabel, 'Actividad bloqueada')
  assert.equal(locked.disabled, true)
  assert.match(locked.requirement, /El inicio del viaje/)
  const review = getPointDetails({ ...completed[2], status: 'completed' }, adventure, journey)
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
  const { getMinimumScale, canvasSize, maxScale, clampTransform, zoomTransform, focusTransform, visibleCenter, mapPosition } = load(path.resolve('src/features/student-experience/map/geometry.ts'))
  const bounds = { width: 1280, height: 752 }
  const current = { x: -400, y: -200, scale: .8 }
  const cursor = { x: 700, y: 320 }
  const zoomed = zoomTransform(current, .88, cursor, bounds)
  assert.ok(Math.abs((cursor.x - current.x) / current.scale - (cursor.x - zoomed.x) / zoomed.scale) < .00001)
  assert.ok(Math.abs((cursor.y - current.y) / current.scale - (cursor.y - zoomed.y) / zoomed.scale) < .00001)
  assert.equal(zoomTransform(current, 99, cursor, bounds).scale, maxScale)
  assert.equal(zoomTransform(current, .01, cursor, bounds).scale, getMinimumScale(bounds))
  const clamped = clampTransform({ x: 9999, y: -9999, scale: .8 }, bounds)
  assert.equal(clamped.x, 0)
  assert.equal(clamped.y, bounds.height - canvasSize.height * .8)
  const point = { x: 590, y: 290 }
  const position = mapPosition(point)
  const focused = focusTransform(current, point, bounds, true)
  assert.ok(Math.abs(focused.x + position.x * focused.scale - visibleCenter(bounds, true).x) < .00001)
  assert.ok(Math.abs(focused.y + position.y * focused.scale - bounds.height / 2) < .00001)
  const firstPoint = focusTransform({ x: 0, y: 0, scale: .55 }, { x: 130, y: 140 }, bounds, true)
  assert.ok(firstPoint.x + mapPosition({ x: 130, y: 140 }).x * firstPoint.scale > 304)
  assert.equal(firstPoint.scale, .55)
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

test('student overlay queue prioritizes real city arrival, section introductions and the daily signal', () => {
  const { getNextOverlay } = load(path.resolve('src/features/student-experience/overlays/overlay-context.ts'))
  const { initialStudentUiState } = load(path.resolve('src/features/student-experience/ui-state.ts'))
  const { studentViews } = load(path.resolve('src/features/student-experience/views.ts'))
  const adventure = store.createInitialAdventure()
  adventure.completedMissionIds = []
  adventure.readinessCheckIns = []
  const ui = initialStudentUiState()
  const now = new Date('2026-10-04T04:30:00Z')
  const args = { adventure, ui, view: 'missions', activityOpen: false, now }
  assert.equal(getNextOverlay(args).kind, 'intro') // Review mode does not announce a real unlock.
  adventure.completedMissionIds = fieldMissions.map(mission => mission.id)
  assert.equal(getNextOverlay(args).kind, 'arrival')
  assert.equal(getNextOverlay({ ...args, activityOpen: true }), null)
  assert.equal(getNextOverlay({ ...args, arrivalDismissed: true }).kind, 'intro')
  ui.cityArrivalSeen = true
  for (const view of studentViews) {
    assert.equal(getNextOverlay({ ...args, view }).view, view)
    ui.introsSeen[view] = true
    assert.equal(getNextOverlay({ ...args, view }).kind, 'check-in')
  }
  assert.equal(getNextOverlay(args).day, '2026-10-03')
  ui.checkInPromptDismissedOn = '2026-10-03'
  assert.equal(getNextOverlay(args), null)
  assert.equal(getNextOverlay({ ...args, now: new Date('2026-10-04T05:30:00Z') }).kind, 'check-in')
  adventure.readinessCheckIns.push({ id: 'today', value: 7, createdAt: now.toISOString(), linkedActivityId: 'daily-check-in' })
  ui.checkInPromptDismissedOn = undefined
  assert.equal(getNextOverlay(args), null)
  assert.equal(getNextOverlay({ ...args, activityOpen: true }), null)
})

test('student daily signal uses Lima dates and replaces the original registration without changing private entries', () => {
  const { getTodayCheckIn, saveTodayCheckIn, localDateKey } = load(path.resolve('src/features/student-experience/overlays/checkIn.ts'))
  assert.equal(localDateKey(new Date('2026-10-04T04:59:00Z')), '2026-10-03')
  assert.equal(localDateKey(new Date('2026-10-04T05:00:00Z')), '2026-10-04')
  const now = new Date()
  const original = { id: 'daily-original', createdAt: now.toISOString(), linkedActivityId: 'daily-check-in', value: 3 }
  const related = { id: 'activity-signal', createdAt: now.toISOString(), linkedActivityId: 'mission-welcome', value: 5 }
  const yesterday = { id: 'yesterday', createdAt: new Date(now.getTime() - 86400000).toISOString(), linkedActivityId: 'daily-check-in', value: 4 }
  store.updateAdventure(current => ({ ...current, readinessCheckIns: [related, yesterday, original] }))
  const journalBefore = JSON.stringify(store.useAdventure().journalEntries)
  saveTodayCheckIn(8)
  saveTodayCheckIn(9)
  const current = store.useAdventure()
  const edited = getTodayCheckIn(current)
  assert.equal(edited.id, original.id)
  assert.equal(edited.createdAt, original.createdAt)
  assert.equal(edited.value, 9)
  assert.equal(current.readinessCheckIns.length, 3)
  assert.equal(JSON.stringify(current.journalEntries), journalBefore)
  assert.equal(current.readinessCheckIns.find(signal => signal.id === related.id).value, 5)
  assert.equal(current.readinessCheckIns.find(signal => signal.id === yesterday.id).value, 4)
  const beforeInvalid = JSON.stringify(current.readinessCheckIns)
  for (const invalid of [0, 11, 4.5, NaN]) saveTodayCheckIn(invalid)
  assert.equal(JSON.stringify(store.useAdventure().readinessCheckIns), beforeInvalid)
  store.updateAdventure(current => ({ ...current, readinessCheckIns: [related, yesterday] }))
  saveTodayCheckIn(6)
  const first = getTodayCheckIn(store.useAdventure())
  assert.ok(first.id)
  saveTodayCheckIn(7)
  assert.equal(getTodayCheckIn(store.useAdventure()).id, first.id)
  assert.equal(store.useAdventure().readinessCheckIns.length, 3)
})

test('student signal panel offers registration or editing and retains evolution navigation', () => {
  const empty = render('/student/missions', { readinessCheckIns: [] })
  assert.match(empty, /Registrar mi señal/)
  assert.doesNotMatch(empty, />Cambiar</)
  const today = { id: 'current', createdAt: new Date().toISOString(), linkedActivityId: 'daily-check-in', value: 8 }
  const answered = render('/student/missions', { readinessCheckIns: [today] })
  assert.match(answered, /class="sx-panel-signal" aria-label="8 de 10"/)
  assert.match(answered, /<strong>8<\/strong><span>\/10<\/span>/)
  assert.match(answered, />Cambiar</)
  assert.match(answered, /class="sx-signal-edit"[\s\S]*?>Cambiar<\/button>/)
  assert.match(answered, /class="sx-signal-history" href="\/student\/journal\/signal"[\s\S]*?>Ver evolución<\/a>/)
  assert.doesNotMatch(answered, /Registrar mi señal/)
  assert.doesNotMatch(answered, /role="dialog"/)
})

test('typewriter advances at its configured pace, completes immediately and honors reduced motion', () => {
  const file = path.resolve('src/features/student-experience/overlays/useTypewriter.ts')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const states = [], effects = [], pending = [], timers = new Map(), mediaListeners = new Set()
  let stateIndex = 0, effectIndex = 0, timerId = 0
  const query = { matches: false, addEventListener: (_, listener) => mediaListeners.add(listener), removeEventListener: (_, listener) => mediaListeners.delete(listener) }
  const fakeReact = {
    useState(initial) {
      const i = stateIndex++
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value }]
    },
    useEffect(callback, dependencies) {
      const i = effectIndex++
      const old = effects[i]
      if (!old || dependencies.some((value, j) => !Object.is(value, old.dependencies[j]))) pending.push(() => {
        old?.cleanup?.()
        effects[i] = { dependencies, cleanup: callback() }
      })
    },
  }
  const exports = {}
  const hookContext = vm.createContext({ window: {
    matchMedia: () => query,
    setInterval: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id },
    clearInterval: id => timers.delete(id),
  } })
  vm.runInContext(`(function(require,exports){${js}\n})`, hookContext)(() => fakeReact, exports)
  const draw = (text, options) => {
    stateIndex = effectIndex = 0
    const result = exports.useTypewriter(text, options)
    pending.splice(0).forEach(effect => effect())
    return result
  }
  const tick = () => [...timers.values()].forEach(timer => timer.callback())
  assert.equal(draw('abcdef').visible, '')
  assert.equal([...timers.values()][0].delay, 24)
  tick()
  assert.equal(draw('abcdef').visible, 'ab')
  const partial = draw('abcdef')
  partial.complete()
  assert.equal(draw('abcdef').visible, 'abcdef')
  assert.equal(draw('abcdef').done, true)
  assert.equal(timers.size, 0)
  assert.equal(draw('nuevo').visible, '')
  tick()
  assert.equal(draw('nuevo').visible, 'nu')
  assert.equal(draw('nuevo', { enabled: false }).visible, 'nuevo')
  assert.equal(timers.size, 0)
  draw('corto', { charsPerTick: 1, tickMs: 10 })
  assert.equal([...timers.values()][0].delay, 10)
  tick()
  assert.equal(draw('corto', { charsPerTick: 1, tickMs: 10 }).visible, 'c')
  query.matches = true
  mediaListeners.forEach(listener => listener())
  assert.equal(draw('movimiento reducido').visible, 'movimiento reducido')
  assert.equal(draw('movimiento reducido').done, true)
  assert.equal(timers.size, 0)
  effects.forEach(effect => effect.cleanup?.())
  assert.equal(mediaListeners.size, 0)
})

test('mounted overlay queue opens from effects, remembers introductions and resumes after activity exit', () => {
  const file = path.resolve('src/features/student-experience/overlays/OverlayQueue.tsx')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const { initialStudentUiState } = load(path.resolve('src/features/student-experience/ui-state.ts'))
  let ui = initialStudentUiState()
  let adventure = { ...store.createInitialAdventure(), completedMissionIds: [], readinessCheckIns: [] }
  const states = [], effects = [], pending = []
  const destinations = []
  let stateIndex = 0, effectIndex = 0
  const fakeReact = {
    ...React,
    useMemo: factory => factory(),
    useState(initial) {
      const i = stateIndex++
      if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value }]
    },
    useEffect(callback, dependencies) {
      const i = effectIndex++
      if (!effects[i] || dependencies.some((value, j) => !Object.is(value, effects[i][j]))) {
        pending.push(callback)
        effects[i] = dependencies
      }
    },
  }
  const queueRequire = specifier => {
    if (specifier === 'react') return fakeReact
    if (specifier === 'react-router') return { useNavigate: () => destination => destinations.push(destination) }
    if (specifier.endsWith('/AdventureStore')) return { useAdventure: () => adventure }
    if (specifier === '../ui-state') return { useStudentUi: () => ui, updateStudentUi: update => { ui = update(ui) } }
    if (specifier === './checkIn') {
      const original = load(path.resolve('src/features/student-experience/overlays/checkIn.ts'))
      return { ...original, useCheckInDay: () => original.localDateKey(new Date()), saveTodayCheckIn: value => {
        adventure = { ...adventure, readinessCheckIns: [{ id: 'saved', value, createdAt: new Date().toISOString(), linkedActivityId: 'daily-check-in' }] }
      } }
    }
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return nativeRequire(specifier)
    const base = specifier.startsWith('@/') ? path.resolve('src', specifier.slice(2)) : path.resolve(path.dirname(file), specifier)
    return load([`${base}.tsx`, `${base}.ts`].find(existsSync))
  }
  const exports = {}
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(queueRequire, exports)
  const draw = (view = 'missions', activityOpen = false) => {
    stateIndex = effectIndex = 0
    const tree = exports.OverlayQueue({ view, activityOpen, children: 'page' })
    const result = { context: tree.props.value, lumi: tree.props.children[1].props, signal: tree.props.children[2].props }
    pending.splice(0).forEach(effect => effect())
    return result
  }
  assert.equal(draw().lumi.open, false)
  assert.equal(draw().lumi.open, true)
  draw().lumi.onClose()
  assert.equal(ui.introsSeen.missions, true)
  draw()
  assert.equal(draw().signal.open, true)
  draw().signal.onDismiss()
  draw()
  assert.equal(draw().signal.open, false)
  draw().context.openGuide(['Ayuda manual'])
  assert.equal(draw().lumi.steps[0], 'Ayuda manual')
  draw().lumi.onClose()
  assert.equal(draw().lumi.open, false)
  draw('resources', true)
  assert.equal(draw('resources', true).lumi.open, false)
  assert.equal(ui.introsSeen.resources, undefined)
  draw('resources', false)
  assert.equal(draw('resources').lumi.open, true)
  draw('resources').lumi.onClose()
  draw('resources')
  assert.equal(draw('resources').lumi.open, false)
  adventure = { ...adventure, completedMissionIds: fieldMissions.map(mission => mission.id) }
  draw('resources', true)
  assert.equal(draw('resources', true).lumi.open, false)
  draw('resources')
  assert.equal(draw('resources').lumi.finalLabel, 'Entrar a la ciudad')
  draw('resources').lumi.onClose()
  draw('resources')
  assert.equal(draw('resources').lumi.open, false)
  assert.equal(ui.cityArrivalSeen, false)
  states.length = effects.length = pending.length = 0 // Remount after closing arrival for this visit.
  assert.equal(draw('resources').lumi.open, false)
  assert.equal(draw('resources').lumi.finalLabel, 'Entrar a la ciudad')
  draw('resources').lumi.onFinish()
  draw('resources').lumi.onClose()
  assert.equal(ui.cityArrivalSeen, true)
  assert.equal(destinations[0], '/student/exploration')
  draw('resources')
  assert.equal(draw('resources').lumi.open, false)
  draw('resources').context.openCheckIn()
  assert.equal(draw('resources').signal.open, true)
  draw('resources').signal.onSave(8)
  draw('resources')
  assert.equal(draw('resources').signal.open, false)
  draw('resources').context.openCheckIn()
  assert.equal(draw('resources').signal.value, 8)
})

test('Lumi exposes the complete accessible text while its visible text starts progressively', () => {
  const file = path.resolve('src/features/student-experience/overlays/LumiOverlay.tsx')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const pass = ({ children }) => children
  const primitives = {
    Root: pass, Portal: pass,
    Overlay: ({ className }) => React.createElement('div', { className }),
    Content: ({ children, className, 'aria-label': label }) => React.createElement('div', { className, 'aria-label': label }, children),
    Title: ({ children, className }) => React.createElement('h2', { className }, children),
    Description: pass,
  }
  const exports = {}
  const require = specifier => {
    if (specifier === '@radix-ui/react-dialog') return primitives
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return nativeRequire(specifier)
    const base = specifier.startsWith('@/') ? path.resolve('src', specifier.slice(2)) : path.resolve(path.dirname(file), specifier)
    return load([`${base}.tsx`, `${base}.ts`].find(existsSync))
  }
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(require, exports)
  const text = 'Este texto completo debe llegar al lector de pantalla desde el primer instante.'
  const html = renderToStaticMarkup(React.createElement(exports.LumiOverlay, { open: true, steps: [text], onClose() {} }))
  assert.match(html, /<span aria-hidden="true"><\/span>/)
  assert.ok(html.includes(`<span class="sr-only">${text}</span>`))
  assert.match(html, /Mostrar todo/)
  assert.match(html, /disabled=""[^>]*>[\s\S]*?Anterior/)
  assert.match(html, /aria-label="Cerrar guía"/)
})

test('daily check-in clock refreshes on tab visibility and focus, then releases its listeners', () => {
  const file = path.resolve('src/features/student-experience/overlays/checkIn.ts')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  let now = '2026-10-04T04:59:00Z', day, cleanup, interval
  const windowListeners = new Map(), documentListeners = new Map()
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [now])) } }
  const fakeDocument = { visibilityState: 'visible', addEventListener: (name, listener) => documentListeners.set(name, listener), removeEventListener: name => documentListeners.delete(name) }
  const exports = {}
  const clockContext = vm.createContext({ Date: Clock, document: fakeDocument, window: {
    setInterval: callback => { interval = callback; return 1 }, clearInterval: () => { interval = undefined },
    addEventListener: (name, listener) => windowListeners.set(name, listener), removeEventListener: name => windowListeners.delete(name),
  } })
  const require = specifier => {
    if (specifier === 'react') return { useState: initial => { day ??= initial(); return [day, value => { day = value }] }, useEffect: callback => { cleanup ??= callback() } }
    if (specifier.endsWith('/AdventureStore')) return store
    if (specifier.endsWith('/LumiFriendship')) return load(path.resolve('src/features/occupation-exploration/lib/LumiFriendship.ts'))
    throw new Error(`Unexpected dependency: ${specifier}`)
  }
  vm.runInContext(`(function(require,exports){${js}\n})`, clockContext)(require, exports)
  assert.equal(exports.useCheckInDay(), '2026-10-03')
  now = '2026-10-04T05:01:00Z'
  windowListeners.get('focus')()
  assert.equal(day, '2026-10-04')
  now = '2026-10-05T05:01:00Z'
  fakeDocument.visibilityState = 'hidden'
  documentListeners.get('visibilitychange')()
  assert.equal(day, '2026-10-04')
  fakeDocument.visibilityState = 'visible'
  documentListeners.get('visibilitychange')()
  assert.equal(day, '2026-10-05')
  now = '2026-10-06T05:01:00Z'
  interval()
  assert.equal(day, '2026-10-06')
  cleanup()
  assert.equal(windowListeners.size, 0)
  assert.equal(documentListeners.size, 0)
  assert.equal(interval, undefined)
})

test('check-in dialog requires a choice and preselects the saved value when reopened', () => {
  const file = path.resolve('src/features/student-experience/overlays/CheckInDialog.tsx')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const pass = ({ children }) => children
  const exports = {}
  const require = specifier => {
    if (specifier === '@/components/ui/Dialog') return {
      Dialog: pass, DialogContent: pass,
      DialogTitle: ({ children }) => React.createElement('h2', {}, children),
      DialogDescription: ({ children }) => React.createElement('p', {}, children),
    }
    if (specifier === '../player/CharacterAvatar') return load(path.resolve('src/features/student-experience/player/CharacterAvatar.tsx'))
    return nativeRequire(specifier)
  }
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(require, exports)
  const draw = value => renderToStaticMarkup(React.createElement(exports.CheckInDialog, { open: true, value, onSave() {}, onDismiss() {} }))
  const empty = draw()
  assert.equal((empty.match(/class="sx-signal-value"/g) ?? []).length, 10)
  assert.equal((empty.match(/aria-pressed="false"/g) ?? []).length, 10)
  assert.match(empty, /disabled="">Guardar señal/)
  assert.match(empty, /Tu orientadora ve esta señal y su tendencia, nunca el texto de tu diario\./)
  const saved = draw(8)
  assert.match(saved, /aria-label="8 de 10" aria-pressed="true"/)
  assert.equal((saved.match(/aria-pressed="true"/g) ?? []).length, 1)
  assert.doesNotMatch(saved, /disabled="">Guardar señal/)
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
  assert.match(html, /Mi diario/)
  assert.doesNotMatch(html, /Tu señal de hoy|Qué tan seguro te sientes hoy de tu próximo paso/i)
  assert.match(html, /Tema del día/)
  assert.equal((html.match(/>Conversación libre /g) ?? []).length, 1)
  assert.doesNotMatch(html, /Contarle algo a Lumi|Pulsa aquí para registrarla|Ver historial/)
  const source = readFileSync(
    path.resolve('src/features/occupation-exploration/components/PostActivityJournalSheet.tsx'),
    'utf8',
  )
  assert.match(source, /readinessCheckIns/)
  assert.match(source, /journal: entry/)
  assert.match(source, /Omitir por ahora/)
})
test('signal history keeps its ten-point chart and daily check-in separate from private entries', () => {
  const html = render('/student/journal/signal', { journalOnboardingSeen: true })
  assert.match(html, /Evolución de mi señal/)
  assert.match(html, /Tu señal de hoy/)
  assert.match(html, /Registrar mi señal/)
  assert.match(html, /Historial de señales/)
  assert.match(html, /Escala del 1 al 10/)
  assert.match(html, /polyline/)
  assert.match(html, /Señal seleccionada/)
  assert.doesNotMatch(html, /Entradas del|Solo tú puedes leerlas|Volver a Conversaciones con Lumi/)
  assert.ok((html.match(/de 10/g) ?? []).length >= 10)
  assert.doesNotMatch(html, /Todavía tengo dudas, pero decidí preparar tres preguntas para la feria/)
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

function immersivePlayerHarness(name, overrides = {}) {
  const file = path.resolve('src/features/student-experience/player', `${name}.tsx`)
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const slots = [], effects = [], pending = []
  let slot = 0, effect = 0
  const react = {
    ...React,
    useState(initial) {
      const i = slot++
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value }]
    },
    useRef(initial) { const i = slot++; slots[i] ??= { current: initial }; return slots[i] },
    useMemo(factory, dependencies) {
      const i = slot++
      if (!slots[i] || dependencies.some((value, j) => !Object.is(value, slots[i].dependencies[j]))) slots[i] = { value: factory(), dependencies }
      return slots[i].value
    },
    useCallback(callback, dependencies) { return react.useMemo(() => callback, dependencies) },
    useImperativeHandle(ref, factory, dependencies) { const value = react.useMemo(factory, dependencies); if (ref) ref.current = value },
    useEffect(callback, dependencies) {
      const i = effect++
      if (!effects[i] || dependencies.some((value, j) => !Object.is(value, effects[i].dependencies[j]))) pending.push(() => {
        effects[i]?.cleanup?.()
        effects[i] = { dependencies, cleanup: callback() }
      })
    },
  }
  const require = specifier => {
    if (Object.hasOwn(overrides, specifier)) return overrides[specifier]
    if (specifier.endsWith('.css')) return {}
    if (specifier === 'react') return react
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return nativeRequire(specifier)
    const base = specifier.startsWith('@/') ? path.resolve('src', specifier.slice(2)) : path.resolve(path.dirname(file), specifier)
    return load([`${base}.tsx`, `${base}.ts`].find(existsSync))
  }
  const exports = {}
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(require, exports)
  const component = exports[name.split('/').at(-1)]
  const all = tree => Array.isArray(tree) ? tree.flatMap(all) : React.isValidElement(tree) ? [tree, ...all(tree.props.children)] : []
  const text = tree => Array.isArray(tree) ? tree.map(text).join('') : React.isValidElement(tree) ? text(tree.props.children) : typeof tree === 'string' || typeof tree === 'number' ? String(tree) : ''
  return {
    draw(props, mount) { slot = effect = 0; const tree = typeof component === 'function' ? component(props) : component.render(props, props.ref); mount?.(tree); pending.splice(0).forEach(run => run()); return tree },
    find: (tree, predicate) => all(tree).find(predicate),
    button: (tree, label) => all(tree).find(element => element.type === 'button' && text(element).includes(label)),
    text,
    dispose: () => effects.forEach(entry => entry?.cleanup?.()),
  }
}

test('immersive submission preserves validation, drafts, versions and the keep action', () => {
  const activity = journeyContent.activities.find(activity => activity.tipo === 'registro' && activity.plantilla?.tipo !== 'matriz')
  const node = activity.nodos.find(node => node.tipo === 'consigna' && node.entregable.tipo === 'texto')
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  let saved = 0, kept = 0, prevented = false
  const props = { activity, node, edit: true, onSaved: () => saved++, onKeep: () => kept++ }
  const form = immersivePlayerHarness('nodes/SubmissionNode')
  let tree = form.draw(props)
  tree.props.onSubmit({ preventDefault() { prevented = true } })
  assert.equal(prevented, true)
  tree = form.draw(props)
  assert.match(form.text(tree), /Escribe al menos/)
  assert.equal(saved, 0)
  const answer = 'Una posibilidad que quiero explorar con calma. '.repeat(Math.ceil((node.entregable.minCaracteres ?? 1) / 45) + 1).trim()
  form.find(tree, element => element.type === 'textarea').props.onChange({ target: { value: answer } })
  assert.equal(journeyStore.useJourney().drafts[`${activity.id}/${node.id}`], answer)
  tree = form.draw(props)
  tree.props.onSubmit({ preventDefault() {} })
  const first = journeyLogic.latestSubmission(journeyStore.useJourney(), activity.id, node.id)
  assert.equal(first.contenido.texto, answer)
  assert.equal(first.version, 1)
  assert.equal(journeyStore.useJourney().drafts[`${activity.id}/${node.id}`], undefined)
  assert.equal(saved, 1)
  tree = form.draw(props)
  form.find(tree, element => element.type === 'textarea').props.onChange({ target: { value: `${answer} Una idea nueva.` } })
  tree = form.draw(props)
  tree.props.onSubmit({ preventDefault() {} })
  assert.equal(journeyLogic.latestSubmission(journeyStore.useJourney(), activity.id, node.id).version, 2)
  assert.equal(journeyStore.useJourney().submissions[0].contenido.texto, answer)
  tree = form.draw(props)
  form.button(tree, 'Mantener esta respuesta').props.onClick()
  assert.equal(kept, 1)
  assert.equal(journeyStore.useJourney().submissions.length, 2)
  form.dispose()
})

test('immersive option submissions keep multiple selection and omit optional files from an effect', () => {
  const activity = journeyContent.activities.find(activity => activity.tipo === 'registro')
  const original = activity.nodos.find(node => node.tipo === 'consigna')
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  let saved = 0
  const node = { ...original, id: 'options-test', entregable: { tipo: 'opcion', multiple: true, opciones: ['Una opción', 'Otra opción'] } }
  const props = { activity, node, onSaved: () => saved++ }
  const form = immersivePlayerHarness('nodes/SubmissionNode')
  let tree = form.draw(props)
  form.find(tree, element => element.type === 'input').props.onChange()
  tree = form.draw(props)
  const second = form.find(tree, element => element.type === 'input' && !element.props.checked)
  second.props.onChange()
  tree = form.draw(props)
  tree.props.onSubmit({ preventDefault() {} })
  assert.equal(saved, 1)
  assert.equal(journeyLogic.latestSubmission(journeyStore.useJourney(), activity.id, node.id).contenido.seleccion.length, 2)
  form.dispose()
  const file = immersivePlayerHarness('nodes/SubmissionNode')
  const before = saved
  const unavailable = file.draw({ ...props, node: { ...original, obligatoria: false, entregable: { tipo: 'archivo', formatos: ['pdf'], maxArchivos: 1, maxMB: 2 } } })
  assert.equal(file.text(unavailable), 'Esta entrega no está disponible en la plataforma.')
  assert.equal(saved, before + 1)
  assert.equal(file.find(unavailable, element => element.type === 'input'), undefined)
  file.dispose()
  const mandatory = immersivePlayerHarness('nodes/SubmissionNode')
  mandatory.draw({ ...props, node: { ...original, obligatoria: true, entregable: { tipo: 'archivo', formatos: ['pdf'], maxArchivos: 1, maxMB: 2 } } })
  assert.equal(saved, before + 1)
  mandatory.dispose()
})

test('immersive questions preserve attempts, hints, revelation, retry and fresh revision behavior', () => {
  const activity = journeyContent.activities.find(activity => activity.id === 'enc-mitos')
  const node = activity.nodos.find(node => node.tipo === 'pregunta' && node.formato !== 'opcion_multiple' && node.bloqueante)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  let continued = 0, resources
  const props = { activity, node, onContinue: () => continued++, onResources: ids => { resources = ids } }
  const question = immersivePlayerHarness('nodes/QuestionNode')
  const wrong = node.opciones.find(option => !option.correcta)
  let tree = question.draw(props)
  for (let i = 0; i <= node.pistas.length; i++) {
    question.button(tree, wrong.texto).props.onClick()
    tree = question.draw(props)
    const attempt = journeyStore.useJourney().attempts.at(-1)
    assert.equal(attempt.numeroIntento, i + 1)
    assert.equal(attempt.correcta, false)
    if (i < node.pistas.length) {
      const hint = question.find(tree, element => element.props.speakerId === node.pistas[i].hablanteId && element.props.text === node.pistas[i].texto)
      assert.ok(hint)
      question.button(tree, 'Ver ficha').props.onClick()
      assert.ok(resources.length > 0)
      question.button(tree, 'Volver a intentarlo').props.onClick()
      tree = question.draw(props)
    } else {
      assert.equal(attempt.revelada, true)
      assert.ok(question.text(tree).includes(node.explicacion))
      question.button(tree, 'Continuar el camino').props.onClick()
    }
  }
  assert.equal(continued, 1)
  const fresh = immersivePlayerHarness('nodes/QuestionNode')
  assert.ok(fresh.button(fresh.draw({ ...props, fresh: true }), wrong.texto))
  fresh.dispose()
  question.dispose()
})

test('immersive matrix requires all seven submissions even when a legacy alternative is saved', () => {
  const activity = journeyContent.activities.find(activity => activity.id === 'act-06')
  const { MatrixNode } = load(path.resolve('src/features/student-experience/player/nodes/MatrixNode.tsx'))
  const required = activity.nodos.filter(node => node.tipo === 'consigna' && node.obligatoria)
  const legacy = { id: 'old-file', actividadId: activity.id, nodoId: 'g-archivo', version: 1, contenido: { tipo: 'archivo', archivos: [{ id: 'file', nombre: 'old.pdf' }] } }
  const draw = submissions => {
    journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), submissions }))
    return renderToStaticMarkup(React.createElement(MatrixNode, { activity, onContinue() {} }))
  }
  assert.equal(required.length, 7)
  const empty = draw([legacy])
  assert.match(empty, /0 de 7 entregas necesarias guardadas/)
  assert.doesNotMatch(empty, /old\.pdf|Archivo guardado|type="file"/)
  const saved = required.map((node, i) => ({ id: `entry-${i}`, actividadId: activity.id, nodoId: node.id, version: 1, contenido: { tipo: 'texto', texto: 'Una posibilidad guardada para este horizonte.' } }))
  assert.match(draw([legacy, ...saved.slice(0, 6)]), /6 de 7 entregas necesarias guardadas/)
  assert.match(draw([legacy, ...saved.slice(0, 6)]), /disabled="">Guardar mi mapa y seguir/)
  const completed = draw([legacy, ...saved])
  assert.match(completed, /7 de 7 entregas necesarias guardadas/)
  assert.doesNotMatch(completed, /disabled="">Guardar mi mapa y seguir/)
  assert.match(completed, /Tu futuro se dibuja con lápiz/)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('immersive direct instrument resumes pending items and completes once without narrative reactions', () => {
  const activity = journeyContent.activities.find(activity => activity.id === 'act-tip-01')
  const node = activity.nodos.find(node => node.tipo === 'item')
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  const player = immersivePlayerHarness('StudentActivityPlayer')
  const props = { activity, direct: true, onClose() {}, onNext() {} }
  let tree = player.draw(props)
  const item = player.find(tree, element => element.props.node?.tipo === 'item')
  assert.equal(item.props.direct, true)
  item.props.onAnswer('si')
  tree = player.draw(props)
  const saved = journeyStore.useJourney()
  assert.equal(saved.items.length, 1)
  assert.equal(saved.items[0].itemId, node.itemId)
  assert.equal(saved.progress[activity.id].estado, 'en_curso')
  assert.equal(saved.rewards.length, 0)
  assert.equal(player.find(tree, element => element.props.speakerId === 'mara'), undefined)
  const resumed = immersivePlayerHarness('StudentActivityPlayer')
  const items = activity.nodos.filter(node => node.tipo === 'item')
  tree = resumed.draw(props)
  assert.equal(resumed.find(tree, element => element.props.node?.tipo === 'item').props.node.id, items[1].id)
  for (let i = 1; i < items.length; i++) {
    resumed.find(tree, element => element.props.node?.tipo === 'item').props.onAnswer('si')
    tree = resumed.draw(props)
  }
  assert.ok(resumed.find(tree, element => element.type.name === 'FinishScreen'))
  assert.equal(journeyStore.useJourney().items.length, items.length)
  assert.equal(journeyStore.useJourney().progress[activity.id].estado, 'completada')
  assert.equal(journeyStore.useJourney().progress[activity.id].nodoActualId, '$fin')
  assert.equal(journeyStore.useJourney().rewards.length, 1)
  resumed.dispose()
  player.dispose()
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('immersive resources show their content, normalize YouTube and preserve saved backpack state', () => {
  const file = path.resolve('src/features/student-experience/player/ResourceSheet.tsx')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const resources = [
    { id: 'sheet-test', titulo: 'Una ficha', tipo: 'ficha', contenido: '## Ideas\n\nUna **pista** para explorar.', fuente: 'Fuente de la ficha', guardableEnRecursos: true },
    { id: 'video-test', titulo: 'Un video', tipo: 'video', url: 'https://youtu.be/ysz5S6PUM-U?t=30', guardableEnRecursos: true },
    { id: 'link-test', titulo: 'Un enlace', tipo: 'enlace', url: 'https://example.com/resource', guardableEnRecursos: true },
    { id: 'pending-test', titulo: 'Material pendiente', tipo: 'ficha', guardableEnRecursos: true },
  ]
  const pass = ({ children }) => children
  const require = specifier => {
    if (specifier === '@/components/ui/Sheet') return { Sheet: pass, SheetContent: pass, SheetDescription: pass, SheetTitle: pass }
    if (specifier === '@/features/missions/content') return { catalog: { recursos: resources } }
    if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return nativeRequire(specifier)
    const base = specifier.startsWith('@/') ? path.resolve('src', specifier.slice(2)) : path.resolve(path.dirname(file), specifier)
    return load([`${base}.tsx`, `${base}.ts`].find(existsSync))
  }
  const exports = {}
  vm.runInContext(`(function(require,exports){${js}\n})`, context)(require, exports)
  const draw = id => renderToStaticMarkup(React.createElement(exports.ResourceSheet, { open: true, ids: [id], onClose() {} }))
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  assert.match(draw('sheet-test'), /Una <strong>pista<\/strong>/)
  assert.match(draw('sheet-test'), /Fuente de la ficha/)
  assert.match(draw('sheet-test'), /Guardar en Recursos/)
  assert.match(draw('sheet-test'), /aria-expanded="true"/)
  assert.match(draw('video-test'), /src="https:\/\/www.youtube-nocookie.com\/embed\/ysz5S6PUM-U"/)
  assert.match(draw('link-test'), /href="https:\/\/example.com\/resource"/)
  assert.match(draw('pending-test'), /Este material estará disponible cuando lo prepare orientación\./)
  assert.doesNotMatch(draw('pending-test'), /Guardar en Recursos/)
  journeyStore.updateJourney(current => ({ ...current, resources: ['sheet-test'] }))
  assert.match(draw('sheet-test'), /En tu mochila/)
  assert.doesNotMatch(draw('sheet-test'), /Guardar en Recursos/)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('immersive finish shows saved sheets, narrative rewards and the prompted journal action', () => {
  const activity = journeyContent.activities.find(activity => activity.id === 'enc-mitos')
  const { FinishScreen } = load(path.resolve('src/features/student-experience/player/FinishScreen.tsx'))
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), resources: ['ficha-mitos'], progress: { [activity.id]: { estado: 'completada' } } }))
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(FinishScreen, { activity, onClose() {}, onNext() {} })))
  for (const text of ['Este hallazgo viaja contigo.', activity.recompensa.mensajeFin, 'Lo que llevas contigo', 'En tu mochila', 'Escribir en mi diario', 'Revisar mis propias creencias', 'Volver al mapa']) assert.ok(html.includes(text))
  assert.doesNotMatch(html, /\bpuntos\b|\bpts\b|Nueva insignia/)
  const { ResultNode } = load(path.resolve('src/features/student-experience/player/nodes/ResultNode.tsx'))
  const result = renderToStaticMarkup(React.createElement(ResultNode, { activity: journeyContent.finalActivity, instrumentId: 'tip' }))
  assert.match(result, /Elena te espera al completar los 14 encuentros/)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('immersive choices preserve recorded responses and show reactions before the next node', () => {
  const original = journeyContent.activities.find(activity => activity.id === 'act-tip-01')
  const choice = original.nodos.find(node => node.tipo === 'eleccion')
  const reaction = { id: 'reaction-test', tipo: 'dialogo', hablanteId: 'companero', texto: 'Escucho tu respuesta.' }
  const node = { ...choice, registrar: true, opciones: [{ ...choice.opciones[0], reaccion: [reaction] }] }
  const activity = { ...original, nodos: original.nodos.map(current => current.id === node.id ? node : current) }
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), progress: { [activity.id]: { estado: 'en_curso', nodoActualId: node.id } } }))
  const player = immersivePlayerHarness('StudentActivityPlayer')
  const props = { activity, onClose() {}, onNext() {} }
  let tree = player.draw(props)
  const panel = player.find(tree, element => element.props.node?.tipo === 'eleccion')
  assert.equal(panel.props.previous.tipo, 'dialogo')
  panel.props.onChoose(node.opciones[0])
  tree = player.draw(props)
  assert.equal(journeyStore.useJourney().choices[0].opcionId, node.opciones[0].id)
  const dialogue = player.find(tree, element => element.props.text === reaction.texto)
  assert.ok(dialogue)
  dialogue.props.onContinue()
  tree = player.draw(props)
  assert.equal(player.find(tree, element => element.props.text === reaction.texto), undefined)
  assert.equal(journeyStore.useJourney().choices.length, 1)
  player.dispose()
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

const followUpService = load(path.resolve('src/features/student-experience/player/followup/followUpService.ts'))
const followUpStore = load(path.resolve('src/features/student-experience/player/followup/followUpStore.ts'))
const responseCondenser = load(path.resolve('src/features/student-experience/player/followup/responseCondenser.ts'))
function followUpClock() {
  const previous = { setTimeout: context.setTimeout, clearTimeout: context.clearTimeout }
  const timers = new Map()
  let time = 0, id = 0
  context.setTimeout = (callback, delay) => { timers.set(++id, { callback, at: time + delay }); return id }
  context.clearTimeout = handle => timers.delete(handle)
  return {
    async tick(duration) {
      const target = time + duration
      for (;;) {
        const entry = [...timers].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0]
        if (!entry) break
        time = entry[1].at; timers.delete(entry[0]); entry[1].callback()
        for (let i = 0; i < 12; i++) await Promise.resolve()
      }
      time = target
      for (let i = 0; i < 12; i++) await Promise.resolve()
    },
    get pending() { return timers.size },
    restore() { Object.assign(context, previous) },
  }
}
function followUpFixture() {
  const activity = journeyContent.activities.find(activity => activity.tipo === 'registro' && activity.plantilla?.tipo !== 'matriz')
  const node = activity.nodos.find(node => node.tipo === 'consigna' && node.entregable.tipo === 'texto')
  const text = 'Quiero decidir por mí, con apoyo.'
  const entry = { id: crypto.randomUUID(), estudianteId: 'est-prototipo', actividadId: activity.id, nodoId: node.id, contenido: { tipo: 'texto', texto: text }, version: 1, enviadoEn: new Date().toISOString() }
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), submissions: [entry], progress: { [activity.id]: { estado: 'en_curso', nodoActualId: node.id } } }))
  followUpStore.updateFollowUps(() => followUpStore.initialFollowUpState())
  const key = activity.id + '/' + node.id
  followUpStore.setFollowUpRecord(key, { textoInicial: text, versionInicial: 1, turnos: [] })
  return { activity, node, text, key, entry }
}
const followUpTurn = (orden, pregunta, respuesta, omitida = false) => ({ orden, pregunta, respuesta, omitida, creadaEn: '2026-10-03T10:00:00.000Z', ...(respuesta !== undefined || omitida ? { respondidaEn: '2026-10-03T10:01:00.000Z' } : {}) })

test('follow-up service waits 700ms, respects both text thresholds and never asks a third turn', async () => {
  const clock = followUpClock()
  try {
    const input = { activityId: 'a', nodeId: 'n', premisa: 'Una premisa', texto: 'Una respuesta breve', turnosPrevios: [] }
    let finished = false
    const short = followUpService.mockFollowUpService.evaluate(input).then(value => { finished = true; return value })
    await clock.tick(699); assert.equal(finished, false)
    await clock.tick(1); assert.match((await short).pregunta, /momento concreto/)
    const run = async patch => { const promise = followUpService.mockFollowUpService.evaluate({ ...input, ...patch }); await clock.tick(700); return promise }
    assert.equal((await run({ texto: 'a'.repeat(80) })).pregunta, undefined)
    assert.ok((await run({ texto: 'a'.repeat(99), minCaracteres: 50 })).pregunta)
    assert.equal((await run({ texto: 'a'.repeat(100), minCaracteres: 50 })).pregunta, undefined)
    assert.equal((await run({ turnosPrevios: [followUpTurn(1, 'Una pregunta', 'a'.repeat(39))] })).pregunta, '¿Hay algo más que te gustaría agregar antes de seguir?')
    assert.equal((await run({ turnosPrevios: [followUpTurn(1, 'Una pregunta', 'a'.repeat(40))] })).pregunta, undefined)
    assert.equal((await run({ turnosPrevios: [followUpTurn(1, 'Una pregunta', undefined, true)] })).pregunta, undefined)
    assert.equal((await run({ turnosPrevios: [followUpTurn(1, 'Una pregunta', 'Sí'), followUpTurn(2, 'Otra', 'Sí')] })).pregunta, undefined)
    assert.equal(clock.pending, 0)
  } finally { clock.restore() }
})

test('follow-up evaluation silently resolves failures and a 10-second timeout without late questions', async () => {
  const clock = followUpClock()
  try {
    const input = { activityId: 'a', nodeId: 'n', premisa: 'Una premisa', texto: 'Texto', turnosPrevios: [] }
    assert.equal((await followUpService.evaluateFollowUp({ evaluate: async () => { throw new Error('Servicio caído') } }, input)).pregunta, undefined)
    let release, finished = false
    const promise = followUpService.evaluateFollowUp({ evaluate: () => new Promise(resolve => { release = resolve }) }, input).then(value => { finished = true; return value })
    await clock.tick(9999); assert.equal(finished, false)
    await clock.tick(1); assert.equal((await promise).pregunta, undefined)
    release({ pregunta: 'Demasiado tarde' }); await clock.tick(0)
    assert.equal((await promise).pregunta, undefined)
    assert.equal(clock.pending, 0)
  } finally { clock.restore() }
})

test('response condenser preserves exact labels and blank lines, excludes omitted turns and enforces capacity', async () => {
  const turns = [followUpTurn(1, '¿Por qué?', 'Porque quiero decidir.'), followUpTurn(2, '¿Algo más?', undefined, true)]
  const input = { textoInicial: 'autodeterminación', turnos: turns, premisa: 'Una premisa', maxCaracteres: 800 }
  const expected = 'autodeterminación\n\nPregunta de Lumi: ¿Por qué?\nRespuesta: Porque quiero decidir.'
  assert.equal(responseCondenser.buildCondensedResponse(input), expected)
  assert.equal(await responseCondenser.templateCondenser.condense(input), expected)
  const withBoth = { ...input, turnos: [...turns.slice(0, 1), followUpTurn(2, '¿Algo más?', 'Apoyo familiar.')] }
  assert.equal(await responseCondenser.templateCondenser.condense(withBoth), expected + '\n\nPregunta de Lumi: ¿Algo más?\nRespuesta: Apoyo familiar.')
  assert.equal(responseCondenser.responseCapacity({ ...input, maxCaracteres: undefined }, '¿Nueva?'), 400)
  const prefix = '\n\nPregunta de Lumi: ¿Nueva?\nRespuesta: '
  const limit = expected.length + prefix.length + 40
  assert.equal(responseCondenser.responseCapacity({ ...input, maxCaracteres: limit }, '¿Nueva?'), 40)
  assert.equal(responseCondenser.responseCapacity({ ...input, maxCaracteres: limit - 1 }, '¿Nueva?'), 39)
  const filled = { ...input, maxCaracteres: limit, turnos: [turns[0], followUpTurn(2, '¿Nueva?', 'a'.repeat(40))] }
  assert.equal((await responseCondenser.templateCondenser.condense(filled)).length, limit)
  await assert.rejects(responseCondenser.templateCondenser.condense({ ...filled, maxCaracteres: limit - 1 }), /supera el límite/)
})

test('follow-up store survives remounts and reload events and tolerates corrupt or unavailable storage', () => {
  const file = path.resolve('src/features/student-experience/player/followup/followUpStore.ts')
  const js = ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const memory = new Map(), events = []
  let unavailable = false
  const storage = { getItem: key => { if (unavailable) throw new Error('No storage'); return memory.get(key) ?? null }, setItem: (key, value) => { if (unavailable) throw new Error('No storage'); memory.set(key, value) } }
  const fresh = () => {
    const exports = {}
    const require = specifier => specifier === 'react' ? { ...React, useSyncExternalStore: (_, snapshot) => snapshot() } : specifier.includes('/missions/logic') ? journeyLogic : specifier.includes('/missions/store') ? journeyStore : specifier === './responseCondenser' ? responseCondenser : {}
    vm.runInNewContext('(function(require,exports){' + js + '\n})', { localStorage: storage, window: { addEventListener: (_, callback) => events.push(callback) }, Date, crypto, Map, Set })(require, exports)
    return exports
  }
  const first = fresh(), record = { textoInicial: 'Texto', versionInicial: 1, turnos: [followUpTurn(1, '¿Por qué?', 'Mi respuesta')] }
  assert.equal(first.setFollowUpRecord('a/n', record), true)
  assert.ok(memory.has('ov.student-followups.v1'))
  const second = fresh()
  assert.equal(second.getFollowUpRecord('a/n').turnos[0].respuesta, 'Mi respuesta')
  memory.set('ov.student-followups.v1', JSON.stringify({ version: 1, records: { 'a/n': { ...record, textoInicial: 'Cambio en otra pestaña' }, invalid: { turnos: 'wrong' } } }))
  events.at(-1)({ key: 'ov.student-followups.v1' })
  assert.equal(second.getFollowUpRecord('a/n').textoInicial, 'Cambio en otra pestaña')
  memory.set('ov.student-followups.v1', '{broken'); assert.equal(Object.keys(fresh().useFollowUps().records).length, 0)
  unavailable = true; assert.equal(Object.keys(fresh().useFollowUps().records).length, 0)
  assert.equal(second.setFollowUpRecord('b/n', record), false)
  assert.equal(second.getFollowUpRecord('b/n'), undefined)
})

test('first text submission saves version one before follow-up; edits and matrices use the normal form', async () => {
  const fixture = followUpFixture()
  for (const kind of ['first', 'edit', 'matrix']) {
    journeyStore.updateJourney(() => journeyLogic.initialJourney())
    followUpStore.updateFollowUps(() => followUpStore.initialFollowUpState())
    let advanced = 0
    const activity = kind === 'matrix' ? { ...fixture.activity, plantilla: { tipo: 'matriz' } } : fixture.activity
    const props = { activity, node: fixture.node, edit: kind === 'edit', onSaved: () => advanced++ }
    const form = immersivePlayerHarness('nodes/SubmissionNode')
    let tree = form.draw(props)
    form.find(tree, element => element.type === 'textarea').props.onChange({ target: { value: fixture.text } })
    tree = form.draw(props); tree.props.onSubmit({ preventDefault() {} })
    tree = form.draw(props)
    assert.equal(journeyLogic.latestSubmission(journeyStore.useJourney(), activity.id, fixture.node.id).version, 1)
    if (kind === 'first') {
      assert.equal(advanced, 0)
      assert.equal(tree.type.name, 'FollowUp')
      assert.equal(followUpStore.getFollowUpRecord(fixture.key).textoInicial, fixture.text)
    } else {
      assert.equal(advanced, 1)
      assert.equal(followUpStore.getFollowUpRecord(fixture.key), undefined)
    }
    form.dispose()
  }
})

test('follow-up accepts two replies, caps the field at available space and saves one condensed version', async () => {
  const fixture = followUpFixture(), clock = followUpClock()
  const ui = immersivePlayerHarness('followup/FollowUp')
  let advanced = 0
  const props = { activity: fixture.activity, node: fixture.node, onContinue: () => advanced++ }
  try {
    let tree = ui.draw(props); assert.match(ui.text(tree), /Tu respuesta/)
    await clock.tick(700); tree = ui.draw(props); tree = ui.draw(props)
    let field = ui.find(tree, element => element.type === 'textarea')
    assert.equal(field.props.maxLength, 400)
    assert.equal(ui.button(tree, 'Responder').props.disabled, true)
    field.props.onChange({ target: { value: 'Porque quiero elegir.' } })
    tree = ui.draw(props); ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} })
    tree = ui.draw(props); tree = ui.draw(props); await clock.tick(700)
    tree = ui.draw(props); tree = ui.draw(props)
    field = ui.find(tree, element => element.type === 'textarea')
    assert.ok(field)
    field.props.onChange({ target: { value: 'Con el apoyo de mi familia.' } })
    tree = ui.draw(props); ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} })
    tree = ui.draw(props); await clock.tick(0); tree = ui.draw(props)
    assert.equal(advanced, 0)
    const entries = journeyStore.useJourney().submissions
    assert.equal(entries.length, 2); assert.equal(entries[0].contenido.texto, fixture.text)
    assert.equal(entries[1].version, 2)
    assert.equal(entries[1].contenido.texto, responseCondenser.buildCondensedResponse({ textoInicial: fixture.text, turnos: followUpStore.getFollowUpRecord(fixture.key).turnos, premisa: fixture.node.premisa }))
    assert.equal(journeyLogic.validateSubmission(fixture.node, entries[1].contenido), undefined)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 2)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).versionCondensada, 2)
    const dialogue = ui.find(tree, element => element.type.name === 'InlineDialogue' && element.props.text?.startsWith('Lo guardé'))
    assert.ok(dialogue)
    ui.button(tree, 'Continuar').props.onClick(); assert.equal(advanced, 1)
  } finally { ui.dispose(); clock.restore() }
})

test('omitting all turns preserves version one, while a long reply ends follow-up after one turn', async () => {
  for (const omit of [true, false]) {
    const fixture = followUpFixture(), clock = followUpClock(), ui = immersivePlayerHarness('followup/FollowUp')
    const props = { activity: fixture.activity, node: fixture.node, onContinue() {} }
    try {
      let tree = ui.draw(props); await clock.tick(700); tree = ui.draw(props); tree = ui.draw(props)
      if (omit) ui.button(tree, 'Omitir').props.onClick()
      else { ui.find(tree, element => element.type === 'textarea').props.onChange({ target: { value: 'Una respuesta de más de cuarenta caracteres que amplía lo que pienso.' } }); tree = ui.draw(props); ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} }) }
      tree = ui.draw(props); tree = ui.draw(props); await clock.tick(700); tree = ui.draw(props); await clock.tick(0); tree = ui.draw(props)
      assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 1)
      assert.equal(journeyStore.useJourney().submissions.length, omit ? 1 : 2)
      assert.ok(ui.button(tree, 'Continuar'))
      if (omit) assert.ok(ui.find(tree, element => element.props.text === 'Tu respuesta quedó guardada tal como la escribiste.'))
    } finally { ui.dispose(); clock.restore() }
  }
})

test('no question, failure, timeout or fewer than 40 free characters advances silently with the original', async () => {
  const service = followUpService.mockFollowUpService, original = service.evaluate
  for (const kind of ['long', 'space', 'error', 'timeout']) {
    const fixture = followUpFixture(), clock = followUpClock(), ui = immersivePlayerHarness('followup/FollowUp')
    let advanced = 0
    const node = kind === 'space' ? { ...fixture.node, entregable: { ...fixture.node.entregable, maxCaracteres: 80 } } : fixture.node
    if (kind === 'long') followUpStore.setFollowUpRecord(fixture.key, { textoInicial: 'a'.repeat(200), versionInicial: 1, turnos: [] })
    if (kind === 'error') service.evaluate = async () => { throw new Error('Service down') }
    if (kind === 'timeout') service.evaluate = () => new Promise(() => {})
    try {
      ui.draw({ activity: fixture.activity, node, onContinue: () => advanced++ })
      await clock.tick(kind === 'timeout' ? 10_000 : 700)
      assert.equal(advanced, 1)
      assert.equal(journeyStore.useJourney().submissions.length, 1)
      assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 0)
    } finally { service.evaluate = original; ui.dispose(); clock.restore() }
  }
})

test('interrupted follow-up recovers only answered turns and loads the condensed form without duplicate versions', async () => {
  const fixture = followUpFixture()
  followUpStore.setFollowUpRecord(fixture.key, { textoInicial: fixture.text, versionInicial: 1, turnos: [followUpTurn(1, '¿Por qué?', 'Porque es mi decisión.'), followUpTurn(2, '¿Algo más?', undefined)] })
  const form = immersivePlayerHarness('nodes/SubmissionNode')
  const props = { activity: fixture.activity, node: fixture.node, edit: true, onSaved() {} }
  let tree = form.draw(props); assert.match(form.text(tree), /Recuperando/)
  await followUpStore.recoverFollowUp(fixture.activity, fixture.node)
  for (let i = 0; i < 12; i++) await Promise.resolve()
  tree = form.draw(props)
  assert.equal(journeyStore.useJourney().submissions.length, 2)
  assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 1)
  const field = form.find(tree, element => element.type === 'textarea')
  assert.match(field.props.value, /Pregunta de Lumi: ¿Por qué\?\nRespuesta: Porque es mi decisión\./)
  assert.doesNotMatch(field.props.value, /Algo más/)
  await followUpStore.recoverFollowUp(fixture.activity, fixture.node)
  assert.equal(journeyStore.useJourney().submissions.length, 2)
  field.props.onChange({ target: { value: field.props.value + ' Ahora agrego otra idea.' } })
  tree = form.draw(props); tree.props.onSubmit({ preventDefault() {} })
  assert.equal(journeyStore.useJourney().submissions.length, 3)
  assert.equal(journeyLogic.latestSubmission(journeyStore.useJourney(), fixture.activity.id, fixture.node.id).version, 3)
  assert.equal(form.draw(props).type, 'form')
  form.dispose()
})

test('recovery detects a saved version without its follow-up marker and keeps invalid condensation as history only', async () => {
  const fixture = followUpFixture(), turns = [followUpTurn(1, '¿Por qué?', 'Porque quiero elegir.')]
  const record = { textoInicial: fixture.text, versionInicial: 1, turnos: turns }
  followUpStore.setFollowUpRecord(fixture.key, record)
  await followUpStore.saveFollowUpResponse(fixture.activity, fixture.node)
  assert.equal(journeyStore.useJourney().submissions.length, 2)
  followUpStore.setFollowUpRecord(fixture.key, record)
  await followUpStore.recoverFollowUp(fixture.activity, fixture.node)
  assert.equal(journeyStore.useJourney().submissions.length, 2)
  assert.equal(followUpStore.getFollowUpRecord(fixture.key).versionCondensada, 2)
  const next = followUpFixture()
  followUpStore.setFollowUpRecord(next.key, record)
  const result = await followUpStore.saveFollowUpResponse(next.activity, { ...next.node, entregable: { ...next.node.entregable, maxCaracteres: 35 } })
  assert.equal(result.saved, false)
  assert.equal(journeyStore.useJourney().submissions.length, 1)
  assert.equal(followUpStore.getFollowUpRecord(next.key).versionCondensada, undefined)
  assert.equal(followUpStore.getFollowUpRecord(next.key).turnos[0].respuesta, 'Porque quiero elegir.')
  const invalid = await followUpStore.saveFollowUpResponse(next.activity, next.node, { condense: async () => '' })
  assert.equal(invalid.saved, false)
  assert.equal(journeyStore.useJourney().submissions.length, 1)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  followUpStore.updateFollowUps(() => followUpStore.initialFollowUpState())
})


test('follow-up requires 40 free characters and stops before a second question that cannot fit', async () => {
  const service = followUpService.mockFollowUpService, original = service.evaluate
  service.evaluate = async () => ({ pregunta: '¿Por qué?' })
  try {
    for (const remaining of [39, 40]) {
      const fixture = followUpFixture(), clock = followUpClock(), ui = immersivePlayerHarness('followup/FollowUp')
      let advanced = 0
      const maximum = fixture.text.length + '\n\nPregunta de Lumi: ¿Por qué?\nRespuesta: '.length + remaining
      const node = { ...fixture.node, entregable: { ...fixture.node.entregable, maxCaracteres: maximum } }
      const props = { activity: fixture.activity, node, onContinue: () => advanced++ }
      try {
        let tree = ui.draw(props); await clock.tick(0); tree = ui.draw(props); tree = ui.draw(props)
        const field = ui.find(tree, element => element.type === 'textarea')
        if (remaining === 39) {
          assert.equal(advanced, 1); assert.equal(field, undefined)
        } else {
          assert.equal(advanced, 0); assert.equal(field.props.maxLength, 40)
          field.props.onChange({ target: { value: 'a'.repeat(41) } }); tree = ui.draw(props)
          ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} })
          assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos[0].respuesta, undefined)
          field.props.onChange({ target: { value: 'Una razón.' } }); tree = ui.draw(props)
          ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} })
          tree = ui.draw(props); await clock.tick(0); tree = ui.draw(props)
          assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 1)
          assert.equal(journeyStore.useJourney().submissions.length, 2)
          assert.ok(ui.button(tree, 'Continuar'))
          assert.equal(journeyLogic.validateSubmission(node, journeyStore.useJourney().submissions.at(-1).contenido), undefined)
        }
      } finally { ui.dispose(); clock.restore() }
    }
  } finally { service.evaluate = original }
})

test('leaving during evaluation never stores a late question and recovery preserves the replied turn', async () => {
  const fixture = followUpFixture(), clock = followUpClock(), ui = immersivePlayerHarness('followup/FollowUp')
  const props = { activity: fixture.activity, node: fixture.node, onContinue() { assert.fail('An unmounted follow-up must not advance') } }
  try {
    let tree = ui.draw(props); await clock.tick(700); tree = ui.draw(props); tree = ui.draw(props)
    ui.find(tree, element => element.type === 'textarea').props.onChange({ target: { value: 'Quiero elegir.' } })
    tree = ui.draw(props); ui.find(tree, element => element.type === 'form').props.onSubmit({ preventDefault() {} })
    ui.draw(props); await clock.tick(699); ui.dispose(); await clock.tick(1)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).turnos.length, 1)
    assert.equal(journeyStore.useJourney().submissions.length, 1)
    await followUpStore.recoverFollowUp(fixture.activity, fixture.node)
    assert.equal(journeyStore.useJourney().submissions.length, 2)
    assert.match(journeyStore.useJourney().submissions.at(-1).contenido.texto, /Respuesta: Quiero elegir\./)
  } finally { ui.dispose(); clock.restore() }
})

test('failed delivery writes preserve version one and failed follow-up markers do not duplicate version two', async () => {
  const fixture = followUpFixture(), original = context.localStorage.setItem
  followUpStore.setFollowUpRecord(fixture.key, { textoInicial: fixture.text, versionInicial: 1, turnos: [followUpTurn(1, '¿Por qué?', 'Porque quiero decidir.')] })
  try {
    context.localStorage.setItem = key => { if (key === 'ov.missions.v2') throw new Error('Full storage') }
    assert.equal((await followUpStore.saveFollowUpResponse(fixture.activity, fixture.node)).saved, false)
    assert.equal(journeyStore.useJourney().submissions.length, 1)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).versionCondensada, undefined)
    context.localStorage.setItem = key => { if (key === 'ov.student-followups.v1') throw new Error('Full follow-up storage') }
    assert.equal((await followUpStore.saveFollowUpResponse(fixture.activity, fixture.node)).saved, true)
    assert.equal(journeyStore.useJourney().submissions.length, 2)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).versionCondensada, undefined)
    context.localStorage.setItem = original
    await followUpStore.recoverFollowUp(fixture.activity, fixture.node)
    assert.equal(journeyStore.useJourney().submissions.length, 2)
    assert.equal(followUpStore.getFollowUpRecord(fixture.key).versionCondensada, 2)
  } finally {
    context.localStorage.setItem = original
    journeyStore.updateJourney(() => journeyLogic.initialJourney())
    followUpStore.updateFollowUps(() => followUpStore.initialFollowUpState())
  }
})

const noveltyLogic = load(path.resolve('src/features/student-experience/overlays/unlocks.ts'))
const noveltyUi = load(path.resolve('src/features/student-experience/ui-state.ts'))
const noveltyData = load(path.resolve('src/features/occupation-exploration/data/AdventureData.ts'))
function resetNoveltyUi(patch = {}) {
  const { studentViews } = load(path.resolve('src/features/student-experience/views.ts'))
  const { localDateKey } = load(path.resolve('src/features/student-experience/overlays/checkIn.ts'))
  noveltyUi.updateStudentUi(() => ({ ...noveltyUi.initialStudentUiState(), initialized: true, cityArrivalSeen: true, introsSeen: Object.fromEntries(studentViews.map(view => [view, true])), checkInPromptDismissedOn: localDateKey(new Date()), ...patch }))
}

test('novelties use real achievement, resource, hero and zone unlocks with their existing destinations', () => {
  const { appPaths } = load(path.resolve('src/routes/paths.ts'))
  const empty = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  assert.equal(noveltyLogic.getUnlocks(empty, journey).length, 0)
  const adventure = { ...empty, completedMissionIds: noveltyData.fieldMissions.map(mission => mission.id), solvedCaseIds: ['forest-fire'] }
  journey.resources = ['ficha-mitos', 'ficha-mitos', 'unknown-resource']
  const items = noveltyLogic.getUnlocks(adventure, journey), byId = new Map(items.map(item => [item.id, item]))
  for (const [id, kind, href] of [
    ['badge:I1', 'badge', appPaths.student.passport], ['badge:I2', 'badge', appPaths.student.passport], ['badge:I3', 'badge', appPaths.student.passport], ['badge:I7', 'badge', appPaths.student.passport],
    ['ficha:ficha-mitos', 'ficha', appPaths.student.resources], ['heroe:health-response-paramedic', 'heroe', appPaths.student.testimonials], ['ciudad', 'ciudad', appPaths.student.exploration], ['familia', 'familia', appPaths.student.conversations],
  ]) { assert.equal(byId.get(id)?.kind, kind); assert.equal(byId.get(id)?.href, href) }
  assert.equal(byId.get('ficha:ficha-mitos').title, journeyContent.catalog.recursos.find(resource => resource.id === 'ficha-mitos').titulo)
  assert.equal(byId.get('heroe:health-response-paramedic').title, 'Calma y cuidado en una emergencia')
  assert.equal(byId.has('heroe:global-event-translator'), false)
  assert.equal(byId.has('ficha:unknown-resource'), false)
  assert.equal(items.length, byId.size)
  assert.equal(noveltyLogic.getUnlocks(empty, journey).some(item => item.kind === 'ciudad' || item.kind === 'familia' || item.kind === 'heroe'), false)
})

test('first initialization seeds all prior unlocks and earned badges once while preserving presentation preferences', () => {
  const adventure = { ...store.createInitialAdventure(), completedMissionIds: ['welcome'], solvedCaseIds: ['forest-fire'] }, journey = journeyLogic.initialJourney()
  journey.resources = ['ficha-mitos']
  const initial = { ...noveltyUi.initialStudentUiState(), panelCollapsed: true, soundOn: false, seenUnlockIds: ['previous'], announcedBadgeCodes: ['I8'] }
  assert.equal(noveltyLogic.getNextBadge(adventure, initial, false, false), undefined)
  const seeded = noveltyLogic.seedStudentUnlocks(initial, adventure, journey)
  assert.equal(seeded.initialized, true); assert.equal(seeded.panelCollapsed, true); assert.equal(seeded.soundOn, false)
  for (const item of noveltyLogic.getUnlocks(adventure, journey)) assert.ok(seeded.seenUnlockIds.includes(item.id))
  for (const badge of noveltyLogic.getEarnedBadges(adventure)) assert.ok(seeded.announcedBadgeCodes.includes(badge.code))
  assert.ok(seeded.seenUnlockIds.includes('previous')); assert.ok(seeded.announcedBadgeCodes.includes('I8'))
  assert.equal(noveltyLogic.getNextBadge(adventure, seeded, false, false), undefined)
  assert.equal(noveltyLogic.seedStudentUnlocks(seeded, adventure, journey), seeded)
  const next = { ...adventure, completedMissionIds: ['welcome', 'story', 'future', 'beliefs'] }
  assert.equal(noveltyLogic.getNextBadge(next, seeded, false, false).code, 'I2')
  assert.equal(seeded.announcedBadgeCodes.includes('I2'), false)
})

test('shell seeds after v2 synchronization so migrated completions do not create retroactive alerts', () => {
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), progress: { 'mission-welcome': { estado: 'completada' } } }))
  store.updateAdventure(() => store.createInitialAdventure())
  noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
  const shell = immersivePlayerHarness('../StudentShell', {
    'react-router': { ...nativeRequire('react-router'), useLocation: () => ({ pathname: '/student/missions', search: '' }) },
    '@/features/occupation-exploration/OccupationExplorationContext': { useOccupationExplorationContext: () => ({}) },
  })
  shell.draw({})
  assert.ok(store.useAdventure().completedMissionIds.includes('welcome'))
  assert.equal(noveltyUi.useStudentUi().initialized, false)
  shell.draw({})
  assert.equal(noveltyUi.useStudentUi().initialized, true)
  assert.ok(noveltyUi.useStudentUi().announcedBadgeCodes.includes('I1'))
  assert.equal(noveltyLogic.getNextBadge(store.useAdventure(), noveltyUi.useStudentUi(), false, false), undefined)
  shell.dispose()
  store.updateAdventure(() => store.createInitialAdventure()); journeyStore.updateJourney(() => journeyLogic.initialJourney()); noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
})

test('novelties show only pending entries and close without reading; selection reads just one', () => {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), completedMissionIds: ['welcome'] }))
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), resources: ['ficha-mitos'] }))
  resetNoveltyUi({ seenUnlockIds: ['badge:I1'] })
  const menu = immersivePlayerHarness('../overlays/NoveltiesMenu')
  let tree = menu.draw({})
  assert.equal(menu.text(menu.find(tree, element => element.props.className === 'sx-novelties-count')), '1')
  assert.match(menu.text(tree), /Nueva ficha disponible/)
  assert.match(menu.text(tree), /Se ha desbloqueado «Ficha: Mitos y realidades del futuro profesional»/)
  assert.doesNotMatch(menu.text(tree), /Nueva insignia disponible/)
  tree.props.onOpenChange(true); tree = menu.draw({}); tree.props.onOpenChange(false)
  assert.deepEqual(Array.from(noveltyUi.useStudentUi().seenUnlockIds), ['badge:I1'])
  const closeItem = menu.find(tree, element => typeof element.props.onSelect === 'function' && element.props.children?.props?.['aria-label'] === 'Cerrar novedades')
  closeItem.props.onSelect()
  assert.deepEqual(Array.from(noveltyUi.useStudentUi().seenUnlockIds), ['badge:I1'])
  resetNoveltyUi(); tree = menu.draw({})
  const item = menu.find(tree, element => element.props.children?.props?.className === 'sx-novelty' && element.props.children.props.to === '/student/resources')
  item.props.onSelect()
  assert.deepEqual(Array.from(noveltyUi.useStudentUi().seenUnlockIds), ['ficha:ficha-mitos'])
  tree = menu.draw({})
  assert.equal(menu.text(menu.find(tree, element => element.props.className === 'sx-novelties-count')), '1')
  assert.doesNotMatch(menu.text(tree), /Nueva ficha disponible/)
  const badge = menu.find(tree, element => element.props.children?.props?.className === 'sx-novelty')
  assert.equal(badge.props.children.props.to, '/student/profile?section=passport')
  badge.props.onSelect(); tree = menu.draw({})
  assert.match(menu.text(tree), /No tienes novedades pendientes/)
  assert.equal(menu.find(tree, element => element.props.className === 'sx-novelties-count'), undefined)
  menu.dispose()
  store.updateAdventure(() => store.createInitialAdventure()); journeyStore.updateJourney(() => journeyLogic.initialJourney()); resetNoveltyUi({ initialized: false })
  const empty = immersivePlayerHarness('../overlays/NoveltiesMenu')
  tree = empty.draw({}); assert.match(empty.text(tree), /No tienes novedades pendientes/)
  empty.dispose(); noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
})

test('bell appears in both maps and module headers but is absent inside the player', () => {
  for (const route of ['/student/missions', '/student/exploration', '/student/journal', '/student/resources', '/student/conversations']) assert.match(render(route), /aria-label="Novedades"/)
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  assert.doesNotMatch(render('/student/missions?actividad=mission-welcome'), /aria-label="Novedades"|Nueva insignia/)
})

test('badge queue waits behind arrival, introduction, check-in and manual help, and pauses during activities', () => {
  const adventure = { ...store.createInitialAdventure(), completedMissionIds: ['welcome', 'story', 'future', 'beliefs'] }
  const { getNextOverlay } = load(path.resolve('src/features/student-experience/overlays/overlay-context.ts'))
  resetNoveltyUi()
  let ui = noveltyUi.useStudentUi()
  assert.equal(noveltyLogic.getNextBadge(adventure, ui, true, false), undefined)
  assert.equal(noveltyLogic.getNextBadge(adventure, ui, false, true), undefined)
  assert.equal(noveltyLogic.getNextBadge(adventure, ui, false, false).code, 'I1')
  ui = noveltyLogic.markBadgeAnnounced(ui, 'I1')
  assert.equal(noveltyLogic.getNextBadge(adventure, ui, false, false).code, 'I2')
  ui = noveltyLogic.markBadgeAnnounced(ui, 'I2')
  assert.equal(noveltyLogic.getNextBadge(adventure, ui, false, false), undefined)
  assert.equal(noveltyLogic.markBadgeAnnounced(ui, 'I2'), ui)
  for (const [patch, kind] of [[{ introsSeen: {} }, 'intro'], [{ checkInPromptDismissedOn: undefined }, 'check-in']]) {
    const current = { ...ui, ...patch }
    const overlay = getNextOverlay({ adventure, ui: current, view: 'missions', activityOpen: false })
    assert.equal(overlay.kind, kind)
    assert.equal(noveltyLogic.getNextBadge(adventure, current, false, !!overlay), undefined)
  }
  const arrivalAdventure = { ...adventure, completedMissionIds: noveltyData.fieldMissions.map(mission => mission.id) }
  const current = { ...ui, cityArrivalSeen: false }
  assert.equal(getNextOverlay({ adventure: arrivalAdventure, ui: current, view: 'missions', activityOpen: false }).kind, 'arrival')
  assert.equal(noveltyLogic.getNextBadge(arrivalAdventure, current, false, true), undefined)
  noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
})

test('badge toast expires after seven seconds without reset on rerenders and cancels its timer when paused', async () => {
  const badge = noveltyLogic.getEarnedBadges({ ...store.createInitialAdventure(), completedMissionIds: ['welcome'] })[0]
  const clock = followUpClock(), toast = immersivePlayerHarness('../overlays/BadgeToast')
  let dismissed = 0
  try {
    const tree = toast.draw({ badge, onDismiss: () => dismissed++ })
    assert.equal(tree.props.role, 'status'); assert.equal(tree.props['aria-live'], 'polite')
    assert.ok(toast.text(tree).includes('Nueva insignia')); assert.ok(toast.text(tree).includes(badge.title)); assert.ok(toast.text(tree).includes(badge.message))
    assert.equal(toast.find(tree, element => element.props.to).props.to, '/student/profile?section=passport')
    assert.ok(toast.find(tree, element => element.props['aria-label'] === 'Cerrar aviso'))
    await clock.tick(6999); assert.equal(dismissed, 0)
    toast.draw({ badge, onDismiss: () => dismissed++ }); await clock.tick(1); assert.equal(dismissed, 1)
    assert.equal(clock.pending, 0); toast.dispose()
    const interrupted = immersivePlayerHarness('../overlays/BadgeToast')
    interrupted.draw({ badge, onDismiss: () => dismissed++ }); await clock.tick(3000); interrupted.dispose(); await clock.tick(4000)
    assert.equal(dismissed, 1); assert.equal(clock.pending, 0)
  } finally { toast.dispose(); clock.restore() }
})

test('overlay queue resumes earned badges after the player and presents them consecutively without duplication', async () => {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), completedMissionIds: ['welcome', 'story', 'future', 'beliefs'] }))
  resetNoveltyUi()
  const checkIn = load(path.resolve('src/features/student-experience/overlays/checkIn.ts'))
  const queue = immersivePlayerHarness('../overlays/OverlayQueue', {
    'react-router': { ...nativeRequire('react-router'), useNavigate: () => () => {} },
    './checkIn': { ...checkIn, useCheckInDay: () => checkIn.localDateKey(new Date()) },
  })
  const clock = followUpClock()
  const findBadge = tree => queue.find(tree, element => element.type.name === 'BadgeToast')
  const props = { view: 'missions', activityOpen: true, children: null }
  try {
    let tree = queue.draw(props); assert.equal(findBadge(tree), undefined)
    tree = queue.draw({ ...props, activityOpen: false }); assert.equal(findBadge(tree).props.badge.code, 'I1')
    const first = immersivePlayerHarness('../overlays/BadgeToast')
    first.draw(findBadge(tree).props); await clock.tick(7000); first.dispose()
    tree = queue.draw({ ...props, activityOpen: false }); assert.equal(findBadge(tree).props.badge.code, 'I2')
    findBadge(tree).props.onDismiss()
    tree = queue.draw({ ...props, activityOpen: false }); assert.equal(findBadge(tree), undefined)
    assert.deepEqual(Array.from(noveltyUi.useStudentUi().announcedBadgeCodes), ['I1', 'I2'])
    resetNoveltyUi({ introsSeen: {} }); tree = queue.draw({ ...props, activityOpen: false }); assert.equal(findBadge(tree), undefined)
  } finally { queue.dispose(); clock.restore(); store.updateAdventure(() => store.createInitialAdventure()); noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState()) }
})

test('student shell synchronizes v2 milestones into real levels and access without altering saved answers or private records', () => {
  const { specActivityByMission } = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const fixture = followUpFixture()
  const saved = { ...journeyStore.useJourney(), drafts: { [fixture.key]: 'Borrador anterior conservado' } }
  const initial = store.createInitialAdventure()
  store.updateAdventure(() => ({ ...initial, journal: [{ ...initial.journal[0], id: 'private-entry', body: 'Texto privado conservado' }], readinessCheckIns: [{ id: 'saved-signal', value: 6, createdAt: new Date().toISOString(), linkedActivityId: 'daily-check-in' }] }))
  const privateBefore = JSON.stringify([store.useAdventure().journal, store.useAdventure().readinessCheckIns, store.useAdventure().conversations])
  resetNoveltyUi()
  const shell = immersivePlayerHarness('../StudentShell', {
    'react-router': { ...nativeRequire('react-router'), useLocation: () => ({ pathname: '/student/missions', search: '' }) },
    '@/features/occupation-exploration/OccupationExplorationContext': { useOccupationExplorationContext: () => ({}) },
  })
  try {
    for (const [count, level, codes] of [[1, 1, ['I1']], [3, 1, ['I1']], [4, 2, ['I1', 'I2']], [fieldMissions.length, 3, ['I1', 'I2', 'I3']]]) {
      const completed = fieldMissions.slice(0, count)
      journeyStore.updateJourney(() => ({ ...saved, progress: Object.fromEntries(completed.map(mission => [specActivityByMission[mission.id], { estado: 'completada' }])) }))
      const journeyBefore = JSON.stringify(journeyStore.useJourney())
      shell.draw({}); shell.draw({})
      const adventure = store.useAdventure()
      assert.deepEqual(Array.from(adventure.completedMissionIds), Array.from(completed, mission => mission.id))
      assert.equal(store.getTravelerLevel(adventure).number, level)
      assert.deepEqual(Array.from(noveltyLogic.getEarnedBadges(adventure).map(badge => badge.code)), codes)
      assert.equal(store.isCityUnlocked(adventure), count === fieldMissions.length)
      assert.equal(store.isFamilyUnlocked(adventure), count === fieldMissions.length)
      assert.equal(JSON.stringify(journeyStore.useJourney()), journeyBefore)
      assert.equal(JSON.stringify([adventure.journal, adventure.readinessCheckIns, adventure.conversations]), privateBefore)
      assert.equal(journeyStore.useJourney().submissions[0].id, fixture.entry.id)
      const synced = JSON.stringify(adventure)
      shell.draw({}); assert.equal(JSON.stringify(store.useAdventure()), synced)
    }
  } finally {
    shell.dispose(); store.updateAdventure(() => store.createInitialAdventure()); journeyStore.updateJourney(() => journeyLogic.initialJourney()); followUpStore.updateFollowUps(() => followUpStore.initialFollowUpState()); noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
  }
})

test('dialogue Enter completes text before advancing and never intercepts forms, controls or open dialogs', () => {
  const previous = { window: context.window, document: context.document, HTMLElement: context.HTMLElement }
  const listeners = new Set()
  let modal = false, done = false, completed = 0, advanced = 0
  class Target { constructor(blocked = false) { this.blocked = blocked } closest() { return this.blocked } }
  context.HTMLElement = Target
  context.document = { querySelector: () => modal }
  context.window = { addEventListener: (_, listener) => listeners.add(listener), removeEventListener: (_, listener) => listeners.delete(listener) }
  const dialogue = immersivePlayerHarness('DialogueBox', {
    '../overlays/useTypewriter': { useTypewriter: text => ({ visible: done ? text : '', done, complete: () => { done = true; completed++ } }) },
  })
  const props = { speakerId: 'companero', text: 'Texto completo accesible', onContinue: () => advanced++ }
  const enter = (patch = {}) => {
    let prevented = false
    const event = { key: 'Enter', target: new Target(), preventDefault() { prevented = true }, ...patch }
    for (const listener of listeners) listener(event)
    return prevented
  }
  try {
    const tree = dialogue.draw(props)
    assert.match(dialogue.text(tree), /Texto completo accesible/)
    assert.equal(enter(), true); assert.equal(completed, 1); assert.equal(advanced, 0)
    dialogue.draw(props)
    assert.equal(enter({ target: new Target(true) }), false)
    assert.equal(enter({ repeat: true }), false)
    assert.equal(enter({ defaultPrevented: true }), false)
    modal = true; assert.equal(enter(), false); assert.equal(advanced, 0)
    modal = false; assert.equal(enter(), true); assert.equal(advanced, 1)
  } finally { dialogue.dispose(); assert.equal(listeners.size, 0); Object.assign(context, previous) }
})

test('reduced-motion zone changes commit the destination immediately without scheduling a transition', () => {
  const previous = context.window
  const clock = followUpClock()
  context.window = { matchMedia: () => ({ matches: true }) }
  resetNoveltyUi({ lastMap: 'missions' })
  const transition = immersivePlayerHarness('../map/ZoneTransition')
  try {
    transition.draw({ zone: 'central' })
    assert.equal(noveltyUi.useStudentUi().lastMap, 'central')
    assert.equal(clock.pending, 0)
    assert.equal(transition.draw({ zone: 'central' }), null)
    assert.equal(clock.pending, 0)
  } finally { transition.dispose(); clock.restore(); context.window = previous; noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState()) }
})

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
      const { StudentActivityPlayer } = load(path.resolve('src/features/student-experience/player/StudentActivityPlayer.tsx'))
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(StudentActivityPlayer, { activity, onClose() {}, onNext() {} })))
      assert.ok(html.includes(activity.titulo), `${activity.id}/${node.id}`)
      assert.match(html, /aria-label="Salir de la actividad"/)
      assert.match(html, /fixed inset-0 z-40/)
      assert.match(html, /sx-root sx-player location-/)
      assert.doesNotMatch(html, /\bpts\b|\bpuntos\b|type="file"|Volver atrás/)
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

test('phase 8 path sequence respects both completion records without changing catalog or real thresholds', () => {
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const originalIds = fieldMissions.map(mission => mission.id)
  const adventure = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  let points = logic.getCaminoPoints(adventure, journey)
  assert.deepEqual(Array.from(points.slice(0, 3), point => point.id), ['welcome', 'beliefs', 'story'])
  points.slice(0, 3).forEach((point, index) => {
    assert.equal(point.x, fieldMissions[index].x); assert.equal(point.y, fieldMissions[index].y)
  })
  assert.equal(points[0].status, 'available')
  assert.ok(points.slice(1, -1).every(point => point.status === 'locked'))
  assert.equal(logic.getNextCaminoActivity(points).id, 'mission-welcome')
  adventure.completedMissionIds = ['welcome', 'future']
  points = logic.getCaminoPoints(adventure, journey)
  assert.equal(points[0].status, 'completed')
  assert.equal(points[1].status, 'available')
  assert.equal(points.find(point => point.id === 'future').status, 'completed')
  assert.equal(logic.getNextCaminoActivity(points).id, 'enc-mitos')
  journey.progress['enc-mitos'] = { estado: 'completada' }
  points = logic.getCaminoPoints(adventure, journey)
  assert.equal(points[2].status, 'available')
  assert.equal(logic.getNextCaminoActivity(points).id, 'mission-story')
  journey.progress['mission-story'] = { estado: 'completada' }
  points = logic.getCaminoPoints(adventure, journey)
  assert.equal(logic.getNextCaminoActivity(points), null)
  assert.equal(logic.getRecommendedPoint(points.map(point => point.id === 'city' ? { ...point, status: 'locked' } : point)), undefined)
  assert.ok(points.slice(3, -1).filter(point => point.id !== 'future').every(point => point.status === 'locked'))
  assert.equal(logic.getPointDetails(points.find(point => point.id === 'future'), adventure, journey).revision, true)
  assert.deepEqual(Array.from(fieldMissions, mission => mission.id), Array.from(originalIds))
  assert.equal(store.prototypeAllUnlocked, true)
  assert.equal(store.isCityUnlocked({ ...adventure, completedMissionIds: ['welcome', 'beliefs', 'story'] }), false)
  assert.equal(logic.getZoneProgress('missions', { ...adventure, completedMissionIds: ['welcome'] }, journey).value, 37.5)
})

test('phase 8 direct links open blocked details instead of starting unavailable players', () => {
  journeyStore.updateJourney(() => journeyLogic.initialJourney())
  for (const id of ['enc-mitos', 'mission-story', 'mission-future', 'act-06']) {
    const html = render('/student/missions?actividad=' + id)
    assert.match(html, /sx-map-viewport/)
    assert.doesNotMatch(html, /aria-label="Salir de la actividad"/)
  }
  assert.match(render('/student/missions?actividad=mission-welcome'), /aria-label="Salir de la actividad"/)
  assert.match(render('/student/missions?actividad=enc-mitos', { completedMissionIds: ['welcome'] }), /aria-label="Salir de la actividad"/)
  assert.match(render('/student/missions?actividad=mission-future&revision=1', { completedMissionIds: ['future'] }), /aria-label="Salir de la actividad"/)
  let params = new URLSearchParams('actividad=enc-mitos&revision=1')
  const guard = immersivePlayerHarness('../map/CaminoScreen', {
    'react-router': { useSearchParams: () => [params, next => { params = next }] },
  })
  store.updateAdventure(() => store.createInitialAdventure())
  const tree = guard.draw({})
  assert.equal(tree.props.zone, 'missions')
  assert.equal(params.get('punto'), 'beliefs')
  assert.equal(params.has('actividad'), false); assert.equal(params.has('revision'), false)
  params = new URLSearchParams('actividad=unknown')
  guard.draw({})
  assert.equal(params.toString(), '')
  guard.dispose()
})

test('phase 8 finish overrides follow the selected path and omit closed legacy suggestions', () => {
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const { FinishScreen } = load(path.resolve('src/features/student-experience/player/FinishScreen.tsx'))
  const adventure = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  for (const [completed, expected] of [[['welcome'], 'enc-mitos'], [['welcome', 'beliefs'], 'mission-story'], [['welcome', 'beliefs', 'story'], undefined]]) {
    adventure.completedMissionIds = completed
    const next = logic.getNextCaminoActivity(logic.getCaminoPoints(adventure, journey))
    assert.equal(next?.id, expected)
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(FinishScreen, {
      activity: journeyContent.activityById('enc-mitos'), nextActivity: next ?? undefined,
      allowLegacySuggestion: false, onClose() {}, onNext() {},
    })))
    assert.doesNotMatch(html, /Revisar mis propias creencias/)
    if (!expected) assert.doesNotMatch(html, /Seguir hacia/)
  }
  const player = immersivePlayerHarness('StudentActivityPlayer')
  const activity = journeyContent.activityById('mission-welcome')
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), progress: { [activity.id]: { estado: 'completada', nodoActualId: '$fin' } } }))
  let tree = player.draw({ activity, nextActivityOverride: null, onClose() {}, onNext() {} })
  let finish = player.find(tree, element => element.type?.name === 'FinishScreen')
  assert.equal(finish.props.nextActivity, undefined); assert.equal(finish.props.allowLegacySuggestion, false)
  tree = player.draw({ activity, onClose() {}, onNext() {} })
  finish = player.find(tree, element => element.type?.name === 'FinishScreen')
  assert.equal(finish.props.allowLegacySuggestion, true)
  assert.equal(finish.props.nextActivity?.id, activity.siguienteSugerida)
  player.dispose(); journeyStore.updateJourney(() => journeyLogic.initialJourney())
})

test('phase 8 toggling the overlaid panel preserves a zoomed and panned map transform', () => {
  const previous = { ResizeObserver: context.ResizeObserver, setTimeout: context.setTimeout, clearTimeout: context.clearTimeout }
  context.ResizeObserver = class { observe() {} disconnect() {} }
  context.setTimeout = setTimeout; context.clearTimeout = clearTimeout
  const canvas = immersivePlayerHarness('../map/MapCanvas')
  const ref = { current: null }
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const props = { ref, points: logic.getCaminoPoints(store.createInitialAdventure(), journeyLogic.initialJourney()), panelOpen: true, variant: 'route', onSelect() {}, onScaleChange() {}, backgroundImage: '', label: 'Mapa' }
  const mount = tree => { tree.props.ref.current = { getBoundingClientRect: () => ({ width: 1280, height: 752 }), addEventListener() {}, removeEventListener() {} } }
  const transform = tree => canvas.find(tree, element => element.props.className === 'sx-map-canvas').props.style.transform
  try {
    canvas.draw(props, mount)
    ref.current.setScale(.9)
    let tree = canvas.draw(props, mount)
    tree.props.onPointerDown({ button: 0, target: { closest: () => null }, pointerId: 1, clientX: 500, clientY: 400, currentTarget: { setPointerCapture() {} } })
    tree.props.onPointerMove({ pointerId: 1, clientX: 450, clientY: 350 })
    tree = canvas.draw(props, mount)
    const before = transform(tree)
    tree = canvas.draw({ ...props, panelOpen: false }, mount)
    assert.equal(transform(tree), before)
    tree = canvas.draw(props, mount)
    assert.equal(transform(tree), before)
    ref.current.focusPoint('story')
    tree = canvas.draw(props, mount)
    assert.notEqual(transform(tree), before)
    assert.match(transform(tree), /scale\(0.9\)/)
  } finally { canvas.dispose(); Object.assign(context, previous) }
})

test('phase 8 point links focus a known drawer and closing removes only its parameter', () => {
  const previousWindow = context.window
  context.window = { ...previousWindow, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) }
  let params = new URLSearchParams('punto=beliefs&keep=1'), focused
  const layout = immersivePlayerHarness('../map/MapScreenLayout', {
    'react-router': { useNavigate: () => () => {}, useSearchParams: () => [params, next => { params = typeof next === 'function' ? next(params) : next }] },
    '../overlays/overlay-context': { useStudentOverlays: () => ({ openGuide() {}, openCheckIn() {} }) },
  })
  const adventure = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const props = { zone: 'missions', adventure, journey, points: logic.getCaminoPoints(adventure, journey) }
  const mount = tree => {
    layout.find(tree, element => element.props.label === 'Aventura · Camino de misiones').props.ref.current = { focusPoint: id => { focused = id } }
  }
  try {
    let tree = layout.draw(props, mount)
    let drawer = layout.find(tree, element => element.type?.name === 'ActivityDrawer')
    assert.equal(drawer.props.point.id, 'beliefs'); assert.equal(drawer.props.details.disabled, true)
    assert.equal(focused, 'beliefs')
    drawer.props.onClose(); assert.equal(params.toString(), 'keep=1')
    params = new URLSearchParams('punto=unknown'); focused = undefined
    tree = layout.draw(props, mount); drawer = layout.find(tree, element => element.type?.name === 'ActivityDrawer')
    assert.equal(drawer.props.point, undefined); assert.equal(focused, undefined)
  } finally { layout.dispose(); context.window = previousWindow }
})

test('phase 8 map labels contain names only and use activity icons or a question mark', () => {
  const { MapNode } = load(path.resolve('src/features/student-experience/map/MapNode.tsx'))
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const adventure = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  const points = [...logic.getCaminoPoints(adventure, journey), ...logic.getCiudadPoints(adventure, journey)]
  for (const [id, icon] of [['welcome', 'book-open'], ['beliefs', 'book-open'], ['story', 'feather'], ['compass', 'clipboard-list'], ['forest-fire', 'building-2'], ['city', 'key-round']]) {
    const point = points.find(point => point.id === id)
    const html = renderToStaticMarkup(React.createElement(MapNode, { point: { ...point, status: 'available' }, onSelect() {}, onFocus() {} }))
    assert.match(html, new RegExp('lucide-' + icon)); assert.ok(!html.includes(point.subtitle))
    const locked = renderToStaticMarkup(React.createElement(MapNode, { point: { ...point, status: 'locked' }, onSelect() {}, onFocus() {} }))
    assert.match(locked, /lucide-circle-question-mark/); assert.doesNotMatch(locked, /lucide-lock-keyhole/)
  }
  assert.equal(logic.getPointDetails(points.find(point => point.id === 'forest-fire'), adventure, journey).type, 'Central de casos')
  const header = render('/student/missions').match(/<header class="sx-map-header">([\s\S]*?)<\/header>/)[1]
  assert.match(header, /Orientación[\s\S]*Explora[\s\S]*Novedades[\s\S]*Menú de Alex/); assert.doesNotMatch(header, /Niv\.|sx-user-details/)
  assert.doesNotMatch(render('/student/missions'), /Arrastra el mapa para explorar/)
})

test('phase 8 available panel caps four pending implemented actions and links to the full list', () => {
  const { AdventurePanel } = load(path.resolve('src/features/student-experience/map/AdventurePanel.tsx'))
  const points = Array.from({ length: 7 }, (_, index) => ({ id: 'p' + index, title: 'Disponible ' + index, subtitle: 'En progreso', status: 'available', actionEnabled: true }))
  points.push({ ...points[0], id: 'city' }, { ...points[0], id: 'done', status: 'completed' }, { ...points[0], id: 'blocked', status: 'locked' }, { ...points[0], id: 'not-implemented', actionEnabled: false })
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(AdventurePanel, {
    points, adventure: store.createInitialAdventure(), progress: { label: 'Progreso', value: 0 }, onSelect() {}, onCheckIn() {},
  })))
  assert.equal((html.match(/sx-available-dot/g) ?? []).length, 4)
  assert.match(html, /href="\/student\/activities"[^>]*>Ver más/)
  assert.doesNotMatch(html, /sx-panel-pagination|Disponible 4|Disponible 5|Disponible 6/)
})

test('phase 8 activities combine zones, classify publications and return to the matching map', () => {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), completedMissionIds: ['welcome'], solvedCaseIds: ['river-mystery'] }))
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), progress: { 'enc-mitos': { estado: 'en_curso' } } }))
  const view = immersivePlayerHarness('../modules/StudentActivitiesView')
  let tree = view.draw({})
  let entries = view.find(tree, element => element.props.className === 'sx-activities-list').props.children
  assert.deepEqual(Array.from(entries, element => element.key), ['beliefs', 'forest-fire', 'research', 'mara-test'])
  assert.match(view.text(tree), /Camino · InformativaEn progreso/)
  assert.match(view.text(tree), /Ciudad · Central de casosDisponible/)
  const href = entries[0].props.children.at(-1).props.to
  assert.equal(href, '/student/missions?punto=beliefs')
  view.button(tree, 'Realizadas').props.onClick(); tree = view.draw({})
  entries = view.find(tree, element => element.props.className === 'sx-activities-list').props.children
  assert.deepEqual(Array.from(entries, element => element.key), ['welcome', 'river-mystery'])
  assert.equal(entries[1].props.children.at(-1).props.to, '/student/exploration?punto=river-mystery')
  store.updateAdventure(current => ({ ...current, videos: [{ id: 'publication' }] }))
  tree = view.draw({})
  entries = view.find(tree, element => element.props.className === 'sx-activities-list').props.children
  assert.ok(entries.some(element => element.key === 'research'))
  view.dispose(); journeyStore.updateJourney(() => journeyLogic.initialJourney())
  const html = render('/student/activities')
  assert.match(html, /Mis actividades/); assert.match(html, /Actividades disponibles/)
  const { getStudentView } = load(path.resolve('src/features/student-experience/views.ts'))
  assert.equal(getStudentView('/student/activities'), 'activities')
  const { guideSteps } = load(path.resolve('src/features/student-experience/guide-texts.ts'))
  assert.match(guideSteps.activities[0], /Ver en el mapa/)
})

test('phase 8 palette is local to the student route marker and covers inherited portal themes', () => {
  const css = readFileSync(path.resolve('src/features/student-experience/student-experience.css'), 'utf8')
  assert.match(css, /body:has\(\[data-student-experience\]\)/)
  assert.match(css, /body:has\(\[data-student-experience\]\) \.theme-student/)
  assert.match(css, /--primary: #2457b8;/)
  assert.match(css, /--sx-module-bg: var\(--background\)/)
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?sx-node-circle::before[\s\S]*?animation: none/)
  assert.match(render('/student/activities'), /data-student-experience="true"/)
  assert.match(render('/student/cases/forest-fire'), /data-student-experience="true"/)
})


test('phase 8 every novelty kind retains its existing destination and unread two-line copy', () => {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), completedMissionIds: fieldMissions.map(mission => mission.id), solvedCaseIds: ['forest-fire'] }))
  journeyStore.updateJourney(() => ({ ...journeyLogic.initialJourney(), resources: ['ficha-mitos'] }))
  resetNoveltyUi()
  const menu = immersivePlayerHarness('../overlays/NoveltiesMenu'), tree = menu.draw({})
  for (const [title, href] of [
    ['Nueva ficha disponible', '/student/resources'],
    ['Nueva insignia disponible', '/student/profile?section=passport'],
    ['Nuevo héroe disponible', '/student/testimonials'],
    ['Nueva ciudad disponible', '/student/exploration'],
    ['Nueva conversación familiar disponible', '/student/conversations'],
  ]) {
    const row = menu.find(tree, element => element.props.className === 'sx-novelty' && menu.text(element).includes(title))
    assert.ok(row, title); assert.equal(row.props.to, href)
    assert.match(menu.text(row), /Se ha desbloqueado «.+»/)
    assert.ok(menu.find(row, element => element.props.className === 'sx-novelty-dot'))
  }
  menu.dispose(); store.updateAdventure(() => store.createInitialAdventure())
  journeyStore.updateJourney(() => journeyLogic.initialJourney()); noveltyUi.updateStudentUi(() => noveltyUi.initialStudentUiState())
})

test('PNG maps fill their triple-sized worlds and cover the entire viewport at minimum zoom', () => {
  const geometry = load(path.resolve('src/features/student-experience/map/geometry.ts'))
  const { canvasSize, imageSize, initialScale, getMinimumScale, zoomTransform, clampTransform, mapPosition } = geometry
  assert.equal(canvasSize.width, 5016); assert.equal(canvasSize.height, 2823)
  assert.equal(initialScale, .5)
  for (const name of ['journey-map', 'city-map']) {
    const png = readFileSync(path.resolve(`public/images/adventure/${name}.png`))
    assert.equal(png.subarray(1, 4).toString(), 'PNG')
    assert.equal(png.readUInt32BE(16), imageSize.width)
    assert.equal(png.readUInt32BE(20), imageSize.height)
    const markup = render(name === 'journey-map' ? '/student/missions' : '/student/exploration')
    assert.match(markup, new RegExp(`src="/images/adventure/${name}\\.png"`))
    assert.match(markup, /width:5016px;height:2823px/)
    assert.match(markup, /scale\(0.5\)/)
  }
  for (const bounds of [{ width: 1280, height: 752 }, { width: 1440, height: 852 }, { width: 360, height: 752 }, { width: 1907, height: 865 }]) {
    const minimum = getMinimumScale(bounds)
    const fitted = zoomTransform({ x: -999, y: -700, scale: .5 }, 0, { x: 0, y: bounds.height }, bounds)
    assert.equal(fitted.scale, minimum)
    const width = canvasSize.width * minimum, height = canvasSize.height * minimum
    assert.ok(width >= bounds.width - 1e-8); assert.ok(height >= bounds.height - 1e-8)
    assert.ok(Math.abs(width - bounds.width) < 1e-8 || Math.abs(height - bounds.height) < 1e-8)
    for (const x of [-9999, 9999]) for (const y of [-9999, 9999]) {
      const dragged = clampTransform({ ...fitted, x, y }, bounds)
      assert.ok(dragged.x <= 1e-8); assert.ok(dragged.y <= 1e-8)
      assert.ok(dragged.x + width >= bounds.width - 1e-8)
      assert.ok(dragged.y + height >= bounds.height - 1e-8)
      assert.ok(Math.abs(dragged.x - (x < 0 ? bounds.width - width : 0)) < 1e-8)
      assert.ok(Math.abs(dragged.y - (y < 0 ? bounds.height - height : 0)) < 1e-8)
    }
  }
  const customSize = { width: 6000, height: 3000 }
  const position = mapPosition({ x: 540, y: 330 }, customSize)
  assert.equal(position.x, 3000); assert.equal(position.y, 1500)
  assert.equal(getMinimumScale({ width: 1000, height: 600 }, customSize), .2)
})

test('phase 10 focusing boundary points never reveals background beside the overlaid panel', () => {
  const { focusTransform, canvasSize, getMinimumScale } = load(path.resolve('src/features/student-experience/map/geometry.ts'))
  for (const bounds of [{ width: 1280, height: 752 }, { width: 360, height: 752 }, { width: 1907, height: 865 }]) {
    for (const scale of [getMinimumScale(bounds), .5, 1.4]) {
      for (const panelOpen of [false, true]) {
        for (const point of [{ x: 0, y: 0 }, { x: 1080, y: 660 }]) {
          const focused = focusTransform({ x: -100, y: -100, scale }, point, bounds, panelOpen)
          assert.ok(focused.x <= 1e-8); assert.ok(focused.y <= 1e-8)
          assert.ok(focused.x + canvasSize.width * focused.scale >= bounds.width - 1e-8)
          assert.ok(focused.y + canvasSize.height * focused.scale >= bounds.height - 1e-8)
        }
      }
    }
  }
})

test('phase 9 initial view is centered at 50 percent and panel toggles preserve even the fitted view', () => {
  const previous = { ResizeObserver: context.ResizeObserver, setTimeout: context.setTimeout, clearTimeout: context.clearTimeout }
  context.ResizeObserver = class { observe() {} disconnect() {} }
  context.setTimeout = setTimeout; context.clearTimeout = clearTimeout
  const { getMinimumScale, canvasSize } = load(path.resolve('src/features/student-experience/map/geometry.ts'))
  try {
    for (const variant of ['route', 'open']) {
      const canvas = immersivePlayerHarness('../map/MapCanvas'), ref = { current: null }
      const bounds = { width: 1280, height: 752 }
      let minimum
      const props = { ref, points: [], panelOpen: true, variant, onSelect() {}, onScaleChange() {}, onMinimumScaleChange: value => { minimum = value }, backgroundImage: '', label: 'Mapa' }
      const mount = tree => { tree.props.ref.current = { getBoundingClientRect: () => bounds, addEventListener() {}, removeEventListener() {} } }
      const transform = tree => canvas.find(tree, element => element.props.className === 'sx-map-canvas').props.style.transform
      canvas.draw(props, mount)
      let tree = canvas.draw(props, mount)
      assert.equal(transform(tree), `translate3d(${(bounds.width - canvasSize.width * .5) / 2}px, ${(bounds.height - canvasSize.height * .5) / 2}px, 0) scale(0.5)`)
      assert.equal(minimum, getMinimumScale(bounds))
      for (const scale of [.5, minimum, 1.4]) {
        ref.current.setScale(scale); tree = canvas.draw(props, mount)
        const before = transform(tree)
        assert.equal(transform(canvas.draw({ ...props, panelOpen: false }, mount)), before)
        assert.equal(transform(canvas.draw(props, mount)), before)
      }
      ref.current.centerMap(); tree = canvas.draw(props, mount)
      assert.match(transform(tree), /scale\(0.5\)/)
      canvas.dispose()
    }
  } finally { Object.assign(context, previous) }
})

test('phase 9 zoom controls use actual percentages and the viewport minimum', () => {
  const zoom = immersivePlayerHarness('../map/ZoomControls')
  let requested
  const props = { scale: .5, minimumScale: .06, onScale: value => { requested = value }, onZoom() {}, onCenter() {} }
  let tree = zoom.draw(props)
  const input = zoom.find(tree, element => element.type === 'input')
  assert.equal(input.props.value, 50); assert.equal(input.props.min, 6); assert.equal(input.props.max, 140)
  assert.equal(input.props['aria-valuetext'], '50 %')
  input.props.onChange({ target: { value: '25' } }); assert.equal(requested, .25)
  tree = zoom.draw({ ...props, scale: .06 })
  const minus = zoom.find(tree, element => element.props['aria-label'] === 'Alejar mapa')
  assert.equal(minus.props.disabled, true)
  zoom.dispose()
})

test('phase 9 panel has five direct links, a compact next-step action and the real traveler rank', () => {
  const panel = immersivePlayerHarness('../map/AdventurePanel', {
    '../overlays/checkIn': { useCheckInDay() {}, getTodayCheckIn: () => undefined },
  })
  const logic = load(path.resolve('src/features/student-experience/map/mapPoints.ts'))
  const adventure = store.createInitialAdventure(), journey = journeyLogic.initialJourney()
  const points = logic.getCaminoPoints(adventure, journey)
  let selected
  let tree = panel.draw({ adventure, points, recommended: points[0], progress: { label: 'Recorrido', value: 0 }, onSelect: id => { selected = id }, onCheckIn() {} })
  const links = panel.find(tree, element => element.props['aria-label'] === 'Accesos rápidos').props.children
  assert.deepEqual(Array.from(links, element => panel.text(element)), ['Mi perfil', 'Mi diario', 'En familia', 'Recursos', 'Información'])
  assert.deepEqual(Array.from(links, element => element.props.to), ['/student/profile', '/student/journal', '/student/conversations', '/student/resources', '/student/catalog/professions'])
  assert.ok(links.every(element => element.type !== 'button'))
  const next = panel.button(tree, 'Siguiente paso')
  assert.ok(next); assert.match(panel.text(next), /El inicio del viaje/)
  assert.doesNotMatch(panel.text(next), /Ver misión|Informativa|4 min/)
  next.props.onClick(); assert.equal(selected, 'welcome')
  let rank = panel.find(tree, element => element.props.className === 'sx-panel-level')
  assert.equal(rank.props['aria-label'], `Nivel ${store.getTravelerLevel(adventure).number}: ${store.getTravelerLevel(adventure).label}`)
  assert.match(panel.text(rank), /NIVEL01/)
  adventure.completedMissionIds = fieldMissions.map(mission => mission.id)
  tree = panel.draw({ adventure, points: [], progress: { label: 'Recorrido', value: 100 }, onSelect() {}, onCheckIn() {} })
  rank = panel.find(tree, element => element.props.className === 'sx-panel-level')
  assert.match(panel.text(rank), /NIVEL03Cartógrafo de posibilidades/)
  assert.equal(panel.button(tree, 'Siguiente paso'), undefined)
  panel.dispose()
})

test('separate student diary preserves free-entry saving and editing without changing signals', () => {
  store.updateAdventure(() => ({ ...store.createInitialAdventure(), journalOnboardingSeen: true }))
  const before = store.useAdventure()
  const signalBefore = JSON.stringify(before.readinessCheckIns)
  const diary = immersivePlayerHarness('../modules/StudentJournalView', {
    'react-router': { useSearchParams: () => [new URLSearchParams()] },
  })
  const part = (tree, name) => diary.find(tree, element => element.type?.name === name)
  let tree = diary.draw({})
  part(tree, 'JournalHome').props.onNew()
  tree = diary.draw({})
  part(tree, 'JournalEditor').props.onBodyChange('Una entrada privada de prueba.')
  tree = diary.draw({})
  part(tree, 'JournalEditor').props.onSave()
  let saved = store.useAdventure().journal.find(entry => entry.body === 'Una entrada privada de prueba.')
  assert.equal(store.useAdventure().journal.length, before.journal.length + 1)
  assert.equal(saved.kind, 'open')
  tree = diary.draw({})
  part(tree, 'JournalHome').props.onOpen(saved)
  tree = diary.draw({})
  part(tree, 'JournalDetail').props.onEdit()
  tree = diary.draw({})
  part(tree, 'JournalEditor').props.onBodyChange('Una entrada privada editada.')
  tree = diary.draw({})
  part(tree, 'JournalEditor').props.onSave()
  const edited = store.useAdventure().journal.find(entry => entry.id === saved.id)
  assert.equal(edited.body, 'Una entrada privada editada.')
  assert.equal(edited.createdAt, saved.createdAt)
  assert.equal(store.useAdventure().journal.length, before.journal.length + 1)
  assert.equal(JSON.stringify(store.useAdventure().readinessCheckIns), signalBefore)
  diary.dispose()
})

test('separate signal history reuses check-in editing and keyboard point selection without private entries', () => {
  const checkIn = load(path.resolve('src/features/student-experience/overlays/checkIn.ts'))
  store.updateAdventure(() => store.createInitialAdventure())
  checkIn.saveTodayCheckIn(7)
  const before = store.useAdventure()
  const today = checkIn.getTodayCheckIn(before)
  let opened = 0
  const history = immersivePlayerHarness('../modules/StudentSignalsView', {
    '../overlays/checkIn': { ...checkIn, useCheckInDay() {} },
    '../overlays/overlay-context': { useStudentOverlays: () => ({ openCheckIn: () => opened++ }) },
  })
  let tree = history.draw({})
  const edit = history.find(tree, element => history.text(element) === 'Cambiar mi señal' && element.props.onClick)
  edit.props.onClick()
  assert.equal(opened, 1)
  checkIn.saveTodayCheckIn(9)
  tree = history.draw({})
  assert.match(history.text(tree), /Señal seleccionada · 9\/10/)
  assert.equal(store.useAdventure().readinessCheckIns.length, before.readinessCheckIns.length)
  assert.equal(checkIn.getTodayCheckIn(store.useAdventure()).id, today.id)
  assert.equal(JSON.stringify(store.useAdventure().journal), JSON.stringify(before.journal))
  for (const entry of before.journal) assert.ok(!history.text(tree).includes(entry.body))
  const point = history.find(tree, element => element.props.role === 'button' && !element.props['aria-label'].endsWith('9 de 10'))
  point.props.onKeyDown({ key: 'Enter' })
  tree = history.draw({})
  const selectedValue = point.props['aria-label'].match(/: (\d+) de 10$/)[1]
  assert.match(history.text(tree), new RegExp(`Señal seleccionada · ${selectedValue}/10`))
  history.dispose()
})
