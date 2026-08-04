import { z } from "zod"

export const createInboxItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Capturá algo antes de guardarlo.")
    .max(500, "Mantenelo corto. Hasta 500 caracteres alcanza para capturar."),
})

export type CreateInboxItemInput = z.infer<typeof createInboxItemSchema>

export const suggestInboxProcessingInputSchema = createInboxItemSchema
export type SuggestInboxProcessingInput = z.infer<typeof suggestInboxProcessingInputSchema>

const inboxEntityTitle = z
  .string()
  .trim()
  .min(1, "Poné un título antes de procesar.")
  .max(180, "El título no puede superar los 180 caracteres.")

export const processInboxToProjectSchema = z.object({
  inboxItemId: z.string().uuid("Inbox item inválido."),
  title: inboxEntityTitle,
  containerId: z.string().uuid("Elegí un container para crear el proyecto."),
  description: z
    .string()
    .trim()
    .max(2000, "La descripción no puede superar los 2000 caracteres.")
    .optional()
    .transform((value) => value || undefined),
})

export const processInboxToTaskSchema = z.object({
  inboxItemId: z.string().uuid("Inbox item inválido."),
  title: inboxEntityTitle,
  projectId: z.string().uuid("Elegí un proyecto para crear la tarea."),
})

export const processInboxToNoteSchema = z.object({
  inboxItemId: z.string().uuid("Inbox item inválido."),
  title: inboxEntityTitle,
  content: z
    .string()
    .trim()
    .min(1, "La nota no puede estar vacía.")
    .max(8000, "La nota no puede superar los 8000 caracteres."),
})

export type ProcessInboxToProjectInput = z.infer<typeof processInboxToProjectSchema>
export type ProcessInboxToTaskInput = z.infer<typeof processInboxToTaskSchema>
export type ProcessInboxToNoteInput = z.infer<typeof processInboxToNoteSchema>

export const processInboxTargetSchema = z.enum(["project", "task", "note"])
export type ProcessInboxTarget = z.infer<typeof processInboxTargetSchema>
