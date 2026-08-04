import type { SuggestInboxProcessingResult } from "@/features/inbox-ai/schemas"
import { deriveInboxTitle } from "@/features/inbox/utils"

export function normalizeInboxSuggestion(
  suggestion: Partial<SuggestInboxProcessingResult>,
  content: string
): SuggestInboxProcessingResult {
  const suggestedTarget = suggestion.suggestedTarget ?? "note"
  const suggestedTitle = suggestion.suggestedTitle?.trim() || deriveInboxTitle(content)
  const suggestedDescription =
    suggestedTarget === "project" ? suggestion.suggestedDescription?.trim() || undefined : undefined
  const suggestedContent =
    suggestedTarget === "note"
      ? suggestion.suggestedContent?.trim() || content.trim() || content
      : undefined
  const reason = suggestion.reason?.trim() || undefined

  return {
    suggestedTarget,
    suggestedTitle,
    suggestedDescription,
    suggestedContent,
    reason,
    confidence: suggestion.confidence,
  }
}
