"use client"

import { useActionState, useMemo, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { initialProcessInboxActionState } from "@/features/inbox/action-state"
import {
  processInboxItemAction,
} from "@/features/inbox/actions"
import type { ProcessInboxTarget } from "@/features/inbox/schemas"
import { deriveInboxTitle } from "@/features/inbox/utils"
import { InboxSubmitButton } from "@/features/inbox/components/inbox-submit-button"
import { cn } from "@/lib/utils"

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

      <div className="surface-1 relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] border p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/90">
              Procesar inbox
            </p>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              Convertí esta captura en una entidad real
            </h3>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Elegí el destino correcto y movela al sistema. Inbox vuelve a quedar limpio.
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

        <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Captura original
          </p>
          <p className="mt-2 text-sm leading-7 text-white">{item.content}</p>
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
                    ? "border-primary/30 bg-primary/10 text-white"
                    : "border-white/8 bg-white/[0.03] text-muted-foreground hover:text-white"
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
                "h-12 w-full rounded-[20px] border bg-white/[0.03] px-4 text-sm text-white outline-none transition",
                "focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
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
                    className="h-12 w-full rounded-[20px] border border-white/8 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
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
                      "h-12 w-full rounded-[20px] border bg-white/[0.03] px-4 text-sm text-white outline-none transition",
                      "focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
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
                  className="min-h-28 w-full resize-none rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-muted-foreground/80 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
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
                      "h-12 w-full rounded-[20px] border bg-white/[0.03] px-4 text-sm text-white outline-none transition",
                      "focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
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
                    "min-h-40 w-full resize-none rounded-[20px] border bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition",
                    "focus:border-primary/40 focus:ring-4 focus:ring-primary/10",
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

          <div className="flex flex-col gap-3 border-t border-white/8 pt-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              {actionState.message ? (
                <p className="text-sm text-muted-foreground">{actionState.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Procesar mueve esta captura fuera del inbox activo.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/8 px-4 text-sm text-muted-foreground transition hover:text-white"
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

  return (
    <>
      <button
        type="button"
        disabled={!databaseReady}
        onClick={() => setSessionId(Date.now())}
        className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/14 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
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
          onCancel={() => setSessionId(null)}
        />
      ) : null}
    </>
  )
}
