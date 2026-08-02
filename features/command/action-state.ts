export type QuickCaptureActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    content?: string[]
  }
  resetKey: number
}

export type QuickLibraryNoteActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    content?: string[]
  }
  createdNoteId?: string
  resetKey: number
}

export const initialQuickCaptureActionState: QuickCaptureActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialQuickLibraryNoteActionState: QuickLibraryNoteActionState = {
  status: "idle",
  resetKey: 0,
}
