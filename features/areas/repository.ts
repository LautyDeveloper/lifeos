import { and, asc, desc, eq, isNotNull, isNull, or } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { areas, containers, notes, projects, tasks } from "@/db/schema"
import {
  listArchivedOperationalNotesByArea,
  listAreaOperationalNotes,
  type AreaOperationalNoteListItem,
} from "@/features/operational-notes/repository"
import type {
  ArchiveProjectInput,
  ClearTaskPlannedDateInput,
  CreateProjectInput,
  CreateTaskInput,
  DeleteProjectInput,
  DeleteTaskInput,
  PlanTaskForTomorrowInput,
  PlanTaskForTodayInput,
  RestoreProjectInput,
  SetTaskPlannedDateInput,
  ToggleTaskCompletionInput,
  UpdateProjectDetailsInput,
  UpdateProjectPriorityInput,
  UpdateTaskDetailsInput,
  UpdateProjectStatusInput,
  UpdateTaskPriorityInput,
} from "@/features/areas/schemas"
import { getDateDaysFromNow, parseDateInput } from "@/lib/dates"
import {
  canCreateTasksInProject,
  canEditTask,
  canMutateTasksInProject,
  canPlanTask,
  type Priority,
  type ProjectStatus,
} from "@/types/domain"
import { DomainError } from "@/lib/domain-errors"

export type AreaWorkspace = {
  area: {
    id: string
    slug: string
    name: string
    icon: string
    color: string
  }
  activeNotes: AreaOperationalNoteListItem[]
  archivedNotes: AreaOperationalNoteListItem[]
  containers: Array<{
    id: string
    name: string
    description: string | null
    notes: Array<{
      id: string
      title: string
      content: string
      updatedAt: Date
    }>
    projects: Array<{
      id: string
      title: string
      description: string | null
      status: ProjectStatus
      priority: Priority
      notes: Array<{
        id: string
        title: string
        content: string
        updatedAt: Date
      }>
      tasks: Array<{
        id: string
        title: string
        completed: boolean
        priority: Priority
        plannedDate: Date | null
        notes: Array<{
          id: string
          title: string
          content: string
          updatedAt: Date
        }>
      }>
    }>
    archivedProjects: Array<{
      id: string
      title: string
      description: string | null
      status: ProjectStatus
      priority: Priority
      archivedAt: Date
      taskCount: number
      completedTaskCount: number
    }>
  }>
}

export type AreaTaskFilter = "active" | "today" | "completed"

type ProjectRecord = {
  id: string
  status: ProjectStatus
  archivedAt: Date | null
  containerArchived: boolean
  containerId?: string
}

type ContainerRecord = {
  id: string
  archived: boolean
}

type TaskRecord = {
  id: string
  projectId: string
  projectStatus: ProjectStatus
  projectArchivedAt: Date | null
  containerArchived: boolean
  completed: boolean
}

function requireMutationResult<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new DomainError("invalid_state", message)
  }

  return value
}

async function getContainerRecord(containerId: string): Promise<ContainerRecord | null> {
  const database = getDbOrThrow()

  const [container] = await database
    .select({
      id: containers.id,
      archived: containers.archived,
    })
    .from(containers)
    .where(eq(containers.id, containerId))
    .limit(1)

  return container ?? null
}

async function getProjectRecord(projectId: string): Promise<ProjectRecord | null> {
  const database = getDbOrThrow()

  const [project] = await database
    .select({
      id: projects.id,
      status: projects.status,
      archivedAt: projects.archivedAt,
      containerArchived: containers.archived,
    })
    .from(projects)
    .innerJoin(containers, eq(containers.id, projects.containerId))
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
      projectArchivedAt: projects.archivedAt,
      containerArchived: containers.archived,
      completed: tasks.completed,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(eq(tasks.id, taskId))
    .limit(1)

  return task ?? null
}

