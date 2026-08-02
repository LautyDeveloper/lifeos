import "dotenv/config"

import { and, eq, inArray, isNull } from "drizzle-orm"

import { getDbOrThrow } from "@/db"
import { areas, containers, inboxItems, notes, projects, tasks } from "@/db/schema"
import { getDateDaysFromNow } from "@/lib/dates"
import type { Priority, ProjectStatus } from "@/types/domain"

const areaSeeds = [
  { slug: "work", name: "Trabajo", icon: "BriefcaseBusiness", color: "#7dd3fc", sortOrder: 0 },
  { slug: "dev", name: "Dev", icon: "MonitorCog", color: "#60a5fa", sortOrder: 1 },
  { slug: "study", name: "Estudio", icon: "BookOpen", color: "#a78bfa", sortOrder: 2 },
  { slug: "health", name: "Salud", icon: "HeartPulse", color: "#34d399", sortOrder: 3 },
] as const

const containerSeeds = [
  { areaSlug: "work", name: "Gasti", description: "Contexto operativo de trabajo.", sortOrder: 0 },
  { areaSlug: "dev", name: "Life OS", description: "Producto principal en desarrollo.", sortOrder: 0 },
  { areaSlug: "dev", name: "AutoPanel", description: "Proyecto técnico paralelo.", sortOrder: 1 },
  { areaSlug: "study", name: "Física", description: "Materia activa para estudio.", sortOrder: 0 },
  { areaSlug: "health", name: "Gimnasio", description: "Entrenamiento y constancia.", sortOrder: 0 },
  { areaSlug: "health", name: "Alimentación", description: "Hábitos y decisiones diarias.", sortOrder: 1 },
  { areaSlug: "health", name: "Sueño", description: "Descanso como sistema.", sortOrder: 2 },
] as const

const inboxSeeds = [
  "Definir el flujo para procesar ideas del inbox.",
  "Revisar la arquitectura de proyectos antes del Sprint 3.",
  "Pensar una rutina simple para cerrar el día.",
  "Anotar ideas para la biblioteca de conocimiento.",
] as const

const projectSeeds: ReadonlyArray<{
  containerName: string
  title: string
  description: string
  status: ProjectStatus
  priority: Priority
}> = [
  { containerName: "Gasti", title: "Operación semanal", description: "Prioridades activas del trabajo.", status: "active", priority: "high" },
  { containerName: "Life OS", title: "MVP", description: "Entrega incremental del sistema operativo personal.", status: "active", priority: "urgent" },
  { containerName: "AutoPanel", title: "Roadmap", description: "Próximos hitos del producto técnico.", status: "done", priority: "medium" },
  { containerName: "Física", title: "Parcial 1", description: "Plan base para preparar el parcial.", status: "backlog", priority: "medium" },
  { containerName: "Gimnasio", title: "Rutina base", description: "Estructura mínima para sostener constancia.", status: "active", priority: "medium" },
  { containerName: "Life OS", title: "Exploración futura", description: "Ideas reservadas para más adelante.", status: "paused", priority: "low" },
] as const

const taskSeeds: ReadonlyArray<{
  projectTitle: string
  title: string
  priority: Priority
  completed: boolean
  plannedDateOffset?: number
}> = [
  { projectTitle: "Operación semanal", title: "Preparar prioridades del cliente.", priority: "high", completed: false, plannedDateOffset: 0 },
  { projectTitle: "Operación semanal", title: "Revisar entregables pendientes.", priority: "medium", completed: false },
  { projectTitle: "MVP", title: "Definir el siguiente PR del producto.", priority: "urgent", completed: false, plannedDateOffset: 0 },
  { projectTitle: "MVP", title: "Validar el flujo completo de inbox.", priority: "high", completed: false, plannedDateOffset: 1 },
  { projectTitle: "Roadmap", title: "Agrupar próximas iniciativas técnicas.", priority: "low", completed: true },
  { projectTitle: "Parcial 1", title: "Resolver ejercicios clave de dinámica.", priority: "medium", completed: false, plannedDateOffset: 0 },
  { projectTitle: "Rutina base", title: "Planificar la próxima sesión de entrenamiento.", priority: "medium", completed: false },
  { projectTitle: "Exploración futura", title: "Guardar ideas para una versión futura del onboarding.", priority: "low", completed: false, plannedDateOffset: 0 },
] as const

