import { and, desc, eq, isNotNull, isNull } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { areas, containers, notes, projects, tasks } from "@/db/schema"
import type {
  ArchiveOperationalNoteInput,
  CreateContainerNoteInput,
  CreateProjectNoteInput,
  CreateTaskNoteInput,
  DeleteOperationalNoteInput,
  RestoreOperationalNoteInput,
  UpdateOperationalNoteInput,
} from "@/features/operational-notes/schemas"
import type { ProjectStatus } from "@/types/domain"

export type OperationalNote = {
  id: string
  title: string
  content: string
  updatedAt: Date
  archivedAt: Date | null
  containerId: string | null
  projectId: string | null
  taskId: string | null
}

export type AreaOperationalNoteListItem = {
  id: string
  title: string
  content: string
  updatedAt: Date
  archivedAt: Date | null
  containerId: string
  containerName: string
  projectId: string | null
  projectTitle: string | null
  taskId: string | null
  taskTitle: string | null
  kind: "container" | "project" | "task"
}

type ContainerRecord = {
  id: string
  archived: boolean
}

type ProjectRecord = {
  id: string
  containerId: string
  containerArchived: boolean
  status: ProjectStatus
}

type TaskRecord = {
  id: string
  projectId: string
  containerId: string
  containerArchived: boolean
  projectStatus: ProjectStatus
}

type OperationalNoteRecord = {
  id: string
  containerId: string | null
  projectId: string | null
  taskId: string | null
  archivedAt: Date | null
  projectStatus: ProjectStatus | null
  containerArchived: boolean | null
}

function normalizeAreaOperationalNote(row: {
  id: string
  title: string
  content: string
  updatedAt: Date
  archivedAt: Date | null
  containerId: string
  containerName: string
  projectId: string | null
  projectTitle: string | null
  taskId: string | null
  taskTitle: string | null
  projectStatus: ProjectStatus | null
}) {
  if (row.projectStatus === "paused") {
    return null
  }

  const kind = row.taskId ? "task" : row.projectId ? "project" : "container"

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt,
    containerId: row.containerId,
    containerName: row.containerName,
    projectId: row.projectId,
    projectTitle: row.projectTitle,
    taskId: row.taskId,
    taskTitle: row.taskTitle,
    kind,
  } satisfies AreaOperationalNoteListItem
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
      containerId: projects.containerId,
      containerArchived: containers.archived,
      status: projects.status,
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
      containerId: projects.containerId,
      containerArchived: containers.archived,
      projectStatus: projects.status,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(eq(tasks.id, taskId))
    .limit(1)

  return task ?? null
}

async function getOperationalNoteRecord(id: string): Promise<OperationalNoteRecord | null> {
  const database = getDbOrThrow()

  const [note] = await database
    .select({
      id: notes.id,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
      archivedAt: notes.archivedAt,
      projectStatus: projects.status,
      containerArchived: containers.archived,
    })
    .from(notes)
    .leftJoin(projects, eq(projects.id, notes.projectId))
    .leftJoin(containers, eq(containers.id, notes.containerId))
    .where(eq(notes.id, id))
    .limit(1)

  if (!note) {
    return null
  }

  return note.containerId || note.projectId || note.taskId ? note : null
}

export async function listActiveContainerNotes(containerId: string): Promise<OperationalNote[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })
    .from(notes)
    .innerJoin(containers, eq(containers.id, notes.containerId))
    .where(
      and(
        eq(notes.containerId, containerId),
        isNull(notes.projectId),
        isNull(notes.taskId),
        isNull(notes.archivedAt),
        eq(containers.archived, false)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)
}

export async function listActiveProjectNotes(projectId: string): Promise<OperationalNote[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })
    .from(notes)
    .innerJoin(projects, eq(projects.id, notes.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(
      and(
        eq(notes.projectId, projectId),
        isNull(notes.taskId),
        isNull(notes.archivedAt),
        eq(containers.archived, false)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)
}

export async function listActiveTaskNotes(taskId: string): Promise<OperationalNote[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })
    .from(notes)
    .innerJoin(tasks, eq(tasks.id, notes.taskId))
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(
      and(
        eq(notes.taskId, taskId),
        isNull(notes.archivedAt),
        eq(containers.archived, false)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)
}

export async function listAreaOperationalNotes(
  areaSlug: string
): Promise<AreaOperationalNoteListItem[]> {
  if (!db) {
    return []
  }

  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: containers.id,
      containerName: containers.name,
      projectId: projects.id,
      projectTitle: projects.title,
      taskId: tasks.id,
      taskTitle: tasks.title,
      projectStatus: projects.status,
    })
    .from(notes)
    .innerJoin(containers, eq(containers.id, notes.containerId))
    .innerJoin(areas, eq(areas.id, containers.areaId))
    .leftJoin(projects, eq(projects.id, notes.projectId))
    .leftJoin(tasks, eq(tasks.id, notes.taskId))
    .where(
      and(
        eq(areas.slug, areaSlug),
        eq(containers.archived, false),
        isNull(notes.archivedAt)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)

  return rows.map(normalizeAreaOperationalNote).filter(Boolean) as AreaOperationalNoteListItem[]
}

