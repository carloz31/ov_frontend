# Pendientes de interfaz

Datos que el backend entrega (o que una vista necesita) y que la interfaz todavía no muestra. Los resuelve el usuario.

## 2026-10-09 · Anexo F2 · Descripciones fuera del resumen de Helena

- **Dato:** `ResultadoPublico.dimensiones[].descripcion` de las seis dimensiones y `dimensiones_destacadas[].descripcion` de los instrumentos DESTACADAS; `GET /cuentas/{c}/instrumentos/{instrumento}/resultado`.
- **Dónde se mostraría:** perfil por dimensión y guía de la vista de resultado completo de Helena. Hoy el resumen de intereses usa las tres áreas de `codigo_interes`; el resto de las descripciones permanece en el resultado remoto. TEST-INT y TEST-HAB reales solo están en demo del backend, no en la semilla plataforma; TEST-HAB conserva sus textos de demostración según F2.
- **Opciones:**
  1. Usar el perfil por dimensión y la guía descritos y autorizados en F4 del anexo (decisión ya aprobada; pendiente de esa fase).
  2. Conservar únicamente las descripciones del resumen actual hasta ejecutar F4.
  3. Integrar posteriormente el resultado real de TEST-INT cuando se incorpore a plataforma; requiere su iteración y sustituye la demostración señalada.
- **Si no se muestra:** el contrato y los resultados conservan todas las descripciones, pero el resumen no permite consultar todas las dimensiones. F2 no agrega controles ni secciones. F4 también usará la demostración de inteligencias; los instrumentos reales se integrarán en su iteración.
- **Estado:** presentación completa de intereses autorizada para F4; TEST-INT y TEST-HAB reales pendientes de su iteración. No se implementa ninguna opción adicional en F2.

## 2026-10-08 · B3 · Actividad de prueba sin contenido

- **Dato:** `ActividadCuenta.contenido = "sin_contenido_prueba"`, código `cdd-sin-contenido`, en `GET /cuentas/{c}/actividades` con el conjunto `piloto`.
- **Dónde se mostraría:** mapa de la Ciudad; no existe contenido narrativo ni posición para esta actividad deliberada de prueba.
- **Opciones:**
  1. Mantenerla como prueba de contenido ausente, descartada por el mapa según §7.4.
  2. Definir posteriormente un contenido y su presentación en el mapa.
  3. Retirarla del conjunto cuando deje de necesitarse esa prueba.
- **Si no se muestra:** desde F3 se descarta y se avisa en desarrollo según D3; su disponibilidad sigue en la API y queda cubierta por los fixtures. B3 solo exporta los datos.
- **Estado:** pendiente de interfaz; la ausencia del contenido es intencional en este piloto.

## 2026-10-08 · B3 · Texto de la llave con Ciudad abierta al segundo paso

- **Dato:** `BloqueActividades.estado` de `CIUDAD`, en `GET /cuentas/{c}/actividades`; en `piloto` pasa a `DISPONIBLE` tras `enc-mitos`, con el Camino aún incompleto.
- **Dónde se mostraría:** llave de la Ciudad en el Camino, cuyo texto actual es «Destino al completar el camino» (§8).
- **Opciones:**
  1. Definir un texto que sirva para ambos conjuntos.
  2. Mostrar la condición real de apertura desde el progreso del servidor.
  3. Conservar el texto actual durante las pruebas del piloto.
- **Si no se muestra:** F3 muestra correctamente la llave disponible, confirmado en F4, pero el texto describe una condición distinta en piloto. Se conserva sin cambios según §8.
- **Estado:** pendiente.

## 2026-10-08 · B3 · Revelado sin animación

- **Dato:** `ActividadCuenta.visibilidad = "AL_DESBLOQUEAR"` y `visible` de `act-tip-final`, en `GET /cuentas/{c}/actividades` con `piloto`.
- **Dónde se mostraría:** punto de Elena al completar `act-tip-14`; no existe animación de revelado para actividades de esta consulta (§8).
- **Opciones:**
  1. Mostrar el punto al actualizar su visibilidad, sin animación.
  2. Definir una animación para su aparición.
  3. Definir un aviso de revelado con la interacción que decida el usuario.
- **Si no se muestra:** F3 aplica la visibilidad enviada por el servidor; F4 confirma la aparición sin una transición especial. No se reutiliza el mecanismo local de misiones adicionales.
- **Estado:** pendiente.

## 2026-10-08 · B2 · Testimonios del servidor

- **Dato:** `ContenidoEstado[].codigo`, `titulo` y `estado`, en `GET /cuentas/{c}/testimonios`.
- **Dónde se mostraría:** acceso a testimonios o historias de profesiones del portal del estudiante; hoy no tiene una vista conectada al servidor.
- **Opciones:**
  1. Conectar una lista de testimonios en su futura sección.
  2. Ofrecerlos desde el detalle de una profesión.
  3. Mantenerlos fuera de la interfaz hasta la iteración 4.
- **Si no se muestra:** la consulta conserva el dato en la API al retirar `/estado`; el front no la solicita ni agrega sus tipos o servicios en esta fase (§4 de la spec de actividades por dominio).
- **Estado:** pendiente. B2 solo registra el dato; no implementa ninguna opción.

