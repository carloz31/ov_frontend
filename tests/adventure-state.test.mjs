import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

// Load the existing TypeScript store in an isolated browser-storage fixture.
// No browser profile or real student data is read or modified.
function loadAdventure(saved = null, failWrites = false) {
  let persisted = saved
  let onStorage
  const cache = new Map()
  const context = vm.createContext({
    Date,
    URL,
    Set,
    Map,
    localStorage: {
      getItem: () => persisted,
      setItem: (_, value) => {
        if (failWrites) throw new Error('Quota exceeded')
        persisted = value
      },
    },
    window: {
      addEventListener: (_, callback) => {
        onStorage = callback
      },
    },
  })
  function load(file) {
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText
    const require = (specifier) =>
      specifier === 'react'
        ? { useSyncExternalStore: (_, snapshot) => snapshot() }
        : load(path.resolve(path.dirname(file), `${specifier}.ts`))
    vm.runInContext(`(function(require, exports) { ${source}\n})`, context, { filename: file })(
      require,
      exports,
    )
    return exports
  }
  const store = load(path.resolve('src/features/occupation-exploration/lib/AdventureStore.ts'))
  const data = load(path.resolve('src/features/occupation-exploration/data/AdventureData.ts'))
  const friendship = load(path.resolve('src/features/occupation-exploration/lib/LumiFriendship.ts'))
  return {
    store,
    data,
    friendship,
    persisted: () => persisted,
    externalWrite: (value) => {
      persisted = value
      onStorage({ key: 'ov.student-adventure.v1' })
    },
  }
}

test('Lumi awards at most three points per Lima day and resets at local midnight', () => {
  const { friendship } = loadAdventure()
  const registrations = ['a', 'b', 'c', 'd'].map((entryId) => ({
    entryId,
    createdAt: '2026-10-02T23:00:00Z',
  }))
  assert.equal(friendship.getLumiFriendship(registrations, new Date('2026-10-03T04:59:00Z')).points, 3)
  assert.equal(
    friendship.getLumiFriendship(registrations, new Date('2026-10-03T04:59:00Z')).remainingToday,
    0,
  )
  assert.equal(
    friendship.getLumiFriendship(registrations, new Date('2026-10-03T05:00:00Z')).remainingToday,
    3,
  )
  registrations.push({ entryId: 'e', createdAt: '2026-10-03T05:01:00Z' })
  const next = friendship.getLumiFriendship(registrations, new Date('2026-10-03T05:02:00Z'))
  assert.equal(next.points, 4)
  assert.equal(next.todayEarned, 1)
})

test('Lumi friendship decays once per three inactive days, never below zero', () => {
  const { friendship } = loadAdventure()
  const registrations = ['a', 'b', 'c'].map((entryId) => ({ entryId, createdAt: '2026-10-02T18:00:00Z' }))
  const score = (day) =>
    friendship.getLumiFriendship(registrations, new Date(`2026-10-${day}T18:00:00Z`)).points
  assert.equal(score('04'), 3)
  assert.equal(score('05'), 2)
  assert.equal(score('08'), 1)
  assert.equal(score('20'), 0)
  registrations.push({ entryId: 'new', createdAt: '2026-10-08T18:00:00Z' })
  assert.equal(score('08'), 2)
  assert.equal(score('10'), 2)
  assert.equal(score('11'), 1)
})

test('Lumi ledger survives edits, deletion and reload; signal-only changes award nothing', () => {
  const { store, friendship, persisted } = loadAdventure()
  const entry = {
    id: 'student-entry',
    title: 'Lumi',
    body: 'Una idea',
    kind: 'open',
    topicTags: [],
    createdAt: '2026-10-02T18:00:00Z',
  }
  assert.equal(store.useAdventure().lumiRegistrations.length, 0, 'Demo entries do not earn friendship')
  store.updateAdventure((current) => ({ ...current, journal: [...current.journal, entry] }))
  store.updateAdventure((current) => ({
    ...current,
    journal: current.journal.map((item) => (item.id === entry.id ? { ...item, body: 'Editada' } : item)),
  }))
  store.updateAdventure((current) => ({
    ...current,
    journal: current.journal.filter((item) => item.id !== entry.id),
  }))
  store.updateAdventure((current) => ({
    ...current,
    readinessCheckIns: [...current.readinessCheckIns, { id: 'signal', value: 7, createdAt: entry.createdAt }],
  }))
  assert.equal(store.useAdventure().lumiRegistrations.length, 1)
  const restored = loadAdventure(persisted()).store.useAdventure()
  assert.equal(restored.lumiRegistrations.length, 1)
  assert.equal(friendship.getLumiFriendship(restored.lumiRegistrations, new Date(entry.createdAt)).points, 1)
})

