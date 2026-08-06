"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { PencilLine, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InlineConfirmAction } from "@/components/ui/inline-confirm-action"
import { useToast } from "@/components/ui/toast-provider"
import { initialUpdateTaskDetailsActionState } from "@/features/areas/action-state"
import { deleteTaskAction, updateTaskDetailsAction } from "@/features/areas/actions"
import { cn } from "@/lib/utils"
import { useDemoMode } from "@/components/demo/demo-mode-provider"

export function TaskDetailsEditor({
  taskId,
  path,
  title,
  completed,
}: {
  taskId: string
  path: string
  title: string
  completed: boolean
}) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<string>()
  const [state, formAction] = useActionState(
    updateTaskDetailsAction,
    initialUpdateTaskDetailsActionState
  )
  const titleRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { notify } = useToast()
  const { readOnly } = useDemoMode()

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

    const timer = window.setTimeout(() => {
      setFeedback(state.message ?? "Tarea actualizada.")
      setOpen(false)
      triggerRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [state.message, state.resetKey, state.status])

  if (readOnly) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {!completed ? (
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              setFeedback(undefined)
              setOpen((current) => !current)
            }}
            className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
          >
            <PencilLine className="size-3.5" />
            {open ? "Cerrar edición" : "Editar"}
          </button>
        ) : null}

        <InlineConfirmAction
          triggerLabel="Eliminar"
          triggerIcon={<Trash2 className="size-3.5" />}
          panelTitle="Eliminar tarea"
          panelDescription="Esta tarea se borra de forma definitiva."
          confirmLabel="Sí, eliminar"
          pendingLabel="Eliminando..."
          onConfirm={async () => {
            const data = new FormData()
            data.set("taskId", taskId)
            data.set("path", path)

            const result = await deleteTaskAction(data)
            notify({
              message: result.message,
              tone: result.status === "success" ? "success" : "error",
            })
            return result
          }}
        />
      </div>

      {!open && feedback ? (
        <p className="min-h-5 text-sm text-primary/90" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      {open && !completed ? (
        <form action={formAction} className="surface-2 space-y-3 rounded-[20px] border p-4">
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="path" value={path} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor={`task-title-${taskId}`}>
              Título
            </label>
            <input
              ref={titleRef}
              id={`task-title-${taskId}`}
              name="title"
              defaultValue={title}
              className={cn(
                "field-base h-11 w-full rounded-2xl px-4 text-sm",
                state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
              )}
            />
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-h-10 space-y-1" aria-live="polite">
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
                  Ajustá el título sin salir del contexto del proyecto.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  window.requestAnimationFrame(() => triggerRef.current?.focus())
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  )
}
