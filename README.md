# Life OS

Base del proyecto para un sistema operativo personal enfocado en cuatro acciones:

- Capturar
- Organizar
- Planificar
- Ejecutar

## Stack

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons
- Drizzle ORM
- PostgreSQL (Neon)

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm db:generate
pnpm db:studio
```

## Estructura

```text
app/
components/
features/
db/
lib/
hooks/
types/
```

## Base incluida en este PR

- Shell principal con sidebar colapsable y persistente
- Dashboard visual base
- Rutas principales creadas
- Tema oscuro cerrado desde el inicio
- Drizzle configurado con schema inicial y migración generada

## Variables de entorno

Crear `.env` a partir de `.env.example`:

```bash
DATABASE_URL="postgresql://user:password@host.neon.tech/lifeos?sslmode=require"
```
