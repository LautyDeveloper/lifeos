"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { mobileMoreItem } from "@/features/navigation/navigation.config"
import { NavigationIcon } from "@/features/navigation/navigation-icon"
import { useSidebarState } from "@/components/layout/sidebar-state-provider"
import { cn } from "@/lib/utils"
import type { NavigationGroupData } from "@/types/navigation"

export function MobileBottomNav({ navigationGroups }: { navigationGroups: NavigationGroupData[] }) {
  const pathname = usePathname()
  const { mobileOpen, toggleMobile } = useSidebarState()
  const mobilePrimaryNavigationItems = navigationGroups.find((group) => group.id === "core")?.items ?? []
  const mobileMoreNavigationGroups = navigationGroups.filter((group) => group.id !== "core")
  const moreItems = mobileMoreNavigationGroups.flatMap((group) => group.items)
  const moreActive = moreItems.some((item) => pathname.startsWith(item.href))

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[26px] border border-white/[0.08] bg-[oklch(0.17_0.004_225/0.96)] p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl md:hidden">
      {mobilePrimaryNavigationItems.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] border-b-2 border-transparent text-muted-foreground transition", active && "border-b-primary/80 bg-white/[0.03] text-foreground")}>
            <NavigationIcon iconKey={item.iconKey} className="size-4" />
            <span className="text-[10px] font-medium tracking-[0.02em]">{item.label}</span>
          </Link>
        )
      })}
      <button
        type="button"
        data-mobile-more-trigger
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
        aria-controls="mobile-more-sheet"
        onClick={toggleMobile}
        className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] border-b-2 border-transparent text-muted-foreground transition hover:bg-white/[0.035] hover:text-white", moreActive && "border-b-primary/80 bg-white/[0.04] text-white")}
      >
        <NavigationIcon iconKey={mobileMoreItem.iconKey} className="size-4" />
        <span className="text-[10px] font-medium tracking-[0.02em]">{mobileMoreItem.label}</span>
      </button>
    </nav>
  )
}
