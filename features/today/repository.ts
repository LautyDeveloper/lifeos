import { and, asc, count, eq, gte, lt, ne, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"
import { getTodayRange } from "@/lib/dates"

export type TodayTask = {
  id: string
  title: string
  completed: boolean
  plannedDate: Date | null
  priority: "low" | "medium" | "high" | "urgent"
  originHref: string
  project: {
    id: string
    title: string
  }
  container: {
    id: string
    name: string
  }
  area: {
    id: string
    name: string
  }
}

export async function getTodayTasks(now: Date = new Date()): Promise<TodayTask[]> {
  if (!db) {
    return []
  }

  const { start, end } = getTodayRange(now)

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      completed: tasks.completed,
      plannedDate: tasks.plannedDate,
      priority: tasks.priority,
      projectId: projects.id,
      projectTitle: projects.title,
      containerId: containers.id,
      containerName: containers.name,
      areaId: areas.id,
      areaName: areas.name,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .innerJoin(areas, eq(areas.id, containers.areaId))
    .where(
      and(
        gte(tasks.plannedDate, start),
        lt(tasks.plannedDate, end),
        eq(tasks.completed, false),
        ne(projects.status, "paused")
      )
    )
    .orderBy(
      sql`case ${tasks.priority} when 'urgent' then 1 when 'high' then 2 when 'medium' then 3 else 4 end`,
      asc(tasks.createdAt)
    )

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed,
    plannedDate: row.plannedDate,
    priority: row.priority,
    originHref: `/${({ Trabajo: "work", Dev: "dev", Estudio: "study", Salud: "health" } as Record<string, string>)[row.areaName] ?? ""}#project-${row.projectId}`,
    project: {
      id: row.projectId,
      title: row.projectTitle,
    },
    container: {
      id: row.containerId,
      name: row.containerName,
    },
    area: {
      id: row.areaId,
      name: row.areaName,
    },
  }))
}

export async function getTodayProgress(now: Date = new Date()) {
  if (!db) return { completed: 0, total: 0 }
  const { start, end } = getTodayRange(now)
  const rows = await db
    .select({ completed: tasks.completed, value: count() })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(and(gte(tasks.plannedDate, start), lt(tasks.plannedDate, end), ne(projects.status, "paused")))
    .groupBy(tasks.completed)

  return {
    completed: rows.find((row) => row.completed)?.value ?? 0,
    total: rows.reduce((sum, row) => sum + row.value, 0),
  }
}
