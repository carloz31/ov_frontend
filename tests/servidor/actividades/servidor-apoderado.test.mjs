import assert from 'node:assert/strict'
import test from 'node:test'
import { copia, esperar, fixtureServidor, jsonServidor } from '../../soporte/servidor-ayudas.mjs'

function fixture(usuario = '', cuentas = jsonServidor('cuentas')) {
  const app = fixtureServidor()
  const cuenta = app.load('src/store/servidor/cuenta.ts')
  cuenta.guardarUsuarioIngreso(usuario)
  const alumno = app.load('src/store/servidor/sesion.ts')
  const estadoAlumno = alumno.obtenerEstadoServidor()
  const localAlumno = app.load('src/store/journeyStore.ts').getJourneySnapshot()
  const aventuraAlumno = app.load('src/store/adventureStore.ts').useAdventure()
  const store = app.load('src/store/servidor/apoderado.ts')
  const persistencia = app.load('src/store/parentJourneyStore.ts')
  const contenidos = app.load('src/lib/servidor/contenidos.ts')
  let etapa = 'inicial'
  app.fetch((request) => {
    if (request.url === '/api/cuentas') return { body: cuentas }
    if (request.url === '/api/acciones/ingresar')
      return { body: { eventos_registrados: [], nuevos_desbloqueos: [] } }
    if (request.url.endsWith('/actividades')) return { body: jsonServidor(`apoderado-actividades-${etapa}`) }
    if (request.url === '/api/acciones/completar-actividad') {
      etapa = request.body.actividad === 'pad-01-rol' ? 'pad-01' : 'final'
      return { body: jsonServidor(`apoderado-completar-${request.body.actividad}`) }
    }
    if (request.url === '/api/desarrollo/reiniciar') return { body: { mensaje: 'Reiniciado' } }
    throw Error(`Petición inesperada: ${request.url}`)
  })
  return { ...app, store, persistencia, contenidos, alumno, estadoAlumno, localAlumno, aventuraAlumno }
}

for (const usuario of ['apo-rosa', 'est-ana', '']) {
  test(`el ingreso con usuario ${usuario || 'vacío'} selecciona al apoderado sin tocar al estudiante`, async () => {
    const app = fixture(usuario)
    const primero = app.store.ingresarApoderado()
    assert.equal(app.store.ingresarApoderado(), primero)
    assert.equal((await primero).tipo, 'ok')
    assert.equal(app.store.obtenerEstadoApoderado().cuenta, 'apo-rosa')
    assert.equal((await app.store.ingresarApoderado()).tipo, 'ok')
    assert.deepEqual(
      app.requests.map((r) => [r.method, r.url]),
      [
        ['GET', '/api/cuentas'],
        ['POST', '/api/acciones/ingresar'],
        ['GET', '/api/cuentas/apo-rosa/actividades'],
      ],
    )
    assert.equal(app.requests[1].body.cuenta, 'apo-rosa')
    assert.equal(app.alumno.obtenerEstadoServidor(), app.estadoAlumno)
    assert.equal(app.load('src/store/journeyStore.ts').getJourneySnapshot(), app.localAlumno)
    assert.equal(app.load('src/store/adventureStore.ts').useAdventure(), app.aventuraAlumno)
    assert.equal(app.load('src/store/servidor/cuenta.ts').cuentaActiva(), null)
    assert.deepEqual([...app.local.keys()], ['ov.parent-missions.v1'])
    assert.deepEqual(JSON.parse(app.sesion.get('ov.cuenta-servidor.v1')), { usuario, codigo: null })
  })
}

test('la selección usa primero el usuario y, en su ausencia, el menor código de apoderado', async () => {
  // DATO DE PRUEBA: otra cuenta para verificar orden y coincidencia sin depender de plataforma.
  const cuentas = [{ codigo: 'apo-zeta', nombre: 'Zeta', rol: 'APODERADO' }, ...jsonServidor('cuentas')]
  for (const [usuario, esperado] of [
    ['apo-zeta', 'apo-zeta'],
    ['otro', 'apo-rosa'],
  ]) {
    const app = fixture(usuario, cuentas)
    await app.store.ingresarApoderado()
    assert.equal(app.store.obtenerEstadoApoderado().cuenta, esperado)
  }
})

