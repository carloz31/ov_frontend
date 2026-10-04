# Implementación de vistas de descubrimiento

## Acuerdos

La especificación de descubrimiento prevalece en las vistas que cubre. Los planes se crean explícitamente; favoritos y hojas se persisten en `ov.student-exploration.v1` mediante un store exclusivo del estudiante consumido por OccupationExplorationModule. `ov.student-discovery.v1` no duplica esos datos. Se conserva la API del contexto.

Intereses cuenta las 14 actividades reales. Completar act-tip-01 habilita un ejemplo identificado, sin registrar puntuaciones ficticias en journey. Las instituciones nuevas son ficticias; códigos O*NET y páginas oficiales faltantes se muestran pendientes. Las instituciones genéricas favoritas se conservan como categorías heredadas. Helena se usa en estas vistas sin modificar el contenido protegido que dice Elena.

Se mantienen Recursos, sus pruebas, accesos rápidos y componentes originales de entrevistas. /student/investigations muestra la misma vista nueva que /student/research. No se modifican áreas del apoderado/orientadora, componentes compartidos ni datos, tipos o lógica protegidos.

## Línea base antes de la fase 1

Ejecutado `npm test` el 4 de octubre de 2026: 185 pruebas, 178 aprobadas, 7 fallidas. Todas están en `tests/adventure-rendering.test.mjs`; las líneas son las de la ejecución inicial.

| Nombre exacto | Línea inicial | Causa |
| --- | ---: | --- |
| student resources open with backpack before posts, events and investigations | 1145 | No aparece Investigaciones en Recursos: la vista actual muestra la mochila. |
| resource unlocks follow actual activities and specific cases rather than review mode | 1163 | El render estático de la ruta antigua redirige y no muestra el texto de Central de Casos esperado. |
| counselor moderation hides interviews in the student community | 2478 | La ruta antigua de Recursos redirige; el render estático no contiene la entrevista no moderada esperada. |
| phase 9 panel has five direct links, a compact next-step action and the real traveler rank | 2876 | La lista actual incluye el acceso Investigaciones y difiere de los cinco enlaces esperados. |
| resource tabs separate the backpack, publications, events and published investigations | 2967 | Recursos no contiene la pestaña Publicaciones que espera la prueba. |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters | 2994 | La pestaña buscada no existe; se intenta leer props de undefined. |
| restored publication and event details keep reading, favorites and attendance in existing data | 3052 | StudentResourceBoard solo contiene entrevistas; no existe PublicationCard y se lee props de undefined. |

## Criterio de cierre por fase

Ejecutar build, lint y npm test al cerrar cada fase. Build y lint deben aprobarse. Solo se admiten los fallos anteriores por el mismo motivo; cualquier otro fallo se corrige en la fase. Todas las pruebas nuevas deben aprobarse. Las expectativas invalidadas dentro del alcance se actualizan en su fase y se documentan. Recursos, sus pruebas y la prueba de accesos rápidos quedan intactos. Los fallos previos que se resuelvan se retiran de la lista residual.

## Fases

1. Base: stores, persistencia, rutas propias, patrones visuales, vistas y ayuda.
2. Perfil y libro: capítulos, revelaciones, demostración y novedades.
3. Planes: cartas, completitud, prioridad, creación y archivo.
4. Investigaciones: guion, aliados, publicación, entrevistas, reacciones y retiro de estación.
5. Atlas: datos propios, relaciones, listas y detalles.
6. Cierre: pruebas de aceptación, accesibilidad, navegador y revisión del diff.

## Verificaciones

Se registra aquí el resultado de cada fase y las aserciones actualizadas.

### Fase 1
Build y lint aprobados. npm test: 187 pruebas, 180 aprobadas y únicamente los mismos 7 fallos por las mismas causas. Dos pruebas nuevas verifican persistencia/recarga/eventos storage, datos inválidos, fallos de escritura y favoritos separados de la creación explícita. No se modificaron aserciones existentes.

### Fase 2
Build y lint aprobados. npm test: 189 pruebas, 182 aprobadas y únicamente los mismos 7 fallos por las mismas causas. Pruebas nuevas: capítulos y pasaporte; estados del sello, ocultación, demostración 1 de 14 sin alterar resultados y novedad por página. No se modificaron aserciones existentes.

