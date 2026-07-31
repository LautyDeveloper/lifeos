import { and, count, desc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { areas, containers, projects, tasks } from "@/db/schema"

export type ParkingProject = {
  id: string
  title: string
  description: string | null
  status: string
  priority: "low" | "medium" | "high" | "urgent"
  area: {
    id: string
    name: string
  }
  container: {
    id: string
    name: string
  }
  taskSummary: {
    total: number
    pending: number
  }
}

export async function getParkingProjects(): Promise<ParkingProject[]> {
  if (!db) {
    return []
  }

  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      priority: projects.priority,
      areaId: areas.id,
      areaName: areas.name,
      containerId: containers.id,
      containerName: containers.name,
      totalTasks: count(tasks.id),
      pendingTasks: sql<number>`sum(case when ${tasks.completed} = false then 1 else 0 end)`,
    })
    .from(projects)
    .innerJoin(containers, eq(containers.id, projects.containerId))
    .innerJoin(areas, eq(areas.id, containers.areaId))
    .leftJoin(tasks, eq(tasks.projectId, projects.id))
    .where(and(eq(projects.status, "paused"), eq(containers.archived, false)))
    .groupBy(
      projects.id,
      projects.title,
      projects.description,
      projects.status,
      projects.priority,
      areas.id,
      areas.name,
      containers.id,
      containers.name
    )
    .orderBy(desc(projects.createdAt))

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    area: {
      id: row.areaId,
      name: row.areaName,
    },
    container: {
      id: row.containerId,
      name: row.containerName,
    },
    taskSummary: {
      total: row.totalTasks,
      pending: row.pendingTasks,
    },
  }))
}
