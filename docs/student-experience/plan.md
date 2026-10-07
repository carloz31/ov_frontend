# Central de casos: Incendio forestal

## Corrección de interacción y presentación — 6 de octubre de 2026

Por solicitud directa del usuario, la especificación actualizada `(1).md` y las dos imágenes de referencia sustituyen el acuerdo inicial sobre Escuchar y asignación de contactos. Se conserva la ilustración de cada fase en todo el fondo. La escena cubre su ventana y se recorre arrastrándola dentro de límites; las pistas se abren una por una y Escuchar ya no ofrece lista. Lumi explica mediante «?» y recuerda la primera apertura por fase. Tab lleva a la vista los puntos que quedan fuera de pantalla.

En escritorio se usan encabezado en una fila, columna izquierda de 400 px, centro libre y contactos de 500 px en dos columnas. Los paneles del problema son oscuros y translúcidos. El estudiante puede arrastrar contactos, usar + o agregarlos desde la hoja de vida, que sustituye la lista dentro del panel. En móvil se muestran problema, equipo y directorio dentro de una pantalla, con desplazamiento propio para listas y hoja inferior solo para la ficha. La salida sigue el formulario de las actividades (escudo, panel, título y acciones), pero advierte que el intento del caso se descartará; el cierre confirma el resultado guardado.

Build, lint y 71 pruebas autorizadas aprobados. Revisión a 1280×800, 375×667 y 360×667 de escena, foco, arrastre, fichas y salida. Se mantienen puntaje, recompensas, migración y contenido pendiente. Detalles y tablas en `implementacion-central-casos-incendio-forestal.md`. Trabajo local sin despliegue ni dependencias nuevas; cambios anteriores preservados y sin acceso a portales protegidos.

## Solicitud e implementación — 6 de octubre de 2026

Se implementa el plan aprobado para el único caso jugable: recorrido guiado con pistas en la escena, directorio y hojas de vida del catálogo, revisión del equipo y resultados. Se conservan las tres fases y presupuesto de 16. El máximo es 14 y el mínimo para superar es 10. Se registran el mejor puntaje y las recompensas al mostrar el cierre; abandono y agotamiento no guardan puntaje. La migración única aprobada reinicia la superación antigua y los íconos de las 15 ocupaciones del caso, preservando favoritos y demás datos.

La especificación adjunta se conserva en `especificacion-central-casos-incendio-forestal.md`. Los acuerdos, lista de 13 fichas pendientes, posiciones finales, usos de campos antiguos y validación están en `implementacion-central-casos-incendio-forestal.md`. Se mantienen paramédico y fotógrafo; los perfiles pendientes no presentan información profesional ni afinidad inventada. Ambos drawers muestran Disponible, En progreso o Superado, puntaje y mínimo. La sección profesional adicional queda conservada detrás de `SHOW_EXTRA_PROFESSIONAL = false`.

Build, lint y 67 pruebas autorizadas aprobados. Revisión visual y funcional a 360×800 y en escritorio, incluidos diálogos, fichas y cierre. Sin despliegue, dependencias nuevas ni acceso a portales protegidos; se conservan cambios locales anteriores. El prototipo enlazado no pudo consultarse.

---

# Progreso, comprobaciones, cierres y desafíos

## Solicitud e implementación — 6 de octubre de 2026

El usuario solicita implementar la especificación adjunta para la vista del estudiante. Se conserva en `especificacion-progreso-comprobaciones-desafios.md` y se registra el detalle técnico, las diferencias del modelo y los límites de backend en `implementacion-progreso-comprobaciones-desafios.md`.

Se implementan la barra de Lumi a todo el ancho, comprobaciones con dos intentos y estados dentro de cada opción, cierres con tarjetas animadas, el desafío de demostración El Rumor y exploración inesperada desde carreras/ocupaciones. Se reutilizan progreso, recursos y recompensas, sin librerías nuevas. Las fichas leídas se distinguen de las guardadas; los registros anteriores migran preservando los datos. Los resultados del desafío y los eventos de visitas usan las claves locales existentes. Se mantiene la regla pendiente de la insignia de exploración por familias.

El Rumor aparece en la ciudad, exige la ficha de mitos, usa 5 vidas frente a 3 destellos y diez preguntas con cuatro opciones. La primera victoria entrega una ficha; conservar todos los destellos en esa victoria entrega I10 Luz sin fisuras. Los intentos en curso no se guardan y las repeticiones posteriores son prácticas. La publicación/validación del servidor y el consumo de la métrica por el panel de análisis quedan descritos como integración de backend; no se modifica el orientador.

Build y lint aprobados. Se ejecutan 43 pruebas autorizadas, incluidas 15 nuevas: 43 aprobadas, 0 fallidas. No se ejecuta npm test porque sus suites cargan los portales protegidos e incluyen la prueba prohibida por AGENTS.md. No se cambian aserciones anteriores. Comprobación en navegador de reintento, foco, lectura/habilitación, batalla, confirmación de salida, victoria, recompensa, insignia y navegación inesperada. Las vistas revisadas a 360×800 no tienen desplazamiento horizontal. El informe detalla la revisión de movimiento reducido.

No se abren ni modifican los directorios de apoderado/orientador ni su prueba prohibida. Las ampliaciones compartidas son aditivas; Sheet mantiene su etiqueta anterior por defecto. git diff --check aprobado. Cambios locales sin despliegue.

---

# Fondos de actividades por zona

## Cambio — 5 de octubre de 2026

Por solicitud del usuario, las actividades del Camino usan `/images/background/forest.png` y las de Ciudad usan `/images/background/afueras.png`. Cada pantalla pasa la imagen al reproductor y este a PlayerAmbient. Se conservan el encuadre centrado con cover, los ambientes noche/amanecer y su velo al 85 %. Las imágenes originales no se modifican.

Build aprobado, lint de los tres componentes modificados aprobado y 145 pruebas de adventure-rendering aprobadas. Sin cambios en lógica ni datos de actividades.

---

# Acceso unificado y selector de perfiles

## Solicitud y alcance — 5 de octubre de 2026

El usuario solicita un login común para estudiante, apoderado y orientador, que acepte cualquier usuario y contraseña y muestre después el selector de perfiles. Se implementa en src/features/access, con el azul de la paleta staff, superficie nocturna, oro, brújula y tres caminos decorativos. El formulario permanece claro y sencillo; el móvil reduce la ilustración para priorizar los campos. No se agregan controles de registro o recuperación sin funcionalidad.

