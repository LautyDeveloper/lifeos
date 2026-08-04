import Link from "next/link"
import {
  ArrowUpRight,
  CircleAlert,
  Inbox,
} from "lucide-react"

import { SectionHeading } from "@/components/shared/content-patterns"
import { PageShell } from "@/components/shared/page-shell"
import { EmptyState } from "@/components/ui/empty-state"
import { TaskPlanningControls } from "@/features/areas/components/task-planning-controls"
import { InboxProcessDialog } from "@/features/inbox/components/inbox-process-dialog"
import { OperationalNoteLifecycleActions } from "@/features/operational-notes/components/operational-note-lifecycle-actions"
import { ReviewProjectActions } from "@/features/review/components/review-project-actions"
import type { ReviewSummary } from "@/features/review/repository"
import { priorityLabels } from "@/types/domain"

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(value)
}

function getPreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()
  return normalized.length <= 120 ? normalized : `${normalized.slice(0, 117)}...`
}

function getNoteContext(
  note:
    | ReviewSummary["staleOperationalNotes"][number]
    | ReviewSummary["archivedOperationalNotes"][number]
) {
  if (note.kind === "task") {
    return `${note.container.name} · ${note.project.title ?? "Proyecto"} · ${note.task.title ?? "Tarea"}`
  }

  if (note.kind === "project") {
    return `${note.container.name} · ${note.project.title ?? "Proyecto"}`
  }

  return note.container.name
}

function ReviewSection({
  title,
  description,
  count,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  description: string
  count: number
  actionHref?: string
  actionLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className="surface-1 rounded-[28px] border p-5 sm:p-6">
      <SectionHeading
        title={title}
        description={description}
        action={
          <div className="flex items-center gap-3">
            <span className="chip-subtle min-h-7 px-2.5 text-[11px]">{count}</span>
            {actionHref && actionLabel ? (
              <Link
                href={actionHref}
                className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] px-4 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
              >
                {actionLabel}
                <ArrowUpRight className="size-4" />
              </Link>
            ) : null}
          </div>
        }
      />
      <div className="mt-6">{children}</div>
    </section>
  )
}

