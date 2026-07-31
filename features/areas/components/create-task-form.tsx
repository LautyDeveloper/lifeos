"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Plus, X } from "lucide-react"

import { initialCreateTaskActionState } from "@/features/areas/action-state"
import { createTaskAction } from "@/features/areas/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

export function CreateTaskForm({
  projectId,
  path,
}: {
  projectId: string
  path: string
}) {
  const [state, formAction] = useActionState(
    createTaskAction,
    initialCreateTaskActionState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    const timer = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [state.resetKey, state.status])

  useEffect(() => {
    if (!open) {
      return
    }

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
        Agregar tarea
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 overflow-hidden rounded-[22px] border border-white/[0.05] bg-white/[0.02] p-3 transition-all duration-200 motion-reduce:transition-none"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="path" value={path} />

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          ref={inputRef}
          name="title"
          placeholder="Nueva tarea dentro de este proyecto..."
          className={cn(
            "field-base h-11 flex-1 rounded-2xl px-4 text-sm",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <InboxSubmitButton
          label="Agregar tarea"
          pendingLabel="Guardando..."
        />
        <button type="button" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-[18px] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white" aria-label="Cancelar nueva tarea"><X className="size-4" /></button>
      </div>

      <div className="min-h-5" aria-live="polite">
        {state.fieldErrors?.title?.[0] ? (
          <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
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
            La tarea se guarda directamente dentro de este proyecto.
          </p>
        )}
      </div>
    </form>
  )
}
