import { AlertTriangle, ArrowDown, ArrowUp, Minus } from "lucide-react"

import { priorityLabels, projectStatusLabels, type Priority, type ProjectStatus } from "@/types/domain"
import { cn } from "@/lib/utils"

const priorityConfig = {
  urgent: { label: priorityLabels.urgent, icon: AlertTriangle, className: "bg-destructive/12 text-red-300" },
  high: { label: priorityLabels.high, icon: ArrowUp, className: "bg-amber-400/10 text-amber-200" },
  medium: { label: priorityLabels.medium, icon: Minus, className: "bg-primary/10 text-primary" },
  low: { label: priorityLabels.low, icon: ArrowDown, className: "bg-white/[0.04] text-muted-foreground" },
} as const

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = priorityConfig[priority]
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium", config.className, className)}>
      <config.icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className="inline-flex min-h-7 items-center rounded-full bg-white/[0.04] px-2.5 text-xs text-muted-foreground">{projectStatusLabels[status]}</span>
}
