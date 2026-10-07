# Iteración 1 · F7 · Informe de verificación

Fecha: 2026-10-07. Rama `iteracion-1` en ambos repositorios.

**Verificación ejecutada; aceptación pendiente.** Doce HU pasan en el alcance comprobado, HU-073 queda parcial y HU-074 falla. F6 estaba sin cerrar cuando el usuario solicitó expresamente F7. No se resuelve la contradicción pendiente sobre ocultas ni se modifican implementación o expectativas para obtener un resultado verde.

## Entorno y método

Recorrido completo en navegador: frontend API en 5178, backend en 8002, `SEMILLA=plataforma`, `EVALUADOR=falso` y SQLite desechable independiente. El proxy temporal apunta al puerto de prueba; el versionado conserva 8000. Reinicio, entregas, respuestas y finalizaciones se realizaron desde la interfaz. Las consultas directas fueron GET para contrastar estado, resultado y eventos; no se preparó el Camino mediante POST.

Textos y elecciones son DATO DE PRUEBA. Los 60 ítems usan I=5, R=4, A=3 y S/E/C=1. Se comprobó también acceso, mapa y reproductor local en 5179. Esta comprobación local es breve; la conservación del comportamiento se contrasta principalmente con suites y comparación de fallas anteriores.

## Resultado por HU

| HU | Resultado | Evidencia y límite |
|---|---|---|
| HU-002 · Estados | Pasa | Inicialmente solo bienvenida disponible; mapa evoluciona con estado remoto. Final: nueve actividades del Camino y quince de Ciudad COMPLETADA. Casos/desafíos ajenos al alcance siguen bloqueados. |
| HU-004 · Informativas | Pasa | Bienvenida de cuatro nodos y enc-mitos de 24 nodos completadas desde reproductor; eventos confirmados en servidor. |
| HU-011 · Siguiente actividad | Pasa | Panel recomienda bienvenida, cada actividad posterior y las catorce interacciones de Mara en orden. Al terminar Ciudad no inventa otra actividad. |
| HU-013 · Cierre | Pasa | Desbloqueos confirmados de actividad/ficha/I1; después I2/nivel 2; al terminar Camino, Ciudad/I3/nivel 3. |
| HU-014 · Repetición | Pasa | Segunda ejecución completa de enc-mitos: sin nuevos desbloqueos, conserva COMPLETADA y registra segundo evento, sin aumentar distintas. |
| HU-015 · Fichas | Pasa | Mochila con cuatro de cuatro fichas obtenidas tras informativas y recarga; contenido del frontend. |
| HU-021 · Mara | Pasa | Tres respuestas, salida y recarga, reanudación en cuarto ítem; 60 respuestas y catorce interacciones completas. Revisión posterior de solo lectura con opción guardada. |
| HU-022 · Resultado | Pasa | Libro y actividad de resultado muestran IRA en orden: Investigativa 100 %, Realista 75 %, Artística 50 %, igual al resultado vigente remoto. |
| HU-025 · Requisitos | Pasa | Detalle de enc-mitos pide bienvenida; I4 consulta «Invita a un compañero a tu Crew». Suites cubren Ciudad, fichas, conteos, error/reintento y consulta por solicitud sin eventos. Inteligencias/habilidades indican próxima iteración. |
| HU-026 · Afines y carreras | Pasa | Geólogo/a primero, Mejor ajuste y correlación 0.826325. Libro: Ingeniería Civil, Ingeniería Ambiental, Medicina Veterinaria y via; navegación a ocupación/carrera. Perfil plano y códigos desconocidos cubiertos en pruebas. |
| HU-027 · Sello | Pasa | Cierre 14 muestra Elena y enlace. Sello listo con resultado vigente, revela IRA y persiste tras recarga. Aislamiento por cuenta/fecha cubierto en pruebas. |
| HU-073 · Avisos | Parcial | Ficha, insignias, Ciudad y niveles observados; Elena solo en cierre. Al abrir detalle Mi horizonte con aviso de nivel 2 activo, aviso y temporizador siguen activos bajo el diálogo. Falta coordinar ese overlay con la pausa. Consulta previa, avisos nuevos y reintentos pasan en suites. |
| HU-074 · Pasaporte | Falla | Obtenidas I1–I3, bloqueadas públicas y selección vacía persistente funcionan. Oculta pendiente aparece como botón individual «Logro oculto» y grupo, en lugar del contador aprobado. Tres pruebas F6 fallan. |
| HU-075 · Nivel | Pasa | Niveles 1, 2 y 3 en sus hitos; panel/perfil/pasaporte coinciden en nivel 3, Cartógrafo de posibilidades. Lista de títulos remota; pruebas cubren ausencia de nivel sin cálculo local. |

