"use client"

import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { findNavigationItem } from "@/features/navigation/navigation.config"

export function AppTopbar({
  onOpenMobile,
}: {
  onOpenMobile: () => void
}) {
  const pathname = usePathname()
  const item = findNavigationItem(pathname)

  return (
    <header className="sticky top-0 z-20 -mx-4 border-b border-white/6 bg-background/75 px-4 py-4 backdrop-blur xl:-mx-6 xl:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={onOpenMobile}
          >
            <Menu className="size-4" />
            <span className="sr-only">Abrir navegación</span>
          </Button>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Personal Operating System
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {item?.label ?? "Life OS"}
            </h1>
          </div>
        </div>

        <div className="hidden rounded-full border border-white/6 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground md:block">
          Dark mode only
        </div>
      </div>
    </header>
  )
}
