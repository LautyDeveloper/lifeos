import { afterEach, describe, expect, it } from "vitest"

import {
  DEMO_RESET_CONFIRMATION,
  assertDemoWritable,
  parseBooleanEnv,
  validateDemoResetEnvironment,
} from "@/lib/demo-mode"
import { createInboxItem } from "@/features/inbox/repository"

const originalReadOnly = process.env.DEMO_READ_ONLY

afterEach(() => {
  process.env.DEMO_READ_ONLY = originalReadOnly
})

describe("demo mode", () => {
  it("solo acepta true explícito como modo read-only", () => {
    expect(parseBooleanEnv("true")).toBe(true)
    expect(parseBooleanEnv(" TRUE ")).toBe(true)
    expect(parseBooleanEnv("1")).toBe(false)
    expect(parseBooleanEnv(undefined)).toBe(false)
  })

  it("bloquea escrituras con un error de dominio", () => {
    process.env.DEMO_READ_ONLY = "true"
    expect(() => assertDemoWritable()).toThrowError(expect.objectContaining({ code: "read_only" }))
  })

  it("protege repositorios aunque se invoquen fuera de la UI", async () => {
    process.env.DEMO_READ_ONLY = "true"
    await expect(createInboxItem({ content: "No debe persistir" })).rejects.toMatchObject({
      code: "read_only",
    })
  })

  it("nunca reutiliza DATABASE_URL para un reset", () => {
    expect(() => validateDemoResetEnvironment({
      DATABASE_URL: "postgresql://personal",
      DEMO_RESET_CONFIRM: DEMO_RESET_CONFIRMATION,
    })).toThrow("DEMO_DATABASE_URL")
  })

  it("exige URL dedicada y confirmación exacta", () => {
    expect(validateDemoResetEnvironment({
      DEMO_DATABASE_URL: "postgresql://demo",
      DEMO_RESET_CONFIRM: DEMO_RESET_CONFIRMATION,
    })).toBe("postgresql://demo")
  })

  it("rechaza reutilizar la base principal", () => {
    expect(() => validateDemoResetEnvironment({
      DATABASE_URL: "postgresql://same",
      DEMO_DATABASE_URL: "postgresql://same",
      DEMO_RESET_CONFIRM: DEMO_RESET_CONFIRMATION,
    })).toThrow("different from DATABASE_URL")
  })
})
