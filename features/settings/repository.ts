import { and, asc, eq, max } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { areas, containers, notes, projects, tasks } from "@/db/schema"
import type {
  ArchiveContainerInput,
  CreateContainerInput,
  MoveAreaInput,
  MoveContainerInput,
  RestoreContainerInput,
  UpdateAreaDetailsInput,
  UpdateContainerDetailsInput,
} from "@/features/settings/schemas"
import { DomainError } from "@/lib/domain-errors"

export type SystemSetup = {
  areas: Array<{
    id: string
    slug: string
    name: string
    icon: string
    color: string
    sortOrder: number
    containers: Array<{
      id: string
      name: string
      description: string | null
      archived: boolean
      sortOrder: number
      projectCount: number
      taskCount: number
      noteCount: number
    }>
  }>
}

type AreaRecord = {
  id: string
  slug: string
  sortOrder: number
}

type ContainerRecord = {
  id: string
  areaId: string
  archived: boolean
  sortOrder: number
}

async function getAreaRecord(areaId: string): Promise<AreaRecord | null> {
  const database = getDbOrThrow()
  const [area] = await database
    .select({
      id: areas.id,
      slug: areas.slug,
      sortOrder: areas.sortOrder,
    })
    .from(areas)
    .where(eq(areas.id, areaId))
    .limit(1)

  return area ?? null
}

async function getContainerRecord(containerId: string): Promise<ContainerRecord | null> {
  const database = getDbOrThrow()
  const [container] = await database
    .select({
      id: containers.id,
      areaId: containers.areaId,
      archived: containers.archived,
      sortOrder: containers.sortOrder,
    })
    .from(containers)
    .where(eq(containers.id, containerId))
    .limit(1)

  return container ?? null
}

export async function getSystemSetup(): Promise<SystemSetup | null> {
  if (!db) {
    return null
  }

  const [areaRows, containerRows, projectRowsAccurate, noteRowsAccurate, taskRowsAccurate] = await Promise.all([
    db
      .select({
        id: areas.id,
        slug: areas.slug,
        name: areas.name,
        icon: areas.icon,
        color: areas.color,
        sortOrder: areas.sortOrder,
      })
      .from(areas)
      .orderBy(asc(areas.sortOrder), asc(areas.name)),
    db
      .select({
        id: containers.id,
        areaId: containers.areaId,
        name: containers.name,
        description: containers.description,
        archived: containers.archived,
        sortOrder: containers.sortOrder,
      })
      .from(containers)
      .orderBy(asc(containers.archived), asc(containers.sortOrder), asc(containers.name)),
    db.select({ containerId: projects.containerId }).from(projects),
    db.select({ containerId: notes.containerId }).from(notes),
    db.select({ containerId: projects.containerId }).from(tasks).innerJoin(projects, eq(projects.id, tasks.projectId)),
  ])

  const projectCountByContainerId = new Map<string, number>()
  const noteCountByContainerId = new Map<string, number>()
  const taskCountByContainerId = new Map<string, number>()

  for (const row of projectRowsAccurate) {
    projectCountByContainerId.set(
      row.containerId,
      (projectCountByContainerId.get(row.containerId) ?? 0) + 1
    )
  }

  for (const row of noteRowsAccurate) {
    if (!row.containerId) continue
    noteCountByContainerId.set(
      row.containerId,
      (noteCountByContainerId.get(row.containerId) ?? 0) + 1
    )
  }

  for (const row of taskRowsAccurate) {
    taskCountByContainerId.set(
      row.containerId,
      (taskCountByContainerId.get(row.containerId) ?? 0) + 1
    )
  }

  return {
    areas: areaRows.map((area) => ({
      ...area,
      containers: containerRows
        .filter((container) => container.areaId === area.id)
        .map((container) => ({
          id: container.id,
          name: container.name,
          description: container.description,
          archived: container.archived,
          sortOrder: container.sortOrder,
          projectCount: projectCountByContainerId.get(container.id) ?? 0,
          taskCount: taskCountByContainerId.get(container.id) ?? 0,
          noteCount: noteCountByContainerId.get(container.id) ?? 0,
        })),
    })),
  }
}

