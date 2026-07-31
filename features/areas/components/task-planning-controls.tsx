"use client"

import { useState, useTransition } from "react"
import { CalendarDays, LoaderCircle, X } from "lucide-react"

import {
  clearTaskPlannedDateAction,
  planTaskForTodayAction,
  planTaskForTomorrowAction,
  setTaskPlannedDateAction,
} from "@/features/areas/actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-provider"
import {
  formatDateInputValue,
  formatPlanningDateLabel,
  getDateDaysFromNow,
  isDateToday,
  isDateTomorrow,
  parseDateInput,
} from "@/lib/dates"
import { cn } from "@/lib/utils"

export function TaskPlanningControls({
  taskId,
  path,
  plannedDate,
}: {
  taskId: string
  path: string
  plannedDate: Date | null
}) {
  const [currentPlannedDate, setCurrentPlannedDate] = useState<Date | null>(plannedDate)
  const [dateInputValue, setDateInputValue] = useState(formatDateInputValue(plannedDate))
  const [feedback, setFeedback] = useState("")
  const [pending, startTransition] = useTransition()
  const { notify } = useToast()

  const syncPlanning = (
    updater: () => Promise<{ status: "success" | "error"; message: string }>,
    optimisticDate: Date | null,
    optimisticInput = formatDateInputValue(optimisticDate)
  ) => {
    const previousDate = currentPlannedDate
    const previousInput = dateInputValue

    setCurrentPlannedDate(optimisticDate)
    setDateInputValue(optimisticInput)
    setFeedback(
      optimisticDate
        ? `Planificada para ${formatPlanningDateLabel(optimisticDate).toLowerCase()}.`
        : "La tarea volvió a quedar sin fecha."
    )

    startTransition(async () => {
      const result = await updater()

      if (result.status === "error") {
        setCurrentPlannedDate(previousDate)
        setDateInputValue(previousInput)
        setFeedback("")
        notify({ message: result.message, tone: "error" })
      }
    })
  }

  const plannedForToday = isDateToday(currentPlannedDate)
  const plannedForTomorrow = isDateTomorrow(currentPlannedDate)

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {currentPlannedDate ? (
          <span className="inline-flex min-h-8 items-center rounded-full border border-primary/14 bg-primary/8 px-3 text-[11px] font-medium text-primary/90">
            {formatPlanningDateLabel(currentPlannedDate)}
          </span>
        ) : null}

        {!plannedForToday ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              syncPlanning(async () => {
                const data = new FormData()
                data.set("taskId", taskId)
                data.set("path", path)
                return planTaskForTodayAction(data)
              }, getDateDaysFromNow(0))
            }
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-medium text-muted-foreground transition hover:border-white/[0.1] hover:text-white"
          >
            {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CalendarDays className="size-3.5" />}
            Hoy
          </button>
        ) : null}

        {!plannedForTomorrow ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              syncPlanning(async () => {
                const data = new FormData()
                data.set("taskId", taskId)
                data.set("path", path)
                return planTaskForTomorrowAction(data)
              }, getDateDaysFromNow(1))
            }
            className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-medium text-muted-foreground transition hover:border-white/[0.1] hover:text-white"
          >
            {pending ? <LoaderCircle className="size-3.5 animate-spin" /> : <CalendarDays className="size-3.5" />}
            Mañana
          </button>
        ) : null}

        <label className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.015] px-3 text-[11px] font-medium text-muted-foreground transition hover:border-white/[0.1] hover:text-white">
          <CalendarDays className="size-3.5" />
          <span>Otra fecha</span>
          <input
            type="date"
            value={dateInputValue}
            disabled={pending}
            onChange={(event) => {
              const nextValue = event.target.value
              setDateInputValue(nextValue)

              if (!nextValue) {
                return
              }

              const optimisticDate = parseDateInput(nextValue)

              if (!optimisticDate) {
                notify({ message: "Elegí una fecha válida.", tone: "error" })
                return
              }

              syncPlanning(async () => {
                const data = new FormData()
                data.set("taskId", taskId)
                data.set("plannedDate", nextValue)
                data.set("path", path)
                return setTaskPlannedDateAction(data)
              }, optimisticDate, nextValue)
            }}
            className="w-32 bg-transparent text-xs text-white outline-none [color-scheme:dark]"
          />
        </label>

        {currentPlannedDate ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={pending}
            className={cn("min-h-8 rounded-full px-3 text-[11px] text-muted-foreground hover:bg-white/[0.03] hover:text-white")}
            onClick={() =>
              syncPlanning(async () => {
                const data = new FormData()
                data.set("taskId", taskId)
                data.set("path", path)
                return clearTaskPlannedDateAction(data)
              }, null, "")
            }
          >
            <X className="size-3.5" />
            Quitar
          </Button>
        ) : null}
      </div>

      <p className="min-h-5 text-[11px] text-muted-foreground" aria-live="polite">
        {pending ? "Actualizando planificación..." : feedback}
      </p>
    </div>
  )
}