export async function getAreaWorkspace(areaSlug: string): Promise<AreaWorkspace | null> {
  if (!db) {
    return null
  }

  const [area] = await db
    .select({
      id: areas.id,
      slug: areas.slug,
      name: areas.name,
      icon: areas.icon,
      color: areas.color,
    })
    .from(areas)
    .where(eq(areas.slug, areaSlug))
    .limit(1)

  if (!area) {
    return null
  }

  const [containerRows, projectRows, taskRows, noteRows, activeNotes, archivedNotes] =
    await Promise.all([
      db
        .select({
          id: containers.id,
          name: containers.name,
          description: containers.description,
        })
        .from(containers)
        .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
        .orderBy(asc(containers.sortOrder), asc(containers.name)),
      db
        .select({
          id: projects.id,
          containerId: projects.containerId,
          title: projects.title,
          description: projects.description,
          status: projects.status,
          priority: projects.priority,
          archivedAt: projects.archivedAt,
        })
        .from(projects)
        .innerJoin(containers, eq(containers.id, projects.containerId))
        .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
        .orderBy(asc(containers.sortOrder), asc(projects.title)),
      db
        .select({
          id: tasks.id,
          projectId: tasks.projectId,
          title: tasks.title,
          completed: tasks.completed,
          priority: tasks.priority,
          plannedDate: tasks.plannedDate,
          projectArchivedAt: projects.archivedAt,
        })
        .from(tasks)
        .innerJoin(projects, eq(projects.id, tasks.projectId))
        .innerJoin(containers, eq(containers.id, projects.containerId))
        .where(and(eq(containers.areaId, area.id), eq(containers.archived, false)))
        .orderBy(asc(tasks.completed), asc(tasks.createdAt)),
      db
        .select({
          id: notes.id,
          title: notes.title,
          content: notes.content,
          updatedAt: notes.updatedAt,
          containerId: notes.containerId,
          projectId: notes.projectId,
          taskId: notes.taskId,
          projectArchivedAt: projects.archivedAt,
        })
        .from(notes)
        .innerJoin(containers, eq(containers.id, notes.containerId))
        .leftJoin(projects, eq(projects.id, notes.projectId))
        .where(
          and(
            eq(containers.areaId, area.id),
            eq(containers.archived, false),
            isNull(notes.archivedAt),
            or(isNull(notes.projectId), isNull(projects.archivedAt))
          )
        )
        .orderBy(desc(notes.updatedAt), asc(notes.title)),
      listAreaOperationalNotes(area.slug),
      listArchivedOperationalNotesByArea(area.slug),
    ])

  const visibleProjectIds = new Set(
    projectRows
      .filter((project) => project.status !== "paused" && !project.archivedAt)
      .map((project) => project.id)
  )
  const archivedProjectSummaries = new Map<
    string,
    { taskCount: number; completedTaskCount: number }
  >()
  const tasksByProjectId = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"][number]["tasks"]
  >()
  const taskModelsById = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"][number]["tasks"][number]
  >()

  for (const task of taskRows) {
    if (task.projectArchivedAt) {
      const currentSummary = archivedProjectSummaries.get(task.projectId) ?? {
        taskCount: 0,
        completedTaskCount: 0,
      }
      currentSummary.taskCount += 1
      if (task.completed) {
        currentSummary.completedTaskCount += 1
      }
      archivedProjectSummaries.set(task.projectId, currentSummary)
    }

    if (!visibleProjectIds.has(task.projectId)) {
      continue
    }

    const current = tasksByProjectId.get(task.projectId) ?? []
    const taskModel = {
      id: task.id,
      title: task.title,
      completed: task.completed,
      priority: task.priority,
      plannedDate: task.plannedDate,
      notes: [],
    }
    current.push(taskModel)
    taskModelsById.set(task.id, taskModel)
    tasksByProjectId.set(task.projectId, current)
  }

  const containerNotesByContainerId = new Map<
    string,
    AreaWorkspace["containers"][number]["notes"]
  >()
  const projectNotesByProjectId = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"][number]["notes"]
  >()
  const taskNotesByTaskId = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"][number]["tasks"][number]["notes"]
  >()

  for (const note of noteRows) {
    if (note.projectId && (!visibleProjectIds.has(note.projectId) || note.projectArchivedAt)) {
      continue
    }

    const normalizedNote = {
      id: note.id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
    }

    if (note.taskId) {
      const currentTaskNotes = taskNotesByTaskId.get(note.taskId) ?? []
      currentTaskNotes.push(normalizedNote)
      taskNotesByTaskId.set(note.taskId, currentTaskNotes)

      const taskModel = taskModelsById.get(note.taskId)
      if (taskModel) {
        taskModel.notes.push(normalizedNote)
      }
      continue
    }

    if (note.projectId) {
      const currentProjectNotes = projectNotesByProjectId.get(note.projectId) ?? []
      currentProjectNotes.push(normalizedNote)
      projectNotesByProjectId.set(note.projectId, currentProjectNotes)
      continue
    }

    if (!note.containerId) {
      continue
    }

    const currentContainerNotes = containerNotesByContainerId.get(note.containerId) ?? []
    currentContainerNotes.push(normalizedNote)
    containerNotesByContainerId.set(note.containerId, currentContainerNotes)
  }

  const projectsByContainerId = new Map<
    string,
    AreaWorkspace["containers"][number]["projects"]
  >()
  const archivedProjectsByContainerId = new Map<
    string,
    AreaWorkspace["containers"][number]["archivedProjects"]
  >()
  for (const project of projectRows) {
    if (project.archivedAt) {
      const currentArchivedProjects = archivedProjectsByContainerId.get(project.containerId) ?? []
      const summary = archivedProjectSummaries.get(project.id) ?? {
        taskCount: 0,
        completedTaskCount: 0,
      }

      currentArchivedProjects.push({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        priority: project.priority,
        archivedAt: project.archivedAt,
        taskCount: summary.taskCount,
        completedTaskCount: summary.completedTaskCount,
      })

      archivedProjectsByContainerId.set(project.containerId, currentArchivedProjects)
      continue
    }

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
      notes: projectNotesByProjectId.get(project.id) ?? [],
      tasks: tasksByProjectId.get(project.id) ?? [],
    })
    projectsByContainerId.set(project.containerId, current)
  }

  return {
    area,
    activeNotes,
    archivedNotes,
    containers: containerRows.map((container) => ({
      id: container.id,
      name: container.name,
      description: container.description,
      notes: containerNotesByContainerId.get(container.id) ?? [],
      projects: projectsByContainerId.get(container.id) ?? [],
      archivedProjects: archivedProjectsByContainerId.get(container.id) ?? [],
    })),
  }
}

