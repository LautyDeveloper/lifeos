import { and, asc, count, desc, eq, isNotNull, isNull, lt, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, inboxItems, notes, projects, tasks } from "@/db/schema"
import { getDateDaysAgo } from "@/lib/dates"
import type { Priority } from "@/types/domain"

export type ReviewSummary = {
  databaseReady: boolean
  pendingInboxItems: Array<{
    id: string
    content: string
    capturedAt: Date
    href: string
  }>
  unplannedTasks: Array<{
    id: string
    title: string
    priority: Priority
    createdAt: Date
    href: string
    area: {
      slug: string
      name: string
    }
    container: {
      name: string
    }
    project: {
      id: string
      title: string
    }
  }>
  backlogProjects: Array<{
    id: string
    title: string
    priority: Priority
    href: string
    taskCount: number
    area: {
      slug: string
      name: string
    }
    container: {
      name: string
    }
  }>
  staleOperationalNotes: Array<{
    id: string
    title: string
    content: string
    updatedAt: Date
    href: string
    kind: "container" | "project" | "task"
    area: {
      slug: string
      name: string
    }
    container: {
      name: string
    }
    project: {
      id: string | null
      title: string | null
    }
    task: {
      id: string | null
      title: string | null
    }
  }>
  archivedOperationalNotes: Array<{
    id: string
    title: string
    content: string
    archivedAt: Date | null
    href: string
    kind: "container" | "project" | "task"
    area: {
      slug: string
      name: string
    }
    container: {
      name: string
    }
    project: {
      id: string | null
      title: string | null
    }
    task: {
      id: string | null
      title: string | null
    }
  }>
}

function getOperationalNoteHref(areaSlug: string, noteId: string) {
  return `/${areaSlug}#note-${noteId}`
}

export async function getReviewSummary(now: Date = new Date()): Promise<ReviewSummary> {
  if (!db) {
    return {
      databaseReady: false,
      pendingInboxItems: [],
      unplannedTasks: [],
      backlogProjects: [],
      staleOperationalNotes: [],
      archivedOperationalNotes: [],
    }
  }

  const staleThreshold = getDateDaysAgo(30, now)

  const [
    pendingInboxItems,
    unplannedTasks,
    backlogProjects,
    staleOperationalNotes,
    archivedOperationalNotes,
  ] = await Promise.all([
    db
      .select({
        id: inboxItems.id,
        content: inboxItems.content,
        capturedAt: inboxItems.capturedAt,
      })
      .from(inboxItems)
      .where(isNull(inboxItems.processedAt))
      .orderBy(asc(inboxItems.capturedAt)),
    db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        createdAt: tasks.createdAt,
        projectId: projects.id,
        projectTitle: projects.title,
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
      })
      .from(tasks)
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .where(
        and(
          eq(tasks.completed, false),
          isNull(tasks.plannedDate),
          eq(projects.status, "active"),
          eq(containers.archived, false)
        )
      )
      .orderBy(
        asc(areas.sortOrder),
        asc(containers.sortOrder),
        sql`case ${tasks.priority} when 'urgent' then 1 when 'high' then 2 when 'medium' then 3 else 4 end`,
        asc(tasks.createdAt)
      ),
    db
      .select({
        id: projects.id,
        title: projects.title,
        priority: projects.priority,
        taskCount: count(tasks.id),
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
      })
      .from(projects)
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .where(and(eq(projects.status, "backlog"), eq(containers.archived, false)))
      .groupBy(
        projects.id,
        projects.title,
        projects.priority,
        containers.name,
        areas.slug,
        areas.name,
        areas.sortOrder,
        containers.sortOrder
      )
      .orderBy(asc(areas.sortOrder), asc(containers.sortOrder), asc(projects.title)),
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
          isNotNull(notes.containerId),
          lt(notes.updatedAt, staleThreshold)
        )
      )
      .orderBy(asc(notes.updatedAt), asc(areas.sortOrder), asc(containers.sortOrder), asc(notes.title)),
    db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        archivedAt: notes.archivedAt,
        containerName: containers.name,
        areaSlug: areas.slug,
        areaName: areas.name,
        projectId: projects.id,
        projectTitle: projects.title,
        taskId: tasks.id,
        taskTitle: tasks.title,
      })
      .from(notes)
      .innerJoin(containers, eq(containers.id, notes.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .leftJoin(projects, eq(projects.id, notes.projectId))
      .leftJoin(tasks, eq(tasks.id, notes.taskId))
      .where(and(eq(containers.archived, false), isNotNull(notes.archivedAt), isNotNull(notes.containerId)))
      .orderBy(desc(notes.archivedAt), asc(areas.sortOrder), asc(containers.sortOrder), asc(notes.title)),
  ])

  return {
    databaseReady: true,
    pendingInboxItems: pendingInboxItems.map((item) => ({
      ...item,
      href: "/inbox",
    })),
    unplannedTasks: unplannedTasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      createdAt: task.createdAt,
      href: `/${task.areaSlug}#project-${task.projectId}`,
      area: {
        slug: task.areaSlug,
        name: task.areaName,
      },
      container: {
        name: task.containerName,
      },
      project: {
        id: task.projectId,
        title: task.projectTitle,
      },
    })),
    backlogProjects: backlogProjects.map((project) => ({
      id: project.id,
      title: project.title,
      priority: project.priority,
      href: `/${project.areaSlug}#project-${project.id}`,
      taskCount: project.taskCount,
      area: {
        slug: project.areaSlug,
        name: project.areaName,
      },
      container: {
        name: project.containerName,
      },
    })),
    staleOperationalNotes: staleOperationalNotes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      href: getOperationalNoteHref(note.areaSlug, note.id),
      kind: note.taskId ? "task" : note.projectId ? "project" : "container",
      area: {
        slug: note.areaSlug,
        name: note.areaName,
      },
      container: {
        name: note.containerName,
      },
      project: {
        id: note.projectId,
        title: note.projectTitle,
      },
      task: {
        id: note.taskId,
        title: note.taskTitle,
      },
    })),
    archivedOperationalNotes: archivedOperationalNotes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      archivedAt: note.archivedAt,
      href: getOperationalNoteHref(note.areaSlug, note.id),
      kind: note.taskId ? "task" : note.projectId ? "project" : "container",
      area: {
        slug: note.areaSlug,
        name: note.areaName,
      },
      container: {
        name: note.containerName,
      },
      project: {
        id: note.projectId,
        title: note.projectTitle,
      },
      task: {
        id: note.taskId,
        title: note.taskTitle,
      },
    })),
  }
}
