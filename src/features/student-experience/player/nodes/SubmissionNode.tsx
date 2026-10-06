import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import type { Actividad, Entregable, NodoConsigna } from '@/features/missions/model'
import { applyCompletion, latestSubmission, studentId, validateSubmission } from '@/features/missions/logic'
import { updateJourney, useJourney } from '@/features/missions/store'
import { CharacterAvatar } from '../CharacterAvatar'
import { FollowUp } from '../followup/FollowUp'
import { getFollowUpRecord, recoverFollowUp, setFollowUpRecord } from '../followup/followUpStore'

export function SubmissionNode({
  activity,
  node,
  onSaved,
  onKeep,
  edit = false,
}: {
  activity: Actividad
  node: NodoConsigna
  onSaved: () => void
  onKeep?: () => void
  edit?: boolean
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
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [following, setFollowing] = useState(false)
  const initialRecord = useRef(getFollowUpRecord(draftKey))
  const [recovering, setRecovering] = useState(
    () =>
      activity.tipo === 'registro' &&
      activity.plantilla?.tipo !== 'matriz' &&
      !!initialRecord.current &&
      !initialRecord.current.versionCondensada &&
      initialRecord.current.turnos.some((turn) => !turn.omitida && !!turn.respuesta?.trim()),
  )
  const spec = node.entregable
  useEffect(() => {
    if (
      activity.tipo !== 'registro' ||
      spec.tipo !== 'texto' ||
      activity.plantilla?.tipo === 'matriz' ||
      !initialRecord.current ||
      initialRecord.current.versionCondensada
    )
      return
    let cancelled = false
    void recoverFollowUp(activity, node).then((result) => {
      if (cancelled) return
      if (result.saved && result.text !== undefined) setText(result.text)
      setRecovering(false)
    })
    return () => {
      cancelled = true
    }
  }, [activity, node, spec.tipo])
  useEffect(() => {
    if (spec.tipo === 'archivo' && !node.obligatoria) onSaved()
  }, [spec.tipo, node.obligatoria, onSaved])
  async function submit() {
    setError('')
    let content: Entregable['contenido'] = { tipo: 'texto', texto: text.trim() }
    if (spec.tipo === 'opcion') content = { tipo: 'opcion', seleccion: selection }
    const validation = validateSubmission(node, content)
    if (validation) {
      setError(validation)
      return
    }
    setBusy(true)
    try {
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
      ) {
        if (
          activity.tipo === 'registro' &&
          !existing &&
          !edit &&
          spec.tipo === 'texto' &&
          activity.plantilla?.tipo !== 'matriz' &&
          content.tipo === 'texto' &&
          setFollowUpRecord(draftKey, {
            textoInicial: content.texto,
            versionInicial: entry.version,
            turnos: [],
          })
        )
          setFollowing(true)
        else onSaved()
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo guardar la entrega.')
    } finally {
      setBusy(false)
    }
  }
  if (spec.tipo === 'archivo') return <p>Esta entrega no está disponible en la plataforma.</p>
  if (recovering) return <p role="status">Recuperando tu respuesta…</p>
  if (following) return <FollowUp activity={activity} node={node} onContinue={onSaved} />
  return (
    <form
      className="sx-submission-form"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      {node.hablanteId && <CharacterAvatar id={node.hablanteId} size="sm" />}
      <label className="sx-submission-label">
        <span className="sx-submission-premise">{node.premisa}</span>
        {node.ayuda && <span className="sx-submission-help">{node.ayuda}</span>}
        {spec.tipo === 'texto' && (
          <textarea
            className="sx-submission-textarea"
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
      </label>
      {spec.tipo === 'texto' && (
        <p className="sx-submission-help">
          {text.trim().length} / {spec.maxCaracteres ?? '∞'} caracteres · mínimo {spec.minCaracteres ?? 1}
        </p>
      )}
      {spec.tipo === 'opcion' && (
        <fieldset className="sx-submission-options">
          <legend className="sr-only">Elige tu respuesta</legend>
          {spec.opciones.map((option) => (
            <label
              className={`sx-submission-option ${selection.includes(option) ? 'is-selected' : ''}`}
              key={option}
            >
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
      <p className="sx-submission-visibility">
        {node.visibilidad === 'solo_estudiante'
          ? 'Solo tú puedes ver esta entrega.'
          : node.visibilidad === 'estudiante_orientadora'
            ? 'Visible para ti y tu orientadora.'
            : 'Visible para ti, tu orientadora y tu familia.'}{' '}
        Guardado en este navegador.
      </p>
      {error && (
        <p role="alert" className="sx-submission-error">
          {error}
        </p>
      )}
      <div className="sx-player-actions">
        <button type="submit" className="sx-primary-button" disabled={busy}>
          {busy ? 'Guardando…' : existing ? 'Guardar nueva versión' : 'Guardar y continuar'}
          <Check size={18} />
        </button>
        {existing && onKeep && (
          <button type="button" className="sx-secondary-button" onClick={onKeep}>
            Mantener esta respuesta y continuar
          </button>
        )}
      </div>
    </form>
  )
}
