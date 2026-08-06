import { describe, expect, it } from "vitest"

import {
  canCreateTasksInProject,
  canEditTask,
  canMutateTasksInProject,
  canPlanTask,
  canPlanTasksInProject,
  isProjectVisibleInArea,
  isProjectVisibleInToday,
} from "@/types/domain"

describe("domain rules", () => {
  it("permite crear tareas solo en proyectos activos o backlog", () => {
    expect(canCreateTasksInProject("active")).toBe(true)
    expect(canCreateTasksInProject("backlog")).toBe(true)
    expect(canCreateTasksInProject("paused")).toBe(false)
    expect(canCreateTasksInProject("done")).toBe(false)
  })

  it("permite planificar tareas solo en proyectos activos", () => {
    expect(canPlanTasksInProject("active")).toBe(true)
    expect(canPlanTasksInProject("backlog")).toBe(false)
    expect(canPlanTasksInProject("paused")).toBe(false)
    expect(canPlanTasksInProject("done")).toBe(false)
  })

  it("congela las tareas de proyectos pausados o terminados", () => {
    expect(canMutateTasksInProject("active")).toBe(true)
    expect(canMutateTasksInProject("backlog")).toBe(true)
    expect(canMutateTasksInProject("paused")).toBe(false)
    expect(canMutateTasksInProject("done")).toBe(false)
  })

  it("una tarea completada solo puede reabrirse o eliminarse", () => {
    expect(canEditTask("active", false)).toBe(true)
    expect(canEditTask("active", true)).toBe(false)
    expect(canEditTask("done", false)).toBe(false)
    expect(canPlanTask("active", false)).toBe(true)
    expect(canPlanTask("active", true)).toBe(false)
    expect(canPlanTask("backlog", false)).toBe(false)
  })

  it("mantiene la visibilidad esperada por superficie", () => {
    expect(isProjectVisibleInArea("paused")).toBe(false)
    expect(isProjectVisibleInArea("active")).toBe(true)
    expect(isProjectVisibleInToday("active")).toBe(true)
    expect(isProjectVisibleInToday("backlog")).toBe(false)
    expect(isProjectVisibleInToday("done")).toBe(false)
  })
})
