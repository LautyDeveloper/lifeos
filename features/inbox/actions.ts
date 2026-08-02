"use server"

import { revalidatePath } from "next/cache"

import type {
  InboxActionState,
  ProcessInboxActionState,
} from "@/features/inbox/action-state"
import {
  createInboxItem,
  processInboxItemToNote,
  processInboxItemToProject,
  processInboxItemToTask,
} from "@/features/inbox/repository"
import {
  createInboxItemSchema,
  processInboxTargetSchema,
  processInboxToNoteSchema,
  processInboxToProjectSchema,
  processInboxToTaskSchema,
} from "@/features/inbox/schemas"
import { isDomainError } from "@/lib/domain-errors"

export async function createInboxItemAction(
  previousState: InboxActionState,
  formData: FormData
): Promise<InboxActionState> {
  const parsed = createInboxItemSchema.safeParse({
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "No pudimos guardar esa captura.",
      fieldErrors: {
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    await createInboxItem(parsed.data)
  } catch (error) {
    return {
      status: "error",
      message: isDomainError(error)
        ? "Configurá DATABASE_URL para empezar a guardar capturas reales."
        : "No pudimos guardar la captura.",
      resetKey: previousState.resetKey,
    }
  }

  revalidatePath("/inbox")
  revalidatePath("/")

  return {
    status: "success",
    message: "Capturado. Lo organizás después.",
    resetKey: previousState.resetKey + 1,
  }
}

function mapProcessFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
) {
  return {
    title: fieldErrors.title,
    containerId: fieldErrors.containerId,
    projectId: fieldErrors.projectId,
    content: fieldErrors.content,
    inboxItemId: fieldErrors.inboxItemId,
  }
}

function getInboxProcessingErrorMessage(error: unknown, target: "project" | "task" | "note") {
  if (!isDomainError(error)) {
    return "No pudimos procesar la captura."
  }

  if (error.code === "not_found") {
    if (target === "project") {
      return "La captura o el container ya no están disponibles."
    }

    if (target === "task") {
      return "La captura o el proyecto ya no están disponibles."
    }

    return "La captura ya no está disponible."
  }

  if (error.code === "archived_context") {
    return "Ese destino está archivado y ya no acepta nuevas entradas."
  }

  if (error.code === "invalid_state") {
    return target === "task"
      ? "Ese proyecto ya no acepta tareas nuevas."
      : "Ese destino ya no está disponible para procesar la captura."
  }

  return "No pudimos procesar la captura."
}

export async function processInboxItemAction(
  previousState: ProcessInboxActionState,
  formData: FormData
): Promise<ProcessInboxActionState> {
  const targetResult = processInboxTargetSchema.safeParse(formData.get("target"))

  if (!targetResult.success) {
    return {
      status: "error",
      message: "Elegí un destino válido para procesar esta captura.",
      resetKey: previousState.resetKey,
    }
  }

  const target = targetResult.data

  try {
    if (target === "project") {
      const parsed = processInboxToProjectSchema.safeParse({
        inboxItemId: formData.get("inboxItemId"),
        title: formData.get("title"),
        containerId: formData.get("containerId"),
        description: formData.get("description"),
      })

      if (!parsed.success) {
        return {
          status: "error",
          message: "Revisá los datos antes de crear el proyecto.",
          fieldErrors: mapProcessFieldErrors(parsed.error.flatten().fieldErrors),
          processedTarget: target,
          resetKey: previousState.resetKey,
        }
      }

      await processInboxItemToProject(parsed.data)
    }

    if (target === "task") {
      const parsed = processInboxToTaskSchema.safeParse({
        inboxItemId: formData.get("inboxItemId"),
        title: formData.get("title"),
        projectId: formData.get("projectId"),
      })

      if (!parsed.success) {
        return {
          status: "error",
          message: "Revisá los datos antes de crear la tarea.",
          fieldErrors: mapProcessFieldErrors(parsed.error.flatten().fieldErrors),
          processedTarget: target,
          resetKey: previousState.resetKey,
        }
      }

      await processInboxItemToTask(parsed.data)
    }

    if (target === "note") {
      const parsed = processInboxToNoteSchema.safeParse({
        inboxItemId: formData.get("inboxItemId"),
        title: formData.get("title"),
        content: formData.get("content"),
      })

      if (!parsed.success) {
        return {
          status: "error",
          message: "Revisá los datos antes de guardar la nota.",
          fieldErrors: mapProcessFieldErrors(parsed.error.flatten().fieldErrors),
          processedTarget: target,
          resetKey: previousState.resetKey,
        }
      }

      await processInboxItemToNote(parsed.data)
    }
  } catch (error) {
    console.error("Failed to process inbox item", error)
    return {
      status: "error",
      message: getInboxProcessingErrorMessage(error, target),
      processedTarget: target,
      resetKey: previousState.resetKey,
    }
  }

  revalidatePath("/inbox")
  revalidatePath("/")
  revalidatePath("/today")
  revalidatePath("/library")

  return {
    status: "success",
    message: "Captura procesada y movida al sistema.",
    processedTarget: target,
    resetKey: previousState.resetKey + 1,
  }
}
