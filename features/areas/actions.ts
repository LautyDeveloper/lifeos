"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/types/action-result"
import type {
  CreateProjectActionState,
  CreateTaskActionState,
  UpdateProjectDetailsActionState,
  UpdateTaskDetailsActionState,
} from "@/features/areas/action-state"
import {
  archiveProject,
  clearTaskPlannedDate,
  createProject,
  createTask,
  deleteProject,
  deleteTask,
  planTaskForTomorrow,
  planTaskForToday,
  restoreProject,
  setTaskPlannedDate,
  toggleTaskCompletion,
  updateTaskDetails,
  updateProjectDetails,
  updateProjectPriority,
  updateProjectStatus,
  updateTaskPriority,
} from "@/features/areas/repository"
import {
  archiveProjectSchema,
  clearTaskPlannedDateSchema,
  createProjectSchema,
  createTaskSchema,
  deleteProjectSchema,
  deleteTaskSchema,
  planTaskForTomorrowSchema,
  planTaskForTodaySchema,
  restoreProjectSchema,
  setTaskPlannedDateSchema,
  toggleTaskCompletionSchema,
  updateTaskDetailsSchema,
  updateProjectDetailsSchema,
  updateProjectPrioritySchema,
  updateProjectStatusSchema,
  updateTaskPrioritySchema,
} from "@/features/areas/schemas"
import { isDomainError } from "@/lib/domain-errors"

function revalidateOperationalPaths(path: string, options?: { parking?: boolean }) {
  if (path) {
    revalidatePath(path)
  }

  revalidatePath("/")
  revalidatePath("/today")
  revalidatePath("/review")

  if (options?.parking) {
    revalidatePath("/parking")
  }
}

function getAreaActionErrorMessage(
  error: unknown,
  fallback: string,
  options?: {
    notFound?: string
    invalidState?: string
    archivedContext?: string
    constraintViolation?: string
  }
) {
  if (!isDomainError(error)) {
    return fallback
  }

  if (error.code === "not_found") {
    return options?.notFound ?? fallback
  }

  if (error.code === "archived_context") {
    return options?.archivedContext ?? fallback
  }

  if (error.code === "constraint_violation") {
    return options?.constraintViolation ?? fallback
  }

  if (error.code === "invalid_state") {
    return options?.invalidState ?? fallback
  }

  return fallback
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
      message: getAreaActionErrorMessage(error, "No pudimos crear la tarea.", {
        notFound: "Ese proyecto ya no existe.",
        invalidState: "Ese proyecto no acepta tareas en este estado.",
        archivedContext: "Ese proyecto está archivado y ya no admite tareas.",
      }),
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
      message: getAreaActionErrorMessage(error, "No pudimos crear el proyecto.", {
        notFound: "Ese espacio ya no existe.",
        archivedContext: "Ese container está archivado y ya no admite proyectos.",
      }),
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
      message: getAreaActionErrorMessage(error, "No pudimos guardar los cambios del proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        archivedContext: "Ese proyecto está archivado y ya no se puede editar.",
      }),
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

export async function updateTaskDetailsAction(
  previousState: UpdateTaskDetailsActionState,
  formData: FormData
): Promise<UpdateTaskDetailsActionState> {
  const parsed = updateTaskDetailsSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos guardar esa tarea.",
      fieldErrors: {
        title: fieldErrors.title,
        taskId: fieldErrors.taskId,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateTaskDetails(parsed.data)
  } catch (error) {
    console.error("Failed to update task details", error)
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos guardar esa tarea.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Esa tarea ya no se puede editar desde este contexto.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
      resetKey: previousState.resetKey,
    }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: "Tarea actualizada.",
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos actualizar la tarea.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Esa tarea ya no está disponible en este contexto.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos sumar la tarea a Hoy.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Solo podés planificar tareas de proyectos activos.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos mover la tarea a Mañana.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Solo podés planificar tareas de proyectos activos.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos actualizar la fecha.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Solo podés planificar tareas de proyectos activos.",
        constraintViolation: "Elegí una fecha válida.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos quitar la fecha.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Solo podés quitar la fecha en tareas de proyectos activos.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos actualizar el estado del proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        archivedContext: "Ese proyecto está archivado y ya no se puede mover desde acá.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos actualizar la prioridad del proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        archivedContext: "Ese proyecto está archivado y ya no se puede editar.",
      }),
    }
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
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos actualizar la prioridad de la tarea.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Esa tarea ya no está disponible en este contexto.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: "Prioridad de la tarea actualizada.",
    entityId: parsed.data.taskId,
  }
}

export async function deleteTaskAction(formData: FormData): Promise<ActionResult> {
  const parsed = deleteTaskSchema.safeParse({
    taskId: formData.get("taskId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "La tarea no es válida." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await deleteTask(parsed.data)
  } catch (error) {
    console.error("Failed to delete task", error)
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos eliminar la tarea.", {
        notFound: "Esa tarea ya no existe.",
        invalidState: "Esa tarea ya no se puede borrar desde este contexto.",
        archivedContext: "El proyecto de esa tarea está archivado.",
      }),
    }
  }

  revalidateOperationalPaths(path)

  return {
    status: "success",
    message: "Tarea eliminada.",
    entityId: parsed.data.taskId,
  }
}

export async function archiveProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = archiveProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await archiveProject(parsed.data)
  } catch (error) {
    console.error("Failed to archive project", error)
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos archivar el proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        invalidState: "Ese proyecto ya estaba archivado.",
      }),
    }
  }

  revalidateOperationalPaths(path, { parking: true })

  return {
    status: "success",
    message: "Proyecto archivado.",
    entityId: parsed.data.projectId,
  }
}

export async function restoreProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = restoreProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await restoreProject(parsed.data)
  } catch (error) {
    console.error("Failed to restore project", error)
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos restaurar el proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        invalidState: "Ese proyecto no estaba archivado.",
      }),
    }
  }

  revalidateOperationalPaths(path, { parking: true })

  return {
    status: "success",
    message: "Proyecto restaurado.",
    entityId: parsed.data.projectId,
  }
}

export async function deleteProjectAction(formData: FormData): Promise<ActionResult> {
  const parsed = deleteProjectSchema.safeParse({
    projectId: formData.get("projectId"),
  })

  if (!parsed.success) {
    return { status: "error", message: "El proyecto no es válido." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await deleteProject(parsed.data)
  } catch (error) {
    console.error("Failed to delete project", error)
    return {
      status: "error",
      message: getAreaActionErrorMessage(error, "No pudimos eliminar el proyecto.", {
        notFound: "Ese proyecto ya no existe.",
        invalidState: "Primero archivá el proyecto antes de eliminarlo.",
      }),
    }
  }

  revalidateOperationalPaths(path, { parking: true })

  return {
    status: "success",
    message: "Proyecto eliminado con todo su contexto operativo.",
    entityId: parsed.data.projectId,
  }
}
