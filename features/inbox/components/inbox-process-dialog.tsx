"use client"

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Brain, ChevronDown, Sparkles, X } from "lucide-react"

import { initialProcessInboxActionState } from "@/features/inbox/action-state"
import {
  processInboxItemAction,
  suggestInboxProcessingAction,
} from "@/features/inbox/actions"
import type { ProcessInboxTarget } from "@/features/inbox/schemas"
import { deriveInboxTitle } from "@/features/inbox/utils"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import type { SuggestInboxProcessingResult } from "@/features/inbox-ai/schemas"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast-provider"

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

type InboxProcessDialogProps = {
  item: {
    id: string
    content: string
  }
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  databaseReady: boolean
  aiEnabled: boolean
}

type DialogSessionProps = {
  item: {
    id: string
    content: string
  }
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  initialSuggestion?: SuggestInboxProcessingResult
  onCancel: () => void
}

type DialogSessionState = {
  id: number
  suggestion?: SuggestInboxProcessingResult
}

const targetLabels: Record<ProcessInboxTarget, string> = {
  project: "Proyecto",
  task: "Tarea",
  note: "Nota",
}

const confidenceLabels = {
  low: "Confianza baja",
  medium: "Confianza media",
  high: "Confianza alta",
} as const

function buildInitialFormState(
  content: string,
  areasWithContainers: AreaWithContainers[],
  projectOptions: ProjectOption[],
  suggestion?: SuggestInboxProcessingResult
) {
  return {
    target: suggestion?.suggestedTarget ?? ("project" as ProcessInboxTarget),
    title: suggestion?.suggestedTitle ?? deriveInboxTitle(content),
    description: suggestion?.suggestedDescription ?? "",
    noteContent: suggestion?.suggestedContent ?? content,
    selectedAreaId: areasWithContainers[0]?.id ?? "",
    selectedContainerId: areasWithContainers[0]?.containers[0]?.id ?? "",
    selectedProjectId: projectOptions[0]?.id ?? "",
  }
}

