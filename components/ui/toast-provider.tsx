"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react"
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react"

type ToastTone = "success" | "error" | "info"
type ToastInput = {
  message: string
  tone?: ToastTone
  action?: { label: string; onClick: () => void | Promise<void> }
}
type Toast = ToastInput & { id: number }

const ToastContext = createContext<{ notify: (toast: ToastInput) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const dismiss = useCallback((id: number) => setToasts((current) => current.filter((toast) => toast.id !== id)), [])
  const notify = useCallback((input: ToastInput) => {
    const id = ++nextId.current
    setToasts((current) => [...current.slice(-2), { ...input, id }])
    window.setTimeout(() => dismiss(id), input.action ? 7000 : 4500)
  }, [dismiss])
  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed inset-x-3 bottom-24 z-[70] flex flex-col items-end gap-2 md:bottom-6 md:left-auto md:right-6 md:w-96" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = toast.tone === "error" ? CircleAlert : toast.tone === "info" ? Info : CheckCircle2
          return (
            <div key={toast.id} role="status" className="surface-1 flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 shadow-[0_24px_50px_-26px_rgba(0,0,0,0.9)] transition-all duration-200 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-reduce:transition-none">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02]">
                <Icon className={toast.tone === "error" ? "size-4 text-red-200" : "size-4 text-primary/90"} />
              </div>
              <p className="min-w-0 flex-1 text-sm leading-6 text-white">{toast.message}</p>
              {toast.action ? <button type="button" onClick={async () => { await toast.action?.onClick(); dismiss(toast.id) }} className="min-h-9 rounded-[14px] px-2.5 text-sm font-medium text-primary hover:text-white">{toast.action.label}</button> : null}
              <button type="button" onClick={() => dismiss(toast.id)} className="flex size-9 items-center justify-center rounded-[14px] text-muted-foreground hover:bg-white/[0.03] hover:text-white" aria-label="Cerrar notificación"><X className="size-4" /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast debe usarse dentro de ToastProvider")
  return context
}
