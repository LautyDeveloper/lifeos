import { and, asc, eq } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"
import type {
  ClearTaskPlannedDateInput,
  CreateTaskInput,
  PlanTaskForTomorrowInput,
  PlanTaskForTodayInput,
  SetTaskPlannedDateInput,
  ToggleTaskCompletionInput,
  UpdateProjectPriorityInput,
  UpdateProjectStatusInput,
  UpdateTaskPriorityInput,
} from "@/features/areas/schemas"
import { getDateDaysFromNow, parseDateInput } from "@/lib/dates"
import {
  canCreateTasksInProject,
  canPlanTasksInProject,
  type Priority,
  type ProjectStatus,
} from "@/types/domain"

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
      status: ProjectStatus
      priority: Priority
      tasks: Array<{
        id: string
        title: string
        completed: boolean
        priority: Priority
        plannedDate: Date | null
      }>
    }>
  }>
}

export type AreaTaskFilter = "active" | "today" | "completed"

type ProjectRecord = {
  id: string
  status: ProjectStatus
}

type TaskRecord = {
  id: string
  projectId: string
  projectStatus: ProjectStatus
}

async function getProjectRecord(projectId: string): Promise<ProjectRecord | null> {
  const database = getDbOrThrow()

  const [project] = await database
    .select({
      id: projects.id,
      status: projects.status,
    })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1)

  return project ?? null
}

async function getTaskRecord(taskId: string): Promise<TaskRecord | null> {
  const database = getDbOrThrow()

  const [task] = await database
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      projectStatus: projects.status,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(eq(tasks.id, taskId))
    .limit(1)

  return task ?? null
}

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
    if (project.status === "paused") {
      continue
    }

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
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new Error("Project not found.")
  }

  if (!canCreateTasksInProject(project.status)) {
    throw new Error("Project does not allow new tasks.")
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
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (task.projectStatus === "paused") {
    throw new Error("Paused project task cannot be toggled here.")
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
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (!canPlanTasksInProject(task.projectStatus)) {
    throw new Error("Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: getDateDaysFromNow(0),
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return updatedTask
}

export async function planTaskForTomorrow(input: PlanTaskForTomorrowInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (!canPlanTasksInProject(task.projectStatus)) {
    throw new Error("Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: getDateDaysFromNow(1),
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return updatedTask
}

export async function setTaskPlannedDate(input: SetTaskPlannedDateInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (!canPlanTasksInProject(task.projectStatus)) {
    throw new Error("Project does not allow planning.")
  }

  const plannedDate = parseDateInput(input.plannedDate)

  if (!plannedDate) {
    throw new Error("Invalid planning date.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate,
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return updatedTask
}

export async function clearTaskPlannedDate(input: ClearTaskPlannedDateInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (!canPlanTasksInProject(task.projectStatus)) {
    throw new Error("Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: null,
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return updatedTask
}

export async function updateProjectStatus(input: UpdateProjectStatusInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new Error("Project not found.")
  }

  const [updatedProject] = await database
    .update(projects)
    .set({
      status: input.status,
    })
    .where(eq(projects.id, input.projectId))
    .returning({
      id: projects.id,
      status: projects.status,
    })

  return updatedProject
}

export async function updateProjectPriority(input: UpdateProjectPriorityInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new Error("Project not found.")
  }

  const [updatedProject] = await database
    .update(projects)
    .set({
      priority: input.priority,
    })
    .where(eq(projects.id, input.projectId))
    .returning({
      id: projects.id,
      priority: projects.priority,
    })

  return updatedProject
}

export async function updateTaskPriority(input: UpdateTaskPriorityInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new Error("Task not found.")
  }

  if (task.projectStatus === "paused") {
    throw new Error("Paused project task cannot be updated here.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      priority: input.priority,
    })
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
      priority: tasks.priority,
    })

  return updatedTask
}
