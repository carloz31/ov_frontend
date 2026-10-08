import { updateConversation, getTopicStatus, getConversationGift, getGiftResource } from '../lib/conversations'
import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookOpenText,
  Check,
  CheckCircle2,
  Gift,
  HeartHandshake,
  LockKeyhole,
  MessageCircleHeart,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { GuideDialogue } from '@/components/common/GuideDialogue'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Progress } from '@/components/ui/Progress'
import {
  canAccessFamilyConversations,
  updateAdventure,
  useAdventure,
} from '@/store/adventureStore'
import type { FamilyConversation } from '@/types/adventure'
import { appPaths } from '@/routes/paths'
import { cn } from '@/lib/utils'
import '@/styles/student/adventure.css'
import {
  familyConversationDemoData,
  familyConversationTopics,
  type ConversationAudience,
  type FamilyConversationTopic,
} from '@/data/content/familyConversations'

type ConversationTab = 'answer' | 'waiting' | 'ready' | 'completed'

const tabs: { id: ConversationTab; label: string }[] = [
  { id: 'answer', label: 'Te toca responder' },
  { id: 'waiting', label: 'Esperando respuesta' },
  { id: 'ready', label: 'Listos para conversar' },
  { id: 'completed', label: 'Conversados' },
]

function FamilyConversationsView({ audience = 'student' }: { audience?: ConversationAudience }) {
  const state = useAdventure()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ConversationTab>('answer')
  const [selectedTopicId, setSelectedTopicId] = useState<string>()
  const [giftOpen, setGiftOpen] = useState(false)
  const conversations = useMemo(() => {
    const values = new Map(familyConversationDemoData.map((conversation) => [conversation.id, conversation]))
    state.conversations.forEach((conversation) => values.set(conversation.id, conversation))
    return values
  }, [state.conversations])
  const topicRows = familyConversationTopics.map((topic) => {
    const conversation = conversations.get(topic.id)
    return { topic, conversation, status: getTopicStatus(conversation, audience) }
  })
  const selected = topicRows.find(({ topic }) => topic.id === selectedTopicId)
  const completedCount = topicRows.filter(({ status }) => status === 'completed').length
  const { giftCompleted, canPreviewGift } = getConversationGift(completedCount)

  if (!canAccessFamilyConversations(state)) {
    return (
      <div className="p-5 sm:p-8">
        <section className="mx-auto max-w-2xl rounded-3xl border bg-card p-8">
          <LockKeyhole className="mb-4 size-10 text-primary" />
          <h1 className="text-2xl font-bold">Un espacio para conversar en familia</h1>
          <p className="my-4 text-sm leading-7 text-muted-foreground">
            Todos los temas estarán disponibles cuando el estudiante complete el cierre del Bloque 5. Después
            podrán recorrerlos a su ritmo, sin fechas límite.
          </p>
        </section>
      </div>
    )
  }

  if (selected) {
    return (
      <ConversationTopicDetail
        audience={audience}
        conversation={selected.conversation}
        onBack={() => setSelectedTopicId(undefined)}
        onOpenJournal={() =>
          navigate(`${appPaths.student.journal}?conversation=${encodeURIComponent(selected.topic.id)}`)
        }
        topic={selected.topic}
      />
    )
  }

  return (
    <div className={`${audience === 'student' ? 'adventure-page' : ''} min-h-full p-4 sm:p-8`}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <Badge variant="secondary">
            <HeartHandshake className="size-4" /> Conversaciones en familia
          </Badge>
          <h1 className="mb-3 mt-4 text-3xl font-bold">Dos miradas, una conversación</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Respondan por separado. Cuando estén ambas respuestas, encontrarán una guía para conversar fuera
            de la plataforma y cerrar el tema cuando quieran.
          </p>
        </header>

        <GiftProgressCard
          audience={audience}
          canOpen={canPreviewGift}
          completed={giftCompleted}
          completedCount={completedCount}
          open={giftOpen}
          onOpenChange={setGiftOpen}
        />

        <nav
          aria-label="Estados de conversación"
          className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const count = topicRows.filter(({ status }) => status === tab.id).length
            return (
              <button
                key={tab.id}
                type="button"
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`flex min-w-fit items-center gap-2 rounded-full border px-4 py-2 text-left text-xs font-semibold transition sm:text-sm ${
                  activeTab === tab.id
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card hover:border-primary/40 hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-card/18 text-[10px]">
                  {count}
                </span>
              </button>
            )
          })}
        </nav>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          {topicRows
            .filter(({ status }) => status === activeTab)
            .map(({ topic, conversation, status }) => (
              <ConversationTopicCard
                key={topic.id}
                audience={audience}
                conversation={conversation}
                onOpen={() => setSelectedTopicId(topic.id)}
                status={status}
                topic={topic}
              />
            ))}
        </section>
        {!topicRows.some(({ status }) => status === activeTab) && (
          <div className="mt-5 rounded-3xl border border-dashed bg-card/60 p-10 text-center">
            <MessageCircleHeart className="mx-auto mb-3 size-9 text-primary/65" />
            <p className="font-semibold">No hay temas en este estado por ahora.</p>
            <p className="mt-2 text-sm text-muted-foreground">Pueden volver cuando quieran.</p>
          </div>
        )}
      </div>
      <GuideDialogue
        audience={audience}
        text="No hace falta estar de acuerdo en todo. Respondan desde su propia mirada y usen la guía cuando encuentren un momento tranquilo para escucharse."
      />
    </div>
  )
}

function ConversationTopicCard({
  audience,
  conversation,
  onOpen,
  status,
  topic,
}: {
  audience: ConversationAudience
  conversation?: FamilyConversation
  onOpen: () => void
  status: ConversationTab
  topic: FamilyConversationTopic
}) {
  const otherLabel = audience === 'student' ? 'tu papá, mamá o apoderado' : 'tu hijo/a'
  const actionLabels: Record<ConversationTab, string> = {
    answer: 'Responder',
    waiting: 'Ver respuesta',
    ready: 'Ver encuentro',
    completed: 'Consultar',
  }
  const cardStyles: Record<ConversationTab, string> = {
    answer:
      'border-[var(--family-answer-border)] bg-[image:var(--student-family-answer-image)] [.theme-staff_&]:bg-card',
    waiting:
      'border-[var(--family-waiting-border)] bg-[image:var(--student-family-waiting-image)] [.theme-staff_&]:bg-card',
    ready:
      'border-[var(--family-ready-border)] bg-[image:var(--student-family-ready-image)] [.theme-staff_&]:bg-card',
    completed:
      'border-[var(--family-completed-border)] bg-[image:var(--student-family-completed-image)] [.theme-staff_&]:bg-card',
  }
  const statusCopy: Record<ConversationTab, string> = {
    answer: 'Tu respuesta está pendiente',
    waiting: `Esperando a ${otherLabel}`,
    ready: 'Ambas respuestas están listas',
    completed: 'Ambos marcaron la conversación',
  }
  return (
    <article
      data-family-status={status}
      className={cn(
        'relative flex min-h-[250px] flex-col overflow-hidden rounded-[26px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6',
        cardStyles[status],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Badge
          className="max-w-[calc(100%-3.5rem)] whitespace-normal border-current/15 bg-card/60"
          variant="outline"
        >
          <BookOpenText className="size-3.5" /> {topic.block}
        </Badge>
        <span aria-hidden="true" className="text-3xl drop-shadow-sm sm:text-4xl">
          {topic.symbol}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/55 [.theme-staff_&]:text-muted-foreground">
        {topic.title}
      </p>
      <h2 className="mt-2 max-w-[34rem] text-lg font-bold leading-7 text-foreground sm:text-xl">
        {topic.prompts[audience]}
      </h2>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <ParticipantPair audience={audience} conversation={conversation} />
          <p
            data-family-status-copy
            className="mt-2 text-[11px] font-semibold text-foreground/55 [.theme-staff_&]:text-muted-foreground"
          >
            {statusCopy[status]}
          </p>
        </div>
        <Button
          className="shrink-0 rounded-full px-4"
          onClick={onOpen}
          size="sm"
          variant={status === 'answer' ? 'default' : 'outline'}
        >
          {actionLabels[status]} <ArrowRight />
        </Button>
      </div>
    </article>
  )
}

function ParticipantPair({
  audience,
  conversation,
}: {
  audience: ConversationAudience
  conversation?: FamilyConversation
}) {
  return (
    <div className="flex -space-x-2" aria-label="Participación en el tema">
      <ParticipantState
        answered={Boolean(conversation?.student)}
        label={audience === 'student' ? 'Tú' : 'Estudiante'}
        marked={Boolean(conversation?.studentMarkedAt)}
        initials="E"
      />
      <ParticipantState
        answered={Boolean(conversation?.parent)}
        label={audience === 'parent' ? 'Tú' : 'Familia'}
        marked={Boolean(conversation?.parentMarkedAt)}
        initials="F"
      />
    </div>
  )
}

function ParticipantState({
  answered,
  initials,
  label,
  marked,
}: {
  answered: boolean
  initials: string
  label: string
  marked: boolean
}) {
  return (
    <span
      className={cn(
        'relative grid size-9 place-items-center rounded-full border-2 border-[var(--family-white-border)] text-[11px] font-black shadow-sm',
        answered
          ? 'bg-[var(--family-participant)] text-primary-foreground'
          : 'bg-card/75 text-foreground/40 [.theme-staff_&]:text-muted-foreground',
      )}
      title={`${label}: ${answered ? 'respondió' : 'respuesta pendiente'}${marked ? ' y ya conversó' : ''}`}
    >
      {initials}
      {marked && (
        <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full border border-[var(--family-white-border)] bg-[var(--family-completed)] text-primary-foreground">
          <Check className="!size-2.5" />
        </span>
      )}
      <span className="sr-only">{`${label}: ${answered ? 'respondió' : 'respuesta pendiente'}${marked ? ' y ya conversó' : ''}`}</span>
    </span>
  )
}

function ConversationTopicDetail({
  audience,
  conversation,
  onBack,
  onOpenJournal,
  topic,
}: {
  audience: ConversationAudience
  conversation?: FamilyConversation
  onBack: () => void
  onOpenJournal: () => void
  topic: FamilyConversationTopic
}) {
  const [answer, setAnswer] = useState('')
  const [reflection, setReflection] = useState(
    conversation?.[audience === 'student' ? 'studentReflection' : 'parentReflection'] ?? '',
  )
  const ownAnswer = conversation?.[audience]
  const otherAudience = audience === 'student' ? 'parent' : 'student'
  const otherAnswer = conversation?.[otherAudience]
  const bothAnswered = Boolean(ownAnswer && otherAnswer)
  const ownMarkedKey = audience === 'student' ? 'studentMarkedAt' : 'parentMarkedAt'
  const ownMarked = Boolean(conversation?.[ownMarkedKey])

  function saveAnswer() {
    if (!answer.trim() || ownAnswer) return
    updateConversation(topic.id, (current) => ({
      ...current,
      [audience]: answer.trim(),
      [audience === 'student' ? 'studentAnsweredAt' : 'parentAnsweredAt']: new Date().toISOString(),
    }))
    setAnswer('')
  }

  function markConversation() {
    if (!bothAnswered || ownMarked) return
    updateConversation(topic.id, (current) => {
      const timestamp = new Date().toISOString()
      const next: FamilyConversation = {
        ...current,
        [ownMarkedKey]: timestamp,
        [audience === 'student' ? 'studentReflection' : 'parentReflection']: reflection.trim() || undefined,
      }
      if (next.studentMarkedAt && next.parentMarkedAt) next.completedAt = timestamp
      return next
    })
  }

  return (
    <div className={`${audience === 'student' ? 'adventure-page' : ''} min-h-full p-4 sm:p-8`}>
      <main className="mx-auto max-w-5xl">
        <Button className="-ml-3" onClick={onBack} variant="ghost">
          <ArrowLeft /> Volver a los temas
        </Button>
        <div className="mt-4 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
          <Badge variant="outline">{topic.block}</Badge>
          <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{topic.title}</h1>

          {!ownAnswer ? (
            <section className="mt-7 max-w-2xl">
              <p className="text-lg font-semibold leading-8">{topic.prompts[audience]}</p>
              <label className="mt-6 block text-sm font-semibold" htmlFor={`answer-${topic.id}`}>
                Tu respuesta
                <textarea
                  id={`answer-${topic.id}`}
                  className="adventure-input mt-2 min-h-36"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Escribe desde tu propia mirada..."
                />
              </label>
              <Button className="mt-4" disabled={!answer.trim()} onClick={saveAnswer}>
                Guardar mi respuesta
              </Button>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                La otra respuesta seguirá oculta hasta que ambos hayan respondido.
              </p>
            </section>
          ) : !bothAnswered ? (
            <section className="mt-7 grid gap-5 md:grid-cols-2">
              <AnswerCard label="Tu mirada" question={topic.prompts[audience]} text={ownAnswer} />
              <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed bg-muted/40 p-6 text-center">
                <div>
                  <UsersRound className="mx-auto mb-3 size-8 text-primary/65" />
                  <p className="font-semibold">
                    Esperando a {audience === 'student' ? 'tu papá, mamá o apoderado' : 'tu hijo/a'}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    La respuesta aparecerá cuando esté lista.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="mt-7 grid gap-5 md:grid-cols-2" aria-label="Revelación de respuestas">
                <AnswerCard
                  label="Mirada del estudiante"
                  question={topic.prompts.student}
                  text={conversation?.student ?? ''}
                />
                <AnswerCard
                  label="Mirada de la familia"
                  question={topic.prompts.parent}
                  text={conversation?.parent ?? ''}
                />
              </section>
              <section className="mt-6 rounded-2xl bg-[var(--primary-soft)] p-5 sm:p-6">
                <h2 className="font-bold">Un puente entre ambas miradas</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{topic.bridge}</p>
              </section>
              <section className="mt-6 grid gap-6 rounded-2xl border p-5 sm:p-6 md:grid-cols-[1fr_280px]">
                <div>
                  <h2 className="font-bold">Preguntas para conversar</h2>
                  <ul className="mt-4 space-y-3 text-sm leading-6">
                    {topic.guideQuestions.map((question) => (
                      <li className="flex gap-3" key={question}>
                        <MessageCircleHeart className="mt-0.5 size-4 shrink-0 text-primary" /> {question}
                      </li>
                    ))}
                  </ul>
                </div>
                <aside className="rounded-2xl bg-muted p-4 text-sm leading-6">
                  <strong>Algo que ya saben</strong>
                  <p className="mt-2 text-muted-foreground">{topic.toneTip}</p>
                </aside>
              </section>
              <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
                Ahora les toca conversar. Vuelvan cuando quieran contarnos cómo les fue.
              </p>

              <section className="mx-auto mt-6 max-w-2xl rounded-2xl border bg-muted/25 p-5 sm:p-6">
                {ownMarked ? (
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto mb-3 size-9 text-[var(--family-completed-text)]" />
                    <h2 className="font-bold">Marcaste este tema como conversado</h2>
                    {reflection && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        Tu reflexión privada: {reflection}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="font-bold">Cuando hayan conversado</h2>
                    <label className="mt-4 block text-sm" htmlFor={`reflection-${topic.id}`}>
                      Reflexión privada opcional
                      <textarea
                        id={`reflection-${topic.id}`}
                        className="adventure-input mt-2 min-h-24"
                        value={reflection}
                        onChange={(event) => setReflection(event.target.value)}
                        placeholder="Una idea que quieras guardar solo para ti..."
                      />
                    </label>
                    <Button className="mt-4 w-full sm:w-auto" onClick={markConversation}>
                      <Check /> Ya conversamos
                    </Button>
                  </>
                )}
              </section>

              {audience === 'student' && ownMarked && (
                <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary/25 bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold">¿Quieres contarle algo a Lumi?</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Es opcional y la entrada se abrirá con una pregunta sobre este tema.
                    </p>
                  </div>
                  <Button onClick={onOpenJournal} variant="outline">
                    <BookOpenText /> Contarle a Lumi
                  </Button>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <GuideDialogue
        audience={audience}
        text="Las respuestas tienen el mismo valor. La guía sirve para escucharse y encontrar preguntas que quieran seguir explorando juntos."
      />
    </div>
  )
}

function AnswerCard({ label, question, text }: { label: string; question: string; text: string }) {
  return (
    <article className="min-h-48 rounded-2xl border bg-card p-5 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <h2 className="mt-3 text-sm font-bold leading-6">{question}</h2>
      <p className="mt-4 whitespace-pre-wrap break-words border-t pt-4 text-sm leading-7">{text}</p>
    </article>
  )
}

function GiftProgressCard({
  audience,
  canOpen,
  completed,
  completedCount,
  open,
  onOpenChange,
}: {
  audience: ConversationAudience
  canOpen: boolean
  completed: boolean
  completedCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const state = useAdventure()
  const { resourceId, saved, letter } = getGiftResource(state, audience)

  function saveLetter() {
    if (saved) return
    updateAdventure((current) => ({
      ...current,
      bookmarks: [...new Set([...current.bookmarks, resourceId])],
    }))
  }

  return (
    <section className="mb-6 rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--family-gift-icon-bg)] text-[var(--family-gift-icon-text)]">
            <Gift className="size-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {completed ? 'Regalo desbloqueado' : 'Un regalo para el final'}
            </p>
            <p className="mt-1 font-bold">
              {completedCount} de {familyConversationTopics.length} temas conversados
            </p>
          </div>
        </div>
        <Button disabled={!canOpen} onClick={() => onOpenChange(true)} size="sm" variant="outline">
          <Sparkles /> Visualizar regalo
        </Button>
      </div>
      <Progress
        aria-label={`${completedCount} de ${familyConversationTopics.length} temas conversados`}
        className="mt-4"
        value={(completedCount / familyConversationTopics.length) * 100}
      />
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Avancen a su ritmo. En este prototipo puedes previsualizar la carta antes de completar todos los
        temas.
      </p>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl overflow-hidden border-[var(--family-letter-border)] bg-[var(--family-warm-surface)] p-0">
          <div className="bg-[image:var(--family-letter-image)] [.theme-staff_&]:bg-card p-6 sm:p-9">
            <DialogHeader>
              <Badge
                className="w-fit bg-[var(--family-letter-badge)] text-[var(--family-letter-label)]"
                variant="secondary"
              >
                <Gift className="size-3.5" /> Una carta para ti
              </Badge>
              <DialogTitle>
                {audience === 'student' ? 'Una nota de tu familia' : 'Una nota de tu hijo/a'}
              </DialogTitle>
              <DialogDescription>Un recuerdo para volver a leer cuando lo necesites.</DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-[var(--family-letter-border)]/80 bg-card/80 p-5 shadow-sm sm:p-7">
              <p className="whitespace-pre-wrap font-serif text-lg leading-9 text-[var(--family-letter-text)]">
                {letter}
              </p>
              <p className="mt-6 border-t border-[var(--family-letter-border)] pt-5 text-sm leading-7 text-[var(--family-letter-secondary)]">
                Este espacio seguirá disponible. Pueden revisar sus respuestas y volver a conversar sobre
                cualquier tema cuando quieran retomarlo.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p data-family-letter-caption className="text-xs text-[var(--family-letter-label)]/70">
                {saved
                  ? 'La nota está guardada en Mis recursos.'
                  : 'Puedes conservar esta nota en Mis recursos.'}
              </p>
              <Button disabled={saved} onClick={saveLetter}>
                <Bookmark /> {saved ? 'Guardada en Mis recursos' : 'Guardar en Mis recursos'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export { FamilyConversationsView }
