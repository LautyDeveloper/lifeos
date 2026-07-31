import Link from "next/link"
import type { LucideIcon } from "lucide-react"

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="py-12 text-center">
      <Icon className="mx-auto size-7 text-primary" aria-hidden="true" />
      <p className="mt-4 font-medium text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <Link href={action.href} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground">{action.label}</Link> : null}
    </div>
  )
}
