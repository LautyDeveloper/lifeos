export type CommandActionKey =
  | "new-capture"
  | "new-library-note"
  | "go-today"
  | "go-inbox"
  | "go-review"
  | "task-plan-today"
  | "task-plan-tomorrow"
  | "task-clear-date"
  | "project-move-active"
  | "project-move-parking"
  | "note-archive"
  | "process-inbox"

export type CommandResult = {
  id: string
  type: "project" | "task" | "library-note" | "operational-note" | "inbox-item" | "action"
  title: string
  subtitle?: string
  href?: string
  actionKey?: CommandActionKey
  entityId?: string
  projectStatus?: "backlog" | "active" | "done" | "paused"
  rawContent?: string
  projectId?: string
  plannedDate?: string | null
}