export function ReviewView({
  summary,
  areasWithContainers,
  projectOptions,
  databaseReady,
}: {
  summary: ReviewSummary
  areasWithContainers: {
    id: string
    name: string
    containers: { id: string; name: string }[]
  }[]
  projectOptions: {
    id: string
    title: string
    containerName: string
    areaName: string
  }[]
  databaseReady: boolean
}) {
  const fullyHealthy =
    summary.pendingInboxItems.length === 0 &&
    summary.unplannedTasks.length === 0 &&
    summary.backlogProjects.length === 0 &&
    summary.staleOperationalNotes.length === 0 &&
    summary.archivedOperationalNotes.length === 0

  return (
    <PageShell
      eyebrow="Mantenimiento"
      title="Review del sistema"
      description="Una pasada tranquila para detectar fricción antes de que se acumule. No es analytics: es higiene operativa."
      actions={
        summary.databaseReady ? (
          <div className="meta-row">
            <span className="meta-item">
              <b className="text-white">
                {summary.pendingInboxItems.length +
                  summary.unplannedTasks.length +
                  summary.backlogProjects.length +
                  summary.staleOperationalNotes.length +
                  summary.archivedOperationalNotes.length}
              </b>{" "}
              señales
            </span>
          </div>
        ) : null
      }
    >
      {!summary.databaseReady ? (
        <section className="surface-1 rounded-[28px] border p-8 text-center">
          <p className="font-medium text-white">No pudimos cargar el review.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisá la conexión de datos e intentá nuevamente.
          </p>
        </section>
      ) : fullyHealthy ? (
        <EmptyState
          icon={CircleAlert}
          title="No hay nada urgente para revisar."
          description="Inbox, planning, backlog y contexto se ven saludables. Podés seguir con foco."
          action={{ href: "/", label: "Volver al inicio" }}
        />
      ) : (
        <div className="space-y-6">
          <ReviewSection
            title="Inbox pendiente"
            description="Capturas que todavía no tienen destino y conviene vaciar antes de seguir acumulando."
            count={summary.pendingInboxItems.length}
            actionHref="/inbox"
            actionLabel="Abrir Inbox"
          >
            {summary.pendingInboxItems.length ? (
              <div className="divide-y divide-white/[0.08]">
                {summary.pendingInboxItems.slice(0, 6).map((item) => (
                  <article
                    key={item.id}
                    className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <Inbox className="mt-1 size-4 shrink-0 text-primary/90" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="content-title">{getPreview(item.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">Capturada {formatShortDate(item.capturedAt)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <InboxProcessDialog
                          item={{ id: item.id, content: item.content }}
                          areasWithContainers={areasWithContainers}
                          projectOptions={projectOptions}
                          databaseReady={databaseReady}
                        />
                        <Link href={item.href} className="text-sm text-muted-foreground transition hover:text-white">
                          Abrir Inbox
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Acá no hay nada para revisar.</p>
            )}
          </ReviewSection>

          <ReviewSection
            title="Tareas sin fecha"
            description="Trabajo activo que todavía no entró al loop de planning."
            count={summary.unplannedTasks.length}
          >
            {summary.unplannedTasks.length ? (
              <div className="space-y-3">
                {summary.unplannedTasks.slice(0, 8).map((task) => (
                  <article
                    key={task.id}
                    className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="space-y-1.5">
                      <p className="content-title">{task.title}</p>
                      <p className="context-line">
                        {task.area.name} · {task.container.name} · {task.project.title}
                      </p>
                      <div className="meta-row">
                        <span className="meta-item">{priorityLabels[task.priority]}</span>
                        <span className="meta-item">Creada {formatShortDate(task.createdAt)}</span>
                      </div>
                      <TaskPlanningControls taskId={task.id} path="/review" plannedDate={null} />
                      <Link href={task.href} className="inline-flex text-sm text-muted-foreground transition hover:text-white">
                        Ir al proyecto
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Acá no hay nada para revisar.</p>
            )}
          </ReviewSection>

          <ReviewSection
            title="Proyectos en backlog"
            description="Espacios que siguen fuera de foco y tal vez ya merecen activarse, pausarse o cerrarse."
            count={summary.backlogProjects.length}
          >
            {summary.backlogProjects.length ? (
              <div className="space-y-3">
                {summary.backlogProjects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="space-y-1.5">
                      <p className="content-title">{project.title}</p>
                      <p className="context-line">
                        {project.area.name} · {project.container.name}
                      </p>
                      <div className="meta-row">
                        <span className="meta-item">{priorityLabels[project.priority]}</span>
                        <span className="meta-item">{project.taskCount} tareas</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <ReviewProjectActions projectId={project.id} path="/review" />
                        <Link href={project.href} className="text-sm text-muted-foreground transition hover:text-white">
                          Ir al proyecto
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Acá no hay nada para revisar.</p>
            )}
          </ReviewSection>

          <ReviewSection
            title="Contexto viejo"
            description="Notas operativas activas que no se tocan hace 30 días y quizás ya quedaron atrás."
            count={summary.staleOperationalNotes.length}
          >
            {summary.staleOperationalNotes.length ? (
              <div className="space-y-3">
                {summary.staleOperationalNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="space-y-1.5">
                      <p className="content-title">{note.title}</p>
                      <p className="context-line">{getPreview(note.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">{getNoteContext(note)}</span>
                        <span className="meta-item">Último cambio {formatShortDate(note.updatedAt)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <OperationalNoteLifecycleActions noteId={note.id} path="/review" mode="active" />
                        <Link href={note.href} className="text-sm text-muted-foreground transition hover:text-white">
                          Ir al contexto
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Acá no hay nada para revisar.</p>
            )}
          </ReviewSection>

          <ReviewSection
            title="Archivadas"
            description="Notas operativas que ya salieron del flujo activo, pero todavía siguen guardadas."
            count={summary.archivedOperationalNotes.length}
          >
            {summary.archivedOperationalNotes.length ? (
              <div className="space-y-3">
                {summary.archivedOperationalNotes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div className="space-y-1.5">
                      <p className="content-title">{note.title}</p>
                      <p className="context-line">{getPreview(note.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">{getNoteContext(note)}</span>
                        <span className="meta-item">
                          Archivada {note.archivedAt ? formatShortDate(note.archivedAt) : ""}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <OperationalNoteLifecycleActions noteId={note.id} path="/review" mode="archived" />
                        <Link href={note.href} className="text-sm text-muted-foreground transition hover:text-white">
                          Ir al contexto
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Acá no hay nada para revisar.</p>
            )}
          </ReviewSection>
        </div>
      )}
    </PageShell>
  )
}
