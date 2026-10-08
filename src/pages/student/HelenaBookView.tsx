import { HelenaBookPages } from '@/features/discovery/components/HelenaBookPages'
import { useHelenaPages } from '@/features/discovery/hooks/useHelenaPages'
import { DiscoverySheetContent as SheetContent } from '@/components/student/DiscoverySheetContent'
import { Eye, BookOpen, Users } from 'lucide-react'
import { Sheet, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/Sheet'
import { DiscoveryStage } from '@/features/discovery/components/DiscoveryStage'
import { Seal } from '@/components/student/Seal'
export function HelenaBookView() {
  const model = useHelenaPages()
  const { focus, meaning, setMeaning, pages } = model

  return (
    <DiscoveryStage ambient="profile">
      <header className="sx-d-header">
        <div>
          <h1>El libro de Helena</h1>
          <p>Lo que Helena va descubriendo de ti</p>
        </div>
        <div>
          <strong>{pages.filter((p) => p.state === 'revealed').length} de 3 páginas descifradas</strong>
          <div className="sx-d-seal-row">
            {pages.map((p) => (
              <Seal key={p.id} state={p.state}>
                {p.numeral}
              </Seal>
            ))}
          </div>
        </div>
      </header>
      <HelenaBookPages model={model} />
      <p className="sx-d-privacy">
        <Eye aria-hidden="true" />
        Tu libro lo ven tú y tu orientadora. Tu apoderado solo ve las páginas que ella habilite.
      </p>
      <Sheet open={meaning} onOpenChange={setMeaning}>
        <SheetContent {...focus} className="sx-root sx-d-sheet">
          <SheetHeader>
            <SheetTitle>
              <BookOpen aria-hidden="true" />
              Qué significa este ejemplo
            </SheetTitle>
            <SheetDescription>
              Demostración: estos intereses no se calcularon a partir de tus respuestas.
            </SheetDescription>
          </SheetHeader>
          <p>
            <Users aria-hidden="true" />
            Los intereses describen actividades que podrían despertar curiosidad. No califican tu capacidad ni
            tu valor.
          </p>
          <p>
            El ejemplo reúne Social, Investigador y Artístico. La afinidad que verás en el atlas también es de
            demostración.
          </p>
        </SheetContent>
      </Sheet>
    </DiscoveryStage>
  )
}
