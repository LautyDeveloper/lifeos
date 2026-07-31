import Link from "next/link"
import type { LucideIcon } from "lucide-react"

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-[18px] border border-white/[0.07] bg-white/[0.02]">
        <Icon className="size-5 text-primary/90" aria-hidden="true" />
      </div>
      <p className="mt-5 text-base font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
      {action ? <Link href={action.href} className="mt-6 inline-flex min-h-11 items-center rounded-[18px] border border-primary/25 bg-primary/12 px-4 text-sm font-medium text-primary transition hover:bg-primary/20 hover:text-white">{action.label}</Link> : null}
    </div>
  )
}
