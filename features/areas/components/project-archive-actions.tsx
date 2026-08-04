"use client"

import { useState, useTransition } from "react"
import { Archive, RotateCcw, Trash2 } from "lucide-react"

import { InlineConfirmAction } from "@/components/ui/inline-confirm-action"
import { archiveProjectAction, deleteProjectAction, restoreProjectAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"
import type { ActionResult } from "@/types/action-result"

export function ProjectArchiveActions({
  projectId,
  path,
  archived = false,
}: {
  projectId: string
  path: string
  archived?: boolean
}) {
  const { notify } = useToast()
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  if (!archived) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const data = new FormData()
              data.set("projectId", projectId)
              data.set("path", path)

              const actionResult = await archiveProjectAction(data)
              setResult(actionResult)
              notify({
                message: actionResult.message,
                tone: actionResult.status === "success" ? "success" : "error",
              })
            })
          }}
          className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-transparent px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white disabled:opacity-60"
        >
          <Archive className="size-3.5" />
          {pending ? "Archivando..." : "Archivar"}
        </button>
        {result ? (
          <p
            className={cn(
              "text-sm",
              result.status === "success" ? "text-primary/85" : "text-destructive"
            )}
            aria-live="polite"
          >
            {result.message}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const data = new FormData()
              data.set("projectId", projectId)
              data.set("path", path)

              const actionResult = await restoreProjectAction(data)
              setResult(actionResult)
              notify({
                message: actionResult.message,
                tone: actionResult.status === "success" ? "success" : "error",
              })
            })
          }}
          className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white disabled:opacity-60"
        >
          <RotateCcw className="size-3.5" />
          {pending ? "Restaurando..." : "Restaurar"}
        </button>

        <InlineConfirmAction
          triggerLabel="Eliminar"
          triggerIcon={<Trash2 className="size-3.5" />}
          disabled={pending}
          panelTitle="Eliminar proyecto"
          panelDescription="Se borra de forma definitiva junto con sus tareas y notas operativas."
          confirmLabel="Sí, eliminar"
          pendingLabel="Eliminando..."
          onSettled={setResult}
          onConfirm={async () => {
            const data = new FormData()
            data.set("projectId", projectId)
            data.set("path", path)

            const actionResult = await deleteProjectAction(data)
            notify({
              message: actionResult.message,
              tone: actionResult.status === "success" ? "success" : "error",
            })
            return actionResult
          }}
        />
      </div>

      {result ? (
        <p
          className={cn(
            "text-sm",
            result.status === "success" ? "text-primary/85" : "text-destructive"
          )}
          aria-live="polite"
        >
          {result.message}
        </p>
      ) : null}
    </div>
  )
}
