import { and, desc, eq, isNull } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { containers, notes, projects } from "@/db/schema"
import type {
  CreateContainerNoteInput,
  CreateProjectNoteInput,
  UpdateOperationalNoteInput,
} from "@/features/operational-notes/schemas"

export type OperationalNote = {
  id: string
  title: string
  content: string
  updatedAt: Date
  containerId: string | null
  projectId: string | null
}

type ContainerRecord = {
  id: string
  archived: boolean
}

type ProjectRecord = {
  id: string
  containerId: string
  containerArchived: boolean
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
    })
    .from(projects)
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(eq(projects.id, projectId))
    .limit(1)

  return project ?? null
}

export async function listContainerNotes(containerId: string): Promise<OperationalNote[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
    })
    .from(notes)
    .innerJoin(containers, eq(containers.id, notes.containerId))
    .where(
      and(
        eq(notes.containerId, containerId),
        isNull(notes.projectId),
        isNull(notes.archivedAt),
        eq(containers.archived, false)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)
}

export async function listProjectNotes(projectId: string): Promise<OperationalNote[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
    })
    .from(notes)
    .innerJoin(projects, eq(projects.id, notes.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(
      and(
        eq(notes.projectId, projectId),
        isNull(notes.archivedAt),
        eq(containers.archived, false)
      )
    )
    .orderBy(desc(notes.updatedAt), notes.title)
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
      containerId: notes.containerId,
      projectId: notes.projectId,
    })
    .from(notes)
    .leftJoin(containers, eq(containers.id, notes.containerId))
    .where(
      and(
        eq(notes.id, id),
        isNull(notes.archivedAt)
      )
    )
    .limit(1)

  if (!note) {
    return null
  }

  return note.containerId || note.projectId ? note : null
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
      title: input.title,
      content: input.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
    })

  return note
}

export async function createProjectNote(input: CreateProjectNoteInput) {
  const database = getDbOrThrow()
  const project = await getProjectRecord(input.projectId)

  if (!project || project.containerArchived) {
    throw new Error("Project not available.")
  }

  const [note] = await database
    .insert(notes)
    .values({
      containerId: project.containerId,
      projectId: input.projectId,
      title: input.title,
      content: input.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      updatedAt: notes.updatedAt,
      containerId: notes.containerId,
      projectId: notes.projectId,
    })

  return note
}

export async function updateOperationalNote(input: UpdateOperationalNoteInput) {
  const database = getDbOrThrow()

  const existingNote = await getOperationalNoteById(input.id)

  if (!existingNote) {
    throw new Error("Operational note not found.")
  }

  if (existingNote.containerId) {
    const container = await getContainerRecord(existingNote.containerId)

    if (!container || container.archived) {
      throw new Error("Container not available.")
    }
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
      containerId: notes.containerId,
      projectId: notes.projectId,
    })

  return updatedNote
}