const libraryNoteSeeds = [
  {
    title: "Principio de Inbox",
    content:
      "Inbox existe para capturar sin pensar dos veces. La organización viene después, cuando ya no interrumpe el movimiento.",
  },
  {
    title: "Qué hace valiosa a Biblioteca",
    content:
      "Biblioteca guarda conocimiento estable: ideas, referencias, definiciones y notas que querés volver a consultar fuera del flujo operativo.",
  },
  {
    title: "Criterio de Today",
    content:
      "Today no es para organizar. Solo reúne lo que ya fue planificado para ejecutar con foco durante el día.",
  },
] as const

const containerNoteSeeds = [
  {
    containerName: "Life OS",
    title: "Dirección del producto",
    content:
      "Mantener el sistema opinado: capturar, organizar, planificar y ejecutar sin convertir cada pantalla en una consola genérica.",
  },
  {
    containerName: "Gasti",
    title: "Contexto del cliente",
    content:
      "La prioridad de este espacio es sostener claridad semanal y evitar que los pendientes operativos se mezclen con decisiones de producto.",
  },
] as const

const projectNoteSeeds = [
  {
    projectTitle: "MVP",
    title: "Criterio de MVP",
    content:
      "Cada PR tiene que cerrar un loop claro del sistema. Si una feature no mejora captura, organización, planning o ejecución, puede esperar.",
  },
  {
    projectTitle: "Operación semanal",
    title: "Ritmo de trabajo",
    content:
      "Conviene dejar por escrito lo que cambió en la semana para no rearmar el contexto de cero en cada revisión.",
  },
] as const

const taskNoteSeeds = [
  {
    taskTitle: "Definir el siguiente PR del producto.",
    title: "Qué tiene que resolver",
    content:
      "El próximo paso tiene que cerrar un loop real, no solo sumar UI. Si una pieza no conecta captura, organización o ejecución, todavía no entra.",
    archived: false,
  },
  {
    taskTitle: "Preparar prioridades del cliente.",
    title: "Contexto de la reunión",
    content:
      "Llegar con tres prioridades claras y un resumen breve de bloqueos evita volver a pensar el contexto en el momento.",
    archived: true,
  },
] as const

async function seedAreas() {
  const db = getDbOrThrow()
  const existingAreas = await db
    .select({ id: areas.id, slug: areas.slug, name: areas.name })
    .from(areas)
    .where(inArray(areas.slug, areaSeeds.map((area) => area.slug)))

  const existingBySlug = new Map(existingAreas.map((area) => [area.slug, area.id]))
  const missingAreas = areaSeeds.filter((area) => !existingBySlug.has(area.slug))

  if (missingAreas.length > 0) {
    await db.insert(areas).values(missingAreas)
  }

  for (const area of areaSeeds) {
    const existingId = existingBySlug.get(area.slug)

    if (!existingId) {
      continue
    }

    await db
      .update(areas)
      .set({
        name: area.name,
        icon: area.icon,
        color: area.color,
        sortOrder: area.sortOrder,
      })
      .where(eq(areas.id, existingId))
  }
}

async function seedContainers() {
  const db = getDbOrThrow()
  const availableAreas = await db
    .select({ id: areas.id, slug: areas.slug })
    .from(areas)
    .where(inArray(areas.slug, containerSeeds.map((container) => container.areaSlug)))

  const areaIdBySlug = new Map(availableAreas.map((area) => [area.slug, area.id]))

  for (const container of containerSeeds) {
    const areaId = areaIdBySlug.get(container.areaSlug)

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
        sortOrder: container.sortOrder,
      })
      continue
    }

    await db
      .update(containers)
      .set({
        description: container.description,
        sortOrder: container.sortOrder,
      })
      .where(eq(containers.id, existing[0].id))
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
        status: project.status,
        priority: project.priority,
      })
    } else {
      await db
        .update(projects)
        .set({
          description: project.description,
          status: project.status as ProjectStatus,
          priority: project.priority as Priority,
        })
        .where(eq(projects.id, existing[0].id))
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
        priority: task.priority,
        completed: task.completed,
        plannedDate:
          typeof task.plannedDateOffset === "number"
            ? getDateDaysFromNow(task.plannedDateOffset)
            : null,
      })
    } else {
      await db
        .update(tasks)
        .set({
          priority: task.priority as Priority,
          completed: task.completed,
          plannedDate:
            typeof task.plannedDateOffset === "number"
              ? getDateDaysFromNow(task.plannedDateOffset)
              : null,
        })
        .where(eq(tasks.id, existing[0].id))
    }
  }
}

