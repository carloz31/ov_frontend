# Origen de los datos

Inventario al cerrar R7 (8 de octubre de 2026), conforme a la iteración 1. Las rutas parten de `src/`. No cambia disponibilidad, persistencia ni contratos; describe el código resultante del refactor. Para las reglas de capas y tamaño, consulta `AGENTS.md`.

## 1. Del servidor (`VITE_DATOS=api`)

Trece peticiones a través de `store/servidor/estadoServidor.ts` y `store/servidor/operaciones.ts`, agrupadas en `services/api/` como los routers del backend. `services/api/cliente.ts` contiene el único `fetch` y `pedir`; los otros cuatro módulos arman URL, método y cuerpo sin guardar estado ni leer la cuenta activa:

| Módulo | Función | Petición | La usa |
|---|---|---|---|
| `services/api/cuentas.ts` | `listarCuentas()` | `GET /cuentas` | ingreso |
| | `obtenerEstado(cuenta)` | `GET /cuentas/{c}/estado` | `refrescar` |
| | `obtenerProgreso(cuenta, tipo, codigo)` | `GET /cuentas/{c}/progreso/{tipo}/{codigo}` | `consultarProgreso` |
| | `obtenerDesbloqueosNoVistos(cuenta)` | `GET /cuentas/{c}/desbloqueos?solo_no_vistos=true` | `consultarNoVistos` |
| | `marcarDesbloqueosVistos(cuenta)` | `POST /cuentas/{c}/desbloqueos/marcar-vistos` `{}` | `marcarVistos` |
| `services/api/acciones.ts` | `ingresar(cuenta)` | `POST /acciones/ingresar` `{cuenta}` | ingreso |
| | `completarActividad(cuenta, actividad)` | `POST /acciones/completar-actividad` `{cuenta, actividad}` | `completarActividad` |
| | `responderItems(cuenta, actividad, respuestas)` | `POST /acciones/responder-items` `{cuenta, actividad, respuestas}` | `responderItems` |
| `services/api/instrumentos.ts` | `obtenerItems(actividad)` | `GET /actividades/{a}/items` | `consultarItems` |
| | `obtenerRespuestas(cuenta, actividad)` | `GET /cuentas/{c}/actividades/{a}/respuestas` | `consultarRespuestas` |
| | `obtenerAvance(cuenta)` | `GET /cuentas/{c}/instrumentos` | `consultarAvanceInstrumentos` |
| | `obtenerResultado(cuenta, instrumento)` | `GET /cuentas/{c}/instrumentos/{i}/resultado` | `cargarResultadoRiasec` |
| `services/api/demo.ts` | `reiniciar()` | `POST /demo/reiniciar` `{}` | `reiniciarDatosDePrueba` |

Con eso el servidor decide disponibilidad y finalización de actividades, acceso a la Ciudad, respuestas de Mara, resultado RIASEC y carreras afines, fichas obtenidas, insignias, nivel y avisos de desbloqueo.

## 2. Contenido del front (se queda en el front)

Lo define la regla compartida: el backend no interpreta el contenido narrativo.

| Qué | Destino |
|---|---|
| Nodos de las actividades (7 JSON) y su catálogo (`data/activities/content.ts`, `data/activities/standardActivities.ts`) | `data/activities/` |
| Configuración del piloto de reflexión (escenarios, criterios, misiones adicionales) | `data/activities/reflectionConfig.ts` |
| Personajes, textos de guía | `data/content/characters.ts`, `data/content/guideTexts.ts` |
| Recuerdos de Lumi | `features/journal/data/lumiMemories.ts` |
| Desafíos (bancos de preguntas, recompensas) | `data/content/challenges.ts` |
| Geometría y puntos del mapa, títulos de viajero, íconos de insignias | `features/adventure/lib/geometry.ts`, `features/adventure/lib/caminoPoints.ts`, `features/adventure/lib/ciudadPoints.ts`, `features/adventure/lib/pointDetails.ts`, `features/adventure/lib/missionSync.ts` y `features/adventure/lib/mapPoints.ts`; `features/discovery/lib/passport.ts`; títulos locales en `store/adventureStore.ts` |
| Rol del apoderado (motivación) | `features/parent/data/parentMotivation.ts` |
| Opciones de rol | `features/auth/data/roleOptions.ts` |

