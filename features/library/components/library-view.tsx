import Link from "next/link"
import { BookOpenText, FilePlus2, LibraryBig, Sparkles } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { db } from "@/db"
import { LibraryCreateNoteForm } from "@/features/library/components/library-create-note-form"
import { LibraryNoteEditor } from "@/features/library/components/library-note-editor"
import type { LibraryNote, LibraryNoteListItem } from "@/features/library/repository"
import { cn } from "@/lib/utils"

function formatNoteDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value)
}

function getNotePreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()

  if (normalized.length <= 96) {
    return normalized
  }

  return `${normalized.slice(0, 93)}...`
}

function LibraryNoteList({
  notes,
  selectedNoteId,
}: {
  notes: LibraryNoteListItem[]
  selectedNoteId?: string
}) {
  if (notes.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-sm text-muted-foreground">
        La Biblioteca todavía no tiene notas. Creá la primera y empezá a guardar referencias con lugar propio.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isActive = note.id === selectedNoteId

        return (
          <Link
            key={note.id}
            href={`/library?note=${note.id}`}
            className={cn(
              "block rounded-[24px] border p-4 transition",
              isActive
                ? "border-primary/25 bg-primary/10"
                : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]"
            )}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-medium leading-6 text-white">
                  {note.title}
                </p>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {formatNoteDate(note.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">
                {getNotePreview(note.content)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function LibraryEditorPanel({
  note,
  hasNotes,
}: {
  note: LibraryNote | null
  hasNotes: boolean
}) {
  if (!note) {
    return (
      <section className="surface-1 rounded-[32px] border p-6 md:p-8">
        <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-center">
          <p className="text-base font-medium text-white">
            {hasNotes ? "Elegí una nota para verla y editarla." : "La Biblioteca está lista para recibir tu primera nota."}
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
            {hasNotes
              ? "La Biblioteca vive para guardar referencias tranquilas, no tareas ni proyectos."
              : "Todo lo que quieras conservar como referencia puede vivir acá, sin mezclarlo con ejecución diaria."}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="surface-1 rounded-[32px] border p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-primary/90">Nota activa</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Biblioteca pura. Referencia estable, sin contexto operativo.
          </p>
        </div>
        <span className="rounded-full border border-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {formatNoteDate(note.createdAt)}
        </span>
      </div>

      <LibraryNoteEditor note={note} />
    </section>
  )
}

export function LibraryView({
  notes,
  selectedNote,
}: {
  notes: LibraryNoteListItem[]
  selectedNote: LibraryNote | null
}) {
  const selectedNoteId = selectedNote?.id

  return (
    <PageShell
      eyebrow="Biblioteca"
      title="Notas para pensar mejor, no para ejecutar."
      description="La Biblioteca es el lugar donde vive el conocimiento que querés volver a consultar. No compite con tus áreas; las acompaña."
    >
      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4">
          <section className="surface-1 rounded-[32px] border p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <FilePlus2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Nueva nota</p>
                <p className="text-sm text-muted-foreground">
                  Guardá una referencia limpia en Biblioteca.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <LibraryCreateNoteForm />
            </div>
          </section>

          <section className="surface-1 rounded-[32px] border p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Notas guardadas</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Referencias vivas, separadas de tareas y proyectos.
                </p>
              </div>
              <span className="rounded-full border border-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {notes.length} notas
              </span>
            </div>

            <LibraryNoteList notes={notes} selectedNoteId={selectedNoteId} />
          </section>
        </div>

        <div className="space-y-4">
          <LibraryEditorPanel note={selectedNote} hasNotes={notes.length > 0} />

          <aside className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <LibraryBig className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Qué entra acá</p>
                  <p className="text-sm text-muted-foreground">
                    Ideas que merecen quedarse.
                  </p>
                </div>
              </div>
            </section>

            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <BookOpenText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Diferencia</p>
                  <p className="text-sm text-muted-foreground">
                    Biblioteca no es ejecución. Es consulta y claridad.
                  </p>
                </div>
              </div>
            </section>

            <section className="surface-1 rounded-[32px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white/[0.06] text-white">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Estado</p>
                  <p className="text-sm text-muted-foreground">
                    {db ? "Lista para leer, crear y editar notas reales." : "Configurá DATABASE_URL para guardar notas reales."}
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
