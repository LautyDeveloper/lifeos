"use client"

import { useActionState, useEffect, useRef, useState, useTransition } from "react"
import { ArrowDown, ArrowUp, PencilLine } from "lucide-react"

import { initialUpdateAreaActionState } from "@/features/settings/action-state"
import { moveAreaAction, updateAreaDetailsAction } from "@/features/settings/actions"
import {
  areaColorOptions,
  areaIconLabels,
  areaIconOptions,
  type AreaColorOption,
  type AreaIconOption,
} from "@/features/settings/config"
import { NavigationIcon } from "@/features/navigation/navigation-icon"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/toast-provider"

export function AreaSettingsCard({
  area,
  canMoveUp,
  canMoveDown,
}: {
  area: {
    id: string
    name: string
    icon: string
    color: string
  }
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const [open, setOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<AreaIconOption>(area.icon as AreaIconOption)
  const [selectedColor, setSelectedColor] = useState<AreaColorOption>(area.color as AreaColorOption)
  const [pending, startTransition] = useTransition()
  const [state, formAction] = useActionState(
    updateAreaDetailsAction,
    initialUpdateAreaActionState
  )
  const nameRef = useRef<HTMLInputElement>(null)
  const { notify } = useToast()

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(() => nameRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const formData = new FormData()
      formData.set("areaId", area.id)
      formData.set("direction", direction)
      const result = await moveAreaAction(formData)
      notify({ message: result.message, tone: result.status === "success" ? "success" : "error" })
    })
  }

  return (
    <section className="surface-2 rounded-[24px] border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-[16px] border border-white/[0.08]"
              style={{ backgroundColor: `${area.color}18`, color: area.color }}
            >
              <NavigationIcon iconKey={area.icon} className="size-4" />
            </div>
            <div>
              <p className="content-title">{area.name}</p>
              <p className="context-line">Ícono y color visibles para navegación y contexto.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="ghost" size="sm" disabled={!canMoveUp || pending} onClick={() => move("up")}>
            <ArrowUp className="size-3.5" />
            Subir
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={!canMoveDown || pending} onClick={() => move("down")}>
            <ArrowDown className="size-3.5" />
            Bajar
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen((current) => !current)}>
            <PencilLine className="size-3.5" />
            {open ? "Cerrar" : "Editar"}
          </Button>
        </div>
      </div>

      {open ? (
        <form action={formAction} className="mt-4 space-y-4 border-t border-white/[0.08] pt-4">
          <input type="hidden" name="areaId" value={area.id} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white" htmlFor={`area-name-${area.id}`}>Nombre</label>
            <input
              ref={nameRef}
              id={`area-name-${area.id}`}
              name="name"
              defaultValue={area.name}
              className={cn("field-base h-11 w-full rounded-2xl px-4 text-sm", state.fieldErrors?.name ? "border-destructive/50" : "border-white/8")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-white">Ícono</label>
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-muted-foreground">
                  <NavigationIcon iconKey={selectedIcon} className="size-3.5 text-white" />
                  {areaIconLabels[selectedIcon]}
                </div>
              </div>
              <input type="hidden" name="icon" value={selectedIcon} />
              <div className="grid grid-cols-4 gap-2">
                {areaIconOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedIcon(option)}
                    className={cn(
                      "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-[18px] border transition",
                      selectedIcon === option
                        ? "border-primary/30 bg-primary/10 text-white"
                        : "border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white"
                    )}
                    aria-pressed={selectedIcon === option}
                    title={areaIconLabels[option]}
                  >
                    <NavigationIcon iconKey={option} className="size-4" />
                    <span className="text-[10px] leading-none">{areaIconLabels[option]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-white">Color</label>
                <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 text-xs text-muted-foreground">
                  <span
                    className="size-3 rounded-full border border-white/10"
                    style={{ backgroundColor: selectedColor }}
                  />
                  Color actual
                </div>
              </div>
              <input type="hidden" name="color" value={selectedColor} />
              <div className="flex flex-wrap gap-2">
                {areaColorOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedColor(option)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-full border transition",
                      selectedColor === option
                        ? "border-white bg-white/[0.06]"
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                    )}
                    aria-label={`Elegir color ${option}`}
                    aria-pressed={selectedColor === option}
                  >
                    <span
                      className={cn(
                        "size-6 rounded-full border border-white/10",
                        selectedColor === option && "ring-2 ring-white/40 ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: option }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-h-10 space-y-1" aria-live="polite">
              {state.fieldErrors?.name?.[0] ? (
                <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
              ) : state.message ? (
                <p className={cn("text-sm", state.status === "success" ? "text-primary/90" : "text-muted-foreground")}>
                  {state.message}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  El nombre no cambia la ruta, solo la metadata visible.
                </p>
              )}
            </div>
            <Button type="submit">Guardar área</Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
