import { describe, expect, it } from "vitest"

import { DomainError, getDomainErrorMessage } from "@/lib/domain-errors"

describe("domain error messages", () => {
  it("traduce únicamente códigos conocidos por el consumidor", () => {
    expect(
      getDomainErrorMessage(new DomainError("not_found", "internal"), "Fallback", {
        not_found: "Ya no existe.",
      })
    ).toBe("Ya no existe.")
  })

  it("no expone mensajes internos ni errores desconocidos", () => {
    expect(getDomainErrorMessage(new DomainError("invalid_state", "internal"), "Fallback")).toBe("Fallback")
    expect(getDomainErrorMessage(new Error("secret"), "Fallback")).toBe("Fallback")
  })
})