## Recorrido de aceptación (§6)

| Paso | Resultado |
|---|---|
| 1 | Reinicio confirmado e ingreso Ana. Bienvenida recomendada, ocho siguientes bloqueadas, Ciudad bloqueada. |
| 2 | Segunda informativa bloqueada consulta requisito de bienvenida. Su título de presentación es «Más allá de los mitos». |
| 3 | Bienvenida: actividad siguiente, primera ficha e I1 en cierre; avisos al volver al mapa. |
| 4 | Segunda informativa: tres fichas nuevas, mochila cuatro de cuatro; recarga conserva disponibilidad. |
| 5 | Repetición de sus 24 nodos: sin nuevos desbloqueos, segundo evento, mismo estado completado. |
| 6 | act-07 y Las huellas que traigo con entregas locales; borrador recuperado tras salir y recargar. Antes de llegar a $fin, el servidor aún no completa act-07. Cierre posterior I2/nivel 2. |
| 7 | Resto del Camino, incluida matriz con siete entregas necesarias; Ciudad, I3 y nivel 3. |
| 8 | Tres respuestas de act-tip-01, salida y recarga; entrada directa en cuarta con anteriores confirmadas. |
| 9 | Catorce interacciones completas; Elena exclusivamente en cierre, enlace al libro y sello de intereses listo. |
| 10 | IRA, porcentajes, afines/carreras, navegación y revelación persistente. act-tip-final se completa una vez; posterior consulta abre revisión. |
| 11 | **No cumple completamente:** obtenidas, bloqueadas públicas y niveles correctos; oculta presentada como tarjeta individual. |
| 12 | Recargas conservan Camino, Ciudad, fichas, insignias, nivel, respuestas y revelación. Selección vacía persiste. También persiste defecto visual del paso 11. |

Balance remoto: **24 actividades distintas completadas y 25 eventos COMPLETA_ACTIVIDAD**, cuatro fichas disponibles, tres insignias obtenidas y nivel 3. Solo enc-mitos tiene dos eventos; cada otra tiene uno. Consultar libro, revelar y revisar no añadió finalizaciones.

La campana final dice «No tienes novedades pendientes». GET conserva **13 desbloqueos no vistos de ACTIVIDAD**, excluidos de cola/contador por F6; no quedan avisos presentables pendientes. Esto no equivale a GET vacío: los lotes con avisos presentables se marcaron antes; los posteriores de Mara contienen solo actividades. No se llamó manualmente al POST para ocultar ese estado.

## Invariantes (§7)

