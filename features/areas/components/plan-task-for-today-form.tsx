"use client"

import { useState, useTransition } from "react"
import { CalendarDays, LoaderCircle } from "lucide-react"

import { planTaskForTodayAction } from "@/features/areas/actions"
import { useToast } from "@/components/ui/toast-provider"

export function PlanTaskForTodayForm({ taskId, path, plannedForToday }: { taskId: string; path: string; plannedForToday: boolean }) {
  const [planned, setPlanned] = useState(plannedForToday)
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()

  if (planned) return <span className="inline-flex min-h-8 items-center rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary">Hoy</span>

  return (
    <button type="button" disabled={pending} onClick={() => {
      setPlanned(true)
      startTransition(async () => {
        const data = new FormData()
        data.set("taskId", taskId)
        data.set("path", path)
        const result = await planTaskForTodayAction(data)
        if (result.status === "error") {
          setPlanned(false)
          notify({ message: result.message, tone: "error" })
        } else notify({ message: result.message, tone: "success" })
      })
    }} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/8 px-3 text-xs font-medium text-muted-foreground transition hover:border-primary/25 hover:text-primary">
      {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CalendarDays className="size-3.5" />}
      Hoy
    </button>
  )
}
