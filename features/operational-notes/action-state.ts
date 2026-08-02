export type CreateOperationalNoteActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    containerId?: string[]
    projectId?: string[]
    taskId?: string[]
    title?: string[]
    content?: string[]
  }
  createdNoteId?: string
  resetKey: number
}

export type UpdateOperationalNoteActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    id?: string[]
    title?: string[]
    content?: string[]
  }
  resetKey: number
}

export const initialCreateOperationalNoteActionState: CreateOperationalNoteActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialUpdateOperationalNoteActionState: UpdateOperationalNoteActionState = {
  status: "idle",
  resetKey: 0,
}
