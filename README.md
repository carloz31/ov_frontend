# Orientación Explora · frontend

Interfaz en React, TypeScript y Vite para una plataforma de orientación vocacional. El estudiante recorre Camino y Ciudad, conversa con Mara y consulta sus intereses, mochila y pasaporte.

La fuente de verdad de la integración es `ov_backend/docs/iteraciones/spec-iteracion-1.md`. Las decisiones compartidas están en `ov_backend/docs/iteraciones/decisiones-iteracion-1.md`; las de presentación en [el plan del estudiante](docs/student-experience/plan.md).

## Ejecutar

Requisitos: Node.js y npm compatibles con las versiones fijadas en `package-lock.json`.

```powershell
npm ci
npm run dev
```

Abre la dirección que imprime Vite. El acceso es de demostración: acepta usuario y contraseña de prueba y permite elegir un perfil.

## Origen de los datos

`VITE_DATOS=local` es el valor predeterminado. Conserva el recorrido de demostración, sus cálculos y almacenamiento local, sin solicitar la API.

Para usar el servidor, crea `.env.local` a partir de [.env.example](.env.example):

```dotenv
VITE_DATOS=api
VITE_API_URL=/api
```

En otra terminal, desde la raíz de **ov_backend**, arranca la plataforma con el evaluador falso:

```powershell
uv sync
$env:EVALUADOR="falso"
uv run alembic upgrade head
uv run python -m datos.cargar plataforma
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

La migración y la carga se ejecutan una vez sobre una base nueva. En los siguientes
arranques basta con Uvicorn. El backend usa `DATABASE_URL` (por defecto,
`sqlite:///ov.db` en su raíz); para otra base, definirla antes de migrar y cargar.
`POST /desarrollo/reiniciar` (solo en desarrollo) borra el estado y conserva el catálogo. La preparación
vigente se define en `ov_backend/docs/spec-refactor-estructura.md`.

Reinicia Vite al cambiar variables. Su proxy de desarrollo dirige `/api` a `http://127.0.0.1:8000` y quita ese prefijo. El proxy no forma parte del build de producción; el entorno que sirva `dist` debe resolver `/api` o proporcionar una URL accesible del backend.

Usa `est-ana` o `est-luis` para elegir una cuenta ESTUDIANTE. Un usuario que no coincide usa `est-ana`. Es identificación de prueba, sin autenticación real. El menú permite reiniciar datos con confirmación exclusivamente en desarrollo y API.

En API, el servidor decide disponibilidad, finalización, respuestas de Mara, resultado RIASEC, fichas obtenidas, insignias y nivel. Nodos narrativos, textos, borradores, comprobaciones y respuestas de brújula permanecen locales. La finalización se informa únicamente desde `move` en `src/features/activities/hooks/useActivityCompletion.ts`, al llegar a `$fin`; consultar y revisar no completa actividades.

Los almacenes de Camino y aventura separan sus claves API con `.api` y por cuenta. Descubrimiento guarda preferencias por cuenta y revelación de intereses por cuenta y `calculado_en`. Recargar mantiene el estado remoto y los borradores locales. No versiones `.env`, `.env.local` ni bases `*.db`.

## Estructura del proyecto

La estructura y sus reglas están en [AGENTS.md](AGENTS.md). El [inventario de origen de los datos](docs/refactor/origen-de-datos.md) distingue servidor, contenido, catálogo, demostración y estado del navegador.