test('sin cuentas de apoderado se informa error sin ingresar ni pedir actividades', async () => {
  const app = fixture(
    '',
    jsonServidor('cuentas').filter((c) => c.rol === 'ESTUDIANTE'),
  )
  const respuesta = await app.store.ingresarApoderado()
  assert.equal(respuesta.tipo, 'http')
  assert.equal(respuesta.estado, 404)
  assert.equal(app.store.obtenerEstadoApoderado().error, respuesta)
  assert.equal(app.store.obtenerEstadoApoderado().cuenta, null)
  assert.deepEqual(
    app.requests.map((r) => r.url),
    ['/api/cuentas'],
  )
  assert.equal(app.alumno.obtenerEstadoServidor(), app.estadoAlumno)
  assert.equal(app.local.size, 0)
})

test('la lista toma estructura y disponibilidad del servidor y conserva exactamente los nodos JSON', () => {
  const app = fixture()
  const bloques = jsonServidor('apoderado-actividades-inicial')
  const lista = app.contenidos.actividadesApoderado(bloques)
  assert.deepEqual(copia(lista.actividades.map((a) => a.id)), ['pad-01-rol', 'pad-02-info'])
  assert.deepEqual(copia(lista.sinContenido), [])
  const { contenidoPorClave } = app.load('src/data/activities/contenidos.ts')
  for (const [indice, actividad] of lista.actividades.entries()) {
    const servidor = bloques[0].actividades[indice]
    assert.equal(actividad.titulo, servidor.titulo)
    assert.equal(actividad.orden, indice + 1)
    assert.deepEqual(copia(actividad.requisitos), [])
    assert.deepEqual(copia(actividad.nodos), copia(contenidoPorClave(servidor.contenido).nodos))
    assert.equal(Object.hasOwn(actividad, 'mapa'), false)
  }
  assert.deepEqual([...app.contenidos.disponiblesApoderado(bloques)], ['pad-01-rol'])
  assert.deepEqual(copia(app.contenidos.completadasApoderado(bloques)), [])
  // DATO DE PRUEBA: cambia el código de bloque, el orden y los títulos, conservando su espacio.
  bloques[0].codigo = 'OTRA_FAMILIA'
  bloques[0].actividades.reverse()
  bloques[0].actividades[0].titulo = 'Título del servidor'
  const reordenadas = app.contenidos.actividadesApoderado(bloques).actividades
  assert.deepEqual(copia(reordenadas.map((a) => [a.id, a.orden])), [
    ['pad-02-info', 1],
    ['pad-01-rol', 2],
  ])
  assert.equal(reordenadas[0].titulo, 'Título del servidor')
  assert.deepEqual(copia(app.contenidos.actividadesApoderado(jsonServidor('actividades-inicial'))), {
    actividades: [],
    sinContenido: [],
  })
})

test('el contenido ausente se informa aparte y ni este ni lo invisible cuentan como progreso', () => {
  const app = fixture()
  const bloques = jsonServidor('apoderado-actividades-final')
  // DATO DE PRUEBA: una actividad completa sin contenido y otra invisible para verificar DA12.
  bloques[0].actividades.push({
    ...bloques[0].actividades[0],
    codigo: 'sin-json',
    contenido: 'sin_contenido_prueba',
  })
  bloques[0].actividades[1].visible = false
  assert.deepEqual(copia(app.contenidos.actividadesApoderado(bloques).sinContenido), ['sin-json'])
  assert.deepEqual(copia(app.contenidos.actividadesApoderado(bloques).actividades.map((a) => a.id)), [
    'pad-01-rol',
  ])
  assert.deepEqual([...app.contenidos.disponiblesApoderado(bloques)], ['pad-01-rol'])
  assert.deepEqual(copia(app.contenidos.completadasApoderado(bloques)), ['pad-01-rol'])
})

