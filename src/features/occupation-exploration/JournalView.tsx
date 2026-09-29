import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Check,
  Compass,
  Feather,
  LockKeyhole,
  PenLine,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'
import { cn } from '@/lib/Utils'
import { getFamilyConversationTopic } from '@/features/family-conversations/FamilyConversationData'
import { appPaths } from '@/routes/paths'
import { getDailyJournalPrompt } from './data/JournalData'
import { updateAdventure, useAdventure } from './lib/AdventureStore'
import type { JournalEntry } from './types/AdventureTypes'
import type { ReadinessCheckIn } from './types/AdventureTypes'

type JournalScreen = 'home' | 'write' | 'detail'
type JournalGrouping = 'timeline' | 'topics'

function JournalView() {
  const state = useAdventure()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const conversationTopic = getFamilyConversationTopic(searchParams.get('conversation') ?? '')
  const eventTitle = searchParams.get('event')
  const eventOutcome = searchParams.get('outcome')
  const activityId = searchParams.get('activity') ?? undefined
  const activityPrompt = searchParams.get('prompt') ?? undefined
  const activityTitle = searchParams.get('title') ?? undefined
  const initialPrompt = eventTitle
    ? eventOutcome === 'attended'
      ? `Hoy fue ${eventTitle}, ¿qué aprendiste o qué te sorprendió de esta experiencia?`
      : `No asististe a ${eventTitle}. ¿Qué pasó y qué podrías hacer distinto si aparece una experiencia similar?`
    : conversationTopic
      ? `¿Qué te llevaste de esta conversación con tu familia sobre ${conversationTopic.title.toLocaleLowerCase('es-PE')}?`
      : activityPrompt
  const [screen, setScreen] = useState<JournalScreen>(
    conversationTopic || eventTitle || activityPrompt ? 'write' : 'home',
  )
  const [grouping, setGrouping] = useState<JournalGrouping>('timeline')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>()
  const [editingId, setEditingId] = useState<string>()
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>(
    eventTitle ? ['evento'] : conversationTopic ? ['familia'] : activityPrompt ? ['actividad'] : [],
  )
  const [lockedTags, setLockedTags] = useState<string[]>([])
  const [tagDraft, setTagDraft] = useState('')
  const [promptShown, setPromptShown] = useState(initialPrompt)
  const [linkedActivityId, setLinkedActivityId] = useState(
    eventTitle ? `event-${eventTitle}` : conversationTopic ? `family-${conversationTopic.id}` : activityId,
  )
  const [entryTitle, setEntryTitle] = useState(
    eventTitle
      ? `Evento: ${eventTitle}`
      : conversationTopic
        ? `Conversación: ${conversationTopic.title}`
        : (activityTitle ?? 'Entrada libre'),
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const entries = useMemo(
    () => [...state.journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.journal],
  )
  const filteredEntries = entries.filter((entry) => {
    const normalized = query.trim().toLocaleLowerCase('es-PE')
    if (!normalized) return true
    return `${entry.topicTags.join(' ')} ${entry.title} ${entry.promptShown ?? ''}`
      .toLocaleLowerCase('es-PE')
      .includes(normalized)
  })
  const selected = state.journal.find((entry) => entry.id === selectedId)
  const firstDate = entries.at(-1)?.createdAt
  const usedTags = [...new Set(entries.flatMap((entry) => entry.topicTags))].sort()

  function startBlankEntry() {
    setEditingId(undefined)
    setBody('')
    setTags([])
    setLockedTags([])
    setTagDraft('')
    setPromptShown(undefined)
    setLinkedActivityId(undefined)
    setEntryTitle('Entrada libre')
    setScreen('write')
  }

  function startOnboardingEntry() {
    updateAdventure((current) => ({ ...current, journalOnboardingSeen: true }))
    if (!conversationTopic) {
      setPromptShown('¿Cómo llegas al inicio de este proceso?')
      setLinkedActivityId('journal-onboarding')
      setEntryTitle('Al inicio del camino')
      setLockedTags([])
      setBody('')
      setScreen('write')
    }
  }

  function addTag(raw = tagDraft) {
    const next = raw.trim().replace(/^#/, '').toLocaleLowerCase('es-PE')
    if (!next || tags.includes(next)) return
    setTags((current) => [...current, next])
    setTagDraft('')
  }

  function saveEntry() {
    if (!body.trim()) return
    updateAdventure((current) => {
      const existing = current.journal.find((entry) => entry.id === editingId)
      const entry: JournalEntry = {
        id: existing?.id ?? crypto.randomUUID(),
        title: entryTitle,
        body: body.trim(),
        kind: promptShown ? 'prompted' : 'open',
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        linkedActivityId,
        promptShown,
        topicTags: tags,
        lockedTopicTags: lockedTags,
        missionId: existing?.missionId,
      }
      return {
        ...current,
        journal: [...current.journal.filter((item) => item.id !== entry.id), entry],
      }
    })
    setSelectedId(editingId)
    setEditingId(undefined)
    setScreen(editingId ? 'detail' : 'home')
  }

  function editEntry(entry: JournalEntry) {
    setEditingId(entry.id)
    setBody(entry.body)
    setTags(entry.topicTags)
    setLockedTags(entry.lockedTopicTags ?? [])
    setTagDraft('')
    setPromptShown(entry.promptShown)
    setLinkedActivityId(entry.linkedActivityId)
    setEntryTitle(entry.title)
    setScreen('write')
  }

  function deleteEntry() {
    if (!selected) return
    updateAdventure((current) => ({
      ...current,
      journal: current.journal.filter((entry) => entry.id !== selected.id),
    }))
    setDeleteOpen(false)
    setSelectedId(undefined)
    setScreen('home')
  }

  return (
    <div
      className="journal-page min-h-full bg-[#eef1ed] px-4 py-6 text-[#2b2a28] sm:px-8 sm:py-10"
      style={{ fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' }}
    >
      <main className="mx-auto max-w-5xl">
        {screen === 'home' && (
          <JournalHome
            entries={filteredEntries}
            firstDate={firstDate}
            grouping={grouping}
            onChangeGrouping={setGrouping}
            onDailyEntry={(prompt, defaultTags, activityId) => {
              setEditingId(undefined)
              setBody('')
              setTags(defaultTags)
              setLockedTags(defaultTags)
              setTagDraft('')
              setPromptShown(prompt)
              setLinkedActivityId(activityId)
              setEntryTitle('Tema del día')
              setScreen('write')
            }}
            onNew={startBlankEntry}
            onOpen={(entry) => {
              setSelectedId(entry.id)
              setScreen('detail')
            }}
            onOpenSignals={() => navigate(appPaths.student.signals)}
            query={query}
            setQuery={setQuery}
          />
        )}
        {screen === 'write' && (
          <JournalEditor
            body={body}
            editing={Boolean(editingId)}
            lockedTags={lockedTags}
            onAddTag={addTag}
            onBack={() => setScreen(editingId ? 'detail' : 'home')}
            onBodyChange={setBody}
            onRemoveTag={(tag) =>
              !lockedTags.includes(tag) && setTags((current) => current.filter((item) => item !== tag))
            }
            onSave={saveEntry}
            onTagDraftChange={setTagDraft}
            prompt={promptShown}
            suggestedTags={usedTags.filter((tag) => !tags.includes(tag))}
            tagDraft={tagDraft}
            tags={tags}
          />
        )}
        {screen === 'detail' && selected && (
          <JournalDetail
            entry={selected}
            onBack={() => setScreen('home')}
            onDelete={() => setDeleteOpen(true)}
            onEdit={() => editEntry(selected)}
          />
        )}
      </main>

      <JournalOnboarding
        onBegin={startOnboardingEntry}
        onOpenChange={(open) => {
          if (!open) updateAdventure((current) => ({ ...current, journalOnboardingSeen: true }))
        }}
        open={!state.journalOnboardingSeen}
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md bg-[#eef1ed]">
          <DialogHeader>
            <DialogTitle>Eliminar esta entrada</DialogTitle>
            <DialogDescription>La entrada dejará de estar disponible en tu diario.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeleteOpen(false)} variant="ghost">
              Conservar
            </Button>
            <Button onClick={deleteEntry} variant="destructive">
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function JournalHome({
  entries,
  firstDate,
  grouping,
  onChangeGrouping,
  onDailyEntry,
  onNew,
  onOpen,
  onOpenSignals,
  query,
  setQuery,
}: {
  entries: JournalEntry[]
  firstDate?: string
  grouping: JournalGrouping
  onChangeGrouping: (grouping: JournalGrouping) => void
  onDailyEntry: (prompt: string, tags: string[], activityId: string) => void
  onNew: () => void
  onOpen: (entry: JournalEntry) => void
  onOpenSignals: () => void
  query: string
  setQuery: (query: string) => void
}) {
  const grouped = entries.reduce<Record<string, JournalEntry[]>>((result, entry) => {
    const key = entry.topicTags[0] ?? 'sin etiqueta'
    result[key] = [...(result[key] ?? []), entry]
    return result
  }, {})
  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#4b4066]">
            <LockKeyhole className="size-4" /> Solo tú puedes leer este espacio
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Mi diario</h1>
          <p className="mt-2 text-sm text-[#5c5a54]">
            {firstDate
              ? `Escribes aquí desde ${new Date(firstDate).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}.`
              : 'Este espacio está listo cuando quieras usarlo.'}
          </p>
        </div>
        <Button className="bg-[#4b4066] text-white hover:bg-[#3f3656]" onClick={onNew}>
          <Plus /> Nueva entrada
        </Button>
      </header>
      <DailyJournalCard onOpenEntry={onOpen} onOpenSignals={onOpenSignals} onStartEntry={onDailyEntry} />
      <div className="my-7 flex flex-col gap-4 border-b border-[#dad6c9] pb-5 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-1 rounded-xl bg-white/60 p-1" aria-label="Organizar el diario">
          <JournalTab
            active={grouping === 'timeline'}
            label="Línea de tiempo"
            onClick={() => onChangeGrouping('timeline')}
          />
          <JournalTab
            active={grouping === 'topics'}
            label="Por tema"
            onClick={() => onChangeGrouping('topics')}
          />
        </nav>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#5c5a54]" />
          <Input
            className="h-11 rounded-xl border-[#dad6c9] bg-white/75 pl-10"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tema..."
            value={query}
          />
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-3xl border border-[#dad6c9] bg-white/55 px-6 py-16 text-center">
          <Feather className="mx-auto size-9 text-[#4b4066]" />
          <h2 className="mt-4 text-xl font-bold">Todavía no has escrito nada aquí</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[#5c5a54]">
            Este espacio está listo cuando quieras usarlo. No hace falta esperar a que algo importante pase.
          </p>
          <Button className="mt-6" onClick={onNew} variant="outline">
            Escribir algo
          </Button>
        </div>
      ) : grouping === 'timeline' ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <JournalCard entry={entry} key={entry.id} onOpen={() => onOpen(entry)} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([topic, topicEntries]) => (
            <section key={topic}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold capitalize text-[#4b4066]">
                <Tag className="size-4" /> {topic}
              </h2>
              <div className="space-y-3">
                {topicEntries.map((entry) => (
                  <JournalCard entry={entry} key={entry.id} onOpen={() => onOpen(entry)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function DailyJournalCard({
  onOpenEntry,
  onOpenSignals,
  onStartEntry,
}: {
  onOpenEntry: (entry: JournalEntry) => void
  onOpenSignals: () => void
  onStartEntry: (prompt: string, tags: string[], activityId: string) => void
}) {
  const state = useAdventure()
  const [signalOpen, setSignalOpen] = useState(false)
  const [signalValue, setSignalValue] = useState<ReadinessCheckIn['value']>(5)
  const today = localDateKey(new Date())
  const dailyPrompt = getDailyJournalPrompt()
  const dailyActivityId = `daily-prompt-${today}`
  const dailyEntry = state.journal.find((entry) => entry.linkedActivityId === dailyActivityId)
  const todayCheckIn = state.readinessCheckIns.find(
    (checkIn) =>
      localDateKey(new Date(checkIn.createdAt)) === today && checkIn.linkedActivityId === 'daily-check-in',
  )

  function answer(value: ReadinessCheckIn['value']) {
    updateAdventure((current) => {
      const existing = current.readinessCheckIns.find(
        (checkIn) =>
          localDateKey(new Date(checkIn.createdAt)) === today &&
          checkIn.linkedActivityId === 'daily-check-in',
      )
      const checkIn: ReadinessCheckIn = {
        id: existing?.id ?? crypto.randomUUID(),
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        linkedActivityId: 'daily-check-in',
        value,
      }
      return {
        ...current,
        readinessCheckIns: [...current.readinessCheckIns.filter((item) => item.id !== checkIn.id), checkIn],
      }
    })
    setSignalOpen(false)
  }

  return (
    <section className="mt-7 overflow-hidden rounded-3xl border border-[#dad6c9] bg-white/65 shadow-[0_10px_30px_rgb(43_42_40/5%)]">
      <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <div className="p-5 sm:p-6 lg:border-r lg:border-[#dad6c9]">
          <p className="flex items-center gap-2 text-sm font-bold text-[#4b4066]">
            <BookOpenText className="size-4" /> Tema del día
          </p>
          <h2 className="mt-3 max-w-2xl text-xl font-bold leading-8">{dailyPrompt.prompt}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {dailyPrompt.tags.map((tag) => (
              <Badge className="bg-[#4b4066]/9 text-[#4b4066]" key={tag} variant="secondary">
                #{tag} · sugerida
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#5c5a54]">
            Estas etiquetas acompañan al tema y se guardarán con la entrada. Puedes agregar otras propias.
          </p>
          <Button
            className="mt-5 bg-[#4b4066] text-white hover:bg-[#3f3656]"
            onClick={() =>
              dailyEntry
                ? onOpenEntry(dailyEntry)
                : onStartEntry(dailyPrompt.prompt, dailyPrompt.tags, dailyActivityId)
            }
          >
            {dailyEntry ? 'Revisar mi entrada de hoy' : 'Registrar una entrada'} <ArrowRight />
          </Button>
        </div>
        <div className="flex flex-col justify-between border-t border-[#dad6c9] bg-[#f2f7f4] p-5 sm:p-6 lg:border-t-0">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-[#3e6259]">
              <Compass className="size-4" /> Tu señal de hoy
            </p>
            <p className="mt-3 text-sm leading-6 text-[#5c5a54]">
              ¿Qué tan seguro te sientes hoy de tu próximo paso?
            </p>
            {todayCheckIn ? (
              <div className="mt-5 flex items-end gap-2">
                <strong className="text-5xl leading-none text-[#3e6259]">{todayCheckIn.value}</strong>
                <span className="pb-1 text-sm font-semibold text-[#5c5a54]">de 10</span>
              </div>
            ) : (
              <Button
                className="mt-5 w-full border-[#3e6259]/30 text-[#3e6259]"
                onClick={() => {
                  setSignalValue(5)
                  setSignalOpen(true)
                }}
                variant="outline"
              >
                Pulsa aquí para registrarla
              </Button>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {todayCheckIn && (
              <Button
                onClick={() => {
                  setSignalValue(todayCheckIn.value)
                  setSignalOpen(true)
                }}
                size="sm"
                variant="outline"
              >
                Cambiar
              </Button>
            )}
            <Button className="text-[#3e6259]" onClick={onOpenSignals} size="sm" variant="ghost">
              Ver historial <ArrowRight />
            </Button>
          </div>
          <p className="mt-4 text-[11px] leading-5 text-[#5c5a54]">
            Tu orientadora ve esta señal y su tendencia, nunca el texto de tu diario.
          </p>
        </div>
      </div>
      <Dialog open={signalOpen} onOpenChange={setSignalOpen}>
        <DialogContent className="max-w-lg bg-[#eef4f1]">
          <DialogHeader>
            <DialogTitle>Registra tu señal de hoy</DialogTitle>
            <DialogDescription>
              ¿Qué tan seguro te sientes de tu próximo paso? Puedes cambiar esta respuesta durante el día.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-[#3e6259]/20 bg-white/70 p-5">
            <output className="block text-center text-5xl font-bold text-[#3e6259]">{signalValue}</output>
            <input
              aria-label="Seguridad vocacional del 1 al 10"
              className="mt-6 w-full accent-[#3e6259]"
              max="10"
              min="1"
              onChange={(event) => setSignalValue(Number(event.target.value) as ReadinessCheckIn['value'])}
              type="range"
              value={signalValue}
            />
            <div className="mt-2 flex justify-between text-xs text-[#5c5a54]">
              <span>1 · Nada seguro</span>
              <span>10 · Muy seguro</span>
            </div>
          </div>
          <Button
            className="w-full bg-[#3e6259] text-white hover:bg-[#315047]"
            onClick={() => answer(signalValue)}
          >
            <Check /> Guardar señal
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function JournalCard({ entry, onOpen }: { entry: JournalEntry; onOpen: () => void }) {
  return (
    <article className="rounded-3xl border border-[#dad6c9] bg-white/75 p-5 shadow-[0_8px_24px_rgb(43_42_40/4%)] sm:p-6">
      <time className="text-xs font-semibold text-[#5c5a54]">
        {new Date(entry.createdAt).toLocaleDateString('es-PE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        {entry.kind === 'open' ? ' · entrada libre' : ''}
      </time>
      {entry.promptShown && <p className="mt-3 text-sm font-semibold leading-6">“{entry.promptShown}”</p>}
      <p className="mt-3 line-clamp-2 max-w-3xl font-serif text-base leading-7 text-[#393734]">
        {entry.body}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {entry.topicTags.map((tag) => (
            <Badge className="bg-[#4b4066]/8 text-[#4b4066]" key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
        <Button className="text-[#4b4066]" onClick={onOpen} size="sm" variant="ghost">
          Leer más <ArrowRight />
        </Button>
      </div>
    </article>
  )
}

function JournalEditor({
  body,
  editing,
  lockedTags,
  onAddTag,
  onBack,
  onBodyChange,
  onRemoveTag,
  onSave,
  onTagDraftChange,
  prompt,
  suggestedTags,
  tagDraft,
  tags,
}: {
  body: string
  editing: boolean
  lockedTags: string[]
  onAddTag: (tag?: string) => void
  onBack: () => void
  onBodyChange: (body: string) => void
  onRemoveTag: (tag: string) => void
  onSave: () => void
  onTagDraftChange: (tag: string) => void
  prompt?: string
  suggestedTags: string[]
  tagDraft: string
  tags: string[]
}) {
  return (
    <section>
      <Button className="-ml-3 text-[#5c5a54]" onClick={onBack} variant="ghost">
        <ArrowLeft /> Volver
      </Button>
      <div className="mx-auto mt-5 max-w-3xl">
        <h1 className="text-3xl font-bold">{editing ? 'Editar entrada' : 'Escribe lo que quieras'}</h1>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#4b4066]">
          <LockKeyhole className="size-4" /> Nadie más lee esto
        </p>
        {prompt && <p className="mt-8 text-lg font-semibold leading-8">{prompt}</p>}
        <textarea
          aria-label="Texto privado de la entrada"
          autoFocus
          className="mt-6 min-h-[360px] w-full resize-y rounded-3xl border border-[#4b4066]/45 bg-white/75 p-6 font-serif text-lg leading-9 text-[#2b2a28] outline-none focus:ring-4 focus:ring-[#4b4066]/12"
          onChange={(event) => onBodyChange(event.target.value)}
          value={body}
        />
        <div className="mt-6">
          <label className="text-sm font-semibold" htmlFor="journal-tag">
            Etiquetas <span className="font-normal text-[#5c5a54]">(opcional)</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge className="gap-1 bg-[#4b4066]/10 text-[#4b4066]" key={tag} variant="secondary">
                #{tag}
                {lockedTags.includes(tag) ? (
                  <span className="text-[10px] font-semibold opacity-65">sugerida</span>
                ) : (
                  <button
                    aria-label={`Quitar etiqueta ${tag}`}
                    onClick={() => onRemoveTag(tag)}
                    type="button"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex max-w-md gap-2">
            <Input
              id="journal-tag"
              className="h-11 rounded-xl border-[#dad6c9] bg-white/75"
              onChange={(event) => onTagDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onAddTag()
                }
              }}
              placeholder="Ej. familia, dudas, intereses"
              value={tagDraft}
            />
            <Button disabled={!tagDraft.trim()} onClick={() => onAddTag()} variant="outline">
              Agregar
            </Button>
          </div>
          {suggestedTags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#5c5a54]">
              <span>Usadas antes:</span>
              {suggestedTags.slice(0, 5).map((tag) => (
                <button
                  className="rounded-full border border-[#dad6c9] px-2.5 py-1"
                  key={tag}
                  onClick={() => onAddTag(tag)}
                  type="button"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            className="bg-[#4b4066] text-white hover:bg-[#3f3656]"
            disabled={!body.trim()}
            onClick={onSave}
          >
            Guardar entrada
          </Button>
        </div>
      </div>
    </section>
  )
}

function JournalDetail({
  entry,
  onBack,
  onDelete,
  onEdit,
}: {
  entry: JournalEntry
  onBack: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button className="-ml-3" onClick={onBack} variant="ghost">
          <ArrowLeft /> Volver
        </Button>
        <time className="text-sm text-[#5c5a54]">
          {new Date(entry.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
        </time>
      </div>
      <div className="mx-auto mt-7 max-w-3xl">
        {entry.promptShown && (
          <div className="mb-7">
            <p className="text-xs font-semibold text-[#5c5a54]">Después de: “{entry.title}”</p>
            <h1 className="mt-3 text-xl font-bold leading-8">{entry.promptShown}</h1>
          </div>
        )}
        <div className="rounded-3xl border border-[#dad6c9] bg-white/75 p-6 sm:p-10">
          <p className="whitespace-pre-wrap break-words font-serif text-lg leading-9 text-[#2b2a28]">
            {entry.body}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {entry.topicTags.map((tag) => (
            <Badge className="bg-[#4b4066]/8 text-[#4b4066]" key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
        <div className="mt-8 flex justify-end gap-2 border-t border-[#dad6c9] pt-5">
          <Button onClick={onEdit} variant="ghost">
            Editar
          </Button>
          <Button onClick={onDelete} variant="ghost">
            <Trash2 /> Eliminar
          </Button>
        </div>
      </div>
    </article>
  )
}

function JournalOnboarding({
  onBegin,
  onOpenChange,
  open,
}: {
  onBegin: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-3xl bg-[#eef1ed] p-6 sm:p-10" showCloseButton={false}>
        <DialogHeader className="pr-0 text-center">
          <DialogTitle className="text-3xl">Este espacio es solo tuyo</DialogTitle>
          <DialogDescription>Aquí las reglas son distintas al resto de tu recorrido.</DialogDescription>
        </DialogHeader>
        <Separator className="my-6 bg-[#dad6c9]" />
        <div className="grid gap-4 md:grid-cols-3">
          <OnboardingPoint
            icon={LockKeyhole}
            text="Nadie lee lo que escribes aquí. Ni tu orientadora, ni nadie del programa. Nunca."
            title="Privado para siempre"
          />
          <OnboardingPoint
            icon={PenLine}
            text="No hay respuestas correctas. Puedes escribir una frase o una página."
            title="A tu manera"
          />
          <OnboardingPoint
            accent="signal"
            icon={Compass}
            text="De vez en cuando te preguntaremos qué tan seguro te sientes de tu próximo paso. Tu orientadora ve solo esa respuesta corta, nunca lo que escribes."
            title="Una señal separada"
          />
        </div>
        <Button className="mx-auto mt-7 bg-[#4b4066] text-white hover:bg-[#3f3656]" onClick={onBegin}>
          Entendido, empezar a escribir
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function OnboardingPoint({
  accent = 'private',
  icon: Icon,
  text,
  title,
}: {
  accent?: 'private' | 'signal'
  icon: typeof LockKeyhole
  text: string
  title: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        accent === 'signal' ? 'border-[#3e6259]/25 bg-[#3e6259]/8' : 'border-[#4b4066]/15 bg-white/60',
      )}
    >
      <Icon className={cn('size-6', accent === 'signal' ? 'text-[#3e6259]' : 'text-[#4b4066]')} />
      <h2 className="mt-4 font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#5c5a54]">{text}</p>
    </div>
  )
}

function JournalTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
        active ? 'bg-[#4b4066] text-white' : 'text-[#5c5a54] hover:bg-white',
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

export { JournalView }