export async function createTask(input: CreateTaskInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (project.archivedAt || project.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canCreateTasksInProject(project.status)) {
    throw new DomainError("invalid_state", "Project does not allow new tasks.")
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

  return requireMutationResult(task, "Project changed before the task could be created.")
}

export async function createProject(input: CreateProjectInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container || container.archived) {
    throw new DomainError(
      !container ? "not_found" : "archived_context",
      "Container not found."
    )
  }

  const [project] = await database
    .insert(projects)
    .values({
      containerId: input.containerId,
      title: input.title,
      description: null,
      status: "backlog",
      priority: "medium",
    })
    .returning({
      id: projects.id,
      title: projects.title,
      status: projects.status,
    })

  return requireMutationResult(project, "Container changed before the project could be created.")
}

export async function updateProjectDetails(input: UpdateProjectDetailsInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (project.archivedAt || project.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canMutateTasksInProject(project.status)) {
    throw new DomainError("invalid_state", "Project cannot be edited in this state.")
  }

  const description = input.description?.trim() ? input.description.trim() : null

  const [updatedProject] = await database
    .update(projects)
    .set({
      title: input.title,
      description,
    })
    .where(and(eq(projects.id, input.projectId), eq(projects.status, project.status), isNull(projects.archivedAt)))
    .returning({
      id: projects.id,
      title: projects.title,
      description: projects.description,
    })

  return requireMutationResult(updatedProject, "Project changed before it could be updated.")
}

export async function toggleTaskCompletion(input: ToggleTaskCompletionInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canMutateTasksInProject(task.projectStatus)) {
    throw new DomainError("invalid_state", "Project task cannot be toggled in this state.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      completed: input.completed,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, task.completed)))
    .returning({
      id: tasks.id,
      completed: tasks.completed,
    })

  return requireMutationResult(updatedTask, "Task changed before it could be updated.")
}

export async function planTaskForToday(input: PlanTaskForTodayInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canPlanTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: getDateDaysFromNow(0),
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return requireMutationResult(updatedTask, "Task changed before it could be planned.")
}

export async function planTaskForTomorrow(input: PlanTaskForTomorrowInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canPlanTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: getDateDaysFromNow(1),
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return requireMutationResult(updatedTask, "Task changed before it could be planned.")
}

export async function setTaskPlannedDate(input: SetTaskPlannedDateInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canPlanTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Project does not allow planning.")
  }

  const plannedDate = parseDateInput(input.plannedDate)

  if (!plannedDate) {
    throw new DomainError("constraint_violation", "Invalid planning date.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return requireMutationResult(updatedTask, "Task changed before it could be planned.")
}

export async function clearTaskPlannedDate(input: ClearTaskPlannedDateInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canPlanTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Project does not allow planning.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      plannedDate: null,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      plannedDate: tasks.plannedDate,
    })

  return requireMutationResult(updatedTask, "Task changed before its date could be cleared.")
}