### Fase 3
Build y lint aprobados. npm test: 190 pruebas, 183 aprobadas y únicamente los mismos 7 fallos por las mismas causas. Nueva prueba de completitud, orden, límite, archivo e histórico y recreación. En student shell returns to the last visited zone and preserves module navigation, la aserción Secciones de mi perfil de decisiones se reemplazó por Mis planes y Lo que guardaste en el camino, pues la nueva vista no duplica pestañas.

### Fase 4
Build y lint aprobados. npm test: 192 pruebas, 185 aprobadas y únicamente los mismos 7 fallos por las mismas causas. Nuevas pruebas de estados, acceso real por caso, moderación en la ruta nueva, alias, preguntas sugeridas, publicación validada/idempotente y privacidad de reflexión, y reacciones positivas.
Aserciones actualizadas: presentation locks pending path missions... y the city and research station... verifican ausencia de estación e inicio de investigación tras resolver un caso; student point calculations... recomienda mara-test y verifica su actividad; phase 8 activities combine zones... retira research del orden de puntos y verifica que publicar un video no recrea la estación. No se cambiaron pruebas de Recursos ni de accesos rápidos. Se añade guideStep al estado de guion para reanudar el paso exacto.

### Fase 5
Build y lint aprobados. npm test: 194 pruebas, 187 aprobadas y únicamente los mismos 7 fallos por las mismas causas. Nuevas pruebas verifican cobertura de ocupaciones y carreras, cuatro instituciones ficticias, relaciones simétricas, búsqueda sin tildes, afinidad sellada y páginas de detalle/IDs inexistentes sin diálogos. No se modificaron aserciones existentes.


### Fase 6 — cierre

Build aprobado; lint aprobado sin advertencias. `npm test`: 198 pruebas, 191 aprobadas y 7 fallidas. Las 13 pruebas añadidas pasan. Se verificó cada fallo residual por su aserción y causa, y se compararon los cuerpos de las siete pruebas con HEAD: permanecen idénticos.

Las últimas pruebas cubren reanudación del paso exacto del guion, pregunta con Enter, conservación/reemplazo del guion, creación explícita, prioridad y archivo solo tras confirmar, recreación conservando el histórico, teclas de pestañas, navegación de detalles, recarga de perfiles/favoritos/hojas y prioridad de resultados reales completos frente a resultados inválidos anteriores o demostraciones. Se usan datos de prueba para el instrumento real futuro; el contenido de misiones permanece intacto.

Aserción actualizada en `student overlay queue prioritizes real city arrival, section introductions and the daily signal`: las vistas de descubrimiento devuelven ninguna presentación automática; las demás vistas conservan la cola original. Este ajuste cumple el criterio del plan aprobado de abrir rutas sin diálogos antes de interacción. La ayuda manual sigue disponible, con los pasos de cada vista, y devuelve el foco a su botón al cerrar.

#### Validación en navegador

Se revisaron perfil, Helena, planes, investigación, guion, alias de investigaciones, las tres listas del catálogo, los tres tipos de detalle y un ID inexistente: 13 rutas en cada tamaño, 39 comprobaciones. En todos los casos el escenario se renderizó, no hubo desbordamiento horizontal ni diálogo automático y los objetivos de las rutas nuevas y su cabecera alcanzaron 44 px.

| Tamaño | Comprobaciones | Resultado |
| --- | ---: | --- |
| 1280 × 800 | 13 | Aprobadas |
| 1440 × 900 | 13 | Aprobadas |
| 360 × 800 | 13 | Aprobadas |

Interacciones comprobadas: favorito sin navegación accidental y recarga; creación y archivo de plan; Escape y retorno de foco; revelación persistente y novedad por página; Tab/Enter en ayuda con foco visible; Enter al agregar una pregunta; End/Home en pestañas; guion y borrador recuperados tras recarga; publicación con coautor, detalle propio y las dos reacciones en una entrevista ajena sin mostrar conteos ajenos. La vista desbloqueada de investigación se comprobó con una página temporal de aceptación en un origen local separado; esa página se eliminó al terminar.

Se corrigieron la cabecera del catálogo móvil, el contraste de insignias sobre la ficha nocturna, las etiquetas de cierre de paneles y el retorno de foco de diálogos/paneles. Se midió 5.62:1 para el texto dorado sobre la superficie nocturna. Las acciones doradas se aclararon con tokens existentes; no se añadieron hexadecimales. La consola de la aplicación no presentó errores ni advertencias.