```
src/
├── main.tsx                 # punto de entrada: configura el entorno y monta App
├── App.tsx                  # DemoAccessGate + AppRoutes
├── index.css                # Tailwind y estilos globales
├── assets/                  # imágenes y fuentes que se importan desde código (hoy vacía; public/ sigue para URLs)
├── config/                  # configuración de la aplicación
│   ├── env.ts               # modoApi, urlApi, desarrollo, configurarServidor (antes servidor/config.ts)
│   └── studentDemoScope.ts  # alcance de la demo del estudiante
├── routes/
│   ├── AppRoutes.tsx        # SOLO la tabla de rutas
│   ├── SoloLocal.tsx        # guarda «Disponible en una próxima iteración» (sale de AppRoutes)
│   ├── paths.ts             # appPaths
│   └── discoveryPaths.ts
├── pages/                   # un archivo por ruta (y los layouts de cada portal); componen features
│   ├── auth/                # LoginRoute, RoleSelectionRoute (salen de AppRoutes)
│   ├── student/             # StudentShell, CaminoScreen, CiudadScreen, StudentJournalView, …
│   ├── parent/
│   └── counselor/
├── features/                # un dominio por carpeta (ver tabla)
│   └── <dominio>/
│       ├── components/      # componentes del dominio (subcarpetas por área si hace falta)
│       ├── hooks/           # hooks del dominio; aquí se decide el origen de los datos
│       ├── lib/             # lógica pura y selectores
│       ├── data/            # contenido fijo que solo usa este dominio
│       ├── store/           # estado que solo usa este dominio
│       ├── context/         # contextos de React del dominio
│       ├── styles/          # CSS del dominio
│       └── types.ts         # tipos que solo usa este dominio
├── components/              # componentes reutilizables, sin lógica de dominio
│   ├── ui/                  # primitivas shadcn/Radix (Button, Dialog, Drawer, Select…)
│   ├── common/              # PageHeader, ThemeScope, GuideDialogue
│   ├── layout/              # AppShell, AppSidebar, AppTopBar… (portales de personal)
│   ├── staff/               # patrones visuales compartidos por orientadora y apoderado
│   └── student/             # piezas visuales del estudiante que usan varios dominios (Parchment, Seal, CharacterAvatar…)
├── context/                 # contextos compartidos entre dominios (occupationExplorationContext)
├── store/                   # estado global
│   ├── servidor/            # estado sincronizado con el backend: sesión de cuenta, estado, operaciones
│   ├── adventureStore.ts    # aventura del estudiante (antes AdventureStore.ts)
│   ├── journeyStore.ts      # progreso local de actividades (antes missions/store.ts)
│   ├── discoveryStore.ts, explorationStore.ts, reflectionStore.ts, studentUiStore.ts
├── services/
│   └── api/                 # ÚNICO lugar que habla con el backend
│       ├── cliente.ts       # obtener, enviar, actualizar, eliminar: el único fetch; solo se importan en services/api/
│       ├── cuentas.ts       # /cuentas…
│       ├── acciones.ts      # /acciones/…
│       ├── instrumentos.ts  # /actividades/{a}/items, /cuentas/{c}/instrumentos…
│       └── desarrollo.ts    # /desarrollo/reiniciar
├── data/                    # datos fijos que usan dos o más dominios
│   ├── activities/          # contenidos/ (13 JSON), contenidos.ts, content.ts, catálogo de brújula y reflectionConfig.ts
│   ├── catalog/             # ocupaciones, carreras e instituciones
│   ├── content/             # textos y contenido narrativo (guías, personajes, casos, diario, investigación, familia…)
│   └── demo/                # perfiles de estudiantes ficticios para orientadora y apoderado
├── lib/                     # utilidades y lógica pura compartida
│   ├── utils.ts             # cn() (shadcn)
│   ├── persistentStore.ts   # ayudante de almacenes persistentes
│   ├── activities/          # motor de actividades: logic.ts, validation.ts
│   ├── servidor/            # adaptadores.ts: respuesta del servidor → modelo de la vista
│   └── challenges.ts, lumiFriendship.ts, explorationAssets.ts, studentViews.ts
├── hooks/                   # hooks globales (useIsMobile, useLumiNow, useReturnFocus, useTypewriter)
├── types/                   # tipos compartidos entre capas
│   ├── servidor.ts          # contrato con el backend (antes servidor/tipos.ts)
│   └── activities.ts, adventure.ts, cases.ts, catalog.ts, challenges.ts, decisions.ts, reflection.ts, studentProfile.ts, …
└── styles/
    ├── theme.css            # tokens de la plataforma (antes Theme.css)
    └── student/             # CSS global del estudiante (student-base, student-logbook, student-targets, student-progress, discovery, journey, adventure…)
```

### Dónde va cada cosa

La tabla reproduce §3.3 de la [spec del refactor](docs/refactor/spec-refactor-estructura.md); las referencias §7 y §5.4 remiten a ese documento.

