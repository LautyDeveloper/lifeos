export type CreateLibraryNoteActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    content?: string[]
  }
  createdNoteId?: string
  resetKey: number
}

export const initialCreateLibraryNoteActionState: CreateLibraryNoteActionState = {
  status: "idle",
  resetKey: 0,
}

export type UpdateLibraryNoteActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    id?: string[]
    title?: string[]
    content?: string[]
  }
  resetKey: number
}

export const initialUpdateLibraryNoteActionState: UpdateLibraryNoteActionState = {
  status: "idle",
  resetKey: 0,
}
