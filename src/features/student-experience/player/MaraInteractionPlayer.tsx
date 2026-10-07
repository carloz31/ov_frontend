import { useEffect, useState } from 'react'
import { activityById, finalActivity } from '@/features/missions/content'
import {
  construirInteraccionMara,
  inicioInteraccionMara,
  actividadServidor,
} from '@/features/servidor/adaptadores'
import {
  cargarResultadoRiasec,
  consultarItems,
  consultarRespuestas,
  mensajeErrorServidor,
  obtenerEstadoServidor,
  useEstadoServidor,
} from '@/features/servidor/estadoServidor'
import type { Actividad } from '@/features/missions/model'
import type { ItemPublico, RespuestaPublica } from '@/features/servidor/tipos'
import { StudentActivityPlayer } from './StudentActivityPlayer'

export type InstrumentoServidor = {
  items: ItemPublico[]
  respuestas: RespuestaPublica[]
  nodoInicialId?: string
  revision: boolean
  soloLectura: boolean
}
export function MaraInteractionPlayer({
  codigo,
  revision = false,
  onClose,
}: {
  codigo: string
  revision?: boolean
  onClose: () => void
}) {
  const servidor = useEstadoServidor()
  const [carga, setCarga] = useState<{ activity: Actividad; instrumento: InstrumentoServidor }>()
  const [error, setError] = useState('')
  const [intento, setIntento] = useState(0)
  const cuenta = servidor.estado?.cuenta.codigo
  useEffect(() => {
    let vigente = true
    void (async () => {
      const actividad = actividadServidor(obtenerEstadoServidor().estado, codigo)
      if (!actividad || actividad.estado === 'BLOQUEADA') return
      const resultado = await cargarResultadoRiasec()
      if (!vigente) return
      if (resultado.tipo !== 'ok') {
        setError(mensajeErrorServidor(resultado))
        return
      }
      const revisar = revision || actividad.estado === 'COMPLETADA'
      if (codigo === 'act-tip-final') {
        if (!resultado.datos) {
          setError('El resultado todavía no está disponible.')
          return
        }
        setCarga({
          activity: {
            ...finalActivity,
            titulo: actividad.titulo,
            nodos: finalActivity.nodos.map((n) =>
              n.tipo === 'resultado' ? { ...n, instrumentoId: 'TEST-RIASEC' } : n,
            ),
          },
          instrumento: {
            items: [],
            respuestas: [],
            nodoInicialId: finalActivity.nodos[0].id,
            revision: revisar,
            soloLectura: true,
          },
        })
        return
      }
      const [items, respuestas] = await Promise.all([consultarItems(codigo), consultarRespuestas(codigo)])
      if (!vigente) return
      if (items.tipo !== 'ok' || respuestas.tipo !== 'ok') {
        setError(
          mensajeErrorServidor(items.tipo !== 'ok' ? items : respuestas.tipo !== 'ok' ? respuestas : null),
        )
        return
      }
      if (!items.datos.length) {
        setError('Esta interacción no tiene ítems disponibles.')
        return
      }
      const saludo = activityById('act-tip-01')?.nodos.find((n) => n.tipo === 'dialogo')
      const activity = construirInteraccionMara(
        actividad,
        items.datos,
        saludo?.tipo === 'dialogo' ? saludo.texto : '',
      )
      setCarga({
        activity,
        instrumento: {
          items: items.datos,
          respuestas: respuestas.datos.respuestas,
          nodoInicialId: inicioInteraccionMara(activity, respuestas.datos.respuestas, revisar),
          revision: revisar,
          soloLectura: !!resultado.datos,
        },
      })
      setError('')
    })()
    return () => {
      vigente = false
    }
  }, [codigo, revision, intento, cuenta])
  if (!carga || error)
    return (
      <section className="sx-glass sx-player-card" aria-live="polite">
        <h1>{error ? 'No pudimos abrir el encuentro' : 'Preparando el encuentro…'}</h1>
        {error && (
          <>
            <p role="alert">{error}</p>
            <button
              className="sx-primary-button"
              onClick={() => {
                setError('')
                setIntento((i) => i + 1)
              }}
            >
              Reintentar
            </button>
          </>
        )}
        <button className="sx-secondary-button" onClick={onClose}>
          Volver a la ciudad
        </button>
      </section>
    )
  return (
    <StudentActivityPlayer
      key={`${cuenta}/${codigo}/${revision}`}
      activity={carga.activity}
      instrumentoServidor={carga.instrumento}
      imageUrl="/images/background/afueras.png"
      onClose={onClose}
    />
  )
}
