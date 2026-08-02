"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Plus, X } from "lucide-react"

import { initialCreateContainerActionState } from "@/features/settings/action-state"
import { createContainerAction } from "@/features/settings/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

export function CreateContainerForm({
  areaId,
}: {
  areaId: string
}) {
  const [state, formAction] = useActionState(
    createContainerAction,
    initialCreateContainerActionState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (state.status !== "success") return
    formRef.current?.reset()
    const timer = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [state.resetKey, state.status])

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  if (!open && state.status !== "error") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-transparent px-3 text-sm font-medium text-primary transition hover:bg-white/[0.03]"
      >
        <Plus className="size-4" />
        Nuevo container
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 overflow-hidden rounded-[22px] border border-white/[0.05] bg-white/[0.02] p-3"
    >
      <input type="hidden" name="areaId" value={areaId} />

      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          name="name"
          placeholder="Nombre del container..."
          className={cn(
            "field-base h-11 rounded-2xl px-4 text-sm",
            state.fieldErrors?.name ? "border-destructive/50" : "border-white/8"
          )}
        />
        <textarea
          name="description"
          rows={3}
          placeholder="Descripción breve opcional."
          className={cn(
            "field-base block w-full resize-none rounded-[20px] px-4 py-3 text-sm leading-6",
            state.fieldErrors?.description ? "border-destructive/50" : "border-white/8"
          )}
        />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-h-10 space-y-1" aria-live="polite">
          {state.fieldErrors?.name?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
          ) : state.fieldErrors?.description?.[0] ? (
            <p className="text-sm text-destructive">{state.fieldErrors.description[0]}</p>
          ) : state.message ? (
            <p className={cn("text-sm", state.status === "success" ? "text-primary/90" : "text-muted-foreground")}>
              {state.message}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Se crea al final del área y queda activo de inmediato.
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-[18px] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
            aria-label="Cancelar nuevo container"
          >
            <X className="size-4" />
          </button>
          <InboxSubmitButton label="Crear container" pendingLabel="Guardando..." />
        </div>
      </div>
    </form>
  )
}
