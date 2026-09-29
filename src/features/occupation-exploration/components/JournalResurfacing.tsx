import { useState } from 'react'
import { BookOpenText, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible'
import { appPaths } from '@/routes/paths'
import { cn } from '@/lib/Utils'
import { useAdventure } from '../lib/AdventureStore'

function JournalResurfacing() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const entries = [...useAdventure().journal]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, 3)

  if (!entries.length) return null

  return (
    <Collapsible
      className="mb-7 rounded-3xl border border-[#4b4066]/20 bg-[#eef1ed]"
      onOpenChange={setOpen}
      open={open}
    >
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center gap-4 p-5 text-left sm:p-6" type="button">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#4b4066]/10 text-[#4b4066]">
            <BookOpenText className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[#2b2a28]">De tu diario</strong>
            <span className="mt-1 block text-sm text-[#5c5a54]">
              Antes de ordenar tus opciones, puedes volver a algo que escribiste en el camino.
            </span>
          </span>
          <ChevronDown className={cn('size-5 transition-transform', open && 'rotate-180')} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 border-t border-[#dad6c9] p-5 sm:p-6">
        {entries.map((entry) => (
          <article className="rounded-2xl bg-white/75 p-4" key={entry.id}>
            <Badge variant="outline">
              {new Date(entry.createdAt).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'long',
              })}
            </Badge>
            <p className="mt-3 line-clamp-2 font-serif leading-7 text-[#2b2a28]">“{entry.body}”</p>
          </article>
        ))}
        <Button onClick={() => navigate(appPaths.student.journal)} variant="ghost">
          Ver todas mis entradas
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { JournalResurfacing }
