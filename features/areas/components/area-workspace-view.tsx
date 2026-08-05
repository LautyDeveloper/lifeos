"use client"

import Link from "next/link"
import { ChevronDown, FolderOpenDot } from "lucide-react"

import { SectionHeading } from "@/components/shared/content-patterns"
import { PageShell } from "@/components/shared/page-shell"
import { PriorityBadge, StatusBadge } from "@/components/ui/badges"
import { CreateProjectForm } from "@/features/areas/components/create-project-form"
import { CreateTaskForm } from "@/features/areas/components/create-task-form"
import { PauseProjectForm } from "@/features/areas/components/pause-project-form"
import { ProjectArchiveActions } from "@/features/areas/components/project-archive-actions"
import { ProjectDetailsEditor } from "@/features/areas/components/project-details-editor"
import { TaskDetailsEditor } from "@/features/areas/components/task-details-editor"
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
import {
  AreaOperationalNotesOverview,
  ContainerNotesSection,
  ProjectNotesSection,
  TaskNotesSection,
} from "@/features/operational-notes/components/operational-notes-section"

const projectSections: VisibleAreaProjectStatus[] = ["active", "backlog", "done"]

type AreaProject = AreaWorkspace["containers"][number]["projects"][number]

function filterTasks(project: AreaProject, filter: AreaTaskFilter) {
  return project.tasks.filter((task) =>
    filter === "completed"
      ? task.completed
      : filter === "today"
        ? !task.completed && isDateToday(task.plannedDate)
        : !task.completed
  )
}

