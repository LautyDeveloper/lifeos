"use client"

import { useTransition } from "react"
import { PauseCircle, PlayCircle } from "lucide-react"

import { updateProjectStatusAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"
import { useDemoMode } from "@/components/demo/demo-mode-provider"

export function ReviewProjectActions({
  projectId,
  path,
}: {
  projectId: string
  path: string
}) {
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()
  const { readOnly } = useDemoMode()

  if (readOnly) return null

  function runStatusAction(status: "active" | "paused") {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("projectId", projectId)
      formData.set("status", status)
      formData.set("path", path)

      const result = await updateProjectStatusAction(formData)
      notify({
        message: result.message,
        tone: result.status === "success" ? "success" : "error",
      })
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => runStatusAction("active")}
        className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white transition hover:bg-white/[0.04] disabled:opacity-60"
      >
        <PlayCircle className="size-4" />
        Activar
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => runStatusAction("paused")}
        className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
      >
        <PauseCircle className="size-4" />
        Parking
      </button>
    </div>
  )
}
