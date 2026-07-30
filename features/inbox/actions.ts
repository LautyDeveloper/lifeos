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
  } catch {
    return {
      status: "error",
      message: "Configurá DATABASE_URL para empezar a guardar capturas reales.",
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
      message: "No pudimos procesar esta captura. Probá de nuevo.",
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
