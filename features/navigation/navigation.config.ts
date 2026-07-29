import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  HeartPulse,
  Home,
  Inbox,
  MonitorCog,
  ParkingSquare,
  Settings,
} from "lucide-react"

import type { NavigationGroup } from "@/types/navigation"

export const navigationGroups: NavigationGroup[] = [
  {
    id: "core",
    items: [
      { href: "/", label: "Dashboard", icon: Home },
      { href: "/today", label: "Hoy", icon: CalendarDays },
      { href: "/inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    id: "areas",
    items: [
      { href: "/work", label: "Trabajo", icon: BriefcaseBusiness },
      { href: "/dev", label: "Dev", icon: MonitorCog },
      { href: "/study", label: "Estudio", icon: BookOpen },
      { href: "/health", label: "Salud", icon: HeartPulse },
    ],
  },
  {
    id: "system",
    items: [
      { href: "/library", label: "Biblioteca", icon: FolderKanban },
      { href: "/parking", label: "Parking", icon: ParkingSquare },
      { href: "/settings", label: "Configuración", icon: Settings },
    ],
  },
]

export function findNavigationItem(pathname: string) {
  return navigationGroups
    .flatMap((group) => group.items)
    .find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))
}
