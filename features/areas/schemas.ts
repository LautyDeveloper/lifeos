import { z } from "zod"

import { priorityValues, projectStatusValues } from "@/types/domain"

export const createTaskSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  title: z
    .string()
    .trim()
    .min(1, "Escribí una tarea antes de guardarla.")
    .max(180, "La tarea no puede superar los 180 caracteres."),
})

export const createProjectSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
  title: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para el proyecto.")
    .max(180, "El proyecto no puede superar los 180 caracteres."),
})

export const updateProjectDetailsSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  title: z
    .string()
    .trim()
    .min(1, "Escribí un nombre para el proyecto.")
    .max(180, "El proyecto no puede superar los 180 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "La descripción no puede superar los 2000 caracteres.")
    .optional(),
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

export const updateProjectStatusSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  status: z.enum(projectStatusValues, "Elegí un estado válido."),
})

export const updateProjectPrioritySchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  priority: z.enum(priorityValues, "Elegí una prioridad válida."),
})

export const updateTaskPrioritySchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
  priority: z.enum(priorityValues, "Elegí una prioridad válida."),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectDetailsInput = z.infer<typeof updateProjectDetailsSchema>
export type ToggleTaskCompletionInput = z.infer<typeof toggleTaskCompletionSchema>
export type PlanTaskForTodayInput = z.infer<typeof planTaskForTodaySchema>
export type PlanTaskForTomorrowInput = z.infer<typeof planTaskForTomorrowSchema>
export type SetTaskPlannedDateInput = z.infer<typeof setTaskPlannedDateSchema>
export type ClearTaskPlannedDateInput = z.infer<typeof clearTaskPlannedDateSchema>
export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>
export type UpdateProjectPriorityInput = z.infer<typeof updateProjectPrioritySchema>
export type UpdateTaskPriorityInput = z.infer<typeof updateTaskPrioritySchema>
