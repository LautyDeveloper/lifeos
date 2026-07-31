"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { mobileNavigationItems, navigationGroups } from "@/features/navigation/navigation.config"
import { useSidebarState } from "@/components/layout/sidebar-state-provider"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { toggleMobile } = useSidebarState()
  const moreItems = navigationGroups.slice(1).flatMap((group) => group.items)
  const moreActive = moreItems.some((item) => pathname.startsWith(item.href))

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-[26px] border border-white/[0.08] bg-[oklch(0.17_0.004_225/0.96)] p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl md:hidden">
      {mobileNavigationItems.map((item) => {
        const active = item.href === "#more" ? moreActive : item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        const content = (
          <>
            <item.icon className="size-4" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </>
        )

        return item.href === "#more" ? (
          <button key={item.href} type="button" onClick={toggleMobile} aria-label="Abrir más opciones" className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] text-muted-foreground transition", active && "bg-white/[0.055] text-foreground")}>
            {content}
          </button>
        ) : (
          <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 rounded-[18px] text-muted-foreground transition", active && "bg-white/[0.055] text-foreground")}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
