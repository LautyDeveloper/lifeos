import { describe, expect, it, vi } from "vitest"

import { withInboxAiRetry } from "@/features/inbox-ai/service"
import { normalizeInboxSuggestion } from "@/features/inbox-ai/utils"
import { DomainError } from "@/lib/domain-errors"

describe("inbox ai suggestion normalization", () => {
  it("preserva una sugerencia válida de proyecto", () => {
    const suggestion = normalizeInboxSuggestion(
      {
        suggestedTarget: "project",
        suggestedTitle: "Definir onboarding del MVP",
        suggestedDescription: "Ordenar pasos y decisiones clave.",
        confidence: "high",
      },
      "definir onboarding del mvp"
    )

    expect(suggestion.suggestedTarget).toBe("project")
    expect(suggestion.suggestedTitle).toBe("Definir onboarding del MVP")
    expect(suggestion.suggestedDescription).toBe("Ordenar pasos y decisiones clave.")
    expect(suggestion.suggestedContent).toBeUndefined()
    expect(suggestion.confidence).toBe("high")
  })

  it("usa fallbacks seguros cuando faltan campos importantes", () => {
    const suggestion = normalizeInboxSuggestion(
      {
        suggestedTarget: "note",
        suggestedTitle: "   ",
        suggestedContent: "   ",
      },
      "revisar ideas para el launch del producto"
    )

    expect(suggestion.suggestedTarget).toBe("note")
    expect(suggestion.suggestedTitle).toBe("revisar ideas para el launch del producto")
    expect(suggestion.suggestedContent).toBe("revisar ideas para el launch del producto")
  })

  it("limpia campos que no aplican al destino final", () => {
    const suggestion = normalizeInboxSuggestion(
      {
        suggestedTarget: "task",
        suggestedTitle: "Escribir landing",
        suggestedDescription: "esto no debería persistir",
        suggestedContent: "esto tampoco",
      },
      "escribir landing"
    )

    expect(suggestion.suggestedTarget).toBe("task")
    expect(suggestion.suggestedDescription).toBeUndefined()
    expect(suggestion.suggestedContent).toBeUndefined()
  })
})

describe("inbox ai resilience", () => {
  it("reintenta una vez ante errores transitorios", async () => {
    const operation = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValueOnce(Object.assign(new Error("rate limited"), { status: 429 }))
      .mockResolvedValueOnce("ok")

    await expect(withInboxAiRetry(operation)).resolves.toBe("ok")
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it("reintenta una respuesta inválida y conserva el error final", async () => {
    const error = new DomainError("invalid_service_response", "invalid json")
    const operation = vi.fn<(signal: AbortSignal) => Promise<string>>().mockRejectedValue(error)

    await expect(withInboxAiRetry(operation)).rejects.toMatchObject({
      code: "invalid_service_response",
    })
    expect(operation).toHaveBeenCalledTimes(2)
  })

  it("no reintenta errores no transitorios", async () => {
    const operation = vi
      .fn<(signal: AbortSignal) => Promise<string>>()
      .mockRejectedValue(Object.assign(new Error("bad request"), { status: 400 }))

    await expect(withInboxAiRetry(operation)).rejects.toMatchObject({
      code: "service_unavailable",
    })
    expect(operation).toHaveBeenCalledTimes(1)
  })

  it("convierte abortos agotados en timeout de dominio", async () => {
    const operation = vi.fn<(signal: AbortSignal) => Promise<string>>().mockImplementation(async () => {
      throw new DOMException("timed out", "TimeoutError")
    })

    await expect(withInboxAiRetry(operation)).rejects.toMatchObject({ code: "service_timeout" })
    expect(operation).toHaveBeenCalledTimes(2)
  })
})
