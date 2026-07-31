import Link from "next/link"
import { CalendarCheck2, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { TaskPlanningControls } from "@/features/areas/components/task-planning-controls"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { TodayTask } from "@/features/today/repository"
import { EmptyState } from "@/components/ui/empty-state"
import { priorityLabels } from "@/types/domain"

export function TodayView({ tasks, progress }: { tasks: TodayTask[]; progress: { completed: number; total: number } }) {
  const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 0

  return (
    <PageShell eyebrow="Hoy" title="Hacé espacio para lo importante." description="Solo aparece lo que ya elegiste para esta jornada.">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <section className="surface-1 rounded-[30px] border p-5 sm:p-7">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div className="space-y-1">
              <p className="content-title">Pendientes de hoy</p>
              <div className="meta-row">
                <span className="meta-item"><b className="text-white">{tasks.length}</b> activas</span>
              </div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/75">Ordenadas por prioridad</span>
          </div>
          {tasks.length ? (
            <div className="mt-7 divide-y divide-white/[0.06]">
              {tasks.map((task) => (
                <article key={task.id} className="relative flex items-start gap-4 py-5 pl-3 transition-all duration-200 first:pt-0 last:pb-0 motion-reduce:transition-none">
                  <span className={`absolute bottom-4 left-0 top-4 w-0.5 rounded-full ${task.priority === "urgent" ? "bg-red-300/70" : task.priority === "high" ? "bg-amber-200/70" : "bg-primary/45"}`} aria-hidden="true" />
                  <TaskToggleForm taskId={task.id} completed={task.completed} path="/today" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="content-title">{task.title}</p>
                    <Link href={task.originHref} className="context-line inline-flex min-h-7 items-center transition hover:text-white">{task.area.name} · {task.container.name} · {task.project.title}</Link>
                    <div className="meta-row">
                      <span className="meta-item">{priorityLabels[task.priority]}</span>
                    </div>
                    <TaskPlanningControls
                      key={`${task.id}-${task.plannedDate?.toISOString() ?? "none"}`}
                      taskId={task.id}
                      path="/today"
                      plannedDate={task.plannedDate}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarCheck2} title="La jornada está despejada." description="Planificá desde un área cuando quieras sumar foco." action={{ href: "/work", label: "Elegir una tarea" }} />
          )}
        </section>

        <aside className="surface-1 h-fit rounded-[30px] border p-6">
          {percent === 100 && progress.total > 0 ? <Sparkles className="size-6 animate-pulse text-primary/90 motion-reduce:animate-none" /> : null}
          <p className="mt-2 text-sm font-medium text-white">{percent === 100 && progress.total > 0 ? "Día completado" : "Progreso del día"}</p>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-white">{percent}%</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
            <div className="h-full rounded-full bg-primary/80 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="meta-row mt-4">
            <span className="meta-item"><b className="text-white">{progress.completed}</b> completadas</span>
            <span className="meta-item"><b className="text-white">{progress.total}</b> totales</span>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}
