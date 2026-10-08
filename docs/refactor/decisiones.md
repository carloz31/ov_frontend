# Decisiones del refactor de estructura

## R0 · Punto de partida y línea base (8 de octubre de 2026)

- Rama de trabajo: `refactor-estructura`, creada desde `iteracion-1`.
- Commit de partida: `3f58c1e26957c53ea5c3b418d25f397563724ad2`.
- `git diff --stat 1bbacce HEAD -- src tests` no devuelve cambios. El código y las pruebas coinciden con la base del mapa de archivos; el commit posterior solo afecta documentación.
- Etiqueta local `prototipo-v1` creada en el commit de partida. No se publica.
- La especificación entregada está en `docs/refactor/spec-refactor-estructura.md`; `docs/spec-refactor-estructura.md` no existe. Se usa la copia encontrada, sin moverla ni modificarla. Los cuatro archivos entregados en `docs/refactor/` estaban sin seguimiento y se conservan así.
- `npm ci` completado con el archivo de bloqueo existente, sin agregar dependencias. La primera ejecución en el entorno restringido se interrumpió al no avanzar; la repetición con acceso a red y caché terminó correctamente.
- `npm run build`: pasa (aviso existente por tamaño del bundle).
- `npm run lint`: pasa.
- `npm test`: **356 pruebas, 340 pasan, 16 fallan**, sin pruebas canceladas ni omitidas. Los nombres de las 16 fallas coinciden con §9.1 de la especificación; no se cambian código ni aserciones.
- No se modifica `ov_backend` ni se ejecutan sus pruebas: R0 solo afecta al frontend.
- Infracciones de estructura: pendientes de medir en R3b. El verificador aún no se ejecuta, según §10.

La solicitud autoriza ejecutar R0 y R1 en este mismo turno. Tras registrar y confirmar R0 se continúa con R1, y se detiene antes de R2.

## R1 · Limpieza y preparación del verificador (8 de octubre de 2026)

- Se retira `.env` del índice de Git y se agrega a `.gitignore`; el archivo local se conserva y `.env.example` sigue versionado.
- Se eliminan `.f6-cierre-vite.config.ts` y los tres archivos de plantilla de `src/assets/`: `hero.png`, `react.svg` y `vite.svg`.
- Se copia el Anexo B a `scripts/verificar-estructura.mjs` sin cambios (SHA-256 idéntico) y se agrega `check:estructura` a `package.json`. No se ejecuta ni se generan excepciones: corresponde desde R3b.
- `npm run build` y `npm run lint`: pasan. El build conserva los nombres y tamaños de los bundles de R0 y su aviso por tamaño.
- `npm test`: **356 pruebas, 340 pasan, 16 fallan**, sin canceladas ni omitidas. Comparados los registros de R0 y R1, coinciden los nombres y los errores completos de las 16 fallas, excluyendo únicamente sus duraciones. Los nombres también coinciden con §9.1.
- No se modifican pruebas ni código de la aplicación; solo se eliminan los assets indicados. No hay adaptaciones de §9.2 en estas fases.
- No se modifica `ov_backend`; no corresponde ejecutar sus pruebas.
- Los registros de verificación de R0 y R1 están en `logs/`, que ya estaba ignorado por Git.
- Pendiente: R2 (código sin ruta y adaptación A4) y fases posteriores. Las infracciones de estructura se medirán en R3b. El trabajo se detiene al terminar R1.

## R2 · Código sin ruta y adaptación A4 (8 de octubre de 2026)

- Se eliminan exactamente los 29 archivos de código enumerados en «Se elimina (decisión D1)» del mapa: 9.422 líneas. Los tres assets de esa lista ya se eliminaron en R1. El historial y la etiqueta local `prototipo-v1` conservan el prototipo.
- `OccupationExplorationPages.tsx` conserva únicamente `ExplorationCaseIntroPage` y `ForestFireCasePage`, sus imports necesarios y sus exports. Se comprobó que los cuerpos de ambas funciones permanecen idénticos.
- Se conserva `src/features/student-experience/reflection/additional.ts`, según A4.
- Adaptación A4, sin cambiar valores esperados ni aserciones del código vigente. Archivos y pruebas tocados:
  - `tests/adventure-rendering.test.mjs`: se eliminan «case drawers contain only the start action and no embedded questions», «map details use the shadcn drawer and expose a close button», «only field missions connect their map points with a route» e «investigation cards preserve visits, favorites and a single reaction without changing the published draft».
  - En ese mismo archivo se retira la carga global de `AdventureMap`; en «adventure keeps the original mission route and switches between path and city» se retiran las dos líneas sobre su fuente, y en «journal home supports topics and keeps readiness separate from entries» se retira el bloque sobre `PostActivityJournalSheet`.
  - `tests/forest-fire-case.test.mjs`: en «both map drawers expose the same status, score and action for every case state» se retira solo el bloque que renderizaba `CityMapView`. Se conservan los cuatro estados y todas las aserciones sobre `mapPoints`.
- `npm run build` y `npm run lint`: pasan. Se mantiene el aviso por tamaño del bundle; Vite regenera los assets tras retirar el código del prototipo.
- `npm test`: antes **356/340/16**; después **352/336/16** (total/correctas/fallas), sin canceladas ni omitidas. Los 16 nombres coinciden con R1 y §9.1; los errores también coinciden, excluyendo únicamente duraciones y números de línea desplazados por A4.
- Registros de validación: `logs/refactor-r2-build.log`, `logs/refactor-r2-lint.log` y `logs/refactor-r2-test.log` (ignorados por Git).
- No se modifica `ov_backend`; no corresponde ejecutar sus pruebas.
- Infracciones de estructura pendientes de medir en R3b; no se ejecuta todavía `check:estructura` ni se generan excepciones.
- Pendiente: R3a (capas compartidas) y fases posteriores. El trabajo se detiene al terminar R2.
