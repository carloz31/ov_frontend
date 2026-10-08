import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  LockKeyhole,
  PenLine,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { getFamilyConversationTopic } from '@/data/content/familyConversations'
import { updateAdventure, useAdventure } from '@/store/adventureStore'
import {
  getLumiTags,
  getLumiSuggestions,
  type LumiSuggestion,
} from '@/features/journal/lib/lumiSuggestions'
import { useLumiNow } from '@/hooks/useLumiNow'
import { LumiPortrait } from '@/features/journal/components/LumiJournalPanel'
import { useJourney } from '@/store/journeyStore'
import type { JournalEntry } from '@/types/adventure'
import { DiscoveryStage } from '@/features/discovery/components/DiscoveryStage'
import { Parchment } from '@/components/student/Parchment'
import { CollectionSlot } from '@/components/student/CollectionSlot'
import { useReturnFocus } from '@/hooks/useReturnFocus'
import { useStudentUi } from '@/store/studentUiStore'
import { getLumiBond, type LumiBond } from '@/features/journal/lib/lumiBond'
import { LumiBondPanel } from '@/features/journal/components/LumiBondPanel'
import { DailyQuestionCard, type DailyQuestionEditorContext } from '@/features/journal/components/DailyQuestionCard'
import '@/features/journal/styles/journal.css'

type JournalScreen = 'home' | 'write' | 'detail'
type JournalGrouping = 'timeline' | 'topics'

