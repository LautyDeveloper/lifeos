"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { PencilLine, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import { initialUpdateTaskDetailsActionState } from "@/features/areas/action-state"
import { deleteTaskAction, updateTaskDetailsAction } from "@/features/areas/actions"
import { cn } from "@/lib/utils"

export function TaskDetailsEditor({
  taskId,
  path,
  title,
}: {
  taskId: string
  path: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useActionState(
    updateTaskDetailsAction,
    initialUpdateTaskDetailsActionState
  )
  const [deletePending, startDeleteTransition] = useTransition()
  const titleRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()

  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => titleRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
        >
          <PencilLine className="size-3.5" />
          {open ? "Cerrar edición" : "Editar"}
        </button>

        <button
          type="button"
          disabled={deletePending}
          onClick={() => {
            startDeleteTransition(async () => {
              const data = new FormData()
              data.set("taskId", taskId)
              data.set("path", path)

              const result = await deleteTaskAction(data)
              notify({
                message: result.message,
                tone: result.status === "success" ? "success" : "error",
              })
            })
          }}
          className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-transparent px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
        >
          <Trash2 className="size-3.5" />
          {deletePending ? "Eliminando..." : "Eliminar"}
        </button>
      </div>

      {open ? (
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
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
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
