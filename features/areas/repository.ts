import { and, asc, eq } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"
import type {
  CreateTaskInput,
  PlanTaskForTodayInput,
  ToggleTaskCompletionInput,
} from "@/features/areas/schemas"

export type AreaWorkspace = {
  area: {
    id: string
    name: string
    icon: string
    color: string
  }
  containers: Array<{
    id: string
    name: string
    description: string | null
    projects: Array<{
      id: string
      title: string
      description: string | null
      status: string
      priority: string
      tasks: Array<{
        id: string
        title: string
        completed: boolean
        priority: string
        plannedDate: Date | null
      }>
    }>
  }>
}

export type AreaTaskFilter = "active" | "today" | "completed"

export async function getAreaWorkspace(areaName: string): Promise<AreaWorkspace | null> {
  if (!db) {
    return null
  }

  const [area] = await db
    .select({
      id: areas.id,
      name: areas.name,
      icon: areas.icon,
      color: areas.color,
    })
    .from(areas)
    .where(eq(areas.name, areaName))
    .limit(1)

  if (!area) {
    return null
  }

  const containerRows = await db
    .select({
      id: containers.id,
      name: containers.name,
      description: containers.description,
    })
    .from(containers)
    .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
    .orderBy(asc(containers.name))

  const projectRows = await db
    .select({
      id: projects.id,
      containerId: projects.containerId,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
    })
    .from(projects)
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
    .orderBy(asc(containers.name), asc(projects.title))

  const taskRows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      completed: tasks.completed,
      priority: tasks.priority,
      plannedDate: tasks.plannedDate,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
    .orderBy(asc(tasks.completed), asc(tasks.createdAt))

  const tasksByProjectId = new Map<string, AreaWorkspace["containers"][number]["projects"][number]["tasks"]>()
  for (const task of taskRows) {
    const current = tasksByProjectId.get(task.projectId) ?? []
    current.push({
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      plannedDate: task.plannedDate,
    })
    tasksByProjectId.set(task.projectId, current)
  }

  const projectsByContainerId = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"]
  >()
  for (const project of projectRows) {
    const current = projectsByContainerId.get(project.containerId) ?? []
    current.push({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      priority: project.priority,
      tasks: tasksByProjectId.get(project.id) ?? [],
    })
    projectsByContainerId.set(project.containerId, current)
  }

  return {
    area,
    containers: containerRows.map((container) => ({
      id: container.id,
      name: container.name,
      description: container.description,
      projects: projectsByContainerId.get(container.id) ?? [],
    })),
  }
}

export async function createTask(input: CreateTaskInput) {
  const database = getDbOrThrow()

  const [project] = await database
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1)

  if (!project) {
    throw new Error("Project not found.")
  }

  const [task] = await database
    .insert(tasks)
    .values({
      projectId: input.projectId,
      title: input.title,
      priority: "medium",
      completed: false,
    })
    .returning({
      id: tasks.id,
      title: tasks.title,
    })

  return task
}

export async function toggleTaskCompletion(input: ToggleTaskCompletionInput) {
  const database = getDbOrThrow()

  const [task] = await database
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, input.taskId))
    .limit(1)

  if (!task) {
    throw new Error("Task not found.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      completed: input.completed,
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      completed: tasks.completed,
    })

  return updatedTask
}

export async function planTaskForToday(input: PlanTaskForTodayInput) {
  const database = getDbOrThrow()

  const [task] = await database
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, input.taskId))
    .limit(1)

  if (!task) {
    throw new Error("Task not found.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: new Date(),
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return updatedTask
}
