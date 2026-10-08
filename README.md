# Orientación Explora · frontend

Interfaz en React, TypeScript y Vite para una plataforma de orientación vocacional. El estudiante recorre Camino y Ciudad, conversa con Mara y consulta sus intereses, mochila y pasaporte.

La fuente de verdad de la integración es `ov_backend/docs/iteraciones/spec-iteracion-1.md`. Las decisiones compartidas están en `ov_backend/docs/iteraciones/decisiones-iteracion-1.md`; las de presentación en [el plan del estudiante](docs/student-experience/plan.md).

## Ejecutar

Requisitos: Node.js y npm compatibles con las versiones fijadas en `package-lock.json`.

```powershell
npm install
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
`POST /demo/reiniciar` borra el estado y conserva el catálogo. La preparación
vigente se define en `ov_backend/docs/spec-refactor-estructura.md`.

Reinicia Vite al cambiar variables. Su proxy de desarrollo dirige `/api` a `http://127.0.0.1:8000` y quita ese prefijo. El proxy no forma parte del build de producción; el entorno que sirva `dist` debe resolver `/api` o proporcionar una URL accesible del backend.

Usa `est-ana` o `est-luis` para elegir una cuenta ESTUDIANTE. Un usuario que no coincide usa `est-ana`. Es identificación de prueba, sin autenticación real. El menú permite reiniciar datos con confirmación exclusivamente en desarrollo y API.

En API, el servidor decide disponibilidad, finalización, respuestas de Mara, resultado RIASEC, fichas obtenidas, insignias y nivel. Nodos narrativos, textos, borradores, comprobaciones y respuestas de brújula permanecen locales. La finalización se informa únicamente desde `move` en `StudentActivityPlayer.tsx`, al llegar a `$fin`; consultar y revisar no completa actividades.

Los almacenes de Camino y aventura separan sus claves API con `.api` y por cuenta. Descubrimiento guarda preferencias por cuenta y revelación de intereses por cuenta y `calculado_en`. Recargar mantiene el estado remoto y los borradores locales. No versiones `.env`, `.env.local` ni bases `*.db`.

## Verificar

```powershell
npm run build
npm run lint
npm test
```

Las pruebas de integración están en `tests/servidor-*.test.mjs` y usan los ocho fixtures de `tests/fixtures/servidor/`, cuyos contratos proceden de ov_backend.

**Cierre F6 · 2026-10-07:** HU-073 y HU-074 corregidas y revalidadas; las catorce HU del recorrido F7 pasan en el alcance comprobado. Build y lint pasan. Hay 356 pruebas: 340 pasan y solo quedan las 16 fallas previas, con los mismos nombres y líneas. El backend pasa 1006 pruebas con evaluador falso. Consulta [el informe por HU y las evidencias](docs/student-experience/informe-f7.md); la aprobación formal de la iteración corresponde al usuario.
