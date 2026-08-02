export type UpdateAreaActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    name?: string[]
    icon?: string[]
    color?: string[]
    areaId?: string[]
  }
  resetKey: number
}

export type CreateContainerActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    name?: string[]
    description?: string[]
    areaId?: string[]
  }
  resetKey: number
}

export type UpdateContainerActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    name?: string[]
    description?: string[]
    containerId?: string[]
  }
  resetKey: number
}

export const initialUpdateAreaActionState: UpdateAreaActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialCreateContainerActionState: CreateContainerActionState = {
  status: "idle",
  resetKey: 0,
}

export const initialUpdateContainerActionState: UpdateContainerActionState = {
  status: "idle",
  resetKey: 0,
}
