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
  useTransition,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { useActionState } from "react"
import {
  ArrowLeft,
  Archive,
  BookOpenText,
  CalendarDays,
  Inbox,
  Layers3,
  Plus,
  PauseCircle,
  PlayCircle,
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
import { updateProjectStatusAction, planTaskForTodayAction, planTaskForTomorrowAction, setTaskPlannedDateAction, clearTaskPlannedDateAction } from "@/features/areas/actions"
import { archiveOperationalNoteAction } from "@/features/operational-notes/actions"
import { processInboxItemAction } from "@/features/inbox/actions"
import { initialProcessInboxActionState } from "@/features/inbox/action-state"
import type { ProcessInboxTarget } from "@/features/inbox/schemas"
import { deriveInboxTitle } from "@/features/inbox/utils"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { formatDateInputValue, parseDateInput } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { useDemoMode } from "@/components/demo/demo-mode-provider"

type CommandMode = "search" | "capture" | "library-note" | "process-inbox"
type AreaWithContainers = {
  id: string
  name: string
  containers: { id: string; name: string }[]
}
type ProjectOption = {
  id: string
  title: string
  containerName: string
  areaName: string
}

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

const targetLabels: Record<ProcessInboxTarget, string> = {
  project: "Proyecto",
  task: "Tarea",
  note: "Nota",
}

function buildInitialInboxProcessState(
  content: string,
  areasWithContainers: AreaWithContainers[],
  projectOptions: ProjectOption[]
) {
  return {
    target: "project" as ProcessInboxTarget,
    title: deriveInboxTitle(content),
    description: "",
    noteContent: content,
    selectedAreaId: areasWithContainers[0]?.id ?? "",
    selectedContainerId: areasWithContainers[0]?.containers[0]?.id ?? "",
    selectedProjectId: projectOptions[0]?.id ?? "",
  }
}

function CommandInboxProcessForm({
  item,
  areasWithContainers,
  projectOptions,
  onBack,
  onClose,
}: {
  item: { id: string; content: string }
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  onBack: () => void
  onClose: () => void
}) {
  const [actionState, formAction] = useActionState(
    processInboxItemAction,
    initialProcessInboxActionState
  )
  const [formState, setFormState] = useState(() =>
    buildInitialInboxProcessState(item.content, areasWithContainers, projectOptions)
  )
  const { notify } = useToast()

  useEffect(() => {
    if (actionState.status !== "success") {
      return
    }

    notify({ message: actionState.message ?? "Captura procesada.", tone: "success" })
    onClose()
  }, [actionState.message, actionState.status, notify, onClose])

  const selectedArea = useMemo(
    () => areasWithContainers.find((area) => area.id === formState.selectedAreaId) ?? null,
    [areasWithContainers, formState.selectedAreaId]
  )

  const availableContainers = selectedArea?.containers ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-10 items-center justify-center rounded-[16px] text-muted-foreground transition hover:bg-white/[0.05] hover:text-white"
          aria-label="Volver a buscar"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="space-y-1">
          <p className="text-base font-medium text-white">Procesar captura</p>
          <p className="text-sm text-muted-foreground">
            Elegí el destino final sin salir de la paleta.
          </p>
        </div>
      </div>

      <div className="surface-2 rounded-[22px] border p-4">
        <p className="text-sm font-medium text-white">Captura original</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.content}</p>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="inboxItemId" value={item.id} />
        <input type="hidden" name="target" value={formState.target} />

        <div className="grid gap-3 md:grid-cols-3">
          {(["project", "task", "note"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormState((current) => ({ ...current, target: value }))}
              className={cn(
                "rounded-[22px] border px-4 py-4 text-left transition",
                formState.target === value
                  ? "border-white/[0.08] bg-white/[0.045] text-white"
                  : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.03] hover:text-white"
              )}
            >
              <p className="text-sm font-medium">{targetLabels[value]}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Título</label>
          <input
            name="title"
            value={formState.title}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            className={cn(
              "field-base h-11 w-full rounded-2xl px-4 text-sm",
              actionState.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
            )}
          />
        </div>

        {formState.target === "project" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={formState.selectedAreaId}
              onChange={(event) => {
                const nextArea = areasWithContainers.find((area) => area.id === event.target.value)
                setFormState((current) => ({
                  ...current,
                  selectedAreaId: event.target.value,
                  selectedContainerId: nextArea?.containers[0]?.id ?? "",
                }))
              }}
              className="field-base h-11 rounded-2xl px-4 text-sm"
            >
              {areasWithContainers.map((area) => (
                <option key={area.id} value={area.id} className="bg-neutral-950">
                  {area.name}
                </option>
              ))}
            </select>
            <select
              name="containerId"
              value={formState.selectedContainerId}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  selectedContainerId: event.target.value,
                }))
              }
              className="field-base h-11 rounded-2xl px-4 text-sm"
            >
              {availableContainers.map((container) => (
                <option key={container.id} value={container.id} className="bg-neutral-950">
                  {container.name}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Descripción opcional"
              rows={4}
              className="field-base min-h-28 md:col-span-2 rounded-[20px] px-4 py-3 text-sm leading-6"
            />
          </div>
        ) : null}

        {formState.target === "task" ? (
          <select
            name="projectId"
            value={formState.selectedProjectId}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                selectedProjectId: event.target.value,
              }))
            }
            className="field-base h-11 w-full rounded-2xl px-4 text-sm"
          >
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id} className="bg-neutral-950">
                {project.areaName} / {project.containerName} / {project.title}
              </option>
            ))}
          </select>
        ) : null}

        {formState.target === "note" ? (
          <textarea
            name="content"
            value={formState.noteContent}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                noteContent: event.target.value,
              }))
            }
            rows={6}
            className="field-base min-h-36 w-full rounded-[20px] px-4 py-3 text-sm leading-6"
          />
        ) : null}

        <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-4 md:flex-row md:items-end md:justify-between">
          <div className="min-h-10" aria-live="polite">
            {actionState.message ? (
              <p
                className={cn(
                  "text-sm",
                  actionState.status === "error" ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {actionState.message}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                La captura sale del inbox activo cuando se procesa.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/[0.08] px-4 text-sm text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
            >
              Cancelar
            </button>
            <InboxSubmitButton
              disabled={formState.target === "task" && projectOptions.length === 0}
              label={`Crear ${targetLabels[formState.target]}`}
              pendingLabel="Procesando..."
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function CommandResultActions({
  result,
  path,
  onResolved,
}: {
  result: CommandResult
  path: string
  onResolved: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [dateInputValue, setDateInputValue] = useState(
    result.plannedDate ? formatDateInputValue(new Date(result.plannedDate)) : ""
  )
  const { notify } = useToast()

  function runAction(callback: () => Promise<{ status: "success" | "error"; message: string }>) {
    startTransition(async () => {
      const actionResult = await callback()
      notify({
        message: actionResult.message,
        tone: actionResult.status === "success" ? "success" : "error",
      })
      if (actionResult.status === "success") {
        onResolved()
      }
    })
  }

  if (result.type === "task" && result.entityId) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            runAction(async () => {
              const formData = new FormData()
              formData.set("taskId", result.entityId!)
              formData.set("path", path)
              return planTaskForTodayAction(formData)
            })
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          Hoy
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            runAction(async () => {
              const formData = new FormData()
              formData.set("taskId", result.entityId!)
              formData.set("path", path)
              return planTaskForTomorrowAction(formData)
            })
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          Mañana
        </button>
        <label className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground">
          Otra fecha
          <input
            type="date"
            value={dateInputValue}
            disabled={pending}
            onChange={(event) => {
              const nextValue = event.target.value
              setDateInputValue(nextValue)
              const parsed = parseDateInput(nextValue)
              if (!parsed) {
                return
              }
              runAction(async () => {
                const formData = new FormData()
                formData.set("taskId", result.entityId!)
                formData.set("plannedDate", nextValue)
                formData.set("path", path)
                return setTaskPlannedDateAction(formData)
              })
            }}
            className="w-32 bg-transparent text-xs text-white outline-none [color-scheme:dark]"
          />
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            runAction(async () => {
              const formData = new FormData()
              formData.set("taskId", result.entityId!)
              formData.set("path", path)
              return clearTaskPlannedDateAction(formData)
            })
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          Quitar
        </button>
      </div>
    )
  }

  if (result.type === "project" && result.entityId) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {result.projectStatus !== "active" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              runAction(async () => {
                const formData = new FormData()
                formData.set("projectId", result.entityId!)
                formData.set("status", "active")
                formData.set("path", path)
                return updateProjectStatusAction(formData)
              })
            }
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-white transition hover:bg-white/[0.04] disabled:opacity-60"
          >
            <PlayCircle className="size-3.5" />
            Activo
          </button>
        ) : null}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            runAction(async () => {
              const formData = new FormData()
              formData.set("projectId", result.entityId!)
              formData.set("status", "paused")
              formData.set("path", path)
              return updateProjectStatusAction(formData)
            })
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          <PauseCircle className="size-3.5" />
          Parking
        </button>
      </div>
    )
  }

  if (result.type === "operational-note" && result.entityId) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            runAction(async () => {
              const formData = new FormData()
              formData.set("id", result.entityId!)
              formData.set("path", path)
              return archiveOperationalNoteAction(formData)
            })
          }
          className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white disabled:opacity-60"
        >
          <Archive className="size-3.5" />
          Archivar
        </button>
      </div>
    )
  }

  return null
}