| Nº | Resultado | Comprobación |
|---|---|---|
| 1 · Fuente remota | Cumple en alcance auditado | Mapa/mochila/pasaporte/nivel leen servidor. Guardas API omiten applyCompletion, adquisición por diapositivas y sincronización local. Resultado/respuestas remotos. El defecto de ocultas es de presentación, sin inventar adquisición. |
| 2 · COMPLETADA remota | Cumple | Entrega local de act-07 no completa servidor. Única llamada de vista a completarActividad: move de StudentActivityPlayer.tsx. Proyecciones usan COMPLETADA recibida. |
| 3 · Repetición al servidor | Cumple | enc-mitos registra dos eventos y una actividad distinta. Revisiones de instrumento/resultado conservan los 25 eventos; revisión no es nueva realización. |
| 4 · Red concentrada | Cumple en áreas permitidas | Búsqueda fetch en src, excluidos ambos portales protegidos, solo encuentra servidor/cliente.ts. Adaptadores solo import type. No se afirma auditar carpetas prohibidas por AGENTS.md. |
| 5 · Local conservado | Sin regresión nueva detectada | Aislamiento pasa; 16 fallas previas coinciden exactamente por nombre/línea con F5/F0. Mapa/reproductor local abren con Alex y nivel 1. No se certifica suite completamente verde. |
| 6 · Demo conservada | Cumple | Backend: 1006 pruebas pasan con demo y evaluador falso, escenarios/invariantes incluidos. F7 no altera código, semilla ni expectativas. |

## Pruebas y pendientes

| Verificación | Resultado |
|---|---|
| npm run build | Pasa, 2828 módulos; permanece aviso previo de bundle grande. |
| npm run lint | Pasa, sin errores ni advertencias. |
| npm test | 354: 335 pasan, 19 fallan. Las 16 previas coinciden exactamente por nombre y línea. |
| uv run pytest -q | 1006 pasan, dos advertencias previas, 1234.34 s; SEMILLA=demo, EVALUADOR=falso, temporales y caché propios. |

Fallas nuevas en `tests/servidor-logros.test.mjs`:

| Línea del caso | Nombre | Motivo |
|---|---|---|
| 23 | insignias solo del servidor, sin cálculos locales ni ocultas pendientes en la proyección | Contador 0 en lugar de 1. |
| 38 | oculta obtenida y código desconocido usan su información pública sin inventar progreso | Variante busca I10 en fixture que oculta el código como ???; falta adaptar variante tras resolver decisión. |
| 63 | pasaporte no filtra códigos ocultos ni adicionales y usa nivel remoto y total real | Falta contador; aparece tarjeta «Logro oculto». |

Discrepancia pendiente: plan F6 identifica ocultas mediante `nombre === '???'`; contrato/fixtures entregan `codigo: '???'`, `nombre: 'Logro oculto'`, descripción/requisito nulos. AGENTS.md exige explicar la contradicción antes de resolverla en código. No se cambia contrato ni se regeneran fixtures. Hay que resolver HU-074, completar pausa de HU-073 ante detalles y repetir esos pasos antes de aprobar la iteración.

Las 16 fallas anteriores se enumeran por nombre y línea en F0 de `ov_backend/docs/iteraciones/decisiones-iteracion-1.md`: líneas 731, 1504, 1571, 1699, 1776, 1855, 1881, 1915, 1932, 1951, 2000, 2033, 2326, 2621, 2658 y 3229 de `tests/adventure-rendering.test.mjs`. No se modifican expectativas ni se amplía F7 para corregirlas.

## Evidencia y cierre

Evidencia fuera de Git, en la carpeta de visualizaciones de esta conversación: f7-recorrido-dom.json, f7-paso3.json, f7-camino-completo.json, f7-eventos-antes-resultado.json, f7-resultado.json, f7-estado-final.json, logs de build/lint/tests/pytest y capturas f7-elena.png, f7-intereses.png, f7-pasaporte.png, f7-aviso-durante-detalle.png y f7-local.png. Base/servidores temporales retirados al terminar.

README de ambos repos y registro compartido actualizados. Commits F7 solo de documentación; implementación F6 pendiente permanece fuera de ellos. Sin dependencias, contratos/fixtures nuevos, Gemini, lectura de áreas protegidas ni push. F7 termina como verificación con aceptación pendiente, sin declarar F6 completa ni adelantar otra iteración.
