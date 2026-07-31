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
    if (!compact) {
      return
    }

    const timer = window.setTimeout(() => titleRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [compact])

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
            "field-base h-11 w-full rounded-2xl px-4 text-sm",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <textarea
          name="content"
          rows={compact ? 4 : 5}
          placeholder="Guardá una idea, una definición, una referencia o una nota que quieras volver a consultar."
          className={cn(
            "field-base w-full resize-none rounded-[22px] px-4 py-3 text-sm leading-7",
            state.fieldErrors?.content ? "border-destructive/50" : "border-white/8",
            compact && "min-h-28"
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
              {compact
                ? "Una nota breve y clara alcanza para dejar contexto útil."
                : "Biblioteca es para conocimiento y referencia, no para ejecución."}
            </p>
          )}
        </div>
        <InboxSubmitButton label={compact ? "Guardar nota" : "Nueva nota"} pendingLabel="Guardando..." />
      </div>
    </form>
  )
}
