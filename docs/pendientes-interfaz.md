# Pendientes de interfaz

Datos que el backend entrega (o que una vista necesita) y que la interfaz todavía no muestra. Los resuelve el usuario.

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
