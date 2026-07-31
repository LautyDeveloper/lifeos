"use client"

import { useActionState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

import { initialCreateLibraryNoteActionState } from "@/features/library/action-state"
import { createLibraryNoteAction } from "@/features/library/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

export function LibraryCreateNoteForm() {
  return <LibraryCreateNoteFormInner />
}

export function LibraryCreateNoteFormInner({
  compact = false,
  redirectToNote = true,
}: {
  compact?: boolean
  redirectToNote?: boolean
}) {
  const [state, formAction] = useActionState(
    createLibraryNoteAction,
    initialCreateLibraryNoteActionState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()

    if (redirectToNote && state.createdNoteId) {
      router.replace(`/library?note=${state.createdNoteId}`)
      return
    }

    titleRef.current?.focus()
  }, [redirectToNote, router, state.createdNoteId, state.resetKey, state.status])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-3">
        <input
          ref={titleRef}
          name="title"
          placeholder="Nueva nota de referencia..."
          className={cn(
            "h-11 w-full rounded-2xl border bg-white/[0.03] px-4 text-sm text-white outline-none transition",
            "placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <textarea
          name="content"
          rows={compact ? 4 : 5}
          placeholder="Guardá una idea, una definición, una referencia o una nota que quieras volver a consultar."
          className={cn(
            "w-full rounded-[22px] border bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white outline-none transition resize-none",
            "placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
            state.fieldErrors?.content ? "border-destructive/50" : "border-white/8",
            compact && "min-h-28"
          )}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          {state.fieldErrors?.title?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
          ) : null}
          {!state.fieldErrors?.title?.[0] && state.fieldErrors?.content?.[0] ? (
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
        <InboxSubmitButton label={compact ? "Guardar nota" : "Nueva nota"} pendingLabel="Guardando..." />
      </div>
    </form>
  )
}
