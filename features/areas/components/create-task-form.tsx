"use client"

import { useActionState, useEffect, useRef } from "react"

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

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    inputRef.current?.focus()
  }, [state.resetKey, state.status])

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