Movimiento reducido: se revisaron las reglas `prefers-reduced-motion`, incluidas animaciones de sello, niebla, revelación, cartas y raíces de paneles/diálogos. El navegador integrado no expone emulación de esa preferencia, por lo que esa parte se verificó por inspección de CSS. Un enlace de video de prueba de YouTube indicó video no disponible; la reproducción depende del enlace externo, y la validación de publicación y el resto del flujo se comprobaron.

El diff y `git diff --check` fueron revisados: no cambian portales protegidos, componentes compartidos, misiones, modelos/lógica/datos protegidos, Recursos, sus pruebas ni la prueba de accesos rápidos. Los componentes originales de perfil, catálogo, decisiones, investigación y entrevistas se conservan.

#### Lista residual para otro trabajo

Los siguientes siete fallos siguen en `tests/adventure-rendering.test.mjs`, por las mismas causas de la línea base. Las líneas de esta tabla corresponden al cierre; no se reemplazó ninguno por una regresión bajo el mismo nombre.

| Prueba exacta | Línea final | Causa residual |
| --- | ---: | --- |
| student resources open with backpack before posts, events and investigations | 1147 | Recursos muestra la mochila; falta el texto Investigaciones esperado. |
| resource unlocks follow actual activities and specific cases rather than review mode | 1165 | La ruta antigua redirige en SSR y no muestra el texto esperado de Central de Casos. |
| counselor moderation hides interviews in the student community | 2480 | La ruta antigua redirige en SSR y no contiene la entrevista visible esperada. |
| phase 9 panel has five direct links, a compact next-step action and the real traveler rank | 2878 | El panel mantiene seis enlaces, incluido Investigaciones, y la prueba espera cinco. |
| resource tabs separate the backpack, publications, events and published investigations | 2969 | Falta la pestaña Publicaciones en la vista actual de Recursos. |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters | 2996 | La pestaña buscada no existe; se lee props de undefined. |
| restored publication and event details keep reading, favorites and attendance in existing data | 3054 | No existe PublicationCard en el componente de entrevistas; se lee props de undefined. |

## Ajuste posterior del catálogo — 4 de octubre de 2026

Por solicitud del usuario, el selector de Profesiones, Carreras e Instituciones educativas se mueve de la cabecera global al inicio del contenido del atlas. Cada opción incluye su ícono y conserva la sección activa tanto en listas como en detalles. El contador con total y casillas se reemplaza por el resumen «Tu exploración · 6 ocupaciones descubiertas», con cantidad dinámica y singular cuando corresponda. Se actualizan las secciones 5 y 11 de la especificación.

Build y lint aprobados. `npm test`: 198 pruebas, 191 aprobadas y los mismos siete fallos residuales; se verificaron sus aserciones y causas, sin nuevas regresiones. Se amplía la prueba existente `discovery atlas details are pages, retain favorites and handle missing IDs` para comprobar la ubicación del selector, sus tres íconos, la sección activa y el resumen sin casillas. No se cambian las pruebas protegidas.

Navegador: revisión visual a 1280 × 800 y 360 × 800, comprobación de instituciones a 1440 × 900, navegación entre secciones con Enter/clic y conservación del selector en detalle. Sin desbordamiento horizontal; opciones de al menos 44 px. `git diff --check` sin errores.

## Registro histórico de la implementación anterior

El registro siguiente se conserva como antecedente. Sus instrucciones de trabajo, estado de rama y cifras de validación corresponden a la implementación anterior; para estas vistas prevalecen el plan y los acuerdos de descubrimiento registrados arriba.

<details>
<summary>Plan anterior de la interfaz inmersiva</summary>

# Implementación de la interfaz inmersiva del estudiante

La fuente de verdad es `especificacion-interfaz-inmersiva-estudiante.md`, en su versión final. El significado y la evaluación de los nodos siguen `../mission-spec.md`, salvo las excepciones de la especificación.

## Base y forma de trabajo

Trabajar en `feat/student-immersive`, una fase por vez. La revisión inicial pasó `npm run build`, `npm run lint` y `npm test` (114 pruebas); Vite advirtió sobre el tamaño del bundle.

