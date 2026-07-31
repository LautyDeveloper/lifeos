import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end", className)}>
      <div className="space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h3 className="text-xl font-semibold tracking-[-0.035em] text-white sm:text-2xl">{title}</h3>
        {description ? <p className="context-line max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div className="sm:justify-self-end">{action}</div> : null}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn("surface-2 rounded-[22px] border p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 text-primary" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">{value}</p>
    </div>
  )
}
