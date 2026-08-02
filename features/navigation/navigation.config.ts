import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Ellipsis,
  FolderKanban,
  HeartPulse,
  Home,
  House,
  Inbox,
  MonitorCog,
  ParkingSquare,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react"

import { defaultAreaMetadataBySlug } from "@/features/settings/config"
import type { NavigationGroupData, NavigationIconKey, NavigationItemData } from "@/types/navigation"

export const navigationIconMap = {
  Home,
  CalendarDays,
  ClipboardCheck,
  Inbox,
  BriefcaseBusiness,
  MonitorCog,
  BookOpen,
  HeartPulse,
  FolderKanban,
  ParkingSquare,
  Settings,
  Ellipsis,
  House,
  Rocket,
  Sparkles,
} as const

const staticCoreItems: NavigationItemData[] = [
  { href: "/", label: "Inicio", iconKey: "Home" },
  { href: "/today", label: "Hoy", iconKey: "CalendarDays" },
  { href: "/inbox", label: "Capturas", iconKey: "Inbox" },
] as const

const staticSystemItems: NavigationItemData[] = [
  { href: "/review", label: "Review", iconKey: "ClipboardCheck" },
  { href: "/library", label: "Biblioteca", iconKey: "FolderKanban" },
  { href: "/parking", label: "Estacionados", iconKey: "ParkingSquare" },
  { href: "/settings", label: "Configuración", iconKey: "Settings" },
] as const

export const fallbackAreaNavigationItems: NavigationItemData[] = [
  { href: "/work", label: defaultAreaMetadataBySlug.work.name, iconKey: defaultAreaMetadataBySlug.work.icon },
  { href: "/dev", label: defaultAreaMetadataBySlug.dev.name, iconKey: defaultAreaMetadataBySlug.dev.icon },
  { href: "/study", label: defaultAreaMetadataBySlug.study.name, iconKey: defaultAreaMetadataBySlug.study.icon },
  { href: "/health", label: defaultAreaMetadataBySlug.health.name, iconKey: defaultAreaMetadataBySlug.health.icon },
]

export const mobileMoreItem = { label: "Más", iconKey: "Ellipsis" } as const

export function buildNavigationGroups(areaItems: NavigationItemData[] = fallbackAreaNavigationItems): NavigationGroupData[] {
  return [
    { id: "core", items: [...staticCoreItems] },
    { id: "areas", items: areaItems },
    { id: "system", items: [...staticSystemItems] },
  ]
}

export function resolveNavigationIcon(iconKey: NavigationIconKey) {
  return navigationIconMap[iconKey as keyof typeof navigationIconMap] ?? Sparkles
}

export function findNavigationItem(pathname: string, groups: NavigationGroupData[]) {
  return groups
    .flatMap((group) => group.items)
    .find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))
}
