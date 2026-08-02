import { describe, expect, it } from "vitest"

import {
  getNoteContextKind,
  isLibraryNoteContext,
  isOperationalNoteContext,
} from "@/lib/note-context"

describe("note context helpers", () => {
  it("detects library notes correctly", () => {
    const ids = { containerId: null, projectId: null, taskId: null }
    expect(getNoteContextKind(ids)).toBe("library")
    expect(isLibraryNoteContext(ids)).toBe(true)
    expect(isOperationalNoteContext(ids)).toBe(false)
  })

  it("detects operational note scopes correctly", () => {
    expect(
      getNoteContextKind({ containerId: "c1", projectId: null, taskId: null })
    ).toBe("container")
    expect(
      getNoteContextKind({ containerId: "c1", projectId: "p1", taskId: null })
    ).toBe("project")
    expect(
      getNoteContextKind({ containerId: "c1", projectId: "p1", taskId: "t1" })
    ).toBe("task")
  })

  it("rejects inconsistent note shapes", () => {
    expect(
      getNoteContextKind({ containerId: null, projectId: "p1", taskId: null })
    ).toBeNull()
    expect(
      getNoteContextKind({ containerId: "c1", projectId: null, taskId: "t1" })
    ).toBeNull()
  })
})
