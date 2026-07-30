"use server"

import { revalidatePath } from "next/cache"

import type { CreateTaskActionState } from "@/features/areas/action-state"
import { createTask, toggleTaskCompletion } from "@/features/areas/repository"
import { createTaskSchema, toggleTaskCompletionSchema } from "@/features/areas/schemas"

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

  return {
    status: "success",
    message: "Tarea creada.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function toggleTaskCompletionAction(formData: FormData) {
  const parsed = toggleTaskCompletionSchema.safeParse({
    taskId: formData.get("taskId"),
    completed: formData.get("completed"),
  })

  if (!parsed.success) {
    console.error("Invalid toggle task payload", parsed.error.flatten().fieldErrors)
    return
  }

  const path = String(formData.get("path") ?? "")

  try {
    await toggleTaskCompletion(parsed.data)
  } catch (error) {
    console.error("Failed to toggle task completion", error)
    return
  }

  if (path) {
    revalidatePath(path)
  }
}
