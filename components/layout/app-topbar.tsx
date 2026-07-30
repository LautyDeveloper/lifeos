"use client"

import { usePathname } from "next/navigation"

import { findNavigationItem } from "@/features/navigation/navigation.config"

export function AppTopbar() {
  const pathname = usePathname()
  const item = findNavigationItem(pathname)

  return (
    <header className="sticky top-0 z-20 -mx-3 border-b border-white/6 bg-background/75 px-3 py-4 backdrop-blur sm:-mx-4 sm:px-4 xl:-mx-6 xl:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Tu sistema personal
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {item?.label ?? "Life OS"}
            </h1>
          </div>
        </div>

        <p className="hidden text-xs text-muted-foreground md:block">Menos ruido. Más claridad.</p>
      </div>
    </header>
  )
}
