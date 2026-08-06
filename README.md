# Life OS

Sistema operativo personal para capturar lo que aparece, organizarlo con contexto, decidir cuándo merece atención y ejecutar con foco.

## Flujos principales

- **Capturas:** entrada rápida para ideas y pendientes todavía sin destino.
- **Áreas:** Trabajo, Dev, Estudio y Salud organizan contenedores, proyectos y tareas.
- **Hoy:** reúne únicamente tareas ya planificadas para la jornada.
- **Biblioteca:** conserva notas y referencias fuera del flujo operativo.
- **Estacionados:** aparta proyectos del foco sin eliminarlos.

La aplicación funciona sin base de datos para explorar el shell, la navegación y los estados de configuración. Los flujos operativos requieren PostgreSQL.

## Stack

- Next.js 16 con App Router y React 19
- TypeScript y Tailwind CSS v4
- Base UI, shadcn/ui y Lucide Icons
- Drizzle ORM y PostgreSQL (Neon)
- Playwright y axe para smoke tests de interfaz

## Arquitectura

```text
app/          rutas, layouts y estilos globales
components/   shell, patrones compartidos y primitives de UI
features/     dominio, repositorios, acciones y vistas por funcionalidad
db/           schema, migraciones y seed
hooks/        estado reutilizable del cliente
lib/          fechas y utilidades transversales
types/        contratos compartidos
tests/e2e/    smoke tests sin dependencia de base de datos
```

Las lecturas de datos viven en repositorios por feature y las mutaciones en server actions validadas con Zod. Las reglas de estado y prioridad se comparten desde `types/domain.ts`.

## Desarrollo local

El proyecto fija pnpm 8 para mantener el lockfile reproducible.

```bash
corepack enable
corepack prepare pnpm@8.15.9 --activate
pnpm install
cp .env.example .env
pnpm dev
```

Para conectar PostgreSQL:

```dotenv
DATABASE_URL=""
OPENAI_API_KEY="" # opcional: habilita sugerencias para procesar el inbox
OPENAI_MODEL="gpt-5.5" # opcional
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEMO_READ_ONLY="false"
```

Luego se puede preparar una base de desarrollo con:

```bash
pnpm db:migrate
pnpm db:seed
```

## Demo reproducible

Usá una base Neon dedicada. El reset nunca toma `DATABASE_URL` y exige una confirmación explícita porque elimina todo el contenido de `DEMO_DATABASE_URL`.

```dotenv
DEMO_DATABASE_URL="postgresql://.../lifeos_demo?sslmode=require"
DEMO_RESET_CONFIRM="RESET_LIFE_OS_DEMO"
```

```bash
pnpm db:demo:reset
pnpm dev
```

Preflight: verificá que `/api/health` responda `status: ok`, que Inicio muestre tareas para hoy y vencidas, y que Capturas tenga elementos pendientes. `OPENAI_API_KEY` es opcional: si falta o el proveedor falla, el procesamiento manual sigue disponible.

### Guion de cinco minutos

1. **Inicio:** mostrar el pulso general y crear una captura.
2. **Capturas:** convertirla en tarea, con IA real o manualmente.
3. **Review:** activar un proyecto de backlog y planificar una tarea.
4. **Hoy:** completar una tarea y mostrar progreso, vencidas y replanificación.
5. **Biblioteca y Estacionados:** cerrar con contexto persistente y trabajo fuera de foco.

## Deploy de portfolio en Vercel

Conectá el repositorio a Vercel y una base Neon dedicada ya preparada con `db:demo:reset`. Configurá `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` y `DEMO_READ_ONLY=true`. La demo pública conserva búsqueda y navegación, muestra un aviso de solo lectura y bloquea escrituras también en el servidor. Las sugerencias con IA quedan deshabilitadas en este modo para evitar consumo público de API.

No ejecutes `db:demo:reset` desde el deploy ni apuntes `DEMO_DATABASE_URL` a una base personal.

## Scripts

```bash
pnpm dev                # servidor de desarrollo
pnpm build              # build de producción
pnpm lint               # reglas de ESLint
pnpm typecheck          # validación de TypeScript
pnpm db:generate        # generar migraciones de Drizzle
pnpm db:migrate         # aplicar migraciones
pnpm db:seed            # cargar datos locales de ejemplo
pnpm db:demo:reset      # reconstruir una base dedicada de demo
pnpm db:studio          # inspeccionar la base
pnpm test:e2e:install   # instalar Chromium para Playwright
pnpm test:e2e           # smoke tests responsive y axe, sin DATABASE_URL
pnpm test:e2e:readonly  # contrato de la demo pública sin escrituras
```

Los smoke tests arrancan la aplicación con `DATABASE_URL` vacío deliberadamente. Validan el shell, la navegación responsive, el sheet móvil, la persistencia del sidebar y la ausencia de problemas críticos o serios detectados por axe. Los flujos con datos se revisan con el seed local.

Las sugerencias del inbox tienen timeout y reintento acotado. Si OpenAI no está configurado o no responde, el procesamiento manual sigue disponible y la captura no se modifica.