test('completar refresca el servidor y conserva nodo, intentos, elecciones y la cuenta local', async () => {
  const app = fixture('apo-rosa')
  const { initialJourney } = app.load('src/lib/activities/logic.ts')
  const narrativa = app.load('src/data/activities/contenidos.ts').contenidoPorClave('pad_01_acompanar')
  const pregunta = narrativa.nodos.find((n) => n.tipo === 'pregunta')
  // DATO DE PRUEBA: elección histórica que debe sobrevivir a la hidratación del servidor.
  const eleccion = narrativa.nodos.find((n) => n.tipo === 'eleccion')
  const actual = initialJourney()
  actual.progress[narrativa.id] = {
    estudianteId: 'apo-rosa',
    actividadId: narrativa.id,
    estado: 'en_curso',
    nodoActualId: pregunta.id,
  }
  actual.attempts.push({
    estudianteId: 'apo-rosa',
    actividadId: narrativa.id,
    nodoId: pregunta.id,
    opcionIds: [pregunta.opciones[0].id],
    correcta: false,
    numeroIntento: 1,
    revelada: false,
    respondidaEn: '2026-10-07T10:00:00',
  })
  actual.choices.push({
    estudianteId: 'apo-rosa',
    actividadId: narrativa.id,
    nodoId: eleccion.id,
    opcionId: eleccion.opciones[0].id,
    respondidaEn: '2026-10-07T10:00:00',
  })
  app.persistencia.updateParentJourney(() => actual, 'apo-rosa')
  app.persistencia.updateParentJourney((j) => ({ ...j, resources: ['ficha-local'] }))
  const local = copia(app.persistencia.getParentJourney())
  await app.store.ingresarApoderado()
  const promesa = app.store.completarActividadApoderado('pad-01-rol')
  assert.equal(app.store.completarActividadApoderado('pad-01-rol'), promesa)
  assert.deepEqual(copia(await promesa), {
    tipo: 'ok',
    datos: jsonServidor('apoderado-completar-pad-01-rol'),
  })
  const guardado = app.persistencia.getParentJourney('apo-rosa')
  assert.equal(guardado.progress[narrativa.id].estado, 'completada')
  assert.equal(guardado.progress[narrativa.id].nodoActualId, pregunta.id)
  assert.deepEqual(copia(guardado.attempts), copia(actual.attempts))
  assert.deepEqual(copia(guardado.choices), copia(actual.choices))
  assert.deepEqual(copia(app.persistencia.getParentJourney()), local)
  const bloques = app.store.obtenerEstadoApoderado().actividades.datos
  assert.deepEqual(copia(bloques), jsonServidor('apoderado-actividades-pad-01'))
  assert.deepEqual([...app.contenidos.disponiblesApoderado(bloques)], ['pad-01-rol', 'pad-02-info'])
  assert.deepEqual(copia(app.contenidos.completadasApoderado(bloques)), ['pad-01-rol'])
  assert.deepEqual(
    app.requests.slice(-2).map((r) => r.url),
    ['/api/acciones/completar-actividad', '/api/cuentas/apo-rosa/actividades'],
  )
  assert.equal(app.store.obtenerEstadoApoderado().enviando, null)
  const recarga = fixtureServidor({ guardado: Object.fromEntries(app.local) }).load(
    'src/store/parentJourneyStore.ts',
  )
  assert.deepEqual(copia(recarga.getParentJourney('apo-rosa')), copia(guardado))
})

