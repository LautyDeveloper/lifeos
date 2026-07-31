"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types/action-result"

import type { CreateTaskActionState } from "@/features/areas/action-state"
import {
  createTask,
  planTaskForToday,
  pauseProject,
  resumeProject,
  toggleTaskCompletion,
} from "@/features/areas/repository"
import {
  createTaskSchema,
  pauseProjectSchema,
  planTaskForTodaySchema,
  resumeProjectSchema,
  toggleTaskCompletionSchema,
} from "@/features/areas/schemas"

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
      message: "No pudimos crear la tarea. Probá de nuevo.",
      resetKey: previousState.resetKey,
    }
  }

  if (path) {
    revalidatePath(path)
  }
  revalidatePath("/")
  revalidatePath("/today")

  return {
    status: "success",
    message: "Tarea creada.",
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

  if (path) {
    revalidatePath(path)
  }
  revalidatePath("/")
  revalidatePath("/today")
  return { status: "success", message: parsed.data.completed ? "Tarea completada." : "Tarea restaurada.", entityId: parsed.data.taskId }
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
    return { status: "error", message: "No pudimos planificar la tarea." }
  }

  if (path) {
    revalidatePath(path)
  }
  revalidatePath("/")
  revalidatePath("/today")
  return { status: "success", message: "Tarea sumada a Hoy.", entityId: parsed.data.taskId }
}

export async function pauseProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = pauseProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await pauseProject(parsed.data)
  } catch (error) {
    console.error("Failed to pause project", error)
    return { status: "error", message: "No pudimos mandar el proyecto a Parking." }
  }

  if (path) {
    revalidatePath(path)
  }
  revalidatePath("/")
  revalidatePath("/today")
  revalidatePath("/parking")

  return {
    status: "success",
    message: "Proyecto movido a Parking.",
    entityId: parsed.data.projectId,
  }
}

export async function resumeProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = resumeProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await resumeProject(parsed.data)
  } catch (error) {
    console.error("Failed to resume project", error)
    return { status: "error", message: "No pudimos reanudar el proyecto." }
  }

  if (path) {
    revalidatePath(path)
  }
  revalidatePath("/")
  revalidatePath("/today")
  revalidatePath("/parking")

  return {
    status: "success",
    message: "Proyecto devuelto al foco activo.",
    entityId: parsed.data.projectId,
  }
}
