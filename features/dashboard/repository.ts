import { count, eq, isNull, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, inboxItems, projects } from "@/db/schema"
import { getTodayTasks, type TodayTask } from "@/features/today/repository"

export type DashboardSummary = {
  databaseReady: boolean
  todayTasks: TodayTask[]
  pendingCaptures: number
  activeProjects: number
  areas: Array<{ id: string; name: string; projects: number }>
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (!db) {
    return {
      databaseReady: false,
      todayTasks: [],
      pendingCaptures: 0,
      activeProjects: 0,
      areas: [],
    }
  }

  const [todayTasks, captureRows, projectRows, areaRows] = await Promise.all([
    getTodayTasks(),
    db.select({ value: count() }).from(inboxItems).where(isNull(inboxItems.processedAt)),
    db.select({ value: count() }).from(projects).where(eq(projects.status, "active")),
    db
      .select({
        id: areas.id,
        name: areas.name,
        projects: sql<number>`count(${projects.id})::int`,
      })
      .from(areas)
      .leftJoin(containers, eq(containers.areaId, areas.id))
      .leftJoin(projects, eq(projects.containerId, containers.id))
      .groupBy(areas.id, areas.name)
      .orderBy(areas.name),
  ])

  return {
    databaseReady: true,
    todayTasks,
    pendingCaptures: captureRows[0]?.value ?? 0,
    activeProjects: projectRows[0]?.value ?? 0,
    areas: areaRows,
  }
}
