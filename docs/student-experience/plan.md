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
