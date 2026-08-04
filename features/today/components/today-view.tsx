import Link from "next/link"
import { CalendarCheck2, Clock3, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { TaskDetailsEditor } from "@/features/areas/components/task-details-editor"
import { TaskPlanningControls } from "@/features/areas/components/task-planning-controls"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { TodayTask } from "@/features/today/repository"
import { EmptyState } from "@/components/ui/empty-state"
import { priorityLabels } from "@/types/domain"

const overdueDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
})

function TodayTaskSection({
  title,
  description,
  tasks,
  path,
  empty,
  showDueLabel = false,
}: {
  title: string
  description: string
  tasks: TodayTask[]
  path: string
  empty: React.ReactNode
  showDueLabel?: boolean
}) {
  return (
    <section className="surface-1 rounded-[30px] border p-5 sm:p-7">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1">
          <p className="content-title">{title}</p>
          <p className="context-line">{description}</p>
        </div>
        <div className="meta-row">
          <span className="meta-item">
            <b className="text-white">{tasks.length}</b> activas
          </span>
        </div>
      </div>

      {tasks.length ? (
        <div className="mt-7 divide-y divide-white/[0.06]">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="relative flex items-start gap-4 py-5 pl-3 transition-all duration-200 first:pt-0 last:pb-0 motion-reduce:transition-none"
            >
              <span
                className={`absolute bottom-4 left-0 top-4 w-0.5 rounded-full ${task.priority === "urgent" ? "bg-red-300/70" : task.priority === "high" ? "bg-amber-200/70" : "bg-primary/45"}`}
                aria-hidden="true"
              />
              <TaskToggleForm taskId={task.id} completed={task.completed} path={path} />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="content-title">{task.title}</p>
                <Link
                  href={task.originHref}
                  className="context-line inline-flex min-h-7 items-center transition hover:text-white"
                >
                  {task.area.name} · {task.container.name} · {task.project.title}
                </Link>
                <div className="meta-row">
                  <span className="meta-item">{priorityLabels[task.priority]}</span>
                  {showDueLabel && task.plannedDate ? (
                    <span className="meta-item">
                      Vencida desde {overdueDateFormatter.format(task.plannedDate)}
                    </span>
                  ) : null}
                </div>
                <TaskDetailsEditor taskId={task.id} path={path} title={task.title} />
                <TaskPlanningControls
                  key={`${task.id}-${task.plannedDate?.toISOString() ?? "none"}-${path}`}
                  taskId={task.id}
                  path={path}
                  plannedDate={task.plannedDate}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        empty
      )}
    </section>
  )
}

export function TodayView({
  board,
}: {
  board: {
    todayTasks: TodayTask[]
    overdueTasks: TodayTask[]
    progress: { completed: number; total: number }
  }
}) {
  const percent = board.progress.total
    ? Math.round((board.progress.completed / board.progress.total) * 100)
    : 0

  return (
    <PageShell eyebrow="Hoy" title="Hacé espacio para lo importante." description="Solo aparece lo que ya elegiste para esta jornada.">
      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-6">
          <TodayTaskSection
            title="Para hoy"
            description="Lo que ya decidiste ejecutar este martes 4 de agosto de 2026."
            tasks={board.todayTasks}
            path="/today"
            empty={
              <EmptyState
                icon={CalendarCheck2}
                title="La jornada está despejada."
                description="Planificá desde un área cuando quieras sumar foco."
                action={{ href: "/work", label: "Elegir una tarea" }}
              />
            }
          />

          <TodayTaskSection
            title="Arrastradas"
            description="Trabajo activo que quedó en deuda y conviene reubicar o cerrar."
            tasks={board.overdueTasks}
            path="/today"
            showDueLabel
            empty={
              <div className="flex items-center gap-3 rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.015] px-5 py-6">
                <Clock3 className="size-4 text-primary/85" />
                <p className="text-sm text-muted-foreground">
                  No hay tareas arrastradas. El sistema está al día.
                </p>
              </div>
            }
          />
        </div>

        <aside className="surface-1 h-fit rounded-[30px] border p-6">
          {percent === 100 && board.progress.total > 0 ? (
            <Sparkles className="size-6 animate-pulse text-primary/90 motion-reduce:animate-none" />
          ) : null}
          <p className="mt-2 text-sm font-medium text-white">
            {percent === 100 && board.progress.total > 0 ? "Día completado" : "Progreso del día"}
          </p>
          <p className="mt-5 text-4xl font-semibold tracking-tight text-white">{percent}%</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.045]">
            <div className="h-full rounded-full bg-primary/80 transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="meta-row mt-4">
            <span className="meta-item"><b className="text-white">{board.progress.completed}</b> completadas</span>
            <span className="meta-item"><b className="text-white">{board.progress.total}</b> totales</span>
          </div>
          <div className="meta-row mt-3">
            <span className="meta-item">
              <b className="text-white">{board.todayTasks.length}</b> para hoy
            </span>
            <span className="meta-item">
              <b className="text-white">{board.overdueTasks.length}</b> arrastradas
            </span>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}
