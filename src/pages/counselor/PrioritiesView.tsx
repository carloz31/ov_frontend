import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Pencil, Save, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { blocks, questionnaires } from '@/data/demo/studentProfiles'
import { safeReturnTo } from '@/features/student-tracking/lib/navigation'
import { normalizeSearch } from '@/features/student-tracking/lib/selectors'
import {
  prioritySettingsStore,
  prioritySettingsReducer,
  type PrioritySettings,
  recordActivities,
  shareableQuestionnaireIds,
  type PriorityAction,
} from '@/features/counselor/store/prioritySettings'
import { usePrioritySettings } from '@/features/counselor/hooks/usePrioritySettings'

type Confirmation = { kind: 'sharing'; id: string } | { kind: 'clear' } | { kind: 'save' }

const questionnaireDescriptions: Record<string, string> = {
  interests: 'Intereses en tareas y entornos de trabajo.',
  social: 'Comunicación, empatía y cooperación.',
  intelligences: 'Formas de aprender y resolver tareas.',
  entry: 'Percepción al iniciar y finalizar el recorrido.',
  perception: 'Autoconocimiento, entorno y confianza al elegir.',
}

function PrioritiesView() {
  const savedSettings = usePrioritySettings()
  const [draft, setDraft] = useState<PrioritySettings | null>(null)
  const settings = draft ?? savedSettings
  const editing = draft !== null
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(savedSettings)
  const [section, setSection] = useState('tools')
  const [params] = useSearchParams()
  const [query, setQuery] = useState('')
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
  const [saveCount, setSaveCount] = useState(0)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!saveCount) return
    setSaved(true)
    const timeout = setTimeout(() => setSaved(false), 2400)
    return () => clearTimeout(timeout)
  }, [saveCount])
  const changeDraft = (action: PriorityAction) => {
    setDraft((current) => (current ? prioritySettingsReducer(current, action) : null))
  }
  const priorityControl = (id: string, name: string, mobile = false) => (
    <label
      className="flex min-h-11 w-fit max-w-full cursor-pointer items-center gap-3"
      htmlFor={`priority-${mobile ? 'mobile-' : ''}${id}`}
    >
      <Checkbox
        id={`priority-${mobile ? 'mobile-' : ''}${id}`}
        aria-label={`Prioritario: ${name}`}
        disabled={!editing}
        checked={settings.questionnaireIds.includes(id)}
        onCheckedChange={(checked) => changeDraft({ type: 'questionnaire', id, checked: checked === true })}
      />
      <span>Prioritario</span>
    </label>
  )
  const sharingControl = (id: string, name: string, mobile = false) =>
    shareableQuestionnaireIds.includes(id) ? (
      <label
        className="flex min-h-11 w-fit max-w-full cursor-pointer items-center gap-3"
        htmlFor={`sharing-${mobile ? 'mobile-' : ''}${id}`}
      >
        <Checkbox
          id={`sharing-${mobile ? 'mobile-' : ''}${id}`}
          aria-label={`Visible para el apoderado: ${name}`}
          disabled={!editing}
          checked={settings.sharedQuestionnaireIds.includes(id)}
          onCheckedChange={(checked) =>
            checked === true
              ? setConfirmation({ kind: 'sharing', id })
              : changeDraft({ type: 'sharing', id, checked: false })
          }
        />
        <span>Visible para el apoderado</span>
      </label>
    ) : (
      <p className="py-2 text-muted-foreground">No se comparte</p>
    )
  const visible = recordActivities.filter((activity) =>
    normalizeSearch(activity.title).includes(normalizeSearch(query)),
  )
  const sharingName =
    confirmation?.kind === 'sharing' ? questionnaires.find((q) => q.id === confirmation.id)?.name : ''
  const confirm = () => {
    if (confirmation?.kind === 'sharing') changeDraft({ type: 'sharing', id: confirmation.id, checked: true })
    if (confirmation?.kind === 'clear') changeDraft({ type: 'all-records', checked: false })
    if (confirmation?.kind === 'save' && draft) {
      if (prioritySettingsStore.dispatch({ type: 'replace', settings: draft }))
        setSaveCount((count) => count + 1)
      setDraft(null)
    }
    setConfirmation(null)
  }
  return (
    <main className="mx-auto min-w-0 max-w-6xl space-y-6 px-5 py-4 text-base break-words sm:px-8 sm:py-6 lg:px-10 lg:py-8">
      {params.has('returnTo') && (
        <Button asChild variant="link" className="min-h-11 h-auto max-w-full px-0 whitespace-normal">
          <Link to={safeReturnTo(params.get('returnTo'))}>
            <ArrowLeft aria-hidden />
            Volver a Mis estudiantes
          </Link>
        </Button>
      )}
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Prioritarios</h1>
        <p>
          Selecciona las herramientas y actividades de registro que quieres filtrar para revisar rápidamente
          lo más prioritario de los perfiles de tus estudiantes.
        </p>
        <p className="text-sm text-muted-foreground">
          Esta configuración aplica a todos tus salones. Tus estudiantes siguen realizando todas las
          actividades.
        </p>
      </header>
      <Tabs value={section} onValueChange={setSection} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList aria-label="Tipo de prioritarios" className="flex max-w-full">
            <TabsTrigger value="tools" className="min-w-0 px-3 text-sm whitespace-normal">
              Herramientas
            </TabsTrigger>
            <TabsTrigger value="records" className="min-w-0 px-3 text-sm whitespace-normal">
              Actividades de registro
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    setDraft(null)
                    setConfirmation(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="min-h-11"
                  disabled={!dirty}
                  onClick={() => setConfirmation({ kind: 'save' })}
                >
                  <Save aria-hidden />
                  Guardar cambios
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setDraft(savedSettings)
                  setSaved(false)
                }}
              >
                <Pencil aria-hidden />
                Editar
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="tools" className="mt-0">
          <section className="min-w-0 space-y-3" aria-labelledby="questionnaires-heading">
            <h2 id="questionnaires-heading" className="text-lg font-bold">
              Herramientas
            </h2>
            <Card className="hidden overflow-hidden rounded-xl lg:block">
              <Table className="table-fixed [&_th:first-child]:pl-4 [&_td:first-child]:pl-4 [&_th:last-child]:pr-4 [&_td:last-child]:pr-4">
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead scope="col" className="w-[45%] text-sm font-semibold">
                      Herramienta
                    </TableHead>
                    <TableHead scope="col" className="w-[22%] text-sm font-semibold">
                      Prioritario
                    </TableHead>
                    <TableHead scope="col" className="w-[33%] text-sm font-semibold">
                      Visible para el apoderado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionnaires.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <p className="font-medium">{q.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {questionnaireDescriptions[q.id] ?? q.description}
                        </p>
                      </TableCell>
                      <TableCell>{priorityControl(q.id, q.name)}</TableCell>
                      <TableCell>{sharingControl(q.id, q.name)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <div className="space-y-3 lg:hidden">
              {questionnaires.map((q) => (
                <Card key={q.id} className="min-w-0 gap-3 rounded-xl p-4">
                  <div>
                    <h3 className="font-semibold">{q.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {questionnaireDescriptions[q.id] ?? q.description}
                    </p>
                  </div>
                  <div className="text-sm">
                    {priorityControl(q.id, q.name, true)}
                    {sharingControl(q.id, q.name, true)}
                  </div>
                </Card>
              ))}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">Prioritario:</strong> se muestra en el filtro
                Prioritarios del perfil del estudiante para facilitar la revisión y cuenta para su avance
                prioritario.
              </p>
              <p>
                <strong className="font-medium text-foreground">Visible para el apoderado:</strong> el
                apoderado puede ver el resultado de su hijo cuando termine su propia ruta.
              </p>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="records">
          <section className="min-w-0 space-y-4" aria-labelledby="records-heading">
            <h2 id="records-heading" className="text-lg font-bold">
              Actividades de registro
            </h2>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  aria-label="Buscar actividad"
                  placeholder="Buscar actividad"
                  className="min-h-11 bg-card pl-10 text-base"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="mr-1">
                  {settings.recordIds.length} de {recordActivities.length} marcadas
                </span>
                <Button
                  variant="outline"
                  className="min-h-11"
                  disabled={!editing || settings.recordIds.length === recordActivities.length}
                  onClick={() => changeDraft({ type: 'all-records', checked: true })}
                >
                  Marcar todas
                </Button>
                <Button
                  variant="outline"
                  className="min-h-11"
                  disabled={!editing || !settings.recordIds.length}
                  onClick={() => setConfirmation({ kind: 'clear' })}
                >
                  Quitar todas
                </Button>
              </div>
            </div>
            {!visible.length && (
              <p className="rounded-xl border bg-card p-4 text-muted-foreground">
                No hay actividades que coincidan con tu búsqueda.
              </p>
            )}
            {blocks.map((block) => {
              const records = visible.filter((a) => a.blockId === block.id)
              return (
                records.length > 0 && (
                  <Card key={block.id} className="min-w-0 gap-0 overflow-hidden rounded-xl">
                    <h3 className="border-b bg-muted px-4 py-3 font-semibold">{block.name}</h3>
                    <div className="divide-y">
                      {records.map((activity) => (
                        <div className="p-4" key={activity.id}>
                          <label
                            htmlFor={`record-${activity.id}`}
                            className="flex min-h-11 w-fit max-w-full cursor-pointer items-center gap-3"
                          >
                            <Checkbox
                              id={`record-${activity.id}`}
                              aria-label={activity.title}
                              disabled={!editing}
                              checked={settings.recordIds.includes(activity.id)}
                              onCheckedChange={(checked) =>
                                changeDraft({ type: 'record', id: activity.id, checked: checked === true })
                              }
                            />
                            <span className="font-medium">{activity.title}</span>
                          </label>
                          <p className="pl-14 text-sm text-muted-foreground">
                            {activity.items?.map((item) => item.name).join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              )
            })}
          </section>
        </TabsContent>
      </Tabs>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={
          saved
            ? 'pointer-events-none fixed right-4 bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl border bg-card p-4 text-sm shadow-[var(--shadow-card)] sm:left-auto'
            : 'sr-only'
        }
      >
        {saved && (
          <>
            <Check aria-hidden className="size-5 text-success-text" />
            Cambios guardados
          </>
        )}
      </div>
      <Dialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmation?.kind === 'sharing'
                ? '¿Mostrar este resultado a los apoderados?'
                : confirmation?.kind === 'save'
                  ? '¿Guardar la configuración de prioritarios?'
                  : '¿Quitar todas las actividades de registro de tus prioritarios?'}
            </DialogTitle>
            <DialogDescription>
              {confirmation?.kind === 'sharing'
                ? `Al guardar, los apoderados de tus estudiantes podrán ver el resultado de ${sharingName} de su hijo cuando terminen su ruta.`
                : confirmation?.kind === 'save'
                  ? 'Al guardar, se recalculará el porcentaje de avance prioritario de tus estudiantes según esta selección. También cambiará lo que se muestra en el filtro Prioritarios de sus perfiles. ¿Quieres guardar los cambios?'
                  : 'Las herramientas prioritarias se conservarán.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" className="min-h-11" onClick={() => setConfirmation(null)}>
              Cancelar
            </Button>
            <Button className="min-h-11 h-auto whitespace-normal" onClick={confirm}>
              {confirmation?.kind === 'sharing'
                ? 'Mostrar a los apoderados'
                : confirmation?.kind === 'save'
                  ? 'Confirmar y guardar'
                  : 'Quitar todas'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
export { PrioritiesView }
