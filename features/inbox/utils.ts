export function deriveInboxTitle(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()

  if (!normalized) {
    return ""
  }

  if (normalized.length <= 72) {
    return normalized
  }

  return `${normalized.slice(0, 69).trimEnd()}...`
}
