export type DomainErrorCode =
  | "not_found"
  | "invalid_state"
  | "archived_context"
  | "constraint_violation"
  | "database_unavailable"
  | "service_unavailable"
  | "service_timeout"
  | "invalid_service_response"
  | "read_only"

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string
  ) {
    super(message)
    this.name = "DomainError"
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError
}

export function getDomainErrorMessage(
  error: unknown,
  fallback: string,
  messages: Partial<Record<DomainErrorCode, string>> = {}
) {
  if (isDomainError(error) && error.code === "read_only") {
    return "Esta demo pública es de solo lectura. Probá el recorrido completo en la demo local."
  }

  return isDomainError(error) ? messages[error.code] ?? fallback : fallback
}
