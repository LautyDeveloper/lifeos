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

  if (!open && state.status !== "error") {
    return <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/10"><Plus className="size-4" /> Agregar tarea</button>
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="path" value={path} />

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          ref={inputRef}
          name="title"
          placeholder="Nueva tarea dentro de este proyecto..."
          className={cn(
            "h-11 flex-1 rounded-2xl border bg-white/[0.03] px-4 text-sm text-white outline-none transition",
            "placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <InboxSubmitButton
          label="Agregar tarea"
          pendingLabel="Guardando..."
        />
        <button type="button" onClick={() => setOpen(false)} className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/[0.04] hover:text-white" aria-label="Cancelar nueva tarea"><X className="size-4" /></button>
      </div>

      {state.fieldErrors?.title?.[0] ? (
        <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
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
    </form>
  )
}