async function seedLibraryNotes() {
  const db = getDbOrThrow()
  const existingNotes = await db
    .select({ title: notes.title })
    .from(notes)
    .where(
      and(
        inArray(notes.title, libraryNoteSeeds.map((note) => note.title)),
        isNull(notes.containerId),
        isNull(notes.projectId),
        isNull(notes.taskId)
      )
    )

  const existingTitles = new Set(existingNotes.map((note) => note.title))
  const missingNotes = libraryNoteSeeds
    .filter((note) => !existingTitles.has(note.title))
    .map((note) => ({
      title: note.title,
      content: note.content,
      containerId: null,
      projectId: null,
      taskId: null,
    }))

  if (missingNotes.length > 0) {
    await db.insert(notes).values(missingNotes)
  }
}

async function seedContainerNotes() {
  const db = getDbOrThrow()
  const availableContainers = await db
    .select({ id: containers.id, name: containers.name, archived: containers.archived })
    .from(containers)
    .where(inArray(containers.name, containerNoteSeeds.map((note) => note.containerName)))

  const containerByName = new Map(availableContainers.map((container) => [container.name, container]))

  for (const note of containerNoteSeeds) {
    const container = containerByName.get(note.containerName)

    if (!container || container.archived) {
      continue
    }

    const existing = await db
      .select({ id: notes.id })
      .from(notes)
      .where(
        and(
          eq(notes.containerId, container.id),
          eq(notes.title, note.title),
          isNull(notes.projectId)
        )
      )
      .limit(1)

    if (existing.length === 0) {
      await db.insert(notes).values({
        containerId: container.id,
        projectId: null,
        taskId: null,
        title: note.title,
        content: note.content,
      })
      continue
    }

    await db
      .update(notes)
      .set({
        content: note.content,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, existing[0].id))
  }
}

async function seedProjectNotes() {
  const db = getDbOrThrow()
  const availableProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      containerId: projects.containerId,
    })
    .from(projects)
    .where(inArray(projects.title, projectNoteSeeds.map((note) => note.projectTitle)))

  const projectByTitle = new Map(availableProjects.map((project) => [project.title, project]))

  for (const note of projectNoteSeeds) {
    const project = projectByTitle.get(note.projectTitle)

    if (!project) {
      continue
    }

    const existing = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.projectId, project.id), isNull(notes.taskId), eq(notes.title, note.title)))
      .limit(1)

    if (existing.length === 0) {
      await db.insert(notes).values({
        containerId: project.containerId,
        projectId: project.id,
        taskId: null,
        title: note.title,
        content: note.content,
      })
      continue
    }

    await db
      .update(notes)
      .set({
        containerId: project.containerId,
        content: note.content,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, existing[0].id))
  }
}

async function seedTaskNotes() {
  const db = getDbOrThrow()
  const availableTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      projectId: tasks.projectId,
      containerId: projects.containerId,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(inArray(tasks.title, taskNoteSeeds.map((note) => note.taskTitle)))

  const taskByTitle = new Map(availableTasks.map((task) => [task.title, task]))

  for (const note of taskNoteSeeds) {
    const task = taskByTitle.get(note.taskTitle)

    if (!task) {
      continue
    }

    const existing = await db
      .select({ id: notes.id })
      .from(notes)
      .where(and(eq(notes.taskId, task.id), eq(notes.title, note.title)))
      .limit(1)

    const archivedAt = note.archived ? new Date() : null

    if (existing.length === 0) {
      await db.insert(notes).values({
        containerId: task.containerId,
        projectId: task.projectId,
        taskId: task.id,
        title: note.title,
        content: note.content,
        archivedAt,
      })
      continue
    }

    await db
      .update(notes)
      .set({
        containerId: task.containerId,
        projectId: task.projectId,
        content: note.content,
        archivedAt,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, existing[0].id))
  }
}

async function main() {
  await seedAreas()
  await seedContainers()
  await seedProjects()
  await seedTasks()
  await seedInboxItems()
  await seedLibraryNotes()
  await seedContainerNotes()
  await seedProjectNotes()
  await seedTaskNotes()

  console.log("Life OS seeds completed.")
}

main().catch((error) => {
  console.error("Life OS seed failed.")
  console.error(error)
  process.exit(1)
})
