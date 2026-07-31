import { and, asc, desc, eq, ilike, isNull, or } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { notes } from "@/db/schema"
import type {
  CreateLibraryNoteInput,
  UpdateLibraryNoteInput,
} from "@/features/library/schemas"

export type LibraryNoteListItem = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export type LibraryNote = LibraryNoteListItem
export type LibraryFilters = {
  query?: string
  sort?: "recent" | "oldest" | "title"
  note?: string
}

export async function listLibraryNotes(filters: LibraryFilters = {}): Promise<LibraryNoteListItem[]> {
  if (!db) {
    return []
  }

  const query = filters.query?.trim()
  const orderBy =
    filters.sort === "oldest"
      ? asc(notes.createdAt)
      : filters.sort === "title"
        ? asc(notes.title)
        : desc(notes.updatedAt)

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(and(isNull(notes.containerId), query ? or(ilike(notes.title, `%${query}%`), ilike(notes.content, `%${query}%`)) : undefined))
    .orderBy(orderBy)
}

export async function getLibraryNoteById(id: string): Promise<LibraryNote | null> {
  if (!db) {
    return null
  }

  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(and(eq(notes.id, id), isNull(notes.containerId)))
    .limit(1)

  return note ?? null
}

export async function createLibraryNote(input: CreateLibraryNoteInput) {
  const database = getDbOrThrow()

  const [note] = await database
    .insert(notes)
    .values({
      title: input.title,
      content: input.content,
      containerId: null,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })

  return note
}

export async function updateLibraryNote(input: UpdateLibraryNoteInput) {
  const database = getDbOrThrow()

  const [existingNote] = await database
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, input.id), isNull(notes.containerId)))
    .limit(1)

  if (!existingNote) {
    throw new Error("Library note not found.")
  }

  const [updatedNote] = await database
    .update(notes)
    .set({
      title: input.title,
      content: input.content,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), isNull(notes.containerId)))
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })

  return updatedNote
}
