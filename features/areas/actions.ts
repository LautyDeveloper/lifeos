"use server"

import { revalidatePath } from "next/cache"
import type { ActionResult } from "@/types/action-result"

import type { CreateTaskActionState } from "@/features/areas/action-state"
import {
  createTask,
  planTaskForToday,
  toggleTaskCompletion,
} from "@/features/areas/repository"
import {
  createTaskSchema,
  planTaskForTodaySchema,
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