La raíz y /login muestran el acceso. Tras completar ambos campos se abre /profiles, con los tres destinos originales. Se añade DemoAccessGate en App, antes de AppRoutes, para exigir el acceso común a las rutas del selector y los tres portales. Las rutas internas y los componentes protegidos se mantienen. Volver a la raíz durante la sesión permite regresar al selector. Cerrar sesión desde el selector devuelve al login y limpia el indicador.

El modo de demostración se informa en el formulario. No se comprueban credenciales contra un servidor ni se guardan usuario o contraseña: sessionStorage conserva únicamente ov.demo-access.v1 = 1 durante la sesión de la pestaña. Si el almacenamiento no está disponible, el acceso funciona en memoria. Los campos requieren contenido, admiten cualquier formato y una contraseña de un carácter; Enter envía el formulario y el botón del ojo alterna su visibilidad. Se actualizan los títulos de documento del login y el selector.

## Validación

Build y lint aprobados. npm test: **209 pruebas, 209 aprobadas, 0 fallidas (100 %)**. Tres pruebas nuevas cubren formulario/credenciales arbitrarias/visibilidad, sesión/recarga/cierre/almacenamiento inválido o bloqueado, y acceso al selector y a los tres portales. Las pruebas de rutas internas continúan comprobando sus componentes mediante AppRoutes; el límite de acceso se verifica por separado en DemoAccessGate, utilizado por App.

Navegador: diseño comprobado a 1280×800, 1440×900 y 360×800, sin desbordamiento horizontal. Validación de campos vacíos, mostrar/ocultar contraseña y envío por Enter comprobados. Un usuario arbitrario y contraseña x abren el selector; recargar conserva el acceso; las tres tarjetas llegan a /student/missions, /parent/overview y /counselor/home. Cerrar sesión borra los campos y el acceso; una entrada directa al portal vuelve a /login. Sin errores de consola. Controles de 44 px o más, etiquetas y foco visible; CSS respeta movimiento reducido.

Revisión del diff: cambios en el acceso nuevo, App, rutas, selector, pruebas y documentación; ninguna modificación de portales protegidos ni componentes compartidos. git diff --check aprobado. No se ha desplegado desde esta tarea.

---

# Alineación de respuestas en actividades informativas

## Cambio — 4 de octubre de 2026

El usuario solicita alinear las respuestas a la izquierda, mostrando el ejemplo de mitos. QuestionNode separa el texto de cada opción en un span; sus opciones usan justify-content: flex-start y el marcador tiene ancho fijo sin margen adicional. Las respuestas cortas y de varias líneas empiezan en la misma posición junto al marcador. Las elecciones con flecha y los ítems de instrumentos mantienen su presentación existente. No se modifica contenido, selección ni evaluación.

## Validación

Build y lint aprobados. npm test: **206 pruebas, 206 aprobadas, 0 fallidas**. Se mantiene la cobertura de preguntas, selección, evaluación, reintentos y consignas. git diff --check aprobado. Modificaciones únicamente en QuestionNode, CSS del estudiante y este registro; no se añaden pruebas que repliquen reglas CSS.

---

# Consignas visibles dentro de las tarjetas de respuesta

## Solicitud y alcance — 4 de octubre de 2026

El usuario requiere repetir la consigna del personaje encima del selector, seguida por Selecciona una respuesta. como texto secundario. Se adapta la presentación de ItemNode (todos los formatos de instrumento, con y sin personaje), QuestionNode y ChoiceNode dentro de la carpeta del estudiante. En preguntas múltiples se indica Selecciona una o más respuestas. El enunciado se conserva también en el diálogo y durante la retroalimentación de preguntas. No se modifica el contenido de instrumentos, respuestas, puntuación, guardado ni lógica de misiones.

## Validación

Build y lint aprobados. npm test: **206 pruebas, 206 aprobadas, 0 fallidas**. La prueba que renderiza todos los nodos suministrados ahora comprueba que cada ítem, pregunta y elección muestre su consigna real como h2 antes de las opciones y la indicación correspondiente. La ruta directa también exige la indicación secundaria y sigue sin diálogo de Mara. La selección, reintentos y guardado mantienen sus pruebas aprobadas.

Revisión en navegador de la primera pregunta del test de intereses: consigna completa, indicación secundaria y Sí/No visibles a 360×800 sin desbordamiento horizontal. El flujo con personaje conserva el diálogo de Mara. git diff --check aprobado. Cambios limitados a los tres nodos del estudiante, CSS local, pruebas de presentación y documentación.

---

# Corrección de imágenes al desplegar la Central de Casos

## Causa y cambio — 4 de octubre de 2026

El usuario reporta un 404 de forest-fire-case-background.png en Vercel. ExplorationAssets utiliza import.meta.env.BASE_URL; Vite tenía base './', de modo que las imágenes se resolvían como rutas relativas al caso. Se cambia únicamente la base de Vite a '/': los recursos públicos ahora se piden en /images/... y los bundles en /assets/..., independientemente de la ruta del estudiante. No se modifican el helper protegido, los datos del caso ni portales.

Se añade tests/deployment-assets.test.mjs, que utiliza la base real de la configuración y el helper de imágenes. Comprueba las tres fases del incendio en rutas anidadas con y sin barra final y en el mapa con query, preservando ?v=2 y verificando que cada archivo público existe. Antes de la corrección esta prueba falla por resolver la imagen dentro de /student/cases/...; después pasa.

## Validación

Build y lint aprobados. npm test: **206 pruebas, 206 aprobadas, 0 fallidas (100 %)**. Se verifica también el artefacto de producción: index.html referencia assets desde la raíz; los tres fondos están en dist/images y tienen firma PNG válida. git diff --check aprobado. La corrección está en el repositorio local y requiere un nuevo despliegue para llegar al sitio de Vercel; no se ha publicado desde esta tarea.

---

# Corrección de expectativas de Recursos e Investigaciones

## Solicitud y alcance — 4 de octubre de 2026

El usuario confirma que Investigaciones no pertenece a Recursos y que Recursos no tiene pestaña Comunidad; solicita corregir las tres pruebas residuales. Esta autorización reemplaza la obligación anterior de conservar esas aserciones antiguas. Cambios exclusivamente en tests/adventure-rendering.test.mjs y este registro, sin modificar código de aplicación ni áreas protegidas.

