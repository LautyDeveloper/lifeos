"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"

import { NavigationIcon } from "@/features/navigation/navigation-icon"
import { cn } from "@/lib/utils"
import type { NavigationGroupData } from "@/types/navigation"

const groupLabels: Record<string, string> = {
  areas: "Áreas",
  system: "Sistema",
}

export function MobileMoreSheet({
  navigationGroups,
  open,
  onClose,
}: {
  navigationGroups: NavigationGroupData[]
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const dialogRef = useRef<HTMLDivElement>(null)
  const mobileMoreNavigationGroups = navigationGroups.filter((group) => group.id !== "core")

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
    dialog?.querySelector<HTMLElement>(focusableSelector)?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
        return
      }
      if (event.key !== "Tab" || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = ""
      previousFocus?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-md md:hidden" role="presentation">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Cerrar más opciones" />
      <div
        ref={dialogRef}
        id="mobile-more-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-more-title"
        className="surface-1 relative z-10 max-h-[82dvh] w-full overflow-y-auto rounded-[30px] border p-5 outline-none motion-safe:animate-in motion-safe:slide-in-from-bottom-4"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <p className="eyebrow">Navegación</p>
            <h2 id="mobile-more-title" className="mt-1 text-xl font-semibold tracking-[-0.03em] text-white">Más espacios</h2>
          </div>
          <button type="button" onClick={onClose} className="flex size-11 items-center justify-center rounded-[16px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {mobileMoreNavigationGroups.map((group) => (
            <section key={group.id} aria-labelledby={`mobile-group-${group.id}`}>
              <h3 id={`mobile-group-${group.id}`} className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{groupLabels[group.id] ?? group.id}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href)
                  return (
                    <Link key={item.href} href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className={cn("flex min-h-14 items-center gap-3 rounded-[18px] border border-white/[0.08] px-3 text-sm font-medium text-muted-foreground transition hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white", active && "border-primary/25 bg-primary/10 text-white")}>
                      <NavigationIcon iconKey={item.iconKey} className={cn("size-4", active && "text-primary")} />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
