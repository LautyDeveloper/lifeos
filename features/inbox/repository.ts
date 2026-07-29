import { desc } from "drizzle-orm"

import { db } from "@/db"
import { inboxItems } from "@/db/schema"
import type { CreateInboxItemInput } from "@/features/inbox/schemas"

export async function listInboxItems() {
  if (!db) {
    return []
  }

  return db
    .select({
      id: inboxItems.id,
      content: inboxItems.content,
      capturedAt: inboxItems.capturedAt,
      processedAt: inboxItems.processedAt,
    })
    .from(inboxItems)
    .orderBy(desc(inboxItems.capturedAt))
}

export async function createInboxItem(input: CreateInboxItemInput) {
  if (!db) {
    throw new Error("DATABASE_URL is not configured.")
  }

  const [item] = await db
    .insert(inboxItems)
    .values({
      content: input.content,
    })
    .returning({
      id: inboxItems.id,
      content: inboxItems.content,
      capturedAt: inboxItems.capturedAt,
      processedAt: inboxItems.processedAt,
    })

  return item
}