- student resources show only the backpack and retain the testimonials route (línea 1147): comprueba la mochila, sus compartimentos, los bloqueos y la ruta compatible de testimonios. Exige que Investigaciones y Comunidad no se presenten dentro de Recursos.
- resource unlocks follow actual activities and specific cases rather than review mode (línea 1163): conserva todas las aserciones puras de desbloqueo, incluidos IDs de casos desconocidos. Comprueba el contenido directamente en /student/research y /student/investigations. En estado bloqueado exige el aviso, los adelantos y la acción Ir a Central de Casos, sin Ver la entrevista. Con un caso válido resuelto exige entrevistas abiertas y ausencia del aviso de bloqueo. La primera ejecución detectó que los títulos de los adelantos sí se muestran; se corrigió esa nueva expectativa para conservar el comportamiento actual, sin tocar la implementación.
- moderation hides interviews in student investigations while retaining visible interviews (línea 2486): comprueba primero que ambas entrevistas existen sin moderación. Después, con un caso resuelto, exige en ambas rutas que la ocultada desaparezca y que la otra siga visible y se pueda abrir. Evita una comprobación vacía por el bloqueo o una redirección estática.

## Cierre

npm test: **205 pruebas, 205 aprobadas, 0 fallidas (100 %)**. Build y lint aprobados. git diff --check aprobado. No se omiten pruebas ni se alteran modelos o lógica para alcanzar el resultado; las tres pruebas restantes se actualizan al contrato vigente. Publicaciones/Eventos permanecen retirados de la cobertura obsoleta del estudiante según la solicitud anterior. Las listas residuales de las secciones históricas siguientes quedan resueltas y ya no representan el estado actual.

---

# Retirada de pruebas obsoletas de Publicaciones y Eventos

## Solicitud y cambios — 4 de octubre de 2026

El usuario confirma que Publicaciones y Eventos ya no estarán en la plataforma y pide retirarlos de las pruebas y explicar los fallos restantes. Esta instrucción autoriza retirar sus expectativas antiguas, antes conservadas como línea base; no se modifica código de aplicación ni portales protegidos.

Se eliminan tres pruebas del portal del estudiante:

- resource tabs separate the backpack, publications, events and published investigations: exige cuatro pestañas antiguas, Publicaciones/Eventos y sus tarjetas. Las investigaciones actuales tienen sus propias pruebas en su ruta.
- resource tabs support arrow and boundary keys while retaining unrelated query parameters: opera esas mismas cuatro pestañas inexistentes. La cobertura vigente usa Todo/Fichas/Testimonios y kind; se conserva y añade Inicio, manteniendo los demás parámetros.
- restored publication and event details keep reading, favorites and attendance in existing data: busca PublicationCard/EventCard y detalles retirados.

En la prueba inicial de Recursos se eliminan solamente las expectativas Publicaciones, Eventos y su orden; se renombra student resources show the backpack and investigations. Se mantienen las demás aserciones para identificar el fallo residual. Las pruebas de entradas heredadas del diario, datos existentes y otros portales no se retiran.

## Resultado actual y causas residuales

Build y lint aprobados. npm test: 205 pruebas, 202 aprobadas y 3 fallidas (98,54 %). No se omiten ni se marcan como aprobadas las tres pruebas restantes. git diff --check aprobado.

| Prueba                                                                               | Archivo y línea                                        | Causa exacta y actualización necesaria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| student resources show the backpack and investigations                               | tests/adventure-rendering.test.mjs:1147; aserción 1152 | Busca Investigaciones en /student/resources. Esa ruta muestra exclusivamente la mochila; Investigaciones vive en /student/research y /student/investigations. Actualizar esta expectativa de navegación, conservando las comprobaciones de mochila y compatibilidad de testimonios.                                                                                                                                                                                                                                          |
| resource unlocks follow actual activities and specific cases rather than review mode | tests/adventure-rendering.test.mjs:1162; aserción 1216 | Las aserciones puras de desbloqueo pasan. Las tres comprobaciones finales renderizan /student/resources?tab=community: StudentResourcesView devuelve Navigate, cuyo efecto no se ejecuta en renderToStaticMarkup. No se renderiza la vista de destino. Comprobar el destino en una prueba montada de redirección y el contenido directamente en /student/research. Actualizar el aviso a Las investigaciones se abren al resolver tu primer caso... y la acción a Ver la entrevista; la prueba antigua exige Ver entrevista. |
| counselor moderation hides interviews in the student community                       | tests/adventure-rendering.test.mjs:2477; aserción 2480 | La misma ruta antigua produce el contenedor sin entrevistas en SSR. La ausencia de la entrevista oculta pasa por estar vacío; la presencia de Así se investiga la calidad del agua falla. Comprobar ambas condiciones en /student/research o /student/investigations, proporcionando solvedCaseIds: ['forest-fire'] para abrir las investigaciones. La prueba actual de descubrimiento ya verifica esta moderación y pasa.                                                                                                   |

Para el 100 % hace falta actualizar estas tres expectativas al contrato actual, preservando las verificaciones de desbloqueo, redirección y moderación. No hay evidencia de un fallo de esos mecanismos en las pruebas actuales aprobadas.

---

# Adaptación visual: historial de señales y Mis actividades

## Solicitud y alcance — 4 de octubre de 2026

El usuario solicita aplicar el estilo de las pantallas recién implementadas. Esta solicitud autoriza la adaptación de estas dos vistas, aunque la sección 11.2 de la especificación base conservaba la presentación anterior. Se reutilizan DiscoveryStage y Parchment, los tokens nocturnos, pergaminos, sellos y rastros. El historial muestra la señal del día segmentada, el gráfico interactivo y su detalle; Mis actividades presenta filtros con iconos, resumen y cartas por actividad. Se conserva el estado inicial Disponibles y también se adapta Realizadas.

No se cambian los registros de señales, diario, progreso, desbloqueos, clasificación de actividades ni destinos de los puntos. Se conservan el editor de señal existente, los doce registros más recientes y selección por clic/Enter/Espacio. Espacio evita desplazar la página y el gráfico expone los puntos como controles accesibles, con área de al menos 44 px y foco visible. El gráfico se desplaza dentro del pergamino en móvil.

## Validación

Build y lint aprobados. npm test: 208 pruebas, 202 aprobadas y los mismos seis fallos residuales de Recursos, por las mismas causas registradas abajo. Las pruebas existentes de edición de señal, privacidad, selección por teclado, clasificación de actividades y destinos del mapa pasan sin modificar sus aserciones. No se añaden pruebas que dupliquen estilos de presentación.

Navegador: ambas vistas comprobadas a 1280×800, 1440×900 y 360×800, sin desbordamiento horizontal de la página. Filtros por Enter/Espacio, selección de puntos por teclado, área táctil de 44,8 px en móvil, registro manual, Escape y retorno de foco comprobados. El enlace a Incendio forestal abre el punto correspondiente en Ciudad. Se conserva la regla de movimiento reducido de DiscoveryStage. Cambios de esta adaptación limitados a los dos componentes, su CSS local y documentación; sin cambios en pruebas ni áreas protegidas.

