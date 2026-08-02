"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/types/action-result"
import type {
  CreateProjectActionState,
  CreateTaskActionState,
  UpdateProjectDetailsActionState,
} from "@/features/areas/action-state"
import {
  clearTaskPlannedDate,
  createProject,
  createTask,
  planTaskForTomorrow,
  planTaskForToday,
  setTaskPlannedDate,
  toggleTaskCompletion,
  updateProjectDetails,
  updateProjectPriority,
  updateProjectStatus,
  updateTaskPriority,
} from "@/features/areas/repository"
import {
  clearTaskPlannedDateSchema,
  createProjectSchema,
  createTaskSchema,
  planTaskForTomorrowSchema,
  planTaskForTodaySchema,
  setTaskPlannedDateSchema,
  toggleTaskCompletionSchema,
  updateProjectDetailsSchema,
  updateProjectPrioritySchema,
  updateProjectStatusSchema,
  updateTaskPrioritySchema,
} from "@/features/areas/schemas"

function revalidateOperationalPaths(path: string, options?: { parking?: boolean }) {
  if (path) {
    revalidatePath(path)
  }

  revalidatePath("/")
  revalidatePath("/today")

  if (options?.parking) {
    revalidatePath("/parking")
  }
}

export async function createTaskAction(
  previousState: CreateTaskActionState,
  formData: FormData
): Promise<CreateTaskActionState> {
  const parsed = createTaskSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos guardar esa tarea.",
      fieldErrors: {
        title: fieldErrors.title,
        projectId: fieldErrors.projectId,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await createTask(parsed.data)
  } catch (error) {
    console.error("Failed to create task", error)
    return {
      status: "error",
      message: "Ese proyecto no permite nuevas tareas en este estado.",
      resetKey: previousState.resetKey,
    }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: "Tarea creada.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function createProjectAction(
  previousState: CreateProjectActionState,
  formData: FormData
): Promise<CreateProjectActionState> {
  const parsed = createProjectSchema.safeParse({
    containerId: formData.get("containerId"),
    title: formData.get("title"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos crear ese proyecto.",
      fieldErrors: {
        title: fieldErrors.title,
        containerId: fieldErrors.containerId,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await createProject(parsed.data)
  } catch (error) {
    console.error("Failed to create project", error)
    return {
      status: "error",
      message: "No pudimos crear ese proyecto en este espacio.",
      resetKey: previousState.resetKey,
    }
  }

  if (path) {
    revalidatePath(path)
  }

  return {
    status: "success",
    message: "Proyecto creado en Backlog.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function updateProjectDetailsAction(
  previousState: UpdateProjectDetailsActionState,
  formData: FormData
): Promise<UpdateProjectDetailsActionState> {
  const parsed = updateProjectDetailsSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos guardar los cambios del proyecto.",
      fieldErrors: {
        title: fieldErrors.title,
        projectId: fieldErrors.projectId,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateProjectDetails(parsed.data)
  } catch (error) {
    console.error("Failed to update project details", error)
    return {
      status: "error",
      message: "No pudimos actualizar ese proyecto.",
      resetKey: previousState.resetKey,
    }
  }

  if (path) {
    revalidatePath(path)
  }

  return {
    status: "success",
    message: "Proyecto actualizado.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function toggleTaskCompletionAction(formData: FormData): Promise<ActionResult> {
  const parsed = toggleTaskCompletionSchema.safeParse({
    taskId: formData.get("taskId"),
    completed: formData.get("completed"),
  })

  if (!parsed.success) {
    console.error("Invalid toggle task payload", parsed.error.flatten().fieldErrors)
    return { status: "error", message: "La tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await toggleTaskCompletion(parsed.data)
  } catch (error) {
    console.error("Failed to toggle task completion", error)
    return { status: "error", message: "No pudimos actualizar la tarea." }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: parsed.data.completed ? "Tarea completada." : "Tarea restaurada.",
    entityId: parsed.data.taskId,
  }
}

export async function planTaskForTodayAction(formData: FormData): Promise<ActionResult> {
  const parsed = planTaskForTodaySchema.safeParse({
    taskId: formData.get("taskId"),
  })

  if (!parsed.success) {
    console.error("Invalid plan task payload", parsed.error.flatten().fieldErrors)
    return { status: "error", message: "La tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await planTaskForToday(parsed.data)
  } catch (error) {
    console.error("Failed to plan task for today", error)
    return { status: "error", message: "Solo podés planificar tareas de proyectos activos." }
  }

  revalidateOperationalPaths(path)

  return { status: "success", message: "Tarea sumada a Hoy.", entityId: parsed.data.taskId }
}

export async function planTaskForTomorrowAction(formData: FormData): Promise<ActionResult> {
  const parsed = planTaskForTomorrowSchema.safeParse({
    taskId: formData.get("taskId"),
  })

  if (!parsed.success) {
    console.error("Invalid plan tomorrow payload", parsed.error.flatten().fieldErrors)
    return { status: "error", message: "La tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await planTaskForTomorrow(parsed.data)
  } catch (error) {
    console.error("Failed to plan task for tomorrow", error)
    return { status: "error", message: "Solo podés planificar tareas de proyectos activos." }
  }

  revalidateOperationalPaths(path)

  return { status: "success", message: "Tarea sumada a Mañana.", entityId: parsed.data.taskId }
}

export async function setTaskPlannedDateAction(formData: FormData): Promise<ActionResult> {
  const parsed = setTaskPlannedDateSchema.safeParse({
    taskId: formData.get("taskId"),
    plannedDate: formData.get("plannedDate"),
  })

  if (!parsed.success) {
    console.error("Invalid set planning payload", parsed.error.flatten().fieldErrors)
    return { status: "error", message: "Elegí una fecha válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await setTaskPlannedDate(parsed.data)
  } catch (error) {
    console.error("Failed to set task planning date", error)
    return { status: "error", message: "Solo podés planificar tareas de proyectos activos." }
  }

  revalidateOperationalPaths(path)

  return { status: "success", message: "Fecha actualizada.", entityId: parsed.data.taskId }
}

export async function clearTaskPlannedDateAction(formData: FormData): Promise<ActionResult> {
  const parsed = clearTaskPlannedDateSchema.safeParse({
    taskId: formData.get("taskId"),
  })

  if (!parsed.success) {
    console.error("Invalid clear planning payload", parsed.error.flatten().fieldErrors)
    return { status: "error", message: "La tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await clearTaskPlannedDate(parsed.data)
  } catch (error) {
    console.error("Failed to clear task planning date", error)
    return { status: "error", message: "No pudimos quitar la fecha." }
  }

  revalidateOperationalPaths(path)

  return { status: "success", message: "La tarea volvió a quedar sin fecha.", entityId: parsed.data.taskId }
}

export async function updateProjectStatusAction(formData: FormData): Promise<ActionResult> {
  const parsed = updateProjectStatusSchema.safeParse({
    projectId: formData.get("projectId"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateProjectStatus(parsed.data)
  } catch (error) {
    console.error("Failed to update project status", error)
    return { status: "error", message: "No pudimos actualizar el estado del proyecto." }
  }

  revalidateOperationalPaths(path, { parking: parsed.data.status === "paused" || path === "/parking" })

  const messages = {
    backlog: "Proyecto movido a Backlog.",
    active: "Proyecto devuelto al foco activo.",
    paused: "Proyecto movido a Estacionados.",
    done: "Proyecto marcado como terminado.",
  } as const

  return {
    status: "success",
    message: messages[parsed.data.status],
    entityId: parsed.data.projectId,
  }
}

export async function updateProjectPriorityAction(formData: FormData): Promise<ActionResult> {
  const parsed = updateProjectPrioritySchema.safeParse({
    projectId: formData.get("projectId"),
    priority: formData.get("priority"),
  })

  if (!parsed.success) {
    return { status: "error", message: "La prioridad del proyecto no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateProjectPriority(parsed.data)
  } catch (error) {
    console.error("Failed to update project priority", error)
    return { status: "error", message: "No pudimos actualizar la prioridad del proyecto." }
  }

  revalidateOperationalPaths(path, { parking: path === "/parking" })

  return {
    status: "success",
    message: "Prioridad del proyecto actualizada.",
    entityId: parsed.data.projectId,
  }
}

export async function updateTaskPriorityAction(formData: FormData): Promise<ActionResult> {
  const parsed = updateTaskPrioritySchema.safeParse({
    taskId: formData.get("taskId"),
    priority: formData.get("priority"),
  })

  if (!parsed.success) {
    return { status: "error", message: "La prioridad de la tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateTaskPriority(parsed.data)
  } catch (error) {
    console.error("Failed to update task priority", error)
    return { status: "error", message: "No pudimos actualizar la prioridad de la tarea." }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: "Prioridad de la tarea actualizada.",
    entityId: parsed.data.taskId,
  }
}
