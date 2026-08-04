"use client"

import { useTransition } from "react"
import { Archive, RotateCcw, Trash2 } from "lucide-react"

import { archiveProjectAction, deleteProjectAction, restoreProjectAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"

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

  if (!archived) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const data = new FormData()
            data.set("projectId", projectId)
            data.set("path", path)

            const result = await archiveProjectAction(data)
            notify({
              message: result.message,
              tone: result.status === "success" ? "success" : "error",
            })
          })
        }}
        className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-transparent px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white disabled:opacity-60"
      >
        <Archive className="size-3.5" />
        {pending ? "Archivando..." : "Archivar"}
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const data = new FormData()
            data.set("projectId", projectId)
            data.set("path", path)

            const result = await restoreProjectAction(data)
            notify({
              message: result.message,
              tone: result.status === "success" ? "success" : "error",
            })
          })
        }}
        className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-white/[0.03] hover:text-white disabled:opacity-60"
      >
        <RotateCcw className="size-3.5" />
        {pending ? "Restaurando..." : "Restaurar"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const data = new FormData()
            data.set("projectId", projectId)
            data.set("path", path)

            const result = await deleteProjectAction(data)
            notify({
              message: result.message,
              tone: result.status === "success" ? "success" : "error",
            })
          })
        }}
        className="inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-transparent px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-60"
      >
        <Trash2 className="size-3.5" />
        {pending ? "Eliminando..." : "Eliminar"}
      </button>
    </div>
  )
}
