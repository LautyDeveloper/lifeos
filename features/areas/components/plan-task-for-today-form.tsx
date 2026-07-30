import { CalendarDays } from "lucide-react"

import { planTaskForTodayAction } from "@/features/areas/actions"
import { cn } from "@/lib/utils"

export function PlanTaskForTodayForm({
  taskId,
  path,
  plannedForToday,
}: {
  taskId: string
  path: string
  plannedForToday: boolean
}) {
  if (plannedForToday) {
    return (
      <span className="inline-flex h-9 items-center rounded-full border border-primary/20 bg-primary/10 px-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
        Hoy
      </span>
    )
  }

  return (
    <form action={planTaskForTodayAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition",
          "hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
        )}
      >
        <CalendarDays className="size-3.5" />
        Hoy
      </button>
    </form>
  )
}
