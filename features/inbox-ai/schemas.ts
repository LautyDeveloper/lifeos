import { z } from "zod"

import { createInboxItemSchema, processInboxTargetSchema } from "@/features/inbox/schemas"

const optionalSuggestionText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined)

export const suggestInboxProcessingInputSchema = z.object({
  content: createInboxItemSchema.shape.content,
})

export const suggestInboxProcessingResultSchema = z.object({
  suggestedTarget: processInboxTargetSchema,
  suggestedTitle: z.string().trim().min(1).max(180),
  suggestedDescription: optionalSuggestionText(2000),
  suggestedContent: optionalSuggestionText(8000),
  reason: optionalSuggestionText(240),
  confidence: z.enum(["low", "medium", "high"]).optional(),
})

export type SuggestInboxProcessingInput = z.infer<typeof suggestInboxProcessingInputSchema>
export type SuggestInboxProcessingResult = z.infer<typeof suggestInboxProcessingResultSchema>
