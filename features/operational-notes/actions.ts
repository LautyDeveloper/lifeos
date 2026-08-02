"use server"

import { revalidatePath } from "next/cache"

import type {
  CreateOperationalNoteActionState,
  UpdateOperationalNoteActionState,
} from "@/features/operational-notes/action-state"
import {
  createContainerNote,
  createProjectNote,
  updateOperationalNote,
} from "@/features/operational-notes/repository"
import {
  createContainerNoteSchema,
  createProjectNoteSchema,
  updateOperationalNoteSchema,
} from "@/features/operational-notes/schemas"

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
      message: "No pudimos guardar esta nota. Probá de nuevo.",
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
      message: "No pudimos guardar esta nota. Probá de nuevo.",
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
      message: "No pudimos guardar los cambios. Probá de nuevo.",
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
