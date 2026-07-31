"use client"

import { usePathname } from "next/navigation"

import { findNavigationItem } from "@/features/navigation/navigation.config"

export function AppTopbar() {
  const pathname = usePathname()
  const item = findNavigationItem(pathname)

  return (
    <header className="sticky top-0 z-20 -mx-3 border-b border-white/[0.05] bg-background/78 px-3 py-4 backdrop-blur-xl sm:-mx-4 sm:px-4 xl:-mx-7 xl:px-7">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Tu sistema personal
            </p>
            <h1 className="text-lg font-semibold tracking-[-0.03em] text-white">
              {item?.label ?? "Life OS"}
            </h1>
          </div>
        </div>

        <p className="hidden text-[11px] uppercase tracking-[0.18em] text-muted-foreground/75 md:block">
          Menos ruido. Más claridad.
        </p>
      </div>
    </header>
  )
}