Hay cambios previos sin commit, incluidos archivos prohibidos. Se conservarán. Los commits seleccionarán únicamente archivos nuevos y los bloques de esta tarea en archivos existentes.

No abrir, leer ni modificar los portales de apoderados y orientadores ni `tests/counselor-portal.test.mjs`. Conservar modelos, stores, claves existentes, `prototypeAllUnlocked`, dependencias y componentes compartidos. Todo código nuevo pertenece a `src/features/student-experience/`. Si algo requiere romper estas reglas, detenerse y consultar.

## 1. Base — `Fase 1: Base`

Crear el shell sin sidebar, el contenedor de módulos y el menú de Alex. Conservar contexto del Outlet, URL y aviso de almacenamiento. Implementar estado de presentación y tokens locales, incluidos `--sx-path` y `--sx-module-bg`. Copiar conversaciones para estudiante, conservando escrituras y privacidad. Retirar únicamente GuideDialogue de investigación. Sincronizar misiones con el efecto del shell, la función pura `getMissionsToSync` y `completeMission`, en orden de `fieldMissions`.

Mantener los mapas actuales. Adelantar una ayuda manual mínima para los módulos; escritura progresiva y apertura automática se completan en fase 3.

**Nuevos:** `StudentShell.tsx`, `student-experience.css`, `ui-state.ts`, `characters.ts`, `views.ts`, `modules/StudentModuleLayout.tsx`, `modules/StudentUserMenu.tsx`, `modules/StudentFamilyConversationsView.tsx`; bases de `map/mapPoints.ts`, `guide-texts.ts`, `player/CharacterAvatar.tsx` y `overlays/LumiOverlay.tsx`.

**Existentes:** bloque `/student` e imports exclusivos en `src/routes/AppRoutes.tsx`; eliminación de guía e import en `src/features/occupation-exploration/ResearchMissionsView.tsx`; expectativas afectadas y nuevas pruebas del estudiante en `tests/adventure-rendering.test.mjs`.

**Verificar:** rutas sin sidebar, cabecera, contexto, privacidad familiar y sincronización ordenada sin duplicados.

## 2. Mapa — `Fase 2: Mapa`

Sustituir los mapas por Camino y Ciudad con panel plegable, selector central, puntos, letreros, progreso y drawers. Copiar cálculos actuales de estado, subtítulos, requisitos y acciones. Arrastre y zoom 0.55–1.4, rueda hacia el cursor y enfoque que descuente el panel abierto. Transición de zona, ciudad cerrada y panel móvil inicialmente cerrado. JourneyPlayer temporal.

**Nuevos en map/:** `CaminoScreen.tsx`, `CiudadScreen.tsx`, `MapScreenLayout.tsx`, `MapCanvas.tsx`, `MapNode.tsx`, `MapPath.tsx`, `BlockSign.tsx`, `ZoneSwitch.tsx`, `MapControls.tsx`, `ZoomControls.tsx`, `AdventurePanel.tsx`, `ActivityDrawer.tsx`, `ZoneTransition.tsx`, `CityLocked.tsx`.

**Ajustar:** `mapPoints.ts`, CSS, estado de presentación, shell, bloque de rutas e imports exclusivos y pruebas del estudiante.

**Verificar:** zoom y guía nuevos, segmentos solo en Camino, Tramo 1, progreso por zona, enfoque y acciones del drawer. Check-in interactivo en fase 3.

## 3. Lumi — `Fase 3: Lumi`

Completar ayuda por pasos, escritura, foco, Escape, cierre por fondo y texto accesible completo. Cola: llegada a ciudad, presentación de sección, check-in; suspender con `?actividad=`. Registrar presentaciones y llegada. Copiar check-in vigente, sustituir registro del mismo día y detectar cambio de día al volver a pestaña. Completar tarjeta de señal y ayuda familiar.

**Nuevos en overlays/:** `useTypewriter.ts`, `OverlayQueue.tsx`, `checkIn.ts`, `CheckInDialog.tsx`.

**Ajustar:** overlay manual, textos, shell, estado, layouts, controles, panel, copia familiar, CSS y pruebas del estudiante.

**Verificar:** primera visita una vez, reapertura, prioridad de cola, pausa en actividad, check-in sin duplicados y omisión del día.

