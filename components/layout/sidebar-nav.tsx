"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navigationGroups } from "@/features/navigation/navigation.config"
import { cn } from "@/lib/utils"

type SidebarNavProps = {
  collapsed: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="space-y-3">
      {navigationGroups.map((group, index) => (
        <div key={group.id}>
          {index > 0 ? <div className="mx-3 mb-3 h-px bg-border/70" /> : null}
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center px-0" : "",
                    isActive
                      ? "border-white/10 bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      : "border-transparent text-muted-foreground hover:border-white/6 hover:bg-white/[0.04] hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
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
