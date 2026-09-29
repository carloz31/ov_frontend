import { useState } from 'react'
import { Check, FileUp, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import type { Actividad, Entregable, NodoConsigna } from './model'
import { applyCompletion, latestSubmission, studentId, validateSubmission } from './logic'
import { downloadFile, saveFiles, updateJourney, useJourney } from './store'

export function SubmissionForm({
  activity,
  node,
  onSaved,
  onKeep,
}: {
  activity: Actividad
  node: NodoConsigna
  onSaved: () => void
  onKeep?: () => void
}) {
  const state = useJourney()
  const existing = latestSubmission(state, activity.id, node.id)
  const draftKey = `${activity.id}/${node.id}`
  const [text, setText] = useState(
    state.drafts[draftKey] ?? (existing?.contenido.tipo === 'texto' ? existing.contenido.texto : ''),
  )
  const [selection, setSelection] = useState<string[]>(
    existing?.contenido.tipo === 'opcion' ? existing.contenido.seleccion : [],
  )
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const spec = node.entregable
  async function submit() {
    setError('')
    let content: Entregable['contenido'] = { tipo: 'texto', texto: text.trim() }
    if (spec.tipo === 'opcion') content = { tipo: 'opcion', seleccion: selection }
    if (spec.tipo === 'archivo')
      content = {
        tipo: 'archivo',
        archivos: files.map((file) => ({
          id: crypto.randomUUID(),
          nombre: file.name,
          mime: file.type,
          tamanoBytes: file.size,
          url: '',
        })),
      }
    const validation = validateSubmission(node, content)
    if (validation) {
      setError(validation)
      return
    }
    setBusy(true)
    try {
      if (content.tipo === 'archivo') {
        await saveFiles(
          files,
          content.archivos.map((file) => file.id),
        )
        content.archivos.forEach((file) => {
          file.url = `indexeddb:${file.id}`
        })
      }
      const entry: Entregable = {
        id: crypto.randomUUID(),
        estudianteId: studentId,
        actividadId: activity.id,
        nodoId: node.id,
        contenido: content,
        version: (existing?.version ?? 0) + 1,
        enviadoEn: new Date().toISOString(),
      }
      if (
        updateJourney((current) => {
          const drafts = { ...current.drafts }
          delete drafts[draftKey]
          return applyCompletion(activity, {
            ...current,
            submissions: [...current.submissions, entry],
            drafts,
          })
        })
      )
        onSaved()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar la entrega.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <label className="block space-y-3">
        <span className="block text-xl font-semibold">{node.premisa}</span>
        {node.ayuda && <span className="block text-sm text-muted-foreground">{node.ayuda}</span>}
        {spec.tipo === 'texto' && (
          <textarea
            className="journey-textarea"
            value={text}
            placeholder={node.placeholder}
            maxLength={spec.maxCaracteres}
            onChange={(event) => {
              setText(event.target.value)
              updateJourney((current) => ({
                ...current,
                drafts: { ...current.drafts, [draftKey]: event.target.value },
              }))
            }}
          />
        )}
        {spec.tipo === 'archivo' && (
          <input
            className="journey-file"
            type="file"
            accept={spec.formatos.map((format) => `.${format.replace(/^\./, '')}`).join(',')}
            multiple={spec.maxArchivos > 1}
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        )}
      </label>
      {spec.tipo === 'texto' && (
        <p className="text-sm text-muted-foreground">
          {text.trim().length} / {spec.maxCaracteres ?? '∞'} caracteres · mínimo {spec.minCaracteres ?? 1}
        </p>
      )}
      {spec.tipo === 'archivo' && (
        <p className="text-sm">
          {spec.formatos.join(', ')} · hasta {spec.maxMB} MB · máximo {spec.maxArchivos} archivo(s)
        </p>
      )}
      {spec.tipo === 'opcion' && (
        <fieldset>
          <legend className="sr-only">Elige tu respuesta</legend>
          {spec.opciones.map((option) => (
            <label className="journey-option" key={option}>
              <input
                type={spec.multiple ? 'checkbox' : 'radio'}
                name={node.id}
                checked={selection.includes(option)}
                onChange={() =>
                  setSelection(
                    spec.multiple
                      ? selection.includes(option)
                        ? selection.filter((value) => value !== option)
                        : [...selection, option]
                      : [option],
                  )
                }
              />
              {option}
            </label>
          ))}
        </fieldset>
      )}
      <p className="text-xs text-muted-foreground">
        {node.visibilidad === 'solo_estudiante'
          ? 'Solo tú puedes ver esta entrega.'
          : node.visibilidad === 'estudiante_orientadora'
            ? 'Visible para ti y tu orientadora.'
            : 'Visible para ti, tu orientadora y tu familia.'}{' '}
        Guardado en este navegador.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy ? 'Guardando…' : existing ? 'Guardar nueva versión' : 'Guardar y continuar'}
        <Check />
      </Button>
      {existing && onKeep && (
        <Button type="button" variant="outline" onClick={onKeep}>
          Mantener esta respuesta y continuar
        </Button>
      )}
    </form>
  )
}

export function JourneyMatrix({ activity, onContinue }: { activity: Actividad; onContinue: () => void }) {
  const state = useJourney()
  const [activeId, setActiveId] = useState<string>()
  const [column, setColumn] = useState(0)
  const [downloadError, setDownloadError] = useState('')
  const template = activity.plantilla
  if (template?.tipo !== 'matriz') return null
  const tasks = activity.nodos.filter((node): node is NodoConsigna => node.tipo === 'consigna')
  const active = tasks.find((node) => node.id === activeId)
  const alternative =
    template.alternativa && latestSubmission(state, activity.id, template.alternativa.nodoId)
  const replaced =
    template.alternativa?.reemplazaSlots &&
    alternative?.contenido.tipo === 'archivo' &&
    alternative.contenido.archivos.length > 0
  const required = tasks.filter((node) => node.obligatoria && !(node.slot && replaced))
  const done = required.filter((node) => latestSubmission(state, activity.id, node.id)).length
  function cell(node: NodoConsigna, label: string) {
    const entry = latestSubmission(state, activity.id, node.id)
    return (
      <button
        key={node.id}
        className={`journey-cell ${entry ? 'is-filled' : ''}`}
        onClick={() => setActiveId(node.id)}
      >
        <span className="journey-cell-label">
          {label}
          {entry ? <Check size={15} /> : <Pencil size={14} />}
        </span>
        <span className="journey-cell-text">
          {entry?.contenido.tipo === 'texto' ? entry.contenido.texto : 'Escribe una posibilidad…'}
        </span>
        <small>
          {entry
            ? `Guardado · versión ${entry.version}`
            : node.obligatoria && !(node.slot && replaced)
              ? 'Necesario para continuar'
              : 'Opcional'}
        </small>
      </button>
    )
  }
  return (
    <section className="journey-matrix-panel">
      <p className="journey-eyebrow">TU FUTURO SE DIBUJA CON LÁPIZ</p>
      <h2>{activity.titulo}</h2>
      <p className="mb-6">
        No necesitas certezas. Empieza por lo cercano y deja espacio para cambiar de rumbo.
      </p>
      <div className="journey-tabs" role="tablist" aria-label="Horizonte de tu mapa">
        {template.columnas.map((col, index) => (
          <button key={col.id} role="tab" aria-selected={column === index} onClick={() => setColumn(index)}>
            {col.etiqueta}
          </button>
        ))}
      </div>
      <div
        className={`journey-matrix matrix-${template.estilo}`}
        style={{ gridTemplateColumns: `repeat(${template.columnas.length}, minmax(0, 1fr))` }}
      >
        {template.columnas.map((col, index) => (
          <section key={col.id} className={`journey-column ${index === column ? 'is-active' : ''}`}>
            <header>
              <span>{index + 1}</span>
              <h3>{col.etiqueta}</h3>
              <p>{col.subtitulo ?? 'Un horizonte por explorar'}</p>
            </header>
            {template.filas.map((row) => {
              const task = tasks.find((node) => node.slot === `${col.id}.${row.id}`)
              return task ? cell(task, `${row.icono ?? ''} ${row.etiqueta}`) : null
            })}
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {template.consignasFuera?.map((id) => {
          const task = tasks.find((node) => node.id === id)
          return task ? cell(task, task.etiqueta ?? task.premisa) : null
        })}
      </div>
      {template.alternativa && (
        <div className="my-6 rounded-xl border border-dashed p-4">
          <Button
            variant="outline"
            className="h-auto whitespace-normal text-left"
            onClick={() => setActiveId(template.alternativa!.nodoId)}
          >
            <FileUp />
            {template.alternativa.textoBoton}
          </Button>
          {replaced && (
            <p className="mt-3 text-sm">
              Archivo guardado. Las celdas son opcionales; completa también tu reflexión de identidad.
            </p>
          )}
          {alternative?.contenido.tipo === 'archivo' &&
            alternative.contenido.archivos.map((file) => (
              <button
                className="journey-link mt-3"
                key={file.id}
                onClick={() => {
                  void downloadFile(file.id, file.nombre).catch((error) => setDownloadError(error.message))
                }}
              >
                {file.nombre} · Descargar
              </button>
            ))}
          {downloadError && <p role="alert">{downloadError}</p>}
        </div>
      )}
      <footer className="journey-actions">
        <span>
          {done} de {required.length} entregas necesarias guardadas
        </span>
        <Button disabled={done !== required.length} onClick={onContinue}>
          Guardar mi mapa y seguir →
        </Button>
      </footer>
      <Dialog
        open={!!active}
        onOpenChange={(open) => {
          if (!open) setActiveId(undefined)
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
          <DialogTitle>{active?.etiqueta ?? 'Una nueva coordenada'}</DialogTitle>
          <DialogDescription>
            Tu mapa puede cambiar contigo. Cada entrega conserva su versión anterior.
          </DialogDescription>
          {active && (
            <SubmissionForm
              key={active.id}
              activity={activity}
              node={active}
              onSaved={() => setActiveId(undefined)}
            />
          )}
          <Button variant="ghost" onClick={() => setActiveId(undefined)}>
            <X />
            Volver al mapa
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
