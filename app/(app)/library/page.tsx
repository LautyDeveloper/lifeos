import type { Metadata } from "next"

import { LibraryView } from "@/features/library/components/library-view"
import {
  getLibraryNoteById,
  listLibraryNotes,
} from "@/features/library/repository"

export const metadata: Metadata = {
  title: "Biblioteca",
}

type LibraryPageProps = {
  searchParams?: Promise<{
    note?: string | string[]
  }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const requestedNoteId = Array.isArray(resolvedSearchParams.note)
    ? resolvedSearchParams.note[0]
    : resolvedSearchParams.note

  const notes = await listLibraryNotes()
  const fallbackNoteId = notes[0]?.id
  const requestedNote = requestedNoteId
    ? await getLibraryNoteById(requestedNoteId)
    : null
  const selectedNote = requestedNote
    ? requestedNote
    : fallbackNoteId
      ? await getLibraryNoteById(fallbackNoteId)
      : null

  return <LibraryView notes={notes} selectedNote={selectedNote} />
}
