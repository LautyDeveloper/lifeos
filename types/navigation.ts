import type { LucideIcon } from "lucide-react"

export type NavigationItem = {
  href: string
  label: string
  icon: LucideIcon
}

export type NavigationGroup = {
  id: string
  items: NavigationItem[]
}
