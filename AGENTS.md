# AGENTS.md

## Proyecto

Frontend en React + Vite + TypeScript de una plataforma gamificada de orientación vocacional, con tres portales: estudiante (aventura inmersiva), apoderado y orientadora. Consume la API de `ov_backend`.

Fuentes de verdad, además de las «Reglas compartidas» del final:

- Estructura del repo, origen de los datos y tamaño de los componentes: `docs/refactor/spec-refactor-estructura.md` y `docs/refactor/origen-de-datos.md`. Este archivo resume sus reglas.
- Presentación e interacción del estudiante: las especificaciones de `docs/student-experience/` (precedencias en «Interfaz del estudiante»).
- Presentación de orientadora y apoderado: `docs/staff-experience/`.
- Significado de los nodos de las actividades: `docs/mission-spec.md`, salvo donde una especificación indique otra cosa.

## Estructura

Esta estructura es fija. No crees carpetas ni archivos fuera de ella; si algo no encaja, detente y pregunta. `npm run check:estructura` la comprueba.

```
src/
  main.tsx, App.tsx, index.css
  config/        entorno (env.ts: modoApi, urlApi, desarrollo) y alcance de la demo
  routes/        AppRoutes.tsx (solo la tabla de rutas), paths.ts, guardas
  pages/         una vista por ruta y los layouts de cada portal: auth/, student/, parent/, counselor/
  features/      un dominio por carpeta: auth, activities, adventure, backpack, cases, discovery,
                 journal, family-conversations, parent, counselor, student-tracking
    <dominio>/   components/, hooks/, lib/, data/, store/, context/, styles/, types.ts
  components/    reutilizables sin lógica de dominio: ui/ (shadcn), common/, layout/, staff/, student/
  context/       contextos que usan varios dominios
  store/         estado global; servidor/ es el estado sincronizado con el backend
  services/api/  el único acceso al backend: cliente.ts (obtener, enviar, actualizar, eliminar) y un archivo por grupo de rutas
  data/          datos fijos de varios dominios: activities/, catalog/, content/, demo/
  lib/           lógica pura compartida; lib/activities (motor), lib/servidor (adaptadores)
  hooks/         hooks globales
  types/         tipos compartidos; servidor.ts es el contrato con el backend
  styles/        theme.css y styles/student/
```

### Dónde va cada cosa

| Si agregas… | Va en… |
|---|---|
| Una ruta | `routes/AppRoutes.tsx` + su vista en `pages/<portal>/`. La vista lee parámetros, llama a hooks y compone; no contiene lógica de dominio. |
| Un componente de un dominio | `features/<dominio>/components/`. |
| Un componente que usan dos dominios | `components/student/`, `components/staff/` o `components/common/` si no conoce el dominio. Si lo conoce, detente y pregunta. |
| Una primitiva de interfaz | `components/ui/`. Usa la de shadcn antes de crear otra. |
| Una llamada al backend | `services/api/<recurso>.ts`, con el mismo agrupamiento que los routers del backend (`cuentas`, `acciones`, `instrumentos`, `demo`). Usa la función del método que define la ruta del backend (GET → `obtener`, POST → `enviar`, PATCH → `actualizar`, DELETE → `eliminar`). Si el backend define una ruta PUT, detente y avisa antes de agregar un método nuevo al cliente. |
| Un tipo del contrato | `types/servidor.ts`, copiado tal cual del esquema Pydantic. |
| Convertir una respuesta en datos para la vista | `lib/servidor/adaptadores.ts`. |
| Estado que viene del servidor | `store/servidor/`. |
| Elegir entre dato del servidor y dato local | Un hook en `features/<dominio>/hooks/`. Nunca en una vista. |
| Estado persistente de varios dominios | `store/<nombre>Store.ts`; de un dominio, `features/<dominio>/store/`. |
| Lógica pura | `features/<dominio>/lib/`; si la usan varios dominios o una capa inferior, `lib/`. |
| Contenido fijo | `features/<dominio>/data/` si es de un dominio; si no, `data/content/` (narrativo), `data/catalog/` (catálogo que podría venir del servidor) o `data/activities/` (nodos JSON). |
| Datos inventados | `data/demo/` o `features/<dominio>/data/`, marcados con `DATO DE PRUEBA`. |
| Un tipo de varias capas | `types/<dominio>.ts`; de una feature, `features/<dominio>/types.ts`. |
| Una variable de entorno | `config/env.ts` y `.env.example`. |
| CSS | `features/<dominio>/styles/`; si se aplica a todo el portal del estudiante, `styles/student/`. |

