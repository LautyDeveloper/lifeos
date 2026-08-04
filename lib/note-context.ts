export type NoteContextIds = {
  containerId: string | null
  projectId: string | null
  taskId: string | null
}

export type NoteContextKind = "library" | "container" | "project" | "task" | null

export function getNoteContextKind(ids: NoteContextIds): NoteContextKind {
  if (!ids.containerId && !ids.projectId && !ids.taskId) {
    return "library"
  }

  if (ids.containerId && !ids.projectId && !ids.taskId) {
    return "container"
  }

  if (ids.containerId && ids.projectId && !ids.taskId) {
    return "project"
  }

  if (ids.containerId && ids.projectId && ids.taskId) {
    return "task"
  }

  return null
}

export function isLibraryNoteContext(ids: NoteContextIds) {
  return getNoteContextKind(ids) === "library"
}

export function isOperationalNoteContext(ids: NoteContextIds) {
  const kind = getNoteContextKind(ids)
  return kind === "container" || kind === "project" || kind === "task"
}