## 3. Catálogo fijo (hoy en el front; podría venir del servidor)

No se mueve al servidor en este refactor. Se agrupa para que, cuando una iteración lo haga, se reemplace en un solo lugar:

| Qué | Destino | Iteración que lo toca (plan) |
|---|---|---|
| Ocupaciones (`occupationCatalog`, `additionalOccupationCatalog`) | `data/catalog/occupations.ts`, `data/catalog/additionalOccupations.ts` | 3 (catálogos) |
| Carreras e instituciones | `data/catalog/careersAndInstitutions.ts` | 3 |
| Preguntas del diario | `data/content/journalPrompts.ts` | 3 (diario) |
| Caso del incendio forestal | `data/content/forestFireCase.ts` | 4 (casos) |
| Entrevistas de leyenda, videos y detalles de entrevistas | `data/content/adventure.ts`, `data/content/research.ts` | 4 (entrevistas) |
| Temas de conversaciones en familia | `data/content/familyConversations.ts` | 4 (familia) |
| Niveles de viajero (`travelerLevels`) | sigue en `store/adventureStore.ts` (en `api` ya usa `nivel_actual`) | — |

## 4. Datos de demostración (`DATO DE PRUEBA`)

Cada uno de estos archivos empieza con `// DATO DE PRUEBA: <qué es y qué lo reemplazará>`. Las exportaciones de demostración que viven en un archivo de contenido llevan el comentario sobre la exportación.

| Qué | Destino |
|---|---|
| Perfiles de estudiantes, cuestionarios y planes ficticios (orientadora y apoderado) | `data/demo/studentProfiles.ts` |
| Salones, personas y etiquetas del portal de la orientadora | `features/counselor/data/counselorPortal.ts`, `features/counselor/data/exampleStudents.ts` |
| Hijos y perfil del apoderado | `features/parent/data/parentPortal.ts` |
| Comentarios y reacciones de entrevistas, aliados y nivel de investigación | `data/content/research.ts` (`interviewDetails`, `demoLevel`, `receivedReactions`, `getAllies`) |
| Alias de salón, avisos, videos y lecturas de recursos | `data/content/adventure.ts` (`classroomAliases`, `resourceDemoNotices`, `resourceDemoVideos`, `resourceReading`) |
| Entradas y check-ins del diario de ejemplo | `data/content/journalPrompts.ts` (`journalDemoEntries`, `readinessDemoCheckIns`) |
| Perfiles de ocupación de ejemplo | `data/catalog/occupations.ts` (`mockOccupationProfiles`) |
| Intereses de ejemplo del libro de Helena | `features/discovery/lib/helenaPages.ts` (`demoInterests`) |
| Conversaciones familiares de ejemplo | `data/content/familyConversations.ts` (`familyConversationDemoData`) |

`interviewDetails` tiene una sola definición en `data/content/research.ts`. `features/counselor/data/interviewDetails.ts` lo importa y conserva `reactionOptions`. Los dos portales consumen los mismos detalles.

## 5. Estado local (navegador)

Se conservan las claves y los formatos existentes. Todas las claves de la tabla usan `localStorage`, salvo donde se indica `sessionStorage` o IndexedDB. Cualquier cambio futuro requiere una migración que conserve los datos.