Si una iteración trae un dominio nuevo (por ejemplo, favoritos), créale su carpeta en `features/` con las subcarpetas que necesite y agrégalo a la lista de arriba y a `docs/refactor/spec-refactor-estructura.md` §3.1.

### Dependencias entre capas

- `routes → pages → features → store → services/api`. Todas pueden usar `components`, `hooks`, `lib`, `data`, `types` y `config`, salvo lo que sigue.
- `components/` no importa `features`, `pages`, `store`, `services` ni `context`.
- `services/api/` solo importa `config` y `types`. `fetch` solo existe en `services/api/cliente.ts`, que exporta `obtener`, `enviar`, `actualizar` y `eliminar`; estas funciones solo se importan dentro de `services/api/`.
- `store/` no importa `features`, `pages`, `components` ni `context`. `lib/`, `data/`, `types/` y `config/` no importan capas superiores.
- `pages/` y `features/` no importan `services/`: los datos del backend llegan por `store/servidor/` y los hooks.
- Una feature no usa componentes de otra. Las únicas features compartidas, cuyos componentes pueden usar otras, son `family-conversations` y `student-tracking`. Si hace falta un componente ajeno, pásalo desde la vista de ruta como prop o `children`, o súbelo a `components/`.
- `modoApi` y `desarrollo` no se importan en `components/`, `pages/` ni `features/*/components/`.
- `lib/activities/logic.ts`, `lib/servidor/adaptadores.ts` y `lib/explorationAssets.ts` solo importan tipos: las pruebas los cargan aislados.

### Componentes

- Un componente exportado por archivo; ayudantes privados de hasta unas 40 líneas en el mismo archivo.
- Máximo 300 líneas por `.tsx` y 400 por `.ts` (sin contar `data/` ni `components/ui/`). Una vista de ruta, idealmente 150. El estado y los efectos de un componente grande van a un hook del dominio.
- Antes de crear un componente, busca uno que ya lo haga. No copies un componente para variarlo: agrega una prop o extrae la parte común.
- Nombres: componentes en `PascalCase.tsx`; el resto en `camelCase.ts`; CSS en `kebab-case.css`. Sin barriles (`index.ts`): importa el archivo concreto. Usa `@/` para salir de la propia feature o capa.

### Verificador

- `npm run check:estructura` debe pasar al terminar cualquier tarea.
- `scripts/estructura-excepciones.json` está vacío. No agregues excepciones; si una regla no se puede cumplir, detente y explica por qué.

## Origen de los datos

- `VITE_DATOS=local` (por defecto) debe comportarse exactamente como antes. En `VITE_DATOS=api`, `prototypeAllUnlocked`, `studentDemoEnabled` y `pendingContent` no afectan la disponibilidad.
- `docs/refactor/origen-de-datos.md` dice qué viene del servidor, qué es contenido del front, qué es catálogo fijo y qué es demostración. Si una tarea mueve un dato de un grupo a otro, actualiza ese documento en la misma tarea.
- Cuando un dato pase al servidor, cambia el hook del dominio y `store/servidor/`; las vistas no deberían cambiar.
- No cambies claves ni formatos de `localStorage`, `sessionStorage` o IndexedDB sin una migración que conserve lo guardado (las claves están en `docs/refactor/origen-de-datos.md`).
- Para la red basta `fetch`. El proxy de desarrollo `/api` apunta a `http://127.0.0.1:8000`.

## Datos del servidor sin vista

La interfaz la decide el usuario. Un agente conecta datos a la interfaz que ya existe; no diseña interfaz nueva para mostrarlos.

- **Conectar sí:** que un elemento que ya existe (un contador, una insignia, un estado de candado, un texto) pase a tomar su valor del servidor en lugar del dato local, con el mismo marcado, los mismos textos y el mismo estilo.
- **Agregar no:** si el backend entrega un dato que ninguna vista muestra hoy, o mostrarlo exige algo que no existe (una pantalla, sección, tarjeta, columna, pestaña, texto, ícono, estado visual o ruta), **no crees ni modifiques interfaz para mostrarlo**. Tampoco lo resuelvas reutilizando un componente en otro lugar ni con un texto provisional.
- Hasta ahí sí puedes llevar el dato: `types/servidor.ts`, `services/api/`, `store/servidor/`, `lib/servidor/adaptadores.ts` y el hook del dominio. Se queda sin pintar.
- **Detente y avisa.** Al terminar la fase (o antes, si bloquea), lista cada dato en `docs/pendientes-interfaz.md` y en tu resumen, con: dato y campo de la respuesta (`LogrosCuenta.insignias[].requisito`), petición que lo trae, dónde crees que se mostraría, 2 o 3 opciones de interfaz y qué pasa si no se muestra. El usuario decide; no implementes ninguna opción hasta que responda.
- **Lo mismo al revés:** si una vista necesita un dato que el servidor no entrega, no lo inventes ni lo calcules en el front para cubrir el hueco; anótalo en el mismo documento y avisa.
- Si crees que la tarea no se puede terminar sin tocar una vista, **detente antes de tocarla** y pide autorización. Nunca cambies una vista esperando aprobarla después: el usuario prefiere hacer esos cambios aparte, con los datos que ya llegan del backend.
- Solo se agrega o cambia interfaz cuando el usuario lo pide o la spec vigente lo describe expresamente (qué vista, qué elemento, qué texto). Cita en el resumen la línea de la spec que lo autoriza.
- Estados de carga y error: usa los mensajes y componentes que ya existen (`mensajeErrorServidor`, los avisos actuales). Un estado visual nuevo también se consulta.

