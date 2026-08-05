"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { FolderPlus, X } from "lucide-react"

import { initialCreateProjectActionState } from "@/features/areas/action-state"
import { createProjectAction } from "@/features/areas/actions"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

function CreateProjectFormSession({
  containerId,
  path,
  onSuccess,
  onCancel,
}: {
  containerId: string
  path: string
  onSuccess: (message?: string) => void
  onCancel: () => void
}) {
  const [state, formAction] = useActionState(
    createProjectAction,
    initialCreateProjectActionState
  )
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    const timer = window.setTimeout(() => onSuccess(state.message), 0)
    return () => window.clearTimeout(timer)
  }, [onSuccess, state.message, state.resetKey, state.status])

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 overflow-hidden rounded-[22px] border border-white/[0.05] bg-white/[0.02] p-3 transition-all duration-200 motion-reduce:transition-none"
    >
      <input type="hidden" name="containerId" value={containerId} />
      <input type="hidden" name="path" value={path} />

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          ref={inputRef}
          name="title"
          placeholder="Nombre del nuevo proyecto..."
          className={cn(
            "field-base h-11 flex-1 rounded-2xl px-4 text-sm",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <InboxSubmitButton label="Crear proyecto" pendingLabel="Guardando..." />
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-11 items-center justify-center rounded-[18px] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
          aria-label="Cancelar nuevo proyecto"
        >
          <X className="size-4" />
        </button>
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
            Arranca en Backlog para que puedas organizar antes de activarlo.
          </p>
        )}
      </div>
    </form>
  )
}

export function CreateProjectForm({
  containerId,
  path,
}: {
  containerId: string
  path: string
}) {
  const [open, setOpen] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [feedback, setFeedback] = useState<string>()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeSession = () => {
    setOpen(false)
    setSessionKey((current) => current + 1)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <div className="space-y-3">
      {!open ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setFeedback(undefined)
            setOpen(true)
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-transparent px-3 text-sm font-medium text-primary transition hover:bg-white/[0.03]"
        >
          <FolderPlus className="size-4" />
          Nuevo proyecto
        </button>
      ) : (
        <CreateProjectFormSession
          key={sessionKey}
          containerId={containerId}
          path={path}
          onCancel={closeSession}
          onSuccess={(message) => {
            setFeedback(message ?? "Proyecto creado en Backlog.")
            closeSession()
          }}
        />
      )}

      {!open && feedback ? (
        <p className="min-h-5 text-sm text-primary/90" aria-live="polite">
          {feedback}
        </p>
      ) : null}
    </div>
  )
}