| Clave | Almacén | Contenido |
|---|---|---|
| `ov.demo-access.v1` (`sessionStorage`) | `features/auth/lib/demoAccess.ts` | sesión de demostración |
| `ov.cuenta-servidor.v1` (`sessionStorage`) | `store/servidor/cuenta.ts` | usuario y cuenta activa en `api` |
| `ov.missions.v2` / `ov.missions.v2.api` | `store/journeyStore.ts` | progreso, intentos, entregas y borradores de actividades |
| `ov.mission-files` (IndexedDB) | `store/journeyStore.ts` | archivos adjuntos |
| `ov.student-adventure.v1` / `ov.student-adventure.v1.api` | `store/adventureStore.ts` | aventura, diario, casos, investigación, conversaciones |
| `ov.student-discovery.v1` | `store/discoveryStore.ts` | visitas, favoritos, publicaciones, páginas reveladas |
| `ov.student-exploration.v1` | `store/explorationStore.ts` | intereses y hojas de decisión |
| `ov.student-reflections.v1` | `store/reflectionStore.ts` | respuestas y evaluaciones del piloto |
| `ov.student-followups.v1` | `features/activities/store/followUpStore.ts` | preguntas de seguimiento |
| `ov.student-ui.v1` | `store/studentUiStore.ts` | guías vistas, desbloqueos vistos, preferencias de interfaz |
| `ov.parent-missions.v1` | `features/parent/store/parentJourneyStore.ts` | actividades del apoderado |
| `ov.staff.priorities.v1` (`sessionStorage`) | `features/counselor/store/prioritySettings.ts` | prioridades de la orientadora |
| `ov.staff.selected-salon.v1` (`sessionStorage`) | `features/counselor/hooks/useSelectedSalon.ts` | salón elegido |

En API, las claves de actividades y aventura terminan en `.api` y contienen `por_cuenta[codigo]`; no se mezclan con el estado local ni entre cuentas. Descubrimiento conserva `profileBadgesApi[cuenta]` para la selección de insignias y `revealedPagesApi[cuenta][calculado_en]` para páginas reveladas de Helena dentro de `ov.student-discovery.v1`. Revelar una página o elegir insignias es una preferencia local: no obtiene ni completa nada en el servidor.

El servidor manda sobre disponibilidad y finalización. El navegador conserva borradores, nodo actual, comprobaciones, adjuntos, respuestas de brújula y lo que aún no cubre la iteración 1. Un error remoto se muestra como error; no se sustituye por un estado inventado. `prototypeAllUnlocked`, `studentDemoEnabled` y `pendingContent` no afectan la disponibilidad en API. En modo local se conservan los cálculos y el recorrido de demostración.

## 6. Recorrido de los datos

`services/api/` → `store/servidor/` → hooks del dominio → vistas. `types/servidor.ts` copia el contrato Pydantic y `lib/servidor/adaptadores.ts` lo convierte a los modelos de la interfaz; solo importa tipos. Las consultas conservan cachés, revisiones, cancelaciones y comprobaciones de cuenta activa.

Los hooks deciden entre datos remotos y locales y devuelven datos preparados, acciones y banderas del dominio. Las vistas no importan `modoApi` ni `desarrollo`. Los puntos principales son:

| Dominio | Hooks y responsabilidad |
|---|---|
| Ingreso | `features/auth/hooks/useLogin.ts`: guardar usuario, preparar ingreso, iniciar acceso y navegar, en ese orden. |
| Aventura | `features/adventure/hooks/`: sesión, sincronización, nivel, acceso a Ciudad, detalles del mapa, cuenta y novedades. |
| Actividades | `features/activities/hooks/useActivityCompletion.ts`, `features/activities/hooks/useActivityPlayer.ts`, `features/activities/hooks/useInstrumentResponses.ts`, `features/activities/hooks/useActivityResources.ts`, `features/activities/hooks/useActivityFinish.ts` y `features/activities/hooks/useInstrumentResult.ts`: navegación, respuestas, fichas, guardado y resultados. |
| Mochila | `features/backpack/hooks/useBackpack.ts`: selección por URL, disponibilidad, requisitos, errores, reintentos y acciones. |
| Descubrimiento | `features/discovery/hooks/useCatalogAffinity.ts`, `features/discovery/hooks/useStudentProfile.ts`, `features/discovery/hooks/usePassport.ts`, `features/discovery/hooks/useBadgeDetail.ts` y `features/discovery/hooks/useHelenaPages.ts`: afinidades, nivel, insignias y páginas reveladas. |

La única llamada a `await completarActividad(` está en `move`, dentro de `features/activities/hooks/useActivityCompletion.ts`, al alcanzar `$fin`. Guardar respuestas, consultar, revelar o revisar no completa una actividad. Las referencias de envío y montaje se comparten con respuestas y cierre para coordinar guardado y navegación.

Cuando una iteración migre un dato al servidor, se actualizan su hook, los servicios y el almacén remoto, y este inventario. Las iteraciones futuras citadas en el catálogo son una previsión del plan, no trabajo autorizado para adelantar.
