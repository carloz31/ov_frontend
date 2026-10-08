import { useReturnFocus } from '@/hooks/useReturnFocus'
import { useEffect, useState } from 'react'

import { useJourney } from '@/store/journeyStore'

import { useDiscovery, updateDiscovery, revelarPaginaApi, paginasReveladasApi } from '@/store/discoveryStore'

import type { InstrumentPageId } from '@/types/discovery'
import { getHelenaPages, getHelenaPagesApi } from '@/features/discovery/lib/helenaPages'
import { modoApi } from '@/config/env'
import { mensajeErrorServidor, useEstadoServidor } from '@/store/servidor/sesion'
import { cargarResultadoRiasec } from '@/store/servidor/resultado'
import { consultarAvanceInstrumentos, consultarProgreso } from '@/store/servidor/consultas'
import { ciudadDisponible, textoRequisito, paginaInteresesServidor } from '@/lib/servidor/adaptadores'

export function useHelenaPages() {
  const focus = useReturnFocus()
  const journey = useJourney(),
    discovery = useDiscovery(),
    servidor = useEstadoServidor()
  const pages = modoApi
    ? getHelenaPagesApi(
        paginaInteresesServidor(
          servidor.actividades.datos,
          servidor.resultadoRiasec,
          discovery,
          servidor.resumen.datos?.cuenta.codigo ?? null,
        ),
        paginasReveladasApi(
          discovery,
          servidor.resumen.datos?.cuenta.codigo,
          servidor.resultadoRiasec?.calculado_en,
        ),
      )
    : getHelenaPages(journey, discovery)
  const [requisito, setRequisito] = useState('Consultando el avance de tus encuentros…')
  const [errorConsulta, setErrorConsulta] = useState('')
  const [intento, setIntento] = useState(0)
  useEffect(() => {
    if (!modoApi) return
    let vigente = true
    void (async () => {
      const resultado = await cargarResultadoRiasec()
      if (!vigente) return
      if (resultado.tipo !== 'ok') {
        setErrorConsulta(mensajeErrorServidor(resultado))
        return
      }
      if (resultado.datos) {
        setErrorConsulta('')
        return
      }
      if (!ciudadDisponible(servidor.actividades.datos)) {
        const progreso = await consultarProgreso('BLOQUE', 'CIUDAD')
        if (!vigente) return
        if (progreso.tipo === 'ok') {
          setRequisito(textoRequisito(progreso.datos, servidor.actividades.datos))
          setErrorConsulta('')
        } else setErrorConsulta(mensajeErrorServidor(progreso))
      } else {
        const avance = await consultarAvanceInstrumentos()
        if (!vigente) return
        if (avance.tipo !== 'ok') {
          setErrorConsulta(mensajeErrorServidor(avance))
          return
        }
        const aplicacion = avance.datos
          .find((i) => i.instrumento === 'TEST-RIASEC')
          ?.aplicaciones.find((a) => a.aplicacion === 'APL-RIASEC')
        const primera = aplicacion?.actividades.faltantes[0]
        setRequisito(
          primera
            ? `Conversa con Mara: interacción ${Number(primera.slice(-2))} de 14.`
            : 'Elena está preparando tu resultado.',
        )
        setErrorConsulta('')
      }
    })()
    return () => {
      vigente = false
    }
  }, [servidor.actividades.datos, intento])
  const [meaning, setMeaning] = useState(false)
  const [opening, setOpening] = useState<InstrumentPageId>()
  useEffect(() => {
    if (!opening) return
    const timer = setTimeout(() => setOpening(undefined), 400)
    return () => clearTimeout(timer)
  }, [opening])
  function revelarPagina(id: InstrumentPageId) {
    if (modoApi) {
      if (!servidor.resultadoRiasec || !servidor.actividades.datos) return
      revelarPaginaApi(servidor.resumen.datos!.cuenta.codigo, servidor.resultadoRiasec.calculado_en, id)
      setOpening(id)
      return
    }
    setOpening(id)
    updateDiscovery((s) =>
      s.revealedPages.includes(id) ? s : { ...s, revealedPages: [...s.revealedPages, id] },
    )
  }
  return {
    focus,
    requisito,
    errorConsulta,
    setErrorConsulta,
    setIntento,
    meaning,
    setMeaning,
    opening,
    revelarPagina,
    errorResultado: servidor.errorResultado
      ? { mensaje: mensajeErrorServidor(servidor.errorResultado) }
      : null,
    pages: pages.map((p) => ({
      ...p,
      etiquetaDemo: modoApi ? 'Disponible en una próxima iteración · ' : 'Demostración · ',
      mostrarRequisito: modoApi && p.id === 'intereses',
      revelacionBloqueada: modoApi && !servidor.resultadoRiasec,
      mostrarPuntajes: modoApi,
      significadoHref: modoApi
        ? '/student/exploration?actividad=act-tip-final&revision=1'
        : '/student/exploration?actividad=act-tip-01&modo=directa',
      carrerasRecomendadas:
        modoApi && !p.perfilPlano ? servidor.resultadoRiasec?.carreras_recomendadas : undefined,
    })),
  }
}
