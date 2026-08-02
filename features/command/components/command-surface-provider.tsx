"use client"

import {
  useCallback,
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { useActionState } from "react"
import {
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  Inbox,
  Layers3,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import {
  initialQuickCaptureActionState,
  initialQuickLibraryNoteActionState,
} from "@/features/command/action-state"
import {
  quickCaptureAction,
  quickCreateLibraryNoteAction,
  searchCommandSurfaceAction,
} from "@/features/command/actions"
import type { CommandResult } from "@/features/command/types"
import { cn } from "@/lib/utils"

type CommandMode = "search" | "capture" | "library-note"

const CommandSurfaceContext = createContext<{
  open: () => void
} | null>(null)

const quickActions: CommandResult[] = [
  {
    id: "action-new-capture",
    type: "action",
    title: "Nueva captura",
    subtitle: "Guardá algo en Inbox sin salir de la pantalla actual.",
    actionKey: "new-capture",
  },
  {
    id: "action-new-library-note",
    type: "action",
    title: "Nueva nota en Biblioteca",
    subtitle: "Creá una nota de referencia pura.",
    actionKey: "new-library-note",
  },
  {
    id: "action-go-today",
    type: "action",
    title: "Ir a Hoy",
    subtitle: "Abrí la vista de ejecución diaria.",
    href: "/today",
    actionKey: "go-today",
  },
  {
    id: "action-go-inbox",
    type: "action",
    title: "Ir a Inbox",
    subtitle: "Abrí tus capturas pendientes.",
    href: "/inbox",
    actionKey: "go-inbox",
  },
  {
    id: "action-go-review",
    type: "action",
    title: "Ir a Review",
    subtitle: "Revisá el mantenimiento saludable del sistema.",
    href: "/review",
    actionKey: "go-review",
  },
]

function getFilteredQuickActions(query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return quickActions
  }

  return quickActions.filter((action) =>
    `${action.title} ${action.subtitle ?? ""}`.toLowerCase().includes(normalized)
  )
}

function getResultIcon(result: CommandResult) {
  switch (result.type) {
    case "project":
      return Layers3
    case "task":
      return CalendarDays
    case "library-note":
      return BookOpenText
    case "inbox-item":
      return Inbox
    case "action":
      return result.actionKey === "new-capture" || result.actionKey === "new-library-note"
        ? Plus
        : Sparkles
    default:
      return Search
  }
}

function QuickCaptureForm({
  onBack,
  onClose,
}: {
  onBack: () => void
  onClose: () => void
}) {
  const [state, formAction] = useActionState(
    quickCaptureAction,
    initialQuickCaptureActionState
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { notify } = useToast()

  useEffect(() => {
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    notify({ message: "Captura guardada.", tone: "success" })
    onClose()
  }, [notify, onClose, state.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-10 items-center justify-center rounded-[16px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white"
          aria-label="Volver a comandos"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="space-y-1">
          <p className="text-base font-medium text-white">Nueva captura</p>
          <p className="text-sm text-muted-foreground">
            Soltalo acá. Ordenar viene después.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <textarea
          ref={textareaRef}
          name="content"
          rows={4}
          placeholder="Ej: revisar el siguiente paso del producto..."
          className={cn(
            "field-base min-h-32 w-full resize-none rounded-[22px] px-4 py-4 text-sm leading-7",
            state.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
          )}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-h-10 space-y-1" aria-live="polite">
            {state.fieldErrors?.content?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            ) : state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.status === "success" ? "text-primary/90" : "text-muted-foreground"
                )}
              >
                {state.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                `Ctrl/⌘ + Enter` también guarda desde este formulario.
              </p>
            )}
          </div>
          <Button type="submit">Guardar captura</Button>
        </div>
      </form>
    </div>
  )
}

function QuickLibraryNoteForm({
  onBack,
  onClose,
}: {
  onBack: () => void
  onClose: () => void
}) {
  const [state, formAction] = useActionState(
    quickCreateLibraryNoteAction,
    initialQuickLibraryNoteActionState
  )
  const titleRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { notify } = useToast()

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (state.status !== "success") {
      return
    }

    notify({ message: "Nota guardada en Biblioteca.", tone: "success" })

    if (state.createdNoteId) {
      startTransition(() => {
        router.push(`/library?note=${state.createdNoteId}`)
      })
    }

    onClose()
  }, [notify, onClose, router, state.createdNoteId, state.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-10 items-center justify-center rounded-[16px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white"
          aria-label="Volver a comandos"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="space-y-1">
          <p className="text-base font-medium text-white">Nueva nota en Biblioteca</p>
          <p className="text-sm text-muted-foreground">
            Guardá una referencia útil sin cambiar de flujo.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input
          ref={titleRef}
          name="title"
          placeholder="Título de la nota..."
          className={cn(
            "field-base h-11 w-full rounded-2xl px-4 text-sm",
            state.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
          )}
        />
        <textarea
          name="content"
          rows={4}
          placeholder="Escribí la idea, definición o referencia que querés guardar."
          className={cn(
            "field-base min-h-32 w-full resize-none rounded-[22px] px-4 py-4 text-sm leading-7",
            state.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
          )}
        />

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-h-10 space-y-1" aria-live="polite">
            {state.fieldErrors?.title?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.title[0]}</p>
            ) : !state.fieldErrors?.title?.[0] && state.fieldErrors?.content?.[0] ? (
              <p className="text-sm text-destructive">{state.fieldErrors.content[0]}</p>
            ) : state.message ? (
              <p
                className={cn(
                  "text-sm",
                  state.status === "success" ? "text-primary/90" : "text-muted-foreground"
                )}
              >
                {state.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                La nota se abre en Biblioteca después de guardarla.
              </p>
            )}
          </div>
          <Button type="submit">Guardar nota</Button>
        </div>
      </form>
    </div>
  )
}