export async function listArchivedOperationalNotesByArea(
  areaSlug: string
): Promise<AreaOperationalNoteListItem[]> {
  if (!db) {
    return []
  }

  const rows = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: containers.id,
      containerName: containers.name,
      projectId: projects.id,
      projectTitle: projects.title,
      taskId: tasks.id,
      taskTitle: tasks.title,
      projectStatus: projects.status,
    })
    .from(notes)
    .innerJoin(containers, eq(containers.id, notes.containerId))
    .innerJoin(areas, eq(areas.id, containers.areaId))
    .leftJoin(projects, eq(projects.id, notes.projectId))
    .leftJoin(tasks, eq(tasks.id, notes.taskId))
    .where(
      and(
        eq(areas.slug, areaSlug),
        eq(containers.archived, false),
        isNotNull(notes.archivedAt)
      )
    )
    .orderBy(desc(notes.archivedAt), desc(notes.updatedAt), notes.title)

  return rows.map(normalizeAreaOperationalNote).filter(Boolean) as AreaOperationalNoteListItem[]
}

export async function getOperationalNoteById(id: string): Promise<OperationalNote | null> {
  if (!db) {
    return null
  }

  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1)

  if (!note) {
    return null
  }

  return note.containerId || note.projectId || note.taskId ? note : null
}

export async function createContainerNote(input: CreateContainerNoteInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container || container.archived) {
    throw new Error("Container not available.")
  }

  const [note] = await database
    .insert(notes)
    .values({
      containerId: input.containerId,
      projectId: null,
      taskId: null,
      title: input.title,
      content: input.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })

  return note
}

export async function createProjectNote(input: CreateProjectNoteInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project || project.containerArchived || project.status === "paused") {
    throw new Error("Project not available.")
  }

  const [note] = await database
    .insert(notes)
    .values({
      containerId: project.containerId,
      projectId: input.projectId,
      taskId: null,
      title: input.title,
      content: input.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })

  return note
}

export async function createTaskNote(input: CreateTaskNoteInput) {
  const database = getDbOrThrow()
  const task = await getTaskRecord(input.taskId)

  if (!task || task.containerArchived || task.projectStatus === "paused") {
    throw new Error("Task not available.")
  }

  const [note] = await database
    .insert(notes)
    .values({
      containerId: task.containerId,
      projectId: task.projectId,
      taskId: task.id,
      title: input.title,
      content: input.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })

  return note
}

export async function updateOperationalNote(input: UpdateOperationalNoteInput) {
  const database = getDbOrThrow()
  const existingNote = await getOperationalNoteRecord(input.id)

  if (!existingNote || existingNote.archivedAt) {
    throw new Error("Operational note not found.")
  }

  if (existingNote.containerId) {
    const container = await getContainerRecord(existingNote.containerId)

    if (!container || container.archived) {
      throw new Error("Container not available.")
    }
  }

  if (existingNote.projectStatus === "paused") {
    throw new Error("Project not available.")
  }

  const [updatedNote] = await database
    .update(notes)
    .set({
      title: input.title,
      content: input.content,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), isNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
      taskId: notes.taskId,
    })

  return updatedNote
}

export async function archiveOperationalNote(input: ArchiveOperationalNoteInput) {
  const database = getDbOrThrow()
  const existingNote = await getOperationalNoteRecord(input.id)

  if (!existingNote || existingNote.archivedAt) {
    throw new Error("Active operational note not found.")
  }

  const [archivedNote] = await database
    .update(notes)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), isNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      archivedAt: notes.archivedAt,
    })

  return archivedNote
}

export async function restoreOperationalNote(input: RestoreOperationalNoteInput) {
  const database = getDbOrThrow()
  const existingNote = await getOperationalNoteRecord(input.id)

  if (!existingNote || !existingNote.archivedAt) {
    throw new Error("Archived operational note not found.")
  }

  if (existingNote.containerId) {
    const container = await getContainerRecord(existingNote.containerId)

    if (!container || container.archived) {
      throw new Error("Container not available.")
    }
  }

  if (existingNote.projectStatus === "paused") {
    throw new Error("Project not available.")
  }

  const [restoredNote] = await database
    .update(notes)
    .set({
      archivedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), isNotNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      archivedAt: notes.archivedAt,
    })

  return restoredNote
}

export async function deleteOperationalNote(input: DeleteOperationalNoteInput) {
  const database = getDbOrThrow()
  const existingNote = await getOperationalNoteRecord(input.id)

  if (!existingNote || !existingNote.archivedAt) {
    throw new Error("Archived operational note not found.")
  }

  const [deletedNote] = await database
    .delete(notes)
    .where(and(eq(notes.id, input.id), isNotNull(notes.archivedAt)))
    .returning({
      id: notes.id,
    })

  return deletedNote
}
