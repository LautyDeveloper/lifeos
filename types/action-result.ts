export type ActionStatus = "success" | "error"

export type ActionFieldErrors = Record<string, string[] | undefined>

export type ActionResult = {
  status: ActionStatus
  message: string
  entityId?: string
  fieldErrors?: ActionFieldErrors
}
