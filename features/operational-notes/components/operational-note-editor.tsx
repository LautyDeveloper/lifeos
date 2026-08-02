"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, PencilLine } from "lucide-react"

import {
  initialUpdateOperationalNoteActionState,
  type UpdateOperationalNoteActionState,
} from "@/features/operational-notes/action-state"
import { updateOperationalNoteAction } from "@/features/operational-notes/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

type WorkspaceNote = {
  id: string
  title: string
  content: string
  updatedAt: Date
}

function getContentPreview(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim()
  return normalized.length > 120 ? `${normalized.slice(0, 117)}...` : normalized
}

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
  }).format(date)
}

export function OperationalNoteEditor({
  note,
  path,
}: {
  note: WorkspaceNote
  path: string
}) {
  const [state, formAction] = useActionState<UpdateOperationalNoteActionState, FormData>(
    updateOperationalNoteAction,
    initialUpdateOperationalNoteActionState
  )
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const preview = useMemo(() => getContentPreview(note.content), [note.content])

  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => titleRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    const timer = window.setTimeout(() => titleRef.current?.focus(), 10)
    return () => window.clearTimeout(timer)
  }, [state.resetKey, state.status])

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-[22px] border border-white/[0.06] bg-white/[0.02] px-4 py-3"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 space-y-1.5">
          <p className="content-title">{note.title}</p>
          <p className="context-line">{preview}</p>
          <div className="meta-row">
            <span className="meta-item">Actualizada {formatUpdatedAt(note.updatedAt)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
          <PencilLine className="size-4" />
          <span className="hidden sm:inline">Editar</span>
          <ChevronDown
            className="size-4 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </div>
      </summary>

      <form ref={formRef} action={formAction} className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
        <input type="hidden" name="id" value={note.id} />
        <input type="hidden" name="path" value={path} />

        <div className="grid gap-3">
          <input
            ref={titleRef}
            name="title"
            defaultValue={note.title}
            className={cn(
              "field-base h-11 w-full rounded-2xl px-4 text-sm",
              state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
            )}
          />
          <textarea
            name="content"
            defaultValue={note.content}
            rows={6}
            className={cn(
              "field-base min-h-40 w-full resize-y rounded-[22px] px-4 py-3 text-sm leading-7",
              state.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
            )}
          />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-h-10 space-y-1" aria-live="polite">
            {state.fieldErrors?.title?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            ) : !state.fieldErrors?.title?.[0] && state.fieldErrors?.content?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            ) : state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.status === "success" ? "text-primary/90" : "text-muted-foreground"
                )}
              >
                {state.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Mantené solo el contexto que realmente te ayude a ejecutar mejor.
              </p>
            )}
          </div>
          <InboxSubmitButton label="Guardar" pendingLabel="Guardando..." />
        </div>
      </form>
    </details>
  )
}