## Interfaz del estudiante

- Para el piloto de evaluación, registros personalizados y misiones adicionales del Bloque 1 prevalecen las decisiones aprobadas en `docs/student-experience/implementacion-piloto-bloque1.md`; el contenido de referencia está en `docs/student-experience/especificacion-registros-personalizados-adicionales.md`.
- Para progreso, comprobaciones, cierre de misión, desafíos y exploración inesperada del catálogo prevalece `docs/student-experience/especificacion-progreso-comprobaciones-desafios.md`, con las decisiones y límites registrados en `docs/student-experience/implementacion-progreso-comprobaciones-desafios.md`.
- El historial de señales y Mis actividades siguen los patrones visuales de descubrimiento por solicitud directa del usuario, registrada en `docs/student-experience/plan.md`; se conservan sus registros y acciones.
- Para panel del mapa, mochila, diario y pasaporte prevalece `docs/student-experience/especificacion-panel-mochila-diario-pasaporte.md`, con los acuerdos registrados en `docs/student-experience/plan.md`.
- Para perfil, libro de Helena, planes, investigaciones y catálogo prevalece `docs/student-experience/especificacion-vistas-descubrimiento.md`, con los acuerdos registrados en `docs/student-experience/plan.md`.
- Para las demás vistas, la fuente de verdad es `docs/student-experience/especificacion-interfaz-inmersiva-estudiante.md`.
- En ese alcance, si contradice otros documentos de `docs/`, comentarios del código o pruebas antiguas, prevalece esa especificación.
- Las decisiones de presentación del estudiante se registran en `docs/student-experience/plan.md`.

## Comandos y pruebas

- Instalar: `npm install`
- Desarrollo: `npm run dev` (con `VITE_DATOS=api` en `.env.local` para usar el backend)
- Verificar, antes de dar por terminada cualquier fase: `npm run build`, `npm run lint`, `npm test` y `npm run check:estructura`.
- Las pruebas nuevas de la integración van en `tests/servidor-*.test.mjs` y usan los fixtures de `tests/fixtures/servidor/`, generados desde `ov_backend`. Los ayudantes compartidos de prueba van en `tests/soporte/`.
- Las pruebas cargan archivos por su ruta: si mueves un archivo, actualiza esas rutas en la misma tarea. No agregues resolución de carpetas a los cargadores.

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
- El JSON usa los nombres en español y `snake_case` de los esquemas Pydantic. El front los copia tal cual en `src/types/servidor.ts` y accede al backend solo desde `src/services/api/` (un archivo por router del backend); las vistas leen esos datos a través de `src/store/servidor/`.
- Si el backend entrega un dato que ninguna vista del front muestra, o una vista necesita un dato que el backend no entrega, no se crea ni se modifica interfaz para cubrirlo: se registra en `ov_frontend/docs/pendientes-interfaz.md` y se avisa al usuario, que decide la interfaz (detalle en «Datos del servidor sin vista» del `AGENTS.md` del front). Vale también al trabajar solo en el backend: si agregas o cambias un campo de una respuesta, revisa si el front tiene dónde mostrarlo y, si no, anótalo igual.
- Si una tarea cambia una respuesta que consume el front, en la misma tarea se actualizan el esquema y las pruebas del backend, `src/types/servidor.ts`, `src/services/api/` y `src/lib/servidor/adaptadores.ts` del front, los fixtures (`scripts/exportar_fixtures_front.py` de `ov_backend`, con `--destino` apuntando a `tests/fixtures/servidor/` de `ov_frontend`) y las pruebas del front.

**Git.** No hagas push salvo que se pida. Trabaja en una rama `iteracion-N` en cada repo, con un commit por fase y por repo y mensaje en español (`Iteración 1 · F2: semilla plataforma`). Nunca versiones `.env`, `.env.local` ni archivos `*.db`.

**Idioma.** Documentación, mensajes al usuario y commits en español.