test('Lumi migrates real existing entries and ignores duplicate, malformed and future records', () => {
  const createdAt = '2026-10-02T18:00:00Z'
  const { store, friendship } = loadAdventure(
    JSON.stringify({
      version: 1,
      journal: [{ id: 'real', title: 'Hola', body: 'Hola Lumi', createdAt, topicTags: [] }],
    }),
  )
  assert.equal(store.useAdventure().lumiRegistrations.length, 1)
  const records = [
    { entryId: 'a', createdAt },
    { entryId: 'a', createdAt },
    { entryId: 'invalid', createdAt: 'not a date' },
    { entryId: 'future', createdAt: '2027-10-02T18:00:00Z' },
  ]
  assert.equal(friendship.getLumiFriendship(records, new Date(createdAt)).points, 1)
})

test('review mode opens every destination while completion remains truthful', () => {
  const { store, data } = loadAdventure()
  assert.equal(store.canAccessCity(store.useAdventure()), true)
  assert.equal(store.canAccessFamilyConversations(store.useAdventure()), true)
  assert.equal(store.isCityUnlocked(store.useAdventure()), false)
  store.completeMission('expectations')
  assert.equal(store.useAdventure().completedMissionIds[0], 'expectations')
  for (const mission of data.fieldMissions) {
    store.completeMission(mission.id)
  }
  assert.equal(store.isCityUnlocked(store.useAdventure()), true)
  assert.equal(store.getTravelerLevel(store.useAdventure()).number, 3)
  store.completeMission('welcome')
  store.completeMission('missing')
  assert.equal(store.useAdventure().completedMissionIds.length, data.fieldMissions.length)
})
test('family conversations unlock after the student completes the sequential program', () => {
  const { store, data } = loadAdventure()
  assert.equal(store.canAccessFamilyConversations(store.useAdventure()), true)
  assert.equal(store.isFamilyUnlocked(store.useAdventure()), false)
  for (const mission of data.fieldMissions) store.completeMission(mission.id)
  assert.equal(store.isFamilyUnlocked(store.useAdventure()), true)
  assert.equal(store.isCityUnlocked(store.useAdventure()), true)
})
test('review mode permits cases while duplicate and unknown cases do not inflate progress', () => {
  const { store } = loadAdventure()
  store.completeCase('forest-fire')
  assert.equal(store.useAdventure().solvedCaseIds.length, 1)
  store.completeCase('forest-fire')
  store.completeCase('forest-fire')
  store.completeCase('missing')
  assert.equal(store.useAdventure().solvedCaseIds.length, 1)
})
test('questionnaire drafts and manual review flags survive remount without inferred labels', () => {
  const { store, persisted } = loadAdventure()
  store.updateAdventure((current) => ({
    ...current,
    questionnaire: {
      block: 1,
      answers: { support: 'A veces' },
      openAnswers: { support: '' },
      review: { support: 'pending' },
    },
  }))
  const reloaded = loadAdventure(persisted()).store.useAdventure()
  assert.equal(reloaded.questionnaire.block, 1)
  assert.equal(reloaded.questionnaire.answers.support, 'A veces')
  assert.equal(reloaded.questionnaire.openAnswers.support, '')
  assert.equal(reloaded.questionnaire.review.support, 'pending')
})
test('corrupt, malformed and old persistence recover to the initial state', () => {
  for (const saved of [
    'broken',
    '{"version":0}',
    '{"version":1,"journal":null}',
    '{"version":1,"research":{"step":99}}',
  ]) {
    const { store } = loadAdventure(saved)
    assert.equal(store.useAdventure().journal.length, store.createInitialAdventure().journal.length)
    assert.equal(store.useAdventure().research.step, 0)
  }
})
test('storage failures keep session progress and expose a warning', () => {
  const { store } = loadAdventure(null, true)
  store.completeMission('welcome')
  assert.equal(store.useAdventure().completedMissionIds[0], 'welcome')
  assert.equal(store.useAdventureStorageError(), true)
})
test('updates from another portal tab refresh the shared state', () => {
  const { store, externalWrite } = loadAdventure()
  externalWrite(JSON.stringify({ ...store.createInitialAdventure(), parentCompletedActivityIds: ['role'] }))
  assert.equal(store.useAdventure().parentCompletedActivityIds[0], 'role')
})
test('video links reject script, data, HTTP and relative URLs', () => {
  const { store } = loadAdventure()
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.com', '/video', ''])
    assert.equal(store.safeVideoUrl(value), null)
  assert.equal(store.safeVideoUrl('https://example.com/video'), 'https://example.com/video')
})