test('un 409 conserva progreso, comparte la promesa y permite reintentar después', async () => {
  const app = fixture()
  await app.store.ingresarApoderado()
  const antes = app.local.get('ov.parent-missions.v1')
  const seccion = app.store.obtenerEstadoApoderado().actividades
  let resolver
  app.fetch(
    () =>
      new Promise((resolve) => {
        resolver = resolve
      }),
  )
  const primero = app.store.completarActividadApoderado('pad-02-info')
  assert.equal(app.store.completarActividadApoderado('pad-02-info'), primero)
  const otro = await app.store.completarActividadApoderado('pad-01-rol')
  assert.equal(otro.estado, 409)
  await esperar()
  resolver({ status: 409, body: { detail: { mensaje: 'Actividad bloqueada' } } })
  const respuesta = await primero
  assert.equal(respuesta.tipo, 'bloqueado')
  assert.equal(app.local.get('ov.parent-missions.v1'), antes)
  assert.equal(app.store.obtenerEstadoApoderado().actividades, seccion)
  assert.equal(app.store.obtenerEstadoApoderado().enviando, null)
  app.fetch(() => ({ status: 409, body: { detail: { mensaje: 'Actividad bloqueada' } } }))
  assert.equal((await app.store.completarActividadApoderado('pad-02-info')).tipo, 'bloqueado')
  assert.equal(app.requests.filter((r) => r.url.includes('completar-actividad')).length, 2)
})

for (const ruta of ['/api/cuentas', '/api/acciones/ingresar', '/api/cuentas/apo-rosa/actividades']) {
  test(`se descarta la respuesta tardía de ${ruta} al limpiar la sesión`, async () => {
    const app = fixture()
    let resolver
    app.fetch((request) => {
      if (request.url === ruta)
        return new Promise((resolve) => {
          resolver = resolve
        })
      if (request.url === '/api/cuentas') return { body: jsonServidor('cuentas') }
      return { body: { eventos_registrados: [], nuevos_desbloqueos: [] } }
    })
    const pendiente = app.store.ingresarApoderado()
    await esperar()
    if (ruta.endsWith('/actividades')) {
      const consulta = app.store.asegurarActividadesApoderado()
      assert.equal(app.store.asegurarActividadesApoderado(), consulta)
      assert.equal(app.requests.filter((r) => r.url === ruta).length, 1)
    }
    app.store.limpiarEstadoApoderado()
    const limpio = app.store.obtenerEstadoApoderado()
    resolver({
      body:
        ruta === '/api/cuentas'
          ? jsonServidor('cuentas')
          : ruta.endsWith('/actividades')
            ? jsonServidor('apoderado-actividades-inicial')
            : { eventos_registrados: [], nuevos_desbloqueos: [] },
    })
    assert.equal((await pendiente).estado, 409)
    assert.equal(app.store.obtenerEstadoApoderado(), limpio)
    assert.equal(app.local.size, 0)
  })
}

test('una finalización tardía tras limpiar no publica ni sobrescribe el progreso guardado', async () => {
  const app = fixture()
  await app.store.ingresarApoderado()
  let resolver
  app.fetch(
    () =>
      new Promise((resolve) => {
        resolver = resolve
      }),
  )
  const pendiente = app.store.completarActividadApoderado('pad-01-rol')
  await esperar()
  const disco = app.local.get('ov.parent-missions.v1')
  app.store.limpiarEstadoApoderado()
  const limpio = app.store.obtenerEstadoApoderado()
  resolver({ body: jsonServidor('apoderado-completar-pad-01-rol') })
  assert.equal((await pendiente).estado, 409)
  assert.equal(app.store.obtenerEstadoApoderado(), limpio)
  assert.equal(app.local.get('ov.parent-missions.v1'), disco)
})

for (const reiniciar of [false, true]) {
  test(`${reiniciar ? 'reiniciar los datos' : 'preparar otro ingreso'} limpia también la sesión del apoderado`, async () => {
    const app = fixture()
    await app.store.ingresarApoderado()
    const operaciones = app.load('src/store/servidor/operaciones.ts')
    if (reiniciar) assert.equal((await operaciones.reiniciarDatosDePrueba()).tipo, 'ok')
    else operaciones.prepararIngreso()
    assert.equal(app.store.obtenerEstadoApoderado().cuenta, null)
    assert.equal(app.store.obtenerEstadoApoderado().actividades.estado, 'sin_cargar')
  })
}
