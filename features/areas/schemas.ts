import { z } from "zod"

export const createTaskSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  title: z
    .string()
    .trim()
    .min(1, "Escribí una tarea antes de guardarla.")
    .max(180, "La tarea no puede superar los 180 caracteres."),
})

export const toggleTaskCompletionSchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
  completed: z.enum(["true", "false"]).transform((value) => value === "true"),
})

export const planTaskForTodaySchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
})

export const planTaskForTomorrowSchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
})

export const setTaskPlannedDateSchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
  plannedDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Elegí una fecha válida."),
})

export const clearTaskPlannedDateSchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
})

export const pauseProjectSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
})

export const resumeProjectSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type ToggleTaskCompletionInput = z.infer<typeof toggleTaskCompletionSchema>
export type PlanTaskForTodayInput = z.infer<typeof planTaskForTodaySchema>
export type PlanTaskForTomorrowInput = z.infer<typeof planTaskForTomorrowSchema>
export type SetTaskPlannedDateInput = z.infer<typeof setTaskPlannedDateSchema>
export type ClearTaskPlannedDateInput = z.infer<typeof clearTaskPlannedDateSchema>
export type PauseProjectInput = z.infer<typeof pauseProjectSchema>
export type ResumeProjectInput = z.infer<typeof resumeProjectSchema>
