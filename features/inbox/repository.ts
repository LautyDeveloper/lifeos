import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import {
  areas,
  containers,
  inboxItems,
  notes,
  projects,
  tasks,
} from "@/db/schema"
import type {
  CreateInboxItemInput,
  ProcessInboxToNoteInput,
  ProcessInboxToProjectInput,
  ProcessInboxToTaskInput,
} from "@/features/inbox/schemas"
import { DomainError } from "@/lib/domain-errors"
import { assertDemoWritable } from "@/lib/demo-mode"

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
  assertDemoWritable()
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
    .where(
      and(
        eq(containers.archived, false),
        isNull(projects.archivedAt),
        inArray(projects.status, ["active", "backlog"])
      )
    )
    .orderBy(areas.sortOrder, containers.sortOrder, projects.title)
}

export async function processInboxItemToProject(input: ProcessInboxToProjectInput) {
  assertDemoWritable()
  const database = getDbOrThrow()
  const result = await database.execute<{ id: string; title: string }>(sql`
    with claimed as (
      update ${inboxItems}
      set processed_at = now()
      where ${inboxItems.id} = ${input.inboxItemId}
        and ${inboxItems.processedAt} is null
        and exists (
          select 1 from ${containers}
          where ${containers.id} = ${input.containerId} and ${containers.archived} = false
        )
      returning ${inboxItems.id}
    )
    insert into ${projects} (container_id, title, description, priority, status)
    select ${input.containerId}, ${input.title}, ${input.description ?? null}, 'medium', 'backlog' from claimed
    returning id, title
  `)

  const project = result.rows[0]
  if (!project) throw new DomainError("not_found", "Inbox item or container not available.")
  return project
}

export async function processInboxItemToTask(input: ProcessInboxToTaskInput) {
  assertDemoWritable()
  const database = getDbOrThrow()
  const result = await database.execute<{ id: string; title: string }>(sql`
    with claimed as (
      update ${inboxItems}
      set processed_at = now()
      where ${inboxItems.id} = ${input.inboxItemId}
        and ${inboxItems.processedAt} is null
        and exists (
          select 1 from ${projects}
          inner join ${containers} on ${containers.id} = ${projects.containerId}
          where ${projects.id} = ${input.projectId}
            and ${projects.archivedAt} is null
            and ${projects.status} in ('active', 'backlog')
            and ${containers.archived} = false
        )
      returning ${inboxItems.id}
    )
    insert into ${tasks} (project_id, title, priority)
    select ${input.projectId}, ${input.title}, 'medium' from claimed
    returning id, title
  `)

  const task = result.rows[0]
  if (!task) throw new DomainError("not_found", "Inbox item or project not available.")
  return task
}

export async function processInboxItemToNote(input: ProcessInboxToNoteInput) {
  assertDemoWritable()
  const database = getDbOrThrow()
  const result = await database.execute<{ id: string; title: string }>(sql`
    with claimed as (
      update ${inboxItems}
      set processed_at = now()
      where ${inboxItems.id} = ${input.inboxItemId} and ${inboxItems.processedAt} is null
      returning ${inboxItems.id}
    )
    insert into ${notes} (title, content)
    select ${input.title}, ${input.content} from claimed
    returning id, title
  `)

  const note = result.rows[0]
  if (!note) throw new DomainError("not_found", "Inbox item not available.")
  return note
}
