"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { PencilLine } from "lucide-react"

import { initialUpdateProjectDetailsActionState } from "@/features/areas/action-state"
import { updateProjectDetailsAction } from "@/features/areas/actions"
import { ProjectPriorityForm } from "@/features/areas/components/project-priority-form"
import { ProjectStatusForm } from "@/features/areas/components/project-status-form"
import type { Priority, VisibleAreaProjectStatus } from "@/types/domain"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ProjectDetailsEditor({
  projectId,
  path,
  title,
  description,
  status,
  priority,
}: {
  projectId: string
  path: string
  title: string
  description: string | null
  status: VisibleAreaProjectStatus
  priority: Priority
}) {
  const projectLocked = status === "done"
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<string>()
  const [state, formAction] = useActionState(
    updateProjectDetailsAction,
    initialUpdateProjectDetailsActionState
  )
  const titleRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
      setFeedback(state.message ?? "Proyecto actualizado.")
      setOpen(false)
      triggerRef.current?.focus()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [state.message, state.resetKey, state.status])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setFeedback(undefined)
            setOpen((current) => !current)
          }}
          className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
        >
          <PencilLine className="size-3.5" />
          {open ? "Cerrar" : projectLocked ? "Cambiar estado" : "Editar"}
        </button>

        {open ? (
          <>
            <ProjectStatusForm
              key={`${projectId}-${status}`}
              projectId={projectId}
              path={path}
              status={status}
            />
            {!projectLocked ? (
              <ProjectPriorityForm
                key={`${projectId}-${priority}`}
                projectId={projectId}
                path={path}
                priority={priority}
              />
            ) : null}
          </>
        ) : null}
      </div>

      {!open && feedback ? (
        <p className="min-h-5 text-sm text-primary/90" aria-live="polite">
          {feedback}
        </p>
      ) : null}

      {open && !projectLocked ? (
        <form
          action={formAction}
          className="surface-2 space-y-4 rounded-[22px] border p-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="path" value={path} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor={`project-title-${projectId}`}>
              Título
            </label>
            <input
              ref={titleRef}
              id={`project-title-${projectId}`}
              name="title"
              defaultValue={title}
              className={cn(
                "field-base h-11 w-full rounded-2xl px-4 text-sm",
                state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
              )}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-white"
              htmlFor={`project-description-${projectId}`}
            >
              Descripción
            </label>
            <textarea
              id={`project-description-${projectId}`}
              name="description"
              defaultValue={description ?? ""}
              rows={4}
              placeholder="Agregá contexto, alcance o una breve dirección para este proyecto."
              className="field-base min-h-28 w-full resize-none rounded-[20px] px-4 py-3 text-sm leading-6"
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
                  El estado y la prioridad siguen disponibles dentro de este mismo bloque.
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
              <Button type="submit">Guardar cambios</Button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  )
}