function StudentJournalView() {
  const state = useAdventure()
  const now = useLumiNow()
  const bond = getLumiBond(state.lumiRegistrations, now)
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
    eventTitle
      ? ['evento']
      : conversationTopic
        ? ['familia']
        : activityPrompt
          ? getLumiTags(activityId ?? '')
          : [],
  )
  const [lockedTags, setLockedTags] = useState<string[]>(activityPrompt ? getLumiTags(activityId ?? '') : [])
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
        : (activityTitle ?? 'Conversación libre con Lumi'),
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const returnFocus = useReturnFocus()
  const [saveNotice, setSaveNotice] = useState('')
  const requestedMemory = Number(searchParams.get('memory'))
  useEffect(() => {
    if (Number.isInteger(requestedMemory) && requestedMemory >= 1 && requestedMemory <= bond.memoriesOpened)
      setScreen('home')
  }, [requestedMemory, bond.memoriesOpened])
  const entries = useMemo(
    () => [...state.journal].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.journal],
  )
  const filteredEntries = entries.filter((entry) => {
    const normalized = query.trim().toLocaleLowerCase('es-PE')
    if (!normalized) return true
    return `${entry.topicTags.join(' ')} ${entry.title} ${entry.promptShown ?? ''} ${entry.body}`
      .toLocaleLowerCase('es-PE')
      .includes(normalized)
  })
  const selected = state.journal.find((entry) => entry.id === selectedId)
  const usedTags = [...new Set(entries.flatMap((entry) => entry.topicTags))].sort()

  function openEditor({
    prompt,
    linkedActivityId,
    title,
    lockedTags: initialTags,
  }: DailyQuestionEditorContext) {
    setSaveNotice('')
    setEditingId(undefined)
    setBody('')
    setTags(initialTags)
    setLockedTags(initialTags)
    setTagDraft('')
    setPromptShown(prompt)
    setLinkedActivityId(linkedActivityId)
    setEntryTitle(title)
    setScreen('write')
  }

  function startBlankEntry() {
    setSaveNotice('')
    setEditingId(undefined)
    setBody('')
    setTags([])
    setLockedTags([])
    setTagDraft('')
    setPromptShown(undefined)
    setLinkedActivityId(undefined)
    setEntryTitle('Conversación libre con Lumi')
    setScreen('write')
  }

  function startOnboardingEntry() {
    updateAdventure((current) => ({ ...current, journalOnboardingSeen: true }))
    if (!initialPrompt) {
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
    if (!body.trim() || !entryTitle.trim()) return
    const remaining = getLumiBond(state.lumiRegistrations).remainingToday
    updateAdventure((current) => {
      const existing = current.journal.find((entry) => entry.id === editingId)
      const entry: JournalEntry = {
        id: existing?.id ?? crypto.randomUUID(),
        title: entryTitle.trim(),
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
    setSaveNotice(
      editingId
        ? 'Conversación actualizada. Editar no suma conversaciones.'
        : remaining > 0
          ? '¡Conversación guardada! Tu amistad con Lumi suma una conversación.'
          : `Conversación guardada. Hoy ya contaron tus 3 conversaciones; esta igual se guarda.`,
    )
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
    <DiscoveryStage ambient="journal">
      {saveNotice && (
        <p role="status" className="sx-j-save-notice">
          {saveNotice}
          <button type="button" aria-label="Cerrar aviso" onClick={() => setSaveNotice('')}>
            <X aria-hidden="true" size={18} />
          </button>
        </p>
      )}
      {screen === 'home' && (
        <JournalHome
          entries={filteredEntries}
          grouping={grouping}
          onChangeGrouping={setGrouping}
          onSuggested={({ prompt, tags: defaultTags, activityId, title }) => {
            openEditor({ prompt, linkedActivityId: activityId, title, lockedTags: defaultTags })
          }}
          now={now}
          onDailyQuestion={openEditor}
          onNew={startBlankEntry}
          onOpen={(entry) => {
            setSelectedId(entry.id)
            setScreen('detail')
          }}
          query={query}
          setQuery={setQuery}
          bond={bond}
          onboarding={!state.journalOnboardingSeen}
          onBegin={startOnboardingEntry}
        />
      )}
      {screen === 'write' && (
        <JournalEditor
          body={body}
          editing={Boolean(editingId)}
          title={entryTitle}
          onTitleChange={setEntryTitle}
          remainingToday={bond.remainingToday}
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
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent {...returnFocus} className="sx-root sx-j-delete-dialog">
          <DialogHeader>
            <DialogTitle>Eliminar esta entrada</DialogTitle>
            <DialogDescription>
              La conversación dejará de estar disponible. Esto no reduce la amistad ni reinicia el límite
              diario.
            </DialogDescription>
          </DialogHeader>
          <div className="sx-d-actions">
            <button
              className="sx-d-action sx-d-action-ghost"
              onClick={() => setDeleteOpen(false)}
              type="button"
            >
              Conservar
            </button>
            <button className="sx-d-action" onClick={deleteEntry} type="button">
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DiscoveryStage>
  )
}

function JournalHome({
  entries,
  grouping,
  onChangeGrouping,
  onSuggested,
  onNew,
  onOpen,
  query,
  setQuery,
  bond,
  onboarding,
  onBegin,
  now,
  onDailyQuestion,
}: {
  entries: JournalEntry[]
  grouping: JournalGrouping
  onChangeGrouping: (grouping: JournalGrouping) => void
  onSuggested: (suggestion: LumiSuggestion) => void
  onNew: () => void
  onOpen: (entry: JournalEntry) => void
  query: string
  setQuery: (query: string) => void
  bond: LumiBond
  onboarding: boolean
  onBegin: () => void
  now: Date
  onDailyQuestion: (context: DailyQuestionEditorContext) => void
}) {
  const adventure = useAdventure(),
    journey = useJourney(),
    ui = useStudentUi(),
    [topic, setTopic] = useState<string>()
  const suggestions = getLumiSuggestions(adventure, journey)
  const unread = Array.from({ length: bond.memoriesOpened }, (_, i) => i + 1).some(
    (n) => !ui.seenLumiMemories.includes(n),
  )
  const tags = [...new Set(entries.flatMap((e) => e.topicTags))]
  const shown = grouping === 'topics' && topic ? entries.filter((e) => e.topicTags.includes(topic)) : entries
  const months = shown.reduce<Record<string, JournalEntry[]>>((result, entry) => {
    const month = new Date(entry.createdAt).toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Lima',
    })
    ;(result[month] ??= []).push(entry)
    return result
  }, {})
  return (
    <>
      <header className="sx-d-header">
        <div>
          <p className="sx-j-private">
            <LockKeyhole size={16} aria-hidden="true" />
            Solo tú puedes leer este espacio
          </p>
          <h1>Mi diario</h1>
          <p>Cuéntale a tu compañera de viaje lo que vas descubriendo de ti.</p>
        </div>
      </header>
      <div className="sx-j-layout">
        <LumiBondPanel bond={bond} />
        <div className="sx-d-stack">
          {onboarding ? (
            <JournalOnboarding onBegin={onBegin} />
          ) : (
            <Parchment
              className="sx-j-notebook sx-j-blank"
              label="Página en blanco"
              title="Lumi, hoy quiero contarte…"
            >
              <p>Algo que te pasó, una duda o una idea. No necesitas completar una actividad para empezar.</p>
              <button className="sx-d-action" type="button" onClick={onNew}>
                Conversación libre <ArrowRight aria-hidden="true" size={18} />
              </button>
            </Parchment>
          )}
          {!onboarding && <DailyQuestionCard now={now} onRespond={onDailyQuestion} onOpenAnswer={onOpen} />}
          {unread && (
            <div className="sx-j-memory-notice" role="status">
              <span className="sx-j-lumi">
                <LumiPortrait />
              </span>
              <div>
                <h2>Lumi recordó algo nuevo</h2>
                <p>Tu amistad creció y se abrió un recuerdo. Búscalo junto a tu amistad con Lumi.</p>
              </div>
            </div>
          )}
          <section aria-label="Cartas de Lumi por responder">
            <h2 className="sx-j-letters-heading">
              Cartas de Lumi por responder <span>{suggestions.length}</span>
            </h2>
            <p>Después de cada actividad, Lumi te deja una pregunta sobre lo que viviste.</p>
            <div className="sx-j-letters">
              {suggestions.length ? (
                suggestions.map((item) => (
                  <Parchment key={item.activityId} className="sx-j-letter">
                    <span className="sx-j-letter-seal">
                      <Sparkles aria-hidden="true" size={16} />
                    </span>
                    <p className="sx-d-eyebrow">Después de: {item.title}</p>
                    <p className="sx-j-question">Lumi: “{item.prompt}”</p>
                    <JournalTags tags={item.tags} />
                    <button type="button" className="sx-d-action" onClick={() => onSuggested(item)}>
                      Responder a Lumi
                    </button>
                  </Parchment>
                ))
              ) : (
                <p className="sx-j-empty">
                  Respondiste todas las cartas. Lumi te dejará otra al terminar tu próxima actividad.
                </p>
              )}
            </div>
          </section>
          <Parchment className="sx-j-notebook" label="Tu cuaderno" title="Lo que le has contado a Lumi">
            <div className="sx-j-notebook-controls">
              <nav aria-label="Organizar conversaciones" className="sx-j-tabs">
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
              <label className="sx-j-search">
                <Search aria-hidden="true" size={16} />
                <span className="sr-only">Buscar por tema</span>
                <input
                  className="sx-d-input"
                  placeholder="Buscar por tema..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>
            {grouping === 'topics' && (
              <div className="sx-j-topic-filters">
                {tags.map((tag) => (
                  <button
                    type="button"
                    aria-pressed={topic === tag}
                    key={tag}
                    onClick={() => setTopic(topic === tag ? undefined : tag)}
                  >
                    #{tag} {entries.filter((e) => e.topicTags.includes(tag)).length}
                  </button>
                ))}
              </div>
            )}
            {!shown.length ? (
              <div className="sx-j-empty">
                <span className="sx-j-empty-lumi">
                  <LumiPortrait />
                </span>
                <h3>
                  {entries.length
                    ? 'No encontramos conversaciones con este tema'
                    : 'Todavía no has escrito nada aquí'}
                </h3>
                <p>
                  Este espacio está listo cuando quieras usarlo. No hace falta esperar a que algo importante
                  pase.
                </p>
              </div>
            ) : grouping === 'timeline' ? (
              Object.entries(months).map(([month, items]) => (
                <section className="sx-j-thread" key={month}>
                  <h3>{month}</h3>
                  {items.map((entry) => (
                    <JournalCard entry={entry} key={entry.id} onOpen={() => onOpen(entry)} />
                  ))}
                </section>
              ))
            ) : (
              <div className="sx-d-stack">
                {shown.map((entry) => (
                  <JournalCard entry={entry} key={entry.id} onOpen={() => onOpen(entry)} />
                ))}
              </div>
            )}
          </Parchment>
        </div>
      </div>
    </>
  )
}
function JournalTags({ tags }: { tags: string[] }) {
  return (
    <div className="sx-j-tags">
      {tags.map((tag) => (
        <span key={tag}>#{tag}</span>
      ))}
    </div>
  )
}
function JournalCard({ entry, onOpen }: { entry: JournalEntry; onOpen: () => void }) {
  const daily = entry.linkedActivityId?.startsWith('daily-prompt-')
  return (
    <article className="sx-j-entry" data-kind={daily ? 'daily' : entry.kind}>
      <time>
        {new Date(entry.createdAt).toLocaleDateString('es-PE', {
          dateStyle: 'long',
          timeZone: 'America/Lima',
        })}
      </time>
      <span className="sx-j-origin">
        {daily ? 'Pregunta del día' : entry.kind === 'open' ? 'Libre' : 'Carta de Lumi'}
      </span>
      <h3>{entry.title}</h3>
      {entry.promptShown && <p className="sx-j-question">Lumi: “{entry.promptShown}”</p>}
      <p className="sx-d-clamp-two">{entry.body}</p>
      <JournalTags tags={entry.topicTags} />
      <button type="button" className="sx-d-action sx-d-action-ghost" onClick={onOpen}>
        Leer completa <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  )
}
function JournalEditor({
  body,
  editing,
  title,
  onTitleChange,
  remainingToday,
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
  title: string
  onTitleChange: (title: string) => void
  remainingToday: number
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
    <>
      <button type="button" className="sx-d-back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Volver al diario
      </button>
      <header className="sx-d-header">
        <div>
          <h1>{editing ? 'Editar lo que le contaste' : 'Cuéntale a Lumi'}</h1>
          <p className="sx-j-private">
            <LockKeyhole aria-hidden="true" size={16} />
            Nadie más lee esto
          </p>
        </div>
      </header>
      <Parchment className="sx-j-notebook sx-j-editor">
        {prompt && <p className="sx-j-question sx-j-prompt">Lumi: “{prompt}”</p>}
        <label className="sr-only" htmlFor="journal-title">
          Título de la entrada
        </label>
        <input
          id="journal-title"
          className="sx-j-title-input"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Título de tu conversación"
          required
        />
        <textarea
          aria-label="Texto privado de la entrada"
          autoFocus
          className="sx-j-writing"
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Escribe con calma. Lo que pongas aquí solo lo lees tú."
          required
        />
        <label htmlFor="journal-tag">Etiquetas (opcional)</label>
        <div className="sx-j-tags">
          {tags.map((tag) => (
            <span key={tag}>
              #{tag}
              {lockedTags.includes(tag) ? (
                <small>sugerida</small>
              ) : (
                <button type="button" aria-label={`Quitar etiqueta ${tag}`} onClick={() => onRemoveTag(tag)}>
                  <X aria-hidden="true" size={16} />
                </button>
              )}
            </span>
          ))}
        </div>
        <div className="sx-d-actions">
          <input
            id="journal-tag"
            className="sx-d-input"
            value={tagDraft}
            onChange={(e) => onTagDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAddTag()
              }
            }}
            placeholder="Ej. familia, dudas, intereses"
          />
          <button
            type="button"
            className="sx-d-action sx-d-action-ghost"
            disabled={!tagDraft.trim()}
            onClick={() => onAddTag()}
          >
            Agregar
          </button>
        </div>
        {!!suggestedTags.length && (
          <div className="sx-j-tags">
            <span>Usadas antes:</span>
            {suggestedTags.slice(0, 5).map((tag) => (
              <button type="button" key={tag} onClick={() => onAddTag(tag)}>
                #{tag}
              </button>
            ))}
          </div>
        )}
        <div className="sx-j-editor-actions">
          <button type="button" className="sx-d-action sx-d-action-ghost" onClick={onBack}>
            Ahora no
          </button>
          <button
            type="button"
            className="sx-d-action sx-d-action-gold"
            disabled={!body.trim() || !title.trim()}
            onClick={onSave}
          >
            Contarle a Lumi
          </button>
        </div>
        <p className="sx-j-save-help">
          {editing
            ? 'Editar no suma una conversación nueva.'
            : remainingToday
              ? 'Esta conversación suma a tu amistad con Lumi.'
              : 'Hoy ya contaron tus 3 conversaciones; esta igual se guarda.'}
        </p>
      </Parchment>
    </>
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
    <>
      <button type="button" className="sx-d-back" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Volver al diario
      </button>
      <Parchment className="sx-j-notebook sx-j-detail">
        <time>
          {new Date(entry.createdAt).toLocaleDateString('es-PE', {
            dateStyle: 'long',
            timeZone: 'America/Lima',
          })}
        </time>
        <p className="sx-j-origin">{entry.kind === 'open' ? 'Libre' : 'Carta de Lumi'}</p>
        <h1 id={`journal-entry-${entry.id}`}>{entry.title}</h1>
        {entry.promptShown && <p className="sx-j-question sx-j-prompt">Lumi: “{entry.promptShown}”</p>}
        <p className="sx-j-full-text">{entry.body}</p>
        <JournalTags tags={entry.topicTags} />
        <div className="sx-j-editor-actions">
          <button type="button" className="sx-d-action sx-d-action-ghost" onClick={onEdit}>
            <PenLine aria-hidden="true" size={16} />
            Editar
          </button>
          <button type="button" className="sx-j-delete" onClick={onDelete}>
            <Trash2 aria-hidden="true" size={16} />
            Borrar
          </button>
        </div>
      </Parchment>
    </>
  )
}
function JournalOnboarding({ onBegin }: { onBegin: () => void }) {
  return (
    <Parchment className="sx-j-notebook sx-j-onboarding" title="Un espacio para ti y Lumi">
      <p>
        Tu diario se convierte en conversaciones con tu compañera de viaje. No hay respuestas automáticas: tú
        decides qué contar.
      </p>
      <div className="sx-j-onboarding-points">
        <CollectionSlot icon={<LockKeyhole />}>
          <strong>Privado para siempre</strong>
          <p>Nadie lee lo que escribes aquí. Ni tu orientadora, ni nadie del programa. Nunca.</p>
        </CollectionSlot>
        <CollectionSlot icon={<PenLine />}>
          <strong>A tu manera</strong>
          <p>No hay respuestas correctas. Puedes escribir una frase o una página.</p>
        </CollectionSlot>
        <CollectionSlot icon={<Compass />}>
          <strong>Una señal separada</strong>
          <p>
            De vez en cuando te preguntaremos qué tan seguro te sientes de tu próximo paso. Tu orientadora ve
            solo esa respuesta corta, nunca lo que escribes.
          </p>
        </CollectionSlot>
      </div>
      <button type="button" className="sx-d-action sx-d-action-gold" onClick={onBegin}>
        Entendido, empezar a escribir
      </button>
    </Parchment>
  )
}
function JournalTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  )
}
export { StudentJournalView }
