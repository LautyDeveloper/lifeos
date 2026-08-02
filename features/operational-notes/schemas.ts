import { z } from "zod"

const noteTitleSchema = z
  .string()
  .trim()
  .min(1, "Escribí un título para la nota.")
  .max(180, "El título puede tener hasta 180 caracteres.")

const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Sumá algo de contexto antes de guardar.")
  .max(8000, "La nota puede tener hasta 8000 caracteres.")

export const createContainerNoteSchema = z.object({
  containerId: z.string().uuid("Container inválido."),
  title: noteTitleSchema,
  content: noteContentSchema,
})

export const createProjectNoteSchema = z.object({
  projectId: z.string().uuid("Proyecto inválido."),
  title: noteTitleSchema,
  content: noteContentSchema,
})

export const createTaskNoteSchema = z.object({
  taskId: z.string().uuid("Tarea inválida."),
  title: noteTitleSchema,
  content: noteContentSchema,
})

export const updateOperationalNoteSchema = z.object({
  id: z.string().uuid("Nota inválida."),
  title: noteTitleSchema,
  content: noteContentSchema,
})

const operationalNoteIdSchema = z.object({
  id: z.string().uuid("Nota inválida."),
})

export const archiveOperationalNoteSchema = operationalNoteIdSchema
export const restoreOperationalNoteSchema = operationalNoteIdSchema
export const deleteOperationalNoteSchema = operationalNoteIdSchema

export type CreateContainerNoteInput = z.infer<typeof createContainerNoteSchema>
export type CreateProjectNoteInput = z.infer<typeof createProjectNoteSchema>
export type CreateTaskNoteInput = z.infer<typeof createTaskNoteSchema>
export type UpdateOperationalNoteInput = z.infer<typeof updateOperationalNoteSchema>
export type ArchiveOperationalNoteInput = z.infer<typeof archiveOperationalNoteSchema>
export type RestoreOperationalNoteInput = z.infer<typeof restoreOperationalNoteSchema>
export type DeleteOperationalNoteInput = z.infer<typeof deleteOperationalNoteSchema>
