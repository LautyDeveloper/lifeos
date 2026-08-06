import { DomainError } from "@/lib/domain-errors"

export const DEMO_RESET_CONFIRMATION = "RESET_LIFE_OS_DEMO"

export function parseBooleanEnv(value: string | undefined) {
  return value?.trim().toLowerCase() === "true"
}

export function isDemoReadOnly() {
  return parseBooleanEnv(process.env.DEMO_READ_ONLY)
}

export function assertDemoWritable() {
  if (isDemoReadOnly()) {
    throw new DomainError("read_only", "Mutations are disabled in public demo mode.")
  }
}

export function validateDemoResetEnvironment(
  environment: Record<string, string | undefined> = process.env
) {
  const databaseUrl = environment.DEMO_DATABASE_URL?.trim()

  if (!databaseUrl) {
    throw new Error("DEMO_DATABASE_URL is required. DATABASE_URL is never used for demo resets.")
  }

  if (environment.DEMO_RESET_CONFIRM !== DEMO_RESET_CONFIRMATION) {
    throw new Error(`DEMO_RESET_CONFIRM must equal ${DEMO_RESET_CONFIRMATION}.`)
  }

  if (environment.DATABASE_URL?.trim() === databaseUrl) {
    throw new Error("DEMO_DATABASE_URL must be different from DATABASE_URL.")
  }

  return databaseUrl
}