---

# Segunda implementación: panel, mochila, diario y pasaporte

## Acuerdos y preparación — 4 de octubre de 2026

Prevalece `especificacion-panel-mochila-diario-pasaporte.md` para estas cuatro partes. Se reutilizan los patrones de descubrimiento. Decisiones confirmadas: título editable; pestañas Todo/Fichas/Testimonios con `kind` en URL y teclado; introducción del diario dentro de la página; mochila y diario sin ventanas automáticas; selección explícita vacía de insignias mediante `profileBadgesConfigured`. No se crean claves de almacenamiento. Se conserva el visor, el contenido de recursos, las escrituras existentes, señales y áreas protegidas.

Antes de la fase 1 se ejecutó nuevamente `npm test`: 198 pruebas, 191 aprobadas y 7 fallidas. Build y lint habían aprobado al preparar este plan. Todos los fallos están en `tests/adventure-rendering.test.mjs`:

| Prueba exacta                                                                                  | Línea | Causa                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------- |
| student resources open with backpack before posts, events and investigations                   |  1147 | Recursos muestra la mochila, sin Investigaciones, Publicaciones ni Eventos. Falla al buscar Investigaciones.               |
| resource unlocks follow actual activities and specific cases rather than review mode           |  1165 | La ruta antigua `tab=community` redirige en SSR y no muestra el texto de Central de Casos.                                 |
| counselor moderation hides interviews in the student community                                 |  2480 | La ruta antigua redirige en SSR, sin el título de la entrevista esperado.                                                  |
| phase 9 panel has five direct links, a compact next-step action and the real traveler rank     |  2878 | Hay seis enlaces, incluido Investigaciones, en lugar de cinco. La nueva especificación autoriza corregir esta expectativa. |
| resource tabs separate the backpack, publications, events and published investigations         |  2969 | Recursos no tiene la pestaña Publicaciones que exige la prueba antigua.                                                    |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters       |  2996 | Las pestañas antiguas no existen; acceso a props de undefined.                                                             |
| restored publication and event details keep reading, favorites and attendance in existing data |  3054 | PublicationCard no existe en el componente original de entrevistas; acceso a props de undefined.                           |

Cada fase exige build, lint y todas las pruebas; ninguna regresión ni fallo nuevo. Registrar aserciones actualizadas y verificar cada fallo residual por su causa. Las pruebas de LumiFriendship permanecen intactas. Las expectativas sobre publicaciones/eventos y rutas antiguas quedan fuera de alcance.

## Fases de la segunda implementación

1. Panel: superficie nocturna, ficha, señal segmentada, seis accesos, tira plegada y geometría 304/72/0 px. Se conserva el siguiente paso sin tipo ni duración por su prueba vigente.
2. Mochila: compartimentos, URL/teclado, privacidad de voces bloqueadas, favoritos, visor intacto y ayuda.
3. Diario: conversaciones sin pérdida, recuerdos, cuaderno/editor/introducción y novedades.
4. Pasaporte: ruta propia, grupos, detalle, elección persistente, fecha observada y ayuda.
5. Cierre: aceptación, teclado, foco, movimiento reducido y navegador a 1280×800, 1440×900 y 360 px.

## Registro de fases

### Segunda fase 1 — panel

Build y lint aprobados. npm test: 199 pruebas, 193 aprobadas y los seis fallos previos de Recursos por las mismas causas. La prueba nueva comprueba desplazamientos 304/72/0 y foco de puntos. Se corrige la expectativa de accesos rápidos a seis nombres y destinos. La aserción del centro inicial pasa a descontar los 304 px del panel; plegar/desplegar conserva zoom y desplazamiento, incluso con vista ajustada. El siguiente paso omite tipo/duración por la prueba vigente. No se modifican las seis pruebas residuales.

### Segunda fase 2 — mochila

Build y lint aprobados. npm test: 200 pruebas, 194 aprobadas y los mismos seis fallos residuales, por sus mismas aserciones y causas. Prueba nueva de compartimentos, identidad bloqueada, pestañas por URL/teclado y parámetros conservados. Visor y ResourceContent conservados sin cambios. Se reemplazan únicamente las aserciones de presentación «Ver ficha completa» por «Abrir ficha» y «Agregar a favoritos» por «Guardar en favoritos» en saved resources and counselor submissions...; sus aserciones de otros portales no cambian. La prueba montada de la cola verifica Recursos sin introducción automática y sigue comprobando llegada/señal en el mapa. No se cambia ninguna de las seis pruebas residuales.

### Segunda fase 3 — diario

Build y lint aprobados sin advertencias. npm test: 202 pruebas, 196 aprobadas y los mismos seis fallos residuales por las mismas causas. Nuevas pruebas de Lima, límite diario, registros futuros/duplicados/inválidos, umbrales/progreso, introducción integrada, título privado y registro conservado al borrar. Se actualiza Entradas sugeridas a Cartas de Lumi por responder. El harness de edición aporta reloj/foco explícitos; la prueba de novedades de fichas/insignias aísla el registro de conversaciones, que el store conserva entre pruebas, para comprobar sus dos destinos originales. Las novedades de recuerdos usan IDs propios y se leen al abrir el recuerdo. No se modifica LumiFriendship ni sus pruebas.

### Segunda fase 4 — pasaporte

Build y lint aprobados. npm test: 204 pruebas, 198 aprobadas y los mismos seis fallos residuales por las mismas causas. Las pruebas nuevas verifican selección inicial/ordenada/vacía, límite de tres y obtención, fechas observadas estables, migración aditiva y significado ausente en pendientes, incluido el futuro estado oculto. Se cambia solo Mi pasaporte por Pasaporte vocacional en la comprobación de la ruta del perfil de descubrimiento. Componentes originales conservados. La ficha usa la selección persistente; StudentShell registra la primera fecha observada; la ayuda distingue section=passport.

### Segunda fase 5 — aceptación y cierre

Build y lint aprobados. npm test: 208 pruebas, 202 aprobadas y los mismos seis fallos anteriores, sin regresiones. Las diez pruebas nuevas de esta implementación están aprobadas. La prueba de seis accesos queda retirada de la línea base. Se añaden aceptación de migración/recarga/sincronización y fallo de guardado, memoria leída tras recargar, acceso a recuerdos desde el editor sin leer novedades prematuramente, validación de título/texto y conservación de contexto en actividades, familia y eventos (asistencia y ausencia). La edición conserva registros y señales, y el borrado conserva las conversaciones contabilizadas.

