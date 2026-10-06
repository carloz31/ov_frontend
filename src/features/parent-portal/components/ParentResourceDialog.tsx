import { catalog } from '@/features/missions/content'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/Dialog'
import { ParentResourceText } from './ParentContent'

export function ParentResourceDialog({
  ids,
  open,
  onOpenChange,
}: {
  ids: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const resources = catalog.recursos.filter((resource) => ids.includes(resource.id))
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="parent-resource-dialog max-w-3xl">
        <DialogTitle>Material de consulta</DialogTitle>
        <DialogDescription className="mt-2">Fichas para repasar y conversar en familia.</DialogDescription>
        {resources.map((resource) => (
          <article className="mt-6 space-y-4" key={resource.id}>
            <h2 className="text-lg font-bold">{resource.titulo}</h2>
            {resource.contenido && <ParentResourceText text={resource.contenido} />}
            {resource.url && /^https?:\/\//.test(resource.url) && (
              <a className="underline" href={resource.url} target="_blank" rel="noreferrer">
                Abrir recurso
              </a>
            )}
            {resource.fuente && <p className="text-xs text-muted-foreground">{resource.fuente}</p>}
          </article>
        ))}
      </DialogContent>
    </Dialog>
  )
}
