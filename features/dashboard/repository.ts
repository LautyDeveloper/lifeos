import { and, count, eq, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, inboxItems, notes, projects } from "@/db/schema"
import { getTodayTasks, type TodayTask } from "@/features/today/repository"

export type DashboardSummary = {
  databaseReady: boolean
  todayTaskCount: number
  todayTasks: TodayTask[]
  pendingInboxCount: number
  activeProjectsCount: number
  areas: Array<{ id: string; name: string; projects: number }>
  recentLibraryNotes: Array<{
    id: string
    title: string
    content: string
    updatedAt: Date
  }>
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!db) {
    return {
      databaseReady: false,
      todayTaskCount: 0,
      todayTasks: [],
      pendingInboxCount: 0,
      activeProjectsCount: 0,
      areas: [],
      recentLibraryNotes: [],
    }
  }

  const [todayTasks, captureRows, projectRows, areaRows, noteRows] = await Promise.all([
    getTodayTasks(),
    db.select({ value: count() }).from(inboxItems).where(isNull(inboxItems.processedAt)),
    db
      .select({ value: count() })
      .from(projects)
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .where(and(eq(projects.status, "active"), eq(containers.archived, false))),
    db
      .select({
        id: areas.id,
        name: areas.name,
        projects: sql<number>`count(${projects.id})::int`,
      })
      .from(areas)
      .leftJoin(containers, and(eq(containers.areaId, areas.id), eq(containers.archived, false)))
      .leftJoin(projects, eq(projects.containerId, containers.id))
      .groupBy(areas.id, areas.name)
      .orderBy(areas.sortOrder, areas.name),
    db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(and(isNull(notes.containerId), isNull(notes.projectId), isNull(notes.archivedAt)))
      .orderBy(sql`${notes.updatedAt} desc`)
      .limit(4),
  ])

  return {
    databaseReady: true,
    todayTaskCount: todayTasks.length,
    todayTasks,
    pendingInboxCount: captureRows[0]?.value ?? 0,
    activeProjectsCount: projectRows[0]?.value ?? 0,
    areas: areaRows,
    recentLibraryNotes: noteRows,
  }
}
