"use client"

import { usePathname } from "next/navigation"

import { CommandTopbarTrigger } from "@/features/command/components/command-surface-provider"
import { findNavigationItem } from "@/features/navigation/navigation.config"
import type { NavigationGroupData } from "@/types/navigation"

export function AppTopbar({ navigationGroups }: { navigationGroups: NavigationGroupData[] }) {
  const pathname = usePathname()
  const item = findNavigationItem(pathname, navigationGroups)

  return (
    <header className="sticky top-0 z-20 -mx-3 border-b border-white/[0.05] bg-background/78 px-3 py-4 backdrop-blur-xl sm:-mx-4 sm:px-4 xl:-mx-7 xl:px-7">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold tracking-[-0.03em] text-white">
            {item?.label ?? "Life OS"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {pathname === "/"
              ? "Capturá, organizá y ejecutá sin cambiar de ritmo."
              : "Menos ruido. Más claridad en el sistema."}
          </p>
        </div>

        <div className="flex items-center justify-start md:justify-end">
          <CommandTopbarTrigger />
        </div>
      </div>
    </header>
  )
}