function CommandSurface({
  open,
  onClose,
  databaseReady,
}: {
  open: boolean
  onClose: () => void
  databaseReady: boolean
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CommandResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pending, setPending] = useState(false)
  const [mode, setMode] = useState<CommandMode>("search")
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRequestId = useRef(0)

  const actionResults = useMemo(() => getFilteredQuickActions(query), [query])
  const displayResults = useMemo(
    () => (mode === "search" ? [...actionResults, ...results] : []),
    [actionResults, mode, results]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const timer = window.setTimeout(() => {
      if (mode === "search") {
        inputRef.current?.focus()
      }
    }, 20)

    return () => {
      window.clearTimeout(timer)
      document.body.style.overflow = previousOverflow
    }
  }, [mode, open])

  useEffect(() => {
    if (!open || mode !== "search") {
      return
    }

    const trimmed = query.trim()
    const requestId = ++searchRequestId.current

    if (!trimmed) {
      return
    }

    const timer = window.setTimeout(async () => {
      const nextResults = await searchCommandSurfaceAction(trimmed)
      if (requestId !== searchRequestId.current) {
        return
      }

      setResults(nextResults)
      setPending(false)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [mode, open, query])

  const executeResult = useCallback(
    async (result: CommandResult) => {
      if (result.type === "action") {
        switch (result.actionKey) {
          case "new-capture":
            setSelectedIndex(0)
            setMode("capture")
            return
          case "new-library-note":
            setSelectedIndex(0)
            setMode("library-note")
            return
          case "go-today":
          case "go-inbox":
          case "go-review":
            if (result.href) {
              router.push(result.href)
              onClose()
            }
            return
        }
      }

      if (result.href) {
        router.push(result.href)
        onClose()
      }
    },
    [onClose, router]
  )

  useEffect(() => {
    if (!open) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        if (mode !== "search") {
          setMode("search")
          return
        }

        onClose()
        return
      }

      if (mode !== "search") {
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setSelectedIndex((current) =>
          displayResults.length ? (current + 1) % displayResults.length : 0
        )
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setSelectedIndex((current) =>
          displayResults.length ? (current - 1 + displayResults.length) % displayResults.length : 0
        )
      }

      if (event.key === "Enter" && displayResults[selectedIndex]) {
        event.preventDefault()
        void executeResult(displayResults[selectedIndex])
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [displayResults, executeResult, mode, onClose, open, selectedIndex])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/72 px-3 py-[10dvh] backdrop-blur-md"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Cerrar command surface"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-surface-title"
        className="surface-1 relative z-10 w-full max-w-3xl rounded-[30px] border p-4 shadow-[0_40px_110px_-50px_rgba(0,0,0,1)]"
      >
        <h2 id="command-surface-title" className="sr-only">
          Command surface de Life OS
        </h2>
        <div className="flex items-center gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          {mode === "search" ? (
            <>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    const nextQuery = event.target.value
                    setSelectedIndex(0)
                    if (!nextQuery.trim()) {
                      searchRequestId.current += 1
                      setResults([])
                      setPending(false)
                    } else {
                      setPending(true)
                    }
                    setQuery(nextQuery)
                  }}
                  placeholder="Buscar proyectos, tareas, notas o acciones..."
                  aria-label="Buscar en Life OS"
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
                ⌘K
              </kbd>
            </>
          ) : (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">
                  {mode === "capture" ? "Nueva captura" : "Nueva nota en Biblioteca"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "capture"
                    ? "Guardá algo rápido en Inbox."
                    : "Creá una nota de referencia sin salir de contexto."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedIndex(0)
                  setMode("search")
                }}
                className="inline-flex size-9 items-center justify-center rounded-[14px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Volver a buscar"
              >
                <ArrowLeft className="size-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-[14px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 min-h-[360px]">
          {!databaseReady ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.015] p-6 text-center">
              <div className="space-y-2">
                <p className="text-base font-medium text-white">Conectá la base para usar la command surface completa.</p>
                <p className="text-sm text-muted-foreground">
                  Sin `DATABASE_URL`, la búsqueda y las acciones de creación no pueden persistir resultados.
                </p>
              </div>
            </div>
          ) : mode === "capture" ? (
            <QuickCaptureForm onBack={() => setMode("search")} onClose={onClose} />
          ) : mode === "library-note" ? (
            <QuickLibraryNoteForm onBack={() => setMode("search")} onClose={onClose} />
          ) : displayResults.length ? (
            <div className="space-y-5">
              {actionResults.length ? (
                <section>
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Acciones
                  </p>
                  <div className="mt-2 space-y-1">
                    {actionResults.map((result, index) => {
                      const Icon = getResultIcon(result)
                      const active = selectedIndex === index
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => void executeResult(result)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
                            active
                              ? "border-primary/24 bg-primary/10"
                              : "border-transparent hover:bg-white/[0.03]"
                          )}
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03]">
                            <Icon className="size-4 text-primary/90" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{result.title}</p>
                            {result.subtitle ? (
                              <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {results.length ? (
                <section>
                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Resultados
                  </p>
                  <div className="mt-2 space-y-1">
                    {results.map((result, index) => {
                      const absoluteIndex = actionResults.length + index
                      const Icon = getResultIcon(result)
                      const active = selectedIndex === absoluteIndex
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          type="button"
                          onClick={() => void executeResult(result)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
                            active
                              ? "border-primary/24 bg-primary/10"
                              : "border-transparent hover:bg-white/[0.03]"
                          )}
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03]">
                            <Icon className="size-4 text-primary/90" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-white">{result.title}</p>
                              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                {result.type === "library-note"
                                  ? "Biblioteca"
                                  : result.type === "operational-note"
                                    ? "Nota"
                                    : result.type === "project"
                                      ? "Proyecto"
                                      : result.type === "task"
                                        ? "Tarea"
                                        : "Inbox"}
                              </span>
                            </div>
                            {result.subtitle ? (
                              <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>
          ) : query.trim() ? (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-white/[0.08] bg-white/[0.015] p-6 text-center">
              <div className="space-y-2">
                <p className="text-base font-medium text-white">No encontramos coincidencias.</p>
                <p className="text-sm text-muted-foreground">
                  Probá con otro término o usá una acción rápida para seguir avanzando.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Acciones rápidas
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = getResultIcon(action)
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => void executeResult(action)}
                      className="surface-2 rounded-[22px] border p-4 text-left transition hover:border-white/[0.08] hover:bg-white/[0.035]"
                    >
                      <div className="space-y-2">
                        <div className="flex size-10 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03]">
                          <Icon className="size-4 text-primary/90" />
                        </div>
                        <p className="text-sm font-medium text-white">{action.title}</p>
                        <p className="text-xs leading-6 text-muted-foreground">{action.subtitle}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {mode === "search" ? (
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] px-1 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>↑↓ navegar</span>
              <span>Enter abrir</span>
              <span>Esc cerrar</span>
            </div>
            {pending ? <span>Buscando...</span> : <span>{results.length} resultados</span>}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CommandTopbarTrigger() {
  const context = useContext(CommandSurfaceContext)

  if (!context) {
    return null
  }

  return (
    <button
      type="button"
      onClick={context.open}
      className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.08] px-4 text-sm font-medium text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
      aria-label="Abrir command surface"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Buscar o crear</span>
      <kbd className="hidden rounded border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] md:inline">
        ⌘K
      </kbd>
    </button>
  )
}

function CommandFloatingTrigger() {
  const context = useContext(CommandSurfaceContext)
  const pathname = usePathname()

  if (!context || pathname === "/inbox") {
    return null
  }

  return (
    <Button
      type="button"
      onClick={context.open}
      className="fixed bottom-24 right-4 z-30 h-12 rounded-full px-4 shadow-xl md:bottom-6 md:right-7"
      aria-label="Abrir command surface"
    >
      <Search className="size-4" />
      <span className="hidden sm:inline">Comandos</span>
      <kbd className="ml-1 hidden rounded border border-black/15 bg-black/10 px-1.5 py-0.5 font-mono text-[10px] md:inline">
        ⌘K
      </kbd>
    </Button>
  )
}

export function CommandSurfaceProvider({
  children,
  databaseReady,
}: {
  children: React.ReactNode
  databaseReady: boolean
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    window.addEventListener("keydown", onShortcut)
    return () => window.removeEventListener("keydown", onShortcut)
  }, [])

  const value = useMemo(
    () => ({
      open: () => setOpen(true),
    }),
    []
  )

  return (
    <CommandSurfaceContext.Provider value={value}>
      {children}
      {open ? (
        <CommandSurface
          key="command-surface-open"
          open={open}
          onClose={() => setOpen(false)}
          databaseReady={databaseReady}
        />
      ) : null}
      <CommandFloatingTrigger />
    </CommandSurfaceContext.Provider>
  )
}

export function useCommandSurface() {
  const context = useContext(CommandSurfaceContext)

  if (!context) {
    throw new Error("useCommandSurface debe usarse dentro de CommandSurfaceProvider")
  }

  return context
}

export { CommandTopbarTrigger }
