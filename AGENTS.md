# Instrucciones para agentes

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
