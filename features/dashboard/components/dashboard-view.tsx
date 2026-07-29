import { ArrowUpRight, LayoutGrid, TimerReset, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageShell } from "@/components/shared/page-shell"

const summaryCards = [
  {
    label: "Inbox listo",
    value: "0 items",
    detail: "Espacio reservado para capturas pendientes.",
  },
  {
    label: "Plan del día",
    value: "Vacío",
    detail: "Zona preparada para decidir qué ejecutar hoy.",
  },
  {
    label: "Proyectos activos",
    value: "0 activos",
    detail: "El resumen estratégico vivirá acá.",
  },
]

const quickActions = [
  { title: "Capturar idea", description: "Entrada rápida para vaciar la mente." },
  { title: "Revisar hoy", description: "Lo importante del día, sin ruido." },
  { title: "Abrir biblioteca", description: "Recursos y referencias a un clic." },
]

export function DashboardView() {
  return (
    <PageShell
      eyebrow="Dashboard"
      title="Buenas noches."
      description="Tu sistema está listo para capturar, organizar, planificar y ejecutar sin fricción. Todo acá es intencional: menos opciones, más claridad."
    >
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="surface-1 overflow-hidden rounded-[32px] border p-6 md:p-8">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Zap className="size-3.5" />
                  Base del producto lista para evolucionar
                </div>
                <div className="space-y-3">
                  <h3 className="max-w-xl text-2xl font-semibold tracking-tight text-balance text-white md:text-3xl">
                    Un sistema operativo personal, no otro gestor de tareas.
                  </h3>
                  <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                    El dashboard ya tiene un lenguaje visual, un shell consistente y bloques
                    preparados para futuras métricas, workflows y decisiones del día.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline">
                  Explorar shell
                  <ArrowUpRight className="size-4" />
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Ver navegación
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {summaryCards.map((card) => (
                <article key={card.label} className="surface-2 rounded-[24px] border p-5">
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-6 text-2xl font-semibold tracking-tight text-white">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {card.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <article className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <LayoutGrid className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Accesos rápidos</p>
                <p className="text-sm text-muted-foreground">Acciones frecuentes, sin ruido.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {quickActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-[22px] border border-white/6 bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-medium text-white">{action.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <TimerReset className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Métricas futuras</p>
                <p className="text-sm text-muted-foreground">Reservado para visibilidad real.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-8 text-sm text-muted-foreground">
                Tendencias semanales
              </div>
              <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-8 text-sm text-muted-foreground">
                Distribución por áreas
              </div>
              <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-8 text-sm text-muted-foreground">
                Ritmo de ejecución
              </div>
            </div>
          </article>
        </section>
      </div>
    </PageShell>
  )
}
