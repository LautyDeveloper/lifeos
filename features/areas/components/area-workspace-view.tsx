import { BriefcaseBusiness, FolderOpenDot, ListTodo, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { CreateTaskForm } from "@/features/areas/components/create-task-form"
import { PlanTaskForTodayForm } from "@/features/areas/components/plan-task-for-today-form"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import type { AreaWorkspace } from "@/features/areas/repository"
import { areaPageConfig, type AreaPageSlug } from "@/features/areas/config"
import { isDateToday } from "@/lib/dates"
import { cn } from "@/lib/utils"

function TaskList({
  tasks,
  path,
}: {
  tasks: AreaWorkspace["containers"][number]["projects"][number]["tasks"]
  path: string
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-[22px] border border-dashed border-white/10 px-4 py-6 text-sm text-muted-foreground">
        Este proyecto todavía no tiene tareas. Sumá la primera para empezar a ejecutar.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-start gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-4"
        >
          <TaskToggleForm taskId={task.id} completed={task.completed} path={path} />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm leading-7 text-white",
                task.completed && "text-muted-foreground line-through"
              )}
            >
              {task.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span>{task.completed ? "Completada" : "Activa"}</span>
              <span>{task.priority}</span>
              {!task.completed ? (
                <PlanTaskForTodayForm
                  taskId={task.id}
                  path={path}
                  plannedForToday={isDateToday(task.plannedDate)}
                />
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectCard({
  project,
  path,
}: {
  project: AreaWorkspace["containers"][number]["projects"][number]
  path: string
}) {
  return (
    <article className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold tracking-tight text-white">
            {project.title}
          </h4>
          {project.description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {project.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="rounded-full border border-white/8 px-3 py-1">
            {project.status}
          </span>
          <span className="rounded-full border border-white/8 px-3 py-1">
            {project.priority}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        <TaskList tasks={project.tasks} path={path} />
        <CreateTaskForm projectId={project.id} path={path} />
      </div>
    </article>
  )
}

function ContainerCard({
  container,
  path,
}: {
  container: AreaWorkspace["containers"][number]
  path: string
}) {
  return (
    <section className="surface-1 rounded-[32px] border p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
          <FolderOpenDot className="size-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            {container.name}
          </h3>
          {container.description ? (
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {container.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {container.projects.length > 0 ? (
          container.projects.map((project) => (
            <ProjectCard key={project.id} project={project} path={path} />
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-sm text-muted-foreground">
            Este container todavía no tiene proyectos visibles.
          </div>
        )}
      </div>
    </section>
  )
}

export function AreaWorkspaceView({
  slug,
  workspace,
}: {
  slug: AreaPageSlug
  workspace: AreaWorkspace | null
}) {
  const config = areaPageConfig[slug]
  const path = `/${slug}`

  return (
    <PageShell
      eyebrow={config.eyebrow}
      title={config.title}
      description={config.description}
    >
      {workspace ? (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            {workspace.containers.length > 0 ? (
              workspace.containers.map((container) => (
                <ContainerCard key={container.id} container={container} path={path} />
              ))
            ) : (
              <section className="surface-1 rounded-[32px] border p-6 md:p-8">
                <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center">
                  <p className="text-base font-medium text-white">
                    Esta área todavía no tiene containers activos.
                  </p>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
                    La estructura está lista. Cuando haya contenido real, aparecerá acá con el mismo layout.
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <BriefcaseBusiness className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Estado del área</p>
                  <p className="text-sm text-muted-foreground">Superficie operativa mínima.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Containers
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {workspace?.containers.length ?? 0}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Proyectos
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {workspace?.containers.reduce((sum, container) => sum + container.projects.length, 0) ?? 0}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Tareas
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {workspace?.containers.reduce(
                      (sum, container) =>
                        sum +
                        container.projects.reduce(
                          (projectSum, project) => projectSum + project.tasks.length,
                          0
                        ),
                      0
                    ) ?? 0}
                  </p>
                </div>
              </div>
            </section>

            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <ListTodo className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Cómo usar esta vista</p>
                  <p className="text-sm text-muted-foreground">
                    Todo en una sola jerarquía, sin pantallas extra.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                  Escaneá containers y proyectos rápido.
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                  Completá tareas sin salir del contexto.
                </div>
                <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                  Sumá tareas nuevas directo dentro de cada proyecto.
                </div>
              </div>
            </section>

            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Siguiente capa</p>
                  <p className="text-sm text-muted-foreground">Planning y Today vivirán encima de esto.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      ) : (
        <section className="surface-1 rounded-[32px] border p-6 md:p-8">
          <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center">
            <p className="text-base font-medium text-white">
              No encontramos esta área en la base actual.
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
              Verificá seeds o configuración del entorno. La vista está preparada, pero no hay un área compatible cargada.
            </p>
          </div>
        </section>
      )}
    </PageShell>
  )
}
