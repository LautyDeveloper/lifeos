"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/types/action-result"
import type {
  CreateOperationalNoteActionState,
  UpdateOperationalNoteActionState,
} from "@/features/operational-notes/action-state"
import {
  archiveOperationalNote,
  createContainerNote,
  createProjectNote,
  createTaskNote,
  deleteOperationalNote,
  restoreOperationalNote,
  updateOperationalNote,
} from "@/features/operational-notes/repository"
import {
  archiveOperationalNoteSchema,
  createContainerNoteSchema,
  createProjectNoteSchema,
  createTaskNoteSchema,
  deleteOperationalNoteSchema,
  restoreOperationalNoteSchema,
  updateOperationalNoteSchema,
} from "@/features/operational-notes/schemas"
import { getDomainErrorMessage } from "@/lib/domain-errors"

function getOperationalNoteErrorMessage(
  error: unknown,
  fallback: string,
  options?: {
    notFound?: string
    invalidState?: string
    archivedContext?: string
  }
) {
  return getDomainErrorMessage(error, fallback, {
    not_found: options?.notFound ?? fallback,
    archived_context: options?.archivedContext ?? fallback,
    invalid_state: options?.invalidState ?? fallback,
  })
}

function revalidateOperationalNotesPath(path: string) {
  if (path) {
    revalidatePath(path)
  }
}

export async function createContainerNoteAction(
  previousState: CreateOperationalNoteActionState,
  formData: FormData
): Promise<CreateOperationalNoteActionState> {
  const parsed = createContainerNoteSchema.safeParse({
    containerId: formData.get("containerId"),
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardarla.",
      fieldErrors: {
        containerId: fieldErrors.containerId,
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await createContainerNote(parsed.data)
    revalidateOperationalNotesPath(path)

    return {
      status: "success",
      message: "Nota guardada en este espacio.",
      createdNoteId: note.id,
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create container note", error)

    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos guardar la nota.", {
        notFound: "Ese espacio ya no existe.",
        archivedContext: "Ese espacio está archivado y ya no admite notas.",
      }),
      resetKey: previousState.resetKey,
    }
  }
}

export async function createProjectNoteAction(
  previousState: CreateOperationalNoteActionState,
  formData: FormData
): Promise<CreateOperationalNoteActionState> {
  const parsed = createProjectNoteSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardarla.",
      fieldErrors: {
        projectId: fieldErrors.projectId,
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await createProjectNote(parsed.data)
    revalidateOperationalNotesPath(path)

    return {
      status: "success",
      message: "Nota guardada dentro del proyecto.",
      createdNoteId: note.id,
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create project note", error)

    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos guardar la nota.", {
        notFound: "Ese proyecto ya no existe.",
        archivedContext: "El container de este proyecto está archivado.",
        invalidState: "Ese proyecto ya no admite notas en este contexto.",
      }),
      resetKey: previousState.resetKey,
    }
  }
}

export async function createTaskNoteAction(
  previousState: CreateOperationalNoteActionState,
  formData: FormData
): Promise<CreateOperationalNoteActionState> {
  const parsed = createTaskNoteSchema.safeParse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardarla.",
      fieldErrors: {
        taskId: fieldErrors.taskId,
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await createTaskNote(parsed.data)
    revalidateOperationalNotesPath(path)

    return {
      status: "success",
      message: "Nota guardada dentro de la tarea.",
      createdNoteId: note.id,
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create task note", error)

    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos guardar la nota.", {
        notFound: "Esa tarea ya no existe.",
        archivedContext: "El contexto de esta tarea está archivado.",
        invalidState: "Esa tarea ya no admite notas en este contexto.",
      }),
      resetKey: previousState.resetKey,
    }
  }
}

export async function updateOperationalNoteAction(
  previousState: UpdateOperationalNoteActionState,
  formData: FormData
): Promise<UpdateOperationalNoteActionState> {
  const parsed = updateOperationalNoteSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardar.",
      fieldErrors: {
        id: fieldErrors.id,
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  const path = String(formData.get("path") ?? "")

  try {
    await updateOperationalNote(parsed.data)
  } catch (error) {
    console.error("Failed to update operational note", error)

    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos guardar los cambios.", {
        notFound: "La nota ya no existe.",
        archivedContext: "El contexto de esta nota ya no está activo.",
        invalidState: "La nota ya no se puede editar.",
      }),
      resetKey: previousState.resetKey,
    }
  }

  revalidateOperationalNotesPath(path)

  return {
    status: "success",
    message: "Nota actualizada.",
    resetKey: previousState.resetKey + 1,
  }
}

export async function archiveOperationalNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = archiveOperationalNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos archivar esa nota." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await archiveOperationalNote(parsed.data)
    revalidateOperationalNotesPath(path)
    return { status: "success", message: "Nota archivada.", entityId: note.id }
  } catch (error) {
    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos archivar la nota.", {
        invalidState: "La nota ya no está activa.",
      }),
    }
  }
}

export async function restoreOperationalNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = restoreOperationalNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos restaurar esa nota." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await restoreOperationalNote(parsed.data)
    revalidateOperationalNotesPath(path)
    return { status: "success", message: "Nota restaurada.", entityId: note.id }
  } catch (error) {
    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos restaurar la nota.", {
        invalidState: "La nota ya no está archivada.",
        archivedContext: "El contexto de esta nota sigue archivado.",
      }),
    }
  }
}

export async function deleteOperationalNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = deleteOperationalNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos eliminar esa nota." }
  }

  const path = String(formData.get("path") ?? "")

  try {
    const note = await deleteOperationalNote(parsed.data)
    revalidateOperationalNotesPath(path)
    return { status: "success", message: "Nota eliminada.", entityId: note.id }
  } catch (error) {
    return {
      status: "error",
      message: getOperationalNoteErrorMessage(error, "No pudimos eliminar la nota.", {
        invalidState: "Solo podés eliminar notas archivadas.",
      }),
    }
  }
}
