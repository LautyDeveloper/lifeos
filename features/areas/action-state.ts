export type CreateTaskActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    projectId?: string[]
  }
  resetKey: number
}

export type CreateProjectActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    containerId?: string[]
  }
  resetKey: number
}

export type UpdateTaskDetailsActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    taskId?: string[]
  }
  resetKey: number
}

export type UpdateProjectDetailsActionState = {
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

export const initialCreateProjectActionState: CreateProjectActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialUpdateTaskDetailsActionState: UpdateTaskDetailsActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialUpdateProjectDetailsActionState: UpdateProjectDetailsActionState = {
  status: "idle",
  resetKey: 0,
}
