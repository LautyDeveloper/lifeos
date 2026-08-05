"use client"

import { useState, useTransition } from "react"
import { PauseCircle, PlayCircle } from "lucide-react"

import { updateProjectStatusAction } from "@/features/areas/actions"
import { cn } from "@/lib/utils"

export function ReviewProjectActions({
  projectId,
  path,
}: {
  projectId: string
  path: string
}) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string>()
  const [messageTone, setMessageTone] = useState<"success" | "error">("success")

  function runStatusAction(status: "active" | "paused") {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("projectId", projectId)
      formData.set("status", status)
      formData.set("path", path)

      const result = await updateProjectStatusAction(formData)
      setMessage(result.message)
      setMessageTone(result.status)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("active")}
          className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-white transition hover:bg-white/[0.04] disabled:opacity-60"
        >
          <PlayCircle className="size-4" />
          {pending ? "Actualizando..." : "Activar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runStatusAction("paused")}
          className="inline-flex min-h-9 items-center gap-2 rounded-[16px] border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          <PauseCircle className="size-4" />
          {pending ? "Actualizando..." : "Parking"}
        </button>
      </div>
      <p
        className={cn(
          "min-h-5 text-sm",
          messageTone === "success" ? "text-primary/90" : "text-destructive"
        )}
        aria-live="polite"
      >
        {message ?? ""}
      </p>
    </div>
  )
}
