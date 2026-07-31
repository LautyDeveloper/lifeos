"use server"

import { revalidatePath } from "next/cache"

import type {
  CreateLibraryNoteActionState,
  UpdateLibraryNoteActionState,
} from "@/features/library/action-state"
import {
  archiveLibraryNote,
  createLibraryNote,
  deleteLibraryNote,
  restoreLibraryNote,
  updateLibraryNote,
} from "@/features/library/repository"
import {
  archiveLibraryNoteSchema,
  createLibraryNoteSchema,
  deleteLibraryNoteSchema,
  restoreLibraryNoteSchema,
  updateLibraryNoteSchema,
} from "@/features/library/schemas"
import type { ActionResult } from "@/types/action-result"

export async function createLibraryNoteAction(
  previousState: CreateLibraryNoteActionState,
  formData: FormData
): Promise<CreateLibraryNoteActionState> {
  const parsed = createLibraryNoteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardarla.",
      fieldErrors: {
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    const note = await createLibraryNote(parsed.data)

    revalidatePath("/library")

    return {
      status: "success",
      message: "Nota creada en Biblioteca.",
      createdNoteId: note.id,
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create library note", error)

    return {
      status: "error",
      message: "No pudimos crear la nota. Probá de nuevo.",
      resetKey: previousState.resetKey,
    }
  }
}

export async function saveLibraryNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = updateLibraryNoteSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
  })
  if (!parsed.success) return { status: "error", message: "Completá el título y el contenido antes de guardar." }
  try {
    const note = await updateLibraryNote(parsed.data)
    revalidatePath("/library")
    return { status: "success", message: "Cambios guardados.", entityId: note.id }
  } catch {
    return { status: "error", message: "No pudimos guardar. Tus cambios siguen en el editor." }
  }
}

export async function archiveLibraryNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = archiveLibraryNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos archivar esa nota." }
  }

  try {
    const note = await archiveLibraryNote(parsed.data)
    revalidatePath("/library")
    return { status: "success", message: "Nota archivada.", entityId: note.id }
  } catch {
    return { status: "error", message: "No pudimos archivar la nota. Probá de nuevo." }
  }
}

export async function restoreLibraryNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = restoreLibraryNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos restaurar esa nota." }
  }

  try {
    const note = await restoreLibraryNote(parsed.data)
    revalidatePath("/library")
    return { status: "success", message: "Nota restaurada.", entityId: note.id }
  } catch {
    return { status: "error", message: "No pudimos restaurar la nota. Probá de nuevo." }
  }
}

export async function deleteLibraryNoteAction(formData: FormData): Promise<ActionResult> {
  const parsed = deleteLibraryNoteSchema.safeParse({
    id: formData.get("id"),
  })

  if (!parsed.success) {
    return { status: "error", message: "No pudimos eliminar esa nota." }
  }

  try {
    const note = await deleteLibraryNote(parsed.data)
    revalidatePath("/library")
    return { status: "success", message: "Nota eliminada.", entityId: note.id }
  } catch {
    return { status: "error", message: "No pudimos eliminar la nota. Probá de nuevo." }
  }
}

export async function updateLibraryNoteAction(
  previousState: UpdateLibraryNoteActionState,
  formData: FormData
): Promise<UpdateLibraryNoteActionState> {
  const parsed = updateLibraryNoteSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la nota antes de guardar los cambios.",
      fieldErrors: {
        id: fieldErrors.id,
        title: fieldErrors.title,
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    await updateLibraryNote(parsed.data)
  } catch (error) {
    console.error("Failed to update library note", error)

    return {
      status: "error",
      message: "No pudimos guardar los cambios. Probá de nuevo.",
      resetKey: previousState.resetKey,
    }
  }

  revalidatePath("/library")

  return {
    status: "success",
    message: "Cambios guardados en Biblioteca.",
    resetKey: previousState.resetKey + 1,
  }
}
