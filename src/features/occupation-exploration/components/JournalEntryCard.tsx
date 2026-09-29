import { ArrowRight, BookOpen, CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/Button'

function JournalEntryCard({
  completed,
  prompt,
  onOpen,
}: {
  completed: boolean
  prompt?: string
  onOpen: () => void
}) {
  if (!completed)
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#d7dde0] bg-[#f4f6f7] p-3.5 text-[#69777d]">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#9aa7ad] text-white shadow-sm">
          <CircleHelp className="size-5" />
        </span>
        <p className="text-sm leading-5">Termina esta misión para descubrir esta entrada al diario.</p>
      </div>
    )

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#e8c2c0] bg-[#fff2f0] p-3.5 text-[#783b39]">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d86d67] text-white shadow-sm">
        <BookOpen className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.08em]">Entrada sugerida:</p>
        <p className="mt-1 text-sm leading-5">{prompt}</p>
        <Button className="mt-3 ml-auto px-2 text-[#a34d48]" size="sm" variant="ghost" onClick={onOpen}>
          Ir al diario <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

export { JournalEntryCard }
