import Link from "next/link"
import { ArrowLeft, FilePlus2, Search } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { LibraryCreateNoteForm } from "@/features/library/components/library-create-note-form"
import { LibraryNoteEditor } from "@/features/library/components/library-note-editor"
import type { LibraryFilters, LibraryNote, LibraryNoteListItem } from "@/features/library/repository"
import { cn } from "@/lib/utils"

function formatNoteDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(value)
}

function buildNoteHref(noteId: string, filters: LibraryFilters) {
  const params = new URLSearchParams()
  params.set("note", noteId)
  if (filters.query) params.set("q", filters.query)
  if (filters.sort && filters.sort !== "recent") params.set("sort", filters.sort)
  return `/library?${params.toString()}`
}

function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return <>{text.split(new RegExp(`(${escaped})`, "ig")).map((part, index) => part.toLowerCase() === query.toLowerCase() ? <mark key={index} className="rounded bg-primary/20 text-white">{part}</mark> : part)}</>
}

export function LibraryView({ notes, selectedNote, filters }: {
  notes: LibraryNoteListItem[]
  selectedNote: LibraryNote | null
  filters: LibraryFilters
}) {
  return (
    <PageShell eyebrow="Biblioteca" title="Ideas a las que vale la pena volver." description="Referencias y notas, separadas del ruido operativo.">
      <div className="grid gap-5 xl:min-h-[calc(100dvh-20rem)] xl:grid-cols-[0.72fr_1.28fr]">
        <aside className={cn("surface-1 rounded-2xl border p-4 sm:p-5", selectedNote && "hidden xl:block")}>
          <form method="get" className="grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
            <label className="relative">
              <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" />
              <span className="sr-only">Buscar notas</span>
              <input name="q" defaultValue={filters.query} placeholder="Buscar por título..." className="h-11 w-full rounded-xl border border-white/8 bg-white/[0.025] pl-10 pr-3 text-sm text-white outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10" />
            </label>
            <select name="sort" defaultValue={filters.sort ?? "recent"} aria-label="Ordenar notas" className="h-11 rounded-xl border border-white/8 bg-card px-3 text-sm text-white outline-none focus:border-primary/40">
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="title">Por título</option>
            </select>
            <button type="submit" className="sr-only">Aplicar filtros</button>
          </form>

          <details className="mt-4 rounded-xl border border-white/8">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-3 text-sm font-medium text-white [&::-webkit-details-marker]:hidden"><FilePlus2 className="size-4 text-primary" /> Nueva nota</summary>
            <div className="border-t border-white/8 p-3"><LibraryCreateNoteForm /></div>
          </details>

          <div className="mt-5 space-y-1">
            {notes.length ? notes.map((note) => (
              <Link key={note.id} href={buildNoteHref(note.id, filters)} aria-current={note.id === selectedNote?.id ? "page" : undefined}
                className={cn("block rounded-xl px-3 py-3 transition", note.id === selectedNote?.id ? "bg-primary/10" : "hover:bg-white/[0.035]")}>
                <p className="line-clamp-1 text-sm font-medium text-white"><Highlight text={note.title} query={filters.query} /></p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground"><Highlight text={note.content.replace(/\s+/g, " ")} query={filters.query} /></p>
                <p className="mt-1 text-[11px] text-muted-foreground">Editada {formatNoteDate(note.updatedAt)}</p>
              </Link>
            )) : <p className="py-10 text-center text-sm text-muted-foreground">{filters.query ? "No encontramos notas con ese título." : "Todavía no hay notas."}</p>}
          </div>
        </aside>

        <section className={cn("surface-1 rounded-2xl border p-5 sm:p-7", !selectedNote && "hidden xl:block")}>
          {selectedNote ? (
            <>
              <Link href={`/library${filters.query || filters.sort !== "recent" ? `?${new URLSearchParams({ ...(filters.query ? { q: filters.query } : {}), ...(filters.sort && filters.sort !== "recent" ? { sort: filters.sort } : {}) }).toString()}` : ""}`} className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary xl:hidden"><ArrowLeft className="size-4" /> Volver a las notas</Link>
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Nota activa</p>
                <span className="text-xs text-muted-foreground">Editada {formatNoteDate(selectedNote.updatedAt)}</span>
              </div>
              <LibraryNoteEditor note={selectedNote} />
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center text-center">
              <div>
                <p className="font-medium text-white">{filters.query ? "Probá con otra búsqueda." : "Elegí una nota para abrirla."}</p>
                <p className="mt-2 text-sm text-muted-foreground">Tu biblioteca queda disponible para leer y editar con calma.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  )
}