## 2026-10-08 · B2 · Preguntas del diario del servidor

- **Dato:** `PreguntaDiarioEstado[].codigo`, `pregunta`, `estado` y `respondida`, en `GET /cuentas/{c}/diario/preguntas`.
- **Dónde se mostraría:** preguntas guiadas del diario del estudiante; su funcionamiento actual sigue siendo local.
- **Opciones:**
  1. Conectar las preguntas guiadas en la iteración 3.
  2. Integrarlas como sugerencias al escribir una entrada.
  3. Mantener el diario local hasta definir su integración completa.
- **Si no se muestra:** el front no conoce la disponibilidad ni las respuestas registradas en el servidor; no llama a esta consulta durante la iteración 1 y conserva su comportamiento actual.
- **Estado:** pendiente. B2 solo registra el dato; no implementa ninguna opción.

## 2026-10-08 · B2 · Disponibilidad de conversaciones del servidor

- **Dato:** `ConversacionesEstado.estado`, en `GET /cuentas/{c}/conversaciones`.
- **Dónde se mostraría:** acceso a conversaciones familiares del portal del estudiante; todavía no hay una vista en modo API que consuma este estado.
- **Opciones:**
  1. Conectar la disponibilidad al acceso de conversaciones en la iteración 4.
  2. Mostrarla al abrir el detalle de una conversación.
  3. Mantener el acceso de próxima iteración hasta integrar lectura y acciones.
- **Si no se muestra:** el estado sigue disponible en el backend; el front no solicita la consulta y conserva su presentación actual de próxima iteración.
- **Estado:** pendiente. B2 solo registra el dato; no implementa ninguna opción.

## 2026-10-08 · F4 · Señal de hoy todavía local

- **Dato:** el front conserva la señal en su almacenamiento local; existe `POST /acciones/check-in`, pero falta una consulta de lectura para conectarla como fuente única (D9 y §11).
- **Dónde se mostraría:** panel del mapa, registro de señal y evolución del diario, con sus elementos actuales.
- **Opciones:**
  1. Integrar lectura y escritura juntas en la iteración 3, como está previsto.
  2. Definir antes el contrato de consulta manteniendo la integración para esa iteración.
  3. Conservar explícitamente el comportamiento local hasta completar ambos extremos.
- **Si no se muestra:** la señal del panel sigue siendo local incluso en modo API; el recorrido de F4 no la envía al servidor y no mezcla sus datos con disponibilidad o progreso.
- **Estado:** pendiente de la iteración 3; no se modifica interfaz ni almacenamiento.

## 2026-10-09 · Anexo F3 · Persona, rol, cita y apertura de testimonios

- **Dato:** `RespuestaAccion.nuevos_desbloqueos[].objetivo.codigo` y `.nombre` cuando `tipo_objetivo = TESTIMONIO`, en `POST /acciones/completar-actividad`. El recibo no contiene persona, rol ni cita; `Recurso` de `catalog.recursos` tampoco tiene persona/rol. El contenido puede faltar. `GET /cuentas/{c}/testimonios` entrega `ContenidoEstado[].codigo`, `titulo` y `estado`, pero su integración no corresponde a esta iteración (pendiente B2 anterior).
- **Dónde se mostraría:** tarjeta de testimonio dentro de «Nuevo en tu mochila» y visor seleccionado mediante `?kind=testimonial&ficha={codigo}`.
- **Opciones:** completar el catálogo narrativo con metadatos y contenido para esos códigos; definir una respuesta de lectura de testimonios con persona/rol/cita en su iteración; conservar solo el nombre en el cierre hasta disponer de contenido e integración remota.
- **Si no se muestra:** el cierre presenta el nombre real y su enlace, sin atribuciones o citas inventadas. La selección local funciona cuando el testimonio existe, con sus candados actuales. En API la mochila conserva solo las fichas remotas de esta iteración: un testimonio sin integración no abre un visor de contenido, aunque su enlace ya incluye el código y filtro correctos.
- **Estado:** se aplica el fallback expresamente autorizado en F3 (línea 143: «Si no existe, solo el nombre. No se inventa una cita.»). La integración y el contenido de testimonios quedan pendientes; ninguna opción adicional se implementa.

## 2026-10-09 · Anexo F3 · Conservar el cierre al volver de una ficha

- **Dato:** `RespuestaCompletarActividad.nuevos_desbloqueos`, recibido en `POST /acciones/completar-actividad`, vive en el estado del reproductor; no se conserva al desmontarlo para abrir una ficha.
- **Dónde se mostraría:** misma tarjeta de cierre al regresar desde la mochila.
- **Opciones:** conservar temporalmente el recibo y origen en un estado del dominio; abrir el visor sobre la tarjeta sin abandonar el reproductor; volver al mapa y consultar el historial de desbloqueos.
- **Si no se muestra:** las fichas permanecen obtenidas, pero regresar por el navegador no recupera el cierre con los desbloqueos de esa finalización. Reabrir la actividad completada muestra el modo repaso sin reutilizar recompensas anteriores.
- **Estado:** pendiente solicitado expresamente en F5, punto 3. F3 conserva la navegación mediante enlaces que prescribe el anexo y no agrega persistencia ni un flujo de retorno.
