export type DomainErrorCode =
  | "not_found"
  | "invalid_state"
  | "archived_context"
  | "constraint_violation"
  | "database_unavailable"
  | "service_unavailable"

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
