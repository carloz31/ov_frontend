# Instrucciones para agentes

## Integración con el backend

- Para el origen de los datos (qué está disponible, completado u obtenido; respuestas de cuestionarios; resultados; fichas; insignias; nivel) y para todo lo que cubre la spec de la iteración vigente, prevalece esa spec, que está en `ov_backend/docs/iteraciones/`.
- Para la presentación y la interacción de cada vista siguen vigentes las precedencias de «Interfaz del estudiante».
- `VITE_DATOS=local` (por defecto) debe comportarse exactamente como antes. En `VITE_DATOS=api`, `prototypeAllUnlocked`, `studentDemoEnabled` y `pendingContent` no afectan la disponibilidad.
- `src/features/servidor/adaptadores.ts` solo importa tipos, para poder probarse transpilándolo con `typescript`, como en `tests/mission-logic.test.mjs`.
- Para la red basta `fetch`. El proxy de desarrollo `/api` apunta a `http://127.0.0.1:8000`.
- Las decisiones de presentación del estudiante siguen registrándose en `docs/student-experience/plan.md`.

## Interfaz del estudiante
- Para el piloto de evaluación, registros personalizados y misiones adicionales del Bloque 1 prevalecen las decisiones aprobadas en `docs/student-experience/implementacion-piloto-bloque1.md`; el contenido de referencia está en `docs/student-experience/especificacion-registros-personalizados-adicionales.md`.
- Para progreso, comprobaciones, cierre de misión, desafíos y exploración inesperada del catálogo prevalece `docs/student-experience/especificacion-progreso-comprobaciones-desafios.md`, con las decisiones y límites registrados en `docs/student-experience/implementacion-progreso-comprobaciones-desafios.md`.
- El historial de señales y Mis actividades siguen los patrones visuales de descubrimiento por solicitud directa del usuario, registrada en `docs/student-experience/plan.md`; se conservan sus registros y acciones.
- Para panel del mapa, mochila, diario y pasaporte prevalece `docs/student-experience/especificacion-panel-mochila-diario-pasaporte.md`, con los acuerdos registrados en `docs/student-experience/plan.md`.
- Para perfil, libro de Helena, planes, investigaciones y catálogo prevalece `docs/student-experience/especificacion-vistas-descubrimiento.md`, con los acuerdos registrados en `docs/student-experience/plan.md`.
- Para las demás vistas, la fuente de verdad es `docs/student-experience/especificacion-interfaz-inmersiva-estudiante.md`.
- En ese alcance, si contradice otros documentos de `docs/`, comentarios del código o pruebas antiguas, prevalece esa especificación.
- `docs/mission-spec.md` sigue vigente para el significado de los nodos, salvo donde la especificación indique otra cosa.
- No abras, leas ni modifiques `src/features/parent-portal/`, `src/features/counselor-portal/` ni `tests/counselor-portal.test.mjs`.

## Excepción para el nuevo estilo de orientadora y apoderado

La solicitud directa del usuario del 6 de octubre de 2026, «Ayúdame implementando este nuevo estilo para las pantallas de la orientadora y del apoderado», autoriza acceder y modificar `src/features/counselor-portal/` y `src/features/parent-portal/` y comprobar sus pantallas en el navegador local para implementar la especificación adjunta «Especificación nuevo estilo de los portales de orientadora y apoderado (1).md». Esta excepción se limita a su presentación y las comprobaciones necesarias; se conservan datos y comportamientos. La restricción sobre `tests/counselor-portal.test.mjs` se mantiene. Para trabajos del estudiante ajenos a esta solicitud sigue aplicándose la exclusión de ambos portales.

## Comandos y pruebas

