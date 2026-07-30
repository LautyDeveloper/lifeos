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

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type ToggleTaskCompletionInput = z.infer<typeof toggleTaskCompletionSchema>
export type PlanTaskForTodayInput = z.infer<typeof planTaskForTodaySchema>
