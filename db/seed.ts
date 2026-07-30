import "dotenv/config"

import { and, eq, inArray } from "drizzle-orm"

import { getDbOrThrow } from "@/db"
import { areas, containers, inboxItems, projects, tasks } from "@/db/schema"

const areaSeeds = [
  { name: "Trabajo", icon: "BriefcaseBusiness", color: "#7dd3fc" },
  { name: "Dev", icon: "MonitorCog", color: "#60a5fa" },
  { name: "Estudio", icon: "BookOpen", color: "#a78bfa" },
  { name: "Salud", icon: "HeartPulse", color: "#34d399" },
] as const

const containerSeeds = [
  { areaName: "Trabajo", name: "Gasti", description: "Contexto operativo de trabajo." },
  { areaName: "Dev", name: "Life OS", description: "Producto principal en desarrollo." },
  { areaName: "Dev", name: "AutoPanel", description: "Proyecto técnico paralelo." },
  { areaName: "Estudio", name: "Física", description: "Materia activa para estudio." },
  { areaName: "Salud", name: "Gimnasio", description: "Entrenamiento y constancia." },
  { areaName: "Salud", name: "Alimentación", description: "Hábitos y decisiones diarias." },
  { areaName: "Salud", name: "Sueño", description: "Descanso como sistema." },
] as const

const inboxSeeds = [
  "Definir el flujo para procesar ideas del inbox.",
  "Revisar la arquitectura de proyectos antes del Sprint 3.",
  "Pensar una rutina simple para cerrar el día.",
  "Anotar ideas para la biblioteca de conocimiento.",
] as const

const projectSeeds = [
  { containerName: "Gasti", title: "Operación semanal", description: "Prioridades activas del trabajo." },
  { containerName: "Life OS", title: "MVP", description: "Entrega incremental del sistema operativo personal." },
  { containerName: "AutoPanel", title: "Roadmap", description: "Próximos hitos del producto técnico." },
  { containerName: "Física", title: "Parcial 1", description: "Plan base para preparar el parcial." },
  { containerName: "Gimnasio", title: "Rutina base", description: "Estructura mínima para sostener constancia." },
] as const

const taskSeeds = [
  { projectTitle: "Operación semanal", title: "Preparar prioridades del cliente." },
  { projectTitle: "Operación semanal", title: "Revisar entregables pendientes." },
  { projectTitle: "MVP", title: "Definir el siguiente PR del producto." },
  { projectTitle: "MVP", title: "Validar el flujo completo de inbox." },
  { projectTitle: "Roadmap", title: "Agrupar próximas iniciativas técnicas." },
  { projectTitle: "Parcial 1", title: "Resolver ejercicios clave de dinámica." },
  { projectTitle: "Rutina base", title: "Planificar la próxima sesión de entrenamiento." },
] as const

async function seedAreas() {
  const db = getDbOrThrow()
  const existingAreas = await db
    .select({ name: areas.name })
    .from(areas)
    .where(inArray(areas.name, areaSeeds.map((area) => area.name)))

  const existingNames = new Set(existingAreas.map((area) => area.name))
  const missingAreas = areaSeeds.filter((area) => !existingNames.has(area.name))

  if (missingAreas.length > 0) {
    await db.insert(areas).values(missingAreas)
  }
}

async function seedContainers() {
  const db = getDbOrThrow()
  const availableAreas = await db
    .select({ id: areas.id, name: areas.name })
    .from(areas)
    .where(inArray(areas.name, containerSeeds.map((container) => container.areaName)))

  const areaIdByName = new Map(availableAreas.map((area) => [area.name, area.id]))

  for (const container of containerSeeds) {
    const areaId = areaIdByName.get(container.areaName)

    if (!areaId) {
      continue
    }

    const existing = await db
      .select({ id: containers.id })
      .from(containers)
      .where(
        and(eq(containers.areaId, areaId), eq(containers.name, container.name))
      )
      .limit(1)

    if (existing.length === 0) {
      await db.insert(containers).values({
        areaId,
        name: container.name,
        description: container.description,
      })
    }
  }
}

async function seedInboxItems() {
  const db = getDbOrThrow()
  const existingItems = await db
    .select({ content: inboxItems.content })
    .from(inboxItems)
    .where(inArray(inboxItems.content, [...inboxSeeds]))

  const existingContent = new Set(existingItems.map((item) => item.content))
  const missingItems = inboxSeeds
    .filter((content) => !existingContent.has(content))
    .map((content) => ({ content }))

  if (missingItems.length > 0) {
    await db.insert(inboxItems).values(missingItems)
  }
}

async function seedProjects() {
  const db = getDbOrThrow()
  const availableContainers = await db
    .select({ id: containers.id, name: containers.name })
    .from(containers)
    .where(inArray(containers.name, projectSeeds.map((project) => project.containerName)))

  const containerIdByName = new Map(
    availableContainers.map((container) => [container.name, container.id])
  )

  for (const project of projectSeeds) {
    const containerId = containerIdByName.get(project.containerName)

    if (!containerId) {
      continue
    }

    const existing = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.containerId, containerId), eq(projects.title, project.title)))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(projects).values({
        containerId,
        title: project.title,
        description: project.description,
      })
    }
  }
}

async function seedTasks() {
  const db = getDbOrThrow()
  const availableProjects = await db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(inArray(projects.title, taskSeeds.map((task) => task.projectTitle)))

  const projectIdByTitle = new Map(
    availableProjects.map((project) => [project.title, project.id])
  )

  for (const task of taskSeeds) {
    const projectId = projectIdByTitle.get(task.projectTitle)

    if (!projectId) {
      continue
    }

    const existing = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), eq(tasks.title, task.title)))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(tasks).values({
        projectId,
        title: task.title,
      })
    }
  }
}

async function main() {
  await seedAreas()
  await seedContainers()
  await seedProjects()
  await seedTasks()
  await seedInboxItems()

  console.log("Life OS seeds completed.")
}

main().catch((error) => {
  console.error("Life OS seed failed.")
  console.error(error)
  process.exit(1)
})
