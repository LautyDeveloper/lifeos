"use client"

import { usePathname } from "next/navigation"

import { findNavigationItem } from "@/features/navigation/navigation.config"

export function AppTopbar() {
  const pathname = usePathname()
  const item = findNavigationItem(pathname)

  return (
    <header className="sticky top-0 z-20 -mx-3 border-b border-white/[0.05] bg-background/78 px-3 py-4 backdrop-blur-xl sm:-mx-4 sm:px-4 xl:-mx-7 xl:px-7">
      <div className="grid gap-1 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            Tu sistema personal
          </p>
          <h1 className="text-lg font-semibold tracking-[-0.03em] text-white">
            {item?.label ?? "Life OS"}
          </h1>
        </div>

        <p className="hidden text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70 md:block">
          Menos ruido. Más claridad.
        </p>
      </div>
    </header>
  )
}
