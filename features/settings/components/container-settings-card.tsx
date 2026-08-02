"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { Archive, ArrowDown, ArrowUp, PencilLine, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"
import { initialUpdateContainerActionState } from "@/features/settings/action-state"
import {
  archiveContainerAction,
  moveContainerAction,
  restoreContainerAction,
  updateContainerDetailsAction,
} from "@/features/settings/actions"

export function ContainerSettingsCard({
  container,
  canMoveUp,
  canMoveDown,
}: {
  container: {
    id: string
    name: string
    description: string | null
    archived: boolean
    projectCount: number
    taskCount: number
    noteCount: number
  }
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [state, formAction] = useActionState(
    updateContainerDetailsAction,
    initialUpdateContainerActionState
  )
  const nameRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => nameRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  function runAction(action: (formData: FormData) => Promise<{ status: "success" | "error"; message: string }>, extra?: Record<string, string>) {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("containerId", container.id)
      if (extra) {
        for (const [key, value] of Object.entries(extra)) {
          formData.set(key, value)
        }
      }
      const result = await action(formData)
      notify({ message: result.message, tone: result.status === "success" ? "success" : "error" })
    })
  }

  return (
    <article className="surface-2 rounded-[22px] border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="content-title">{container.name}</p>
          {container.description ? <p className="context-line max-w-2xl">{container.description}</p> : null}
          <div className="meta-row">
            <span className="meta-item">{container.archived ? "Archivado" : "Activo"}</span>
            <span className="meta-item">{container.projectCount} proyectos</span>
            <span className="meta-item">{container.taskCount} tareas</span>
            <span className="meta-item">{container.noteCount} notas</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={!canMoveUp || pending} onClick={() => runAction(moveContainerAction, { direction: "up" })}>
            <ArrowUp className="size-3.5" />
            Subir
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={!canMoveDown || pending} onClick={() => runAction(moveContainerAction, { direction: "down" })}>
            <ArrowDown className="size-3.5" />
            Bajar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen((current) => !current)}>
            <PencilLine className="size-3.5" />
            {open ? "Cerrar" : "Editar"}
          </Button>
          {container.archived ? (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => runAction(restoreContainerAction)}>
              <RotateCcw className="size-3.5" />
              Restaurar
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => runAction(archiveContainerAction)}>
              <Archive className="size-3.5" />
              Archivar
            </Button>
          )}
        </div>
      </div>

      {open ? (
        <form action={formAction} className="mt-4 space-y-4 border-t border-white/[0.08] pt-4">
          <input type="hidden" name="containerId" value={container.id} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor={`container-name-${container.id}`}>Nombre</label>
            <input
              ref={nameRef}
              id={`container-name-${container.id}`}
              name="name"
              defaultValue={container.name}
              className={cn("field-base h-11 w-full rounded-2xl px-4 text-sm", state.fieldErrors?.name ? "border-destructive/50" : "border-white/8")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor={`container-description-${container.id}`}>Descripción</label>
            <textarea
              id={`container-description-${container.id}`}
              name="description"
              defaultValue={container.description ?? ""}
              rows={3}
              className={cn("field-base block w-full resize-none rounded-[20px] px-4 py-3 text-sm leading-6", state.fieldErrors?.description ? "border-destructive/50" : "border-white/8")}
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
                  Archivar lo oculta de las superficies activas, pero conserva todo su contenido.
                </p>
              )}
            </div>
            <Button type="submit">Guardar container</Button>
          </div>
        </form>
      ) : null}
    </article>
  )
}