## 4. Reproductor — `Fase 4: Reproductor`

Copiar lógica de JourneyPlayer y formularios; presentar escenas y tarjetas inmersivas. Ambiente nocturno/amanecer, salida confirmada, recursos laterales y cierre. Conservar intentos, pistas, reacciones, borradores, versiones, recompensas y modo directo. Retirar archivos y alternativa de matriz; mantener siete entregas obligatorias y lógica de datos. Conectar mapas al nuevo reproductor.

**Nuevos en player/:** `StudentActivityPlayer.tsx`, `PlayerTopBar.tsx`, `PlayerAmbient.tsx`, `DialogueBox.tsx`, `InlineDialogue.tsx`, `ContentBlocks.tsx`, `ResourceSheet.tsx`, `FinishScreen.tsx`; en nodes/: `ChoiceNode.tsx`, `SlideNode.tsx`, `QuestionNode.tsx`, `ItemNode.tsx`, `SubmissionNode.tsx`, `MatrixNode.tsx`, `ResultNode.tsx`.

**Ajustar:** avatar, mapas, panel, CSS y pruebas del estudiante.

**Verificar:** todos los nodos suministrados, modo directo, reanudación, compuertas, recursos, matriz y ausencia de puntajes, archivos y retroceso.

## 5. Seguimiento — `Fase 5: Seguimiento`

Aplicar al primer envío de texto fuera de matriz/revisión. Guardar original primero, hasta dos preguntas, espera simulada y salida silenciosa ante error o demora superior a 10 segundos. Condensar solo turnos respondidos con etiquetas, separadores y límites; validar nueva versión. Recuperar interrupciones sin repetir preguntas ni versiones. Edición posterior normal.

**Nuevos en player/followup/:** `FollowUp.tsx`, `followUpService.ts`, `followUpStore.ts`, `responseCondenser.ts`.

**Ajustar:** SubmissionNode, reproductor, CSS y pruebas del estudiante.

**Verificar:** texto corto/largo, responder/omitir, dos turnos, espacio disponible, formato, recuperación y versiones 1/2.

## 6. Avisos — `Fase 6: Avisos`

Calcular novedades desde selectores/datos existentes. Sembrar novedades e insignias ya obtenidas antes de detectar avisos. Campana en mapas y módulos; marcar vistos al cerrar. Encolar insignias y suspenderlas durante actividades; avisos consecutivos de siete segundos.

**Nuevos en overlays/:** `unlocks.ts`, `NoveltiesMenu.tsx`, `BadgeToast.tsx`.

**Ajustar:** cola, shell, estado, controles, layout, CSS y pruebas del estudiante.

**Verificar:** siembra inicial, contador, destinos, lectura, aviso tras completar y suspensión.

## 7. Cierre — `Fase 7: Cierre`

Completar pruebas restantes de sección 13 y criterios de aceptación. Revisar teclado, foco, contraste, Escape y movimiento reducido. Revisar visualmente 1280 × 800, 1440 × 900 y 360 px sin desbordamiento horizontal.

**Archivos:** pruebas del estudiante, correcciones dentro de carpeta nueva y solo la siguiente nota al inicio de `docs/student-adventure-prototype.md` y `docs/mission-implementation.md`:

La interfaz del estudiante ahora se rige por `docs/student-experience/especificacion-interfaz-inmersiva-estudiante.md`.

## Contradicciones y huecos

- Sidebar, burbuja, zoom y archivos: prevalece especificación final; expectativas se sustituyen en la fase que las invalida.
- Imports, sincronización v2 y colores: resueltos por excepciones finales; no requieren cambios compartidos ni en stores.
- Check-in: código vigente usa DailySignalCard, lumiDayKey y fecha de Lima. Copiar comportamiento vigente.
- Testimonios: TestimonialsPage muestra recursos; desbloqueo efectivo por unlockCaseId. Novedades usan criterio actual y conservan ruta.
- Pestañas: catálogo y perfil general ya tienen propias. No duplicar; agregar navegación indicada a decisión.
- Dependencias: ayuda manual y cálculo puro de sincronización mínimos se adelantan a fase 1.
- Contraste: mínimos de sección 12.2 prevalecen sobre opacidades menores de detalles visuales.
- Recompensas: conservar mensajeFin conforme a 9.8, sin contadores ni indicadores de puntos.
- Capturas: siete disponibles; diálogo se llama dialogo-rpg.webp, se usa sin renombrar.
- Ambigüedades restantes sin conflicto con sección 2: elegir menor cambio de comportamiento y registrarlo en reporte.