| Si agregas… | Va en… |
|---|---|
| Una ruta | La entrada en `routes/AppRoutes.tsx` y su vista en `pages/<portal>/`. |
| Una vista de ruta | `pages/<portal>/<Nombre>.tsx`: lee parámetros, llama a hooks y compone componentes. Hasta 150 líneas como guía, 300 como máximo. |
| Un componente de un dominio | `features/<dominio>/components/`. |
| Un componente que usan dos dominios | `components/student/`, `components/staff/` o `components/common/` si no conoce el dominio; si lo conoce, en la feature dueña y marcándola compartida en `AGENTS.md` (decisión del usuario). |
| Una primitiva de interfaz | `components/ui/` (shadcn). |
| Una llamada al backend | `services/api/<recurso>.ts`, igual que el router del backend. |
| Un tipo del contrato | `types/servidor.ts`, copiado tal cual del esquema Pydantic. |
| Convertir una respuesta del servidor en datos para la vista | `lib/servidor/adaptadores.ts`. |
| Estado que viene del servidor | `store/servidor/`. |
| Decidir si un dato sale del servidor o es local | Un hook en `features/<dominio>/hooks/` (§7). Nunca en una vista. |
| Estado persistente que usan varios dominios | `store/<nombre>Store.ts`. Si lo usa uno solo, `features/<dominio>/store/`. |
| Lógica pura | `features/<dominio>/lib/`; si la usan varios dominios o una capa inferior, `lib/`. |
| Contenido fijo | `features/<dominio>/data/` si lo usa un dominio; si no, `data/content/` (texto narrativo), `data/catalog/` (catálogo que podría venir del servidor) o `data/activities/`. |
| Datos inventados | `data/demo/` o `features/<dominio>/data/`, con `DATO DE PRUEBA` al inicio del archivo (§5.4). |
| Un tipo que usan varias capas | `types/<dominio>.ts`. Si solo lo usa una feature, `features/<dominio>/types.ts`. |
| Una variable de entorno | `config/env.ts` y `.env.example`. |
| CSS | `features/<dominio>/styles/`; el que se aplica a todo el portal del estudiante, `styles/student/`. |

## Verificar

```powershell
npm run build
npm run lint
npm test
npm run check:estructura
```

Las pruebas se organizan por tipo y área:

```text
tests/
  local/         # actividades, aventura, casos, perfil, portales (12 archivos)
  servidor/      # actividades, mapa, instrumentos, logros, perfil (14 archivos)
  despliegue/    # assets de producción (1 archivo)
  fixtures/servidor/  # 16 fixtures generados desde ov_backend
  soporte/
```

```powershell
npm run test:local
npm run test:servidor
npm run test:despliegue
node --test "tests/servidor/instrumentos/**/*.test.mjs"
```

Conserva las comillas del glob para que Node lo expanda también en PowerShell. Durante el desarrollo se ejecutan las carpetas afectadas; al cerrar una fase se añade `servidor`. Para cerrar una iteración o integrar se ejecutan todos los comandos del bloque «Verificar». La tabla de impacto y la política completa están en [AGENTS.md](AGENTS.md).

Cierre del retiro de demo (P6): se conservan 463 pruebas, con 449 aprobadas y las 14 fallas previas de `tests/local/aventura/adventure-rendering.test.mjs`. Esta spec no autoriza corregirlas. Build, lint y estructura pasan. La demo local sigue disponible; se retiraron únicamente los datos, páginas y rutas de demo del backend. El informe de conteos, tiempos y adaptaciones está en `ov_backend/docs/decisiones.md`, sección «Pruebas y retiro de demo».

### Historial de cierres anteriores

**Cierre F6 · 2026-10-07:** HU-073 y HU-074 corregidas y revalidadas; las catorce HU del recorrido F7 pasan en el alcance comprobado. Build y lint pasan. Hay 356 pruebas: 340 pasan y solo quedan las 16 fallas previas, con los mismos nombres y líneas. El backend pasa 1006 pruebas con evaluador falso. Consulta [el informe por HU y las evidencias](docs/student-experience/informe-f7.md); la aprobación formal de la iteración corresponde al usuario.

**Cierre R7 · 2026-10-08:** refactor de estructura completado en `refactor-estructura`, sin integrar ni hacer push. Build, lint y estructura pasan, sin excepciones. La suite conserva 365 pruebas: 350 correctas y las mismas 15 fallas previas registradas; las 77 pruebas `servidor-*` pasan. El [registro del refactor](docs/refactor/decisiones.md) documenta los movimientos, extracciones, adaptaciones autorizadas y comprobaciones.
