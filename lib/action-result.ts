import type { ActionFieldErrors, ActionResult } from "@/types/action-result"

export function successResult(message: string, entityId?: string): ActionResult {
  return {
    status: "success",
    message,
    entityId,
  }
}

export function errorResult(
  message: string,
  options?: { entityId?: string; fieldErrors?: ActionFieldErrors }
): ActionResult {
  return {
    status: "error",
    message,
    entityId: options?.entityId,
    fieldErrors: options?.fieldErrors,
  }
}
