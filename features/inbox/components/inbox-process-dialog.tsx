"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { initialProcessInboxActionState } from "@/features/inbox/action-state"
import {
  processInboxItemAction,
} from "@/features/inbox/actions"
import type { ProcessInboxTarget } from "@/features/inbox/schemas"
import { deriveInboxTitle } from "@/features/inbox/utils"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
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
}

type DialogSessionProps = {
  item: {
    id: string
    content: string
  }
  areasWithContainers: AreaWithContainers[]
  projectOptions: ProjectOption[]
  onCancel: () => void
}

const targetLabels: Record<ProcessInboxTarget, string> = {
  project: "Proyecto",
  task: "Tarea",
  note: "Nota",
}

function buildInitialFormState(
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

function DialogSession({
  item,
  areasWithContainers,
  projectOptions,
  onCancel,
}: DialogSessionProps) {
  const [actionState, formAction] = useActionState(
    processInboxItemAction,
    initialProcessInboxActionState
  )
  const [formState, setFormState] = useState(() =>
    buildInitialFormState(item.content, areasWithContainers, projectOptions)
  )
  const { notify } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onCancel])

  useEffect(() => {
    if (actionState.status !== "success") return
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

      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`process-title-${item.id}`} tabIndex={-1} className="surface-1 relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 outline-none transition-all duration-200 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-[0.98] motion-reduce:transition-none md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">
              Procesar inbox
            </p>
            <h3 id={`process-title-${item.id}`} className="text-2xl font-semibold tracking-[-0.04em] text-white">
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
          <p className="eyebrow">
            Captura original
          </p>
          <p className="mt-2 text-base leading-8 text-white">{item.content}</p>
        </div>

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
                  <label
                    htmlFor={`container-${item.id}`}
                    className="text-sm font-medium text-white"
                  >
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
                <label
                  htmlFor={`description-${item.id}`}
                  className="text-sm font-medium text-white"
                >
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
                  <label
                    htmlFor={`project-${item.id}`}
                    className="text-sm font-medium text-white"
                  >
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
                    <p className="text-sm text-destructive">
                      {actionState.fieldErrors.projectId[0]}
                    </p>
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
                <label
                  htmlFor={`note-content-${item.id}`}
                  className="text-sm font-medium text-white"
                >
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
                    actionState.fieldErrors?.content
                      ? "border-destructive/50"
                      : "border-white/8"
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
}: InboxProcessDialogProps) {
  const [sessionId, setSessionId] = useState<number | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeDialog = () => {
    setSessionId(null)
    window.requestAnimationFrame(() => triggerRef.current?.focus())
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={!databaseReady}
        onClick={() => setSessionId(Date.now())}
        className="inline-flex min-h-11 items-center gap-2 rounded-[18px] border border-white/[0.07] bg-white/[0.03] px-3 text-xs font-medium text-white transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Procesar
        <ChevronDown className="size-3.5" />
      </button>

      {sessionId !== null ? (
        <DialogSession
          key={sessionId}
          item={item}
          areasWithContainers={areasWithContainers}
          projectOptions={projectOptions}
          onCancel={closeDialog}
        />
      ) : null}
    </>
  )
}
