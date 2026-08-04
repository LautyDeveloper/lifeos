import { describe, expect, it } from "vitest"

import { normalizeInboxSuggestion } from "@/features/inbox-ai/utils"

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
