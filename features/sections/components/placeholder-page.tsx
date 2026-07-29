import { CircleDashed, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"

type PlaceholderPageProps = {
  eyebrow: string
  title: string
  description: string
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-1 rounded-[32px] border p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
              <CircleDashed className="size-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-white">
                Espacio preparado
              </h3>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Esta vista ya cuelga del shell principal, comparte navegación, estilos y
                arquitectura con el resto del producto, y queda lista para sumar lógica en el
                próximo PR.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-dashed border-white/10 p-5">
              <p className="text-sm font-medium text-white">Estado base</p>
              <p className="mt-2 text-sm text-muted-foreground">
                UI consistente, sin lógica de negocio todavía.
              </p>
            </div>
            <div className="rounded-[24px] border border-dashed border-white/10 p-5">
              <p className="text-sm font-medium text-white">Próxima capa</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Datos reales, componentes de dominio y workflows.
              </p>
            </div>
          </div>
        </section>

        <aside className="surface-1 rounded-[32px] border p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06]">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Sin deuda accidental</p>
              <p className="text-sm text-muted-foreground">Ruta creada con base reutilizable.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-[22px] border border-white/6 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Layout compartido
            </div>
            <div className="rounded-[22px] border border-white/6 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Sidebar persistente
            </div>
            <div className="rounded-[22px] border border-white/6 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Listo para features
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}