Navegador: panel, mochila, diario y pasaporte comprobados a 1280 × 800, 1440 × 900 y 360 × 800. Sin desbordamiento horizontal. La tira mide 56 px, descontando 72 px; el panel abierto descuenta 304 px y el móvil 0. Plegar/desplegar conserva la transformación; centrado y zoom siguen usando el espacio visible. El panel y los diálogos permiten desplazamiento interno. Objetivos de 44 px en cabeceras, controles, selección y cierre. Se comprobaron flechas/Inicio/Fin, Atrás/Adelante y parámetros conservados en mochila; favoritos sin abrir el visor; ayuda del pasaporte; tabulación contenida, Escape, cierre exterior y retorno de foco; título guardado/editado/borrado; primer recuerdo leído y sin aviso tras recargar; selección explícita vacía tras recargar.

Un origen de QA separado verificó la voz desbloqueada, su visor, favoritos y cuatro insignias obtenidas: cuarta selección deshabilitada, retirada de una, elección de otra y selección conservada tras recargar. Se retiraron los archivos temporales y se cerró ese servidor. El video de ejemplo del visor indica «Video unavailable» en YouTube; se conserva su enlace/contenido original, por estar fuera del alcance.

Correcciones de accesibilidad: texto del siguiente título oscuro sobre pergamino; oro elevado en superficies nocturnas; grupo III usa el primer plano del acento, porque el acento del tema es una superficie clara; voz abierta con texto oscuro; diana que pulsa sin atenuar su contraste; controles táctiles ampliados. Contrastes comprobados: siguiente paso 14,74:1, título actual 7,27:1, etiqueta nocturna 5,62:1 y grupo III 8,37:1. Movimiento reducido verificado en CSS: el navegador integrado no ofrece emulación de esa preferencia.

El JSX y ResourceContent del visor están intactos; BackpackViewerFrame añade únicamente retorno de foco y tamaño de cierre desde la carpeta del estudiante. Los componentes originales de pasaporte, rutas/redirecciones de Recursos y StudentResourceBoard permanecen intactos. Revisión del diff: cambios solo en estudiante, pruebas autorizadas y documentación; seis pruebas residuales idénticas a HEAD; ninguna modificación de portales, compartidos ni modelos/lógica protegidos. git diff --check aprobado.

#### Fallos residuales para otro trabajo

Todos están en tests/adventure-rendering.test.mjs; se mantienen las mismas aserciones y causas:

| Prueba exacta                                                                                  | Línea actual | Causa residual                                                                          |
| ---------------------------------------------------------------------------------------------- | -----------: | --------------------------------------------------------------------------------------- |
| student resources open with backpack before posts, events and investigations                   |         1147 | Sigue buscando Investigaciones en Recursos, que muestra la mochila.                     |
| resource unlocks follow actual activities and specific cases rather than review mode           |         1165 | La ruta antigua tab=community redirige en SSR, sin el texto esperado.                   |
| counselor moderation hides interviews in the student community                                 |         2480 | La ruta antigua redirige y no muestra la entrevista buscada.                            |
| resource tabs separate the backpack, publications, events and published investigations         |         2971 | Espera la pestaña Publicaciones del diseño antiguo.                                     |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters       |         2998 | La pestaña antigua no existe: props de undefined.                                       |
| restored publication and event details keep reading, favorites and attendance in existing data |         3056 | PublicationCard no existe en el componente original de entrevistas: props de undefined. |

---

# Implementación de vistas de descubrimiento

## Acuerdos

La especificación de descubrimiento prevalece en las vistas que cubre. Los planes se crean explícitamente; favoritos y hojas se persisten en `ov.student-exploration.v1` mediante un store exclusivo del estudiante consumido por OccupationExplorationModule. `ov.student-discovery.v1` no duplica esos datos. Se conserva la API del contexto.

Intereses cuenta las 14 actividades reales. Completar act-tip-01 habilita un ejemplo identificado, sin registrar puntuaciones ficticias en journey. Las instituciones nuevas son ficticias; códigos O*NET y páginas oficiales faltantes se muestran pendientes. Las instituciones genéricas favoritas se conservan como categorías heredadas. Helena se usa en estas vistas sin modificar el contenido protegido que dice Elena.

Se mantienen Recursos, sus pruebas, accesos rápidos y componentes originales de entrevistas. /student/investigations muestra la misma vista nueva que /student/research. No se modifican áreas del apoderado/orientadora, componentes compartidos ni datos, tipos o lógica protegidos.

## Línea base antes de la fase 1

Ejecutado `npm test` el 4 de octubre de 2026: 185 pruebas, 178 aprobadas, 7 fallidas. Todas están en `tests/adventure-rendering.test.mjs`; las líneas son las de la ejecución inicial.

| Nombre exacto                                                                                  | Línea inicial | Causa                                                                                                    |
| ---------------------------------------------------------------------------------------------- | ------------: | -------------------------------------------------------------------------------------------------------- |
| student resources open with backpack before posts, events and investigations                   |          1145 | No aparece Investigaciones en Recursos: la vista actual muestra la mochila.                              |
| resource unlocks follow actual activities and specific cases rather than review mode           |          1163 | El render estático de la ruta antigua redirige y no muestra el texto de Central de Casos esperado.       |
| counselor moderation hides interviews in the student community                                 |          2478 | La ruta antigua de Recursos redirige; el render estático no contiene la entrevista no moderada esperada. |
| phase 9 panel has five direct links, a compact next-step action and the real traveler rank     |          2876 | La lista actual incluye el acceso Investigaciones y difiere de los cinco enlaces esperados.              |
| resource tabs separate the backpack, publications, events and published investigations         |          2967 | Recursos no contiene la pestaña Publicaciones que espera la prueba.                                      |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters       |          2994 | La pestaña buscada no existe; se intenta leer props de undefined.                                        |
| restored publication and event details keep reading, favorites and attendance in existing data |          3052 | StudentResourceBoard solo contiene entrevistas; no existe PublicationCard y se lee props de undefined.   |

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

| Tamaño     | Comprobaciones | Resultado |
| ---------- | -------------: | --------- |
| 1280 × 800 |             13 | Aprobadas |
| 1440 × 900 |             13 | Aprobadas |
| 360 × 800  |             13 | Aprobadas |

