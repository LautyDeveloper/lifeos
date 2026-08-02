import Link from "next/link"
import { ArrowUpRight, NotebookPen } from "lucide-react"

import {
  CreateContainerNoteForm,
  CreateProjectNoteForm,
  CreateTaskNoteForm,
} from "@/features/operational-notes/components/create-operational-note-form"
import { OperationalNoteLifecycleActions } from "@/features/operational-notes/components/operational-note-lifecycle-actions"
import { OperationalNoteEditor } from "@/features/operational-notes/components/operational-note-editor"
import type { AreaOperationalNoteListItem } from "@/features/operational-notes/repository"

type WorkspaceNote = {
  id: string
  title: string
  content: string
  updatedAt: Date
}

export function ContainerNotesSection({
  containerId,
  notes,
  path,
}: {
  containerId: string
  notes: WorkspaceNote[]
  path: string
}) {
  return (
    <OperationalNotesSectionBase
      title="Notas"
      notes={notes}
      action={<CreateContainerNoteForm containerId={containerId} path={path} />}
      path={path}
    />
  )
}

export function ProjectNotesSection({
  projectId,
  notes,
  path,
}: {
  projectId: string
  notes: WorkspaceNote[]
  path: string
}) {
  return (
    <OperationalNotesSectionBase
      title="Notas del proyecto"
      notes={notes}
      action={<CreateProjectNoteForm projectId={projectId} path={path} />}
      path={path}
    />
  )
}

export function TaskNotesSection({
  taskId,
  notes,
  path,
}: {
  taskId: string
  notes: WorkspaceNote[]
  path: string
}) {
  return (
    <OperationalNotesSectionBase
      title="Notas de la tarea"
      notes={notes}
      action={<CreateTaskNoteForm taskId={taskId} path={path} />}
      path={path}
    />
  )
}

function OperationalNotesSectionBase({
  title,
  notes,
  action,
  path,
}: {
  title: string
  notes: WorkspaceNote[]
  action: React.ReactNode
  path: string
}) {
  return (
    <section className="space-y-4 rounded-[24px] border border-white/[0.06] bg-white/[0.015] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <NotebookPen className="size-4 text-primary" />
            <span>{title}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Guardá contexto rápido para no depender de memoria suelta.
          </p>
        </div>
        <div className="sm:shrink-0">{action}</div>
      </div>

      {notes.length ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <OperationalNoteEditor key={note.id} note={note} path={path} />
          ))}
        </div>
      ) : (
        <p className="rounded-[20px] border border-dashed border-white/[0.08] px-4 py-5 text-sm text-muted-foreground">
          Todavía no hay contexto guardado acá.
        </p>
      )}
    </section>
  )
}

function getContentPreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()
  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized
}

function formatNoteDate(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date)
}

function getOriginLabel(note: AreaOperationalNoteListItem) {
  if (note.kind === "task") {
    return `${note.containerName} / ${note.projectTitle ?? "Proyecto"} / ${note.taskTitle ?? "Tarea"}`
  }

  if (note.kind === "project") {
    return `${note.containerName} / ${note.projectTitle ?? "Proyecto"}`
  }

  return note.containerName
}

export function AreaOperationalNotesOverview({
  notes,
  archivedNotes,
  path,
}: {
  notes: AreaOperationalNoteListItem[]
  archivedNotes: AreaOperationalNoteListItem[]
  path: string
}) {
  return (
    <section className="surface-1 rounded-[30px] border p-5 sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <p className="eyebrow">Contexto del área</p>
          <h3 className="text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">
            Notas operativas
          </h3>
          <p className="context-line max-w-3xl">
            Una vista rápida de lo que ya dejaste escrito en containers, proyectos y tareas.
          </p>
        </div>
        <div className="meta-row">
          <span className="meta-item">{notes.length} activas</span>
          <span className="meta-item">{archivedNotes.length} archivadas</span>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h4 className="text-sm font-semibold text-white">Activas</h4>
            <span className="chip-subtle min-h-7 px-2.5 text-[11px]">{notes.length}</span>
          </div>

          {notes.length ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <article
                  key={note.id}
                  id={`note-${note.id}`}
                  className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <p className="content-title">{note.title}</p>
                      <p className="context-line">{getContentPreview(note.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">{getOriginLabel(note)}</span>
                        <span className="meta-item">Actualizada {formatNoteDate(note.updatedAt)}</span>
                      </div>
                    </div>
                    <Link
                      href={`${path}#note-${note.id}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] px-3 text-sm text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
                    >
                      Ir al contexto
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-[20px] border border-dashed border-white/[0.08] px-4 py-5 text-sm text-muted-foreground">
              Todavía no hay notas operativas activas en esta área.
            </p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h4 className="text-sm font-semibold text-white">Archivadas</h4>
            <span className="chip-subtle min-h-7 px-2.5 text-[11px]">{archivedNotes.length}</span>
          </div>

          {archivedNotes.length ? (
            <div className="space-y-3">
              {archivedNotes.map((note) => (
                <article
                  key={note.id}
                  id={`note-${note.id}`}
                  className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                >
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="content-title">{note.title}</p>
                      <p className="context-line">{getContentPreview(note.content)}</p>
                      <div className="meta-row">
                        <span className="meta-item">{getOriginLabel(note)}</span>
                        <span className="meta-item">
                          Archivada {note.archivedAt ? formatNoteDate(note.archivedAt) : ""}
                        </span>
                      </div>
                    </div>
                    <OperationalNoteLifecycleActions
                      noteId={note.id}
                      path={path}
                      mode="archived"
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-[20px] border border-dashed border-white/[0.08] px-4 py-5 text-sm text-muted-foreground">
              No hay notas archivadas en esta área.
            </p>
          )}
        </section>
      </div>
    </section>
  )
}
