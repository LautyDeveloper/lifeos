"use client"

import { useState, useTransition } from "react"
import { Circle, CircleCheckBig, LoaderCircle } from "lucide-react"

import { toggleTaskCompletionAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"
import { cn } from "@/lib/utils"

export function TaskToggleForm({ taskId, completed, path, disabled = false }: { taskId: string; completed: boolean; path: string; disabled?: boolean }) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(completed)
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()

  const update = (nextCompleted: boolean, announce = true) => {
    setOptimisticCompleted(nextCompleted)
    startTransition(async () => {
      const data = new FormData()
      data.set("taskId", taskId)
      data.set("completed", String(nextCompleted))
      data.set("path", path)
      const result = await toggleTaskCompletionAction(data)
      if (result.status === "error") {
        setOptimisticCompleted(!nextCompleted)
        notify({ message: result.message, tone: "error" })
        return
      }
      if (announce) {
        notify({
          message: result.message,
          tone: "success",
          action: {
            label: "Deshacer",
            onClick: () => update(!nextCompleted, false),
          },
        })
      }
    })
  }

  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() => update(!optimisticCompleted)}
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 motion-reduce:transition-none",
        optimisticCompleted ? "border-primary/25 bg-primary/12 text-primary" : "border-white/8 bg-white/[0.03] text-muted-foreground hover:text-white"
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : optimisticCompleted ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
      <span className="sr-only">{optimisticCompleted ? "Marcar como pendiente" : "Marcar como completada"}</span>
    </button>
  )
}