Interacciones comprobadas: favorito sin navegación accidental y recarga; creación y archivo de plan; Escape y retorno de foco; revelación persistente y novedad por página; Tab/Enter en ayuda con foco visible; Enter al agregar una pregunta; End/Home en pestañas; guion y borrador recuperados tras recarga; publicación con coautor, detalle propio y las dos reacciones en una entrevista ajena sin mostrar conteos ajenos. La vista desbloqueada de investigación se comprobó con una página temporal de aceptación en un origen local separado; esa página se eliminó al terminar.

Se corrigieron la cabecera del catálogo móvil, el contraste de insignias sobre la ficha nocturna, las etiquetas de cierre de paneles y el retorno de foco de diálogos/paneles. Se midió 5.62:1 para el texto dorado sobre la superficie nocturna. Las acciones doradas se aclararon con tokens existentes; no se añadieron hexadecimales. La consola de la aplicación no presentó errores ni advertencias.

Movimiento reducido: se revisaron las reglas `prefers-reduced-motion`, incluidas animaciones de sello, niebla, revelación, cartas y raíces de paneles/diálogos. El navegador integrado no expone emulación de esa preferencia, por lo que esa parte se verificó por inspección de CSS. Un enlace de video de prueba de YouTube indicó video no disponible; la reproducción depende del enlace externo, y la validación de publicación y el resto del flujo se comprobaron.

El diff y `git diff --check` fueron revisados: no cambian portales protegidos, componentes compartidos, misiones, modelos/lógica/datos protegidos, Recursos, sus pruebas ni la prueba de accesos rápidos. Los componentes originales de perfil, catálogo, decisiones, investigación y entrevistas se conservan.

#### Lista residual para otro trabajo

Los siguientes siete fallos siguen en `tests/adventure-rendering.test.mjs`, por las mismas causas de la línea base. Las líneas de esta tabla corresponden al cierre; no se reemplazó ninguno por una regresión bajo el mismo nombre.

| Prueba exacta                                                                                  | Línea final | Causa residual                                                                        |
| ---------------------------------------------------------------------------------------------- | ----------: | ------------------------------------------------------------------------------------- |
| student resources open with backpack before posts, events and investigations                   |        1147 | Recursos muestra la mochila; falta el texto Investigaciones esperado.                 |
| resource unlocks follow actual activities and specific cases rather than review mode           |        1165 | La ruta antigua redirige en SSR y no muestra el texto esperado de Central de Casos.   |
| counselor moderation hides interviews in the student community                                 |        2480 | La ruta antigua redirige en SSR y no contiene la entrevista visible esperada.         |
| phase 9 panel has five direct links, a compact next-step action and the real traveler rank     |        2878 | El panel mantiene seis enlaces, incluido Investigaciones, y la prueba espera cinco.   |
| resource tabs separate the backpack, publications, events and published investigations         |        2969 | Falta la pestaña Publicaciones en la vista actual de Recursos.                        |
| resource tabs support arrow and boundary keys while retaining unrelated query parameters       |        2996 | La pestaña buscada no existe; se lee props de undefined.                              |
| restored publication and event details keep reading, favorites and attendance in existing data |        3054 | No existe PublicationCard en el componente de entrevistas; se lee props de undefined. |

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
;['ov.student-adventure.v1', 'ov.missions.v2', 'ov.student-ui.v1', 'ov.student-followups.v1'].forEach((key) =>
  localStorage.removeItem(key),
)
location.href = '/student/missions'
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

## Actividades comunes de estudiante y apoderado — 5 de octubre de 2026

Por solicitud del usuario, `../especificacion-actividades-comunes.md` prevalece para el formato común de actividades y los cambios de esta entrega. Se autorizó expresamente la excepción de AGENTS.md para el portal del apoderado; el portal de orientadores y su prueba protegida permanecen excluidos.

- ACT-P01 y ACT-P02 sustituyen la ruta anterior del apoderado. Son encuentros informativos con preguntas de comprensión y elecciones sin registro, cargados desde JSON y presentados sin avatares ni animaciones. ACT-P02 requiere ACT-P01, incluso por URL directa.
- El avance se guarda por cuenta en `ov.parent-missions.v1`, separado de `ov.missions.v2`. El prototipo usa `apo-prototipo`. Los registros comunes no cambian: el identificador de cuenta ocupa `estudianteId`. La ruta antigua se conserva en AdventureState pero no convalida las actividades nuevas.
- El diploma y el acceso a los resultados compartidos dependen de la nueva ruta. Las fichas están disponibles en el cierre y en las tarjetas completadas. La carta familiar utiliza el texto predeterminado; no se añade un editor en Conversaciones.
- El cierre e21–e24 de mitos se reemplaza con el adjunto. e22 es ahora un reto bloqueante. Las entregas y borradores antiguos no se borran; los encuentros pendientes que pasaron el nuevo reto sin responderlo retoman allí, y los encuentros ya completados se conservan.
- ACT-07, «Mis propios pregones», tiene su propio punto después de mitos y antes de historia. Cuenta para completar el Camino en recorridos nuevos, aparece en Mis actividades y admite reanudación, revisión, seguimiento de Lumi y diario.
- `caminoContentVersion: 2` distingue la nueva ruta. La migración de rutas antiguas terminadas conserva Ciudad/Familia con `legacyCaminoCompleted`, sin inventar respuestas ni dar ACT-07 por completada. Se conserva `prototypeAllUnlocked` y el progreso real se calcula por separado.
- Los encuentros ya no admiten consignas; la creación y recuperación de seguimientos se limita a registros. Las tablas se muestran con desplazamiento horizontal en escritorio y como tarjetas por fila en móvil.

### Validación de la entrega

- Build y lint aprobados. Vite conserva su advertencia sobre el tamaño del bundle principal; no hubo errores de compilación.
- 213 pruebas aprobadas, ejecutando todas las suites permitidas y excluyendo `tests/counselor-portal.test.mjs`. Se verificaron evaluación única, múltiple y V/F, pistas y revelación, bloqueo y completitud, recompensas idempotentes, reanudación, cuentas separadas, errores de almacenamiento, fichas, repaso, diploma y resultados.
- La cobertura incluye la migración de accesos antiguos, el nuevo e22, las tres consignas de ACT-07, sus límites, seguimiento, recomendaciones y sincronización con el progreso real del Camino.
- Revisión visual en escritorio (1280 × 720) y móvil (360 × 800): ambas actividades del apoderado completadas con respuestas de prueba, fichas y tablas sin desbordamiento horizontal, navegación por teclado, foco de retroalimentación y cierre de diálogos con Escape. La recarga retomó la diapositiva guardada.
- ACT-07 se completó con respuestas de prueba en otra sesión local: mostró las tres consignas y la sugerencia de diario; el mapa cambió de pendiente a completado y actualizó el porcentaje del Camino. No se añadieron backend, autenticación ni editor de carta.

