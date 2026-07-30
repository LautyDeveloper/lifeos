import { CalendarRange, CheckCircle2, Layers3, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { TodayTask } from "@/features/today/repository"

function TodayTaskCard({ task }: { task: TodayTask }) {
  return (
    <article className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <TaskToggleForm taskId={task.id} completed={task.completed} path="/today" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <p className="text-lg font-semibold tracking-tight text-white">{task.title}</p>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                Hoy
              </span>
              <span className="rounded-full border border-white/8 px-3 py-1">
                {task.area.name}
              </span>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-background/40 px-4 py-3 text-sm text-muted-foreground">
            {task.container.name} / {task.project.title}
          </div>
        </div>
      </div>
    </article>
  )
}

export function TodayView({ tasks }: { tasks: TodayTask[] }) {
  return (
    <PageShell
      eyebrow="Hoy"
      title="Ejecutá lo que ya decidiste."
      description="Acá vive solamente lo planificado para hoy. Sin reordenar, sin repensar, sin ruido."
    >
      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => <TodayTaskCard key={task.id} task={task} />)
          ) : (
            <section className="surface-1 rounded-[32px] border p-6 md:p-8">
              <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center">
                <p className="text-base font-medium text-white">
                  Hoy no tiene tareas planificadas.
                </p>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
                  Eso no es un problema. Cuando planifiques desde tus proyectos, lo importante va a aparecer acá.
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <CalendarRange className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Carga del día</p>
                <p className="text-sm text-muted-foreground">Solo lo que toca ejecutar hoy.</p>
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Tareas activas
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{tasks.length}</p>
            </div>
          </section>

          <section className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <Layers3 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Cómo funciona</p>
                <p className="text-sm text-muted-foreground">Planificás en contexto y ejecutás acá.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Marcá tareas como “Hoy” desde Trabajo, Dev, Estudio o Salud.
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Esta vista solo reúne lo planificado para la jornada actual.
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                Al completar una tarea, desaparece de acá para dejar foco limpio.
              </div>
            </div>
          </section>

          <section className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Loop mínimo</p>
                <p className="text-sm text-muted-foreground">Planificar y ejecutar ya viven en el sistema.</p>
              </div>
            </div>
          </section>

          <section className="surface-1 rounded-[32px] border p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Criterio</p>
                <p className="text-sm text-muted-foreground">Hoy es ejecución, no organización.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </PageShell>
  )
}
