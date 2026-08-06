import { describe, expect, it } from "vitest"

import { formatTodayExecutionDescription } from "@/lib/dates"
import { pluralize } from "@/lib/format"

describe("demo copy", () => {
  it("resuelve plurales simples", () => {
    expect(pluralize(1, "proyecto", "proyectos")).toBe("proyecto")
    expect(pluralize(0, "proyecto", "proyectos")).toBe("proyectos")
  })

  it("deriva la fecha de Hoy sin copy fijo", () => {
    const description = formatTodayExecutionDescription(new Date(2026, 7, 5, 12))
    expect(description).toContain("miércoles 5 de agosto de 2026")
  })
})
