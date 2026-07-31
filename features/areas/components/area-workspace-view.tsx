"use client"

import Link from "next/link"
import { ChevronDown, FolderOpenDot } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { PriorityBadge, StatusBadge } from "@/components/ui/badges"
import { CreateTaskForm } from "@/features/areas/components/create-task-form"
import { PauseProjectForm } from "@/features/areas/components/pause-project-form"
import { ProjectPriorityForm } from "@/features/areas/components/project-priority-form"
import { ProjectStatusForm } from "@/features/areas/components/project-status-form"
import { TaskPlanningControls } from "@/features/areas/components/task-planning-controls"
import { TaskPriorityForm } from "@/features/areas/components/task-priority-form"
import { TaskToggleForm } from "@/features/areas/components/task-toggle-form"
import { areaPageConfig, type AreaPageSlug } from "@/features/areas/config"
import type { AreaTaskFilter, AreaWorkspace } from "@/features/areas/repository"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { isDateToday } from "@/lib/dates"
import { cn } from "@/lib/utils"
import {
  canCreateTasksInProject,
  canPlanTasksInProject,
  projectStatusSectionLabels,
  type VisibleAreaProjectStatus,
} from "@/types/domain"

const projectSections: VisibleAreaProjectStatus[] = ["active", "backlog", "done"]