export async function updateProjectStatus(input: UpdateProjectStatusInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (project.archivedAt || project.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  const [updatedProject] = await database
    .update(projects)
    .set({
      status: input.status,
    })
    .where(and(eq(projects.id, input.projectId), eq(projects.status, project.status), isNull(projects.archivedAt)))
    .returning({
      id: projects.id,
      status: projects.status,
    })

  return requireMutationResult(updatedProject, "Project changed before its status could be updated.")
}

export async function updateProjectPriority(input: UpdateProjectPriorityInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (project.archivedAt || project.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canMutateTasksInProject(project.status)) {
    throw new DomainError("invalid_state", "Project cannot be edited in this state.")
  }

  const [updatedProject] = await database
    .update(projects)
    .set({
      priority: input.priority,
    })
    .where(and(eq(projects.id, input.projectId), eq(projects.status, project.status), isNull(projects.archivedAt)))
    .returning({
      id: projects.id,
      priority: projects.priority,
    })

  return requireMutationResult(updatedProject, "Project changed before its priority could be updated.")
}

export async function updateTaskPriority(input: UpdateTaskPriorityInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canEditTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Task cannot be updated in this state.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      priority: input.priority,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      priority: tasks.priority,
    })

  return requireMutationResult(updatedTask, "Task changed before its priority could be updated.")
}

export async function updateTaskDetails(input: UpdateTaskDetailsInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canEditTask(task.projectStatus, task.completed)) {
    throw new DomainError("invalid_state", "Task cannot be updated in this state.")
  }

  const [updatedTask] = await database
    .update(tasks)
    .set({
      title: input.title,
    })
    .where(and(eq(tasks.id, input.taskId), eq(tasks.completed, false)))
    .returning({
      id: tasks.id,
      title: tasks.title,
    })

  return requireMutationResult(updatedTask, "Task changed before it could be updated.")
}

export async function deleteTask(input: DeleteTaskInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task) {
    throw new DomainError("not_found", "Task not found.")
  }

  if (task.projectArchivedAt || task.containerArchived) {
    throw new DomainError("archived_context", "Project archived.")
  }

  if (!canMutateTasksInProject(task.projectStatus)) {
    throw new DomainError("invalid_state", "Task cannot be deleted in this project state.")
  }

  const [deletedTask] = await database
    .delete(tasks)
    .where(eq(tasks.id, input.taskId))
    .returning({
      id: tasks.id,
    })

  return requireMutationResult(deletedTask, "Task changed before it could be deleted.")
}

export async function archiveProject(input: ArchiveProjectInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (project.archivedAt) {
    throw new DomainError("invalid_state", "Project already archived.")
  }

  if (project.containerArchived) {
    throw new DomainError("archived_context", "Container archived.")
  }

  if (!canMutateTasksInProject(project.status)) {
    throw new DomainError("invalid_state", "Project cannot be archived in this state.")
  }

  const [archivedProject] = await database
    .update(projects)
    .set({
      archivedAt: new Date(),
    })
    .where(and(eq(projects.id, input.projectId), isNull(projects.archivedAt)))
    .returning({
      id: projects.id,
      archivedAt: projects.archivedAt,
      status: projects.status,
    })

  return requireMutationResult(archivedProject, "Project changed before it could be archived.")
}

export async function restoreProject(input: RestoreProjectInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (!project.archivedAt) {
    throw new DomainError("invalid_state", "Project is not archived.")
  }

  const [restoredProject] = await database
    .update(projects)
    .set({
      archivedAt: null,
    })
    .where(and(eq(projects.id, input.projectId), isNotNull(projects.archivedAt)))
    .returning({
      id: projects.id,
      archivedAt: projects.archivedAt,
      status: projects.status,
    })

  return requireMutationResult(restoredProject, "Project changed before it could be restored.")
}

export async function deleteProject(input: DeleteProjectInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project) {
    throw new DomainError("not_found", "Project not found.")
  }

  if (!project.archivedAt) {
    throw new DomainError("invalid_state", "Project must be archived before deletion.")
  }

  const [deletedProject] = await database
    .delete(projects)
    .where(and(eq(projects.id, input.projectId), isNotNull(projects.archivedAt)))
    .returning({
      id: projects.id,
    })

  return requireMutationResult(deletedProject, "Project changed before it could be deleted.")
}
