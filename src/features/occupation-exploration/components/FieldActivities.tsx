import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CloudUpload,
  FileCheck2,
  Flag,
  MessageCircle,
  Paperclip,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/Utils'
import { getFieldMissionActivity, type MissionStep } from '../data/FieldMissionActivityData'
import type { FieldMission } from '../data/AdventureData'
import { completeMission, updateAdventure, useAdventure } from '../lib/AdventureStore'
import { ForestFireCaseTopBar } from './ForestFireCaseTopBar'
import { PostActivityJournalSheet } from './PostActivityJournalSheet'

function FieldMissionActivity({ mission, onClose }: { mission: FieldMission; onClose: () => void }) {
  const adventure = useAdventure()
  const activity = getFieldMissionActivity(mission.id)
  const alreadyCompleted = adventure.completedMissionIds.includes(mission.id)
  const initialStep = alreadyCompleted
    ? 0
    : Math.min(adventure.missionProgress[mission.id] ?? 0, activity.steps.length - 1)
  const [stepIndex, setStepIndex] = useState(initialStep)
  const [challengeAnswers, setChallengeAnswers] = useState<Record<string, string>>({})
  const [challengeChecked, setChallengeChecked] = useState<Record<string, boolean>>({})
  const [resourceOpen, setResourceOpen] = useState(false)
  const [finished, setFinished] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [fileError, setFileError] = useState('')
  const pageRef = useRef<HTMLDivElement>(null)
  const step = activity.steps[stepIndex]
  const progress = finished ? 100 : ((stepIndex + 1) / activity.steps.length) * 100

  useEffect(() => {
    pageRef.current?.scrollTo({ top: 0 })
    setResourceOpen(false)
    setFileError('')
  }, [stepIndex])

  const canContinue = useMemo(
    () => getStepCompletion(step, mission.id, adventure, challengeAnswers, challengeChecked),
    [adventure, challengeAnswers, challengeChecked, mission.id, step],
  )

  function setCurrentStep(nextStep: number) {
    setStepIndex(nextStep)
    updateAdventure((current) => ({
      ...current,
      missionProgress: { ...current.missionProgress, [mission.id]: nextStep },
    }))
  }

  function continueMission() {
    if (!canContinue) return
    if (step.kind === 'text' || step.kind === 'deliverable') {
      updateAdventure((current) => {
        const body = current.reflectionDrafts[mission.id]?.trim()
        if (!body) return current
        const reflectionDrafts = { ...current.reflectionDrafts }
        delete reflectionDrafts[mission.id]
        return {
          ...current,
          activityResponses: { ...current.activityResponses, [mission.id]: body },
          reflectionDrafts,
        }
      })
    }
    if (stepIndex < activity.steps.length - 1) {
      setCurrentStep(stepIndex + 1)
      return
    }
    completeMission(mission.id)
    updateAdventure((current) => {
      const missionProgress = { ...current.missionProgress }
      delete missionProgress[mission.id]
      return { ...current, missionProgress }
    })
    setFinished(true)
  }

  return (
    <div className="fixed inset-0 z-40 min-h-svh overflow-hidden bg-[#edf1e7] text-[#243d33]">
      <ForestFireCaseTopBar
        contextLabel={mission.region}
        exitCancelLabel="Seguir en la misión"
        exitConfirmLabel="Volver al mapa"
        exitDescription={
          activity.completionMode === 'saves-responses'
            ? 'Tus respuestas y el paso actual ya están guardados. Podrás retomar la misión desde aquí.'
            : 'Guardaremos el paso en el que estás para que puedas continuar cuando regreses.'
        }
        exitMode="saved"
        exitTitle="¿Quieres volver al mapa?"
        label={finished ? 'Misión completada' : mission.title}
        onClose={onClose}
        progress={progress}
        userRole="Explorador en misión"
      />

      <div ref={pageRef} className="mission-player-scroll h-[calc(100svh-5.25rem)] overflow-y-auto">
        <main className="mission-player-shell mx-auto min-h-full max-w-[1080px] px-4 py-5 lg:px-7 lg:py-7">
          <section className="relative flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-[30px] border border-white/80 bg-[#f9f8f1] shadow-[0_24px_80px_rgb(48_75_61/14%)]">
            <div aria-hidden="true" className="mission-player-scenery absolute inset-x-0 top-0 h-48" />
            {finished ? (
              <MissionComplete
                alreadyCompleted={alreadyCompleted}
                mission={mission}
                onClose={onClose}
                onJournal={() => setJournalOpen(true)}
                onRestart={() => {
                  setFinished(false)
                  setCurrentStep(0)
                }}
              />
            ) : (
              <>
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/60 bg-white/80 text-[#3e6755] shadow-sm" variant="outline">
                      Paso {stepIndex + 1} de {activity.steps.length}
                    </Badge>
                    <Badge className="border-white/60 bg-white/65 text-[#6b735d]" variant="outline">
                      {getStepLabel(step)}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-[#527060]">
                    <ShieldCheck className="size-4" />
                    {activity.completionMode === 'finish-only' ? 'Solo registra avance' : 'Cambios guardados'}
                  </p>
                </div>

                <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-4 pt-24 sm:px-8 sm:pb-8 sm:pt-28">
                  <div className="mx-auto flex w-full max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5">
                    <GuideCompanion />
                    <article className="mission-speech-bubble min-w-0 flex-1 rounded-[26px] border border-[#d8dece] bg-[#fffdf8] p-5 shadow-[0_20px_50px_rgb(45_70_57/13%)] sm:p-7">
                      <div className="mb-5 flex items-center gap-2 border-b border-[#e6e8dd] pb-4">
                        <span className="text-sm font-black text-[#315745]">Lumi</span>
                        <span className="text-xs text-[#748077]">· Tu compañero de aventura</span>
                      </div>
                      {step.eyebrow && (
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#7a8c64]">
                          {step.eyebrow}
                        </p>
                      )}
                      <h1 className="text-2xl font-black tracking-[-0.025em] text-[#254536] sm:text-3xl">
                        {step.title}
                      </h1>
                      <p className="mt-3 max-w-3xl text-base leading-7 text-[#56675e]">{step.text}</p>

                      <StepInteraction
                        challengeAnswers={challengeAnswers}
                        challengeChecked={challengeChecked}
                        fileError={fileError}
                        missionId={mission.id}
                        onChallengeAnswer={(stepId, answer) => {
                          setChallengeAnswers((current) => ({ ...current, [stepId]: answer }))
                          setChallengeChecked((current) => ({ ...current, [stepId]: false }))
                        }}
                        onChallengeCheck={(stepId) =>
                          setChallengeChecked((current) => ({ ...current, [stepId]: true }))
                        }
                        onFileChange={(event) => handleFileChange(event, mission.id, setFileError)}
                        onResourceToggle={() => setResourceOpen((current) => !current)}
                        resourceOpen={resourceOpen}
                        step={step}
                      />
                    </article>
                  </div>

                  <div className="mx-auto mt-5 flex w-full max-w-4xl items-center justify-between gap-3 pl-0 sm:pl-[116px]">
                    <Button
                      disabled={stepIndex === 0}
                      onClick={() => setCurrentStep(stepIndex - 1)}
                      variant="ghost"
                    >
                      <ArrowLeft /> Anterior
                    </Button>
                    <Button
                      className="h-11 rounded-xl bg-[#3f735c] px-5 text-white shadow-md hover:bg-[#335f4b]"
                      disabled={!canContinue}
                      onClick={continueMission}
                    >
                      {stepIndex === activity.steps.length - 1 ? 'Completar misión' : 'Continuar'}
                      {stepIndex === activity.steps.length - 1 ? <Flag /> : <ArrowRight />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <PostActivityJournalSheet
        activityId={mission.id}
        activityTitle={mission.title}
        onClose={() => {
          setJournalOpen(false)
          onClose()
        }}
        open={journalOpen}
      />
    </div>
  )
}

function GuideCompanion() {
  return (
    <div className="relative shrink-0 self-center sm:self-auto">
      <div className="grid size-24 place-items-center rounded-[28px] border-4 border-[#f0d172] bg-[#f8e7a8] text-5xl shadow-[0_10px_0_#d8b85c,0_18px_30px_rgb(55_74_55/18%)]">
        <span aria-hidden="true">🦊</span>
      </div>
      <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full border-2 border-white bg-[#67adba] text-white shadow-md">
        <MessageCircle className="size-4" />
      </span>
    </div>
  )
}

function StepInteraction({
  challengeAnswers,
  challengeChecked,
  fileError,
  missionId,
  onChallengeAnswer,
  onChallengeCheck,
  onFileChange,
  onResourceToggle,
  resourceOpen,
  step,
}: {
  challengeAnswers: Record<string, string>
  challengeChecked: Record<string, boolean>
  fileError: string
  missionId: string
  onChallengeAnswer: (stepId: string, answer: string) => void
  onChallengeCheck: (stepId: string) => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onResourceToggle: () => void
  resourceOpen: boolean
  step: MissionStep
}) {
  const adventure = useAdventure()

  if (step.kind === 'dialogue') return null

  if (step.kind === 'resource')
    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#d8dfcf] bg-[#f1f4e9]">
        <button
          aria-expanded={resourceOpen}
          className="flex w-full items-center gap-3 p-4 text-left"
          onClick={onResourceToggle}
          type="button"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#4c745e] shadow-sm">
            <BookOpen className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold uppercase tracking-[0.1em] text-[#7b876f]">
              {step.resource.label}
            </span>
            <span className="mt-0.5 block font-bold text-[#324e40]">{step.resource.title}</span>
          </span>
          <ChevronDown className={cn('size-5 transition-transform', resourceOpen && 'rotate-180')} />
        </button>
        {resourceOpen && (
          <div className="border-t border-[#d8dfcf] bg-white/65 px-5 py-5">
            <p className="text-sm leading-7 text-[#52645a]">{step.resource.body}</p>
            <p className="mt-4 rounded-xl border-l-4 border-[#6fa18d] bg-white p-3 text-sm font-semibold text-[#365646]">
              {step.resource.takeaway}
            </p>
          </div>
        )}
      </div>
    )

  if (step.kind === 'challenge') {
    const answer = challengeAnswers[step.id]
    const checked = challengeChecked[step.id]
    const correct = checked && answer === step.correctOptionId
    return (
      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-[#304c3e]">{step.prompt}</legend>
        <div className="mt-3 grid gap-2.5">
          {step.options.map((option) => (
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3.5 text-sm leading-6 transition-colors',
                answer === option.id && 'border-[#5f8d75] bg-[#edf5ee] ring-2 ring-[#6f9c84]/15',
              )}
              key={option.id}
            >
              <input
                checked={answer === option.id}
                className="mt-1 accent-[#3f735c]"
                name={step.id}
                onChange={() => onChallengeAnswer(step.id, option.id)}
                type="radio"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button disabled={!answer} onClick={() => onChallengeCheck(step.id)} variant="outline">
            <ClipboardCheck /> Comprobar respuesta
          </Button>
          {checked && (
            <p
              className={cn(
                'flex-1 rounded-xl px-4 py-3 text-sm font-semibold leading-6',
                correct ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900',
              )}
              role="status"
            >
              {correct ? step.successMessage : step.retryMessage}
            </p>
          )}
        </div>
      </fieldset>
    )
  }

  if (step.kind === 'text') {
    const body = adventure.reflectionDrafts[missionId] ?? adventure.activityResponses[missionId] ?? ''
    return (
      <div className="mt-6">
        <label className="text-sm font-bold text-[#304c3e]" htmlFor={`response-${missionId}`}>
          {step.prompt}
        </label>
        <textarea
          className="adventure-input mt-2 min-h-36 resize-y bg-white text-base leading-7"
          id={`response-${missionId}`}
          onChange={(event) =>
            updateAdventure((current) => ({
              ...current,
              reflectionDrafts: { ...current.reflectionDrafts, [missionId]: event.target.value },
            }))
          }
          placeholder={step.placeholder}
          value={body}
        />
        <p className="mt-2 text-xs text-[#77827b]">
          {body.trim().length} caracteres · mínimo {step.minimumCharacters ?? 1}
        </p>
      </div>
    )
  }

  if (step.kind === 'question') {
    const answer = adventure.questionnaire.answers[step.questionId]
    const openAnswer = adventure.questionnaire.openAnswers[step.questionId] ?? ''
    return (
      <fieldset className="mt-6">
        <legend className="text-base font-bold text-[#304c3e]">{step.prompt}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {step.options.map((option) => (
            <label
              className={cn(
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm leading-5 transition-all',
                answer === option && 'border-[#5f8d75] bg-[#edf5ee] ring-2 ring-[#6f9c84]/15',
              )}
              key={option}
            >
              <input
                checked={answer === option}
                className="accent-[#3f735c]"
                name={step.questionId}
                onChange={() =>
                  updateAdventure((current) => ({
                    ...current,
                    questionnaire: {
                      ...current.questionnaire,
                      answers: { ...current.questionnaire.answers, [step.questionId]: option },
                      review: step.sensitive
                        ? { ...current.questionnaire.review, [step.questionId]: 'pending' }
                        : current.questionnaire.review,
                    },
                  }))
                }
                type="radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {step.openPrompt && (
          <div className="mt-4 rounded-xl bg-[#f1f3ea] p-4">
            <label className="text-sm font-semibold text-[#405a4c]" htmlFor={`open-${step.questionId}`}>
              {step.openPrompt}
            </label>
            <textarea
              className="adventure-input mt-2 min-h-24 bg-white"
              id={`open-${step.questionId}`}
              onChange={(event) =>
                updateAdventure((current) => ({
                  ...current,
                  questionnaire: {
                    ...current.questionnaire,
                    openAnswers: {
                      ...current.questionnaire.openAnswers,
                      [step.questionId]: event.target.value,
                    },
                    review: { ...current.questionnaire.review, [step.questionId]: 'pending' },
                  },
                }))
              }
              placeholder="Opcional"
              value={openAnswer}
            />
          </div>
        )}
      </fieldset>
    )
  }

  const body = adventure.reflectionDrafts[missionId] ?? adventure.activityResponses[missionId] ?? ''
  const upload = adventure.activityUploads[missionId]
  return (
    <div className="mt-6">
      <p className="text-sm font-bold text-[#304c3e]">{step.prompt}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#7a857e]"
            htmlFor={`deliverable-${missionId}`}
          >
            Escribir aquí
          </label>
          <textarea
            className="adventure-input min-h-36 bg-white text-sm leading-6"
            id={`deliverable-${missionId}`}
            onChange={(event) =>
              updateAdventure((current) => ({
                ...current,
                reflectionDrafts: { ...current.reflectionDrafts, [missionId]: event.target.value },
              }))
            }
            placeholder={step.placeholder}
            value={body}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.1em] text-[#7a857e]">
            O adjuntar evidencia
          </p>
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#9cae9e] bg-[#f5f7f1] p-4 text-center transition-colors hover:bg-[#eef3eb]">
            {upload ? (
              <>
                <FileCheck2 className="size-7 text-emerald-700" />
                <span className="mt-2 max-w-full truncate text-sm font-bold text-[#365646]">
                  {upload.name}
                </span>
                <span className="mt-1 text-xs text-[#758078]">
                  {formatFileSize(upload.size)} · Cambiar archivo
                </span>
              </>
            ) : (
              <>
                <CloudUpload className="size-7 text-[#5e7c6b]" />
                <span className="mt-2 text-sm font-bold text-[#365646]">Seleccionar PDF o imagen</span>
                <span className="mt-1 text-xs text-[#758078]">Máximo 10 MB</span>
              </>
            )}
            <input accept={step.acceptedFiles} className="sr-only" onChange={onFileChange} type="file" />
          </label>
        </div>
      </div>
      {fileError && (
        <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
          {fileError}
        </p>
      )}
      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-[#77827b]">
        <Paperclip className="mt-0.5 size-3.5 shrink-0" />
        En este prototipo guardamos el nombre del archivo. La carga real se conectará al almacenamiento del
        producto.
      </p>
    </div>
  )
}

function MissionComplete({
  alreadyCompleted,
  mission,
  onClose,
  onJournal,
  onRestart,
}: {
  alreadyCompleted: boolean
  mission: FieldMission
  onClose: () => void
  onJournal: () => void
  onRestart: () => void
}) {
  return (
    <div className="relative z-10 grid flex-1 place-items-center px-5 py-12 text-center">
      <div className="max-w-xl">
        <span className="mx-auto grid size-20 place-items-center rounded-full border-4 border-[#e8ce71] bg-[#fff2b7] text-[#3f735c] shadow-[0_10px_0_#d6b558]">
          <CheckCircle2 className="size-10" />
        </span>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.16em] text-[#748764]">
          Misión completada
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#294b3c] sm:text-4xl">
          {mission.title}
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[#607067]">
          {alreadyCompleted
            ? 'Has vuelto a recorrer esta misión. Tus respuestas guardadas siguen disponibles y puedes regresar al mapa cuando quieras.'
            : 'Llegaste al final del recorrido. La misión ya aparece como completada y tu siguiente destino está listo para explorar.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={onRestart} variant="outline">
            <RotateCcw /> Volver a recorrerla
          </Button>
          <Button onClick={onJournal} variant="outline">
            <BookOpen /> Contarle a Lumi
          </Button>
          <Button className="bg-[#3f735c] text-white hover:bg-[#335f4b]" onClick={onClose}>
            Volver al mapa <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

function getStepCompletion(
  step: MissionStep,
  missionId: string,
  adventure: ReturnType<typeof useAdventure>,
  challengeAnswers: Record<string, string>,
  challengeChecked: Record<string, boolean>,
) {
  if (step.kind === 'challenge')
    return challengeChecked[step.id] && challengeAnswers[step.id] === step.correctOptionId
  if (step.kind === 'text') {
    const body = adventure.reflectionDrafts[missionId] ?? adventure.activityResponses[missionId] ?? ''
    return body.trim().length >= (step.minimumCharacters ?? 1)
  }
  if (step.kind === 'question') return Boolean(adventure.questionnaire.answers[step.questionId])
  if (step.kind === 'deliverable')
    return Boolean(
      (adventure.reflectionDrafts[missionId] ?? '').trim() || adventure.activityUploads[missionId],
    )
  return true
}

function getStepLabel(step: MissionStep) {
  const labels: Record<MissionStep['kind'], string> = {
    dialogue: 'Conversación',
    resource: 'Recurso',
    challenge: 'Reto',
    text: 'Respuesta',
    question: 'Pregunta',
    deliverable: 'Entregable',
  }
  return labels[step.kind]
}

function handleFileChange(
  event: ChangeEvent<HTMLInputElement>,
  missionId: string,
  setFileError: (message: string) => void,
) {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    setFileError('El archivo supera el límite de 10 MB.')
    event.target.value = ''
    return
  }
  if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
    setFileError('Selecciona un archivo PDF, PNG o JPG.')
    event.target.value = ''
    return
  }
  setFileError('')
  updateAdventure((current) => ({
    ...current,
    activityUploads: {
      ...current.activityUploads,
      [missionId]: { name: file.name, size: file.size, type: file.type },
    },
  }))
}

function formatFileSize(size: number) {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`
}

export { FieldMissionActivity }
