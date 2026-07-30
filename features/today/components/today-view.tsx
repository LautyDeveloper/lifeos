import { CalendarCheck2 } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { TodayTask } from "@/features/today/repository"

const priorityLabels = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
}

const priorityStyles = {
  urgent: "bg-destructive/12 text-red-300",
  high: "bg-amber-400/10 text-amber-200",
  medium: "bg-primary/10 text-primary",
  low: "bg-white/[0.04] text-muted-foreground",
}

export function TodayView({ tasks, progress }: { tasks: TodayTask[]; progress: { completed: number; total: number } }) {
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0

  return (
    <PageShell eyebrow="Hoy" title="Hacé espacio para lo importante." description="Solo aparece lo que ya elegiste para esta jornada.">
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.55fr]">
        <section className="surface-1 rounded-2xl border p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm font-medium text-white">{tasks.length} pendientes</p>
            <span className="text-xs text-muted-foreground">Ordenadas por prioridad</span>
          </div>
          {tasks.length ? (
            <div className="divide-y divide-white/8">
              {tasks.map((task) => (
                <article key={task.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <TaskToggleForm taskId={task.id} completed={task.completed} path="/today" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-6 text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.area.name} · {task.container.name} · {task.project.title}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <CalendarCheck2 className="mx-auto size-7 text-primary" />
              <p className="mt-4 font-medium text-white">La jornada está despejada.</p>
              <p className="mt-2 text-sm text-muted-foreground">Planificá desde un área cuando quieras sumar foco.</p>
            </div>
          )}
        </section>

        <aside className="surface-1 h-fit rounded-2xl border p-5">
          <p className="text-sm font-medium text-white">Progreso del día</p>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-white">{percent}%</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{progress.completed} de {progress.total} completadas</p>
        </aside>
      </div>
    </PageShell>
  )
}
