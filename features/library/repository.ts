import { and, asc, desc, eq, ilike, isNotNull, isNull, or } from "drizzle-orm"

import { db, getDbOrThrow } from "@/db"
import { notes } from "@/db/schema"
import type {
  ArchiveLibraryNoteInput,
  CreateLibraryNoteInput,
  DeleteLibraryNoteInput,
  RestoreLibraryNoteInput,
  UpdateLibraryNoteInput,
} from "@/features/library/schemas"

export type LibraryNoteListItem = {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  archivedAt: Date | null
}

export type LibraryNote = LibraryNoteListItem
export type LibraryFilters = {
  query?: string
  sort?: "recent" | "oldest" | "title"
  note?: string
}

function getLibraryNoteScope() {
  return and(isNull(notes.containerId), isNull(notes.projectId))
}

export async function listActiveLibraryNotes(
  filters: LibraryFilters = {}
): Promise<LibraryNoteListItem[]> {
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
      archivedAt: notes.archivedAt,
    })
    .from(notes)
    .where(
      and(
        getLibraryNoteScope(),
        isNull(notes.archivedAt),
        query ? or(ilike(notes.title, `%${query}%`), ilike(notes.content, `%${query}%`)) : undefined
      )
    )
    .orderBy(orderBy)
}

export async function listArchivedLibraryNotes(): Promise<LibraryNoteListItem[]> {
  if (!db) {
    return []
  }

  return db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
    })
    .from(notes)
    .where(and(getLibraryNoteScope(), isNotNull(notes.archivedAt)))
    .orderBy(desc(notes.archivedAt), desc(notes.updatedAt))
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
      archivedAt: notes.archivedAt,
    })
    .from(notes)
    .where(and(eq(notes.id, id), getLibraryNoteScope()))
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
      projectId: null,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
    })

  return note
}

export async function updateLibraryNote(input: UpdateLibraryNoteInput) {
  const database = getDbOrThrow()

  const [existingNote] = await database
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNull(notes.archivedAt)))
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
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      archivedAt: notes.archivedAt,
    })

  return updatedNote
}

export async function archiveLibraryNote(input: ArchiveLibraryNoteInput) {
  const database = getDbOrThrow()

  const [existingNote] = await database
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNull(notes.archivedAt)))
    .limit(1)

  if (!existingNote) {
    throw new Error("Active library note not found.")
  }

  const [archivedNote] = await database
    .update(notes)
    .set({
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      archivedAt: notes.archivedAt,
    })

  return archivedNote
}

export async function restoreLibraryNote(input: RestoreLibraryNoteInput) {
  const database = getDbOrThrow()

  const [existingNote] = await database
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNotNull(notes.archivedAt)))
    .limit(1)

  if (!existingNote) {
    throw new Error("Archived library note not found.")
  }

  const [restoredNote] = await database
    .update(notes)
    .set({
      archivedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNotNull(notes.archivedAt)))
    .returning({
      id: notes.id,
      archivedAt: notes.archivedAt,
    })

  return restoredNote
}

export async function deleteLibraryNote(input: DeleteLibraryNoteInput) {
  const database = getDbOrThrow()

  const [existingNote] = await database
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNotNull(notes.archivedAt)))
    .limit(1)

  if (!existingNote) {
    throw new Error("Archived library note not found.")
  }

  const [deletedNote] = await database
    .delete(notes)
    .where(and(eq(notes.id, input.id), getLibraryNoteScope(), isNotNull(notes.archivedAt)))
    .returning({
      id: notes.id,
    })

  return deletedNote
}
