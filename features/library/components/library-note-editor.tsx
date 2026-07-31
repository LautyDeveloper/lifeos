"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"

import { saveLibraryNoteAction } from "@/features/library/actions"
import type { LibraryNote } from "@/features/library/repository"
import { LibraryNoteLifecycleActions } from "@/features/library/components/library-note-lifecycle-actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "dirty" | "saving" | "error"

export function LibraryNoteEditor({
  note,
  nextHref,
  restoreHref,
}: {
  note: LibraryNote
  nextHref: string
  restoreHref: string
}) {
  const isArchived = Boolean(note.archivedAt)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [status, setStatus] = useState<SaveStatus>("saved")
  const [pending, startTransition] = useTransition()
  const lastSaved = useRef(JSON.stringify({ title: note.title, content: note.content }))

  const save = useCallback(() => {
    if (isArchived) return
    if (!title.trim() || !content.trim() || title.length > 180) return
    const snapshot = JSON.stringify({ title, content })
    if (snapshot === lastSaved.current) return
    setStatus("saving")
    startTransition(async () => {
      const data = new FormData()
      data.set("id", note.id)
      data.set("title", title)
      data.set("content", content)
      const result = await saveLibraryNoteAction(data)
      if (result.status === "success") {
        lastSaved.current = snapshot
        setStatus("saved")
      } else {
        setStatus("error")
      }
    })
  }, [content, isArchived, note.id, title])

  useEffect(() => {
    if (isArchived) return
    const snapshot = JSON.stringify({ title, content })
    if (snapshot === lastSaved.current) return
    setStatus("dirty")
    if (!title.trim() || !content.trim() || title.length > 180) return
    const timer = window.setTimeout(save, 800)
    return () => window.clearTimeout(timer)
  }, [content, isArchived, save, title])

  return (
    <form onSubmit={(event) => { event.preventDefault(); save() }} className="space-y-4">
      <div className="space-y-3">
        <input value={title} disabled={isArchived} onChange={(event) => setTitle(event.target.value)} aria-label="Título de la nota" placeholder="Título de la nota"
          className={cn("field-base h-12 w-full rounded-2xl px-4 text-base disabled:cursor-not-allowed disabled:opacity-80", !title.trim() || title.length > 180 ? "border-destructive/50" : "border-white/8")} />
        <textarea value={content} disabled={isArchived} onChange={(event) => setContent(event.target.value)} aria-label="Contenido de la nota" rows={16} placeholder="Contenido de la nota"
          className={cn("field-base min-h-[320px] w-full resize-y rounded-[24px] px-4 py-4 text-sm leading-7 disabled:cursor-not-allowed disabled:opacity-80", !content.trim() ? "border-destructive/50" : "border-white/8")} />
      </div>
      {isArchived ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Esta nota está archivada. Podés restaurarla o eliminarla definitivamente.
          </p>
          <LibraryNoteLifecycleActions
            noteId={note.id}
            mode="archived"
            nextHref={nextHref}
            restoreHref={restoreHref}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p role="status" aria-live="polite" className={cn("text-sm", status === "error" ? "text-red-300" : status === "saved" ? "text-primary/90" : "text-muted-foreground")}>
            {status === "saving" || pending ? "Guardando..." : status === "dirty" ? "Cambios pendientes" : status === "error" ? "No se pudo guardar. Reintentá." : "Guardado"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LibraryNoteLifecycleActions
              noteId={note.id}
              mode="active"
              nextHref={nextHref}
              restoreHref={restoreHref}
            />
            <Button type="submit" disabled={pending || !title.trim() || !content.trim() || title.length > 180}>Guardar</Button>
          </div>
        </div>
      )}
    </form>
  )
}
