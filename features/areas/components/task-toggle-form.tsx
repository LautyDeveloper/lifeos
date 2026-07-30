import { Circle, CircleCheckBig } from "lucide-react"

import { toggleTaskCompletionAction } from "@/features/areas/actions"
import { cn } from "@/lib/utils"

export function TaskToggleForm({
  taskId,
  completed,
  path,
}: {
  taskId: string
  completed: boolean
  path: string
}) {
  return (
    <form action={toggleTaskCompletionAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="completed" value={String(!completed)} />
      <input type="hidden" name="path" value={path} />
      <button
        type="submit"
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-2xl border transition",
          completed
            ? "border-primary/25 bg-primary/12 text-primary"
            : "border-white/8 bg-white/[0.03] text-muted-foreground hover:text-white"
        )}
      >
        {completed ? <CircleCheckBig className="size-4" /> : <Circle className="size-4" />}
        <span className="sr-only">
          {completed ? "Marcar como pendiente" : "Marcar como completada"}
        </span>
      </button>
    </form>
  )
}