### Ajuste del reproductor para padres

Por solicitud posterior del usuario, las actividades informativas del apoderado se abren a pantalla completa con una única barra superior: título de la actividad, paso/progreso y X para regresar a Mis actividades. Se retiran el menú lateral y la columna de progreso durante la actividad; el contenido se alinea a la izquierda en un área más amplia.

«Anterior» permite recorrer los nodos ya visitados. En actividades pendientes guarda el nodo al que se retrocedió sin borrar intentos ni respuestas; si falla el guardado, mantiene la pantalla actual. En actividades completadas el retroceso y el repaso conservan la finalización y sus recursos. Se verificaron escritorio, móvil, salida con X y retroceso por teclado, además de las pruebas de persistencia y reanudación.

Build y lint aprobados; 215 pruebas permitidas aprobadas tras este ajuste. La prueba de orientadores continúa excluida.

## Piloto del Bloque 1 — 6 de octubre de 2026

Por solicitud directa del usuario, se implementa evaluación y seguimiento primero, después personalización y avisos, y al final misiones adicionales. La especificación y las decisiones aprobadas están documentadas en [implementacion-piloto-bloque1.md](implementacion-piloto-bloque1.md), incluida la correspondencia entre los nueve nodos y los códigos ACT conocidos o pendientes.

Los nodos 1–7 se habilitan secuencialmente; Preparar la mochila y Elegir mi siguiente paso (8–9) quedan visibles con contenido pendiente. Se conserva el avance obligatorio de nueve nodos y los accesos históricos. El antiguo ítem privado de Horizonte conserva sus versiones en el historial y no se reutiliza. ACT-06 solo personaliza tres celdas; el test mantiene su contenido y ninguno recibe esta evaluación.

El piloto conserva los almacenes existentes y agrega respuestas, evaluaciones, preguntas mostradas, eventos y desbloqueos en un almacén independiente. El proveedor es simulado y sustituible; no clasifica por longitud ni palabras clave ni llama a servicios externos. Los portales y la prueba protegida de orientadores permanecen fuera del alcance.

# Alcance de la demostración · 6 de octubre de 2026

Por solicitud del usuario, el Camino activo termina en «Las huellas que traigo». El límite temporal se configura en `StudentDemoScope.ts`: solo las cuatro primeras misiones, con sus requisitos existentes. Ciudad mantiene sus accesos anteriores. Los nodos posteriores se muestran con bloqueo normal, sin referencias a una demostración ni mensajes sobre dónde termina. Se conservan todos los datos y el piloto completo para reactivarlo posteriormente. Véase `implementacion-piloto-bloque1.md`.

Se retira el simulador visible. Los tres registros de Pregones reciben ADECUADA mediante configuración fija del proveedor local; desbloquean Ecos de la plaza y alimentan la pregunta personalizada de Huellas. El aviso de influencia pasa a «Esta pregunta puede influir más adelante en tu camino.», sin mencionar actividades concretas. Las demás misiones adicionales permanecen fuera del alcance activo.

## Pantalla de ingreso común — 6 de octubre de 2026

Por solicitud directa del usuario, se implementa [especificacion-pantalla-ingreso.md](especificacion-pantalla-ingreso.md). El cambio de interfaz se limita a `LoginScreen.tsx` y `access.css`: fondo de degradado con SVG decorativo y velo, marca Explora, presentación neutral para los tres perfiles y tarjeta clara de acceso. Se eliminan las órbitas, los puntos con roles y los textos anteriores. Las píldoras de perfil son informativas.

Se conservan `onEnter`, los tres estados, título del documento, atributos y validación nativa de los campos, y el control accesible de visibilidad de contraseña. El botón atenuado permanece habilitado para activar `required`; al completar ambos campos cambia a azul. No se modifican el acceso de demostración, su puerta de acceso ni las rutas. Se preserva la clase de cierre de sesión usada por el selector de perfiles.

Verificación local: escritorio de 1321 × 833 y 900 × 720, tarjeta de 440 px; móviles de 390 × 844 y 375 × 667 sin desplazamiento ni desbordamiento horizontal. Campos de 52 px, textos de entrada de 16 px y control de contraseña de 44 × 44 px. Se comprueban campos vacíos, envío parcial, contraseña visible/oculta, acceso al selector y foco con Tab. La reducción de altura a 400 px mantiene desplazamiento vertical y oculta la presentación adicional; esta comprobación simula la pérdida de espacio, sin abrir un teclado físico. Se mantiene la variante sin movimiento.

Build y lint del componente aprobados, además de 22 pruebas específicas de recursos y Central de casos. No se ejecuta `npm test` ni la suite de renderizado global, que carga portales protegidos. Se conserva la advertencia existente de Vite sobre tamaño del bundle. Entrega local sin despliegue ni dependencias nuevas; se conservan los cambios previos del repositorio.

## La pregunta de hoy en el diario — 7 de octubre de 2026

Por solicitud directa del usuario, se agrega `journal/DailyQuestionCard.tsx` entre la página en blanco y el aviso de recuerdos, antes de las cartas. Se oculta durante la introducción. Reutiliza `getDailyJournalPrompt(now)`, `useLumiNow()` y `lumiDayKey(now)`; la tarjeta distingue pregunta por abrir, abierta y respondida por el identificador `daily-prompt-AAAA-MM-DD`. Antes de abrirla no incluye la pregunta en el HTML. Si la fuente falla o entrega texto vacío, no aparece.

La apertura conserva `dailyQuestionOpenedOn` en `ov.student-ui.v1`, sin cambiar la versión ni crear claves; valores de formato inválido pasan a `null` y otra fecha vuelve al estado por abrir. El botón lleva el foco a Responder. El editor recibe directamente pregunta, título editable «Tema del día» y etiquetas fijas; guardar y contabilizar conversaciones conservan el flujo actual y el límite de tres. Cancelar conserva la apertura. Ver mi respuesta abre el detalle existente. Las entradas con el prefijo diario, incluida la de demostración, usan «Pregunta del día», `data-kind="daily"` y punto azul en el cuaderno. La ayuda añade el paso solicitado después de las cartas. Se mantiene la corrección previa del contraste del recuerdo de Lumi.

Verificación: build y lint aprobados, con la advertencia previa de Vite sobre tamaño del bundle. Línea base inmediata: 287 pruebas, 271 aprobadas y 16 fallidas. Resultado: 292 pruebas, 276 aprobadas y los mismos 16 fallos; los bloques completos de fallos son idénticos al quitar las duraciones, incluidos nombres, aserciones y trazas. Las cinco pruebas nuevas del estudiante aprueban; ninguna aserción existente se modifica. También aprueban las pruebas anteriores del diario sobre edición, contexto por URL y datos privados.

