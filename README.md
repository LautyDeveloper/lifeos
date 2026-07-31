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
DATABASE_URL="postgresql://user:password@host.neon.tech/lifeos?sslmode=require"
```

Luego se puede preparar una base de desarrollo con:

```bash
pnpm db:migrate
pnpm db:seed
```

## Scripts

```bash
pnpm dev                # servidor de desarrollo
pnpm build              # build de producción
pnpm lint               # reglas de ESLint
pnpm typecheck          # validación de TypeScript
pnpm db:generate        # generar migraciones de Drizzle
pnpm db:migrate         # aplicar migraciones
pnpm db:seed            # cargar datos locales de ejemplo
pnpm db:studio          # inspeccionar la base
pnpm test:e2e:install   # instalar Chromium para Playwright
pnpm test:e2e           # smoke tests responsive y axe, sin DATABASE_URL
```

Los smoke tests arrancan la aplicación con `DATABASE_URL` vacío deliberadamente. Validan el shell, la navegación responsive, el sheet móvil, la persistencia del sidebar y la ausencia de problemas críticos o serios detectados por axe. Los flujos con datos se revisan con el seed local.
