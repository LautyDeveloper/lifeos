import { and, asc, desc, eq, ilike, isNull, ne, or } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, inboxItems, notes, projects, tasks } from "@/db/schema"
import type { CommandResult } from "@/features/command/types"

type RankedResult = CommandResult & {
  score: number
  orderDate: number
}

function getTextPreview(value: string, max = 100) {
  const normalized = value.replace(/\s+/g, " ").trim()
  return normalized.length <= max ? normalized : `${normalized.slice(0, max - 3)}...`
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getQueryScore(query: string, primary: string, secondary?: string) {
  const q = normalize(query)
  const title = normalize(primary)
  const detail = normalize(secondary ?? "")

  if (!q) {
    return 0
  }

  if (title === q) {
    return 400
  }

  if (title.startsWith(q)) {
    return 320
  }

  if (title.includes(q)) {
    return 240
  }

  if (detail.startsWith(q)) {
    return 180
  }

  if (detail.includes(q)) {
    return 120
  }

  return 0
}

function sortRankedResults(results: RankedResult[]) {
  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }

      if (b.orderDate !== a.orderDate) {
        return b.orderDate - a.orderDate
      }

      return a.title.localeCompare(b.title, "es")
    })
    .slice(0, 18)
    .map((result) => ({
      id: result.id,
      type: result.type,
      title: result.title,
      subtitle: result.subtitle,
      href: result.href,
      actionKey: result.actionKey,
    }))
}

export async function searchCommandSurface(query: string): Promise<CommandResult[]> {
  if (!db) {
    return []
  }

  const trimmed = query.trim()

  if (!trimmed) {
    return []
  }

  const pattern = `%${trimmed}%`

  const [
    projectRows,
    taskRows,
    libraryNoteRows,
    operationalNoteRows,
    inboxRows,
  ] = await Promise.all([
    db
      .select({
        id: projects.id,
      title: projects.title,
      status: projects.status,
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .where(
        and(
          ne(projects.status, "paused"),
          isNull(projects.archivedAt),
          eq(containers.archived, false),
          or(ilike(projects.title, pattern), ilike(projects.description, pattern))
        )
      )
      .orderBy(asc(areas.sortOrder), asc(containers.sortOrder), asc(projects.title))
      .limit(10),
    db
      .select({
      id: tasks.id,
      title: tasks.title,
      completed: tasks.completed,
      plannedDate: tasks.plannedDate,
      projectId: projects.id,
        projectTitle: projects.title,
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .where(
        and(
          ne(projects.status, "paused"),
          isNull(projects.archivedAt),
          eq(containers.archived, false),
          ilike(tasks.title, pattern)
        )
      )
      .orderBy(desc(tasks.createdAt))
      .limit(10),
    db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(
        and(
          isNull(notes.containerId),
          isNull(notes.projectId),
          isNull(notes.taskId),
          isNull(notes.archivedAt),
          or(ilike(notes.title, pattern), ilike(notes.content, pattern))
        )
      )
      .orderBy(desc(notes.updatedAt))
      .limit(10),
    db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        updatedAt: notes.updatedAt,
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
        projectId: projects.id,
        projectTitle: projects.title,
        projectStatus: projects.status,
        taskId: tasks.id,
        taskTitle: tasks.title,
      })
      .from(notes)
      .innerJoin(containers, eq(containers.id, notes.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .leftJoin(projects, eq(projects.id, notes.projectId))
      .leftJoin(tasks, eq(tasks.id, notes.taskId))
      .where(
        and(
          eq(containers.archived, false),
          isNull(notes.archivedAt),
          or(isNull(notes.projectId), isNull(projects.archivedAt)),
          or(ilike(notes.title, pattern), ilike(notes.content, pattern))
        )
      )
      .orderBy(desc(notes.updatedAt))
      .limit(12),
    db
      .select({
        id: inboxItems.id,
      content: inboxItems.content,
        capturedAt: inboxItems.capturedAt,
      })
      .from(inboxItems)
      .where(and(isNull(inboxItems.processedAt), ilike(inboxItems.content, pattern)))
      .orderBy(desc(inboxItems.capturedAt))
      .limit(8),
  ])

  const rankedResults: RankedResult[] = [
    ...projectRows.map((project) => ({
      id: project.id,
      type: "project" as const,
      entityId: project.id,
      projectStatus: project.status,
      title: project.title,
      subtitle: `${project.areaName} · ${project.containerName}`,
      href: `/${project.areaSlug}#project-${project.id}`,
      score: getQueryScore(trimmed, project.title, project.containerName),
      orderDate: project.createdAt.getTime(),
    })),
    ...taskRows.map((task) => ({
      id: task.id,
      type: "task" as const,
      entityId: task.id,
      projectId: task.projectId,
      plannedDate: task.plannedDate ? task.plannedDate.toISOString() : null,
      title: task.title,
      subtitle: `${task.areaName} · ${task.projectTitle}${task.completed ? " · Completada" : ""}`,
      href: `/${task.areaSlug}#project-${task.projectId}`,
      score: getQueryScore(trimmed, task.title, `${task.projectTitle} ${task.containerName}`),
      orderDate: task.createdAt.getTime(),
    })),
    ...libraryNoteRows.map((note) => ({
      id: note.id,
      type: "library-note" as const,
      title: note.title,
      subtitle: `Biblioteca · ${getTextPreview(note.content, 80)}`,
      href: `/library?note=${note.id}`,
      score: getQueryScore(trimmed, note.title, note.content),
      orderDate: note.updatedAt.getTime(),
    })),
    ...operationalNoteRows
      .filter((note) => note.projectStatus !== "paused")
      .map((note) => {
        const kindLabel = note.taskId
          ? `${note.containerName} · ${note.projectTitle ?? "Proyecto"} · ${note.taskTitle ?? "Tarea"}`
          : note.projectId
            ? `${note.containerName} · ${note.projectTitle ?? "Proyecto"}`
            : note.containerName

        return {
          id: note.id,
          type: "operational-note" as const,
          entityId: note.id,
          title: note.title,
          subtitle: `${kindLabel} · ${getTextPreview(note.content, 68)}`,
          href: `/${note.areaSlug}#note-${note.id}`,
          score: getQueryScore(trimmed, note.title, `${kindLabel} ${note.content}`),
          orderDate: note.updatedAt.getTime(),
        }
      }),
    ...inboxRows.map((item) => ({
      id: item.id,
      type: "inbox-item" as const,
      entityId: item.id,
      rawContent: item.content,
      title: getTextPreview(item.content, 90),
      subtitle: `Inbox · ${new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "short",
      }).format(item.capturedAt)}`,
      href: "/inbox",
      score: getQueryScore(trimmed, item.content, "Inbox"),
      orderDate: item.capturedAt.getTime(),
    })),
  ]

  return sortRankedResults(rankedResults)
}
