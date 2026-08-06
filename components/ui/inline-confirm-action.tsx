"use client"

import { useEffect, useRef, useState, useTransition } from "react"

import type { ActionResult } from "@/types/action-result"
import { cn } from "@/lib/utils"

type InlineConfirmActionProps = {
  triggerLabel: string
  triggerIcon?: React.ReactNode
  triggerClassName?: string
  panelTitle: string
  panelDescription: string
  confirmLabel: string
  pendingLabel: string
  onConfirm: () => Promise<ActionResult>
  onSettled?: (result: ActionResult) => void
  disabled?: boolean
}

export function InlineConfirmAction({
  triggerLabel,
  triggerIcon,
  triggerClassName,
  panelTitle,
  panelDescription,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onSettled,
  disabled = false,
}: InlineConfirmActionProps) {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, startTransition] = useTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const timer = window.setTimeout(() => confirmButtonRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }

      event.preventDefault()
      setOpen(false)
      window.requestAnimationFrame(() => triggerRef.current?.focus())
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  return (
    <div className="space-y-2">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || pending}
        onClick={() =>
          setOpen((current) => {
            const nextOpen = !current
            if (nextOpen) {
              setResult(null)
            }
            return nextOpen
          })
        }
        aria-expanded={open}
        className={cn(
          "inline-flex min-h-8 items-center gap-2 rounded-[16px] border border-transparent px-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-60",
          triggerClassName
        )}
      >
        {triggerIcon}
        {triggerLabel}
      </button>

      {open ? (
        <div className="surface-2 rounded-[18px] border border-destructive/18 bg-destructive/[0.03] p-3">
          <p className="text-sm font-medium text-white">{panelTitle}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{panelDescription}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              ref={confirmButtonRef}
              type="button"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const actionResult = await onConfirm()
                  setResult(actionResult)
                  onSettled?.(actionResult)

                  if (actionResult.status === "success") {
                    setOpen(false)
                    window.requestAnimationFrame(() => triggerRef.current?.focus())
                  }
                })
              }}
              className="inline-flex min-h-9 items-center rounded-[14px] bg-destructive/12 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/18 disabled:opacity-60"
            >
              {pending ? pendingLabel : confirmLabel}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setResult(null)
                setOpen(false)
                window.requestAnimationFrame(() => triggerRef.current?.focus())
              }}
              className="inline-flex min-h-9 items-center rounded-[14px] px-3 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-white disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>

          {result ? (
            <p
              className={cn(
                "mt-3 text-sm",
                result.status === "success" ? "text-primary/85" : "text-destructive"
              )}
              aria-live="polite"
            >
              {result.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