Navegador local a 1280 × 800 y 360 × 800: ubicación y tres estados, foco al revelar, etiquetas fijas, cancelación, título editable, guardado y detalle comprobados. La apertura persiste al recargar; las entradas nueva y de demostración tienen origen y punto azul. En móvil, la acción ocupa toda la fila y el ancho del contenido permanece en 360 px. La regla cargada de movimiento reducido elimina las animaciones de respiración y revelado. El flujo de escritura se prueba en un origen local separado de la pestaña del usuario. No se modifican bibliotecas, tipos o datos de `occupation-exploration`, portales ni pruebas protegidas.

## Iteración 1 · F4: camino y mochila con el servidor — 7 de octubre de 2026

Se implementan §§5.1–5.7 y 5.11 de la especificación vigente. El modo `local` conserva sus claves y comportamiento. `main.tsx` proporciona la configuración de Vite al módulo `servidor`; las importaciones de las pruebas mantienen valores locales predeterminados. `.env.example` incluye `VITE_DATOS=local` y `VITE_API_URL=/api`, y el proxy de desarrollo quita `/api` y apunta a `http://127.0.0.1:8000`. No se agregan dependencias.

En API, el mapa, las recomendaciones, Mis actividades, el progreso y las fichas usan el estado de la cuenta del servidor. Los límites del prototipo, la demostración y el contenido pendiente no intervienen. Ciudad depende del bloque CIUDAD. Adicionales, casos y desafíos quedan fuera de este recorrido, también por URL. Mara abre su detalle y consulta los ítems de la primera interacción pendiente; su reproductor se incorpora en F5.

El ingreso conserva el selector de perfiles de demostración y resuelve únicamente cuentas ESTUDIANTE; si el usuario no coincide, usa `est-ana`. Persiste la selección en `sessionStorage`, deduplica el montaje y descarta ingresos anteriores que llegan tarde tras cambiar de cuenta. Las copias `ov.missions.v2.api` y `ov.student-adventure.v1.api` contienen entradas separadas por cuenta. La hidratación corrige proyecciones obsoletas y conserva nodos, textos, borradores, brújula, comprobaciones y versiones locales, incluso cuando falla el guardado de la copia en el navegador.

La única llamada que informa una finalización está en `StudentActivityPlayer.tsx`, dentro de `move`, al llegar a `$fin`, incluida la repetición de informativas. Entregas, seguimiento, hidratación, `StudentShell` y `FinishScreen` no envían finalizaciones. El reproductor impide solicitudes simultáneas, espera el resultado y muestra requisitos ante 409 o un reintento ante desconexión. Si el POST ya fue confirmado, conserva la respuesta y reintenta únicamente las consultas. Recuperar un cierre confirmado no registra otro evento.

El cierre API usa exclusivamente `nuevos_desbloqueos`: actividad, fichas, insignias, nivel y ciudad. Según la delimitación aprobada, esta pantalla valida los pasos 3 y 6; la cola de avisos, el pasaporte, la vista de nivel y el marcado como vistos quedan en F6. Se omiten sus cálculos locales en API. Se conserva la guía de presentación de Lumi y las acciones locales del diario.

Las fichas mantienen el contenido y la lectura del front, pero leerlas o guardarlas no las convierte en obtenidas. La mochila consulta requisitos al solicitarlos. Los detalles bloqueados del camino y de Mara consultan su progreso; el resto de §5.10 queda en F6. El menú ofrece reinicio con confirmación únicamente en desarrollo y API; tras éxito elimina las dos claves API y recarga.

### Validación de F4

Recorrido manual con `SEMILLA=plataforma`, `EVALUADOR=falso`, una base SQLite temporal y el frontend en API. El puerto 8000 estaba ocupado, por lo que la comprobación utilizó backend 8001 y frontend 5175 con un proxy temporal; el proxy versionado conserva 8000. Los datos escritos se identificaron como DATO DE PRUEBA F4.

| Paso | Resultado observado |
|---|---|
| 1 | Reinicio confirmado desde el menú; Ana ingresa con la primera actividad recomendada y las demás bloqueadas. |
| 2 | El detalle bloqueado de la segunda informativa muestra «Requisito: completa “El inicio del viaje”». |
| 3 | El cierre de la bienvenida muestra La plaza de los rumores, Tres pistas para comenzar el viaje e I1, sin avisos automáticos de logros. |
| 4 | Tras completar La plaza de los rumores y recargar, la mochila muestra cuatro fichas obtenidas: la primera y las tres nuevas. |
| 5 | Repetir los 24 nodos confirma otra finalización y muestra «No hay nuevos desbloqueos en esta repetición»; la actividad sigue completada. |
| 6 | act-07 conserva sus tres entregas; Las huellas que traigo muestra I2 y el nivel Recolector de pistas en su cierre. |
| 7 | Se completan las cinco misiones restantes, incluidas las siete entregas de la matriz. El cierre final muestra ciudad, I3 y Cartógrafo de posibilidades. Ciudad abre; Mara muestra interacción 1 de 14 y cinco ítems, con el reproductor desactivado. |

Las pruebas `servidor-adaptadores`, `servidor-flujo` y `servidor-local` contienen 20 casos que pasan. Cubren fixtures, estados y recomendaciones, cuenta y respaldo, aislamiento, conservación de borradores, hidratación sin espacio, finalización, repetición, doble clic, 409, red, consulta sin duplicar POST, cierre recuperado, lectura sin adquisición, URL y reinicio restringido. Los adaptadores solo importan tipos y las pruebas locales fallan si se intenta usarlos o consultar la API.

Build y lint pasan; se conserva el aviso previo de Vite sobre el tamaño del bundle. Suite completa: 312 pruebas, 296 aprobadas y las mismas 16 fallas documentadas en F3, todas en `adventure-rendering.test.mjs`; coinciden sus nombres y líneas. No se modifican pruebas anteriores, contratos ni los ocho fixtures. El backend pasa 1006 pruebas con evaluador falso y dos advertencias previas de deprecación.

F4 completa con la delimitación anterior. F5–F7 y el diagnóstico de las fallas previas quedan pendientes. Se registra la decisión compartida en `ov_backend/docs/iteraciones/decisiones-iteracion-1.md`; un commit de F4 por repo en `iteracion-1`, sin push ni acceso a áreas protegidas.
