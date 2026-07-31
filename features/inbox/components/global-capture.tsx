"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, X } from "lucide-react"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { InboxForm } from "@/features/inbox/components/inbox-form"
import { useToast } from "@/components/ui/toast-provider"

export function GlobalCapture({ databaseReady }: { databaseReady: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { notify } = useToast()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.matches("input, textarea, select, [contenteditable='true']")
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !typing) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onShortcut)
    return () => window.removeEventListener("keydown", onShortcut)
  }, [])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
      trigger?.focus()
    }
  }, [open])

  return (
    <>
      {pathname !== "/inbox" ? (
        <Button ref={triggerRef} type="button" onClick={() => setOpen(true)} className="fixed bottom-24 right-4 z-30 h-12 rounded-full px-4 shadow-xl md:bottom-6 md:right-7" aria-label="Nueva captura">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Nueva captura</span>
          <kbd className="ml-1 hidden rounded border border-black/15 bg-black/10 px-1.5 py-0.5 font-mono text-[10px] md:inline">⌘ K</kbd>
        </Button>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation">
          <button type="button" className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Cerrar captura" />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="global-capture-title" tabIndex={-1} className="relative z-10 w-full max-w-xl outline-none">
            <div className="mb-3 flex items-center justify-between px-2">
              <h2 id="global-capture-title" className="text-lg font-semibold text-white">Sacalo de tu cabeza</h2>
              <button type="button" onClick={() => setOpen(false)} className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/[0.06] hover:text-white" aria-label="Cerrar">
                <X className="size-5" />
              </button>
            </div>
            <InboxForm databaseReady={databaseReady} compact onSuccess={() => {
              notify({ message: "Captura guardada.", tone: "success" })
              setOpen(false)
            }} />
          </div>
        </div>
      ) : null}
    </>
  )
}
