import { AlertTriangle, ArrowDown, ArrowUp, Minus } from "lucide-react"

import { priorityLabels, projectStatusLabels, type Priority, type ProjectStatus } from "@/types/domain"
import { cn } from "@/lib/utils"

const priorityConfig = {
  urgent: { label: priorityLabels.urgent, icon: AlertTriangle, className: "border border-red-400/14 bg-red-400/7 text-red-200" },
  high: { label: priorityLabels.high, icon: ArrowUp, className: "border border-amber-300/14 bg-amber-300/7 text-amber-100" },
  medium: { label: priorityLabels.medium, icon: Minus, className: "border border-primary/14 bg-primary/8 text-primary/90" },
  low: { label: priorityLabels.low, icon: ArrowDown, className: "border border-white/[0.06] bg-white/[0.02] text-muted-foreground" },
} as const

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = priorityConfig[priority]
  return (
    <span className={cn("inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium", config.className, className)}>
      <config.icon className="size-3" aria-hidden="true" />
      {config.label}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className="inline-flex min-h-7 items-center rounded-full border border-white/[0.06] bg-white/[0.02] px-2.5 text-[11px] text-muted-foreground">{projectStatusLabels[status]}</span>
}