## Cierre obligatorio por fase

Ejecutar `npm run build`, `npm run lint`, `npm test`; corregir fallos autorizados, revisar cambios propios y crear commit. Reportar trabajo, archivos, resultados, aserciones modificadas y motivos, desviaciones y verificaciones pendientes. Detenerse y esperar confirmación antes de la siguiente fase.

## 8. Ajustes de la experiencia — `Fase 8: Ajustes de la experiencia`

Plan adicional aprobado: incorporar la paleta azul existente en tokens locales del estudiante, incluidos los portales, conservando el contexto de tema. Cabecera del mapa con campana y avatar AL; en módulos conservar regreso, título y ayuda. Panel superpuesto sin alterar escala ni posición; retirar la indicación de arrastre.

Secuencia de presentación: bienvenida → mitos → registro. Las demás pendientes quedan cerradas y las completadas conservan revisión desde progreso v2 o el registro existente. Aplicar disponibilidad a mapa, recomendaciones, drawers, listado y enlaces directos. Adaptar la continuación mediante override opcional del reproductor. No cambiar catálogo, requisitos, stores, umbrales ni prototypeAllUnlocked.

Puntos con fondo azul/verde/gris e iconos blancos; aro celeste para la siguiente misión y `?` para cerradas. Solo nombres bajo los puntos. Iconos por tipo y badge destacado en la ficha. Panel con cuatro pendientes disponibles de la zona y “Ver más”. Nueva pantalla `/student/activities` con Disponibles/Realizadas, zona, tipo, estado y regreso con `?punto=` a la ficha enfocada. Investigación realizada cuando exista una publicación.

Novedades solo pendientes, con contador, punto y dos líneas: tipo disponible y nombre desbloqueado. X, Escape y cierre exterior conservan lectura; seleccionar marca exclusivamente la entrada elegida y mantiene sus destinos existentes. Siembra y avisos de insignias intactos.

Archivos: StudentThemeScope.tsx; map/navigation.ts; modules/StudentActivitiesView.tsx; CSS, vistas, guías, mapas, panel, drawer, menús y reproductor dentro de student-experience; únicamente imports y rutas del estudiante en AppRoutes.tsx y pruebas del estudiante en adventure-rendering.test.mjs.

Verificar secuencia, bloqueos, revisión, protección de enlaces, continuación, transformaciones de mapa, iconos, badges, listado y lectura individual. Mantener cobertura de nodos mediante renderizado directo. Revisar 1280 × 800, 1440 × 900 y 360 px, foco, Escape, contraste y movimiento reducido. Ejecutar build, lint y test; seleccionar solo cambios propios, crear el commit y reportar limitaciones.

Criterio de mínima modificación: los puntos de Ciudad con acción aún no implementada se omiten de pendientes; los completados conservan su ficha. El listado utiliza botones con aria-pressed, sin una nueva clave de almacenamiento. Solo el enfoque explícito descuenta el panel; centrado, límites y zoom usan el lienzo completo.

## 9. Mapa y panel del viajero — `Fase 9: Mapa y panel del viajero`

Usar los PNG proporcionados (1672 × 941) en un mundo navegable de 5016 × 2823, sin recortes ni deformaciones. Vista inicial centrada al 50 %, máximo 140 % y mínimo calculado según el viewport completo, con 32 px de margen alrededor. Mostrar el porcentaje real. El panel sigue superpuesto a cualquier zoom: plegarlo o desplegarlo no altera escala ni posición. Conservar coordenadas proporcionales, zoom hacia el cursor y enfoque explícito junto al panel; pasar dimensiones a la geometría, puntos, segmentos y letreros. Centrar mapa vuelve a la vista inicial; redimensionar conserva el comportamiento previo de centrado. Nombres legibles al 50 %.

