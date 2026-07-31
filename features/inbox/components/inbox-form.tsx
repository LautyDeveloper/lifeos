"use client"

import { useActionState, useEffect, useRef } from "react"

import { initialInboxActionState } from "@/features/inbox/action-state"
import {
  createInboxItemAction,
} from "@/features/inbox/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

export function InboxForm({
  databaseReady,
  compact = false,
  onSuccess,
}: {
  databaseReady: boolean
  compact?: boolean
  onSuccess?: () => void
}) {
  const [state, formAction] = useActionState(
    createInboxItemAction,
    initialInboxActionState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    textareaRef.current?.focus()
    onSuccess?.()
  }, [onSuccess, state.resetKey, state.status])

  return (
    <form
      ref={formRef}
      action={formAction}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault()
          formRef.current?.requestSubmit()
        }
      }}
      className="surface-1 rounded-[28px] border p-6 md:p-7"
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-3">
          <p className="eyebrow">{compact ? "Nueva captura" : "Captura rápida"}</p>
          <p className="text-lg font-medium tracking-[-0.03em] text-white">
            Soltalo ahora. Ordenar viene después.
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            Soltalo acá. No hace falta decidir todavía si es proyecto, tarea o nota.
          </p>
        </div>

        <div className="space-y-4">
          <textarea
            ref={textareaRef}
            name="content"
            rows={compact ? 3 : 4}
            disabled={!databaseReady}
            placeholder="Ej: pensar el flujo para procesar ideas del inbox..."
            className={cn(
              "field-base min-h-36 w-full resize-none rounded-[24px] px-4 py-4 text-sm leading-7",
              "disabled:cursor-not-allowed disabled:opacity-60",
              state.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
            )}
          />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              {state.fieldErrors?.content?.length ? (
                <p className="text-sm text-destructive">
                  {state.fieldErrors.content[0]}
                </p>
              ) : null}
              {state.message ? (
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "text-sm",
                    state.status === "success" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {state.message}
                </p>
              ) : null}
              {!databaseReady ? (
                <p className="text-sm text-muted-foreground">
                  Configurá <code>DATABASE_URL</code> para persistir capturas reales.
                </p>
              ) : null}
            </div>

            <InboxSubmitButton />
          </div>
        </div>
      </div>
    </form>
  )
}
