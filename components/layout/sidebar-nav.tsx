"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { NavigationIcon } from "@/features/navigation/navigation-icon"
import { cn } from "@/lib/utils"
import { useSidebarState } from "@/components/layout/sidebar-state-provider"
import type { NavigationGroupData } from "@/types/navigation"

type SidebarNavProps = {
  navigationGroups: NavigationGroupData[]
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarNav({ navigationGroups, collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()
  const { areasOpen, setAreasOpen } = useSidebarState()
  const areaGroup = navigationGroups.find((group) => group.id === "areas")
  const areaActive = areaGroup?.items.some((item) => pathname.startsWith(item.href)) ?? false

  return (
    <nav className="space-y-4">
      {navigationGroups.map((group, index) => (
        <div key={group.id}>
          {index > 0 ? <div className="mx-3 mb-4 h-px bg-border/45" /> : null}
          {group.id === "areas" && !collapsed ? (
            <button
              type="button"
              onClick={() => setAreasOpen(!areasOpen)}
              aria-expanded={areasOpen}
              className={cn(
                "mb-2 flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-white/[0.025] hover:text-white",
                areaActive && "text-foreground"
              )}
            >
              Áreas
              <ChevronDown className={cn("size-4 transition-transform", areasOpen && "rotate-180")} />
            </button>
          ) : null}
          <div className={cn("space-y-1", group.id === "areas" && !collapsed && !areasOpen && "hidden")}>
            {group.items.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group flex min-h-11 items-center gap-3 rounded-[18px] border-l-2 border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200 motion-reduce:transition-none",
                    collapsed ? "justify-center px-0" : "",
                    isActive
                      ? "border-l-primary bg-white/[0.055] text-white"
                      : "text-muted-foreground hover:bg-white/[0.035] hover:text-white"
                  )}
                >
                  <NavigationIcon
                    iconKey={item.iconKey}
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-white",
                      !collapsed && "group-hover:scale-105"
                    )}
                  />
                  {!collapsed ? (
                    <span className="truncate">{item.label}</span>
                  ) : (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
