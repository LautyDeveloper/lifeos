import { and, asc, eq, gte, lt } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"
import { getTodayRange } from "@/lib/dates"

export type TodayTask = {
  id: string
  title: string
  completed: boolean
  plannedDate: Date | null
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
        eq(tasks.completed, false)
      )
    )
    .orderBy(asc(tasks.createdAt), asc(areas.name), asc(containers.name), asc(projects.title))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    completed: row.completed,
    plannedDate: row.plannedDate,
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
