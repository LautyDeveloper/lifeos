import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Ellipsis,
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
      { href: "/", label: "Inicio", icon: Home },
      { href: "/today", label: "Hoy", icon: CalendarDays },
      { href: "/inbox", label: "Capturas", icon: Inbox },
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
      { href: "/parking", label: "Estacionados", icon: ParkingSquare },
      { href: "/settings", label: "Configuración", icon: Settings },
    ],
  },
]

export const mobileNavigationItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/today", label: "Hoy", icon: CalendarDays },
  { href: "/inbox", label: "Capturas", icon: Inbox },
  { href: "#more", label: "Más", icon: Ellipsis },
] as const

export function findNavigationItem(pathname: string) {
  return navigationGroups
    .flatMap((group) => group.items)
    .find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))
}
