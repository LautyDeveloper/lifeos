import { and, desc, eq, isNull } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import {
  areas,
  containers,
  inboxItems,
  notes,
  priorityEnum,
  projects,
  projectStatusEnum,
  tasks,
} from "@/db/schema"
import type {
  CreateInboxItemInput,
  ProcessInboxToNoteInput,
  ProcessInboxToProjectInput,
  ProcessInboxToTaskInput,
} from "@/features/inbox/schemas"

export async function listActiveInboxItems() {
  if (!db) {
    return []
  }

  return db
    .select({
      id: inboxItems.id,
      content: inboxItems.content,
      capturedAt: inboxItems.capturedAt,
      processedAt: inboxItems.processedAt,
    })
    .from(inboxItems)
    .where(isNull(inboxItems.processedAt))
    .orderBy(desc(inboxItems.capturedAt))
}

export async function createInboxItem(input: CreateInboxItemInput) {
  const database = getDbOrThrow()

  const [item] = await database
    .insert(inboxItems)
    .values({
      content: input.content,
    })
    .returning({
      id: inboxItems.id,
      content: inboxItems.content,
      capturedAt: inboxItems.capturedAt,
      processedAt: inboxItems.processedAt,
    })

  return item
}

export async function getInboxItemById(id: string) {
  if (!db) {
    return null
  }

  const [item] = await db
    .select({
      id: inboxItems.id,
      content: inboxItems.content,
      capturedAt: inboxItems.capturedAt,
      processedAt: inboxItems.processedAt,
    })
    .from(inboxItems)
    .where(eq(inboxItems.id, id))
    .limit(1)

  return item ?? null
}

export async function listAreasWithContainers() {
  if (!db) {
    return []
  }

  const rows = await db
    .select({
      areaId: areas.id,
      areaName: areas.name,
      areaSortOrder: areas.sortOrder,
      containerId: containers.id,
      containerName: containers.name,
      containerSortOrder: containers.sortOrder,
    })
    .from(areas)
    .innerJoin(containers, eq(containers.areaId, areas.id))
    .where(eq(containers.archived, false))
    .orderBy(areas.sortOrder, containers.sortOrder, areas.name, containers.name)

  const grouped = new Map<
    string,
    {
      id: string
      name: string
      containers: { id: string; name: string }[]
    }
  >()

  for (const row of rows) {
    const existingArea = grouped.get(row.areaId)

    if (existingArea) {
      existingArea.containers.push({
        id: row.containerId,
        name: row.containerName,
      })
      continue
    }

    grouped.set(row.areaId, {
      id: row.areaId,
      name: row.areaName,
      containers: [
        {
          id: row.containerId,
          name: row.containerName,
        },
      ],
    })
  }

  return [...grouped.values()]
}

export async function listProjectOptions() {
  if (!db) {
    return []
  }

  return db
    .select({
      id: projects.id,
      title: projects.title,
      containerName: containers.name,
      areaName: areas.name,
      areaSortOrder: areas.sortOrder,
      containerSortOrder: containers.sortOrder,
    })
    .from(projects)
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .innerJoin(areas, eq(areas.id, containers.areaId))
    .where(eq(containers.archived, false))
    .orderBy(areas.sortOrder, containers.sortOrder, projects.title)
}
export async function processInboxItemToProject(input: ProcessInboxToProjectInput) {
  const database = getDbOrThrow()

  const [item] = await database
    .select({
      id: inboxItems.id,
    })
    .from(inboxItems)
    .where(and(eq(inboxItems.id, input.inboxItemId), isNull(inboxItems.processedAt)))
    .limit(1)

  if (!item) {
    throw new Error("Inbox item not available.")
  }

  const [project] = await database
    .insert(projects)
    .values({
      containerId: input.containerId,
      title: input.title,
      description: input.description,
      priority: "medium" satisfies (typeof priorityEnum.enumValues)[number],
      status: "backlog" satisfies (typeof projectStatusEnum.enumValues)[number],
    })
    .returning({
      id: projects.id,
      title: projects.title,
    })

  await database
    .update(inboxItems)
    .set({
      processedAt: new Date(),
    })
    .where(eq(inboxItems.id, input.inboxItemId))

  return project
}

export async function processInboxItemToTask(input: ProcessInboxToTaskInput) {
  const database = getDbOrThrow()

  const [item] = await database
    .select({
      id: inboxItems.id,
    })
    .from(inboxItems)
    .where(and(eq(inboxItems.id, input.inboxItemId), isNull(inboxItems.processedAt)))
    .limit(1)

  if (!item) {
    throw new Error("Inbox item not available.")
  }

  const [task] = await database
    .insert(tasks)
    .values({
      projectId: input.projectId,
      title: input.title,
      priority: "medium" satisfies (typeof priorityEnum.enumValues)[number],
    })
    .returning({
      id: tasks.id,
      title: tasks.title,
    })

  await database
    .update(inboxItems)
    .set({
      processedAt: new Date(),
    })
    .where(eq(inboxItems.id, input.inboxItemId))

  return task
}

export async function processInboxItemToNote(input: ProcessInboxToNoteInput) {
  const database = getDbOrThrow()

  const [item] = await database
    .select({
      id: inboxItems.id,
    })
    .from(inboxItems)
    .where(and(eq(inboxItems.id, input.inboxItemId), isNull(inboxItems.processedAt)))
    .limit(1)

  if (!item) {
    throw new Error("Inbox item not available.")
  }

  const [note] = await database
    .insert(notes)
    .values({
      title: input.title,
      content: input.content,
      containerId: null,
      projectId: null,
      taskId: null,
    })
    .returning({
      id: notes.id,
      title: notes.title,
    })

  await database
    .update(inboxItems)
    .set({
      processedAt: new Date(),
    })
    .where(eq(inboxItems.id, input.inboxItemId))

  return note
}