function ProjectSection({
  project,
  path,
  filter,
}: {
  project: AreaProject
  path: string
  filter: AreaTaskFilter
}) {
  const storageKey = `life-os.project-open.${project.id}`
  const [open, setOpen] = useLocalStorage(storageKey, true)
  const visibleTasks = filterTasks(project, filter)
  const completed = project.tasks.filter((task) => task.completed).length
  const percent = project.tasks.length ? Math.round((completed / project.tasks.length) * 100) : 0
  const canPlanTasks = canPlanTasksInProject(project.status)
  const canCreateTasks = canCreateTasksInProject(project.status)

  return (
    <details
      id={`project-${project.id}`}
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group scroll-mt-24 border-t border-white/[0.08] first:border-t-0"
    >
      <summary className="grid min-h-24 cursor-pointer list-none gap-4 py-5 outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 gap-3">
          <ChevronDown
            className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-2.5">
            <p className="content-title text-[1.05rem]">{project.title}</p>
            {project.description ? (
              <p className="context-line max-w-2xl">{project.description}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
              <span className="chip-subtle min-h-7 px-2.5 text-[11px]">
                {completed}/{project.tasks.length} tareas
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pl-7 sm:min-w-40 sm:pl-0">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
            aria-label={`${percent}% completado`}
          >
            <div
              className="h-full rounded-full bg-primary/85 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-medium text-muted-foreground">
            {percent}%
          </span>
        </div>
      </summary>

      <div className="space-y-5 pb-6 pl-0 sm:pl-7">
        <div className="flex flex-wrap items-start justify-between gap-3 border-y border-white/[0.08] py-3">
          <ProjectDetailsEditor
            projectId={project.id}
            path={path}
            title={project.title}
            description={project.description}
            status={project.status as VisibleAreaProjectStatus}
            priority={project.priority}
          />
          <div className="flex flex-wrap items-center gap-2">
            <PauseProjectForm projectId={project.id} path={path} />
            {canCreateTasks ? <ProjectArchiveActions projectId={project.id} path={path} /> : null}
          </div>
        </div>

        <ProjectNotesSection projectId={project.id} notes={project.notes} path={path} />

        {visibleTasks.length ? (
          <div className="divide-y divide-white/[0.08]">
            {visibleTasks.map((task) => (
              <article key={task.id} className="flex items-start gap-3 py-4">
                <TaskToggleForm taskId={task.id} completed={task.completed} path={path} disabled={!canCreateTasks} />
                <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                  <p
                    className={cn(
                      "content-title",
                      task.completed && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="meta-row">
                    <span className="meta-item">
                      <PriorityBadge priority={task.priority} />
                    </span>
                    {task.plannedDate ? (
                      <span className="meta-item">
                        {new Intl.DateTimeFormat("es-AR", {
                          day: "2-digit",
                          month: "short",
                        }).format(task.plannedDate)}
                      </span>
                    ) : null}
                  </div>
                  {canCreateTasks ? (
                    <TaskDetailsEditor taskId={task.id} path={path} title={task.title} completed={task.completed} />
                  ) : null}
                  {!task.completed && canCreateTasks ? (
                    <TaskPriorityForm
                      key={`${task.id}-${task.priority}`}
                      taskId={task.id}
                      path={path}
                      priority={task.priority}
                    />
                  ) : null}
                  {!task.completed && canPlanTasks ? (
                    <TaskPlanningControls
                      key={`${task.id}-${task.plannedDate?.toISOString() ?? "none"}`}
                      taskId={task.id}
                      path={path}
                      plannedDate={task.plannedDate}
                    />
                  ) : null}
                  <TaskNotesSection taskId={task.id} notes={task.notes} path={path} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">No hay tareas para este filtro.</p>
        )}

        {canCreateTasks ? (
          <div className="border-t border-white/[0.08] pt-4">
            <CreateTaskForm projectId={project.id} path={path} />
          </div>
        ) : (
          <p className="border-t border-white/[0.08] pt-4 text-sm text-muted-foreground">
            Este proyecto está terminado. Volvelo a activo o backlog para sumar trabajo.
          </p>
        )}
      </div>
    </details>
  )
}

function ArchivedProjectSection({
  projects,
  path,
}: {
  projects: AreaWorkspace["containers"][number]["archivedProjects"]
  path: string
}) {
  const formatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  })

  return (
    <section
      aria-labelledby="status-archived"
      className="rounded-[24px] border border-dashed border-white/[0.09] bg-white/[0.015] px-4 py-5 sm:px-5"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] pb-3">
        <div className="space-y-1">
          <h4 id="status-archived" className="text-sm font-semibold text-white">
            Archivados
          </h4>
          <p className="text-sm text-muted-foreground">
            Trabajo fuera del flujo principal, pero listo para volver cuando haga falta.
          </p>
        </div>
        <span className="chip-subtle min-h-7 px-2.5 text-[11px]">{projects.length}</span>
      </div>
      <div className="mt-2">
        {projects.length ? (
          projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col gap-4 border-t border-white/[0.08] py-5 first:border-t-0"
            >
              <div className="space-y-2">
                <p className="content-title text-[1.02rem]">{project.title}</p>
                {project.description ? (
                  <p className="context-line max-w-2xl">{project.description}</p>
                ) : null}
                <div className="meta-row">
                  <span className="meta-item">
                    <StatusBadge status={project.status} />
                  </span>
                  <span className="meta-item">
                    <PriorityBadge priority={project.priority} />
                  </span>
                  <span className="meta-item">
                    {project.completedTaskCount}/{project.taskCount} tareas completadas
                  </span>
                  <span className="meta-item">
                    Archivado el {formatter.format(project.archivedAt)}
                  </span>
                </div>
              </div>
              <ProjectArchiveActions projectId={project.id} path={path} archived />
            </article>
          ))
        ) : (
          <p className="py-5 text-sm text-muted-foreground">
            No hay proyectos archivados en este espacio.
          </p>
        )}
      </div>
    </section>
  )
}

function StatusGroup({
  status,
  projects,
  path,
  filter,
}: {
  status: VisibleAreaProjectStatus
  projects: AreaProject[]
  path: string
  filter: AreaTaskFilter
}) {
  return (
    <section aria-labelledby={`status-${status}`}>
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <h4 id={`status-${status}`} className="text-sm font-semibold text-white">
          {projectStatusSectionLabels[status]}
        </h4>
        <span className="chip-subtle min-h-7 px-2.5 text-[11px]">{projects.length}</span>
      </div>
      <div>
        {projects.length ? (
          projects.map((project) => (
            <ProjectSection key={project.id} project={project} path={path} filter={filter} />
          ))
        ) : (
          <p className="py-5 text-sm text-muted-foreground">
            No hay proyectos {projectStatusSectionLabels[status].toLowerCase()} en este espacio.
          </p>
        )}
      </div>
    </section>
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
    workspace?.containers.reduce(
      (sum, container) => sum + container.projects.length + container.archivedProjects.length,
      0
    ) ?? 0
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
          <div className="meta-row">
            <span className="meta-item">
              <b className="text-white">{projects}</b> proyectos
            </span>
            <span className="meta-item">
              <b className="text-white">{tasks}</b> tareas
            </span>
          </div>
        ) : null
      }
    >
      {!workspace ? (
        <section className="surface-1 rounded-[28px] border p-8 text-center">
          <p className="font-medium text-white">No pudimos cargar esta área.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisá la conexión de datos e intentá nuevamente.
          </p>
        </section>
      ) : workspace.containers.length === 0 ? (
        <section className="surface-1 rounded-[28px] border p-8 text-center">
          <p className="font-medium text-white">Esta área todavía está vacía.</p>
        </section>
      ) : (
        <div className="space-y-6">
          <AreaOperationalNotesOverview
            notes={workspace.activeNotes}
            archivedNotes={workspace.archivedNotes}
            path={path}
          />

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
                  "inline-flex min-h-11 items-center rounded-[18px] border px-4 text-sm font-medium transition",
                  filter === value
                    ? "border-primary/25 bg-primary/12 text-white"
                    : "border-white/[0.1] text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {workspace.containers.map((container) => {
            const grouped = projectSections.reduce(
              (accumulator, status) => {
                accumulator[status] = container.projects.filter(
                  (project) => project.status === status
                )
                return accumulator
              },
              { active: [] as AreaProject[], backlog: [] as AreaProject[], done: [] as AreaProject[] }
            )
            const pending = container.projects.reduce(
              (sum, project) => sum + project.tasks.filter((task) => !task.completed).length,
              0
            )

            return (
              <section key={container.id} className="surface-1 rounded-[30px] border p-5 sm:p-7">
                <SectionHeading
                  title={container.name}
                  description={container.description ?? undefined}
                  action={
                    <div className="meta-row">
                      <span className="meta-item">
                        <FolderOpenDot className="size-4 text-primary" />{" "}
                        {container.projects.length + container.archivedProjects.length} proyectos
                      </span>
                      <span className="meta-item">{pending} pendientes</span>
                    </div>
                  }
                />

                <div className="mt-6 border-t border-white/[0.08] pt-6">
                  <CreateProjectForm containerId={container.id} path={path} />
                </div>

                <div className="mt-6">
                  <ContainerNotesSection
                    containerId={container.id}
                    notes={container.notes}
                    path={path}
                  />
                </div>

                <div className="mt-7 space-y-7">
                  {projectSections.map((status) => (
                    <StatusGroup
                      key={status}
                      status={status}
                      projects={grouped[status]}
                      path={path}
                      filter={filter}
                    />
                  ))}
                  <ArchivedProjectSection projects={container.archivedProjects} path={path} />
                </div>
              </section>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
