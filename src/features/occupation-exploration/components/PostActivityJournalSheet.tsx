import { useState } from 'react'
import { Compass, LockKeyhole } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/Sheet'
import { getActivityPrompt } from '../data/JournalData'
import { updateAdventure, useAdventure } from '../lib/AdventureStore'
import type { JournalEntry, ReadinessCheckIn } from '../types/AdventureTypes'
import { getLumiTags } from '../lib/LumiSuggestions'
import { lumiFriendshipRules } from '../lib/LumiFriendship'
import { LumiQuestion } from './LumiJournalPanel'

function PostActivityJournalSheet({
  activityId,
  activityTitle,
  onClose,
  open,
}: {
  activityId: string
  activityTitle: string
  onClose: () => void
  open: boolean
}) {
  const state = useAdventure()
  const [body, setBody] = useState('')
  const [readiness, setReadiness] = useState<ReadinessCheckIn['value']>()
  const prompt = getActivityPrompt(activityId, state.readinessCheckIns)
  const tags = getLumiTags(activityId)

  function close() {
    setBody('')
    setReadiness(undefined)
    onClose()
  }

  function save() {
    if (!body.trim() && !readiness) return
    updateAdventure((current) => {
      const createdAt = new Date().toISOString()
      const entry: JournalEntry | undefined = body.trim()
        ? {
            id: crypto.randomUUID(),
            title: activityTitle,
            body: body.trim(),
            kind: 'prompted',
            createdAt,
            linkedActivityId: activityId,
            promptShown: prompt,
            topicTags: tags,
            lockedTopicTags: tags,
            missionId: activityId,
          }
        : undefined
      const checkIn: ReadinessCheckIn | undefined = readiness
        ? {
            id: crypto.randomUUID(),
            createdAt,
            linkedActivityId: activityId,
            value: readiness,
            entryId: entry?.id,
          }
        : undefined
      return {
        ...current,
        journal: entry ? [...current.journal, entry] : current.journal,
        readinessCheckIns: checkIn ? [...current.readinessCheckIns, checkIn] : current.readinessCheckIns,
      }
    })
    close()
  }

  return (
    <Sheet open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent
        className="journal-sheet flex max-h-[92vh] flex-col overflow-y-auto bg-[#eef1ed] sm:max-w-lg"
        side="responsive"
      >
        <SheetHeader className="pr-7">
          <SheetDescription>Acabas de terminar “{activityTitle}”</SheetDescription>
          <SheetTitle className="text-2xl text-[#2b2a28]">Cuéntale a Lumi</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <Badge className="border-[#4b4066]/20 bg-[#4b4066]/10 text-[#4b4066]" variant="outline">
            <LockKeyhole className="size-3.5" /> Esto es solo tuyo
          </Badge>
          <div>
            <LumiQuestion prompt={prompt} />
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag} · sugerida
                </Badge>
              ))}
            </div>
            <textarea
              aria-label="Reflexión privada"
              className="mt-4 min-h-48 w-full resize-y rounded-2xl border border-[#4b4066]/45 bg-white/80 p-4 font-serif text-base leading-8 text-[#2b2a28] outline-none focus:ring-3 focus:ring-[#4b4066]/15"
              onChange={(event) => setBody(event.target.value)}
              placeholder="Lumi, hoy quiero contarte…"
              value={body}
            />
            <p className="mt-2 text-xs leading-5 text-[#5c5a54]">
              Una palabra también es suficiente. Cada conversación nueva suma 1 punto de amistad, hasta{' '}
              {lumiFriendshipRules.dailyPointLimit} al día.
            </p>
          </div>
          <Separator className="bg-[#dad6c9]" />
          <fieldset className="rounded-2xl border border-[#3e6259]/20 bg-[#3e6259]/7 p-4">
            <legend className="flex items-center gap-2 px-1 font-semibold text-[#3e6259]">
              <Compass className="size-4" /> ¿Qué tan seguro te sientes hoy de tu próximo paso?
            </legend>
            <output className="mt-4 block text-center text-4xl font-bold text-[#3e6259]">
              {readiness ?? '—'}
            </output>
            <input
              aria-label="Seguridad vocacional del 1 al 10"
              className="mt-4 w-full accent-[#3e6259]"
              max="10"
              min="1"
              onChange={(event) => setReadiness(Number(event.target.value) as ReadinessCheckIn['value'])}
              type="range"
              value={readiness ?? 5}
            />
            <div className="mt-2 flex justify-between text-[11px] text-[#5c5a54]">
              <span>1 · Nada seguro</span>
              <span>10 · Muy seguro</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#5c5a54]">
              Tu orientadora puede ver solo este dato. Nunca verá lo que escribiste arriba.
            </p>
          </fieldset>
        </div>
        <SheetFooter className="mt-auto gap-2 pt-7">
          <Button onClick={close} variant="ghost">
            Omitir por ahora
          </Button>
          <Button
            className="bg-[#4b4066] text-white hover:bg-[#3f3656]"
            disabled={!body.trim() && !readiness}
            onClick={save}
          >
            Guardar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export { PostActivityJournalSheet }
