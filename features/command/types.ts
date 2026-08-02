export type CommandActionKey =
  | "new-capture"
  | "new-library-note"
  | "go-today"
  | "go-inbox"
  | "go-review"

export type CommandResult = {
  id: string
  type: "project" | "task" | "library-note" | "operational-note" | "inbox-item" | "action"
  title: string
  subtitle?: string
  href?: string
  actionKey?: CommandActionKey
}
