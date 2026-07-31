import type { Metadata } from "next"

import { LibraryView } from "@/features/library/components/library-view"
import {
  getLibraryNoteById,
  listActiveLibraryNotes,
  listArchivedLibraryNotes,
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
  const [activeNotes, archivedNotes, requestedNote] = await Promise.all([
    listActiveLibraryNotes(filters),
    listArchivedLibraryNotes(),
    requestedNoteId ? getLibraryNoteById(requestedNoteId) : Promise.resolve(null),
  ])
  const selectedNote =
    requestedNote ??
    activeNotes[0] ??
    archivedNotes[0] ??
    null

  return (
    <LibraryView
      activeNotes={activeNotes}
      archivedNotes={archivedNotes}
      selectedNote={selectedNote}
      filters={filters}
    />
  )
}
