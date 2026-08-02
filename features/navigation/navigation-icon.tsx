import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
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

import type { NavigationIconKey } from "@/types/navigation"

export function NavigationIcon({
  iconKey,
  className,
}: {
  iconKey: NavigationIconKey
  className?: string
}) {
  switch (iconKey) {
    case "Home":
      return <Home className={className} />
    case "CalendarDays":
      return <CalendarDays className={className} />
    case "Inbox":
      return <Inbox className={className} />
    case "BriefcaseBusiness":
      return <BriefcaseBusiness className={className} />
    case "MonitorCog":
      return <MonitorCog className={className} />
    case "BookOpen":
      return <BookOpen className={className} />
    case "HeartPulse":
      return <HeartPulse className={className} />
    case "FolderKanban":
      return <FolderKanban className={className} />
    case "ParkingSquare":
      return <ParkingSquare className={className} />
    case "Settings":
      return <Settings className={className} />
    case "Ellipsis":
      return <Ellipsis className={className} />
    case "House":
      return <House className={className} />
    case "Rocket":
      return <Rocket className={className} />
    case "Sparkles":
      return <Sparkles className={className} />
    default:
      return <Sparkles className={className} />
  }
}
