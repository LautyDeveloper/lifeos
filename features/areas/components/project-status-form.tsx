"use client"

import { useState, useTransition } from "react"

import { updateProjectStatusAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"
import { projectStatusLabels, type VisibleAreaProjectStatus } from "@/types/domain"
import { cn } from "@/lib/utils"

const statusOptions: VisibleAreaProjectStatus[] = ["active", "backlog", "done"]

export function ProjectStatusForm({
  projectId,
  path,
  status,
}: {
  projectId: string
  path: string
  status: VisibleAreaProjectStatus
}) {
  const [currentStatus, setCurrentStatus] = useState<VisibleAreaProjectStatus>(status)
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()

  return (
    <label className="inline-flex min-h-9 items-center gap-2 rounded-[18px] border border-white/[0.07] bg-white/[0.02] px-3 text-[11px] text-muted-foreground">
      <span className="uppercase tracking-[0.14em]">Estado</span>
      <select
        value={currentStatus}
        disabled={pending}
        onChange={(event) => {
          const nextStatus = event.target.value as VisibleAreaProjectStatus
          const previousStatus = currentStatus
          setCurrentStatus(nextStatus)

          startTransition(async () => {
            const data = new FormData()
            data.set("projectId", projectId)
            data.set("status", nextStatus)
            data.set("path", path)
            const result = await updateProjectStatusAction(data)

            if (result.status === "error") {
              setCurrentStatus(previousStatus)
              notify({ message: result.message, tone: "error" })
            }
          })
        }}
        className={cn("bg-transparent text-[11px] text-white outline-none", pending && "opacity-70")}
      >
        {statusOptions.map((option) => (
          <option key={option} value={option} className="bg-[#0b0d12] text-white">
            {projectStatusLabels[option]}
          </option>
        ))}
      </select>
    </label>
  )
}