export async function updateAreaDetails(input: UpdateAreaDetailsInput) {
  const database = getDbOrThrow()
  const area = await getAreaRecord(input.areaId)

  if (!area) {
    throw new DomainError("not_found", "Area not found.")
  }

  const [updatedArea] = await database
    .update(areas)
    .set({
      name: input.name,
      icon: input.icon,
      color: input.color,
    })
    .where(eq(areas.id, input.areaId))
    .returning({
      id: areas.id,
      name: areas.name,
    })

  return updatedArea
}

export async function moveArea(input: MoveAreaInput) {
  const database = getDbOrThrow()
  const siblings = await database
    .select({
      id: areas.id,
      sortOrder: areas.sortOrder,
    })
    .from(areas)
    .orderBy(asc(areas.sortOrder), asc(areas.name))

  const index = siblings.findIndex((area) => area.id === input.areaId)

  if (index === -1) {
    throw new DomainError("not_found", "Area not found.")
  }

  const swapIndex = input.direction === "up" ? index - 1 : index + 1
  const sibling = siblings[swapIndex]

  if (!sibling) {
    return { moved: false }
  }

  await database
    .update(areas)
    .set({
      sortOrder: sibling.sortOrder,
    })
    .where(eq(areas.id, input.areaId))

  await database
    .update(areas)
    .set({
      sortOrder: siblings[index].sortOrder,
    })
    .where(eq(areas.id, sibling.id))

  return { moved: true }
}

export async function createContainer(input: CreateContainerInput) {
  const database = getDbOrThrow()
  const area = await getAreaRecord(input.areaId)

  if (!area) {
    throw new DomainError("not_found", "Area not found.")
  }

  const [maxRow] = await database
    .select({
      value: max(containers.sortOrder),
    })
    .from(containers)
    .where(and(eq(containers.areaId, input.areaId), eq(containers.archived, false)))

  const [container] = await database
    .insert(containers)
    .values({
      areaId: input.areaId,
      name: input.name,
      description: input.description?.trim() ? input.description.trim() : null,
      sortOrder: (maxRow?.value ?? -1) + 1,
      archived: false,
    })
    .returning({
      id: containers.id,
      name: containers.name,
    })

  return container
}

export async function updateContainerDetails(input: UpdateContainerDetailsInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container) {
    throw new DomainError("not_found", "Container not found.")
  }

  const [updatedContainer] = await database
    .update(containers)
    .set({
      name: input.name,
      description: input.description?.trim() ? input.description.trim() : null,
    })
    .where(eq(containers.id, input.containerId))
    .returning({
      id: containers.id,
      name: containers.name,
    })

  return updatedContainer
}

export async function archiveContainer(input: ArchiveContainerInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container) {
    throw new DomainError("not_found", "Container not found.")
  }

  const [updatedContainer] = await database
    .update(containers)
    .set({
      archived: true,
    })
    .where(eq(containers.id, input.containerId))
    .returning({
      id: containers.id,
      archived: containers.archived,
    })

  return updatedContainer
}

export async function restoreContainer(input: RestoreContainerInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container) {
    throw new DomainError("not_found", "Container not found.")
  }

  const [updatedContainer] = await database
    .update(containers)
    .set({
      archived: false,
    })
    .where(eq(containers.id, input.containerId))
    .returning({
      id: containers.id,
      archived: containers.archived,
    })

  return updatedContainer
}

export async function moveContainer(input: MoveContainerInput) {
  const database = getDbOrThrow()
  const container = await getContainerRecord(input.containerId)

  if (!container) {
    throw new DomainError("not_found", "Container not found.")
  }

  const siblings = await database
    .select({
      id: containers.id,
      sortOrder: containers.sortOrder,
    })
    .from(containers)
    .where(
      and(eq(containers.areaId, container.areaId), eq(containers.archived, container.archived))
    )
    .orderBy(asc(containers.sortOrder), asc(containers.name))

  const index = siblings.findIndex((item) => item.id === input.containerId)

  if (index === -1) {
    throw new DomainError("not_found", "Container not found.")
  }

  const swapIndex = input.direction === "up" ? index - 1 : index + 1
  const sibling = siblings[swapIndex]

  if (!sibling) {
    return { moved: false }
  }

  await database
    .update(containers)
    .set({
      sortOrder: sibling.sortOrder,
    })
    .where(eq(containers.id, input.containerId))

  await database
    .update(containers)
    .set({
      sortOrder: siblings[index].sortOrder,
    })
    .where(eq(containers.id, sibling.id))

  return { moved: true }
}
