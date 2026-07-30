import { ChevronDown, FolderOpenDot } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { CreateTaskForm } from "@/features/areas/components/create-task-form"
import { PlanTaskForTodayForm } from "@/features/areas/components/plan-task-for-today-form"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { AreaWorkspace } from "@/features/areas/repository"
import { areaPageConfig, type AreaPageSlug } from "@/features/areas/config"
import { isDateToday } from "@/lib/dates"
import { cn } from "@/lib/utils"

const priorityLabels: Record<string, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
}

const statusLabels: Record<string, string> = {
  backlog: "Pendiente",
  active: "Activo",
  paused: "En pausa",
  done: "Terminado",
}

function ProjectSection({ project, path }: {
  project: AreaWorkspace["containers"][number]["projects"][number]
  path: string
}) {
  const completed = project.tasks.filter((task) => task.completed).length
  const percent = project.tasks.length ? Math.round((completed / project.tasks.length) * 100) : 0

  return (
    <details open className="group border-t border-white/8 first:border-t-0">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{project.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{completed}/{project.tasks.length} tareas · {percent}%</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground">{statusLabels[project.status] ?? project.status}</span>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{priorityLabels[project.priority] ?? project.priority}</span>
        </div>
      </summary>

      <div className="pb-5 pl-0 sm:pl-7">
        {project.description ? <p className="mb-4 text-sm leading-6 text-muted-foreground">{project.description}</p> : null}
        {project.tasks.length ? (
          <div className="divide-y divide-white/8 rounded-xl bg-white/[0.02] px-3">
            {project.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3">
                <TaskToggleForm taskId={task.id} completed={task.completed} path={path} />
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className={cn("text-sm leading-6 text-white", task.completed && "text-muted-foreground line-through")}>{task.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{priorityLabels[task.priority]}</span>
                    {!task.completed ? <PlanTaskForTodayForm taskId={task.id} path={path} plannedForToday={isDateToday(task.plannedDate)} /> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="py-4 text-sm text-muted-foreground">Todavía no hay tareas.</p>}
        <div className="mt-4"><CreateTaskForm projectId={project.id} path={path} /></div>
      </div>
    </details>
  )
}

export function AreaWorkspaceView({ slug, workspace }: { slug: AreaPageSlug; workspace: AreaWorkspace | null }) {
  const config = areaPageConfig[slug]
  const path = `/${slug}`
  const projects = workspace?.containers.reduce((sum, container) => sum + container.projects.length, 0) ?? 0
  const tasks = workspace?.containers.reduce((sum, container) => sum + container.projects.reduce((inner, project) => inner + project.tasks.length, 0), 0) ?? 0

  return (
    <PageShell eyebrow="Área" title={config.title} description={config.description}
      actions={workspace ? <div className="flex gap-5 text-sm text-muted-foreground"><span><b className="text-white">{projects}</b> proyectos</span><span><b className="text-white">{tasks}</b> tareas</span></div> : null}>
      {!workspace ? (
        <section className="surface-1 rounded-2xl border p-8 text-center">
          <p className="font-medium text-white">No pudimos cargar esta área.</p>
          <p className="mt-2 text-sm text-muted-foreground">Revisá la conexión de datos e intentá nuevamente.</p>
        </section>
      ) : workspace.containers.length === 0 ? (
        <section className="surface-1 rounded-2xl border p-8 text-center">
          <p className="font-medium text-white">Esta área todavía está vacía.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {workspace.containers.map((container) => (
            <section key={container.id} className="surface-1 rounded-2xl border px-4 sm:px-6">
              <div className="flex items-start gap-3 py-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><FolderOpenDot className="size-4" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                  {container.description ? <p className="mt-1 text-sm text-muted-foreground">{container.description}</p> : null}
                </div>
              </div>
              <div>
                {container.projects.length ? container.projects.map((project) => <ProjectSection key={project.id} project={project} path={path} />) : <p className="border-t border-white/8 py-6 text-sm text-muted-foreground">No hay proyectos en este espacio.</p>}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  )
}