function DialogSession({
  item,
  areasWithContainers,
  projectOptions,
  initialSuggestion,
  onCancel,
}: DialogSessionProps) {
  const [actionState, formAction] = useActionState(
    processInboxItemAction,
    initialProcessInboxActionState
  )
  const [formState, setFormState] = useState(() =>
    buildInitialFormState(item.content, areasWithContainers, projectOptions, initialSuggestion)
  )
  const { notify } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onCancel])

  useEffect(() => {
    if (actionState.status !== "success") {
      return
    }

    notify({ message: actionState.message ?? "Captura procesada.", tone: "success" })
    onCancel()
  }, [actionState.message, actionState.status, notify, onCancel])

  const selectedArea = useMemo(
    () =>
      areasWithContainers.find((area) => area.id === formState.selectedAreaId) ?? null,
    [areasWithContainers, formState.selectedAreaId]
  )

  const availableContainers = selectedArea?.containers ?? []

  if (actionState.status === "success") {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar procesamiento"
        className="absolute inset-0"
        onClick={onCancel}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`process-title-${item.id}`}
        tabIndex={-1}
        className="surface-1 relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 outline-none transition-all duration-200 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-[0.98] motion-reduce:transition-none md:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">Procesar inbox</p>
            <h3
              id={`process-title-${item.id}`}
              className="text-2xl font-semibold tracking-[-0.04em] text-white"
            >
              Elegí dónde guardar esta captura
            </h3>
            <p className="context-line max-w-xl">
              Completá solo la información necesaria. La captura saldrá de esta lista.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-muted-foreground transition hover:text-white"
            onClick={onCancel}
          >
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        <div className="surface-2 mt-5 rounded-[24px] border p-4">
          <p className="eyebrow">Captura original</p>
          <p className="mt-2 text-base leading-8 text-white">{item.content}</p>
        </div>

        {initialSuggestion ? (
          <div className="surface-2 mt-4 rounded-[24px] border border-primary/10 bg-primary/[0.04] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-3 text-[11px] font-medium text-primary/90">
                <Sparkles className="size-3.5" />
                Sugerencia con IA
              </span>
              <span className="meta-item">{targetLabels[initialSuggestion.suggestedTarget]}</span>
              {initialSuggestion.confidence ? (
                <span className="meta-item">{confidenceLabels[initialSuggestion.confidence]}</span>
              ) : null}
            </div>
            {initialSuggestion.reason ? (
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {initialSuggestion.reason}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                La IA dejó una primera propuesta para que la revises antes de confirmar.
              </p>
            )}
          </div>
        ) : null}

        <form action={formAction} className="mt-5 space-y-5">
          <input type="hidden" name="inboxItemId" value={item.id} />
          <input type="hidden" name="target" value={formState.target} />

          <div className="grid gap-3 md:grid-cols-3">
            {(["project", "task", "note"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setFormState((current) => ({
                    ...current,
                    target: value,
                  }))
                }
                className={cn(
                  "rounded-[22px] border px-4 py-4 text-left transition",
                  formState.target === value
                    ? "border-white/[0.08] bg-white/[0.045] text-white"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.03] hover:text-white"
                )}
              >
                <p className="text-sm font-medium">{targetLabels[value]}</p>
                <p className="mt-1 text-xs leading-6">
                  {value === "project"
                    ? "Nueva iniciativa con tareas futuras."
                    : value === "task"
                      ? "Acción concreta dentro de un proyecto."
                      : "Conocimiento para Biblioteca."}
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor={`title-${item.id}`} className="text-sm font-medium text-white">
              Título
            </label>
            <input
              id={`title-${item.id}`}
              name="title"
              value={formState.title}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className={cn(
                "field-base h-12 w-full rounded-[20px] px-4 text-sm",
                actionState.fieldErrors?.title ? "border-destructive/50" : "border-white/8"
              )}
            />
            {actionState.fieldErrors?.title?.[0] ? (
              <p className="text-sm text-destructive">{actionState.fieldErrors.title[0]}</p>
            ) : null}
          </div>

          {formState.target === "project" ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor={`area-${item.id}`} className="text-sm font-medium text-white">
                    Área
                  </label>
                  <select
                    id={`area-${item.id}`}
                    value={formState.selectedAreaId}
                    onChange={(event) => {
                      const nextArea = areasWithContainers.find(
                        (area) => area.id === event.target.value
                      )

                      setFormState((current) => ({
                        ...current,
                        selectedAreaId: event.target.value,
                        selectedContainerId: nextArea?.containers[0]?.id ?? "",
                      }))
                    }}
                    className="field-base h-12 w-full rounded-[20px] px-4 text-sm"
                  >
                    {areasWithContainers.map((area) => (
                      <option key={area.id} value={area.id} className="bg-neutral-950">
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor={`container-${item.id}`} className="text-sm font-medium text-white">
                    Container
                  </label>
                  <select
                    id={`container-${item.id}`}
                    name="containerId"
                    value={formState.selectedContainerId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        selectedContainerId: event.target.value,
                      }))
                    }
                    className={cn(
                      "field-base h-12 w-full rounded-[20px] px-4 text-sm",
                      actionState.fieldErrors?.containerId
                        ? "border-destructive/50"
                        : "border-white/8"
                    )}
                  >
                    {availableContainers.map((container) => (
                      <option key={container.id} value={container.id} className="bg-neutral-950">
                        {container.name}
                      </option>
                    ))}
                  </select>
                  {actionState.fieldErrors?.containerId?.[0] ? (
                    <p className="text-sm text-destructive">
                      {actionState.fieldErrors.containerId[0]}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor={`description-${item.id}`} className="text-sm font-medium text-white">
                  Descripción opcional
                </label>
                <textarea
                  id={`description-${item.id}`}
                  name="description"
                  rows={4}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Podés sumar contexto, pero no hace falta para avanzar."
                  className="field-base min-h-28 w-full resize-none rounded-[20px] px-4 py-3 text-sm leading-6"
                />
              </div>
            </div>
          ) : null}

          {formState.target === "task" ? (
            <div className="space-y-4">
              {projectOptions.length > 0 ? (
                <div className="space-y-2">
                  <label htmlFor={`project-${item.id}`} className="text-sm font-medium text-white">
                    Proyecto
                  </label>
                  <select
                    id={`project-${item.id}`}
                    name="projectId"
                    value={formState.selectedProjectId}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        selectedProjectId: event.target.value,
                      }))
                    }
                    className={cn(
                      "field-base h-12 w-full rounded-[20px] px-4 text-sm",
                      actionState.fieldErrors?.projectId
                        ? "border-destructive/50"
                        : "border-white/8"
                    )}
                  >
                    {projectOptions.map((project) => (
                      <option key={project.id} value={project.id} className="bg-neutral-950">
                        {project.areaName} / {project.containerName} / {project.title}
                      </option>
                    ))}
                  </select>
                  {actionState.fieldErrors?.projectId?.[0] ? (
                    <p className="text-sm text-destructive">{actionState.fieldErrors.projectId[0]}</p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-white">
                    Todavía no hay proyectos disponibles.
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Primero necesitás al menos un proyecto para procesar una captura como tarea.
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {formState.target === "note" ? (
            <div className="space-y-4">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                Esta nota se guardará en Biblioteca.
              </div>
              <div className="space-y-2">
                <label htmlFor={`note-content-${item.id}`} className="text-sm font-medium text-white">
                  Contenido
                </label>
                <textarea
                  id={`note-content-${item.id}`}
                  name="content"
                  rows={6}
                  value={formState.noteContent}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      noteContent: event.target.value,
                    }))
                  }
                  className={cn(
                    "field-base min-h-40 w-full resize-none rounded-[20px] px-4 py-3 text-sm leading-6",
                    actionState.fieldErrors?.content ? "border-destructive/50" : "border-white/8"
                  )}
                />
                {actionState.fieldErrors?.content?.[0] ? (
                  <p className="text-sm text-destructive">{actionState.fieldErrors.content[0]}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-white/8 pt-5 md:flex-row md:items-end md:justify-between">
            <div className="min-h-10 space-y-1" aria-live="polite">
              {actionState.message ? (
                <p
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "text-sm",
                    actionState.status === "error" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {actionState.message}
                </p>
              ) : initialSuggestion ? (
                <p className="text-sm text-muted-foreground">
                  La propuesta ya está cargada. Ajustala antes de confirmar si hace falta.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Procesar mueve esta captura fuera del inbox activo.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/8 px-4 text-sm text-muted-foreground transition hover:bg-white/[0.03] hover:text-white"
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
    </div>
  )
}

export function InboxProcessDialog({
  item,
  areasWithContainers,
  projectOptions,
  databaseReady,
  aiEnabled,
}: InboxProcessDialogProps) {
  const [session, setSession] = useState<DialogSessionState | null>(null)
  const [suggestionMessage, setSuggestionMessage] = useState<{
    tone: "error" | "success" | "muted"
    message: string
  } | null>(null)
  const [pendingSuggestion, startSuggestion] = useTransition()
  const triggerRef = useRef<HTMLButtonElement>(null)

  const closeDialog = () => {
    setSession(null)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  const openManual = () => {
    setSuggestionMessage(null)
    setSession({ id: Date.now() })
  }

  const requestSuggestion = () => {
    if (!aiEnabled || !databaseReady) {
      return
    }

    setSuggestionMessage(null)

    startSuggestion(async () => {
      const result = await suggestInboxProcessingAction({ content: item.content })

      if (result.status === "error" || !result.suggestion) {
        setSuggestionMessage({
          tone: "error",
          message: result.message,
        })
        return
      }

      setSuggestionMessage({
        tone: "success",
        message: result.message,
      })
      setSession({
        id: Date.now(),
        suggestion: result.suggestion,
      })
    })
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={!databaseReady || !aiEnabled || pendingSuggestion}
            onClick={requestSuggestion}
            className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-primary/14 bg-primary/[0.06] px-3 text-xs font-medium text-primary/90 transition hover:bg-primary/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
            title={
              aiEnabled
                ? "Sugerir destino y título con IA"
                : "Configurá OPENAI_API_KEY para habilitar sugerencias inteligentes."
            }
          >
            <Brain className="size-3.5" />
            {pendingSuggestion ? "Analizando..." : "Sugerir con IA"}
          </button>

          <button
            ref={triggerRef}
            type="button"
            disabled={!databaseReady}
            onClick={openManual}
            className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.07] bg-white/[0.03] px-3 text-xs font-medium text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Procesar
            <ChevronDown className="size-3.5" />
          </button>
        </div>

        <p
          className={cn(
            "min-h-5 text-right text-[11px]",
            pendingSuggestion
              ? "text-muted-foreground"
              : suggestionMessage?.tone === "error"
                ? "text-destructive"
                : suggestionMessage?.tone === "success"
                  ? "text-primary/90"
                  : "text-muted-foreground"
          )}
          aria-live="polite"
        >
          {pendingSuggestion
            ? "Analizando captura..."
            : suggestionMessage?.message ??
              (!aiEnabled
                ? "Configurá OPENAI_API_KEY para habilitar sugerencias inteligentes."
                : "")}
        </p>
      </div>

      {session !== null ? (
        <DialogSession
          key={session.id}
          item={item}
          areasWithContainers={areasWithContainers}
          projectOptions={projectOptions}
          initialSuggestion={session.suggestion}
          onCancel={closeDialog}
        />
      ) : null}
    </>
  )
}
