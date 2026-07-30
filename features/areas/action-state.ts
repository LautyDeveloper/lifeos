export type CreateTaskActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    projectId?: string[]
  }
  resetKey: number
}

export const initialCreateTaskActionState: CreateTaskActionState = {
  status: "idle",
  resetKey: 0,
}
