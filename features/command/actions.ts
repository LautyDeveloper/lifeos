"use server"

import { revalidatePath } from "next/cache"

import { createInboxItem } from "@/features/inbox/repository"
import { createInboxItemSchema } from "@/features/inbox/schemas"
import { createLibraryNote } from "@/features/library/repository"
import { createLibraryNoteSchema } from "@/features/library/schemas"
import { searchCommandSurface } from "@/features/command/repository"
import { getDomainErrorMessage } from "@/lib/domain-errors"
import { assertDemoWritable } from "@/lib/demo-mode"
import type {
  QuickCaptureActionState,
  QuickLibraryNoteActionState,
} from "@/features/command/action-state"

export async function searchCommandSurfaceAction(query: string) {
  return searchCommandSurface(query)
}

export async function quickCaptureAction(
  previousState: QuickCaptureActionState,
  formData: FormData
): Promise<QuickCaptureActionState> {
  const parsed = createInboxItemSchema.safeParse({
    content: formData.get("content"),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    return {
      status: "error",
      message: "Revisá la captura antes de guardarla.",
      fieldErrors: {
        content: fieldErrors.content,
      },
      resetKey: previousState.resetKey,
    }
  }

  try {
    assertDemoWritable()
    await createInboxItem(parsed.data)
    revalidatePath("/")
    revalidatePath("/inbox")
    revalidatePath("/review")

    return {
      status: "success",
      message: "Captura guardada.",
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create inbox item from command surface", error)

    return {
      status: "error",
      message: getDomainErrorMessage(error, "No pudimos guardar la captura.", {
        database_unavailable: "Configurá DATABASE_URL para usar la captura global.",
      }),
      resetKey: previousState.resetKey,
    }
  }
}

export async function quickCreateLibraryNoteAction(
  previousState: QuickLibraryNoteActionState,
  formData: FormData
): Promise<QuickLibraryNoteActionState> {
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
    assertDemoWritable()
    const note = await createLibraryNote(parsed.data)
    revalidatePath("/")
    revalidatePath("/library")

    return {
      status: "success",
      message: "Nota guardada en Biblioteca.",
      createdNoteId: note.id,
      resetKey: previousState.resetKey + 1,
    }
  } catch (error) {
    console.error("Failed to create library note from command surface", error)

    return {
      status: "error",
      message: getDomainErrorMessage(error, "No pudimos guardar la nota.", {
        database_unavailable: "Configurá DATABASE_URL para guardar notas desde la command surface.",
      }),
      resetKey: previousState.resetKey,
    }
  }
}
