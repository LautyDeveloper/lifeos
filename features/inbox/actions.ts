"use server"

import { revalidatePath } from "next/cache"

import { createInboxItem } from "@/features/inbox/repository"
import { createInboxItemSchema } from "@/features/inbox/schemas"

export type InboxActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    content?: string[]
  }
  resetKey: number
}

export const initialInboxActionState: InboxActionState = {
  status: "idle",
  resetKey: 0,
}

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

  return {
    status: "success",
    message: "Capturado. Lo organizás después.",
    resetKey: previousState.resetKey + 1,
  }
}
