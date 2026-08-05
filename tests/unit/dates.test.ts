import { describe, expect, it } from "vitest"

import { getTodayRange, parseDateInput } from "@/lib/dates"

describe("local date boundaries", () => {
  it("rechaza fechas inexistentes aunque respeten el formato", () => {
    expect(parseDateInput("2025-02-29")).toBeNull()
    expect(parseDateInput("2024-02-29")).not.toBeNull()
    expect(parseDateInput("2026-13-01")).toBeNull()
  })

  it("calcula el día siguiente por calendario local", () => {
    const { start, end } = getTodayRange(new Date(2026, 11, 31, 23, 59))
    expect(start).toEqual(new Date(2026, 11, 31, 0, 0, 0, 0))
    expect(end).toEqual(new Date(2027, 0, 1, 0, 0, 0, 0))
  })
})
