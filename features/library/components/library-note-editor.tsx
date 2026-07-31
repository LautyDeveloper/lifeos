"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"

import { saveLibraryNoteAction } from "@/features/library/actions"
import type { LibraryNote } from "@/features/library/repository"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SaveStatus = "saved" | "dirty" | "saving" | "error"

export function LibraryNoteEditor({ note }: { note: LibraryNote }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [status, setStatus] = useState<SaveStatus>("saved")
  const [pending, startTransition] = useTransition()
  const lastSaved = useRef(JSON.stringify({ title: note.title, content: note.content }))

  const save = useCallback(() => {
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
  }, [content, note.id, title])

  useEffect(() => {
    const snapshot = JSON.stringify({ title, content })
    if (snapshot === lastSaved.current) return
    setStatus("dirty")
    if (!title.trim() || !content.trim() || title.length > 180) return
    const timer = window.setTimeout(save, 800)
    return () => window.clearTimeout(timer)
  }, [content, save, title])

  return (
    <form onSubmit={(event) => { event.preventDefault(); save() }} className="space-y-4">
      <div className="space-y-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Título de la nota" placeholder="Título de la nota"
          className={cn("h-12 w-full rounded-xl border bg-white/[0.03] px-4 text-base text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10", !title.trim() || title.length > 180 ? "border-destructive/50" : "border-white/8")} />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} aria-label="Contenido de la nota" rows={16} placeholder="Contenido de la nota"
          className={cn("min-h-[320px] w-full resize-y rounded-xl border bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10", !content.trim() ? "border-destructive/50" : "border-white/8")} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p role="status" aria-live="polite" className={cn("text-sm", status === "error" ? "text-red-300" : status === "saved" ? "text-primary" : "text-muted-foreground")}>
          {status === "saving" || pending ? "Guardando…" : status === "dirty" ? "Cambios pendientes" : status === "error" ? "No se pudo guardar. Reintentá." : "Guardado"}
        </p>
        <Button type="submit" disabled={pending || !title.trim() || !content.trim() || title.length > 180}>Guardar</Button>
      </div>
    </form>
  )
}
