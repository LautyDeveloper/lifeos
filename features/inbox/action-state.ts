import type { SuggestInboxProcessingResult } from "@/features/inbox-ai/schemas"

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

export type ProcessInboxActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: {
    title?: string[]
    containerId?: string[]
    projectId?: string[]
    content?: string[]
    inboxItemId?: string[]
  }
  processedTarget?: "project" | "task" | "note"
  resetKey: number
}

export const initialProcessInboxActionState: ProcessInboxActionState = {
  status: "idle",
  resetKey: 0,
}

export type SuggestInboxProcessingActionState = {
  status: "success" | "error"
  message: string
  suggestion?: SuggestInboxProcessingResult
}
