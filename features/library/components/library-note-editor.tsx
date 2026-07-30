"use client"

import { useActionState } from "react"

import { initialUpdateLibraryNoteActionState } from "@/features/library/action-state"
import { updateLibraryNoteAction } from "@/features/library/actions"
import type { LibraryNote } from "@/features/library/repository"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

export function LibraryNoteEditor({ note }: { note: LibraryNote }) {
  const [state, formAction] = useActionState(
    updateLibraryNoteAction,
    initialUpdateLibraryNoteActionState
  )

  return (
    <form key={note.id} action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={note.id} />

      <div className="space-y-3">
        <input
          name="title"
          defaultValue={note.title}
          placeholder="Título de la nota"
          className={cn(
            "h-12 w-full rounded-2xl border bg-white/[0.03] px-4 text-base text-white outline-none transition",
            "placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <textarea
          name="content"
          defaultValue={note.content}
          rows={16}
          placeholder="Contenido de la nota"
          className={cn(
            "min-h-[320px] w-full rounded-[24px] border bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white outline-none transition",
            "placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
            state.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
          )}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {state.fieldErrors?.id?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.id[0]}</p>
          ) : null}
          {!state.fieldErrors?.id?.[0] && state.fieldErrors?.title?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
          ) : null}
          {!state.fieldErrors?.id?.[0] &&
          !state.fieldErrors?.title?.[0] &&
          state.fieldErrors?.content?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
          ) : null}
          {state.message ? (
            <p
              className={cn(
                "text-sm",
                state.status === "success" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {state.message}
            </p>
          ) : null}
        </div>
        <InboxSubmitButton label="Guardar" pendingLabel="Guardando..." />
      </div>
    </form>
  )
}