function ProjectSection({
  project,
  path,
  filter,
}: {
  project: AreaWorkspace["containers"][number]["projects"][number]
  path: string
  filter: AreaTaskFilter
}) {
  const storageKey = `life-os.project-open.${project.id}`
  const [open, setOpen] = useLocalStorage(storageKey, true)
  const visibleTasks = project.tasks.filter((task) =>
    filter === "completed"
      ? task.completed
      : filter === "today"
        ? !task.completed && isDateToday(task.plannedDate)
        : !task.completed
  )
  const completed = project.tasks.filter((task) => task.completed).length
  const percent = project.tasks.length ? Math.round((completed / project.tasks.length) * 100) : 0
  const canPlanTasks = canPlanTasksInProject(project.status)
  const canCreateTasks = canCreateTasksInProject(project.status)

  return (
    <details
      id={`project-${project.id}`}
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open
        setOpen(next)
      }}
      className="group scroll-mt-24 border-t border-white/8 first:border-t-0"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 py-4 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-white">{project.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {completed}/{project.tasks.length} tareas · {percent}%
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          <PauseProjectForm projectId={project.id} path={path} />
        </div>
      </summary>

      <div className="space-y-4 pb-5 pl-0 sm:pl-7">
        {project.description ? (
          <p className="text-sm leading-6 text-muted-foreground">{project.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <ProjectStatusForm
            key={`${project.id}-${project.status}`}
            projectId={project.id}
            path={path}
            status={project.status as VisibleAreaProjectStatus}
          />
          <ProjectPriorityForm
            key={`${project.id}-${project.priority}`}
            projectId={project.id}
            path={path}
            priority={project.priority}
          />
        </div>

        {visibleTasks.length ? (
          <div className="divide-y divide-white/8 rounded-xl bg-white/[0.02] px-3">
            {visibleTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-3">
                <TaskToggleForm taskId={task.id} completed={task.completed} path={path} />
                <div className="min-w-0 flex-1 pt-1.5">
                  <p
                    className={cn(
                      "text-sm leading-6 text-white",
                      task.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <TaskPriorityForm
                      key={`${task.id}-${task.priority}`}
                      taskId={task.id}
                      path={path}
                      priority={task.priority}
                    />
                  </div>
                  {!task.completed && canPlanTasks ? (
                    <TaskPlanningControls
                      key={`${task.id}-${task.plannedDate?.toISOString() ?? "none"}`}
                      taskId={task.id}
                      path={path}
                      plannedDate={task.plannedDate}
                    />
                  ) : null}
                  {!task.completed && !canPlanTasks ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Activá el proyecto para planificar estas tareas.
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">No hay tareas para este filtro.</p>
        )}

        {canCreateTasks ? (
          <div>
            <CreateTaskForm projectId={project.id} path={path} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este proyecto ya está terminado. Si necesitás seguir sumando trabajo, volvelo a activo o backlog.
          </p>
        )}
      </div>
    </details>
  )
}

function ProjectGroup({
  title,
  emptyMessage,
  projects,
  path,
  filter,
}: {
  title: string
  emptyMessage: string
  projects: AreaWorkspace["containers"][number]["projects"]
  path: string
  filter: AreaTaskFilter
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-medium text-white">{title}</p>
        <span className="text-xs text-muted-foreground">{projects.length}</span>
      </div>
      <div className="border-t border-white/8 px-4">
        {projects.length ? (
          projects.map((project) => (
            <ProjectSection key={project.id} project={project} path={path} filter={filter} />
          ))
        ) : (
          <p className="py-5 text-sm text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    </div>
  )
}

export function AreaWorkspaceView({
  slug,
  workspace,
  filter = "active",
}: {
  slug: AreaPageSlug
  workspace: AreaWorkspace | null
  filter?: AreaTaskFilter
}) {
  const config = areaPageConfig[slug]
  const path = `/${slug}`
  const projects =
    workspace?.containers.reduce((sum, container) => sum + container.projects.length, 0) ?? 0
  const tasks =
    workspace?.containers.reduce(
      (sum, container) =>
        sum + container.projects.reduce((inner, project) => inner + project.tasks.length, 0),
      0
    ) ?? 0

  return (
    <PageShell
      eyebrow="Área"
      title={config.title}
      description={config.description}
      actions={
        workspace ? (
          <div className="flex gap-5 text-sm text-muted-foreground">
            <span>
              <b className="text-white">{projects}</b> proyectos
            </span>
            <span>
              <b className="text-white">{tasks}</b> tareas
            </span>
          </div>
        ) : null
      }
    >
      {!workspace ? (
        <section className="surface-1 rounded-2xl border p-8 text-center">
          <p className="font-medium text-white">No pudimos cargar esta área.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisá la conexión de datos e intentá nuevamente.
          </p>
        </section>
      ) : workspace.containers.length === 0 ? (
        <section className="surface-1 rounded-2xl border p-8 text-center">
          <p className="font-medium text-white">Esta área todavía está vacía.</p>
        </section>
      ) : (
        <div className="space-y-4">
          <nav aria-label="Filtrar tareas" className="flex flex-wrap gap-2">
            {([
              ["active", "Activas"],
              ["today", "Para hoy"],
              ["completed", "Completadas"],
            ] as const).map(([value, label]) => (
              <Link
                key={value}
                href={`${path}?filter=${value}`}
                aria-current={filter === value ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl border px-4 text-sm",
                  filter === value
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-white/8 text-muted-foreground hover:text-white"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          {workspace.containers.map((container) => {
            const groupedProjects = projectSections.reduce(
              (accumulator, status) => {
                accumulator[status] = container.projects.filter((project) => project.status === status)
                return accumulator
              },
              {
                active: [] as AreaWorkspace["containers"][number]["projects"],
                backlog: [] as AreaWorkspace["containers"][number]["projects"],
                done: [] as AreaWorkspace["containers"][number]["projects"],
              }
            )

            return (
              <section key={container.id} className="surface-1 rounded-2xl border px-4 py-5 sm:px-6">
                <div className="flex items-start gap-3 pb-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FolderOpenDot className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                    {container.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{container.description}</p>
                    ) : null}
                  </div>
                </div>
                {container.projects.length ? (
                  <div className="space-y-3">
                    {projectSections.map((status) => (
                      <ProjectGroup
                        key={status}
                        title={projectStatusSectionLabels[status]}
                        emptyMessage={`No hay proyectos ${projectStatusSectionLabels[status].toLowerCase()} en este espacio.`}
                        projects={groupedProjects[status]}
                        path={path}
                        filter={filter}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="border-t border-white/8 pt-6 text-sm text-muted-foreground">
                    No hay proyectos en este espacio.
                  </p>
                )}
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
