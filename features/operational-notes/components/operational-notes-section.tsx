import { NotebookPen } from "lucide-react"

import { CreateContainerNoteForm, CreateProjectNoteForm } from "@/features/operational-notes/components/create-operational-note-form"
import { OperationalNoteEditor } from "@/features/operational-notes/components/operational-note-editor"

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
