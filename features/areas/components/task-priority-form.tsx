"use client"

import { useState, useTransition } from "react"

import { updateTaskPriorityAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"
import { priorityLabels, priorityValues, type Priority } from "@/types/domain"
import { cn } from "@/lib/utils"

export function TaskPriorityForm({
  taskId,
  path,
  priority,
}: {
  taskId: string
  path: string
  priority: Priority
}) {
  const [currentPriority, setCurrentPriority] = useState<Priority>(priority)
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()

  return (
    <label className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] text-muted-foreground">
      <span className="uppercase tracking-[0.14em]">Prioridad</span>
      <select
        value={currentPriority}
        disabled={pending}
        onChange={(event) => {
          const nextPriority = event.target.value as Priority
          const previousPriority = currentPriority
          setCurrentPriority(nextPriority)

          startTransition(async () => {
            const data = new FormData()
            data.set("taskId", taskId)
            data.set("priority", nextPriority)
            data.set("path", path)
            const result = await updateTaskPriorityAction(data)

            if (result.status === "error") {
              setCurrentPriority(previousPriority)
              notify({ message: result.message, tone: "error" })
            }
          })
        }}
        className={cn("bg-transparent text-[11px] text-white outline-none", pending && "opacity-70")}
      >
        {priorityValues.map((option) => (
          <option key={option} value={option} className="bg-[#0b0d12] text-white">
            {priorityLabels[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
