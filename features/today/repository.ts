import { and, asc, count, eq, gte, isNull, lt, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"
import { getTodayRange } from "@/lib/dates"
import type { Priority } from "@/types/domain"

export type TodayTask = {
  id: string
  title: string
  completed: boolean
  plannedDate: Date | null
  priority: Priority
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

type ExecutionBoard = {
  todayTasks: TodayTask[]
  overdueTasks: TodayTask[]
  progress: {
    completed: number
    total: number
  }
}

function mapTodayTaskRow(row: {
  id: string
  title: string
  completed: boolean
  plannedDate: Date | null
  priority: Priority
  projectId: string
  projectTitle: string
  containerId: string
  containerName: string
  areaId: string
  areaSlug: string
  areaName: string
}): TodayTask {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    plannedDate: row.plannedDate,
    priority: row.priority,
    originHref: `/${row.areaSlug}#project-${row.projectId}`,
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
  }
}

export async function getExecutionBoard(now: Date = new Date()): Promise<ExecutionBoard> {
  if (!db) {
    return {
      todayTasks: [],
      overdueTasks: [],
      progress: { completed: 0, total: 0 },
    }
  }

  const { start, end } = getTodayRange(now)

  const baseSelection = {
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
    areaSlug: areas.slug,
    areaName: areas.name,
  }

  const [todayRows, overdueRows, progress] = await Promise.all([
    db
      .select(baseSelection)
      .from(tasks)
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .where(
        and(
          gte(tasks.plannedDate, start),
          lt(tasks.plannedDate, end),
          eq(tasks.completed, false),
          eq(projects.status, "active"),
          isNull(projects.archivedAt),
          eq(containers.archived, false)
        )
      )
      .orderBy(
        sql`case ${tasks.priority} when 'urgent' then 1 when 'high' then 2 when 'medium' then 3 else 4 end`,
        asc(tasks.createdAt),
        asc(areas.sortOrder),
        asc(containers.sortOrder)
      ),
    db
      .select(baseSelection)
      .from(tasks)
      .innerJoin(projects, eq(projects.id, tasks.projectId))
      .innerJoin(containers, eq(containers.id, projects.containerId))
      .innerJoin(areas, eq(areas.id, containers.areaId))
      .where(
        and(
          lt(tasks.plannedDate, start),
          eq(tasks.completed, false),
          eq(projects.status, "active"),
          isNull(projects.archivedAt),
          eq(containers.archived, false)
        )
      )
      .orderBy(
        asc(tasks.plannedDate),
        sql`case ${tasks.priority} when 'urgent' then 1 when 'high' then 2 when 'medium' then 3 else 4 end`,
        asc(tasks.createdAt)
      ),
    getTodayProgress(now),
  ])

  return {
    todayTasks: todayRows.map(mapTodayTaskRow),
    overdueTasks: overdueRows.map(mapTodayTaskRow),
    progress,
  }
}

export async function getTodayTasks(now: Date = new Date()): Promise<TodayTask[]> {
  const board = await getExecutionBoard(now)
  return board.todayTasks
}

export async function getTodayProgress(now: Date = new Date()) {
  if (!db) return { completed: 0, total: 0 }
  const { start, end } = getTodayRange(now)
  const rows = await db
    .select({ completed: tasks.completed, value: count() })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .where(
      and(
        gte(tasks.plannedDate, start),
        lt(tasks.plannedDate, end),
        eq(projects.status, "active"),
        isNull(projects.archivedAt),
        eq(containers.archived, false)
      )
    )
    .groupBy(tasks.completed)

  return {
    completed: rows.find((row) => row.completed)?.value ?? 0,
    total: rows.reduce((sum, row) => sum + row.value, 0),
  }
}
