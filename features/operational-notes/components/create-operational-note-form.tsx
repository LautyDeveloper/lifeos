"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { FileText, X } from "lucide-react"

import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import {
  initialCreateOperationalNoteActionState,
  type CreateOperationalNoteActionState,
} from "@/features/operational-notes/action-state"
import {
  createContainerNoteAction,
  createProjectNoteAction,
  createTaskNoteAction,
} from "@/features/operational-notes/actions"
import { cn } from "@/lib/utils"

type CreateAction = (
  previousState: CreateOperationalNoteActionState,
  formData: FormData
) => Promise<CreateOperationalNoteActionState>

function CreateOperationalNoteFormInner({
  action,
  hiddenFieldName,
  hiddenFieldValue,
  path,
  placeholder,
}: {
  action: CreateAction
  hiddenFieldName: "containerId" | "projectId" | "taskId"
  hiddenFieldValue: string
  path: string
  placeholder: string
}) {
  const [state, formAction] = useActionState(
    action,
    initialCreateOperationalNoteActionState
  )
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => titleRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    formRef.current?.reset()
    titleRef.current?.focus()
  }, [state.resetKey, state.status])

  if (!open && state.status !== "error") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-transparent px-3 text-sm font-medium text-primary transition hover:bg-white/[0.03]"
      >
        <FileText className="size-4" />
        Nueva nota
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 overflow-hidden rounded-[22px] border border-white/[0.05] bg-white/[0.02] p-3 transition-all duration-200 motion-reduce:transition-none"
    >
      <input type="hidden" name={hiddenFieldName} value={hiddenFieldValue} />
      <input type="hidden" name="path" value={path} />

      <div className="grid gap-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            ref={titleRef}
            name="title"
            placeholder={placeholder}
            className={cn(
              "field-base h-11 flex-1 rounded-2xl px-4 text-sm",
              state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
            )}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex size-11 items-center justify-center rounded-[18px] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white md:order-last"
            aria-label="Cancelar nueva nota"
          >
            <X className="size-4" />
          </button>
        </div>

        <textarea
          name="content"
          rows={4}
          placeholder="Guardá contexto útil, una aclaración, una idea o una referencia para este espacio."
          className={cn(
            "field-base min-h-32 w-full resize-y rounded-[22px] px-4 py-3 text-sm leading-7",
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
              Una nota breve alcanza para no perder contexto operativo.
            </p>
          )}
        </div>
        <InboxSubmitButton label="Guardar nota" pendingLabel="Guardando..." />
      </div>
    </form>
  )
}

export function CreateContainerNoteForm({
  containerId,
  path,
}: {
  containerId: string
  path: string
}) {
  return (
    <CreateOperationalNoteFormInner
      action={createContainerNoteAction}
      hiddenFieldName="containerId"
      hiddenFieldValue={containerId}
      path={path}
      placeholder="Título de la nota del espacio..."
    />
  )
}

export function CreateProjectNoteForm({
  projectId,
  path,
}: {
  projectId: string
  path: string
}) {
  return (
    <CreateOperationalNoteFormInner
      action={createProjectNoteAction}
      hiddenFieldName="projectId"
      hiddenFieldValue={projectId}
      path={path}
      placeholder="Título de la nota del proyecto..."
    />
  )
}

export function CreateTaskNoteForm({
  taskId,
  path,
}: {
  taskId: string
  path: string
}) {
  return (
    <CreateOperationalNoteFormInner
      action={createTaskNoteAction}
      hiddenFieldName="taskId"
      hiddenFieldValue={taskId}
      path={path}
      placeholder="Título de la nota de la tarea..."
    />
  )
}