function CommandSurface({
  open,
  onClose,
  databaseReady,
  areasWithContainers,
  projectOptions,
  readOnly,
}: {
  open: boolean
  onClose: () => void
  databaseReady: boolean
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  readOnly: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CommandResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [pending, setPending] = useState(false)
  const [mode, setMode] = useState<CommandMode>("search")
  const [processingInboxItem, setProcessingInboxItem] = useState<{
    id: string
    content: string
  } | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchRequestId = useRef(0)

  const actionResults = useMemo(
    () => getFilteredQuickActions(query).filter((action) =>
      !readOnly || (action.actionKey !== "new-capture" && action.actionKey !== "new-library-note")
    ),
    [query, readOnly]
  )
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

      if (
        !readOnly &&
        result.type === "inbox-item" &&
        result.entityId &&
        result.rawContent &&
        areasWithContainers.length > 0 &&
        projectOptions.length > 0
      ) {
        setProcessingInboxItem({
          id: result.entityId,
          content: result.rawContent,
        })
        setSelectedIndex(0)
        setMode("process-inbox")
        return
      }

      if (result.href) {
        router.push(result.href)
        onClose()
      }
    },
    [areasWithContainers.length, onClose, projectOptions.length, readOnly, router]
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
                  {mode === "capture"
                    ? "Nueva captura"
                    : mode === "library-note"
                      ? "Nueva nota en Biblioteca"
                      : "Procesar captura"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "capture"
                    ? "Guardá algo rápido en Inbox."
                    : mode === "library-note"
                      ? "Creá una nota de referencia sin salir de contexto."
                      : "Convertí esta captura en proyecto, tarea o nota sin salir de la paleta."}
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
          ) : mode === "process-inbox" && processingInboxItem ? (
            <CommandInboxProcessForm
              item={processingInboxItem}
              areasWithContainers={areasWithContainers}
              projectOptions={projectOptions}
              onBack={() => {
                setProcessingInboxItem(null)
                setMode("search")
              }}
              onClose={onClose}
            />
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
                        <article
                          key={`${result.type}-${result.id}`}
                          className={cn(
                            "rounded-[22px] border px-3 py-3 transition",
                            active
                              ? "border-primary/24 bg-primary/10"
                              : "border-transparent hover:bg-white/[0.03]"
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => void executeResult(result)}
                            className="flex w-full items-center gap-3 text-left"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.08] bg-white/[0.03]">
                              <Icon className="size-4 text-primary/90" />
                            </div>
                            <div className="min-w-0 flex-1">
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
                          {!readOnly && result.type === "inbox-item" &&
                          result.entityId &&
                          result.rawContent &&
                          areasWithContainers.length > 0 &&
                          projectOptions.length > 0 ? (
                            <div className="mt-3 border-t border-white/[0.06] pt-3">
                              <button
                                type="button"
                                onClick={() => void executeResult(result)}
                                className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.08] px-3 text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-white"
                              >
                                Procesar captura
                              </button>
                            </div>
                          ) : null}
                          {!readOnly && result.type !== "inbox-item" ? (
                            <CommandResultActions
                              result={result}
                              path={pathname}
                              onResolved={() => {
                                onClose()
                                router.refresh()
                              }}
                            />
                          ) : null}
                        </article>
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
      <span className="sm:hidden">Comandos</span>
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
      className="fixed bottom-24 right-4 z-30 hidden h-12 rounded-full px-4 shadow-xl md:bottom-6 md:right-7 md:inline-flex"
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
  areasWithContainers,
  projectOptions,
}: {
  children: React.ReactNode
  databaseReady: boolean
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
}) {
  const { readOnly } = useDemoMode()
  const [open, setOpen] = useState(false)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const openSurface = useCallback(() => {
    restoreFocusRef.current =
      typeof document !== "undefined" && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setOpen(true)
  }, [])

  const closeSurface = useCallback(() => {
    setOpen(false)
    window.requestAnimationFrame(() => restoreFocusRef.current?.focus())
  }, [])

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (open) {
          closeSurface()
        } else {
          openSurface()
        }
      }
    }

    window.addEventListener("keydown", onShortcut)
    return () => window.removeEventListener("keydown", onShortcut)
  }, [closeSurface, open, openSurface])

  const value = useMemo(
    () => ({
      open: openSurface,
    }),
    [openSurface]
  )

  return (
    <CommandSurfaceContext.Provider value={value}>
      {children}
      {open ? (
        <CommandSurface
          key="command-surface-open"
          open={open}
          onClose={closeSurface}
          databaseReady={databaseReady}
          areasWithContainers={areasWithContainers}
          projectOptions={projectOptions}
          readOnly={readOnly}
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