Restaurar el logo local de brújula y “Orientación / Explora” en Camino y Ciudad. Accesos directos en este orden: Mi perfil (perfil general), Mi diario, En familia (bloqueo actual), Recursos (mochila), Información (profesiones, con las pestañas internas existentes). Retirar desplegables y acceso rápido a Héroes, conservando sus rutas. Siguiente paso pasa a una tarjeta compacta completamente clicable con flecha, que enfoca y abre la ficha. Nivel como insignia con número de dos dígitos y título del rango real, usando azul y celeste. No cambiar umbrales, secuencia, stores ni prototypeAllUnlocked.

Conservar bienvenida → mitos → registro, una pendiente disponible por vez; las demás pendientes cerradas y las completadas revisables. Ciudad mantiene su comportamiento actual. No reiniciar datos automáticamente ni agregar botón. Para probar sin borrar datos, abrir una ventana privada. Para reiniciar el navegador actual, ejecutar en la consola del sitio:

```js
[
  'ov.student-adventure.v1',
  'ov.missions.v2',
  'ov.student-ui.v1',
  'ov.student-followups.v1',
].forEach(key => localStorage.removeItem(key));
location.href = '/student/missions';
```

Esto elimina progreso, respuestas, diario y conversaciones guardados en esas claves, además de presentación y seguimiento. Los datos de demostración definidos por los stores vuelven a aparecer. No usar localStorage.clear().

Archivos: geometría y componentes de mapa/panel, StudentBrand y CSS dentro de student-experience; pruebas del estudiante en adventure-rendering.test.mjs y este plan. Consumir las imágenes del usuario sin alterarlas. Verificar PNG, dimensiones, escala inicial, imagen completa al mínimo, invariancia del panel, secuencia, accesos, logo, tarjeta y nivel. Revisar 1280 × 800, 1440 × 900 y 360 px, arrastre, teclado, foco, contraste y movimiento reducido. Ejecutar build, lint y test, seleccionar solo cambios propios, commit y reporte; detenerse al terminar.

## 10. Mapa sin márgenes — `Fase 10: Mapa sin márgenes`

Ajuste autorizado tras revisar la captura: el zoom mínimo debe llenar todo el viewport. Sustituir el ajuste que mostraba la imagen completa con 32 px de margen por la escala mayor entre ancho/imagen y alto/imagen, sin deformar los PNG. Las zonas fuera de vista siguen accesibles mediante arrastre. Este comportamiento reemplaza el criterio de imagen completa simultáneamente de fase 9.

Conservar vista inicial al 50 % (o mínimo necesario para cubrir), máximo 140 %, dimensiones, panel superpuesto y posición invariable al alternarlo. El enfoque sigue descontando el panel al calcular su destino, pero respeta los límites de la imagen para no dejar franjas vacías junto al panel. No cambiar imágenes, datos ni stores.

Archivos: map/geometry.ts, map/MapCanvas.tsx, pruebas del estudiante en adventure-rendering.test.mjs y este plan. Verificar cobertura sin márgenes en pantallas de escritorio, formato ancho como la captura y 360 px; arrastre hasta los extremos, enfoque de puntos en bordes y panel abierto/cerrado. Ejecutar build, lint y test, revisar visualmente, seleccionar solo cambios propios y crear el commit; detenerse al terminar.

## 11. Panel compacto del viajero — `Fase 11: Panel compacto del viajero`

Reducir la insignia de nivel a 40 × 40 px, como el avatar del saludo. Mantener número y título real, con escudo azul/celeste en relieve y rango de menor tamaño; retirar la etiqueta redundante “Tu rango de viajero”. La fila de nivel tiene la misma altura que el saludo, permitiendo el ajuste de texto si fuera necesario.

Comprimir Tu señal de hoy: valor /10 junto al título, en una ficha pequeña, y acciones alineadas en una sola fila. Cambiar (o Registrar mi señal cuando no exista registro) será un botón azul con icono de escritura y bordes de ficha de aventura. Ver evolución será un enlace separado con icono de tendencia, subrayado y su destino actual. Conservar el texto de la pregunta, la edición, el guardado, la privacidad y todos los datos existentes.

Archivos: map/AdventurePanel.tsx, student-experience.css, pruebas del estudiante en adventure-rendering.test.mjs y este plan. Actualizar las expectativas de presentación del rango y la señal en las pruebas existentes. Revisar estado con/sin señal, tamaños de saludo y nivel, teclado, foco y presentación a 1280 × 800, 1440 × 900 y 360 px. Ejecutar build, lint y test, seleccionar solo cambios propios, crear commit y detenerse al terminar.

