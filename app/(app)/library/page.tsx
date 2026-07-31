import type { Metadata } from "next"

import { LibraryView } from "@/features/library/components/library-view"
import {
  getLibraryNoteById,
  listLibraryNotes,
  type LibraryFilters,
} from "@/features/library/repository"

export const metadata: Metadata = {
  title: "Biblioteca",
}

type LibraryPageProps = {
  searchParams?: Promise<{
    note?: string | string[]
    q?: string | string[]
    sort?: string | string[]
  }>
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {}
  const requestedNoteId = Array.isArray(resolvedSearchParams.note)
    ? resolvedSearchParams.note[0]
    : resolvedSearchParams.note

  const query = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q
  const rawSort = Array.isArray(resolvedSearchParams.sort) ? resolvedSearchParams.sort[0] : resolvedSearchParams.sort
  const sort: LibraryFilters["sort"] = rawSort === "oldest" || rawSort === "title" ? rawSort : "recent"
  const filters: LibraryFilters = { query, sort, note: requestedNoteId }
  const notes = await listLibraryNotes(filters)
  const requestedNote = requestedNoteId
    ? await getLibraryNoteById(requestedNoteId)
    : null
  const selectedNote = requestedNote

  return <LibraryView notes={notes} selectedNote={selectedNote} filters={filters} />
}