- Instalar: `npm install`
- Desarrollo: `npm run dev` (con `VITE_DATOS=api` en `.env.local` para usar el backend)
- Verificar: `npm run build`, `npm run lint` y `npm test`.
- Ejecutar las suites, incluidas las que importan los portales, no cuenta como abrirlos. Lo que sigue prohibido es abrir, leer o modificar esas carpetas y `tests/counselor-portal.test.mjs`. Si una de esas suites falla por un cambio tuyo, detente y avisa en lugar de inspeccionarla.
- Las pruebas nuevas de la integración van en `tests/servidor-*.test.mjs` y usan los fixtures de `tests/fixtures/servidor/`, generados desde `ov_backend`.

## Reglas compartidas entre ov_backend y ov_frontend

> Esta sección es idéntica en el `AGENTS.md` de ambos repos. Si la cambias en uno, cámbiala en el otro en la misma tarea.

**Los repos.** `ov_backend` (FastAPI, rama `master`) y `ov_frontend` (React + Vite + TypeScript, rama `main`) están en carpetas independientes y son repos git separados. Para referirte al otro, usa su nombre de carpeta; no asumas una ruta relativa entre ellos.

**Fuentes de verdad, en este orden:**

1. La especificación de la iteración vigente, `ov_backend/docs/iteraciones/spec-iteracion-N.md` (hoy la **1**), para el alcance, la integración entre repos y los datos de prueba.
2. Las especificaciones de cada repo para su propio dominio.
3. Este `AGENTS.md`, para convenciones y áreas protegidas.

Si dos fuentes se contradicen, detente y explica la contradicción. No la resuelvas en el código.

**Cómo se trabaja.**

- Solo se implementa la iteración vigente. `ov_backend/docs/iteraciones/plan-iteraciones.md` muestra lo que viene después para no cerrar caminos, no para adelantarlo.
- Por fases, en el orden de la spec. Al terminar cada fase, detente y resume qué hiciste, qué pruebas pasan en cada repo y qué queda pendiente. Si la fase tocó ambos repos, corre las pruebas de los dos.
- Las decisiones que afectan a ambos repos van en `ov_backend/docs/iteraciones/decisiones-iteracion-N.md`.
- Datos de prueba: si el dato existe en el front, úsalo adaptándolo. Si no existe, créalo y márcalo con `DATO DE PRUEBA` (comentario en código) o `"_dato_de_prueba": true` (JSON).
- Sin dependencias nuevas en ninguno de los repos sin avisar antes.

**Una sola base de datos.**

- La base del backend es la única fuente de disponibilidad, progreso, respuestas de cuestionario, resultados, fichas obtenidas, insignias y nivel.
- En modo `VITE_DATOS=api`, el front nunca decide si algo está disponible, completado u obtenido: lo lee del servidor. Si el servidor no responde, lo dice; no inventa un estado.
- El contenido narrativo de las actividades (nodos JSON) sigue en el front. El backend guarda estructura y estado, y no interpreta ese contenido.
- El modo `local` del front debe seguir funcionando igual que antes.

**Contrato.**

- Los códigos del backend son los ids del front (`mission-welcome`, `act-tip-01`, `I1`, `psychologist`). No hay tablas de traducción.
- El JSON usa los nombres en español y `snake_case` de los esquemas Pydantic. El front los copia tal cual en `src/features/servidor/tipos.ts` y accede al backend solo desde `src/features/servidor/`.
- Si una tarea cambia una respuesta que consume el front, en la misma tarea se actualizan el esquema y las pruebas del backend, `tipos.ts` y los adaptadores del front, los fixtures (`scripts/exportar_fixtures_front.py` de `ov_backend`, con `--destino` apuntando a `tests/fixtures/servidor/` de `ov_frontend`) y las pruebas del front.

**Git.** No hagas push salvo que se pida. Trabaja en una rama `iteracion-N` en cada repo, con un commit por fase y por repo y mensaje en español (`Iteración 1 · F2: semilla plataforma`). Nunca versiones `.env`, `.env.local` ni archivos `*.db`.

**Idioma.** Documentación, mensajes al usuario y commits en español.