## 12. Afinidad y progreso compacto — `Fase 12: Afinidad y progreso compacto`

Renombrar el indicador de Ciudad a “Afinidad con la ciudad”, tanto en su etiqueta visible como accesible, sin alterar el cálculo por casos resueltos. Reducir el anillo del panel de 96 a 80 px y el porcentaje de 22 a 18 px, conservando proporciones, colores y valores en ambas zonas.

Archivos: map/mapPoints.ts, guide-texts.ts (explicación de Lumi), student-experience.css, expectativas existentes de las pruebas del estudiante y este plan. Ejecutar build, lint y test, seleccionar únicamente cambios propios y crear el commit de la fase. Reportar verificaciones pendientes y detenerse al terminar.

## 13. Diario y señal separados — `Fase 13: Diario y señal separados`

Mi diario mostrará conversaciones privadas, sugerencias y amistad con Lumi, sin la tarjeta del check-in. Mantener únicamente “Conversación libre” para iniciar una entrada libre; retirar el botón duplicado “Contarle algo a Lumi” y el acceso equivalente del estado vacío. Conservar escritura, edición, borrado, etiquetas, invitaciones y enlaces de actividades/familia.

“Ver evolución” del panel conserva /student/journal/signal y abre una vista independiente de señales, con registro/edición del día mediante el diálogo existente y el gráfico actual. La selección de un punto muestra fecha y valor; las entradas privadas quedan en Mi diario. Esta separación sustituye la presentación anterior que mezclaba ambos contenidos, sin cambiar registros, stores ni claves.

Crear StudentJournalView.tsx y StudentSignalsView.tsx dentro de modules, copiando y adaptando las vistas actuales. Actualizar exclusivamente sus imports y rutas del bloque /student en AppRoutes.tsx, títulos/guía locales, StudentModuleLayout, expectativas del estudiante y este plan. Ejecutar build, lint y test; comprobar navegación, una sola acción libre, conservación de entradas, señal sin contenido privado y registro/edición sin duplicados. Seleccionar solo cambios propios, commit y reporte; detenerse al terminar.

## 14. Investigaciones en su pestaña — `Fase 14: Investigaciones separadas`

Separar las investigaciones de Mi mochila y retirar la etiqueta Comunidad en Recursos. Organizar Mi mochila, Publicaciones, Eventos e Investigaciones como pestañas hermanas. Mi mochila conserva las fichas/testimonios, desbloqueos y favoritos actuales. Recuperar del diseño anterior las tarjetas y detalles de publicaciones, eventos e investigaciones, con Mi salón/Leyendas, filtros y acciones existentes. Las investigaciones conservan su requisito actual de completar una misión de Central de Casos y respetan la moderación.

Mantener /student/resources y el alias /student/testimonials. Los enlaces existentes con ?tab=community abren Investigaciones, sin modificar la misión de investigación ni sus escrituras. Conservar datos, stores y claves. Reutilizar el diálogo compartido sin modificarlo para que los reportes/favoritos locales tengan Escape y foco; conservar una reacción activa por entrevista y prevenir reportes duplicados. Los comentarios recuperados del detalle anterior siguen solo en memoria durante esa visita, como antes; no añadir persistencia ni campos de consentimiento.

Crear modules/StudentResourcesView.tsx, StudentBackpackView.tsx y StudentResourceBoard.tsx; modificar únicamente imports/rutas del estudiante, título/guía locales, estilos locales de pestañas, expectativas del estudiante y este plan. Probar separación de contenidos, acceso por URL y teclado, publicación existente, lectura, favoritos, asistencia, moderación y presentación móvil. Ejecutar build, lint y test, seleccionar solo cambios propios, commit y reporte; detenerse al terminar.

### Corrección de alcance solicitada

Recursos contiene únicamente Mi mochila. Investigaciones pasa a /student/investigations y tiene un enlace independiente en Accesos rápidos. Publicaciones y Eventos se retiran de la interfaz del estudiante, conservando los datos existentes. Esta corrección sustituye la organización de cuatro pestañas descrita arriba. No ejecutar ni modificar pruebas, build o lint, según la solicitud del usuario.

</details>
